# 🐍 Freight Automation Scripts

Python scripts for data collection, scraping, and automation tasks.

## 📋 Scripts

### 1. CBSA HS Code Scraper (`cbsa-scraper.py`)

Scrapes Harmonized System (HS) codes from Canada Border Services Agency website.

**Features**:
- Search by keyword
- Scrape entire chapters
- Auto-save to JSON
- PostgreSQL integration
- Duplicate detection

**Usage**:

```bash
# Install dependencies
pip install -r requirements.txt

# Run scraper
python cbsa-scraper.py

# Output: hs_codes.json
```

**Customize**:

```python
from cbsa_scraper import CBSAHSCodeScraper

scraper = CBSAHSCodeScraper()

# Search specific keyword
results = scraper.search_hs_code('electronics')

# Scrape specific chapter
chapter_codes = scraper.scrape_chapter(61)  # Chapter 61: Apparel

# Save to database
db_config = {
    'host': 'localhost',
    'database': 'freight_automation',
    'user': 'freight',
    'password': 'your_password'
}
scraper.save_to_postgresql(db_config)
```

## 🔧 Setup

### 1. Install Python 3.9+

```bash
python --version  # Should be 3.9 or higher
```

### 2. Create Virtual Environment

```bash
cd scripts
python -m venv venv

# Activate
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate  # Windows
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment

```bash
cp ../.env.example .env
# Edit .env with your credentials
```

## 📊 Output Format

### JSON Output (`hs_codes.json`)

```json
{
  "metadata": {
    "total_codes": 150,
    "scraped_at": "2026-01-16T10:30:00",
    "source": "CBSA",
    "version": "1.0"
  },
  "codes": [
    {
      "hs_code": "61.09.10.00",
      "description": "T-shirts, singlets and vests of cotton, knitted",
      "duty_rate": "16.5%",
      "chapter": 61,
      "source": "CBSA",
      "scraped_at": "2026-01-16T10:30:00"
    }
  ]
}
```

## 🔄 Automation

### Scheduled Scraping (Cron)

```bash
# Run every Sunday at 2 AM
0 2 * * 0 cd /path/to/scripts && ./venv/bin/python cbsa-scraper.py
```

### n8n Workflow Integration

1. Create n8n workflow with "Execute Command" node
2. Command: `python /path/to/scripts/cbsa-scraper.py`
3. Trigger: Cron (weekly)
4. Output: Parse JSON and insert to PostgreSQL

## ⚠️ Legal & Ethical Use

**Important**: Web scraping must comply with:
- Website Terms of Service
- robots.txt directives
- Rate limiting (respect server load)
- Data usage policies

**CBSA Data**:
- CBSA data is publicly available
- Intended for reference purposes
- Always verify with official sources
- Do not redistribute without permission

## 🛠️ Troubleshooting

### SSL Errors

```bash
pip install --upgrade certifi
```

### Selenium WebDriver

```bash
# Install ChromeDriver (if using Selenium)
# Ubuntu/Debian
sudo apt-get install chromium-chromedriver

# Mac
brew install chromedriver
```

### Database Connection

```bash
# Test PostgreSQL connection
psql -h localhost -U freight -d freight_automation -c "SELECT 1;"
```

## 📚 Additional Resources

- CBSA Tariff Finder: https://www.cbsa-asfc.gc.ca/trade-commerce/tariff-tarif/menu-eng.html
- HS Code Lookup: https://www.tariffinder.ca
- WTO HS Database: https://www.wto.org/english/res_e/statis_e/daily_update_e/tariff_profiles/harmonized_system_e.htm

---

**Status**: ✅ Ready to use
**Version**: 1.0.0
**Last Updated**: 2026-01-16
