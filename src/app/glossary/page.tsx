import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Privacy Glossary: 120+ GDPR, CCPA & Data Protection Terms Explained | PrivacyChecker',
    description: 'A comprehensive glossary of privacy, data protection, and compliance terms. Covers GDPR, CCPA, ePrivacy, cookies, consent, DPO, DSAR, SCCs, and 120+ more terms with clear definitions.',
    keywords: ['privacy glossary', 'GDPR terms', 'data protection glossary', 'CCPA glossary', 'privacy definitions', 'DPO meaning', 'DSAR meaning', 'what is GDPR', 'consent management'],
    openGraph: {
        title: 'Privacy Glossary: 120+ GDPR, CCPA & Data Protection Terms Explained',
        description: 'Clear, jargon-free definitions for every privacy and compliance term you need to know.',
        url: 'https://privacychecker.pro/glossary',
    },
};

const glossaryTerms = [
    // A
    { term: 'Accountability', definition: 'A core GDPR principle (Article 5(2)) requiring controllers to not only comply with data protection principles but also to demonstrate compliance. This includes maintaining records of processing activities, conducting DPIAs, and implementing appropriate technical and organisational measures.', related: ['GDPR Principles', 'ROPA', 'DPIA'] },
    { term: 'Adequacy Decision', definition: 'A determination by the European Commission that a non-EU country provides an adequate level of data protection, allowing free data transfers to that country without additional safeguards. Examples include Japan, South Korea, the UK, and (via the Data Privacy Framework) the US.', related: ['SCCs', 'Data Transfer'] },
    { term: 'Age Verification', definition: 'Mechanisms used to verify a user\'s age before providing access to services or collecting their data. Under GDPR Article 8, children\'s consent for online services requires parental authorisation (age threshold varies by member state, 13-16 years). COPPA sets the threshold at 13 in the US.', related: ['COPPA', 'Consent'] },
    { term: 'Anonymisation', definition: 'The irreversible process of altering personal data so that an individual can no longer be identified, directly or indirectly. Truly anonymised data falls outside the scope of GDPR. Not to be confused with pseudonymisation.', related: ['Pseudonymisation', 'Personal Data'] },
    { term: 'Article 13 Notice', definition: 'The information a data controller must provide to individuals when their personal data is collected directly from them. Includes the controller\'s identity, purposes, legal basis, recipients, retention periods, and data subject rights.', related: ['Privacy Policy', 'Data Controller'] },
    { term: 'Article 14 Notice', definition: 'Similar to an Article 13 notice, but applies when personal data is obtained from a source other than the data subject. Must include the source of the data and the categories of data concerned.', related: ['Article 13 Notice', 'Data Controller'] },
    { term: 'Automated Decision-Making', definition: 'Processing performed entirely by automated means without human involvement that produces a decision with legal or similarly significant effects on an individual. Under GDPR Article 22, data subjects have the right not to be subject to purely automated decisions, with limited exceptions for contract necessity, legal authorisation, or explicit consent.', related: ['Profiling', 'DPIA'] },
    // B
    { term: 'BCRs (Binding Corporate Rules)', definition: 'Internal data protection policies adopted by multinational companies to allow transfers of personal data between entities within the same corporate group across international borders, including outside the EEA. Must be approved by a supervisory authority.', related: ['Data Transfer', 'SCCs'] },
    { term: 'Biometric Data', definition: 'Personal data resulting from specific technical processing relating to the physical, physiological, or behavioural characteristics of a natural person, such as facial images, fingerprint scans, iris patterns, or voice recognition data. Classified as special category data under GDPR Article 9 when used for identification purposes.', related: ['Special Category Data', 'Personal Data'] },
    { term: 'Breach Notification', definition: 'The obligation under GDPR Article 33 to notify the supervisory authority within 72 hours of becoming aware of a personal data breach that poses a risk to individuals\' rights. Article 34 requires notifying affected individuals if the breach poses a high risk.', related: ['Data Breach', 'Supervisory Authority'] },
    { term: 'Browser Fingerprinting', definition: 'A technique that collects information about a user\'s browser configuration (canvas, WebGL, fonts, plugins, screen size) to create a unique identifier for tracking purposes. GDPR Recital 30 classifies device fingerprints as personal data, and the ePrivacy Directive requires consent.', related: ['Cookies', 'Tracking', 'ePrivacy'] },
    // C
    { term: 'CCPA (California Consumer Privacy Act)', definition: 'A California state privacy law (effective January 2020, amended by CPRA in 2023) granting residents the right to know what personal information is collected, to delete it, to opt-out of its sale or sharing, and to non-discrimination. Applies to for-profit businesses meeting specific revenue, data volume, or revenue-from-data thresholds.', related: ['CPRA', 'Privacy Rights'] },
    { term: 'CNIL (Commission Nationale de l\'Informatique et des Libertés)', definition: 'France\'s independent data protection authority responsible for enforcing GDPR, the French Data Protection Act, and ePrivacy rules. Known for high-profile fines against Google (€150M), Facebook (€60M), and Amazon (€35M) for cookie consent violations. Also publishes widely referenced compliance guidance.', related: ['Supervisory Authority', 'GDPR'] },
    { term: 'Compliance Audit', definition: 'A systematic review of an organisation\'s data processing activities against applicable privacy laws and regulations. Covers consent mechanisms, privacy policies, data retention practices, security measures, vendor agreements, and internal governance. Can be internal or performed by a third party.', related: ['ROPA', 'DPIA', 'Accountability'] },
    { term: 'Consent', definition: 'Under GDPR, any freely given, specific, informed, and unambiguous indication of the data subject\'s wishes by which they agree to the processing of their personal data. Must be as easy to withdraw as to give. Pre-ticked boxes or inactivity do not constitute valid consent.', related: ['Legitimate Interest', 'Legal Basis', 'Cookie Consent'] },
    { term: 'Consent Management Platform (CMP)', definition: 'A tool that manages user consent for cookies and data processing on a website. A CMP typically displays a cookie banner, records consent choices, and controls which scripts fire based on user preferences. Must integrate with IAB TCF or Google Consent Mode for ad tech compliance.', related: ['Cookie Banner', 'Consent', 'Google Consent Mode'] },
    { term: 'Content Security Policy (CSP)', definition: 'An HTTP security header that controls which resources (scripts, styles, images, fonts) a browser is allowed to load on a page. CSP mitigates cross-site scripting (XSS) attacks and data injection by whitelisting trusted content sources. A strong CSP is a key indicator of website security maturity.', related: ['Security Headers', 'XSS'] },
    { term: 'Controller (Data Controller)', definition: 'The natural or legal person, public authority, or body that determines the purposes and means of processing personal data. The controller bears primary responsibility for compliance, including appointing a DPO, conducting DPIAs, and responding to data subject requests.', related: ['Processor', 'Joint Controller'] },
    { term: 'Cookie', definition: 'A small text file placed on a user\'s device by a website. First-party cookies are set by the domain the user visits; third-party cookies are set by other domains (typically ad networks or analytics). Under ePrivacy rules, most cookies require prior informed consent, with limited exceptions for strictly necessary cookies.', related: ['Cookie Banner', 'ePrivacy', 'Tracking'] },
    { term: 'Cookie Banner', definition: 'A user interface element displayed on websites to inform visitors about cookie usage and obtain their consent before setting non-essential cookies. Must provide clear accept/reject options. Pre-ticked checkboxes or "by continuing to browse" disclaimers are not valid consent mechanisms.', related: ['Consent', 'CMP', 'ePrivacy'] },
    { term: 'Cookie Wall', definition: 'A mechanism that blocks access to website content unless the user accepts all cookies. Most European DPAs consider cookie walls non-compliant with GDPR because consent cannot be "freely given" if access to a service is conditional on accepting non-essential cookies. The EDPB\'s guidelines explicitly discourage this practice.', related: ['Cookie Banner', 'Consent', 'Dark Pattern'] },
    { term: 'COPPA (Children\'s Online Privacy Protection Act)', definition: 'A US federal law requiring websites and online services directed at children under 13 to obtain verifiable parental consent before collecting personal information from children. Applies to operators of commercial websites and online services.', related: ['Age Verification', 'Privacy Rights'] },
    { term: 'CPPA (Consumer Privacy Protection Act)', definition: 'Canada\'s proposed replacement for PIPEDA, introducing a rights-based framework closer to GDPR. Includes stronger consent requirements, a right to data portability, algorithmic transparency, a private right of action, and administrative monetary penalties up to 5% of global revenue or C$25M.', related: ['PIPEDA', 'Privacy Rights'] },
    { term: 'CPRA (California Privacy Rights Act)', definition: 'An amendment to the CCPA effective January 2023 that created the California Privacy Protection Agency (CPPA), introduced the right to correct inaccurate data, expanded opt-out rights to sharing (not just sale), and added requirements for sensitive personal information.', related: ['CCPA', 'Privacy Rights'] },
    { term: 'Cross-Border Data Transfer', definition: 'The movement of personal data from one country or jurisdiction to another, particularly from the EEA/UK to a third country. Requires a legal mechanism such as an adequacy decision, SCCs, BCRs, or a derogation under Article 49.', related: ['Adequacy Decision', 'SCCs', 'BCRs'] },
    // D
    { term: 'Dark Pattern', definition: 'A deceptive user interface design that manipulates users into making unintended choices, such as making it harder to reject cookies than to accept them, or using confusing double negatives. The EDPB and various DPAs have issued guidelines classifying dark patterns as violations of GDPR\'s fairness and transparency principles.', related: ['Consent', 'Cookie Banner'] },
    { term: 'Data Breach', definition: 'A security incident leading to the accidental or unlawful destruction, loss, alteration, unauthorised disclosure of, or access to personal data. Under GDPR, controllers must assess the risk to individuals and, if significant, notify the supervisory authority within 72 hours.', related: ['Breach Notification', 'Security'] },
    { term: 'Data Controller', definition: 'See Controller.', related: ['Controller'] },
    { term: 'Data Localisation', definition: 'Legal requirements mandating that personal data of a country\'s citizens or residents must be collected, processed, or stored within that country\'s borders. Russia, China, and several other nations enforce strict data localisation laws. This creates challenges for global businesses using cloud services.', related: ['Cross-Border Data Transfer', 'Data Sovereignty'] },
    { term: 'Data Mapping', definition: 'The process of identifying and documenting all personal data an organisation collects, processes, stores, and shares. A data map tracks data flows from collection point to deletion, including which systems store data, who has access, and where data is transferred. Essential for building a ROPA and conducting DPIAs.', related: ['ROPA', 'DPIA', 'Data Minimisation'] },
    { term: 'Data Minimisation', definition: 'A GDPR principle requiring that personal data collected and processed must be adequate, relevant, and limited to what is necessary for the stated purposes. Organisations should not collect "just in case" data.', related: ['Purpose Limitation', 'GDPR Principles'] },
    { term: 'Data Processing Agreement (DPA)', definition: 'A legally binding contract between a data controller and a data processor, required under GDPR Article 28. It must specify the subject matter, duration, nature and purpose of processing, types of personal data, categories of data subjects, and the controller\'s obligations and rights.', related: ['Controller', 'Processor'] },
    { term: 'Data Protection Impact Assessment (DPIA)', definition: 'A risk assessment process required under GDPR Article 35 when data processing is likely to result in a high risk to individuals\' rights and freedoms. Mandatory for systematic large-scale monitoring, processing sensitive data at scale, or automated decision-making with legal effects.', related: ['Risk Assessment', 'High Risk Processing'] },
    { term: 'Data Protection Officer (DPO)', definition: 'An independent expert appointed under GDPR Articles 37-39 to oversee an organisation\'s data protection strategy and compliance. Mandatory for public authorities, organisations whose core activities involve large-scale systematic monitoring, or those processing sensitive data at scale.', related: ['Controller', 'Supervisory Authority'] },
    { term: 'Data Sovereignty', definition: 'The principle that data is subject to the laws and governance of the country in which it is collected or stored. Increasingly relevant as cloud computing enables cross-border data storage, creating jurisdictional conflicts between data protection regimes.', related: ['Data Localisation', 'Cross-Border Data Transfer'] },
    { term: 'Data Subject', definition: 'An identified or identifiable natural person whose personal data is processed. Data subjects have rights under GDPR including access, rectification, erasure, restriction, portability, and objection.', related: ['DSAR', 'Personal Data'] },
    { term: 'Data Subject Access Request (DSAR)', definition: 'A request by an individual to a controller to confirm whether their personal data is being processed and, if so, to receive a copy of that data along with specific supplementary information (purposes, categories, recipients, retention period). Must be responded to within one month.', related: ['Data Subject', 'Privacy Rights'] },
    { term: 'Digital Services Act (DSA)', definition: 'EU Regulation 2022/2065 establishing obligations for online platforms and intermediaries regarding illegal content, transparency, and user protection. Requires transparency in advertising, algorithmic recommender systems, and risk assessments for very large online platforms (VLOPs) with 45M+ monthly users.', related: ['EU AI Act', 'Transparency'] },
    { term: 'DKIM (DomainKeys Identified Mail)', definition: 'An email authentication method that allows the receiving server to verify that an email was sent by the domain it claims to be from and was not altered in transit. Works by attaching a digital signature to outgoing emails. Essential for email deliverability and preventing spoofing.', related: ['DMARC', 'SPF', 'Email Security'] },
    { term: 'DMARC (Domain-based Message Authentication, Reporting & Conformance)', definition: 'An email authentication protocol that builds on SPF and DKIM to protect domains from email spoofing and phishing. A DMARC policy tells receiving servers what to do with emails that fail authentication (none, quarantine, or reject). Essential for protecting brand reputation and email deliverability.', related: ['DKIM', 'SPF', 'Email Security'] },
    // E
    { term: 'EAA (European Accessibility Act)', definition: 'EU Directive 2019/882 requiring products and services — including websites and mobile apps — to meet accessibility standards (aligned with WCAG 2.1 AA) from June 28, 2025. Applies to businesses selling to EU consumers.', related: ['WCAG', 'Accessibility'] },
    { term: 'EDPB (European Data Protection Board)', definition: 'The EU body composed of representatives from each national Data Protection Authority and the European Data Protection Supervisor. The EDPB ensures consistent application of GDPR across the EU, issues guidelines and opinions, and resolves disputes between DPAs.', related: ['Supervisory Authority', 'GDPR'] },
    { term: 'Encryption', definition: 'The process of converting data into a coded format that can only be read by authorised parties with the decryption key. GDPR Article 32 explicitly mentions encryption as a technical measure for securing personal data. Types include encryption at rest (stored data) and encryption in transit (data being transmitted, e.g., HTTPS/TLS).', related: ['Security', 'HTTPS'] },
    { term: 'ePrivacy Directive', definition: 'EU Directive 2002/58/EC (amended by 2009/136/EC) governing electronic communications privacy, including rules on cookies, direct marketing, and confidentiality of communications. Often called the "Cookie Law." Will eventually be replaced by the ePrivacy Regulation.', related: ['PECR', 'Cookies', 'Cookie Banner'] },
    { term: 'Erasure (Right to)', definition: 'Also known as the "right to be forgotten." Under GDPR Article 17, individuals can request deletion of their personal data when it is no longer necessary, consent is withdrawn, the data was unlawfully processed, or a legal obligation requires deletion.', related: ['DSAR', 'Data Subject'] },
    { term: 'EU AI Act', definition: 'EU Regulation 2024/1689 establishing harmonised rules on artificial intelligence. Classifies AI systems by risk level (unacceptable, high, limited, minimal) and imposes requirements including transparency obligations for AI-generated content, conformity assessments for high-risk systems, and prohibitions on certain AI practices.', related: ['AI', 'Transparency'] },
    { term: 'EU-US Data Privacy Framework (DPF)', definition: 'An adequacy framework adopted by the European Commission in July 2023 enabling personal data transfers from the EU to certified US organisations. Replaced the invalidated Privacy Shield. Companies must self-certify through the US Department of Commerce and commit to a set of privacy principles.', related: ['Adequacy Decision', 'Data Transfer', 'Schrems II'] },
    // F-G
    { term: 'First-Party Data', definition: 'Data collected directly by an organisation from its own audience or customers through its own channels (website, app, CRM). Considered more privacy-friendly than third-party data and increasingly important as third-party cookies are deprecated.', related: ['Third-Party Data', 'Cookies'] },
    { term: 'GDPR (General Data Protection Regulation)', definition: 'EU Regulation 2016/679, the primary data protection law in the European Union, effective May 25, 2018. Applies to any organisation processing personal data of individuals in the EU/EEA, regardless of where the organisation is located. Establishes principles, rights, and obligations for data protection. Maximum fines: €20M or 4% of global annual turnover.', related: ['DPA', 'DPO', 'Data Subject'] },
    { term: 'Genetic Data', definition: 'Personal data relating to the inherited or acquired genetic characteristics of a natural person, obtained from biological sample analysis (e.g., DNA, RNA). Classified as special category data under GDPR Article 9, requiring explicit consent or another specific exception for processing.', related: ['Biometric Data', 'Special Category Data'] },
    { term: 'Google Consent Mode', definition: 'A framework by Google that adjusts the behavior of Google tags (Analytics, Ads) based on the consent state of users. Version 2 (v2) is required from March 2024 for advertisers using Google Ads in the EEA and UK. Operates through consent signals: ad_storage, analytics_storage, ad_user_data, and ad_personalization.', related: ['Consent', 'CMP', 'Cookies'] },
    { term: 'GPC (Global Privacy Control)', definition: 'A browser-level signal that communicates a user\'s privacy preferences to websites, specifically their wish to opt out of the sale or sharing of personal information. Recognised under CCPA/CPRA and several US state privacy laws as a legally valid opt-out mechanism. Supported by Firefox, Brave, and the DuckDuckGo browser.', related: ['Opt-Out', 'CCPA', 'Do Not Track'] },
    // H-I-J
    { term: 'High Risk Processing', definition: 'Data processing that is likely to result in a high risk to the rights and freedoms of natural persons. Triggers the requirement for a DPIA under GDPR Article 35. Includes large-scale profiling, systematic monitoring of public areas, and processing special categories of data at scale.', related: ['DPIA', 'Risk Assessment'] },
    { term: 'HSTS (HTTP Strict Transport Security)', definition: 'A security header that instructs browsers to only communicate with a website over HTTPS, preventing downgrade attacks and cookie hijacking. Once set, the browser will automatically convert all HTTP requests to HTTPS for the specified duration. A max-age of at least one year and includeSubDomains are recommended best practices.', related: ['HTTPS', 'Security Headers'] },
    { term: 'HTTPS (Hypertext Transfer Protocol Secure)', definition: 'The encrypted version of HTTP using TLS/SSL to protect data transmitted between a user\'s browser and a web server. GDPR Article 32 implicitly requires HTTPS as an appropriate technical measure for protecting personal data in transit. Modern browsers flag HTTP-only sites as "Not Secure."', related: ['TLS', 'Encryption', 'Security'] },
    { term: 'IAB TCF (Transparency & Consent Framework)', definition: 'A standardised framework by the Interactive Advertising Bureau (IAB) enabling digital advertising companies to comply with GDPR and ePrivacy by standardising how consent signals are communicated through the ad tech supply chain. Currently at version 2.2.', related: ['CMP', 'Consent', 'Ad Tech'] },
    { term: 'ICO (Information Commissioner\'s Office)', definition: 'The UK\'s independent data protection authority responsible for enforcing the UK GDPR and Data Protection Act 2018. Has the power to issue fines, conduct audits, and provide guidance.', related: ['Supervisory Authority', 'UK GDPR'] },
    { term: 'Incident Response Plan', definition: 'A documented set of procedures for detecting, responding to, and recovering from data security incidents and breaches. Should cover roles and responsibilities, classification criteria, escalation paths, communication templates (for DPAs and affected individuals), evidence preservation, and post-incident review. Critical for meeting GDPR\'s 72-hour breach notification deadline.', related: ['Data Breach', 'Breach Notification'] },
    { term: 'Information Security', definition: 'The practice of protecting information and data from unauthorised access, use, disclosure, disruption, modification, or destruction. GDPR Article 32 requires controllers and processors to implement appropriate technical and organisational measures to ensure a level of security appropriate to the risk, including encryption, pseudonymisation, and regular testing.', related: ['Encryption', 'Security Headers'] },
    { term: 'IP Address', definition: 'A numerical label assigned to each device on a network. Under GDPR, IP addresses are considered personal data because they can identify or be used to identify a natural person, as confirmed by the CJEU in the Breyer case (C-582/14). Dynamic IP addresses are also personal data when combined with information held by an ISP.', related: ['Personal Data', 'Tracking'] },
    { term: 'Joint Controller', definition: 'Two or more controllers that jointly determine the purposes and means of processing personal data. Must establish a transparent arrangement specifying their respective responsibilities for GDPR compliance, particularly regarding data subject rights.', related: ['Controller', 'DPA'] },
    // K-L
    { term: 'KVKK (Kişisel Verilerin Korunması Kanunu)', definition: 'Turkey\'s Personal Data Protection Law, modelled after the EU Data Protection Directive 95/46/EC. Establishes rights for data subjects, obligations for controllers, and a Data Protection Authority (KVKK Board). Requires explicit consent for processing sensitive data and cross-border transfer restrictions.', related: ['GDPR', 'Data Transfer'] },
    { term: 'Lawful Basis (Legal Basis)', definition: 'One of six grounds under GDPR Article 6 that legitimise the processing of personal data: (1) consent, (2) contract, (3) legal obligation, (4) vital interests, (5) public task, (6) legitimate interest. Processing without a valid legal basis is unlawful.', related: ['Consent', 'Legitimate Interest'] },
    { term: 'Lead Supervisory Authority', definition: 'The DPA of the EU member state where a controller or processor has its main establishment. Under GDPR\'s one-stop-shop mechanism (Article 56), the lead authority coordinates with other concerned DPAs on cross-border processing cases. For example, Ireland\'s DPC is the lead authority for Meta, Google, and Apple on EU matters.', related: ['Supervisory Authority', 'EDPB'] },
    { term: 'Legitimate Interest', definition: 'One of the six lawful bases under GDPR Article 6(1)(f). Allows processing when the controller or a third party has a legitimate interest, provided it does not override the data subject\'s fundamental rights and freedoms. Requires a documented Legitimate Interest Assessment (LIA).', related: ['Lawful Basis', 'LIA'] },
    { term: 'LGPD (Lei Geral de Proteção de Dados)', definition: 'Brazil\'s General Data Protection Law, effective September 2020. Modelled after GDPR, it applies to any processing of personal data collected in Brazil or of individuals in Brazil. Enforced by the ANPD (National Data Protection Authority). Fines up to 2% of revenue, capped at R$50M per violation.', related: ['GDPR', 'Data Transfer'] },
    { term: 'LIA (Legitimate Interest Assessment)', definition: 'A three-part test to determine whether legitimate interest can be used as a lawful basis: (1) identifying the legitimate interest, (2) necessity — is the processing necessary to achieve it?, (3) balancing — do the individual\'s interests override the legitimate interest?', related: ['Legitimate Interest', 'Lawful Basis'] },
    // M-N-O
    { term: 'Metadata', definition: 'Data that provides information about other data — for example, email headers (sender, recipient, timestamps), file properties, or HTTP headers. Under GDPR, metadata can constitute personal data if it can be linked to an identifiable individual. The ePrivacy Directive also protects electronic communications metadata (location data, traffic data).', related: ['Personal Data', 'ePrivacy'] },
    { term: 'Mixed Content', definition: 'A security issue where a webpage served over HTTPS loads resources (scripts, images, iframes) over HTTP. This creates a vulnerability where an attacker could intercept the unencrypted resources. Browsers increasingly block mixed content to protect users.', related: ['HTTPS', 'Security'] },
    { term: 'NIS2 Directive', definition: 'EU Directive 2022/2555 on the security of network and information systems, replacing the original NIS Directive. Expands the scope to more sectors (energy, transport, health, digital infrastructure), introduces stricter security requirements, mandatory incident reporting within 24-72 hours, and supply chain security obligations. Must be transposed into national law by October 2024.', related: ['Information Security', 'Incident Response Plan'] },
    { term: 'NIST Privacy Framework', definition: 'A voluntary framework developed by the US National Institute of Standards and Technology to help organisations manage privacy risk. Structured around five functions: Identify, Govern, Control, Communicate, and Protect. Often used alongside the NIST Cybersecurity Framework for integrated risk management.', related: ['Risk Assessment', 'Information Security'] },
    { term: 'Opt-In', definition: 'A mechanism requiring active, affirmative action by the user before data is collected or processed. GDPR generally requires opt-in consent for cookies (except strictly necessary ones), direct marketing emails, and special category data processing.', related: ['Consent', 'Opt-Out'] },
    { term: 'Opt-Out', definition: 'A mechanism allowing users to withdraw consent or object to data processing after it has started. CCPA primarily uses an opt-out model (e.g., "Do Not Sell My Personal Information"), while GDPR leans toward opt-in. The Global Privacy Control (GPC) signal is a browser-level opt-out.', related: ['Consent', 'CCPA', 'GPC'] },
    // P
    { term: 'PDPA (Personal Data Protection Act)', definition: 'Data protection legislation adopted by several countries in Southeast Asia, notably Singapore (2012) and Thailand (2019). Singapore\'s PDPA is enforced by the PDPC, covers consent-based data processing, establishes a Do Not Call Registry, and imposes fines up to S$1M. Thailand\'s PDPA closely mirrors GDPR with explicit consent requirements and data subject rights.', related: ['GDPR', 'Privacy Rights'] },
    { term: 'PECR (Privacy and Electronic Communications Regulations)', definition: 'UK regulations implementing the ePrivacy Directive. Cover rules on cookies, electronic marketing, and the privacy of electronic communications. Enforced by the ICO alongside UK GDPR.', related: ['ePrivacy', 'ICO', 'Cookies'] },
    { term: 'Personal Data', definition: 'Any information relating to an identified or identifiable natural person ("data subject"). Includes names, email addresses, IP addresses, cookie identifiers, location data, biometric data, and any factor specific to the physical, physiological, genetic, mental, economic, cultural, or social identity of that person.', related: ['Data Subject', 'Special Category Data'] },
    { term: 'PIPEDA (Personal Information Protection and Electronic Documents Act)', definition: 'Canada\'s federal privacy law governing how private-sector organisations collect, use, and disclose personal information in the course of commercial activity. Being replaced by the Consumer Privacy Protection Act (CPPA) pending Parliamentary approval.', related: ['CPPA', 'Data Transfer'] },
    { term: 'Pixel (Tracking Pixel)', definition: 'A tiny 1x1 transparent image embedded in a webpage or email that sends information back to a server when loaded. Used to track page views, email opens, and user behaviour. Common examples include the Meta Pixel (formerly Facebook Pixel) and LinkedIn Insight Tag. Under GDPR, tracking pixels require prior informed consent.', related: ['Tracker', 'Consent'] },
    { term: 'Privacy by Design', definition: 'A GDPR requirement (Article 25) that organisations integrate data protection into the design of their systems and processes from the outset, not as an afterthought. Includes data minimisation by default, pseudonymisation, and building in privacy safeguards.', related: ['Data Minimisation', 'GDPR Principles'] },
    { term: 'Privacy Impact Assessment (PIA)', definition: 'A broader risk assessment process (predating GDPR) for identifying and mitigating privacy risks in new projects, systems, or processes. While GDPR formalised this as the DPIA, many organisations still use the term PIA for less formal assessments or assessments under non-EU privacy laws (e.g., PIPEDA, CCPA impact assessments).', related: ['DPIA', 'Risk Assessment'] },
    { term: 'Privacy Notice (Privacy Policy)', definition: 'A public-facing document explaining what personal data an organisation collects, why, how it\'s used, who it\'s shared with, how long it\'s retained, and what rights individuals have. GDPR Articles 13 and 14 specify the minimum required contents.', related: ['Article 13 Notice', 'Transparency'] },
    { term: 'Privacy Shield', definition: 'A former EU-US data transfer framework invalidated by the Court of Justice of the EU (CJEU) in the Schrems II ruling (July 2020) due to inadequate protection against US government surveillance. Replaced by the EU-US Data Privacy Framework (DPF) in July 2023.', related: ['Schrems II', 'EU-US Data Privacy Framework'] },
    { term: 'Processor (Data Processor)', definition: 'A natural or legal person, public authority, or body that processes personal data on behalf of and under the instructions of a controller. Must be governed by a DPA under GDPR Article 28. Examples: cloud hosting providers, email marketing services, analytics platforms.', related: ['Controller', 'DPA', 'Sub-Processor'] },
    { term: 'Profiling', definition: 'Any form of automated processing of personal data to evaluate certain personal aspects of a natural person, including analysing or predicting work performance, economic situation, health, personal preferences, interests, reliability, behaviour, location, or movements. Subject to additional safeguards under GDPR Article 22.', related: ['Automated Decision-Making', 'DPIA'] },
    { term: 'Pseudonymisation', definition: 'Processing personal data so that it can no longer be attributed to a specific data subject without the use of additional information, which is kept separately under technical and organisational measures. Unlike anonymisation, pseudonymised data remains personal data under GDPR but is considered a security safeguard.', related: ['Anonymisation', 'Security'] },
    { term: 'Purpose Limitation', definition: 'A GDPR principle requiring that personal data is collected for specified, explicit, and legitimate purposes and not further processed in a manner incompatible with those purposes. Organisations must clearly define purposes before processing begins.', related: ['Data Minimisation', 'GDPR Principles'] },
    // R
    { term: 'Records of Processing Activities (ROPA)', definition: 'Documentation required under GDPR Article 30 detailing all data processing activities, including purposes, categories of data and data subjects, recipients, retention periods, and security measures. Controllers and some processors (250+ employees or high-risk processing) must maintain these records.', related: ['Controller', 'Processor'] },
    { term: 'Rectification (Right to)', definition: 'Under GDPR Article 16, individuals have the right to obtain the correction of inaccurate personal data and the completion of incomplete personal data. Controllers must respond to rectification requests without undue delay and inform any recipients of the corrected data.', related: ['Data Subject', 'Privacy Rights'] },
    { term: 'Referrer Policy', definition: 'An HTTP header that controls how much referrer information (the URL of the previous page) is included with requests made from a page. Privacy-focused policies like "strict-origin-when-cross-origin" or "no-referrer" prevent leaking sensitive URL parameters to third-party sites, which is especially important when URLs contain personal data.', related: ['Security Headers', 'Privacy by Design'] },
    { term: 'Retention Period', definition: 'The duration for which personal data is stored. Under GDPR\'s storage limitation principle, data must not be kept longer than necessary for the purposes for which it was collected. Organisations must define and document retention periods for each category of data.', related: ['Data Minimisation', 'Purpose Limitation'] },
    { term: 'Right to Access', definition: 'Under GDPR Article 15, individuals have the right to obtain confirmation of whether their data is being processed and, if so, to receive a copy of the data along with information about the purposes, categories, recipients, retention period, source, and existence of automated decision-making.', related: ['DSAR', 'Data Subject'] },
    { term: 'Right to Portability', definition: 'Under GDPR Article 20, individuals have the right to receive their personal data in a structured, commonly used, and machine-readable format, and to transmit that data to another controller. Applies only to data processed by automated means based on consent or contract.', related: ['Data Subject', 'Privacy Rights'] },
    { term: 'Right to Restriction', definition: 'Under GDPR Article 18, individuals can request that processing of their personal data is restricted (i.e., stored but not actively used) in specific circumstances: when accuracy is contested, processing is unlawful but the data subject opposes erasure, the controller no longer needs the data but the data subject needs it for legal claims, or pending verification of an objection.', related: ['Data Subject', 'Privacy Rights'] },
    // S
    { term: 'Schrems II', definition: 'A landmark 2020 ruling by the Court of Justice of the EU (Case C-311/18) that invalidated the EU-US Privacy Shield and imposed additional requirements on Standard Contractual Clauses (SCCs). Named after Austrian privacy activist Max Schrems. The ruling requires organisations to assess whether the recipient country\'s laws provide essentially equivalent data protection before transferring data.', related: ['Privacy Shield', 'SCCs', 'Transfer Impact Assessment'] },
    { term: 'SCCs (Standard Contractual Clauses)', definition: 'Pre-approved contractual terms adopted by the European Commission that provide appropriate safeguards for international data transfers to countries without an adequacy decision. The 2021 modernised SCCs replaced all previous versions as of December 27, 2022.', related: ['Data Transfer', 'BCRs', 'Adequacy Decision'] },
    { term: 'Security Headers', definition: 'HTTP response headers that enhance website security: Content-Security-Policy (CSP), Strict-Transport-Security (HSTS), X-Content-Type-Options, X-Frame-Options, Referrer-Policy, and Permissions-Policy. Implementing these is considered a technical measure for GDPR Article 32 security obligations.', related: ['Security', 'HTTPS'] },
    { term: 'Sensitive Data (Special Category Data)', definition: 'Personal data revealing racial or ethnic origin, political opinions, religious or philosophical beliefs, trade union membership, genetic data, biometric data, health data, or data concerning a person\'s sex life or sexual orientation. Processing is prohibited under GDPR Article 9 unless a specific exception applies.', related: ['Personal Data', 'Consent'] },
    { term: 'Server-Side Tracking', definition: 'A method of collecting analytics and marketing data by sending events from a website to a server-side endpoint, which then forwards the data to third-party services (e.g., Google Analytics, Meta). Provides greater control over what data is shared, reduces client-side JavaScript, and is more resistant to ad blockers, but still requires compliance with cookie consent rules under GDPR.', related: ['Tracker', 'Google Consent Mode'] },
    { term: 'SPF (Sender Policy Framework)', definition: 'An email authentication standard that allows domain owners to specify which mail servers are authorised to send email on behalf of their domain. Receiving servers check the SPF record in DNS to verify the sender. Helps prevent email spoofing but should be used alongside DKIM and DMARC for full protection.', related: ['DKIM', 'DMARC', 'Email Security'] },
    { term: 'Storage Limitation', definition: 'A GDPR principle (Article 5(1)(e)) requiring that personal data is kept in a form that permits identification of data subjects for no longer than is necessary for the purposes for which it is processed. Organisations must implement data retention schedules, periodic reviews, and automated deletion policies.', related: ['Retention Period', 'GDPR Principles'] },
    { term: 'Sub-Processor', definition: 'A third party engaged by a data processor to carry out specific processing activities on behalf of the controller. Under GDPR Article 28(2), processors must obtain prior written authorisation from the controller before engaging sub-processors.', related: ['Processor', 'DPA'] },
    { term: 'Supervisory Authority (DPA)', definition: 'An independent public authority established by an EU member state to monitor and enforce GDPR compliance. Examples: CNIL (France), BfDI (Germany), AEPD (Spain), DPC (Ireland), Garante (Italy), ICO (UK). Has the power to investigate, audit, issue warnings, and impose administrative fines.', related: ['EDPB', 'GDPR'] },
    // T
    { term: 'Third-Party Cookie', definition: 'A cookie set by a domain other than the one the user is visiting. Primarily used for cross-site tracking and advertising. Major browsers are deprecating or restricting third-party cookies. Google Chrome planned phase-out but has pivoted to a user-choice model.', related: ['Cookie', 'First-Party Data', 'Tracking'] },
    { term: 'Third-Party Data', definition: 'Data acquired from external sources that did not originally collect it from the data subjects. Often aggregated and sold by data brokers. Under GDPR, processing third-party data requires a valid legal basis and transparency about the data source (Article 14 notice). Increasingly scrutinised by regulators.', related: ['First-Party Data', 'Article 14 Notice'] },
    { term: 'TLS (Transport Layer Security)', definition: 'A cryptographic protocol that provides end-to-end encryption for data in transit over the internet. The successor to SSL. TLS 1.3 (the current standard) is faster and more secure than previous versions. Websites should disable TLS 1.0 and 1.1, which are considered insecure and deprecated.', related: ['HTTPS', 'Encryption', 'Security'] },
    { term: 'Tracker', definition: 'Any technology (cookies, pixels, scripts, fingerprinting) used to monitor user behaviour across websites or applications. Examples include Google Analytics, Facebook Pixel, and HubSpot tracking code. Under GDPR and ePrivacy, most trackers require prior consent.', related: ['Cookie', 'Browser Fingerprinting', 'Consent'] },
    { term: 'Transparency', definition: 'A fundamental GDPR principle requiring that personal data is processed in a lawful, fair, and transparent manner. Individuals must be informed in clear and plain language about how their data is collected, used, and shared.', related: ['Privacy Notice', 'Article 13 Notice'] },
    { term: 'Transfer Impact Assessment (TIA)', definition: 'An assessment required following the Schrems II ruling to evaluate whether the level of data protection in the recipient country is essentially equivalent to that in the EEA, taking into account the laws and practices of the recipient country and any supplementary measures.', related: ['SCCs', 'Data Transfer', 'Schrems II'] },
    // U-V-W-Z
    { term: 'UK GDPR', definition: 'The retained version of the EU GDPR incorporated into UK law after Brexit, as amended by the Data Protection Act 2018. Substantially similar to EU GDPR but enforced by the ICO. Data transfers from the EU to the UK are governed by an adequacy decision (extended to June 2025).', related: ['GDPR', 'ICO', 'Adequacy Decision'] },
    { term: 'Vendor Risk Assessment', definition: 'The process of evaluating third-party vendors and service providers to determine the privacy and security risks they pose. Under GDPR, controllers must ensure their processors provide sufficient guarantees (Article 28). Assessments should cover data processing locations, sub-processors, security certifications (ISO 27001, SOC 2), breach history, and data transfer mechanisms.', related: ['Processor', 'Sub-Processor', 'DPA'] },
    { term: 'WCAG (Web Content Accessibility Guidelines)', definition: 'Internationally recognised guidelines published by the W3C for making web content accessible to people with disabilities. WCAG 2.1 Level AA is the standard referenced by the European Accessibility Act (EAA) and many national accessibility laws.', related: ['EAA', 'Accessibility'] },
    { term: 'Zero-Party Data', definition: 'Data that a customer intentionally and proactively shares with a brand, such as preferences, purchase intentions, personal context, and how they want to be recognised. Unlike first-party data (observed behaviour), zero-party data is explicitly provided. Examples include survey responses, preference centre selections, and quiz answers. Considered the most privacy-compliant form of customer data.', related: ['First-Party Data', 'Consent'] },
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
        description: 'Comprehensive glossary of 120+ privacy, GDPR, CCPA, and data protection terms with clear definitions.',
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
                        Clear, jargon-free definitions for <strong>120+ privacy and compliance terms</strong> — from GDPR and CCPA to cookies, consent, and data transfers.
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
