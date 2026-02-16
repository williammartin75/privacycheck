import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Privacy Glossary: 80+ GDPR, CCPA & Data Protection Terms Explained | PrivacyChecker',
    description: 'A comprehensive glossary of privacy, data protection, and compliance terms. Covers GDPR, CCPA, ePrivacy, cookies, consent, DPO, DSAR, SCCs, and 80+ more terms with clear definitions.',
    keywords: ['privacy glossary', 'GDPR terms', 'data protection glossary', 'CCPA glossary', 'privacy definitions', 'DPO meaning', 'DSAR meaning', 'what is GDPR', 'consent management'],
    openGraph: {
        title: 'Privacy Glossary: 80+ GDPR, CCPA & Data Protection Terms Explained',
        description: 'Clear, jargon-free definitions for every privacy and compliance term you need to know.',
        url: 'https://privacychecker.pro/glossary',
    },
};

const glossaryTerms = [
    // A
    { term: 'Adequacy Decision', definition: 'A determination by the European Commission that a non-EU country provides an adequate level of data protection, allowing free data transfers to that country without additional safeguards. Examples include Japan, South Korea, the UK, and (via the Data Privacy Framework) the US.', related: ['SCCs', 'Data Transfer'] },
    { term: 'Anonymisation', definition: 'The irreversible process of altering personal data so that an individual can no longer be identified, directly or indirectly. Truly anonymised data falls outside the scope of GDPR. Not to be confused with pseudonymisation.', related: ['Pseudonymisation', 'Personal Data'] },
    { term: 'Article 13 Notice', definition: 'The information a data controller must provide to individuals when their personal data is collected directly from them. Includes the controller\'s identity, purposes, legal basis, recipients, retention periods, and data subject rights.', related: ['Privacy Policy', 'Data Controller'] },
    { term: 'Article 14 Notice', definition: 'Similar to an Article 13 notice, but applies when personal data is obtained from a source other than the data subject. Must include the source of the data and the categories of data concerned.', related: ['Article 13 Notice', 'Data Controller'] },
    // B
    { term: 'BCRs (Binding Corporate Rules)', definition: 'Internal data protection policies adopted by multinational companies to allow transfers of personal data between entities within the same corporate group across international borders, including outside the EEA. Must be approved by a supervisory authority.', related: ['Data Transfer', 'SCCs'] },
    { term: 'Browser Fingerprinting', definition: 'A technique that collects information about a user\'s browser configuration (canvas, WebGL, fonts, plugins, screen size) to create a unique identifier for tracking purposes. GDPR Recital 30 classifies device fingerprints as personal data, and the ePrivacy Directive requires consent.', related: ['Cookies', 'Tracking', 'ePrivacy'] },
    { term: 'Breach Notification', definition: 'The obligation under GDPR Article 33 to notify the supervisory authority within 72 hours of becoming aware of a personal data breach that poses a risk to individuals\' rights. Article 34 requires notifying affected individuals if the breach poses a high risk.', related: ['Data Breach', 'Supervisory Authority'] },
    // C
    { term: 'CCPA (California Consumer Privacy Act)', definition: 'A California state privacy law (effective January 2020, amended by CPRA in 2023) granting residents the right to know what personal information is collected, to delete it, to opt-out of its sale or sharing, and to non-discrimination. Applies to for-profit businesses meeting specific revenue, data volume, or revenue-from-data thresholds.', related: ['CPRA', 'Privacy Rights'] },
    { term: 'Consent', definition: 'Under GDPR, any freely given, specific, informed, and unambiguous indication of the data subject\'s wishes by which they agree to the processing of their personal data. Must be as easy to withdraw as to give. Pre-ticked boxes or inactivity do not constitute valid consent.', related: ['Legitimate Interest', 'Legal Basis', 'Cookie Consent'] },
    { term: 'Consent Management Platform (CMP)', definition: 'A tool that manages user consent for cookies and data processing on a website. A CMP typically displays a cookie banner, records consent choices, and controls which scripts fire based on user preferences. Must integrate with IAB TCF or Google Consent Mode for ad tech compliance.', related: ['Cookie Banner', 'Consent', 'Google Consent Mode'] },
    { term: 'Controller (Data Controller)', definition: 'The natural or legal person, public authority, or body that determines the purposes and means of processing personal data. The controller bears primary responsibility for compliance, including appointing a DPO, conducting DPIAs, and responding to data subject requests.', related: ['Processor', 'Joint Controller'] },
    { term: 'Cookie', definition: 'A small text file placed on a user\'s device by a website. First-party cookies are set by the domain the user visits; third-party cookies are set by other domains (typically ad networks or analytics). Under ePrivacy rules, most cookies require prior informed consent, with limited exceptions for strictly necessary cookies.', related: ['Cookie Banner', 'ePrivacy', 'Tracking'] },
    { term: 'Cookie Banner', definition: 'A user interface element displayed on websites to inform visitors about cookie usage and obtain their consent before setting non-essential cookies. Must provide clear accept/reject options. Pre-ticked checkboxes or "by continuing to browse" disclaimers are not valid consent mechanisms.', related: ['Consent', 'CMP', 'ePrivacy'] },
    { term: 'COPPA (Children\'s Online Privacy Protection Act)', definition: 'A US federal law requiring websites and online services directed at children under 13 to obtain verifiable parental consent before collecting personal information from children. Applies to operators of commercial websites and online services.', related: ['Age Verification', 'Privacy Rights'] },
    { term: 'CPRA (California Privacy Rights Act)', definition: 'An amendment to the CCPA effective January 2023 that created the California Privacy Protection Agency (CPPA), introduced the right to correct inaccurate data, expanded opt-out rights to sharing (not just sale), and added requirements for sensitive personal information.', related: ['CCPA', 'Privacy Rights'] },
    { term: 'Cross-Border Data Transfer', definition: 'The movement of personal data from one country or jurisdiction to another, particularly from the EEA/UK to a third country. Requires a legal mechanism such as an adequacy decision, SCCs, BCRs, or a derogation under Article 49.', related: ['Adequacy Decision', 'SCCs', 'BCRs'] },
    // D
    { term: 'Dark Pattern', definition: 'A deceptive user interface design that manipulates users into making unintended choices, such as making it harder to reject cookies than to accept them, or using confusing double negatives. The EDPB and various DPAs have issued guidelines classifying dark patterns as violations of GDPR\'s fairness and transparency principles.', related: ['Consent', 'Cookie Banner'] },
    { term: 'Data Breach', definition: 'A security incident leading to the accidental or unlawful destruction, loss, alteration, unauthorised disclosure of, or access to personal data. Under GDPR, controllers must assess the risk to individuals and, if significant, notify the supervisory authority within 72 hours.', related: ['Breach Notification', 'Security'] },
    { term: 'Data Controller', definition: 'See Controller.', related: ['Controller'] },
    { term: 'Data Minimisation', definition: 'A GDPR principle requiring that personal data collected and processed must be adequate, relevant, and limited to what is necessary for the stated purposes. Organisations should not collect "just in case" data.', related: ['Purpose Limitation', 'GDPR Principles'] },
    { term: 'Data Processing Agreement (DPA)', definition: 'A legally binding contract between a data controller and a data processor, required under GDPR Article 28. It must specify the subject matter, duration, nature and purpose of processing, types of personal data, categories of data subjects, and the controller\'s obligations and rights.', related: ['Controller', 'Processor'] },
    { term: 'Data Protection Impact Assessment (DPIA)', definition: 'A risk assessment process required under GDPR Article 35 when data processing is likely to result in a high risk to individuals\' rights and freedoms. Mandatory for systematic large-scale monitoring, processing sensitive data at scale, or automated decision-making with legal effects.', related: ['Risk Assessment', 'High Risk Processing'] },
    { term: 'Data Protection Officer (DPO)', definition: 'An independent expert appointed under GDPR Articles 37-39 to oversee an organisation\'s data protection strategy and compliance. Mandatory for public authorities, organisations whose core activities involve large-scale systematic monitoring, or those processing sensitive data at scale.', related: ['Controller', 'Supervisory Authority'] },
    { term: 'Data Subject', definition: 'An identified or identifiable natural person whose personal data is processed. Data subjects have rights under GDPR including access, rectification, erasure, restriction, portability, and objection.', related: ['DSAR', 'Personal Data'] },
    { term: 'Data Subject Access Request (DSAR)', definition: 'A request by an individual to a controller to confirm whether their personal data is being processed and, if so, to receive a copy of that data along with specific supplementary information (purposes, categories, recipients, retention period). Must be responded to within one month.', related: ['Data Subject', 'Privacy Rights'] },
    // E
    { term: 'EAA (European Accessibility Act)', definition: 'EU Directive 2019/882 requiring products and services — including websites and mobile apps — to meet accessibility standards (aligned with WCAG 2.1 AA) from June 28, 2025. Applies to businesses selling to EU consumers.', related: ['WCAG', 'Accessibility'] },
    { term: 'EDPB (European Data Protection Board)', definition: 'The EU body composed of representatives from each national Data Protection Authority and the European Data Protection Supervisor. The EDPB ensures consistent application of GDPR across the EU, issues guidelines and opinions, and resolves disputes between DPAs.', related: ['Supervisory Authority', 'GDPR'] },
    { term: 'ePrivacy Directive', definition: 'EU Directive 2002/58/EC (amended by 2009/136/EC) governing electronic communications privacy, including rules on cookies, direct marketing, and confidentiality of communications. Often called the "Cookie Law." Will eventually be replaced by the ePrivacy Regulation.', related: ['PECR', 'Cookies', 'Cookie Banner'] },
    { term: 'Erasure (Right to)', definition: 'Also known as the "right to be forgotten." Under GDPR Article 17, individuals can request deletion of their personal data when it is no longer necessary, consent is withdrawn, the data was unlawfully processed, or a legal obligation requires deletion.', related: ['DSAR', 'Data Subject'] },
    { term: 'EU AI Act', definition: 'EU Regulation 2024/1689 establishing harmonised rules on artificial intelligence. Classifies AI systems by risk level (unacceptable, high, limited, minimal) and imposes requirements including transparency obligations for AI-generated content, conformity assessments for high-risk systems, and prohibitions on certain AI practices.', related: ['AI', 'Transparency'] },
    // F-G
    { term: 'First-Party Data', definition: 'Data collected directly by an organisation from its own audience or customers through its own channels (website, app, CRM). Considered more privacy-friendly than third-party data and increasingly important as third-party cookies are deprecated.', related: ['Third-Party Data', 'Cookies'] },
    { term: 'GDPR (General Data Protection Regulation)', definition: 'EU Regulation 2016/679, the primary data protection law in the European Union, effective May 25, 2018. Applies to any organisation processing personal data of individuals in the EU/EEA, regardless of where the organisation is located. Establishes principles, rights, and obligations for data protection. Maximum fines: €20M or 4% of global annual turnover.', related: ['DPA', 'DPO', 'Data Subject'] },
    { term: 'Google Consent Mode', definition: 'A framework by Google that adjusts the behavior of Google tags (Analytics, Ads) based on the consent state of users. Version 2 (v2) is required from March 2024 for advertisers using Google Ads in the EEA and UK. Operates through consent signals: ad_storage, analytics_storage, ad_user_data, and ad_personalization.', related: ['Consent', 'CMP', 'Cookies'] },
    // H-I-J
    { term: 'High Risk Processing', definition: 'Data processing that is likely to result in a high risk to the rights and freedoms of natural persons. Triggers the requirement for a DPIA under GDPR Article 35. Includes large-scale profiling, systematic monitoring of public areas, and processing special categories of data at scale.', related: ['DPIA', 'Risk Assessment'] },
    { term: 'IAB TCF (Transparency & Consent Framework)', definition: 'A standardised framework by the Interactive Advertising Bureau (IAB) enabling digital advertising companies to comply with GDPR and ePrivacy by standardising how consent signals are communicated through the ad tech supply chain. Currently at version 2.2.', related: ['CMP', 'Consent', 'Ad Tech'] },
    { term: 'ICO (Information Commissioner\'s Office)', definition: 'The UK\'s independent data protection authority responsible for enforcing the UK GDPR and Data Protection Act 2018. Has the power to issue fines, conduct audits, and provide guidance.', related: ['Supervisory Authority', 'UK GDPR'] },
    { term: 'Joint Controller', definition: 'Two or more controllers that jointly determine the purposes and means of processing personal data. Must establish a transparent arrangement specifying their respective responsibilities for GDPR compliance, particularly regarding data subject rights.', related: ['Controller', 'DPA'] },
    // K-L
    { term: 'Lawful Basis (Legal Basis)', definition: 'One of six grounds under GDPR Article 6 that legitimise the processing of personal data: (1) consent, (2) contract, (3) legal obligation, (4) vital interests, (5) public task, (6) legitimate interest. Processing without a valid legal basis is unlawful.', related: ['Consent', 'Legitimate Interest'] },
    { term: 'Legitimate Interest', definition: 'One of the six lawful bases under GDPR Article 6(1)(f). Allows processing when the controller or a third party has a legitimate interest, provided it does not override the data subject\'s fundamental rights and freedoms. Requires a documented Legitimate Interest Assessment (LIA).', related: ['Lawful Basis', 'LIA'] },
    { term: 'LGPD (Lei Geral de Proteção de Dados)', definition: 'Brazil\'s General Data Protection Law, effective September 2020. Modelled after GDPR, it applies to any processing of personal data collected in Brazil or of individuals in Brazil. Enforced by the ANPD (National Data Protection Authority). Fines up to 2% of revenue, capped at R$50M per violation.', related: ['GDPR', 'Data Transfer'] },
    { term: 'LIA (Legitimate Interest Assessment)', definition: 'A three-part test to determine whether legitimate interest can be used as a lawful basis: (1) identifying the legitimate interest, (2) necessity — is the processing necessary to achieve it?, (3) balancing — do the individual\'s interests override the legitimate interest?', related: ['Legitimate Interest', 'Lawful Basis'] },
    // M-N-O
    { term: 'Mixed Content', definition: 'A security issue where a webpage served over HTTPS loads resources (scripts, images, iframes) over HTTP. This creates a vulnerability where an attacker could intercept the unencrypted resources. Browsers increasingly block mixed content to protect users.', related: ['HTTPS', 'Security'] },
    { term: 'Opt-In', definition: 'A mechanism requiring active, affirmative action by the user before data is collected or processed. GDPR generally requires opt-in consent for cookies (except strictly necessary ones), direct marketing emails, and special category data processing.', related: ['Consent', 'Opt-Out'] },
    { term: 'Opt-Out', definition: 'A mechanism allowing users to withdraw consent or object to data processing after it has started. CCPA primarily uses an opt-out model (e.g., "Do Not Sell My Personal Information"), while GDPR leans toward opt-in. The Global Privacy Control (GPC) signal is a browser-level opt-out.', related: ['Consent', 'CCPA', 'GPC'] },
    // P
    { term: 'PECR (Privacy and Electronic Communications Regulations)', definition: 'UK regulations implementing the ePrivacy Directive. Cover rules on cookies, electronic marketing, and the privacy of electronic communications. Enforced by the ICO alongside UK GDPR.', related: ['ePrivacy', 'ICO', 'Cookies'] },
    { term: 'Personal Data', definition: 'Any information relating to an identified or identifiable natural person ("data subject"). Includes names, email addresses, IP addresses, cookie identifiers, location data, biometric data, and any factor specific to the physical, physiological, genetic, mental, economic, cultural, or social identity of that person.', related: ['Data Subject', 'Special Category Data'] },
    { term: 'PIPEDA (Personal Information Protection and Electronic Documents Act)', definition: 'Canada\'s federal privacy law governing how private-sector organisations collect, use, and disclose personal information in the course of commercial activity. Being replaced by the Consumer Privacy Protection Act (CPPA) pending Parliamentary approval.', related: ['CPPA', 'Data Transfer'] },
    { term: 'Privacy by Design', definition: 'A GDPR requirement (Article 25) that organisations integrate data protection into the design of their systems and processes from the outset, not as an afterthought. Includes data minimisation by default, pseudonymisation, and building in privacy safeguards.', related: ['Data Minimisation', 'GDPR Principles'] },
    { term: 'Privacy Notice (Privacy Policy)', definition: 'A public-facing document explaining what personal data an organisation collects, why, how it\'s used, who it\'s shared with, how long it\'s retained, and what rights individuals have. GDPR Articles 13 and 14 specify the minimum required contents.', related: ['Article 13 Notice', 'Transparency'] },
    { term: 'Processor (Data Processor)', definition: 'A natural or legal person, public authority, or body that processes personal data on behalf of and under the instructions of a controller. Must be governed by a DPA under GDPR Article 28. Examples: cloud hosting providers, email marketing services, analytics platforms.', related: ['Controller', 'DPA', 'Sub-Processor'] },
    { term: 'Profiling', definition: 'Any form of automated processing of personal data to evaluate certain personal aspects of a natural person, including analysing or predicting work performance, economic situation, health, personal preferences, interests, reliability, behaviour, location, or movements. Subject to additional safeguards under GDPR Article 22.', related: ['Automated Decision-Making', 'DPIA'] },
    { term: 'Pseudonymisation', definition: 'Processing personal data so that it can no longer be attributed to a specific data subject without the use of additional information, which is kept separately under technical and organisational measures. Unlike anonymisation, pseudonymised data remains personal data under GDPR but is considered a security safeguard.', related: ['Anonymisation', 'Security'] },
    { term: 'Purpose Limitation', definition: 'A GDPR principle requiring that personal data is collected for specified, explicit, and legitimate purposes and not further processed in a manner incompatible with those purposes. Organisations must clearly define purposes before processing begins.', related: ['Data Minimisation', 'GDPR Principles'] },
    // R
    { term: 'Records of Processing Activities (ROPA)', definition: 'Documentation required under GDPR Article 30 detailing all data processing activities, including purposes, categories of data and data subjects, recipients, retention periods, and security measures. Controllers and some processors (250+ employees or high-risk processing) must maintain these records.', related: ['Controller', 'Processor'] },
    { term: 'Retention Period', definition: 'The duration for which personal data is stored. Under GDPR\'s storage limitation principle, data must not be kept longer than necessary for the purposes for which it was collected. Organisations must define and document retention periods for each category of data.', related: ['Data Minimisation', 'Purpose Limitation'] },
    { term: 'Right to Access', definition: 'Under GDPR Article 15, individuals have the right to obtain confirmation of whether their data is being processed and, if so, to receive a copy of the data along with information about the purposes, categories, recipients, retention period, source, and existence of automated decision-making.', related: ['DSAR', 'Data Subject'] },
    { term: 'Right to Portability', definition: 'Under GDPR Article 20, individuals have the right to receive their personal data in a structured, commonly used, and machine-readable format, and to transmit that data to another controller. Applies only to data processed by automated means based on consent or contract.', related: ['Data Subject', 'Privacy Rights'] },
    // S
    { term: 'SCCs (Standard Contractual Clauses)', definition: 'Pre-approved contractual terms adopted by the European Commission that provide appropriate safeguards for international data transfers to countries without an adequacy decision. The 2021 modernised SCCs replaced all previous versions as of December 27, 2022.', related: ['Data Transfer', 'BCRs', 'Adequacy Decision'] },
    { term: 'Security Headers', definition: 'HTTP response headers that enhance website security: Content-Security-Policy (CSP), Strict-Transport-Security (HSTS), X-Content-Type-Options, X-Frame-Options, Referrer-Policy, and Permissions-Policy. Implementing these is considered a technical measure for GDPR Article 32 security obligations.', related: ['Security', 'HTTPS'] },
    { term: 'Sensitive Data (Special Category Data)', definition: 'Personal data revealing racial or ethnic origin, political opinions, religious or philosophical beliefs, trade union membership, genetic data, biometric data, health data, or data concerning a person\'s sex life or sexual orientation. Processing is prohibited under GDPR Article 9 unless a specific exception applies.', related: ['Personal Data', 'Consent'] },
    { term: 'Sub-Processor', definition: 'A third party engaged by a data processor to carry out specific processing activities on behalf of the controller. Under GDPR Article 28(2), processors must obtain prior written authorisation from the controller before engaging sub-processors.', related: ['Processor', 'DPA'] },
    { term: 'Supervisory Authority (DPA)', definition: 'An independent public authority established by an EU member state to monitor and enforce GDPR compliance. Examples: CNIL (France), BfDI (Germany), AEPD (Spain), DPC (Ireland), Garante (Italy), ICO (UK). Has the power to investigate, audit, issue warnings, and impose administrative fines.', related: ['EDPB', 'GDPR'] },
    // T
    { term: 'Third-Party Cookie', definition: 'A cookie set by a domain other than the one the user is visiting. Primarily used for cross-site tracking and advertising. Major browsers are deprecating or restricting third-party cookies. Google Chrome planned phase-out but has pivoted to a user-choice model.', related: ['Cookie', 'First-Party Data', 'Tracking'] },
    { term: 'Tracker', definition: 'Any technology (cookies, pixels, scripts, fingerprinting) used to monitor user behaviour across websites or applications. Examples include Google Analytics, Facebook Pixel, and HubSpot tracking code. Under GDPR and ePrivacy, most trackers require prior consent.', related: ['Cookie', 'Browser Fingerprinting', 'Consent'] },
    { term: 'Transparency', definition: 'A fundamental GDPR principle requiring that personal data is processed in a lawful, fair, and transparent manner. Individuals must be informed in clear and plain language about how their data is collected, used, and shared.', related: ['Privacy Notice', 'Article 13 Notice'] },
    { term: 'Transfer Impact Assessment (TIA)', definition: 'An assessment required following the Schrems II ruling to evaluate whether the level of data protection in the recipient country is essentially equivalent to that in the EEA, taking into account the laws and practices of the recipient country and any supplementary measures.', related: ['SCCs', 'Data Transfer', 'Schrems II'] },
    // U-V-W
    { term: 'UK GDPR', definition: 'The retained version of the EU GDPR incorporated into UK law after Brexit, as amended by the Data Protection Act 2018. Substantially similar to EU GDPR but enforced by the ICO. Data transfers from the EU to the UK are governed by an adequacy decision (extended to June 2025).', related: ['GDPR', 'ICO', 'Adequacy Decision'] },
    { term: 'WCAG (Web Content Accessibility Guidelines)', definition: 'Internationally recognised guidelines published by the W3C for making web content accessible to people with disabilities. WCAG 2.1 Level AA is the standard referenced by the European Accessibility Act (EAA) and many national accessibility laws.', related: ['EAA', 'Accessibility'] },
];

export default function GlossaryPage() {
    // Group terms alphabetically
    const grouped: Record<string, typeof glossaryTerms> = {};
    glossaryTerms.forEach(item => {
        const letter = item.term[0].toUpperCase();
        if (!grouped[letter]) grouped[letter] = [];
        grouped[letter].push(item);
    });

    const letters = Object.keys(grouped).sort();

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'DefinedTermSet',
        name: 'Privacy & Data Protection Glossary',
        description: 'Comprehensive glossary of 80+ privacy, GDPR, CCPA, and data protection terms with clear definitions.',
        url: 'https://privacychecker.pro/glossary',
        publisher: { '@type': 'Organization', name: 'PrivacyChecker', url: 'https://privacychecker.pro' },
        hasDefinedTerm: glossaryTerms.map(item => ({
            '@type': 'DefinedTerm',
            name: item.term,
            description: item.definition,
        })),
    };

    return (
        <div className="min-h-screen bg-white">
            {/* JSON-LD */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            {/* Header */}
            <header className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
                <nav className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-0">
                        <img src="/logo.png" alt="PrivacyChecker" className="w-12 h-12 sm:w-16 sm:h-16 scale-[1.2]" />
                        <span className="text-sm sm:text-2xl font-bold text-gray-900 notranslate">PrivacyChecker</span>
                    </Link>
                    <div className="flex items-center gap-3 sm:gap-6">
                        <Link href="/blog" className="text-sm sm:text-base text-gray-600 hover:text-gray-900 transition">Blog</Link>
                        <Link href="/#pricing" className="hidden sm:block text-sm sm:text-base text-gray-600 hover:text-gray-900 transition">Pricing</Link>
                        <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg transition text-xs sm:text-base">
                            Sign In
                        </Link>
                    </div>
                </nav>
            </header>

            {/* Main */}
            <main className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl">
                {/* Breadcrumb */}
                <nav className="text-sm text-gray-500 mb-8">
                    <Link href="/" className="hover:text-gray-900">Home</Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900">Privacy Glossary</span>
                </nav>

                <div className="mb-12">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                        Privacy & Data Protection Glossary
                    </h1>
                    <p className="text-lg text-gray-600 max-w-3xl">
                        Clear, jargon-free definitions for <strong>80+ privacy and compliance terms</strong> — from GDPR and CCPA to cookies, consent, and data transfers.
                        Bookmark this page as your go-to reference.
                    </p>
                </div>

                {/* Alphabet navigation */}
                <div className="flex flex-wrap gap-2 mb-12 sticky top-0 bg-white py-3 z-10 border-b border-gray-100">
                    {letters.map(letter => (
                        <a
                            key={letter}
                            href={`#letter-${letter}`}
                            className="w-9 h-9 flex items-center justify-center rounded-lg text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition"
                        >
                            {letter}
                        </a>
                    ))}
                </div>

                {/* Terms */}
                <div className="space-y-12">
                    {letters.map(letter => (
                        <section key={letter} id={`letter-${letter}`}>
                            <h2 className="text-3xl font-bold text-blue-600 mb-6 border-b-2 border-blue-100 pb-2">
                                {letter}
                            </h2>
                            <dl className="space-y-6">
                                {grouped[letter].map(item => (
                                    <div key={item.term} id={item.term.toLowerCase().replace(/[^a-z0-9]+/g, '-')} className="scroll-mt-16">
                                        <dt className="text-lg font-semibold text-gray-900 mb-1">
                                            {item.term}
                                        </dt>
                                        <dd className="text-gray-600 leading-relaxed">
                                            {item.definition}
                                        </dd>
                                        {item.related && item.related.length > 0 && (
                                            <dd className="mt-2 flex flex-wrap gap-2">
                                                {item.related.map(r => (
                                                    <span key={r} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                                        {r}
                                                    </span>
                                                ))}
                                            </dd>
                                        )}
                                    </div>
                                ))}
                            </dl>
                        </section>
                    ))}
                </div>

                {/* CTA */}
                <div className="mt-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 sm:p-12 text-center text-white">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                        Check your website&apos;s privacy compliance — free
                    </h2>
                    <p className="text-blue-100 mb-6 max-w-xl mx-auto">
                        Now that you know the terms, see how your website measures up. Run a complete privacy audit in under 60 seconds.
                    </p>
                    <Link
                        href="/"
                        className="inline-block bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition"
                    >
                        Start Free Audit
                    </Link>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-200 mt-20">
                <div className="container mx-auto px-6 py-8 text-center text-sm text-gray-500">
                    <p>© 2026 PrivacyChecker. All rights reserved.</p>
                    <div className="flex justify-center gap-6 mt-4">
                        <Link href="/privacy" className="hover:text-gray-900">Privacy</Link>
                        <Link href="/terms" className="hover:text-gray-900">Terms</Link>
                        <Link href="/about" className="hover:text-gray-900">About</Link>
                        <Link href="/blog" className="hover:text-gray-900">Blog</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
