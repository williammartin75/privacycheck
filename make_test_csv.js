const fs = require('fs');
const readline = require('readline');

const NDJSON = 'C:\\Users\\willi\\OneDrive\\Bureau\\Mails\\All unique mails\\Professional mails\\URLS\\Cleaned Chunks analysis\\Domains with issues\\Emails to contact\\By languages\\Real emails\\Turkish.ndjson';
const OUT = 'C:\\Users\\willi\\OneDrive\\Bureau\\Mails\\All unique mails\\Professional mails\\URLS\\Cleaned Chunks analysis\\Domains with issues\\Emails to contact\\By languages\\Real emails\\CSV_for_Ditlead\\test_30_contacts.csv';

async function main() {
    const rl = readline.createInterface({ input: fs.createReadStream(NDJSON) });
    const rows = [];
    let header = null;
    let count = 0;

    for await (const line of rl) {
        if (count >= 30) break;
        try {
            const r = JSON.parse(line);
            if (!header) {
                header = 'email,domain,subject,body,score';
                rows.push(header);
            }
            // Escape CSV fields properly
            const esc = (v) => {
                const s = String(v || '');
                if (s.includes(',') || s.includes('"') || s.includes('\n')) {
                    return '"' + s.replace(/"/g, '""') + '"';
                }
                return s;
            };
            rows.push([
                esc(r.email),
                esc(r.domain),
                esc(r.subject),
                esc(r.body),
                esc(r.score)
            ].join(','));
            count++;
        } catch (e) { }
    }

    fs.writeFileSync(OUT, rows.join('\n') + '\n');
    console.log(`Created ${OUT}`);
    console.log(`${count} contacts written`);
}

main().catch(console.error);
