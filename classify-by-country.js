const fs = require('fs');
const path = require('path');

const INPUT_FILE = 'C:\\Users\\willi\\OneDrive\\Bureau\\Mails\\Domain Verified\\EMAILS_ALL_COMBINED.txt';
const OUTPUT_DIR = 'C:\\Users\\willi\\OneDrive\\Bureau\\Mails\\Domain Verified\\By_Country';

// Mapping TLD vers pays/langue
const TLD_MAP = {
    // Europe francophone
    'fr': { country: 'France', lang: 'fr', folder: 'FR_French' },
    'be': { country: 'Belgium', lang: 'fr', folder: 'BE_French' },
    'ch': { country: 'Switzerland', lang: 'fr', folder: 'CH_French' },
    'lu': { country: 'Luxembourg', lang: 'fr', folder: 'LU_French' },
    'mc': { country: 'Monaco', lang: 'fr', folder: 'MC_French' },

    // Europe germanophone
    'de': { country: 'Germany', lang: 'de', folder: 'DE_German' },
    'at': { country: 'Austria', lang: 'de', folder: 'AT_German' },

    // Europe hispanophone
    'es': { country: 'Spain', lang: 'es', folder: 'ES_Spanish' },

    // Europe italophone
    'it': { country: 'Italy', lang: 'it', folder: 'IT_Italian' },

    // Europe anglophone
    'uk': { country: 'UK', lang: 'en', folder: 'UK_English' },
    'ie': { country: 'Ireland', lang: 'en', folder: 'IE_English' },

    // Nordiques
    'nl': { country: 'Netherlands', lang: 'nl', folder: 'NL_Dutch' },
    'se': { country: 'Sweden', lang: 'sv', folder: 'SE_Swedish' },
    'dk': { country: 'Denmark', lang: 'da', folder: 'DK_Danish' },
    'no': { country: 'Norway', lang: 'no', folder: 'NO_Norwegian' },
    'fi': { country: 'Finland', lang: 'fi', folder: 'FI_Finnish' },

    // Europe de l'Est
    'pl': { country: 'Poland', lang: 'pl', folder: 'PL_Polish' },
    'cz': { country: 'Czech', lang: 'cs', folder: 'CZ_Czech' },
    'hu': { country: 'Hungary', lang: 'hu', folder: 'HU_Hungarian' },
    'ro': { country: 'Romania', lang: 'ro', folder: 'RO_Romanian' },
    'bg': { country: 'Bulgaria', lang: 'bg', folder: 'BG_Bulgarian' },
    'gr': { country: 'Greece', lang: 'el', folder: 'GR_Greek' },
    'pt': { country: 'Portugal', lang: 'pt', folder: 'PT_Portuguese' },
    'ru': { country: 'Russia', lang: 'ru', folder: 'RU_Russian' },

    // Amériques
    'us': { country: 'USA', lang: 'en', folder: 'US_English' },
    'ca': { country: 'Canada', lang: 'en', folder: 'CA_English' },
    'mx': { country: 'Mexico', lang: 'es', folder: 'MX_Spanish' },
    'br': { country: 'Brazil', lang: 'pt', folder: 'BR_Portuguese' },
    'ar': { country: 'Argentina', lang: 'es', folder: 'AR_Spanish' },

    // Asie
    'jp': { country: 'Japan', lang: 'ja', folder: 'JP_Japanese' },
    'cn': { country: 'China', lang: 'zh', folder: 'CN_Chinese' },
    'kr': { country: 'Korea', lang: 'ko', folder: 'KR_Korean' },
    'in': { country: 'India', lang: 'en', folder: 'IN_English' },
    'au': { country: 'Australia', lang: 'en', folder: 'AU_English' },
    'nz': { country: 'New Zealand', lang: 'en', folder: 'NZ_English' },

    // Génériques (anglais par défaut)
    'com': { country: 'International', lang: 'en', folder: 'COM_International' },
    'net': { country: 'International', lang: 'en', folder: 'NET_International' },
    'org': { country: 'International', lang: 'en', folder: 'ORG_International' },
    'io': { country: 'Tech', lang: 'en', folder: 'IO_Tech' },
    'co': { country: 'International', lang: 'en', folder: 'CO_International' },
    'info': { country: 'International', lang: 'en', folder: 'INFO_International' },
    'biz': { country: 'International', lang: 'en', folder: 'BIZ_International' },
    'eu': { country: 'Europe', lang: 'en', folder: 'EU_Europe' },
};

console.log('=== Classification par pays/TLD ===\n');

// Créer le dossier de sortie
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Lire les emails
console.log('Lecture des emails...');
const content = fs.readFileSync(INPUT_FILE, 'utf-8');
const emails = content.replace(/\r/g, '').split('\n').filter(e => e.trim() && e.includes('@'));

console.log(`${emails.length} emails à traiter\n`);

// Grouper par TLD
const byTLD = new Map();
const stats = { total: 0, classified: 0 };

for (const email of emails) {
    stats.total++;
    const domain = email.split('@')[1];
    if (!domain) continue;

    const parts = domain.toLowerCase().split('.');
    const tld = parts[parts.length - 1];

    if (!byTLD.has(tld)) {
        byTLD.set(tld, []);
    }
    byTLD.get(tld).push(email);
}

// Sauvegarder par groupe de langue
const byLang = new Map();

for (const [tld, tldEmails] of byTLD.entries()) {
    const info = TLD_MAP[tld] || { country: 'Other', lang: 'other', folder: 'OTHER_Unknown' };

    if (!byLang.has(info.folder)) {
        byLang.set(info.folder, []);
    }
    // Use concat for large arrays instead of spread to avoid stack overflow
    const existing = byLang.get(info.folder);
    for (const email of tldEmails) {
        existing.push(email);
    }
    stats.classified += tldEmails.length;
}

// Écrire les fichiers
console.log('Création des fichiers par pays...\n');

const sortedLangs = [...byLang.entries()].sort((a, b) => b[1].length - a[1].length);

for (const [folder, langEmails] of sortedLangs) {
    const filePath = path.join(OUTPUT_DIR, `${folder}.txt`);
    fs.writeFileSync(filePath, langEmails.join('\n'));
    console.log(`${folder}: ${langEmails.length.toLocaleString()} emails`);
}

// Résumé par langue
console.log('\n=== Résumé par langue ===');
const langStats = new Map();
for (const [folder, langEmails] of sortedLangs) {
    const lang = folder.split('_')[1] || 'Unknown';
    if (!langStats.has(lang)) langStats.set(lang, 0);
    langStats.set(lang, langStats.get(lang) + langEmails.length);
}

const sortedLangStats = [...langStats.entries()].sort((a, b) => b[1] - a[1]);
for (const [lang, count] of sortedLangStats.slice(0, 10)) {
    console.log(`${lang}: ${count.toLocaleString()} emails`);
}

console.log(`\n✅ Fichiers créés dans: ${OUTPUT_DIR}`);
