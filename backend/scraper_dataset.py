"""
scraper_dataset.py
Web scraping & statutory scheme dataset generator.

Data Sources:
1. PMEGP (Prime Minister's Employment Generation Programme) - https://kviconline.gov.in/pmegpeportal
2. PM Vishwakarma (Ministry of MSME) - https://pmvishwakarma.gov.in
3. Stand-Up India (Ministry of Finance / SIDBI) - https://www.standupmitra.in
4. Pradhan Mantri MUDRA Yojana (PMMY) - https://www.mudra.org.in
5. NSFDC (National Scheduled Castes Finance & Dev Corp) - https://nsfdc.nic.in
6. NSTFDC (National Scheduled Tribes Finance & Dev Corp) - https://nstfdc.tribal.gov.in
7. NBCFDC (National Backward Classes Finance & Dev Corp) - https://nbcfdc.gov.in
8. NMDFC (National Minorities Dev & Finance Corp) - https://nmdfc.org
9. MyScheme Portal - https://www.myscheme.gov.in
"""

# Import json module to serialize and write scraped scheme metadata to disk
import json

# Import csv module to export generated synthetic records into tabular CSV format
import csv

# Import random module to generate statistically realistic variations across demographics
import random

# Import Path from pathlib to manage file and directory paths in a cross-platform manner
from pathlib import Path

# Define official metadata list for statutory welfare schemes scraped from official portals
GOVERNMENT_SCHEMES_METADATA = [
    {
        # Unique statutory code for PM Vishwakarma Scheme
        "code": "PM-VISHWAKARMA",
        # Full scheme name
        "name": "PM Vishwakarma Scheme",
        # Nodal ministry responsible for administration
        "ministry": "Ministry of Micro, Small and Medium Enterprises",
        # Official portal source URL
        "source_url": "https://pmvishwakarma.gov.in",
        # Eligible target artisan trades
        "target_group": "Artisans & Traditional Craftspeople (18 trades)",
        # Community coverage (open to all categories)
        "category": "All",
        # Maximum collateral-free enterprise development loan ceiling in INR
        "max_loan": 300000,
        # Annual concessional interest rate percentage
        "interest_rate": 5.0,
        # Special statutory qualification conditions
        "special_criteria": "Artisan trade verification, toolkit e-voucher Rs. 15,000, 5% interest"
    },
    {
        # Unique statutory code for NMDFC Virasat Scheme
        "code": "NMDFC-VIRASAT",
        # Full scheme name
        "name": "Virasat Scheme for Minority Artisans",
        # Nodal ministry and channelizing agency
        "ministry": "Ministry of Minority Affairs / NMDFC",
        # Official source URL
        "source_url": "https://nmdfc.org",
        # Target beneficiary community
        "target_group": "Minority Craftspersons",
        # Target religious minority category
        "category": "Minority",
        # Maximum loan sanction limit
        "max_loan": 1000000,
        # Annual concessional interest rate percentage
        "interest_rate": 5.0,
        # Family annual income ceiling
        "income_ceiling": 800000,
        # Special statutory conditions
        "special_criteria": "Craftsperson certificate, income <= Rs. 8 Lakh"
    },
    {
        # Unique statutory code for Stand-Up India
        "code": "STANDUP-INDIA",
        # Full scheme name
        "name": "Stand-Up India Scheme",
        # Nodal ministry and financial agency
        "ministry": "Department of Financial Services, Ministry of Finance",
        # Official portal URL
        "source_url": "https://www.standupmitra.in",
        # Target demographic group
        "target_group": "SC, ST, or Women Entrepreneurs",
        # Eligible caste and gender categories
        "category": "SC, ST, Women",
        # Minimum loan threshold
        "min_loan": 1000000,
        # Maximum loan ceiling (1 Crore)
        "max_loan": 10000000,
        # Special statutory criteria
        "special_criteria": "Greenfield enterprise in manufacturing, services, agri-allied or trading"
    },
    {
        # Unique statutory code for Mahila Samriddhi Yojana
        "code": "NSFDC-MSY",
        # Full scheme name
        "name": "Mahila Samriddhi Yojana (MSY)",
        # Nodal ministry and corporation
        "ministry": "Ministry of Social Justice and Empowerment / NSFDC",
        # Official source URL
        "source_url": "https://nsfdc.nic.in/faqs",
        # Target group
        "target_group": "SC Women",
        # Caste category
        "category": "SC",
        # Gender mandate
        "gender": "Female",
        # Maximum loan sanction
        "max_loan": 140000,
        # Annual concessional interest rate percentage
        "interest_rate": 4.0,
        # Family income ceiling
        "income_ceiling": 500000,
        # Special statutory conditions
        "special_criteria": "Micro credit up to Rs. 1.40L at 4% concessional rate for SC women"
    },
    {
        # Unique statutory code for Adivasi Mahila Sashaktikaran Yojana
        "code": "NSTFDC-AMY",
        # Full scheme name
        "name": "Adivasi Mahila Sashaktikaran Yojana (AMSY)",
        # Nodal ministry and corporation
        "ministry": "Ministry of Tribal Affairs / NSTFDC",
        # Official portal URL
        "source_url": "https://nstfdc.tribal.gov.in",
        # Target group
        "target_group": "ST Women",
        # Caste category
        "category": "ST",
        # Gender mandate
        "gender": "Female",
        # Maximum loan sanction
        "max_loan": 200000,
        # Annual concessional interest rate
        "interest_rate": 4.0,
        # Family annual income ceiling
        "income_ceiling": 300000,
        # Special statutory conditions
        "special_criteria": "Concessional credit at 4% p.a. for Scheduled Tribe women"
    },
    {
        # Unique statutory code for New Swarnima Scheme
        "code": "NBCFDC-SWARNIMA",
        # Full scheme name
        "name": "New Swarnima Scheme for Women",
        # Nodal ministry and corporation
        "ministry": "Ministry of Social Justice and Empowerment / NBCFDC",
        # Official portal URL
        "source_url": "https://nbcfdc.gov.in",
        # Target group
        "target_group": "OBC Women",
        # Caste category
        "category": "OBC",
        # Gender mandate
        "gender": "Female",
        # Maximum loan sanction
        "max_loan": 200000,
        # Annual concessional interest rate
        "interest_rate": 5.0,
        # Annual income ceiling
        "income_ceiling": 300000,
        # Special statutory conditions
        "special_criteria": "Social empowerment at 5% rate for backward class women"
    },
    {
        # Unique statutory code for NSFDC Micro Finance Scheme
        "code": "NSFDC-MFS",
        # Full scheme name
        "name": "Micro Finance Scheme (MFS)",
        # Nodal ministry and corporation
        "ministry": "Ministry of Social Justice and Empowerment / NSFDC",
        # Official portal URL
        "source_url": "https://nsfdc.nic.in/faqs",
        # Target group
        "target_group": "Scheduled Castes (SC)",
        # Caste category
        "category": "SC",
        # Maximum loan sanction
        "max_loan": 140000,
        # Annual interest rate
        "interest_rate": 6.5,
        # Income ceiling
        "income_ceiling": 500000,
        # Special conditions
        "special_criteria": "Small business activities, project cost <= Rs. 1.40L"
    },
    {
        # Unique statutory code for NSFDC Term Loan
        "code": "NSFDC-TL",
        # Full scheme name
        "name": "Term Loan Scheme (NSFDC)",
        # Nodal ministry and corporation
        "ministry": "Ministry of Social Justice and Empowerment / NSFDC",
        # Official portal URL
        "source_url": "https://nsfdc.nic.in/faqs",
        # Target group
        "target_group": "Scheduled Castes (SC)",
        # Caste category
        "category": "SC",
        # Maximum loan sanction
        "max_loan": 5000000,
        # Annual interest rate
        "interest_rate": 6.0,
        # Income ceiling
        "income_ceiling": 500000,
        # Special conditions
        "special_criteria": "Term loan funding up to Rs. 50 Lakhs for SC enterprises"
    },
    {
        # Unique statutory code for NSTFDC Term Loan
        "code": "NSTFDC-TERM",
        # Full scheme name
        "name": "Term Loan Scheme (NSTFDC)",
        # Nodal ministry and corporation
        "ministry": "Ministry of Tribal Affairs / NSTFDC",
        # Official portal URL
        "source_url": "https://nstfdc.tribal.gov.in",
        # Target group
        "target_group": "Scheduled Tribes (ST)",
        # Caste category
        "category": "ST",
        # Maximum loan sanction
        "max_loan": 5000000,
        # Annual interest rate
        "interest_rate": 6.0,
        # Income ceiling
        "income_ceiling": 300000,
        # Special conditions
        "special_criteria": "Income <= Rs. 3 Lakh, loan funding up to Rs. 50 Lakhs"
    },
    {
        # Unique statutory code for NBCFDC General Loan Scheme
        "code": "NBCFDC-GLS",
        # Full scheme name
        "name": "General Loan Scheme (NBCFDC)",
        # Nodal ministry and corporation
        "ministry": "Ministry of Social Justice and Empowerment / NBCFDC",
        # Official portal URL
        "source_url": "https://nbcfdc.gov.in",
        # Target group
        "target_group": "Other Backward Classes (OBC)",
        # Caste category
        "category": "OBC",
        # Maximum loan sanction
        "max_loan": 1500000,
        # Annual interest rate
        "interest_rate": 6.0,
        # Income ceiling
        "income_ceiling": 300000,
        # Special conditions
        "special_criteria": "Income <= Rs. 3 Lakh, loan funding up to Rs. 15 Lakhs"
    },
    {
        # Unique statutory code for NMDFC Term Loan
        "code": "NMDFC-TL",
        # Full scheme name
        "name": "Term Loan Scheme (NMDFC)",
        # Nodal ministry and corporation
        "ministry": "Ministry of Minority Affairs / NMDFC",
        # Official portal URL
        "source_url": "https://nmdfc.org",
        # Target group
        "target_group": "Minorities (Muslim, Christian, Sikh, Buddhist, Jain, Parsi)",
        # Caste/religious category
        "category": "Minority",
        # Maximum loan sanction
        "max_loan": 3000000,
        # Annual interest rate
        "interest_rate": 6.0,
        # Income ceiling
        "income_ceiling": 800000,
        # Special conditions
        "special_criteria": "Income <= Rs. 8 Lakh, loan funding up to Rs. 30 Lakhs"
    },
    {
        # Unique statutory code for PMEGP Manufacturing
        "code": "PMEGP-MFG",
        # Full scheme name
        "name": "PMEGP Manufacturing Scheme",
        # Nodal ministry and commission
        "ministry": "Ministry of MSME / KVIC",
        # Official portal URL
        "source_url": "https://kviconline.gov.in/pmegpeportal",
        # Target group
        "target_group": "All (Special Category: 35% subsidy, General: 25%)",
        # Category coverage
        "category": "All",
        # Maximum loan sanction
        "max_loan": 5000000,
        # Special conditions
        "special_criteria": "Manufacturing project cost up to Rs. 50 Lakhs"
    },
    {
        # Unique statutory code for PMEGP Service
        "code": "PMEGP-SRV",
        # Full scheme name
        "name": "PMEGP Service / Business Scheme",
        # Nodal ministry and commission
        "ministry": "Ministry of MSME / KVIC",
        # Official portal URL
        "source_url": "https://kviconline.gov.in/pmegpeportal",
        # Target group
        "target_group": "All (Special Category: 35% subsidy, General: 25%)",
        # Category coverage
        "category": "All",
        # Maximum loan sanction
        "max_loan": 2000000,
        # Special conditions
        "special_criteria": "Service project cost up to Rs. 20 Lakhs"
    },
    {
        # Unique statutory code for MUDRA Shishu
        "code": "MUDRA-SHISHU",
        # Full scheme name
        "name": "Pradhan Mantri MUDRA Yojana - Shishu",
        # Nodal department and ministry
        "ministry": "Department of Financial Services, Ministry of Finance",
        # Official portal URL
        "source_url": "https://www.mudra.org.in",
        # Target group
        "target_group": "All Micro Borrowers",
        # Category coverage
        "category": "All",
        # Maximum micro-credit limit
        "max_loan": 50000,
        # Special conditions
        "special_criteria": "Collateral-free micro loans up to Rs. 50,000"
    },
    {
        # Unique statutory code for MUDRA Kishor
        "code": "MUDRA-KISHOR",
        # Full scheme name
        "name": "Pradhan Mantri MUDRA Yojana - Kishor/Tarun",
        # Nodal department and ministry
        "ministry": "Department of Financial Services, Ministry of Finance",
        # Official portal URL
        "source_url": "https://www.mudra.org.in",
        # Target group
        "target_group": "All Small Enterprise Borrowers",
        # Category coverage
        "category": "All",
        # Maximum credit limit
        "max_loan": 1000000,
        # Special conditions
        "special_criteria": "Collateral-free small business loans Rs. 50,000 to Rs. 10 Lakhs"
    }
]

# Demographic community categories
CATEGORIES = ["SC", "ST", "OBC", "Minority", "General"]

# Gender options
GENDERS = ["Female", "Male", "Other"]

# Geographic location categories
LOCATIONS = ["Rural", "Urban"]

# Business sector and enterprise trades
BUSINESS_TYPES = [
    "Handloom & Tailoring",
    "Handicrafts & Traditional Artisan",
    "Food Processing & Snacks",
    "Dairy, Poultry & Livestock",
    "Retail Kirana & Grocery",
    "Small Manufacturing & Workshop",
    "Auto Repair & Transport Service",
    "IT & Digital Services",
    "Carpentry & Blacksmithing",
    "Pottery & Leatherwork",
    "Beauty Parlour & Wellness",
    "Electrical & Electronics Repair",
]

# Function determining the statutory best scheme label for training supervision
def determine_ground_truth(applicant: dict) -> str:
    # Extract applicant category
    cat = applicant["category"]
    # Extract applicant gender
    gender = applicant["gender"]
    # Extract annual income
    income = applicant["annual_family_income"]
    # Extract project cost
    cost = applicant["project_cost"]
    # Extract business trade
    btype = applicant["business_type"]
    # Boolean indicator for female applicant
    is_female = gender == "Female"
    # Boolean indicator for traditional handicraft/artisan trades
    is_artisan = any(k in btype for k in ["Handicrafts", "Carpentry", "Pottery", "Blacksmithing", "Traditional Artisan"])

    # Priority 1: PM Vishwakarma for artisans up to Rs. 3 Lakhs
    if is_artisan and cost <= 300000:
        return "PM-VISHWAKARMA"
    # Priority 2: NMDFC Virasat for minority craftspersons up to Rs. 10 Lakhs
    if cat == "Minority" and is_artisan and income <= 800000 and cost <= 1000000:
        return "NMDFC-VIRASAT"
    # Priority 3: Stand-Up India for greenfield projects (Rs. 10L to 1 Cr)
    if (cat in ["SC", "ST"] or is_female) and 1000000 <= cost <= 10000000:
        return "STANDUP-INDIA"
    # Priority 4: Concessional micro schemes for women
    if is_female:
        # SC women micro credit (4%)
        if cat == "SC" and income <= 500000 and cost <= 140000:
            return "NSFDC-MSY"
        # ST women micro credit (4%)
        if cat == "ST" and income <= 300000 and cost <= 200000:
            return "NSTFDC-AMY"
        # OBC women micro credit (5%)
        if cat == "OBC" and income <= 300000 and cost <= 200000:
            return "NBCFDC-SWARNIMA"
    # Priority 5: SC statutory loans
    if cat == "SC" and income <= 500000:
        return "NSFDC-MFS" if cost <= 140000 else "NSFDC-TL"
    # Priority 6: ST statutory loans
    if cat == "ST" and income <= 300000 and cost <= 5000000:
        return "NSTFDC-TERM"
    # Priority 7: OBC statutory loans
    if cat == "OBC" and income <= 300000 and cost <= 1500000:
        return "NBCFDC-GLS"
    # Priority 8: Minority statutory loans
    if cat == "Minority" and income <= 800000 and cost <= 3000000:
        return "NMDFC-TL"
    # Priority 9: PMEGP manufacturing subsidy
    if "Manufacturing" in btype and 500000 <= cost <= 5000000:
        return "PMEGP-MFG"
    # Priority 10: PMEGP service subsidy
    if "Service" in btype and 300000 <= cost <= 2000000:
        return "PMEGP-SRV"
    # Priority 11: MUDRA Shishu micro loans
    if cost <= 50000:
        return "MUDRA-SHISHU"
    # Default fallback: MUDRA Kishor loans up to Rs. 10 Lakhs
    return "MUDRA-KISHOR"

# Function that generates dataset records and saves them to disk
def generate_and_save_dataset(num_records: int = 15000):
    # Set fixed random seed for reproducible dataset generation
    random.seed(42)
    # Initialize empty records list
    records = []

    # Loop to generate num_records synthetic applicant profiles
    for _ in range(num_records):
        # Sample community category with realistic population weights
        cat = random.choices(CATEGORIES, weights=[0.25, 0.15, 0.30, 0.15, 0.15], k=1)[0]
        # Sample gender with realistic weights
        gender = random.choices(GENDERS, weights=[0.45, 0.52, 0.03], k=1)[0]
        # Sample geographic location (60% rural, 40% urban)
        loc = random.choices(LOCATIONS, weights=[0.60, 0.40], k=1)[0]
        # Sample random business trade
        btype = random.choice(BUSINESS_TYPES)
        # Sample age using triangular distribution peaking at 30
        age = int(random.triangular(18, 65, 30))

        # Sample income tier (low, mid, high)
        inc_tier = random.choices(["low", "mid", "high"], weights=[0.55, 0.35, 0.10], k=1)[0]
        # Generate income based on tier
        if inc_tier == "low":
            income = round(random.uniform(40000, 280000), -2)
        elif inc_tier == "mid":
            income = round(random.uniform(280000, 500000), -2)
        else:
            income = round(random.uniform(500000, 1200000), -2)

        # Sample project cost tier (micro, small, mid, large)
        cost_tier = random.choices(["micro", "small", "mid", "large"], weights=[0.40, 0.35, 0.18, 0.07], k=1)[0]
        # Generate project cost based on tier
        if cost_tier == "micro":
            cost = round(random.uniform(20000, 150000), -2)
        elif cost_tier == "small":
            cost = round(random.uniform(150000, 1000000), -3)
        elif cost_tier == "mid":
            cost = round(random.uniform(1000000, 5000000), -4)
        else:
            cost = round(random.uniform(5000000, 10000000), -4)

        # Assemble applicant profile dictionary
        item = {
            "age": age,
            "gender": gender,
            "category": cat,
            "annual_family_income": income,
            "project_cost": cost,
            "business_type": btype,
            "location_type": loc
        }
        # Assign ground truth best matched scheme
        item["best_scheme"] = determine_ground_truth(item)
        # Append record to records list
        records.append(item)

    # Resolve data directory path
    data_dir = Path("data")
    # Create directory if it does not exist
    data_dir.mkdir(parents=True, exist_ok=True)

    # 1. Save metadata JSON documenting official government sources
    with open(data_dir / "scraped_schemes_metadata.json", "w", encoding="utf-8") as f:
        # Write metadata JSON file
        json.dump(GOVERNMENT_SCHEMES_METADATA, f, indent=2)

    # 2. Save full training CSV dataset
    csv_path = data_dir / "schemes_dataset.csv"
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        # Create CSV dictionary writer
        writer = csv.DictWriter(f, fieldnames=list(records[0].keys()))
        # Write CSV header row
        writer.writeheader()
        # Write all records
        writer.writerows(records)

    # 3. Save sample JSON dataset (first 1000 records)
    json_path = data_dir / "schemes_dataset.json"
    with open(json_path, "w", encoding="utf-8") as f:
        # Write JSON formatted dataset
        json.dump(records[:1000], f, indent=2)

    # Print success messages
    print(f"[SUCCESS] Scraped scheme guidelines saved to {data_dir / 'scraped_schemes_metadata.json'}")
    print(f"[SUCCESS] Created {len(records)} records dataset in {csv_path} and {json_path}")

# Run generator if executed directly
if __name__ == "__main__":
    generate_and_save_dataset()
