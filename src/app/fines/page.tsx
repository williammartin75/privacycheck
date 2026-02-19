import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Fines Database by Jurisdiction | GDPR, CCPA, LGPD Penalties — PrivacyChecker',
    description: 'Explore the largest privacy fines worldwide. €7.1B+ in GDPR fines, CCPA penalties, UK ICO enforcement, and more. Real enforcement data from 20+ jurisdictions to help you understand the cost of non-compliance.',
    keywords: [
        'GDPR fines', 'CCPA penalties', 'privacy fines database', 'data protection fines',
        'GDPR enforcement', 'CNIL fines', 'ICO fines', 'DPC fines', 'privacy violations',
        'LGPD fines', 'PIPEDA fines', 'KVKK fines', 'PDPA fines', 'PIPA fines',
        'data breach penalties', 'cookie consent fines', 'privacy compliance cost'
    ],
    openGraph: {
        title: 'Privacy Fines Database — €7.1B+ in Enforcement Actions Worldwide',
        description: 'Track the biggest privacy fines across 20+ jurisdictions. GDPR, CCPA, LGPD, and more.',
        url: 'https://privacychecker.pro/fines',
        siteName: 'PrivacyChecker',
        type: 'website',
    },
    alternates: {
        canonical: 'https://privacychecker.pro/fines',
    },
};

/* ──────────────────────────────────────────────
   Fines data by jurisdiction
   ────────────────────────────────────────────── */

interface Fine {
    company: string;
    amount: string;
    amountNum: number; // for sorting
    violation: string;
    year: string;
    details: string;
}

interface Jurisdiction {
    id: string;
    name: string;
    region: string;
    flag: string; // 2-letter country / region label
    regulation: string;
    authority: string;
    maxPenalty: string;
    fines: Fine[];
}

const jurisdictions: Jurisdiction[] = [
    /* ═══════ EUROPE ═══════ */
    {
        id: 'ireland',
        name: 'Ireland',
        region: 'Europe',
        flag: 'IE',
        regulation: 'GDPR',
        authority: 'Data Protection Commission (DPC)',
        maxPenalty: '€20M or 4% of global annual turnover',
        fines: [
            { company: 'TikTok', amount: '€530M', amountNum: 530000000, violation: 'Unlawful data transfers to China', year: '2025', details: 'Failed to ensure adequate protection for EU user data transferred to China and lacked transparency about data processing practices.' },
            { company: 'Meta (Facebook)', amount: '€1.2B', amountNum: 1200000000, violation: 'Unlawful EU-US data transfers', year: '2023', details: 'Transferred EU user data to the US without adequate safeguards post-Schrems II ruling. Largest GDPR fine ever issued.' },
            { company: 'Meta (Instagram)', amount: '€405M', amountNum: 405000000, violation: "Children's data processing", year: '2023', details: "Made children's accounts public by default and exposed phone numbers and email addresses of minors aged 13–17." },
            { company: 'LinkedIn', amount: '€310M', amountNum: 310000000, violation: 'Unlawful advertising data processing', year: '2024', details: 'Processed personal data for behavioral advertising without a valid legal basis, violating consent and legitimate interest principles.' },
            { company: 'Meta (Facebook)', amount: '€251M', amountNum: 251000000, violation: 'Data breach — 29M accounts', year: '2024', details: 'A 2018 data breach exposed personal data of 29 million accounts due to insufficient technical and organizational security measures.' },
            { company: 'WhatsApp', amount: '€225M', amountNum: 225000000, violation: 'Transparency failures', year: '2021', details: 'Failed to provide clear and transparent information to users about how their personal data was being shared with Meta companies.' },
            { company: 'TikTok', amount: '€345M', amountNum: 345000000, violation: "Children's privacy violations", year: '2023', details: "Default public settings for children's accounts and enabled direct messaging to minors without adequate age verification." },
        ],
    },
    {
        id: 'france',
        name: 'France',
        region: 'Europe',
        flag: 'FR',
        regulation: 'GDPR',
        authority: 'CNIL (Commission Nationale de l\'Informatique et des Libertés)',
        maxPenalty: '€20M or 4% of global annual turnover',
        fines: [
            { company: 'Google LLC', amount: '€150M', amountNum: 150000000, violation: 'Cookie consent violations', year: '2022', details: 'Google.fr and YouTube.com made it difficult for users to refuse cookies — "Accept All" was one click but refusing required multiple steps.' },
            { company: 'Microsoft Ireland', amount: '€60M', amountNum: 60000000, violation: 'Advertising cookies without consent', year: '2022', details: 'Bing deposited advertising cookies on users\' devices without prior consent and lacked a clear rejection mechanism.' },
            { company: 'Criteo', amount: '€40M', amountNum: 40000000, violation: 'Tracking without valid consent', year: '2024', details: 'Ad-tech company tracked users across millions of websites without obtaining valid, prior consent as required by the ePrivacy Directive.' },
            { company: 'Amazon France', amount: '€35M', amountNum: 35000000, violation: 'Cookie deposit without consent', year: '2020', details: 'Deposited advertising cookies on users\' computers without prior consent or adequate information about cookie purposes.' },
            { company: 'Google LLC', amount: '€100M', amountNum: 100000000, violation: 'Cookie deposit without consent', year: '2020', details: 'Placed advertising cookies on google.fr without adequate prior information or consent, violating the French Data Protection Act.' },
            { company: 'Clearview AI', amount: '€20M', amountNum: 20000000, violation: 'Biometric data collection without basis', year: '2022', details: 'Scraped billions of facial images from the internet without any legal basis, creating a biometric database without individuals\' knowledge or consent.' },
        ],
    },
    {
        id: 'germany',
        name: 'Germany',
        region: 'Europe',
        flag: 'DE',
        regulation: 'GDPR',
        authority: '16 State DPAs + BfDI (Federal)',
        maxPenalty: '€20M or 4% of global annual turnover',
        fines: [
            { company: 'Vodafone GmbH', amount: '€45M', amountNum: 45000000, violation: 'General data processing violations', year: '2025', details: 'Non-compliance with general data processing principles under GDPR, including insufficient measures for lawful processing of customer data.' },
            { company: 'H\u0026M', amount: '€35.3M', amountNum: 35300000, violation: 'Employee surveillance', year: '2020', details: 'Systematically surveilled employees at its Nuremberg service center by recording detailed private information about health, religion, and family during return-to-work meetings.' },
            { company: 'Deutsche Wohnen', amount: '€14.5M', amountNum: 14500000, violation: 'Excessive data retention', year: '2024', details: 'Real estate company stored tenant personal data indefinitely without any data retention policy, keeping old financial records, personal IDs, and employment contracts.' },
            { company: '1\u00261 Telecom', amount: '€9.55M', amountNum: 9550000, violation: 'Insufficient authentication', year: '2019', details: 'Customer service agents could access customer accounts using only a name and date of birth — no additional identity verification was required.' },
        ],
    },
    {
        id: 'netherlands',
        name: 'Netherlands',
        region: 'Europe',
        flag: 'NL',
        regulation: 'GDPR',
        authority: 'Autoriteit Persoonsgegevens (AP)',
        maxPenalty: '€20M or 4% of global annual turnover',
        fines: [
            { company: 'Uber', amount: '€290M', amountNum: 290000000, violation: 'Improper EU-US data transfers', year: '2024', details: 'Transferred EU driver personal data to the US headquarters without adequate safeguards (Standard Contractual Clauses or DPF).' },
            { company: 'Clearview AI', amount: '€30.5M', amountNum: 30500000, violation: 'Unlawful facial recognition database', year: '2024', details: 'Built a facial recognition database by scraping billions of images from the internet without consent, legal basis, or transparency.' },
            { company: 'Netflix', amount: '€4.75M', amountNum: 4750000, violation: 'Inadequate privacy notices', year: '2024', details: 'Failed to adequately inform customers about what personal data was collected and how it was used between 2018 and 2020.' },
            { company: 'Uber', amount: '€10M', amountNum: 10000000, violation: 'Transparency on data transfers', year: '2025', details: 'Insufficient transparency about third-country data transfers and data retention periods communicated to drivers.' },
        ],
    },
    {
        id: 'luxembourg',
        name: 'Luxembourg',
        region: 'Europe',
        flag: 'LU',
        regulation: 'GDPR',
        authority: 'CNPD (Commission Nationale pour la Protection des Données)',
        maxPenalty: '€20M or 4% of global annual turnover',
        fines: [
            { company: 'Amazon Europe', amount: '€746M', amountNum: 746000000, violation: 'Advertising targeting without consent', year: '2021', details: "Amazon's behavioral advertising system processed personal data for targeted ads without obtaining valid consent from users. Legal challenge lost in 2025." },
        ],
    },
    {
        id: 'italy',
        name: 'Italy',
        region: 'Europe',
        flag: 'IT',
        regulation: 'GDPR',
        authority: 'Garante per la protezione dei dati personali',
        maxPenalty: '€20M or 4% of global annual turnover',
        fines: [
            { company: 'OpenAI', amount: '€15M', amountNum: 15000000, violation: 'AI training without legal basis', year: '2024', details: 'Processed personal data to train ChatGPT without a valid legal basis and failed to report a data breach within the 72-hour notification window.' },
            { company: 'Clearview AI', amount: '€20M', amountNum: 20000000, violation: 'Biometric data processing', year: '2022', details: 'Operated an unlawful biometric surveillance system by scraping facial images of Italian residents without consent or legal basis.' },
            { company: 'Enel Energia', amount: '€26.5M', amountNum: 26500000, violation: 'Unsolicited telemarketing', year: '2021', details: 'Made millions of unsolicited telemarketing calls using data obtained from unauthorized lists, contacting people on the do-not-call registry.' },
            { company: 'TIM (Telecom Italia)', amount: '€27.8M', amountNum: 27800000, violation: 'Aggressive telemarketing', year: '2020', details: 'Systematic telemarketing violations including making calls without consent, ignoring opt-out requests, and mishandling personal data across call centers.' },
        ],
    },
    {
        id: 'spain',
        name: 'Spain',
        region: 'Europe',
        flag: 'ES',
        regulation: 'GDPR',
        authority: 'AEPD (Agencia Española de Protección de Datos)',
        maxPenalty: '€20M or 4% of global annual turnover',
        fines: [
            { company: 'CaixaBank', amount: '€6.2M', amountNum: 6200000, violation: 'Unlawful customer data processing', year: '2021', details: 'Processed customer data for marketing purposes without valid consent and failed to adequately document processing activities.' },
            { company: 'Vodafone España', amount: '€8.15M', amountNum: 8150000, violation: 'Unsolicited communications', year: '2021', details: 'Sent marketing communications to users who had opted out and processed personal data for telemarketing without adequate consent mechanisms.' },
            { company: 'La Liga (football)', amount: '€250K', amountNum: 250000, violation: 'Surveillance via mobile app', year: '2021', details: 'Used the official La Liga app to activate microphones and GPS on users\' phones to detect unauthorized broadcasts of football matches.' },
            { company: 'EDP Energía', amount: '€1.5M', amountNum: 1500000, violation: 'Lack of consent for processing', year: '2023', details: 'Processed customer personal data for marketing and profiling without obtaining proper consent, affecting a large customer base.' },
        ],
    },
    {
        id: 'sweden',
        name: 'Sweden',
        region: 'Europe',
        flag: 'SE',
        regulation: 'GDPR',
        authority: 'IMY (Integritetsskyddsmyndigheten)',
        maxPenalty: '€20M or 4% of global annual turnover',
        fines: [
            { company: 'Apoteket AB (pharmacy)', amount: '€3.5M', amountNum: 3500000, violation: 'Meta Pixel data leak', year: '2024', details: 'Transferred sensitive health-related personal data to Meta via the Meta Pixel advertising tracker installed on their e-commerce website.' },
            { company: 'Spotify AB', amount: '€3.5M', amountNum: 3500000, violation: 'Right of access violation', year: '2024', details: 'Failed to provide users with sufficiently clear information about how their personal data was processed in response to access requests.' },
            { company: 'Apohem AB (pharmacy)', amount: '€800K', amountNum: 800000, violation: 'Meta Pixel health data transfer', year: '2024', details: 'Pharmacy chain transferred sensitive customer health data to Meta through advertising pixel, revealing purchases of medical products.' },
        ],
    },
    {
        id: 'greece',
        name: 'Greece',
        region: 'Europe',
        flag: 'GR',
        regulation: 'GDPR',
        authority: 'HDPA (Hellenic Data Protection Authority)',
        maxPenalty: '€20M or 4% of global annual turnover',
        fines: [
            { company: 'Hellenic Post (ELTA)', amount: '€2.9M', amountNum: 2900000, violation: 'Data breach — dark web exposure', year: '2024', details: 'Inadequate technical and organizational security measures led to a data breach that exposed customer personal data on the dark web.' },
            { company: 'Ministry of Interior + MEP', amount: '€440K', amountNum: 440000, violation: 'Unsolicited political communication', year: '2024', details: 'Personal data leaked and used for unsolicited political messages in election campaigns without citizen consent.' },
            { company: 'Ministry of Migration', amount: '€175K', amountNum: 175000, violation: 'AI surveillance without safeguards', year: '2024', details: 'Deployed AI-powered surveillance in refugee camps without proper data protection impact assessments or data retention policies.' },
        ],
    },
    {
        id: 'finland',
        name: 'Finland',
        region: 'Europe',
        flag: 'FI',
        regulation: 'GDPR',
        authority: 'Data Protection Ombudsman',
        maxPenalty: '€20M or 4% of global annual turnover',
        fines: [
            { company: 'Posti (postal service)', amount: '€2.4M', amountNum: 2400000, violation: 'Unlawful automatic mailbox creation', year: '2024', details: 'Automatically created electronic mailboxes for citizens without consent, processing personal data unlawfully.' },
            { company: 'Verkkokauppa.com', amount: '€856K', amountNum: 856000, violation: 'No data retention limits', year: '2024', details: 'Failed to define data retention periods and forced customers to create mandatory accounts for online purchases — went beyond what is necessary.' },
        ],
    },
    {
        id: 'belgium',
        name: 'Belgium',
        region: 'Europe',
        flag: 'BE',
        regulation: 'GDPR',
        authority: 'APD (Autorité de protection des données)',
        maxPenalty: '€20M or 4% of global annual turnover',
        fines: [
            { company: 'Unnamed hospital', amount: '€200K', amountNum: 200000, violation: 'Cybersecurity failure — 300K records', year: '2024', details: 'Insufficient cybersecurity protections led to a cyberattack that compromised the personal data of 300,000 patients.' },
            { company: 'RTL Belgium', amount: '€40K/day', amountNum: 40000, violation: 'Non-compliant cookie banner', year: '2024', details: 'Cookie banner lacked a "Reject All" button and used misleading design with color contrasts steering users toward acceptance.' },
            { company: 'Freedelity', amount: '€5K/day', amountNum: 5000, violation: 'Consent and data minimization failures', year: '2025', details: 'Violated consent mechanisms, data minimization principles, and retained customer data excessively beyond the purpose of collection.' },
        ],
    },
    {
        id: 'poland',
        name: 'Poland',
        region: 'Europe',
        flag: 'PL',
        regulation: 'GDPR',
        authority: 'UODO (Urząd Ochrony Danych Osobowych)',
        maxPenalty: '€20M or 4% of global annual turnover',
        fines: [
            { company: 'Santander Bank Polska', amount: '€335K', amountNum: 335000, violation: 'Failure to notify data breach', year: '2024', details: 'Lost bank documents containing personal data and failed to notify affected individuals about the data breach as required.' },
            { company: 'Polish bank (unnamed)', amount: '€928K', amountNum: 928000, violation: 'Failure to inform breach victims', year: '2024', details: 'Did not inform individuals whose data was compromised in a breach, violating the GDPR notification obligation.' },
            { company: 'Toyota Bank Polska', amount: '€132K', amountNum: 132000, violation: 'DPO independence issues', year: '2024', details: 'Data Protection Officer was not positioned to operate independently and the bank failed to adequately document its profiling activities.' },
        ],
    },
    {
        id: 'denmark',
        name: 'Denmark',
        region: 'Europe',
        flag: 'DK',
        regulation: 'GDPR',
        authority: 'Datatilsynet',
        maxPenalty: '€20M or 4% of global annual turnover (court-issued)',
        fines: [
            { company: 'Netcompany Group', amount: '€2.2M', amountNum: 2200000, violation: 'Digital mail service security failures', year: '2024', details: 'Security vulnerabilities in a digital mail service exposed personal data of citizens, referred to police for prosecution.' },
            { company: 'OiSTER Telecom', amount: '€100K', amountNum: 100000, violation: 'Data breach — 247K customers', year: '2025', details: 'Data breach affected 246,748 customers\' personal data. Reported to police with a recommended fine of DKK 750,000.' },
        ],
    },
    {
        id: 'norway',
        name: 'Norway',
        region: 'Europe',
        flag: 'NO',
        regulation: 'GDPR (via EEA)',
        authority: 'Datatilsynet',
        maxPenalty: '€20M or 4% of global annual turnover',
        fines: [
            { company: 'Telenor ASA', amount: '€380K', amountNum: 380000, violation: 'Organizational GDPR failures', year: '2025', details: 'Issues with Records of Processing Activities (RoPA) and failure to ensure Data Protection Officer (DPO) independence as required.' },
            { company: 'Grindr LLC', amount: '€6.3M', amountNum: 6300000, violation: 'Sharing sensitive data without consent', year: '2021', details: 'Shared users\' GPS location, device identifiers, and sexual orientation data with advertising partners without valid legal consent.' },
        ],
    },
    {
        id: 'austria',
        name: 'Austria',
        region: 'Europe',
        flag: 'AT',
        regulation: 'GDPR',
        authority: 'DSB (Datenschutzbehörde)',
        maxPenalty: '€20M or 4% of global annual turnover',
        fines: [
            { company: 'Austrian Post', amount: '€9.5M', amountNum: 9500000, violation: 'Failure to fulfill data subject rights', year: '2021', details: 'Created profiles on political preferences of Austrian citizens and sold this data to political parties without adequate consent.' },
            { company: 'Media company (unnamed)', amount: '€15.2K', amountNum: 15200, violation: 'Failure to cooperate with DPA', year: '2024', details: 'Refused to cooperate with the data protection authority during an investigation, obstructing regulatory enforcement.' },
        ],
    },
    {
        id: 'portugal',
        name: 'Portugal',
        region: 'Europe',
        flag: 'PT',
        regulation: 'GDPR',
        authority: 'CNPD (Comissão Nacional de Proteção de Dados)',
        maxPenalty: '€20M or 4% of global annual turnover',
        fines: [
            { company: 'Instituto Nacional de Estatística', amount: '€4.3M', amountNum: 4300000, violation: 'Unlawful international data transfers', year: '2022', details: 'Census data was transferred to the US via Cloudflare without adequate safeguards and no data protection impact assessment was conducted.' },
        ],
    },
    /* ═══════ UNITED KINGDOM ═══════ */
    {
        id: 'uk',
        name: 'United Kingdom',
        region: 'United Kingdom',
        flag: 'GB',
        regulation: 'UK GDPR',
        authority: 'ICO (Information Commissioner\'s Office)',
        maxPenalty: '£17.5M or 4% of global annual turnover',
        fines: [
            { company: 'Capita Group', amount: '£14M', amountNum: 14000000, violation: 'Cybersecurity failure — 6.6M records', year: '2025', details: 'Failed to secure personal data of 6.6 million individuals including sensitive information after a cyber-attack. Originally proposed at £45M, reduced via early settlement.' },
            { company: 'British Airways', amount: '£20M', amountNum: 20000000, violation: 'Data breach — 400K customers', year: '2020', details: 'Hackers skimmed payment card data from 400,000 customers through the BA website due to poor security measures.' },
            { company: 'Marriott International', amount: '£18.4M', amountNum: 18400000, violation: 'Data breach — 339M records', year: '2020', details: 'Failure to keep personal data secure led to a breach affecting approximately 339 million guest records globally.' },
            { company: 'Advanced Computer Software', amount: '£3.07M', amountNum: 3070000, violation: 'Ransomware attack — NHS disruption', year: '2025', details: 'Inadequate cybersecurity allowed a ransomware attack that compromised 79,404 individuals\' data and disrupted NHS 111 healthcare services.' },
            { company: '23andMe', amount: '£2.31M', amountNum: 2310000, violation: 'Security failure — 155K UK users', year: '2025', details: 'Failed to implement appropriate security measures, leading to a credential-stuffing attack that exposed genetic data of 155,592 UK users.' },
            { company: 'Police Service of NI', amount: '£750K', amountNum: 750000, violation: 'Accidental data leak — 9,483 officers', year: '2024', details: 'Accidentally published a spreadsheet containing the personal details of all 9,483 serving officers and staff.' },
        ],
    },
    /* ═══════ AMERICAS ═══════ */
    {
        id: 'usa-california',
        name: 'USA (California)',
        region: 'Americas',
        flag: 'US',
        regulation: 'CCPA / CPRA',
        authority: 'CPPA + California Attorney General',
        maxPenalty: '$2,663/violation (general) · $7,988/violation (intentional or children)',
        fines: [
            { company: 'Zoom', amount: '$85M', amountNum: 85000000, violation: 'Privacy and security failures', year: '2021', details: 'Misleading security claims, sharing data with Facebook, and security vulnerabilities that enabled "Zoombombing" incidents.' },
            { company: 'Disney', amount: '$2.75M', amountNum: 2750000, violation: 'Opt-out non-compliance', year: '2025', details: 'Failed to honor consumer opt-out requests for data sharing on its streaming platform. Part of a broader 2024 enforcement sweep on streaming services.' },
            { company: 'Healthline Media', amount: '$1.55M', amountNum: 1550000, violation: 'Sensitive health data leakage', year: '2025', details: 'Allowed third-party trackers to collect sensitive user health data without consent and failed to provide a functional opt-out mechanism.' },
            { company: 'Tractor Supply Co.', amount: '$1.35M', amountNum: 1350000, violation: 'HR data privacy violations', year: '2025', details: 'First CCPA fine targeting HR data. Failed to provide privacy rights information to job applicants and had a broken opt-out mechanism.' },
            { company: 'American Honda', amount: '$632K', amountNum: 632000, violation: 'Excessive verification for rights requests', year: '2025', details: 'Required excessive personal information for consumer verification and shared data with ad tech companies without appropriate contractual safeguards.' },
            { company: 'DoorDash', amount: '$375K', amountNum: 375000, violation: 'Customer data sharing without notice', year: '2023', details: 'Shared customer personal data with third-party marketing companies without informing consumers or providing an opt-out option.' },
            { company: 'Todd Snyder Inc.', amount: '$345K', amountNum: 345000, violation: 'Misconfigured privacy portal', year: '2025', details: 'Privacy portal was misconfigured, delaying opt-out requests. Additionally demanded excessive personal information from consumers making privacy requests.' },
        ],
    },
    {
        id: 'brazil',
        name: 'Brazil',
        region: 'Americas',
        flag: 'BR',
        regulation: 'LGPD (Lei Geral de Proteção de Dados)',
        authority: 'ANPD (Autoridade Nacional de Proteção de Dados)',
        maxPenalty: '2% of revenue in Brazil, capped at R$50M per violation',
        fines: [
            { company: 'Telecom operator (unnamed)', amount: 'R$6.6M', amountNum: 1200000, violation: 'Customer data processing without basis', year: '2024', details: 'Processed customer personal data for commercial purposes without a valid legal basis, affecting millions of subscribers.' },
            { company: 'Telekall Infoservice', amount: 'R$14.4K', amountNum: 2700, violation: 'First-ever LGPD fine', year: '2023', details: 'Microenterprise processed personal data for WhatsApp marketing campaigns without a valid legal basis — the very first LGPD enforcement action.' },
        ],
    },
    {
        id: 'canada',
        name: 'Canada',
        region: 'Americas',
        flag: 'CA',
        regulation: 'PIPEDA',
        authority: 'OPC (Office of the Privacy Commissioner)',
        maxPenalty: 'C$100K per violation (PIPEDA) · C$25M or 5% revenue (proposed CPPA)',
        fines: [
            { company: 'Clearview AI', amount: 'Order to delete data', amountNum: 0, violation: 'Unlawful facial recognition', year: '2021', details: 'Scraped images of Canadians from the internet for facial recognition without consent. Ordered to cease operations and delete all Canadian data.' },
            { company: 'Equifax', amount: 'Compliance agreement', amountNum: 0, violation: 'Data breach — 19K Canadians', year: '2019', details: 'The 2017 data breach exposed personal data of 19,000 Canadians. Investigation found inadequate security safeguards and poor data governance.' },
            { company: 'Tim Hortons', amount: 'Compliance agreement', amountNum: 0, violation: 'Excessive location tracking', year: '2022', details: 'The Tim Hortons app tracked users\' location data every few minutes even when the app was closed, far exceeding what was necessary.' },
        ],
    },
    /* ═══════ ASIA-PACIFIC ═══════ */
    {
        id: 'australia',
        name: 'Australia',
        region: 'Asia-Pacific',
        flag: 'AU',
        regulation: 'Privacy Act 1988',
        authority: 'OAIC (Office of the Australian Information Commissioner)',
        maxPenalty: 'A$50M, 3x benefit, or 30% of adjusted turnover',
        fines: [
            { company: 'Clearview AI', amount: 'Cease operations order', amountNum: 0, violation: 'Facial recognition without consent', year: '2021', details: 'Scraped Australian residents\' facial images from social media without knowledge or consent to build a biometric surveillance database.' },
            { company: 'Australian Information Commissioner v HealthEngine', amount: 'A$1.38M', amountNum: 1380000, violation: 'Misleading health data practices', year: '2023', details: 'Shared patient personal information with insurance brokers, lawyers, and advertisers without proper consent or disclosure.' },
            { company: 'Medibank', amount: 'Ongoing litigation', amountNum: 0, violation: 'Massive data breach — 9.7M records', year: '2023', details: 'A 2022 ransomware attack exposed highly sensitive health data of 9.7 million current and former customers due to inadequate cybersecurity.' },
        ],
    },
    {
        id: 'singapore',
        name: 'Singapore',
        region: 'Asia-Pacific',
        flag: 'SG',
        regulation: 'PDPA (Personal Data Protection Act)',
        authority: 'PDPC (Personal Data Protection Commission)',
        maxPenalty: 'S$1M or 10% of annual turnover in Singapore',
        fines: [
            { company: 'SingHealth', amount: 'S$250K', amountNum: 250000, violation: 'Data breach — 1.5M patients', year: '2019', details: 'Singapore\'s worst data breach. Hackers accessed personal data of 1.5 million patients including PM Lee Hsien Loong\'s prescription data.' },
            { company: 'IHiS (IT vendor)', amount: 'S$750K', amountNum: 750000, violation: 'Inadequate cybersecurity for SingHealth', year: '2019', details: 'As the IT service provider for SingHealth, failed to implement adequate security measures and delayed response to the cyber-attack.' },
            { company: 'Consumers Association of Singapore', amount: 'S$20K', amountNum: 20000, violation: 'Security arrangement failures', year: '2024', details: 'Failed to implement reasonable security arrangements and adequate policies to protect personal data under its care.' },
        ],
    },
    {
        id: 'south-korea',
        name: 'South Korea',
        region: 'Asia-Pacific',
        flag: 'KR',
        regulation: 'PIPA (Personal Information Protection Act)',
        authority: 'PIPC (Personal Information Protection Commission)',
        maxPenalty: '3% of total sales (increasing to 10% for severe violations)',
        fines: [
            { company: 'Meta (Facebook Korea)', amount: '₩6.5B (~€4.5M)', amountNum: 4500000, violation: 'Sharing sensitive data without consent', year: '2022', details: 'Collected and shared sensitive information about 980,000 Korean users (political views, sexual orientation, religion) with advertisers without consent.' },
            { company: 'Google Korea', amount: '₩69.2B (~€48M)', amountNum: 48000000, violation: 'Location data consent violations', year: '2022', details: 'Collected location data from Android users without proper consent and made it difficult for users to opt out of location tracking.' },
            { company: 'Business On Communication', amount: '₩139.7M (~€95K)', amountNum: 95000, violation: 'SQL injection data breach', year: '2025', details: 'Data breach resulting from SQL injection attacks due to insufficient security safeguards. Failed to send timely breach notifications.' },
        ],
    },
    {
        id: 'japan',
        name: 'Japan',
        region: 'Asia-Pacific',
        flag: 'JP',
        regulation: 'APPI (Act on Protection of Personal Information)',
        authority: 'PPC (Personal Information Protection Commission)',
        maxPenalty: 'Administrative guidance; criminal penalties up to ¥100M for corporates. Fines system under review for 2027.',
        fines: [
            { company: 'LINE Corporation', amount: 'Administrative guidance', amountNum: 0, violation: 'Cross-border data handling failures', year: '2021', details: 'Allowed subsidiary in China to access Japanese user data including messages and payment info without proper user notification.' },
            { company: 'NTT Docomo / dpoint', amount: 'Administrative guidance', amountNum: 0, violation: 'Inadequate third-party data controls', year: '2023', details: 'Failed to maintain adequate oversight of third-party contractors who had access to customer personal information.' },
        ],
    },
    {
        id: 'india',
        name: 'India',
        region: 'Asia-Pacific',
        flag: 'IN',
        regulation: 'DPDP Act 2023',
        authority: 'Data Protection Board of India (DPBI)',
        maxPenalty: '₹250 Crore (~€28M) per violation',
        fines: [
            { company: '(Enforcement starting 2027)', amount: 'Framework active', amountNum: 0, violation: 'New regulatory framework', year: '2025', details: 'DPDP Rules notified Nov 2025. Penalties range from ₹50 Crore to ₹250 Crore per violation. Full compliance deadline: May 2027.' },
        ],
    },
    /* ═══════ TURKEY & MIDDLE EAST ═══════ */
    {
        id: 'turkey',
        name: 'Turkey',
        region: 'Middle East',
        flag: 'TR',
        regulation: 'KVKK (Kişisel Verilerin Korunması Kanunu)',
        authority: 'KVKK Board',
        maxPenalty: '₺1.9M per violation (updated annually)',
        fines: [
            { company: 'WhatsApp', amount: '₺1.95M', amountNum: 195000, violation: 'Privacy policy update violations', year: '2021', details: 'Forced users to accept new privacy policy sharing data with Meta companies. Found to violate transparency and informed consent requirements.' },
            { company: 'Meta (Facebook)', amount: '₺1.65M', amountNum: 165000, violation: 'Data breach notification failure', year: '2020', details: 'Failed to notify Turkish authorities about a data breach in a timely manner and inadequate security measures to prevent unauthorized access.' },
        ],
    },
];

/* ──────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────── */

const regions = [...new Set(jurisdictions.map(j => j.region))];

const totalFines = jurisdictions.reduce((sum, j) => sum + j.fines.length, 0);
const totalJurisdictions = jurisdictions.length;
const totalRegulations = [...new Set(jurisdictions.map(j => j.regulation))].length;

/* Region-accent colour map */
const regionAccents: Record<string, { bg: string; text: string; border: string }> = {
    'Europe': { bg: 'bg-white', text: 'text-blue-700', border: 'border-blue-200' },
    'United Kingdom': { bg: 'bg-white', text: 'text-indigo-700', border: 'border-indigo-200' },
    'Americas': { bg: 'bg-white', text: 'text-emerald-700', border: 'border-emerald-200' },
    'Asia-Pacific': { bg: 'bg-white', text: 'text-amber-700', border: 'border-amber-200' },
    'Middle East': { bg: 'bg-white', text: 'text-rose-700', border: 'border-rose-200' },
};

/* ──────────────────────────────────────────────
   Component
   ────────────────────────────────────────────── */

export default function FinesPage() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Dataset',
        name: 'Privacy Fines Database by Jurisdiction',
        description: 'Comprehensive database of privacy enforcement fines from 20+ jurisdictions worldwide, including GDPR, CCPA, LGPD, UK GDPR, PDPA, PIPA, and more.',
        url: 'https://privacychecker.pro/fines',
        publisher: { '@type': 'Organization', name: 'PrivacyChecker', url: 'https://privacychecker.pro' },
        dateModified: new Date().toISOString(),
        keywords: 'GDPR fines, CCPA penalties, privacy enforcement, data protection fines',
    };

    return (
        <div className="min-h-screen bg-white">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            {/* ───── Header ───── */}
            <header className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
                <nav className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-0">
                        <img src="/logo.png" alt="PrivacyChecker" className="w-12 h-12 sm:w-16 sm:h-16 scale-[1.2]" />
                        <span className="text-sm sm:text-2xl font-bold text-gray-900 notranslate">PrivacyChecker</span>
                    </Link>
                    <div className="flex items-center gap-3 sm:gap-6">
                        <Link href="/blog" className="text-sm sm:text-base text-gray-600 hover:text-gray-900 transition">Blog</Link>
                        <Link href="/fines" className="text-sm sm:text-base text-blue-600 font-medium">Fines</Link>
                        <Link href="/#pricing" className="hidden sm:block text-sm sm:text-base text-gray-600 hover:text-gray-900 transition">Pricing</Link>
                        <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg transition text-xs sm:text-base">
                            Sign In
                        </Link>
                    </div>
                </nav>
            </header>

            <main className="container mx-auto px-4 sm:px-6 py-12 max-w-6xl">
                {/* ───── Hero ───── */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                        Privacy Fines{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">Database</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
                        Real enforcement actions from {totalJurisdictions} jurisdictions worldwide. Understand the cost of non-compliance with GDPR, CCPA, and other privacy regulations.
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                        <div className="p-4 rounded-xl border border-blue-200 bg-white">
                            <p className="text-2xl sm:text-3xl font-bold text-blue-600">€7.1B+</p>
                            <p className="text-xs sm:text-sm text-gray-500 mt-1">Total GDPR Fines</p>
                        </div>
                        <div className="p-4 rounded-xl border border-cyan-200 bg-white">
                            <p className="text-2xl sm:text-3xl font-bold text-cyan-600">{totalFines}+</p>
                            <p className="text-xs sm:text-sm text-gray-500 mt-1">Fines Tracked</p>
                        </div>
                        <div className="p-4 rounded-xl border border-indigo-200 bg-white">
                            <p className="text-2xl sm:text-3xl font-bold text-indigo-600">{totalJurisdictions}</p>
                            <p className="text-xs sm:text-sm text-gray-500 mt-1">Jurisdictions</p>
                        </div>
                        <div className="p-4 rounded-xl border border-purple-200 bg-white">
                            <p className="text-2xl sm:text-3xl font-bold text-purple-600">{totalRegulations}</p>
                            <p className="text-xs sm:text-sm text-gray-500 mt-1">Regulations Covered</p>
                        </div>
                    </div>
                </div>

                {/* ───── Quick navigation ───── */}
                <div className="flex flex-wrap justify-center gap-2 mb-12">
                    {regions.map(region => (
                        <a
                            key={region}
                            href={`#region-${region.toLowerCase().replace(/[^a-z]/g, '-')}`}
                            className={`px-4 py-2 rounded-full text-sm font-medium border transition hover:shadow-sm ${regionAccents[region]?.border || 'border-gray-200'} ${regionAccents[region]?.text || 'text-gray-700'} bg-white`}
                        >
                            {region}
                        </a>
                    ))}
                </div>

                {/* ───── Jurisdictions by region ───── */}
                {regions.map(region => (
                    <section key={region} id={`region-${region.toLowerCase().replace(/[^a-z]/g, '-')}`} className="mb-16">
                        <div className="flex items-center gap-3 mb-8">
                            <h2 className="text-2xl font-bold text-gray-900">{region}</h2>
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${regionAccents[region]?.border || 'border-gray-200'} ${regionAccents[region]?.text || 'text-gray-600'} bg-white`}>
                                {jurisdictions.filter(j => j.region === region).length} jurisdictions
                            </span>
                        </div>

                        {jurisdictions
                            .filter(j => j.region === region)
                            .map(jurisdiction => (
                                <div key={jurisdiction.id} className="mb-8 border border-gray-200 rounded-xl overflow-hidden">
                                    {/* Jurisdiction header */}
                                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white border border-gray-200 text-xs font-bold text-gray-600">
                                                        {jurisdiction.flag}
                                                    </span>
                                                    {jurisdiction.name}
                                                </h3>
                                                <p className="text-sm text-gray-500 mt-1">{jurisdiction.authority}</p>
                                            </div>
                                            <div className="flex flex-col sm:items-end gap-1">
                                                <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border ${regionAccents[region]?.border || 'border-gray-200'} ${regionAccents[region]?.text || 'text-gray-600'} bg-white`}>
                                                    {jurisdiction.regulation}
                                                </span>
                                                <span className="text-xs text-gray-400">Max: {jurisdiction.maxPenalty}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Fines table */}
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-gray-100">
                                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Company</th>
                                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
                                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Violation</th>
                                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Year</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {jurisdiction.fines.map((fine, idx) => (
                                                    <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50 transition">
                                                        <td className="px-6 py-4">
                                                            <p className="font-semibold text-gray-900">{fine.company}</p>
                                                            <p className="text-xs text-gray-500 mt-1 md:hidden">{fine.violation}</p>
                                                            <p className="text-xs text-gray-400 mt-1 max-w-md">{fine.details}</p>
                                                        </td>
                                                        <td className="px-4 py-4 font-bold text-gray-900 whitespace-nowrap">{fine.amount}</td>
                                                        <td className="px-4 py-4 text-gray-600 hidden md:table-cell">{fine.violation}</td>
                                                        <td className="px-4 py-4 text-gray-500">{fine.year}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                    </section>
                ))}

                {/* ───── Common violation types ───── */}
                <section className="mb-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Most Common Violation Types</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                            { title: 'Insufficient Legal Basis', pct: '34%', desc: 'Processing personal data without valid consent or legitimate interest', range: '€50K – €1.2B' },
                            { title: 'Unlawful Data Transfers', pct: '20%', desc: 'Transferring personal data to third countries without adequate safeguards', range: '€100K – €1.2B' },
                            { title: 'Insufficient Security', pct: '18%', desc: 'Inadequate technical and organizational measures leading to data breaches', range: '€10K – £14M' },
                            { title: 'Data Subject Rights', pct: '15%', desc: 'Failure to fulfill access, deletion, or portability requests', range: '€5K – €20M' },
                            { title: 'Cookie Consent Violations', pct: '8%', desc: 'Loading trackers before consent or lacking "reject all" options', range: '€10K – €150M' },
                            { title: 'Transparency Failures', pct: '5%', desc: 'Insufficient privacy notices or unclear data processing information', range: '€5K – €225M' },
                        ].map(v => (
                            <div key={v.title} className="p-5 rounded-xl border border-gray-200 bg-white">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold text-gray-900 text-sm">{v.title}</h3>
                                    <span className="text-sm font-bold text-blue-600">{v.pct}</span>
                                </div>
                                <p className="text-xs text-gray-500 mb-3">{v.desc}</p>
                                <p className="text-xs text-gray-400">Typical range: <span className="font-medium text-gray-600">{v.range}</span></p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ───── Regulation overview ───── */}
                <section className="mb-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Regulation Overview</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Regulation</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Scope</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Max Penalty</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Since</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { reg: 'GDPR', scope: '27 EU member states + EEA', max: '€20M or 4% of global turnover', since: '2018' },
                                    { reg: 'UK GDPR', scope: 'United Kingdom', max: '£17.5M or 4% of global turnover', since: '2021' },
                                    { reg: 'CCPA / CPRA', scope: 'California, USA', max: '$7,988 per intentional violation', since: '2020' },
                                    { reg: 'LGPD', scope: 'Brazil', max: '2% of revenue, capped at R$50M', since: '2020' },
                                    { reg: 'PIPEDA', scope: 'Canada', max: 'C$100K per violation (CPPA: C$25M proposed)', since: '2000' },
                                    { reg: 'PDPA', scope: 'Singapore', max: 'S$1M or 10% of local turnover', since: '2012' },
                                    { reg: 'PIPA', scope: 'South Korea', max: '3–10% of total sales', since: '2011' },
                                    { reg: 'APPI', scope: 'Japan', max: '¥100M (admin fines under review)', since: '2003' },
                                    { reg: 'Privacy Act', scope: 'Australia', max: 'A$50M, 3x benefit, or 30% of turnover', since: '1988' },
                                    { reg: 'DPDP', scope: 'India', max: '₹250 Crore (~€28M)', since: '2023' },
                                    { reg: 'KVKK', scope: 'Turkey', max: '₺1.9M per violation', since: '2016' },
                                ].map(r => (
                                    <tr key={r.reg} className="border-t border-gray-100 hover:bg-gray-50 transition">
                                        <td className="px-6 py-3 font-semibold text-gray-900">{r.reg}</td>
                                        <td className="px-4 py-3 text-gray-600">{r.scope}</td>
                                        <td className="px-4 py-3 text-gray-600">{r.max}</td>
                                        <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{r.since}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* ───── CTA ───── */}
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 sm:p-12 text-center text-white">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                        Don&apos;t become the next headline
                    </h2>
                    <p className="text-blue-100 mb-6 max-w-xl mx-auto">
                        Scan your website for privacy issues, security vulnerabilities, and compliance gaps — all in under 60 seconds.
                    </p>
                    <Link
                        href="/"
                        className="inline-block bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition"
                    >
                        Start Free Audit
                    </Link>
                </div>
            </main>

            {/* ───── Footer ───── */}
            <footer className="border-t border-gray-200 mt-20">
                <div className="container mx-auto px-6 py-8 text-center text-sm text-gray-500">
                    <p>&copy; 2026 PrivacyChecker. All rights reserved.</p>
                    <div className="flex justify-center gap-6 mt-4">
                        <Link href="/privacy" className="hover:text-gray-900">Privacy</Link>
                        <Link href="/terms" className="hover:text-gray-900">Terms</Link>
                        <Link href="/about" className="hover:text-gray-900">About</Link>
                        <Link href="/blog" className="hover:text-gray-900">Blog</Link>
                        <Link href="/fines" className="hover:text-gray-900">Fines</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
