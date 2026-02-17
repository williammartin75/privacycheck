#!/usr/bin/env python3
"""
extract.py — Common Crawl WET Email + Company Data Extractor
Extracts emails, headquarters addresses, industry sectors, and company size
from WET (text-only) files. Deployed to each VPS.

Output: /root/cc_results.ndjson
"""

import gzip
import json
import os
import re
import subprocess
import sys
from collections import defaultdict
from urllib.parse import urlparse

# ── Configuration ──
WET_LIST = "/root/my_wet_files.txt"
OUTPUT = "/root/cc_results.ndjson"
PROGRESS = "/root/cc_progress.log"
CC_BASE = "https://data.commoncrawl.org"

# ══════════════════════════════════════════════════════════════
# EMAIL EXTRACTION
# ══════════════════════════════════════════════════════════════

EMAIL_RE = re.compile(
    r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}',
    re.IGNORECASE
)

EMAIL_EXCLUDE = re.compile(
    r'(example\.(com|org|net)|test\.com|localhost|noreply|no-reply|donotreply|'
    r'unsubscribe|\.png|\.jpg|\.gif|\.svg|\.css|\.js$|@[0-9]|'
    r'sentry\.io|github\.com|apache\.org|w3\.org|schema\.org|xmlns|'
    r'wixpress|wordpress|@.*@|\.wasm|fontawesome|jquery|bootstrap|'
    r'placeholder|yourname|youremail|changeme|user@|admin@example|'
    r'email@email|name@domain|info@example)',
    re.IGNORECASE
)

def extract_emails(text):
    """Extract valid emails from text."""
    emails = set()
    for m in EMAIL_RE.finditer(text):
        em = m.group().lower().strip('.')
        if len(em) < 6 or len(em) > 254:
            continue
        if EMAIL_EXCLUDE.search(em):
            continue
        emails.add(em)
    return emails


# ══════════════════════════════════════════════════════════════
# ADDRESS / HEADQUARTERS EXTRACTION (30 languages)
# ══════════════════════════════════════════════════════════════

# Label patterns that precede addresses in 30 languages
ADDRESS_LABELS = re.compile(
    r'(?:' + '|'.join([
        # English
        r'(?:head\s*(?:quarters?|office))',
        r'(?:registered\s+(?:office|address))',
        r'(?:corporate\s+(?:office|address|headquarters?))',
        r'(?:main\s+office)',
        r'(?:address)',
        r'(?:location)',
        r'(?:headquartered\s+(?:in|at))',
        r'(?:based\s+in)',
        r'(?:located\s+(?:at|in))',
        # French
        r'(?:si[èe]ge\s+social)',
        r'(?:adresse)',
        r'(?:adresse\s+du\s+si[èe]ge)',
        r'(?:si[èe]ge)',
        r'(?:situ[ée]\s+[àa])',
        r'(?:localis[ée]\s+[àa])',
        # German
        r'(?:hauptsitz)',
        r'(?:firmensitz)',
        r'(?:gesch[äa]ftsadresse)',
        r'(?:sitz\s+der\s+gesellschaft)',
        r'(?:anschrift)',
        r'(?:adresse)',
        r'(?:standort)',
        # Spanish
        r'(?:sede\s+(?:social|central|principal))',
        r'(?:direcci[oó]n)',
        r'(?:domicilio\s+social)',
        r'(?:oficina\s+(?:central|principal))',
        r'(?:ubicaci[oó]n)',
        # Italian
        r'(?:sede\s+(?:legale|operativa|sociale|centrale))',
        r'(?:indirizzo)',
        r'(?:domicilio)',
        # Portuguese
        r'(?:sede\s+(?:social|principal))',
        r'(?:endere[çc]o)',
        r'(?:morada)',
        r'(?:localiza[çc][aã]o)',
        # Dutch
        r'(?:hoofdkantoor)',
        r'(?:vestiging(?:sadres)?)',
        r'(?:adres)',
        r'(?:kantoor)',
        r'(?:gevestigd\s+(?:in|te))',
        # Polish
        r'(?:siedziba\s+(?:firmy|spółki|główna)?)',
        r'(?:adres(?:\s+siedziby)?)',
        r'(?:biuro\s+główne)',
        # Czech
        r'(?:s[ií]dlo\s+(?:firmy|společnosti)?)',
        r'(?:adresa)',
        # Russian
        r'(?:юридический\s+адрес)',
        r'(?:фактический\s+адрес)',
        r'(?:адрес)',
        r'(?:штаб-квартира)',
        r'(?:головной\s+офис)',
        # Turkish
        r'(?:merkez(?:\s+ofis)?)',
        r'(?:adres(?:i)?)',
        r'(?:genel\s+m[üu]d[üu]rl[üu]k)',
        # Swedish
        r'(?:huvudkontor)',
        r'(?:adress)',
        r'(?:kontor)',
        # Norwegian
        r'(?:hovedkontor)',
        r'(?:kontoradresse)',
        # Danish
        r'(?:hovedkontor)',
        r'(?:adresse)',
        # Finnish
        r'(?:p[äa][äa]konttori)',
        r'(?:osoite)',
        r'(?:toimipaikka)',
        # Romanian
        r'(?:sediu(?:l)?\s+(?:social|central)?)',
        r'(?:adres[ăa])',
        # Hungarian
        r'(?:sz[ée]khely)',
        r'(?:c[ií]m)',
        r'(?:k[öo]zpont)',
        # Greek
        r'(?:έδρα)',
        r'(?:διεύθυνση)',
        # Croatian / Serbian
        r'(?:sjedi[šs]te)',
        r'(?:adresa)',
        # Bulgarian
        r'(?:седалище)',
        r'(?:адрес)',
        # Arabic
        r'(?:المقر\s*(?:الرئيسي)?)',
        r'(?:العنوان)',
        # Japanese
        r'(?:本社(?:所在地)?)',
        r'(?:住所)',
        r'(?:所在地)',
        # Chinese
        r'(?:总部(?:地址)?)',
        r'(?:公司地址)',
        r'(?:地址)',
        # Korean
        r'(?:본사(?:\s*주소)?)',
        r'(?:주소)',
        # Thai
        r'(?:สำนักงานใหญ่)',
        r'(?:ที่อยู่)',
        # Vietnamese
        r'(?:trụ\s+sở(?:\s+ch[ií]nh)?)',
        r'(?:địa\s+chỉ)',
        # Hindi
        r'(?:मुख्यालय)',
        r'(?:पता)',
        # Indonesian / Malay
        r'(?:kantor\s+pusat)',
        r'(?:alamat)',
        # Ukrainian
        r'(?:юридична\s+адреса)',
        r'(?:адреса)',
    ]) + r')\s*[:\-–—]?\s*',
    re.IGNORECASE | re.UNICODE
)

# Postal code patterns by country
POSTAL_PATTERNS = {
    # Europe
    'FR': re.compile(r'\b(\d{5})\s+([A-ZÀ-Ÿ][a-zà-ÿ\-]+(?:\s+[A-ZÀ-Ÿ][a-zà-ÿ\-]+){0,3})\b'),
    'DE': re.compile(r'\b(\d{5})\s+([A-ZÄÖÜß][a-zäöüß\-]+(?:\s+[a-zäöüß]+)*)\b'),
    'IT': re.compile(r'\b(\d{5})\s+([A-ZÀ-Ÿ][a-zà-ÿ\-]+(?:\s+[A-ZÀ-Ÿ][a-zà-ÿ\-]+){0,2})\b'),
    'ES': re.compile(r'\b(\d{5})\s+([A-ZÁ-Ú][a-záéíóú\-]+(?:\s+de\s+)?(?:[a-záéíóú]+)?)\b'),
    'PT': re.compile(r'\b(\d{4}[\-]\d{3})\s+([A-ZÀ-Ÿ][a-zà-ÿ\-]+(?:\s+[a-zà-ÿ]+)*)\b'),
    'NL': re.compile(r'\b(\d{4}\s?[A-Z]{2})\s+([A-Z][a-z\-]+(?:\s+[a-z]+)*)\b'),
    'BE': re.compile(r'\b(\d{4})\s+([A-ZÀ-Ÿ][a-zà-ÿ\-]+(?:\s+[a-zà-ÿ]+)*)\b'),
    'AT': re.compile(r'\b(\d{4})\s+([A-ZÄÖÜß][a-zäöüß\-]+)\b'),
    'CH': re.compile(r'\b(\d{4})\s+([A-ZÀ-Ÿ][a-zà-ÿ\-]+(?:\s+[a-zà-ÿ]+)*)\b'),
    'PL': re.compile(r'\b(\d{2}[\-]\d{3})\s+([A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż\-]+)\b'),
    'CZ': re.compile(r'\b(\d{3}\s?\d{2})\s+([A-ZÁ-Ž][a-zá-ž\-]+)\b'),
    'SE': re.compile(r'\b(\d{3}\s?\d{2})\s+([A-ZÅÄÖ][a-zåäö\-]+)\b'),
    'NO': re.compile(r'\b(\d{4})\s+([A-ZÅÆØ][a-zåæø\-]+)\b'),
    'DK': re.compile(r'\b(\d{4})\s+([A-ZÅÆØ][a-zåæø\-]+)\b'),
    'FI': re.compile(r'\b(\d{5})\s+([A-ZÅÄÖ][a-zåäö\-]+)\b'),
    'RO': re.compile(r'\b(\d{6})\s+([A-ZĂÂÎȘȚă][a-zăâîșț\-]+)\b'),
    'HU': re.compile(r'\b(\d{4})\s+([A-ZÁÉÍÓÖŐÚÜŰ][a-záéíóöőúüű\-]+)\b'),
    # UK
    'GB': re.compile(r'\b([A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2})\b'),
    # US / Canada
    'US': re.compile(r'\b([A-Z]{2})\s+(\d{5}(?:[\-]\d{4})?)\b'),
    'CA': re.compile(r'\b([A-Z]\d[A-Z]\s*\d[A-Z]\d)\b'),
    # Asia
    'JP': re.compile(r'\b(\d{3}[\-]\d{4})\b'),
    'KR': re.compile(r'\b(\d{5})\b'),
    'CN': re.compile(r'\b(\d{6})\b'),
    'IN': re.compile(r'\b(\d{6})\b'),
    # Others
    'BR': re.compile(r'\b(\d{5}[\-]\d{3})\b'),
    'AU': re.compile(r'\b([A-Z]{2,3})\s+(\d{4})\b'),
    'RU': re.compile(r'\b(\d{6})\b'),
    'TR': re.compile(r'\b(\d{5})\b'),
}

# Major cities → country mapping for generic TLDs
MAJOR_CITIES = {
    # Europe
    'paris': 'FR', 'lyon': 'FR', 'marseille': 'FR', 'toulouse': 'FR', 'bordeaux': 'FR',
    'lille': 'FR', 'nantes': 'FR', 'strasbourg': 'FR', 'nice': 'FR', 'montpellier': 'FR',
    'berlin': 'DE', 'munich': 'DE', 'münchen': 'DE', 'hamburg': 'DE', 'frankfurt': 'DE',
    'köln': 'DE', 'cologne': 'DE', 'düsseldorf': 'DE', 'stuttgart': 'DE', 'leipzig': 'DE',
    'london': 'GB', 'manchester': 'GB', 'birmingham': 'GB', 'edinburgh': 'GB', 'bristol': 'GB',
    'madrid': 'ES', 'barcelona': 'ES', 'valencia': 'ES', 'sevilla': 'ES', 'bilbao': 'ES',
    'roma': 'IT', 'rome': 'IT', 'milano': 'IT', 'milan': 'IT', 'torino': 'IT', 'napoli': 'IT',
    'amsterdam': 'NL', 'rotterdam': 'NL', 'den haag': 'NL', 'utrecht': 'NL', 'eindhoven': 'NL',
    'bruxelles': 'BE', 'brussels': 'BE', 'antwerpen': 'BE', 'gent': 'BE', 'liège': 'BE',
    'lisboa': 'PT', 'lisbon': 'PT', 'porto': 'PT',
    'warszawa': 'PL', 'warsaw': 'PL', 'kraków': 'PL', 'krakow': 'PL', 'wrocław': 'PL',
    'praha': 'CZ', 'prague': 'CZ', 'brno': 'CZ',
    'wien': 'AT', 'vienna': 'AT', 'graz': 'AT', 'salzburg': 'AT',
    'zürich': 'CH', 'zurich': 'CH', 'genève': 'CH', 'geneva': 'CH', 'bern': 'CH', 'basel': 'CH',
    'stockholm': 'SE', 'göteborg': 'SE', 'malmö': 'SE',
    'oslo': 'NO', 'bergen': 'NO', 'trondheim': 'NO',
    'copenhagen': 'DK', 'københavn': 'DK', 'aarhus': 'DK',
    'helsinki': 'FI', 'espoo': 'FI', 'tampere': 'FI',
    'dublin': 'IE', 'cork': 'IE',
    'budapest': 'HU', 'debrecen': 'HU',
    'bucharest': 'RO', 'bucurești': 'RO', 'cluj': 'RO',
    'sofia': 'BG', 'plovdiv': 'BG',
    'zagreb': 'HR', 'split': 'HR',
    'athens': 'GR', 'αθήνα': 'GR', 'thessaloniki': 'GR',
    'istanbul': 'TR', 'ankara': 'TR', 'izmir': 'TR',
    'kyiv': 'UA', 'kiev': 'UA', 'lviv': 'UA',
    'moscow': 'RU', 'москва': 'RU', 'saint petersburg': 'RU',
    # Americas
    'new york': 'US', 'los angeles': 'US', 'chicago': 'US', 'san francisco': 'US',
    'houston': 'US', 'seattle': 'US', 'boston': 'US', 'denver': 'US', 'austin': 'US',
    'miami': 'US', 'dallas': 'US', 'atlanta': 'US', 'washington': 'US', 'philadelphia': 'US',
    'toronto': 'CA', 'vancouver': 'CA', 'montreal': 'CA', 'montréal': 'CA', 'ottawa': 'CA',
    'são paulo': 'BR', 'sao paulo': 'BR', 'rio de janeiro': 'BR',
    'mexico city': 'MX', 'ciudad de méxico': 'MX', 'guadalajara': 'MX',
    'buenos aires': 'AR', 'santiago': 'CL', 'bogotá': 'CO', 'bogota': 'CO', 'lima': 'PE',
    # Asia
    'tokyo': 'JP', '東京': 'JP', 'osaka': 'JP', '大阪': 'JP',
    'seoul': 'KR', '서울': 'KR', 'busan': 'KR',
    'beijing': 'CN', '北京': 'CN', 'shanghai': 'CN', '上海': 'CN', 'shenzhen': 'CN',
    'mumbai': 'IN', 'delhi': 'IN', 'bangalore': 'IN', 'bengaluru': 'IN', 'hyderabad': 'IN',
    'singapore': 'SG', 'hong kong': 'HK', 'bangkok': 'TH', 'jakarta': 'ID',
    'kuala lumpur': 'MY', 'taipei': 'TW', 'dubai': 'AE', 'abu dhabi': 'AE',
    'tel aviv': 'IL', 'riyadh': 'SA', 'cairo': 'EG', 'nairobi': 'KE',
    'ho chi minh': 'VN', 'hanoi': 'VN', 'manila': 'PH',
    # Oceania
    'sydney': 'AU', 'melbourne': 'AU', 'brisbane': 'AU', 'perth': 'AU',
    'auckland': 'NZ', 'wellington': 'NZ',
    # Africa
    'johannesburg': 'ZA', 'cape town': 'ZA', 'lagos': 'NG', 'accra': 'GH',
}

# TLD → Country
TLD_COUNTRY = {
    'fr': 'FR', 'de': 'DE', 'it': 'IT', 'es': 'ES', 'nl': 'NL', 'be': 'BE', 'ch': 'CH',
    'at': 'AT', 'pl': 'PL', 'pt': 'PT', 'se': 'SE', 'no': 'NO', 'dk': 'DK', 'fi': 'FI',
    'cz': 'CZ', 'sk': 'SK', 'ro': 'RO', 'hu': 'HU', 'bg': 'BG', 'hr': 'HR', 'si': 'SI',
    'lt': 'LT', 'lv': 'LV', 'ee': 'EE', 'ie': 'IE', 'lu': 'LU', 'mt': 'MT', 'cy': 'CY',
    'gr': 'GR', 'uk': 'GB', 'jp': 'JP', 'kr': 'KR', 'cn': 'CN', 'tw': 'TW', 'hk': 'HK',
    'in': 'IN', 'ru': 'RU', 'ua': 'UA', 'br': 'BR', 'mx': 'MX', 'ar': 'AR', 'cl': 'CL',
    'co': 'CO', 'ca': 'CA', 'au': 'AU', 'nz': 'NZ', 'za': 'ZA', 'ng': 'NG', 'ke': 'KE',
    'eg': 'EG', 'il': 'IL', 'ae': 'AE', 'sa': 'SA', 'tr': 'TR', 'th': 'TH', 'vn': 'VN',
    'ph': 'PH', 'id': 'ID', 'my': 'MY', 'sg': 'SG', 'pe': 'PE',
}
COMPOUND_TLDS = {
    'co.uk': 'GB', 'org.uk': 'GB', 'co.nz': 'NZ', 'com.au': 'AU',
    'co.za': 'ZA', 'com.br': 'BR', 'co.jp': 'JP', 'co.kr': 'KR', 'co.in': 'IN',
}


def extract_address(text):
    """Extract headquarters address from page text. Returns (address_str, country_code)."""
    best_address = ""
    best_country = ""

    # Method 1: Look for labeled addresses
    for m in ADDRESS_LABELS.finditer(text):
        start = m.end()
        # Grab up to 200 chars after the label
        snippet = text[start:start + 200].strip()
        # Take up to 2 lines
        lines = snippet.split('\n')[:2]
        addr = ', '.join(l.strip() for l in lines if l.strip())
        if len(addr) > 10 and len(addr) < 200:
            # Check for city → country
            addr_lower = addr.lower()
            for city, cc in MAJOR_CITIES.items():
                if city in addr_lower:
                    if len(addr) > len(best_address):
                        best_address = addr
                        best_country = cc
                    break
            # Even without a known city, if address looks valid, keep it
            if not best_address and len(addr) > 15:
                best_address = addr

    # Method 2: Postal code patterns (if no labeled address found)
    if not best_country:
        text_lower = text.lower()
        for city, cc in MAJOR_CITIES.items():
            if city in text_lower:
                best_country = cc
                break

    return best_address[:200] if best_address else "", best_country


# ══════════════════════════════════════════════════════════════
# INDUSTRY SECTOR CLASSIFICATION
# ══════════════════════════════════════════════════════════════

# Keyword dictionaries for 18 industry sectors (multi-language)
INDUSTRY_KEYWORDS = {
    'Technology': [
        'software', 'saas', 'platform', 'digital', 'tech', 'developer', 'api',
        'cloud', 'data', 'cyber', 'artificial intelligence', 'machine learning',
        'startup', 'app', 'algorithm', 'automation', 'devops', 'blockchain',
        'logiciel', 'numérique', 'développeur', 'technologie', 'informatique',
        'entwickler', 'softwareentwicklung', 'tecnología', 'desarrollo',
        'tecnologia', 'sviluppo', 'technologie', 'ontwikkeling',
        'программное обеспечение', 'разработка', 'ソフトウェア', '技術', '软件',
    ],
    'Healthcare': [
        'health', 'medical', 'hospital', 'clinic', 'doctor', 'patient',
        'pharmaceutical', 'pharma', 'biotech', 'therapy', 'diagnostic',
        'wellness', 'healthcare', 'surgery', 'nurse', 'medicine',
        'santé', 'médical', 'hôpital', 'clinique', 'médecin', 'pharmacie',
        'gesundheit', 'medizin', 'krankenhaus', 'arzt', 'klinik',
        'salud', 'médico', 'hospital', 'clínica', 'farmacia',
        'здоровье', 'медицина', 'больница', '医療', '健康', '医院',
    ],
    'Finance': [
        'bank', 'finance', 'investment', 'insurance', 'trading', 'fintech',
        'credit', 'loan', 'mortgage', 'wealth', 'asset', 'fund', 'capital',
        'accounting', 'audit', 'tax', 'payment', 'crypto',
        'banque', 'assurance', 'investissement', 'crédit', 'prêt', 'comptabilité',
        'finanzierung', 'versicherung', 'investition', 'kredit', 'steuer',
        'banca', 'finanza', 'assicurazione', 'banco', 'inversión', 'seguro',
        'банк', 'финансы', 'страхование', '金融', '銀行', '保险',
    ],
    'Legal': [
        'law', 'lawyer', 'attorney', 'legal', 'litigation', 'counsel',
        'solicitor', 'barrister', 'notary', 'compliance', 'patent',
        'avocat', 'juridique', 'notaire', 'droit', 'cabinet d\'avocats',
        'rechtsanwalt', 'anwalt', 'recht', 'kanzlei', 'notar',
        'abogado', 'derecho', 'jurídico', 'avvocato', 'legale', 'studio legale',
        'адвокат', 'юридический', '法律', '弁護士', '律师',
    ],
    'Education': [
        'education', 'university', 'school', 'college', 'academy', 'training',
        'learning', 'course', 'student', 'teacher', 'professor', 'curriculum',
        'éducation', 'université', 'école', 'formation', 'enseignement',
        'bildung', 'universität', 'schule', 'ausbildung', 'hochschule',
        'educación', 'universidad', 'escuela', 'educazione', 'università',
        'образование', 'университет', '教育', '大学', '学校',
    ],
    'Retail': [
        'shop', 'store', 'retail', 'ecommerce', 'e-commerce', 'buy', 'price',
        'product', 'catalog', 'shopping', 'order', 'cart', 'delivery',
        'boutique', 'magasin', 'vente', 'achat', 'commerce', 'produit',
        'geschäft', 'laden', 'verkauf', 'produkt', 'handel',
        'tienda', 'compra', 'venta', 'negozio', 'vendita', 'acquisto',
        'магазин', 'покупка', 'товар', '店舗', 'ショップ', '商店',
    ],
    'Manufacturing': [
        'manufacturing', 'factory', 'production', 'industrial', 'machinery',
        'assembly', 'fabrication', 'supply chain', 'engineering',
        'fabrication', 'usine', 'production', 'industriel', 'ingénierie',
        'fertigung', 'fabrik', 'herstellung', 'industrie', 'produktion',
        'fabricación', 'fábrica', 'producción', 'fabbrica', 'produzione',
        'производство', 'завод', '製造', '工場', '制造',
    ],
    'Real Estate': [
        'real estate', 'property', 'realty', 'apartment', 'housing', 'rent',
        'lease', 'mortgage', 'building', 'construction', 'broker',
        'immobilier', 'propriété', 'appartement', 'logement', 'location',
        'immobilien', 'wohnung', 'miete', 'grundstück', 'makler',
        'inmobiliaria', 'propiedad', 'vivienda', 'immobiliare', 'proprietà',
        'недвижимость', 'квартира', '不動産', '物件', '房地产',
    ],
    'Hospitality': [
        'hotel', 'restaurant', 'tourism', 'travel', 'booking', 'resort',
        'accommodation', 'hospitality', 'catering', 'guest', 'reservation',
        'hôtel', 'tourisme', 'voyage', 'réservation', 'hébergement',
        'gastgewerbe', 'tourismus', 'reise', 'buchung', 'unterkunft',
        'turismo', 'viaje', 'reserva', 'alojamiento', 'albergo',
        'гостиница', 'туризм', 'ホテル', '旅行', '酒店',
    ],
    'Media': [
        'media', 'news', 'publish', 'press', 'journalist', 'magazine',
        'broadcast', 'content', 'editorial', 'advertising', 'marketing',
        'médias', 'presse', 'journaliste', 'publicité', 'rédaction',
        'medien', 'presse', 'verlag', 'werbung', 'zeitung',
        'medios', 'prensa', 'periodismo', 'publicidad', 'stampa',
        'СМИ', 'пресса', 'メディア', '報道', '媒体',
    ],
    'Food': [
        'food', 'beverage', 'nutrition', 'organic', 'recipe', 'ingredient',
        'bakery', 'brewery', 'wine', 'coffee', 'frozen', 'dairy',
        'alimentation', 'nourriture', 'boulangerie', 'vin', 'brasserie',
        'lebensmittel', 'nahrung', 'bäckerei', 'brauerei', 'wein',
        'alimentos', 'comida', 'panadería', 'alimentare', 'cibo',
        'еда', 'питание', '食品', '飲料', '食品',
    ],
    'Automotive': [
        'automotive', 'car', 'vehicle', 'motor', 'automobile', 'dealer',
        'repair', 'garage', 'fleet', 'electric vehicle', 'ev',
        'automobile', 'véhicule', 'voiture', 'concessionnaire', 'garage',
        'automobil', 'fahrzeug', 'auto', 'werkstatt', 'händler',
        'automóvil', 'vehículo', 'coche', 'concesionario',
        'автомобиль', 'транспорт', '自動車', '車', '汽车',
    ],
    'Energy': [
        'energy', 'solar', 'wind', 'renewable', 'power', 'electricity',
        'oil', 'gas', 'petroleum', 'nuclear', 'sustainable',
        'énergie', 'solaire', 'éolien', 'renouvelable', 'électricité',
        'energie', 'solar', 'erneuerbar', 'strom', 'windkraft',
        'energía', 'renovable', 'electricidad', 'energia', 'rinnovabile',
        'энергия', 'электричество', 'エネルギー', '太陽光', '能源',
    ],
    'Construction': [
        'construction', 'builder', 'architect', 'contractor', 'renovation',
        'plumbing', 'electrical', 'roofing', 'concrete', 'structural',
        'construction', 'bâtiment', 'architecte', 'entrepreneur', 'rénovation',
        'bau', 'bauunternehmen', 'architekt', 'sanierung', 'renovierung',
        'construcción', 'constructor', 'arquitecto', 'costruzione', 'edilizia',
        'строительство', 'архитектор', '建設', '建築', '建筑',
    ],
    'Consulting': [
        'consulting', 'consultant', 'advisory', 'strategy', 'management',
        'conseil', 'consultant', 'stratégie', 'gestion', 'cabinet',
        'beratung', 'berater', 'unternehmensberatung', 'management',
        'consultoría', 'asesoría', 'consulenza', 'strategia',
        'консалтинг', 'консультант', 'コンサルティング', '咨询',
    ],
    'Logistics': [
        'logistics', 'shipping', 'freight', 'transport', 'warehouse',
        'supply chain', 'courier', 'distribution', 'cargo',
        'logistique', 'transport', 'fret', 'entrepôt', 'livraison',
        'logistik', 'spedition', 'lager', 'versand', 'fracht',
        'logística', 'transporte', 'almacén', 'logistica', 'trasporto',
        'логистика', 'транспорт', '物流', '運送', '物流',
    ],
    'Agriculture': [
        'agriculture', 'farm', 'crop', 'livestock', 'harvest', 'seed',
        'organic farming', 'irrigation', 'agri', 'agronomist',
        'agriculture', 'ferme', 'culture', 'élevage', 'récolte',
        'landwirtschaft', 'bauernhof', 'ernte', 'anbau',
        'agricultura', 'granja', 'cosecha', 'agricoltura', 'fattoria',
        'сельское хозяйство', 'ферма', '農業', '農場', '农业',
    ],
    'Telecom': [
        'telecom', 'telecommunications', 'network', 'mobile', 'wireless',
        'broadband', 'fiber', 'satellite', '5g', 'carrier', 'isp',
        'télécommunications', 'réseau', 'mobile', 'fibre', 'opérateur',
        'telekommunikation', 'netzwerk', 'mobilfunk', 'breitband',
        'telecomunicaciones', 'red', 'telecomunicazioni', 'rete',
        'телекоммуникации', 'сеть', '通信', 'テレコム', '电信',
    ],
}

def classify_industry(text):
    """Score text against industry keyword dictionaries. Returns (industry, score)."""
    text_lower = text.lower()
    scores = {}

    for industry, keywords in INDUSTRY_KEYWORDS.items():
        count = 0
        for kw in keywords:
            count += text_lower.count(kw)
        if count > 0:
            scores[industry] = count

    if not scores:
        return "", 0.0

    best = max(scores, key=scores.get)
    total = sum(scores.values())
    confidence = scores[best] / total if total > 0 else 0
    return best, round(confidence, 2)


# ══════════════════════════════════════════════════════════════
# COMPANY SIZE ESTIMATION
# ══════════════════════════════════════════════════════════════

# Employee count patterns in 30 languages
SIZE_PATTERNS = [
    # English
    re.compile(r'(\d[\d,\.]*)\s*(?:\+\s*)?(?:employees?|team\s*members?|staff|workers?|people|associates)', re.I),
    re.compile(r'(?:team|staff|workforce)\s+(?:of\s+)?(\d[\d,\.]*)', re.I),
    re.compile(r'(?:over|more\s+than|approximately|about|circa)\s+(\d[\d,\.]*)\s*(?:employees?|people|staff)', re.I),
    # French
    re.compile(r'(\d[\d,\.]*)\s*(?:collaborateurs?|salariés?|employés?|personnes)', re.I),
    re.compile(r'(?:effectif|équipe)\s+(?:de\s+)?(\d[\d,\.]*)', re.I),
    re.compile(r'(?:plus\s+de|environ|près\s+de)\s+(\d[\d,\.]*)\s*(?:collaborateurs?|salariés?|employés?)', re.I),
    # German
    re.compile(r'(\d[\d,\.]*)\s*(?:Mitarbeiter(?:innen)?|Beschäftigte|Angestellte)', re.I),
    re.compile(r'(?:Team|Belegschaft)\s+(?:von\s+)?(\d[\d,\.]*)', re.I),
    re.compile(r'(?:über|mehr\s+als|rund|etwa|circa)\s+(\d[\d,\.]*)\s*(?:Mitarbeiter|Beschäftigte)', re.I),
    # Spanish
    re.compile(r'(\d[\d,\.]*)\s*(?:empleados?|trabajadores?|colaboradores?)', re.I),
    re.compile(r'(?:equipo|plantilla)\s+(?:de\s+)?(\d[\d,\.]*)', re.I),
    # Italian
    re.compile(r'(\d[\d,\.]*)\s*(?:dipendenti|collaboratori|lavoratori)', re.I),
    # Portuguese
    re.compile(r'(\d[\d,\.]*)\s*(?:funcionários|colaboradores|empregados)', re.I),
    # Dutch
    re.compile(r'(\d[\d,\.]*)\s*(?:medewerkers?|werknemers?)', re.I),
    # Polish
    re.compile(r'(\d[\d,\.]*)\s*(?:pracowników|osób|zatrudnionych)', re.I),
    # Czech
    re.compile(r'(\d[\d,\.]*)\s*(?:zaměstnanců|pracovníků)', re.I),
    # Russian
    re.compile(r'(\d[\d,\.]*)\s*(?:сотрудников|работников|человек)', re.I),
    # Turkish
    re.compile(r'(\d[\d,\.]*)\s*(?:çalışan|personel|kişi)', re.I),
    # Japanese
    re.compile(r'(?:従業員|社員|スタッフ)\s*[:：]?\s*(?:約\s*)?(\d[\d,\.]*)\s*(?:名|人)', re.I),
    # Chinese
    re.compile(r'(?:员工|雇员|职员)\s*[:：]?\s*(?:约\s*)?(\d[\d,\.]*)\s*(?:人|名|位)?', re.I),
    # Korean
    re.compile(r'(?:직원|종업원)\s*[:：]?\s*(?:약\s*)?(\d[\d,\.]*)\s*(?:명|인)?', re.I),
    # Arabic
    re.compile(r'(\d[\d,\.]*)\s*(?:موظف|عامل)', re.I),
    # Swedish
    re.compile(r'(\d[\d,\.]*)\s*(?:anställda|medarbetare)', re.I),
    # Norwegian/Danish
    re.compile(r'(\d[\d,\.]*)\s*(?:ansatte|medarbejdere)', re.I),
    # Finnish
    re.compile(r'(\d[\d,\.]*)\s*(?:työntekijää|henkilöä)', re.I),
    # Romanian
    re.compile(r'(\d[\d,\.]*)\s*(?:angajați|angajati|salariați)', re.I),
    # Hungarian
    re.compile(r'(\d[\d,\.]*)\s*(?:alkalmazott|munkatárs|dolgozó)', re.I),
    # Thai
    re.compile(r'(?:พนักงาน)\s*(\d[\d,\.]*)\s*(?:คน)?', re.I),
    # Vietnamese
    re.compile(r'(\d[\d,\.]*)\s*(?:nhân viên|người lao động)', re.I),
    # Hindi
    re.compile(r'(\d[\d,\.]*)\s*(?:कर्मचारी|कर्मचारियों)', re.I),
    # Indonesian
    re.compile(r'(\d[\d,\.]*)\s*(?:karyawan|pegawai|pekerja)', re.I),
]

# Size category keywords
SIZE_KEYWORDS = {
    'micro': ['freelance', 'freelancer', 'solopreneur', 'indépendant', 'selbstständig',
              'autónomo', 'libero professionista', 'zzp', 'one-man', 'solo'],
    'startup': ['startup', 'start-up', 'early stage', 'seed', 'pre-seed',
                'incubator', 'accelerator', 'jeune entreprise', 'startup'],
    'small': ['small business', 'sme', 'pme', 'kmu', 'pyme', 'pmi', 'tpe',
              'klein', 'pequeña', 'piccola', 'petite entreprise', 'msp'],
    'medium': ['mid-size', 'midsize', 'medium', 'eti', 'mittelstand',
               'mediana empresa', 'moyenne entreprise', 'middelgroot'],
    'large': ['enterprise', 'corporation', 'multinational', 'fortune 500',
              'fortune 1000', 'global leader', 'leader mondial', 'weltmarktführer',
              'large enterprise', 'grande entreprise', 'großunternehmen', 'koncern'],
}


def parse_employee_count(s):
    """Parse a number string like '1,500' or '1.500' into int."""
    s = s.replace(',', '').replace('.', '').replace(' ', '')
    try:
        return int(s)
    except ValueError:
        return 0


def estimate_size(text):
    """Estimate company size from text. Returns (size_bucket, size_signal)."""
    # Method 1: Employee count patterns
    for pattern in SIZE_PATTERNS:
        m = pattern.search(text)
        if m:
            count = parse_employee_count(m.group(1))
            if 1 <= count <= 500000:
                if count < 10:
                    bucket = 'micro'
                elif count < 50:
                    bucket = 'small'
                elif count < 250:
                    bucket = 'medium'
                elif count < 1000:
                    bucket = 'large'
                else:
                    bucket = 'enterprise'
                return bucket, f"{count} employees"

    # Method 2: Size keywords
    text_lower = text.lower()
    for bucket, keywords in SIZE_KEYWORDS.items():
        for kw in keywords:
            if kw in text_lower:
                return bucket, kw

    return '', ''


# ══════════════════════════════════════════════════════════════
# COUNTRY FROM DOMAIN
# ══════════════════════════════════════════════════════════════

def get_country_from_domain(domain):
    for tld, cc in COMPOUND_TLDS.items():
        if domain.endswith('.' + tld):
            return cc
    tld = domain.rsplit('.', 1)[-1] if '.' in domain else ''
    return TLD_COUNTRY.get(tld, '')


# ══════════════════════════════════════════════════════════════
# WET FILE PROCESSING
# ══════════════════════════════════════════════════════════════

def process_wet_file(filepath, output_file):
    """Process a single WET file and append results to output."""
    records = 0
    emails_found = 0

    try:
        with gzip.open(filepath, 'rt', encoding='utf-8', errors='replace') as f:
            url = ''
            domain = ''
            content_lines = []
            in_content = False

            for line in f:
                line = line.rstrip('\n').rstrip('\r')

                if line.startswith('WARC/1.'):
                    # Process previous record
                    if url and content_lines:
                        text = '\n'.join(content_lines)
                        emails = extract_emails(text)
                        if emails:
                            # Extract enrichment data
                            address, addr_country = extract_address(text)
                            industry, ind_score = classify_industry(text)
                            size_bucket, size_signal = estimate_size(text)

                            # Country: address > TLD > city detection
                            country = addr_country or get_country_from_domain(domain)

                            for em in emails:
                                em_domain = em.split('@')[1] if '@' in em else domain
                                record = {
                                    'email': em,
                                    'domain': em_domain,
                                    'source_url': url,
                                    'source_domain': domain,
                                    'address': address,
                                    'country': country,
                                    'industry': industry,
                                    'industry_score': ind_score,
                                    'size_bucket': size_bucket,
                                    'size_signal': size_signal,
                                }
                                output_file.write(json.dumps(record, ensure_ascii=False) + '\n')
                                emails_found += 1

                    records += 1
                    url = ''
                    domain = ''
                    content_lines = []
                    in_content = False
                    continue

                if line.startswith('WARC-Target-URI:'):
                    url = line.split(':', 1)[1].strip()
                    try:
                        parsed = urlparse(url)
                        domain = parsed.hostname or ''
                        if domain.startswith('www.'):
                            domain = domain[4:]
                    except:
                        domain = ''
                    continue

                if line.startswith('WARC-') or line.startswith('Content-'):
                    continue

                if line == '' and url and not in_content:
                    in_content = True
                    continue

                if in_content:
                    content_lines.append(line)

            # Process last record
            if url and content_lines:
                text = '\n'.join(content_lines)
                emails = extract_emails(text)
                if emails:
                    address, addr_country = extract_address(text)
                    industry, ind_score = classify_industry(text)
                    size_bucket, size_signal = estimate_size(text)
                    country = addr_country or get_country_from_domain(domain)

                    for em in emails:
                        em_domain = em.split('@')[1] if '@' in em else domain
                        record = {
                            'email': em,
                            'domain': em_domain,
                            'source_url': url,
                            'source_domain': domain,
                            'address': address,
                            'country': country,
                            'industry': industry,
                            'industry_score': ind_score,
                            'size_bucket': size_bucket,
                            'size_signal': size_signal,
                        }
                        output_file.write(json.dumps(record, ensure_ascii=False) + '\n')
                        emails_found += 1

    except Exception as e:
        print(f"  [ERROR] {filepath}: {e}", file=sys.stderr)

    return records, emails_found


# ══════════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════════

def main():
    if not os.path.exists(WET_LIST):
        print(f"[ERROR] {WET_LIST} not found", file=sys.stderr)
        sys.exit(1)

    with open(WET_LIST) as f:
        all_files = [l.strip() for l in f if l.strip()]

    total = len(all_files)

    # Resume support
    done_set = set()
    if os.path.exists(PROGRESS):
        with open(PROGRESS) as f:
            done_set = set(l.strip() for l in f if l.strip())

    done = len(done_set)
    print(f"[START] {total} WET files assigned, {done} already done")

    output_file = open(OUTPUT, 'a', encoding='utf-8')

    for i, wet_path in enumerate(all_files):
        if wet_path in done_set:
            continue

        done += 1
        filename = os.path.basename(wet_path)
        tmp_path = f"/tmp/{filename}"

        print(f"[{done}/{total}] {filename} ...")

        # Download
        ret = subprocess.run(
            ['wget', '-q', '-O', tmp_path, f"{CC_BASE}/{wet_path}"],
            timeout=300, capture_output=True
        )
        if ret.returncode != 0:
            print(f"  [WARN] Download failed, skipping")
            with open(PROGRESS, 'a') as pf:
                pf.write(wet_path + '\n')
            continue

        # Process
        records, emails = process_wet_file(tmp_path, output_file)
        output_file.flush()

        # Cleanup
        try:
            os.remove(tmp_path)
        except:
            pass

        # Mark done
        with open(PROGRESS, 'a') as pf:
            pf.write(wet_path + '\n')

        # Progress every 10 files
        if done % 10 == 0:
            total_emails = sum(1 for _ in open(OUTPUT, encoding='utf-8', errors='replace'))
            disk = subprocess.run(['df', '-h', '/'], capture_output=True, text=True).stdout.split('\n')
            disk_usage = disk[1].split()[4] if len(disk) > 1 else '?'
            print(f"  [PROGRESS] {done}/{total} files | {total_emails} emails | Disk: {disk_usage}")

    output_file.close()

    # Final stats
    if os.path.exists(OUTPUT):
        total_emails = sum(1 for _ in open(OUTPUT, encoding='utf-8', errors='replace'))
    else:
        total_emails = 0
    print(f"[DONE] {done} files processed, {total_emails} emails extracted")


if __name__ == '__main__':
    main()
