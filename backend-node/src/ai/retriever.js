/**
 * ai/retriever.js
 * TF-IDF semantic and keyword retriever for statutory schemes and FAQ documents.
 * Pure Node.js implementation: fast, zero Python/C++ dependencies, deterministic.
 */

// Enable strict mode in JavaScript for secure variable scoping and catching runtime bugs
'use strict';

// Import Node.js filesystem module for synchronous file and directory operations
const fs = require('fs');

// Import Node.js path module for resolving cross-platform filesystem paths
const path = require('path');

// Import Scheme model from MongoDB models
const Scheme = require('../models/Scheme');

// Resolve the directory path containing static government FAQ and guidelines JSON files
const DATA_DOCS_DIR = path.resolve(__dirname, '../../../data/documents');

// Set of common English stopwords to filter out meaningless linguistic filler words
const STOP_WORDS = new Set([
  'a','an','the','and','or','of','to','in','for','on','at','by','from','with',
  'is','are','was','were','be','been','being','have','has','had','do','does','did',
  'will','would','could','should','may','might','shall','can','up','as','its',
  'that','this','these','those','it','he','she','they','we','i','you','about',
  'into','through','during','before','after','above','below','under','again',
  'further','then','once','here','there','when','where','why','how','all','any'
]);

/**
 * Tokenize string into lowercase alphanumeric tokens without stopwords.
 *
 * @param {string} text - Raw input text
 * @returns {Array<string>} - Array of meaningful tokens
 */
function tokenize(text) {
  // Return processed array of tokens
  return (text || '')
    // Convert all characters to lowercase
    .toLowerCase()
    // Replace non-alphanumeric characters (except currency/percent symbols) with spaces
    .replace(/[^a-z0-9₹%\s]/g, ' ')
    // Split text into tokens by one or more whitespace characters
    .split(/\s+/)
    // Filter out very short tokens (<= 2 characters) and common stopwords
    .filter(t => t.length > 2 && !STOP_WORDS.has(t));
}

// Global in-memory cache to store loaded documents across requests
let cachedDocs = null;

/**
 * Load documents from both the data/documents JSON files and the schemes DB table.
 *
 * @returns {Array<Object>} - Combined array of all statutory knowledge base documents
 */
function loadAllDocuments(customSchemes = null) {
  // Initialize accumulator array for all documents
  const documents = [];

  // Step 1: Check if static data/documents directory exists
  if (fs.existsSync(DATA_DOCS_DIR)) {
    // Wrap in try-catch to handle directory read permissions
    try {
      // Read all filenames in the directory that have a .json extension
      const files = fs.readdirSync(DATA_DOCS_DIR).filter(f => f.endsWith('.json'));
      // Iterate over each JSON document file
      for (const file of files) {
        // Wrap file reading in try-catch to isolate errors per file
        try {
          // Read and parse the JSON file contents
          const content = JSON.parse(fs.readFileSync(path.join(DATA_DOCS_DIR, file), 'utf8'));
          // If content contains an array of documents, append them
          if (Array.isArray(content.documents)) {
            // Push all documents into the documents collection
            documents.push(...content.documents);
          }
        } catch (e) {
          // Warn if a single file failed to parse
          console.warn(`Failed to parse document ${file}:`, e.message);
        }
      }
    } catch (err) {
      // Warn if directory reading encountered an error
      console.warn('Error reading data/documents directory:', err.message);
    }
  }

  // Step 2: Append custom schemes if provided
  if (Array.isArray(customSchemes)) {
    for (const s of customSchemes) {
      documents.push({
        title: s.name,
        scheme_code: s.code,
        text: `${s.name} by ${s.provider}. ${s.description} Target category: ${s.beneficiary_category}. Max loan: ₹${s.max_loan_amount}. Interest rate: ${s.beneficiary_interest_rate}%. Eligibility: ${(s.eligibility_rules || []).join('; ')}. Purposes: ${(s.purposes || []).join(', ')}.`,
        source_url: s.source_url
      });
    }
  }

  // Cache loaded documents in memory
  cachedDocs = documents;
  // Return the combined list of documents
  return documents;
}

/**
 * Build or refresh the in-memory search index.
 *
 * @returns {Object} - Index metadata containing documents and total count
 */
function buildIndex(customSchemes = null) {
  // Load and cache all documents from disk and database
  const docs = loadAllDocuments(customSchemes);
  // Return document array and total count
  return { documents: docs, count: docs.length };
}

/**
 * Semantic and keyword TF-IDF search over indexed statutory documents.
 *
 * @param {string} query - Search query text
 * @param {number} topK - Maximum number of results to return (default 5)
 * @returns {Array<Object>} - Ranked search results with similarity scores
 */
function search(query, topK = 5) {
  // Retrieve cached documents, or load them if not already cached
  const docs = cachedDocs || loadAllDocuments();
  // Return empty array if no documents exist in knowledge base
  if (!docs.length) return [];

  // Tokenize the query string into meaningful tokens
  const queryTokens = tokenize(query);
  // If query contained no valid tokens, return topK documents with 0 similarity
  if (!queryTokens.length) {
    // Map first topK documents with zero similarity score
    return docs.slice(0, topK).map(d => ({ ...d, similarity: 0.0 }));
  }

  // Extract unique vocabulary tokens from the query
  const vocab = [...new Set(queryTokens)];
  // Tokenize every document in the corpus into an array of token lists
  const docTokensList = docs.map(d => tokenize(`${d.title} ${d.text} ${d.scheme_code || ''}`));
  // Total number of documents in corpus (N)
  const N = docs.length;

  // Compute Document Frequency (DF) for each query vocabulary term
  const df = {};
  // Loop over each term in vocabulary
  for (const term of vocab) {
    // Initialize document frequency count to 0
    df[term] = 0;
    // Iterate over all tokenized documents
    for (const tokens of docTokensList) {
      // If term appears in this document, increment document frequency count
      if (tokens.includes(term)) df[term]++;
    }
  }

  // Compute TF-IDF score for each document in the corpus
  const scored = docs.map((doc, idx) => {
    // Get tokens for the current document
    const tokens = docTokensList[idx];
    // Document length in tokens (minimum 1 to avoid division by zero)
    const docLen = tokens.length || 1;
    // Term Frequency (TF) dictionary for this document
    const tf = {};
    // Count occurrences of each token in document
    for (const t of tokens) tf[t] = (tf[t] || 0) + 1;

    // Initialize raw TF-IDF score to 0
    let rawScore = 0.0;
    // Sum TF-IDF weights across all vocabulary terms
    for (const term of vocab) {
      // Normalized Term Frequency: frequency divided by document length
      const termTf = (tf[term] || 0) / docLen;
      // Inverse Document Frequency with smoothing: log((N + 1) / (df + 1)) + 1
      const idf = Math.log((N + 1) / ((df[term] || 0) + 1)) + 1;
      // Add term TF-IDF product to raw document score
      rawScore += termTf * idf;
    }

    // Return scored document object
    return {
      title: doc.title,
      scheme_code: doc.scheme_code,
      text: doc.text,
      source_url: doc.source_url,
      similarity: rawScore
    };
  });

  // Find the maximum similarity score across all documents for min-max normalization
  const maxScore = Math.max(...scored.map(s => s.similarity), 1e-10);
  // Normalize all scores to a scale between 0.0 and 1.0
  for (const item of scored) {
    // Divide score by maxScore and format to 4 decimal places
    item.similarity = parseFloat((item.similarity / maxScore).toFixed(4));
  }

  // Sort documents by similarity score descending, and slice the top-K results
  return scored
    // Sort descending by similarity
    .sort((a, b) => b.similarity - a.similarity)
    // Slice top-K items
    .slice(0, topK);
}

/**
 * Retrieve top-k scheme context snippets specifically formatted for the RAG assistant prompt.
 *
 * @param {string} question - Beneficiary question
 * @param {number} topK - Number of snippets to retrieve
 * @returns {Array<Object>} - Formatted evidence objects
 */
function retrieve(question, topK = 5) {
  // Execute TF-IDF search for the question
  const searchResults = search(question, topK);

  // Map search results into evidence objects with title, scheme code, score, and snippet
  return searchResults.map(res => ({
    scheme_code: res.scheme_code || 'SCHEME',
    scheme_name: res.title,
    score: res.similarity,
    source_url: res.source_url,
    snippet: res.text
  }));
}

/**
 * Computes normalized per-scheme semantic relevance scores for the hybrid 70/30 matching engine.
 *
 * @param {string} query - Applicant business description and sector
 * @param {Array<Object>} schemes - Array of statutory scheme objects from SQLite
 * @returns {Object} - Key-value map of { [scheme_code]: normalized_score }
 */
function schemeSemanticScores(query, schemes) {
  // Return empty map if schemes list is invalid
  if (!schemes || !schemes.length) return {};
  // Tokenize the applicant's business query
  const queryTokens = tokenize(query);
  // If query contains no tokens, return 0.0 score for all schemes
  if (!queryTokens.length) {
    const res = {};
    for (const s of schemes) res[s.code] = 0.0;
    return res;
  }

  // Extract unique vocabulary from query
  const vocab = [...new Set(queryTokens)];
  // Tokenize each statutory scheme across name, description, provider, category, purposes, rules
  const docTokensList = schemes.map(s =>
    tokenize(`${s.name} ${s.description} ${s.provider} ${s.beneficiary_category} ${(s.purposes || []).join(' ')} ${(s.eligibility_rules || []).join(' ')}`)
  );
  // Total schemes count
  const N = schemes.length;

  // Compute document frequencies for vocabulary terms across schemes
  const df = {};
  for (const term of vocab) {
    df[term] = 0;
    for (const tokens of docTokensList) {
      if (tokens.includes(term)) df[term]++;
    }
  }

  // Calculate raw TF-IDF score for each statutory scheme
  const scores = schemes.map((scheme, idx) => {
    const tokens = docTokensList[idx];
    const docLen = tokens.length || 1;
    const tf = {};
    for (const t of tokens) tf[t] = (tf[t] || 0) + 1;

    let rawScore = 0.0;
    for (const term of vocab) {
      const termTf = (tf[term] || 0) / docLen;
      const idf = Math.log((N + 1) / ((df[term] || 0) + 1)) + 1;
      rawScore += termTf * idf;
    }
    return { code: scheme.code, score: rawScore };
  });

  // Find maximum score for normalization
  const maxScore = Math.max(...scores.map(s => s.score), 1e-10);
  // Assemble score map { [scheme.code]: normalizedScore }
  const scoreMap = {};
  for (const s of scores) {
    scoreMap[s.code] = parseFloat((s.score / maxScore).toFixed(4));
  }
  // Return normalized semantic score map
  return scoreMap;
}

// Export functions for indexing, search, RAG retrieval, and hybrid scoring
module.exports = {
  buildIndex,
  search,
  retrieve,
  schemeSemanticScores
};
