#!/usr/bin/env python3
"""
CBSA HS Code Scraper
Scrapes Harmonized System (HS) codes from Canada Border Services Agency website
"""

import requests
from bs4 import BeautifulSoup
import json
import time
import re
from datetime import datetime
from typing import List, Dict, Optional
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class CBSAHSCodeScraper:
    """Scraper for CBSA HS Code database"""
    
    BASE_URL = "https://www.cbsa-asfc.gc.ca/trade-commerce/tariff-tarif"
    
    def __init__(self, output_file: str = 'hs_codes.json'):
        self.output_file = output_file
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        self.hs_codes = []
        
    def search_hs_code(self, keyword: str) -> List[Dict]:
        """
        Search for HS codes by keyword
        
        Args:
            keyword: Search term (e.g., 'cotton', 'electronics')
            
        Returns:
            List of HS code entries
        """
        logger.info(f"Searching for keyword: {keyword}")
        
        # Note: This is a template - actual CBSA search endpoint may vary
        search_url = f"{self.BASE_URL}/search"
        
        try:
            response = self.session.get(
                search_url,
                params={'q': keyword},
                timeout=10
            )
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            results = self._parse_search_results(soup)
            
            logger.info(f"Found {len(results)} results for '{keyword}'")
            return results
            
        except requests.RequestException as e:
            logger.error(f"Error searching for '{keyword}': {e}")
            return []
    
    def _parse_search_results(self, soup: BeautifulSoup) -> List[Dict]:
        """Parse search results from HTML"""
        results = []
        
        # This is a template - adjust selectors based on actual CBSA HTML structure
        result_items = soup.select('.search-result-item')
        
        for item in result_items:
            try:
                hs_code = item.select_one('.hs-code')
                description = item.select_one('.description')
                duty_rate = item.select_one('.duty-rate')
                
                if hs_code and description:
                    entry = {
                        'hs_code': self._clean_hs_code(hs_code.text),
                        'description': description.text.strip(),
                        'duty_rate': duty_rate.text.strip() if duty_rate else 'N/A',
                        'chapter': self._extract_chapter(hs_code.text),
                        'source': 'CBSA',
                        'scraped_at': datetime.now().isoformat()
                    }
                    results.append(entry)
                    
            except Exception as e:
                logger.warning(f"Error parsing result item: {e}")
                continue
        
        return results
    
    def _clean_hs_code(self, raw_code: str) -> str:
        """Clean and format HS code"""
        # Remove spaces, dots, and keep only digits
        cleaned = re.sub(r'[^\d]', '', raw_code)
        
        # Format as XX.XX.XX.XX (standard HS code format)
        if len(cleaned) >= 6:
            return f"{cleaned[:2]}.{cleaned[2:4]}.{cleaned[4:6]}.{cleaned[6:]}"
        return cleaned
    
    def _extract_chapter(self, hs_code: str) -> int:
        """Extract chapter number from HS code"""
        digits = re.findall(r'\d+', hs_code)
        if digits:
            first_two = digits[0][:2]
            return int(first_two)
        return 0
    
    def scrape_chapter(self, chapter: int) -> List[Dict]:
        """
        Scrape all HS codes from a specific chapter
        
        Args:
            chapter: Chapter number (1-99)
            
        Returns:
            List of HS code entries
        """
        logger.info(f"Scraping chapter {chapter}")
        
        chapter_url = f"{self.BASE_URL}/chapter-{chapter:02d}"
        
        try:
            response = self.session.get(chapter_url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            codes = self._parse_chapter_page(soup, chapter)
            
            logger.info(f"Found {len(codes)} codes in chapter {chapter}")
            return codes
            
        except requests.RequestException as e:
            logger.error(f"Error scraping chapter {chapter}: {e}")
            return []
    
    def _parse_chapter_page(self, soup: BeautifulSoup, chapter: int) -> List[Dict]:
        """Parse chapter page HTML"""
        codes = []
        
        # Adjust selectors based on actual CBSA HTML
        code_rows = soup.select('table.hs-code-table tbody tr')
        
        for row in code_rows:
            try:
                cells = row.select('td')
                if len(cells) >= 3:
                    entry = {
                        'hs_code': self._clean_hs_code(cells[0].text),
                        'description': cells[1].text.strip(),
                        'duty_rate': cells[2].text.strip(),
                        'chapter': chapter,
                        'source': 'CBSA',
                        'scraped_at': datetime.now().isoformat()
                    }
                    codes.append(entry)
                    
            except Exception as e:
                logger.warning(f"Error parsing row in chapter {chapter}: {e}")
                continue
        
        return codes
    
    def scrape_popular_categories(self) -> None:
        """Scrape commonly used HS code categories"""
        categories = [
            'electronics',
            'clothing',
            'textiles',
            'machinery',
            'automotive',
            'food',
            'chemicals',
            'plastics',
            'wood',
            'metals'
        ]
        
        for category in categories:
            results = self.search_hs_code(category)
            self.hs_codes.extend(results)
            time.sleep(1)  # Rate limiting
    
    def save_to_json(self) -> None:
        """Save scraped HS codes to JSON file"""
        # Remove duplicates based on HS code
        unique_codes = {code['hs_code']: code for code in self.hs_codes}
        unique_list = list(unique_codes.values())
        
        output = {
            'metadata': {
                'total_codes': len(unique_list),
                'scraped_at': datetime.now().isoformat(),
                'source': 'CBSA',
                'version': '1.0'
            },
            'codes': unique_list
        }
        
        with open(self.output_file, 'w', encoding='utf-8') as f:
            json.dump(output, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Saved {len(unique_list)} HS codes to {self.output_file}")
    
    def save_to_postgresql(self, db_config: Dict) -> None:
        """Save scraped data to PostgreSQL database"""
        try:
            import psycopg2
            
            conn = psycopg2.connect(**db_config)
            cursor = conn.cursor()
            
            # Insert or update HS codes
            for code in self.hs_codes:
                cursor.execute("""
                    INSERT INTO freight_data.hs_code_cache 
                    (hs_code, description, duty_rate, chapter, source, last_updated)
                    VALUES (%s, %s, %s, %s, %s, NOW())
                    ON CONFLICT (hs_code) 
                    DO UPDATE SET 
                        description = EXCLUDED.description,
                        duty_rate = EXCLUDED.duty_rate,
                        chapter = EXCLUDED.chapter,
                        last_updated = NOW()
                """, (
                    code['hs_code'],
                    code['description'],
                    code['duty_rate'],
                    code['chapter'],
                    code['source']
                ))
            
            conn.commit()
            cursor.close()
            conn.close()
            
            logger.info(f"Saved {len(self.hs_codes)} codes to PostgreSQL")
            
        except Exception as e:
            logger.error(f"Error saving to PostgreSQL: {e}")


def main():
    """Main execution function"""
    scraper = CBSAHSCodeScraper(output_file='hs_codes.json')
    
    # Scrape popular categories
    logger.info("Starting scrape of popular categories...")
    scraper.scrape_popular_categories()
    
    # Save to JSON
    scraper.save_to_json()
    
    # Optionally save to PostgreSQL
    # db_config = {
    #     'host': 'localhost',
    #     'port': 5432,
    #     'database': 'freight_automation',
    #     'user': 'freight',
    #     'password': 'freight123'
    # }
    # scraper.save_to_postgresql(db_config)
    
    logger.info("Scraping completed!")


if __name__ == '__main__':
    main()
