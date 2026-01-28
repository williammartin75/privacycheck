const fs = require('fs');
const path = require('path');

const INPUT_FILE = 'C:\\Users\\willi\\OneDrive\\Bureau\\Mails\\Domain Verified\\EMAILS_ALL_COMBINED.txt';
const OUTPUT_DIR = 'C:\\Users\\willi\\OneDrive\\Bureau\\Mails\\Domain Verified\\By_Domain';

console.log('=== Tri des emails par domaine ===\n');

// Créer le dossier de sortie
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Lire les emails
console.log('Lecture des emails...');
const content = fs.readFileSync(INPUT_FILE, 'utf-8');
const emails = content.replace(/\r/g, '').split('\n').filter(e => e.trim());

console.log(`${emails.length} emails à traiter\n`);

// Grouper par domaine
const byDomain = new Map();

for (const email of emails) {
    const parts = email.split('@');
    if (parts.length !== 2) continue;

    const domain = parts[1].toLowerCase();

    if (!byDomain.has(domain)) {
        byDomain.set(domain, []);
    }
    byDomain.get(domain).push(email);
}

console.log(`${byDomain.size} domaines uniques\n`);

// Créer un fichier CSV avec tous les domaines et leurs emails
console.log('Création du fichier sorted_by_domain.txt...');

const sortedDomains = [...byDomain.entries()].sort((a, b) => b[1].length - a[1].length);

const output = [];
for (const [domain, domainEmails] of sortedDomains) {
    for (const email of domainEmails) {
        output.push(`${domain}\t${email}`);
    }
}

fs.writeFileSync(path.join(OUTPUT_DIR, 'sorted_by_domain.txt'), output.join('\n'));

// Stats
console.log('\n=== TOP 20 domaines ===');
for (let i = 0; i < 20 && i < sortedDomains.length; i++) {
    const [domain, domainEmails] = sortedDomains[i];
    console.log(`${(i + 1).toString().padStart(2)}. ${domain}: ${domainEmails.length} emails`);
}

console.log(`\n✅ Fichier créé: ${path.join(OUTPUT_DIR, 'sorted_by_domain.txt')}`);
console.log(`Format: DOMAINE<TAB>EMAIL`);
