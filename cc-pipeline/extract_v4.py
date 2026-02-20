#!/usr/bin/env python3
"""
extract_v4.py — Optimized Common Crawl WET Extractor (v4)
Improvements over v3:
  1. 4 parallel workers per VPS (configurable)
  2. Email counter variable instead of O(n) line counting
  3. wget timeout 120s (down from 600s)
  4. Pre-download queue of 3 (up from 2)
  5. Flush every 50 emails instead of every record
  6. Worker-specific output files to avoid lock contention

Usage:
  python3 extract_v4.py 0 4   # Worker 0 of 4
  python3 extract_v4.py 1 4   # Worker 1 of 4
  python3 extract_v4.py 2 4   # Worker 2 of 4
  python3 extract_v4.py 3 4   # Worker 3 of 4
"""

import json
import os
import re
import subprocess
import sys
import threading
import queue
from urllib.parse import urlparse

# ── Configuration ──
WET_LIST = "/root/my_wet_files.txt"
OUTPUT_BASE = "/root/cc_results"       # Worker writes to cc_results_w{id}.ndjson
PROGRESS = "/root/cc_progress.log"
CC_BASE = "https://data.commoncrawl.org"
WGET_TIMEOUT = 120   # seconds (was 600 in v3)
DL_QUEUE_SIZE = 3     # pre-download buffer (was 2 in v3)
FLUSH_EVERY = 50      # flush output every N emails

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

def extract_emails_from_line(line):
    """Extract valid emails from a single line. Returns set."""
    emails = set()
    for m in EMAIL_RE.finditer(line):
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

ADDRESS_LABELS = re.compile(
    r'(?:' + '|'.join([
        r'(?:head\s*(?:quarters?|office))',
        r'(?:registered\s+(?:office|address))',
        r'(?:corporate\s+(?:office|address|headquarters?))',
        r'(?:main\s+office)', r'(?:address)', r'(?:location)',
        r'(?:headquartered\s+(?:in|at))', r'(?:based\s+in)',
        r'(?:located\s+(?:at|in))',
        r'(?:si[èe]ge\s+social)', r'(?:adresse)',
        r'(?:adresse\s+du\s+si[èe]ge)', r'(?:si[èe]ge)',
        r'(?:situ[ée]\s+[àa])', r'(?:localis[ée]\s+[àa])',
        r'(?:hauptsitz)', r'(?:firmensitz)',
        r'(?:gesch[äa]ftsadresse)', r'(?:sitz\s+der\s+gesellschaft)',
        r'(?:anschrift)', r'(?:standort)',
        r'(?:sede\s+(?:social|central|principal))',
        r'(?:direcci[oó]n)', r'(?:domicilio\s+social)',
        r'(?:oficina\s+(?:central|principal))', r'(?:ubicaci[oó]n)',
        r'(?:sede\s+(?:legale|operativa|sociale|centrale))',
        r'(?:indirizzo)', r'(?:domicilio)',
        r'(?:sede\s+(?:social|principal))',
        r'(?:endere[çc]o)', r'(?:morada)', r'(?:localiza[çc][aã]o)',
        r'(?:hoofdkantoor)', r'(?:vestiging(?:sadres)?)',
        r'(?:adres)', r'(?:kantoor)', r'(?:gevestigd\s+(?:in|te))',
        r'(?:siedziba\s+(?:firmy|spółki|główna)?)',
        r'(?:adres(?:\s+siedziby)?)', r'(?:biuro\s+główne)',
        r'(?:s[ií]dlo\s+(?:firmy|společnosti)?)', r'(?:adresa)',
        r'(?:юридический\s+адрес)', r'(?:фактический\s+адрес)',
        r'(?:адрес)', r'(?:штаб-квартира)', r'(?:головной\s+офис)',
        r'(?:merkez(?:\s+ofis)?)', r'(?:adres(?:i)?)',
        r'(?:genel\s+m[üu]d[üu]rl[üu]k)',
        r'(?:huvudkontor)', r'(?:adress)', r'(?:kontor)',
        r'(?:hovedkontor)', r'(?:kontoradresse)', r'(?:adresse)',
        r'(?:p[äa][äa]konttori)', r'(?:osoite)', r'(?:toimipaikka)',
        r'(?:sediu(?:l)?\s+(?:social|central)?)', r'(?:adres[ăa])',
        r'(?:sz[ée]khely)', r'(?:c[ií]m)', r'(?:k[öo]zpont)',
        r'(?:έδρα)', r'(?:διεύθυνση)',
        r'(?:sjedi[šs]te)', r'(?:adresa)',
        r'(?:седалище)', r'(?:адрес)',
        r'(?:المقر\s*(?:الرئيسي)?)', r'(?:العنوان)',
        r'(?:本社(?:所在地)?)', r'(?:住所)', r'(?:所在地)',
        r'(?:总部(?:地址)?)', r'(?:公司地址)', r'(?:地址)',
        r'(?:본사(?:\s*주소)?)', r'(?:주소)',
        r'(?:สำนักงานใหญ่)', r'(?:ที่อยู่)',
        r'(?:trụ\s+sở(?:\s+ch[ií]nh)?)', r'(?:địa\s+chỉ)',
        r'(?:मुख्यालय)', r'(?:पता)',
        r'(?:kantor\s+pusat)', r'(?:alamat)',
        r'(?:юридична\s+адреса)', r'(?:адреса)',
    ]) + r')\s*[:\-–—]?\s*',
    re.IGNORECASE | re.UNICODE
)

MAJOR_CITIES = {
    'paris':'FR','lyon':'FR','marseille':'FR','toulouse':'FR','bordeaux':'FR',
    'lille':'FR','nantes':'FR','strasbourg':'FR','nice':'FR','montpellier':'FR',
    'berlin':'DE','munich':'DE','münchen':'DE','hamburg':'DE','frankfurt':'DE',
    'köln':'DE','cologne':'DE','düsseldorf':'DE','stuttgart':'DE','leipzig':'DE',
    'london':'GB','manchester':'GB','birmingham':'GB','edinburgh':'GB','bristol':'GB',
    'madrid':'ES','barcelona':'ES','valencia':'ES','sevilla':'ES','bilbao':'ES',
    'roma':'IT','rome':'IT','milano':'IT','milan':'IT','torino':'IT','napoli':'IT',
    'amsterdam':'NL','rotterdam':'NL','den haag':'NL','utrecht':'NL','eindhoven':'NL',
    'bruxelles':'BE','brussels':'BE','antwerpen':'BE','gent':'BE','liège':'BE',
    'lisboa':'PT','lisbon':'PT','porto':'PT',
    'warszawa':'PL','warsaw':'PL','kraków':'PL','krakow':'PL','wrocław':'PL',
    'praha':'CZ','prague':'CZ','brno':'CZ',
    'wien':'AT','vienna':'AT','graz':'AT','salzburg':'AT',
    'zürich':'CH','zurich':'CH','genève':'CH','geneva':'CH','bern':'CH','basel':'CH',
    'stockholm':'SE','göteborg':'SE','malmö':'SE',
    'oslo':'NO','bergen':'NO','trondheim':'NO',
    'copenhagen':'DK','københavn':'DK','aarhus':'DK',
    'helsinki':'FI','espoo':'FI','tampere':'FI',
    'dublin':'IE','cork':'IE',
    'budapest':'HU','debrecen':'HU',
    'bucharest':'RO','bucurești':'RO','cluj':'RO',
    'sofia':'BG','plovdiv':'BG',
    'zagreb':'HR','split':'HR',
    'athens':'GR','αθήνα':'GR','thessaloniki':'GR',
    'istanbul':'TR','ankara':'TR','izmir':'TR',
    'kyiv':'UA','kiev':'UA','lviv':'UA',
    'moscow':'RU','москва':'RU','saint petersburg':'RU',
    'new york':'US','los angeles':'US','chicago':'US','san francisco':'US',
    'houston':'US','seattle':'US','boston':'US','denver':'US','austin':'US',
    'miami':'US','dallas':'US','atlanta':'US','washington':'US','philadelphia':'US',
    'toronto':'CA','vancouver':'CA','montreal':'CA','montréal':'CA','ottawa':'CA',
    'são paulo':'BR','sao paulo':'BR','rio de janeiro':'BR',
    'mexico city':'MX','ciudad de méxico':'MX','guadalajara':'MX',
    'buenos aires':'AR','santiago':'CL','bogotá':'CO','bogota':'CO','lima':'PE',
    'tokyo':'JP','東京':'JP','osaka':'JP','大阪':'JP',
    'seoul':'KR','서울':'KR','busan':'KR',
    'beijing':'CN','北京':'CN','shanghai':'CN','上海':'CN','shenzhen':'CN',
    'mumbai':'IN','delhi':'IN','bangalore':'IN','bengaluru':'IN','hyderabad':'IN',
    'singapore':'SG','hong kong':'HK','bangkok':'TH','jakarta':'ID',
    'kuala lumpur':'MY','taipei':'TW','dubai':'AE','abu dhabi':'AE',
    'tel aviv':'IL','riyadh':'SA','cairo':'EG','nairobi':'KE',
    'ho chi minh':'VN','hanoi':'VN','manila':'PH',
    'sydney':'AU','melbourne':'AU','brisbane':'AU','perth':'AU',
    'auckland':'NZ','wellington':'NZ',
    'johannesburg':'ZA','cape town':'ZA','lagos':'NG','accra':'GH',
}

TLD_COUNTRY = {
    'fr':'FR','de':'DE','it':'IT','es':'ES','nl':'NL','be':'BE','ch':'CH',
    'at':'AT','pl':'PL','pt':'PT','se':'SE','no':'NO','dk':'DK','fi':'FI',
    'cz':'CZ','sk':'SK','ro':'RO','hu':'HU','bg':'BG','hr':'HR','si':'SI',
    'lt':'LT','lv':'LV','ee':'EE','ie':'IE','lu':'LU','mt':'MT','cy':'CY',
    'gr':'GR','uk':'GB','jp':'JP','kr':'KR','cn':'CN','tw':'TW','hk':'HK',
    'in':'IN','ru':'RU','ua':'UA','br':'BR','mx':'MX','ar':'AR','cl':'CL',
    'co':'CO','ca':'CA','au':'AU','nz':'NZ','za':'ZA','ng':'NG','ke':'KE',
    'eg':'EG','il':'IL','ae':'AE','sa':'SA','tr':'TR','th':'TH','vn':'VN',
    'ph':'PH','id':'ID','my':'MY','sg':'SG','pe':'PE',
}
COMPOUND_TLDS = {
    'co.uk':'GB','org.uk':'GB','co.nz':'NZ','com.au':'AU',
    'co.za':'ZA','com.br':'BR','co.jp':'JP','co.kr':'KR','co.in':'IN',
}


def extract_address(text, text_lower):
    """Extract HQ address. Returns (address_str, country_code)."""
    best_address = ""
    best_country = ""

    for m in ADDRESS_LABELS.finditer(text):
        start = m.end()
        snippet = text[start:start + 200].strip()
        lines = snippet.split('\n')[:2]
        addr = ', '.join(l.strip() for l in lines if l.strip())
        if 10 < len(addr) < 200:
            addr_lower = addr.lower()
            for city, cc in MAJOR_CITIES.items():
                if city in addr_lower:
                    if len(addr) > len(best_address):
                        best_address = addr
                        best_country = cc
                    break
            if not best_address and len(addr) > 15:
                best_address = addr

    if not best_country:
        for city, cc in MAJOR_CITIES.items():
            if city in text_lower:
                best_country = cc
                break

    return best_address[:200] if best_address else "", best_country


# ══════════════════════════════════════════════════════════════
# INDUSTRY SECTOR CLASSIFICATION
# ══════════════════════════════════════════════════════════════

INDUSTRY_KEYWORDS = {
    'Technology': [
        'software','saas','platform','digital','tech','developer','api',
        'cloud','cyber','artificial intelligence','machine learning',
        'startup','algorithm','automation','devops','blockchain',
        'logiciel','numérique','développeur','technologie','informatique',
        'entwickler','softwareentwicklung','tecnología','desarrollo',
        'tecnologia','sviluppo','technologie','ontwikkeling',
        'программное обеспечение','разработка','ソフトウェア','技術','软件',
    ],
    'Healthcare': [
        'health','medical','hospital','clinic','doctor','patient',
        'pharmaceutical','pharma','biotech','therapy','diagnostic',
        'wellness','healthcare','surgery','nurse','medicine',
        'santé','médical','hôpital','clinique','médecin','pharmacie',
        'gesundheit','medizin','krankenhaus','arzt','klinik',
        'salud','médico','clínica','farmacia',
        'здоровье','медицина','больница','医療','健康','医院',
    ],
    'Finance': [
        'bank','finance','investment','insurance','trading','fintech',
        'credit','loan','mortgage','wealth','asset','fund','capital',
        'accounting','audit','tax','payment','crypto',
        'banque','assurance','investissement','crédit','prêt','comptabilité',
        'finanzierung','versicherung','investition','kredit','steuer',
        'banca','finanza','assicurazione','banco','inversión','seguro',
        'банк','финансы','страхование','金融','銀行','保险',
    ],
    'Legal': [
        'lawyer','attorney','legal','litigation','counsel',
        'solicitor','barrister','notary','compliance','patent',
        'avocat','juridique','notaire','droit',
        'rechtsanwalt','anwalt','recht','kanzlei','notar',
        'abogado','derecho','jurídico','avvocato','legale',
        'адвокат','юридический','法律','弁護士','律师',
    ],
    'Education': [
        'education','university','school','college','academy','training',
        'learning','course','student','teacher','professor','curriculum',
        'éducation','université','école','formation','enseignement',
        'bildung','universität','schule','ausbildung','hochschule',
        'educación','universidad','escuela','educazione','università',
        'образование','университет','教育','大学','学校',
    ],
    'Retail': [
        'shop','store','retail','ecommerce','e-commerce',
        'product','catalog','shopping','order','cart','delivery',
        'boutique','magasin','vente','achat','commerce','produit',
        'geschäft','laden','verkauf','produkt','handel',
        'tienda','compra','venta','negozio','vendita','acquisto',
        'магазин','покупка','товар','店舗','ショップ','商店',
    ],
    'Manufacturing': [
        'manufacturing','factory','production','industrial','machinery',
        'assembly','supply chain','engineering',
        'fabrication','usine','industriel','ingénierie',
        'fertigung','fabrik','herstellung','industrie','produktion',
        'fabricación','fábrica','producción','fabbrica','produzione',
        'производство','завод','製造','工場','制造',
    ],
    'Real Estate': [
        'real estate','property','realty','apartment','housing','rent',
        'lease','building','construction','broker',
        'immobilier','propriété','appartement','logement','location',
        'immobilien','wohnung','miete','grundstück','makler',
        'inmobiliaria','propiedad','vivienda','immobiliare','proprietà',
        'недвижимость','квартира','不動産','物件','房地产',
    ],
    'Hospitality': [
        'hotel','restaurant','tourism','travel','booking','resort',
        'accommodation','hospitality','catering','guest','reservation',
        'hôtel','tourisme','voyage','réservation','hébergement',
        'gastgewerbe','tourismus','reise','buchung','unterkunft',
        'turismo','viaje','reserva','alojamiento','albergo',
        'гостиница','туризм','ホテル','旅行','酒店',
    ],
    'Media': [
        'media','news','publish','press','journalist','magazine',
        'broadcast','editorial','advertising','marketing',
        'médias','presse','journaliste','publicité','rédaction',
        'medien','verlag','werbung','zeitung',
        'medios','prensa','periodismo','publicidad','stampa',
        'СМИ','пресса','メディア','報道','媒体',
    ],
    'Food': [
        'food','beverage','nutrition','organic','recipe','ingredient',
        'bakery','brewery','wine','coffee','frozen','dairy',
        'alimentation','nourriture','boulangerie','vin','brasserie',
        'lebensmittel','nahrung','bäckerei','brauerei','wein',
        'alimentos','comida','panadería','alimentare','cibo',
        'еда','питание','食品','飲料',
    ],
    'Automotive': [
        'automotive','vehicle','automobile','dealer',
        'repair','garage','fleet','electric vehicle',
        'véhicule','voiture','concessionnaire',
        'automobil','fahrzeug','werkstatt','händler',
        'automóvil','vehículo','coche','concesionario',
        'автомобиль','транспорт','自動車','車','汽车',
    ],
    'Energy': [
        'energy','solar','wind','renewable','power','electricity',
        'oil','gas','petroleum','nuclear','sustainable',
        'énergie','solaire','éolien','renouvelable','électricité',
        'energie','erneuerbar','strom','windkraft',
        'energía','renovable','electricidad','energia','rinnovabile',
        'энергия','электричество','エネルギー','太陽光','能源',
    ],
    'Construction': [
        'construction','builder','architect','contractor','renovation',
        'plumbing','electrical','roofing','concrete','structural',
        'bâtiment','architecte','entrepreneur','rénovation',
        'bau','bauunternehmen','architekt','sanierung','renovierung',
        'construcción','constructor','arquitecto','costruzione','edilizia',
        'строительство','архитектор','建設','建築','建筑',
    ],
    'Consulting': [
        'consulting','consultant','advisory','strategy','management',
        'conseil','stratégie','gestion','cabinet',
        'beratung','berater','unternehmensberatung',
        'consultoría','asesoría','consulenza','strategia',
        'консалтинг','консультант','コンサルティング','咨询',
    ],
    'Logistics': [
        'logistics','shipping','freight','transport','warehouse',
        'supply chain','courier','distribution','cargo',
        'logistique','fret','entrepôt','livraison',
        'logistik','spedition','lager','versand','fracht',
        'logística','transporte','almacén','logistica','trasporto',
        'логистика','транспорт','物流','運送',
    ],
    'Agriculture': [
        'agriculture','farm','crop','livestock','harvest','seed',
        'organic farming','irrigation','agri','agronomist',
        'ferme','culture','élevage','récolte',
        'landwirtschaft','bauernhof','ernte','anbau',
        'agricultura','granja','cosecha','agricoltura','fattoria',
        'сельское хозяйство','ферма','農業','農場','农业',
    ],
    'Telecom': [
        'telecom','telecommunications','network','wireless',
        'broadband','fiber','satellite','5g','carrier','isp',
        'télécommunications','réseau','fibre','opérateur',
        'telekommunikation','netzwerk','mobilfunk','breitband',
        'telecomunicaciones','red','telecomunicazioni','rete',
        'телекоммуникации','сеть','通信','テレコム','电信',
    ],
}

def classify_industry(text_lower):
    """Score text against industry keywords."""
    scores = {}
    for industry, keywords in INDUSTRY_KEYWORDS.items():
        count = sum(1 for kw in keywords if kw in text_lower)
        if count > 0:
            scores[industry] = count
    if not scores:
        return "", 0.0
    best = max(scores, key=scores.get)
    total = sum(scores.values())
    return best, round(scores[best] / total, 2) if total > 0 else 0


# ══════════════════════════════════════════════════════════════
# COMPANY SIZE ESTIMATION
# ══════════════════════════════════════════════════════════════

SIZE_PATTERNS = [
    re.compile(r'(\d[\d,\.]*)\s*(?:\+\s*)?(?:employees?|team\s*members?|staff|workers?|people|associates)', re.I),
    re.compile(r'(?:team|staff|workforce)\s+(?:of\s+)?(\d[\d,\.]*)', re.I),
    re.compile(r'(?:over|more\s+than|approximately|about|circa)\s+(\d[\d,\.]*)\s*(?:employees?|people|staff)', re.I),
    re.compile(r'(\d[\d,\.]*)\s*(?:collaborateurs?|salariés?|employés?|personnes)', re.I),
    re.compile(r'(?:effectif|équipe)\s+(?:de\s+)?(\d[\d,\.]*)', re.I),
    re.compile(r'(\d[\d,\.]*)\s*(?:Mitarbeiter(?:innen)?|Beschäftigte|Angestellte)', re.I),
    re.compile(r'(?:über|mehr\s+als|rund|etwa|circa)\s+(\d[\d,\.]*)\s*(?:Mitarbeiter|Beschäftigte)', re.I),
    re.compile(r'(\d[\d,\.]*)\s*(?:empleados?|trabajadores?|colaboradores?)', re.I),
    re.compile(r'(\d[\d,\.]*)\s*(?:dipendenti|collaboratori|lavoratori)', re.I),
    re.compile(r'(\d[\d,\.]*)\s*(?:funcionários|colaboradores|empregados)', re.I),
    re.compile(r'(\d[\d,\.]*)\s*(?:medewerkers?|werknemers?)', re.I),
    re.compile(r'(\d[\d,\.]*)\s*(?:pracowników|osób|zatrudnionych)', re.I),
    re.compile(r'(\d[\d,\.]*)\s*(?:zaměstnanců|pracovníků)', re.I),
    re.compile(r'(\d[\d,\.]*)\s*(?:сотрудников|работников|человек)', re.I),
    re.compile(r'(\d[\d,\.]*)\s*(?:çalışan|personel|kişi)', re.I),
    re.compile(r'(?:従業員|社員|スタッフ)\s*[:：]?\s*(?:約\s*)?(\d[\d,\.]*)\s*(?:名|人)', re.I),
    re.compile(r'(?:员工|雇员|职员)\s*[:：]?\s*(?:约\s*)?(\d[\d,\.]*)\s*(?:人|名|位)?', re.I),
    re.compile(r'(?:직원|종업원)\s*[:：]?\s*(?:약\s*)?(\d[\d,\.]*)\s*(?:명|인)?', re.I),
    re.compile(r'(\d[\d,\.]*)\s*(?:موظف|عامل)', re.I),
    re.compile(r'(\d[\d,\.]*)\s*(?:anställda|medarbetare)', re.I),
    re.compile(r'(\d[\d,\.]*)\s*(?:ansatte|medarbejdere)', re.I),
    re.compile(r'(\d[\d,\.]*)\s*(?:työntekijää|henkilöä)', re.I),
    re.compile(r'(\d[\d,\.]*)\s*(?:angajați|angajati|salariați)', re.I),
    re.compile(r'(\d[\d,\.]*)\s*(?:alkalmazott|munkatárs|dolgozó)', re.I),
    re.compile(r'(?:พนักงาน)\s*(\d[\d,\.]*)\s*(?:คน)?', re.I),
    re.compile(r'(\d[\d,\.]*)\s*(?:nhân viên|người lao động)', re.I),
    re.compile(r'(\d[\d,\.]*)\s*(?:कर्मचारी|कर्मचारियों)', re.I),
    re.compile(r'(\d[\d,\.]*)\s*(?:karyawan|pegawai|pekerja)', re.I),
]

SIZE_KEYWORDS = {
    'micro': ['freelance','freelancer','solopreneur','indépendant','selbstständig',
              'autónomo','libero professionista','zzp','one-man','solo'],
    'startup': ['startup','start-up','early stage','seed','pre-seed',
                'incubator','accelerator','jeune entreprise'],
    'small': ['small business','sme','pme','kmu','pyme','pmi','tpe',
              'klein','pequeña','piccola','petite entreprise','msp'],
    'medium': ['mid-size','midsize','medium','eti','mittelstand',
               'mediana empresa','moyenne entreprise','middelgroot'],
    'large': ['enterprise','corporation','multinational','fortune 500',
              'fortune 1000','global leader','leader mondial','weltmarktführer',
              'large enterprise','grande entreprise','großunternehmen','koncern'],
}

def parse_employee_count(s):
    s = s.replace(',','').replace('.','').replace(' ','')
    try:
        return int(s)
    except ValueError:
        return 0

def estimate_size(text, text_lower):
    """Estimate company size."""
    for pattern in SIZE_PATTERNS:
        m = pattern.search(text)
        if m:
            count = parse_employee_count(m.group(1))
            if 1 <= count <= 500000:
                if count < 10: bucket = 'micro'
                elif count < 50: bucket = 'small'
                elif count < 250: bucket = 'medium'
                elif count < 1000: bucket = 'large'
                else: bucket = 'enterprise'
                return bucket, f"{count} employees"
    for bucket, keywords in SIZE_KEYWORDS.items():
        for kw in keywords:
            if kw in text_lower:
                return bucket, kw
    return '', ''


def get_country_from_domain(domain):
    for tld, cc in COMPOUND_TLDS.items():
        if domain.endswith('.' + tld):
            return cc
    tld = domain.rsplit('.', 1)[-1] if '.' in domain else ''
    return TLD_COUNTRY.get(tld, '')


# ══════════════════════════════════════════════════════════════
# OPTIMIZED WET FILE PROCESSING
# ══════════════════════════════════════════════════════════════

def process_wet_streaming(filepath, output_file):
    """Process WET file using zcat subprocess + @ quick-reject."""
    records = 0
    emails_found = 0

    try:
        proc = subprocess.Popen(
            ['zcat', filepath],
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            bufsize=1048576
        )

        url = ''
        domain = ''
        content_lines = []
        in_content = False
        page_emails = set()

        for raw_line in proc.stdout:
            line = raw_line.decode('utf-8', errors='replace').rstrip('\r\n')

            if line.startswith('WARC/1.'):
                if url and page_emails:
                    text = '\n'.join(content_lines)
                    text_lower = text.lower()
                    address, addr_country = extract_address(text, text_lower)
                    industry, ind_score = classify_industry(text_lower)
                    size_bucket, size_signal = estimate_size(text, text_lower)
                    country = addr_country or get_country_from_domain(domain)

                    for em in page_emails:
                        em_domain = em.split('@')[1] if '@' in em else domain
                        output_file.write(json.dumps({
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
                        }, ensure_ascii=False) + '\n')
                        emails_found += 1

                records += 1
                url = ''
                domain = ''
                content_lines = []
                in_content = False
                page_emails = set()
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
                if '@' in line:
                    page_emails.update(extract_emails_from_line(line))
                content_lines.append(line)

        # Process last record
        if url and page_emails:
            text = '\n'.join(content_lines)
            text_lower = text.lower()
            address, addr_country = extract_address(text, text_lower)
            industry, ind_score = classify_industry(text_lower)
            size_bucket, size_signal = estimate_size(text, text_lower)
            country = addr_country or get_country_from_domain(domain)

            for em in page_emails:
                em_domain = em.split('@')[1] if '@' in em else domain
                output_file.write(json.dumps({
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
                }, ensure_ascii=False) + '\n')
                emails_found += 1

        proc.wait()

    except Exception as e:
        print(f"  [ERROR] {filepath}: {e}", file=sys.stderr)

    return records, emails_found


# ══════════════════════════════════════════════════════════════
# DOWNLOAD PIPELINE (background thread)
# ══════════════════════════════════════════════════════════════

def download_worker(files, worker_id, dl_queue):
    """Background thread: downloads files ahead of processing."""
    for wet_path in files:
        filename = os.path.basename(wet_path)
        tmp_path = f"/tmp/w{worker_id}_{filename}"
        try:
            ret = subprocess.run(
                ['wget', '-q', '-O', tmp_path, f'{CC_BASE}/{wet_path}'],
                timeout=WGET_TIMEOUT, capture_output=True
            )
            dl_queue.put((wet_path, tmp_path, ret.returncode == 0))
        except subprocess.TimeoutExpired:
            # Clean up partial download
            try: os.remove(tmp_path)
            except: pass
            dl_queue.put((wet_path, tmp_path, False))
        except Exception:
            dl_queue.put((wet_path, tmp_path, False))
    dl_queue.put(None)  # Sentinel


# ══════════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════════

def main():
    worker_id = int(sys.argv[1]) if len(sys.argv) > 1 else 0
    num_workers = int(sys.argv[2]) if len(sys.argv) > 2 else 4

    if not os.path.exists(WET_LIST):
        print(f"[Worker {worker_id}] ERROR: {WET_LIST} not found", file=sys.stderr)
        sys.exit(1)

    with open(WET_LIST) as f:
        all_files = [l.strip() for l in f if l.strip()]

    # Split files: this worker handles every Nth file
    my_files = [fpath for i, fpath in enumerate(all_files) if i % num_workers == worker_id]
    total = len(my_files)

    # Worker-specific output file
    output_path = f"{OUTPUT_BASE}_w{worker_id}.ndjson"

    # Resume support
    done_set = set()
    if os.path.exists(PROGRESS):
        try:
            with open(PROGRESS) as f:
                done_set = set(l.strip() for l in f if l.strip())
        except:
            pass

    remaining = [fpath for fpath in my_files if fpath not in done_set]
    done = total - len(remaining)

    print(f"[Worker {worker_id}/{num_workers}] {total} files, {done} done, {len(remaining)} remaining")
    print(f"[Worker {worker_id}] Output: {output_path}")

    if not remaining:
        print(f"[Worker {worker_id}] Nothing to do!")
        return

    # Start pipeline download thread
    dl_queue = queue.Queue(maxsize=DL_QUEUE_SIZE)
    dl_thread = threading.Thread(target=download_worker, args=(remaining, worker_id, dl_queue), daemon=True)
    dl_thread.start()

    output_file = open(output_path, 'a', encoding='utf-8')

    processed = 0
    total_emails = 0       # v4: counter instead of line counting
    unflushed = 0

    while True:
        item = dl_queue.get()
        if item is None:
            break

        wet_path, tmp_path, ok = item
        done += 1
        processed += 1

        if not ok:
            print(f"[Worker {worker_id}] [{done}/{total}] Download failed, skipping")
            with open(PROGRESS, 'a') as pf:
                pf.write(wet_path + '\n')
            try:
                os.remove(tmp_path)
            except:
                pass
            continue

        filename = os.path.basename(wet_path)
        records, emails = process_wet_streaming(tmp_path, output_file)
        total_emails += emails
        unflushed += emails

        # Flush periodically
        if unflushed >= FLUSH_EVERY:
            output_file.flush()
            unflushed = 0

        # Cleanup downloaded file
        try:
            os.remove(tmp_path)
        except:
            pass

        # Mark done (atomic append)
        with open(PROGRESS, 'a') as pf:
            pf.write(wet_path + '\n')

        # Progress log every 5 files
        if processed % 5 == 0:
            try:
                disk = subprocess.run(['df', '-h', '/'], capture_output=True, text=True).stdout.split('\n')
                disk_usage = disk[1].split()[4] if len(disk) > 1 else '?'
            except:
                disk_usage = '?'
            print(f"  [Worker {worker_id}] Progress: {done}/{total} | {total_emails} emails | Disk: {disk_usage}")
        else:
            print(f"[Worker {worker_id}] [{done}/{total}] {filename} → {emails} emails")

    output_file.flush()
    output_file.close()
    dl_thread.join(timeout=10)

    print(f"[Worker {worker_id}] DONE: {done}/{total} files, {total_emails} total emails")


if __name__ == '__main__':
    main()
