import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'cookie-banner-deutschland-pflicht')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                <strong>Kurzfassung:</strong> Ja, ein Cookie-Banner ist in Deutschland Pflicht &mdash; zumindest dann,
                wenn Ihre Website nicht-essenzielle Cookies verwendet. Das betrifft praktisch jede Website mit
                Google Analytics, Marketing-Pixeln oder Social-Media-Einbindungen. Hier erfahren Sie genau, was Sie
                beachten m&uuml;ssen und wie Sie h&auml;ufige Fehler vermeiden.
            </p>

            <h2>Die rechtliche Grundlage: DSGVO, TTDSG und ePrivacy</h2>
            <p>
                Die Cookie-Pflicht in Deutschland ergibt sich aus dem Zusammenspiel mehrerer Gesetze:
            </p>
            <table>
                <thead>
                    <tr><th>Gesetz</th><th>Was es regelt</th><th>Relevanz f&uuml;r Cookies</th></tr>
                </thead>
                <tbody>
                    <tr><td><strong>DSGVO</strong> (EU)</td><td>Verarbeitung personenbezogener Daten</td><td>Rechtsgrundlage f&uuml;r Datenverarbeitung, Einwilligungspflicht</td></tr>
                    <tr><td><strong>TTDSG</strong> (&sect; 25)</td><td>Zugriff auf Endeinrichtungen</td><td>Einwilligung f&uuml;r Cookies und &auml;hnliche Technologien</td></tr>
                    <tr><td><strong>ePrivacy-Richtlinie</strong> (EU)</td><td>Vertraulichkeit elektronischer Kommunikation</td><td>Basis f&uuml;r nationale Cookie-Gesetze wie das TTDSG</td></tr>
                </tbody>
            </table>
            <p>
                Seit dem <strong>1. Dezember 2021</strong> gilt in Deutschland das Telekommunikation-Telemedien-Datenschutzgesetz
                (TTDSG). <strong>&sect; 25 TTDSG</strong> regelt konkret: Das Speichern von Informationen auf der
                Endeinrichtung des Nutzers (= Cookies setzen) oder der Zugriff auf bereits gespeicherte Informationen
                (= Cookies lesen) bedarf grunds&auml;tzlich der <strong>Einwilligung des Nutzers</strong>.
            </p>

            <h2>Wann ist ein Cookie-Banner Pflicht?</h2>
            <p>Die Antwort h&auml;ngt von der Art der verwendeten Cookies ab:</p>
            <table>
                <thead>
                    <tr><th>Cookie-Art</th><th>Beispiel</th><th>Einwilligung n&ouml;tig?</th></tr>
                </thead>
                <tbody>
                    <tr><td><strong>Technisch notwendig</strong></td><td>Session-ID, Warenkorb, Spracheinstellung</td><td>Nein</td></tr>
                    <tr><td><strong>Analyse/Statistik</strong></td><td>Google Analytics, Matomo (mit Cookies)</td><td>Ja</td></tr>
                    <tr><td><strong>Marketing/Tracking</strong></td><td>Facebook Pixel, Google Ads, Criteo</td><td>Ja</td></tr>
                    <tr><td><strong>Personalisierung</strong></td><td>A/B-Testing, Content-Empfehlungen</td><td>Ja</td></tr>
                    <tr><td><strong>Social Media</strong></td><td>YouTube-Embed, Instagram-Feed, Like-Buttons</td><td>Ja</td></tr>
                </tbody>
            </table>
            <p>
                <strong>Fazit:</strong> Wenn Ihre Website <em>nur</em> technisch notwendige Cookies verwendet
                (was selten ist), brauchen Sie theoretisch keinen Cookie-Banner. Sobald Sie aber Google Analytics,
                Social-Media-Plugins oder Marketing-Tools nutzen, ist ein Cookie-Banner <strong>rechtlich verpflichtend</strong>.
            </p>

            <h2>Pflichtangaben im Cookie-Banner</h2>
            <p>
                Ein rechtskonformer Cookie-Banner in Deutschland muss folgende Elemente enthalten:
            </p>
            <ol>
                <li><strong>Klare Information:</strong> Welche Cookies werden verwendet und wozu?</li>
                <li><strong>Echte Wahlm&ouml;glichkeit:</strong> Gleichwertige Buttons f&uuml;r &bdquo;Akzeptieren&ldquo; und &bdquo;Ablehnen&ldquo;</li>
                <li><strong>Granulare Einstellungen:</strong> M&ouml;glichkeit, einzelne Cookie-Kategorien zu w&auml;hlen</li>
                <li><strong>Widerrufsoption:</strong> Jederzeit die Einwilligung &auml;ndern oder widerrufen k&ouml;nnen</li>
                <li><strong>Link zur Datenschutzerkl&auml;rung:</strong> Vollst&auml;ndige Informationen gem&auml;&szlig; Art. 13 DSGVO</li>
            </ol>

            <h2>H&auml;ufige Fehler bei Cookie-Bannern</h2>

            <h3>Dark Patterns &mdash; Verbotene Gestaltungstricks</h3>
            <p>
                Die deutschen Datenschutzaufsichtsbeh&ouml;rden und der Europ&auml;ische Datenschutzausschuss (EDSA)
                haben klare Richtlinien gegen manipulative Gestaltung von Cookie-Bannern herausgegeben:
            </p>
            <table>
                <thead>
                    <tr><th>Dark Pattern</th><th>Beschreibung</th><th>Rechtswidrig?</th></tr>
                </thead>
                <tbody>
                    <tr><td>Farblicher Kontrast</td><td>&bdquo;Akzeptieren&ldquo; in knalligem Gr&uuml;n, &bdquo;Ablehnen&ldquo; in hellem Grau</td><td>Ja</td></tr>
                    <tr><td>Versteckte Ablehnung</td><td>Ablehnung nur &uuml;ber &bdquo;Einstellungen&ldquo; &rarr; Unterseite</td><td>Ja</td></tr>
                    <tr><td>Cookie Wall</td><td>Website nur nutzbar nach &bdquo;Akzeptieren&ldquo;</td><td>Ja</td></tr>
                    <tr><td>Nudging</td><td>&bdquo;Sind Sie sicher?&ldquo;-Dialog bei Ablehnung</td><td>Ja</td></tr>
                    <tr><td>Vorangekreuzte Boxen</td><td>Cookie-Kategorien bereits aktiviert</td><td>Ja (seit BGH-Urteil Planet49)</td></tr>
                </tbody>
            </table>

            <h3>Technische Fehler</h3>
            <ul>
                <li><strong>Cookies vor Einwilligung:</strong> Tracking-Cookies werden noch vor dem Klick auf &bdquo;Akzeptieren&ldquo; gesetzt</li>
                <li><strong>Banner-Umgehung:</strong> Tracker laden trotz Ablehnung</li>
                <li><strong>Fehlende Dokumentation:</strong> Keine Protokollierung der erteilten Einwilligungen</li>
                <li><strong>Ablauf der Einwilligung:</strong> Einwilligung wird nicht periodisch erneuert (Empfehlung: alle 12 Monate)</li>
            </ul>

            <h2>Aktuelle Urteile und Durchsetzung</h2>
            <table>
                <thead>
                    <tr><th>Jahr</th><th>Beh&ouml;rde/Gericht</th><th>Entscheidung</th><th>Bu&szlig;geld</th></tr>
                </thead>
                <tbody>
                    <tr><td>2020</td><td>BGH</td><td>Planet49-Urteil: Vorangekreuzte Checkboxen sind keine g&uuml;ltige Einwilligung</td><td>&mdash;</td></tr>
                    <tr><td>2022</td><td>LG M&uuml;nchen I</td><td>Google Fonts &uuml;ber CDN = DSGVO-Versto&szlig;</td><td>100 &euro;/Aufruf</td></tr>
                    <tr><td>2022</td><td>DSK</td><td>Orientierungshilfe Telemedien: Klare Anforderungen an Cookie-Banner</td><td>&mdash;</td></tr>
                    <tr><td>2023</td><td>Noyb</td><td>Massenbeschwerden gegen Cookie-Banner bei deutschen Websites</td><td>Laufend</td></tr>
                    <tr><td>2024</td><td>BfDI</td><td>Verst&auml;rkte Kontrollen bei Bundesbeh&ouml;rden</td><td>Laufend</td></tr>
                </tbody>
            </table>

            <h2>Empfohlene Cookie-Banner-L&ouml;sungen</h2>
            <table>
                <thead>
                    <tr><th>L&ouml;sung</th><th>Typ</th><th>Google Consent Mode v2</th><th>Preis</th></tr>
                </thead>
                <tbody>
                    <tr><td>Cookiebot</td><td>Cloud (SaaS)</td><td>Ja</td><td>ab 9 &euro;/Monat</td></tr>
                    <tr><td>Usercentrics</td><td>Cloud (SaaS)</td><td>Ja</td><td>ab 49 &euro;/Monat</td></tr>
                    <tr><td>Borlabs Cookie</td><td>WordPress Plugin</td><td>Ja</td><td>ab 39 &euro;/Jahr</td></tr>
                    <tr><td>Klaro!</td><td>Open Source (Self-hosted)</td><td>Manuell</td><td>Kostenlos</td></tr>
                    <tr><td>CIVIC Cookie Control</td><td>Cloud/Self-hosted</td><td>Manuell</td><td>ab 39 &pound;/Jahr</td></tr>
                </tbody>
            </table>

            <h2>Checkliste: Cookie-Banner DSGVO-konform gestalten</h2>
            <ol>
                <li>Gleichwertige Buttons f&uuml;r &bdquo;Akzeptieren&ldquo; und &bdquo;Ablehnen&ldquo; &mdash; gleiche Gr&ouml;&szlig;e, gleicher Kontrast</li>
                <li>Keine vorangekreuzten Checkboxen</li>
                <li>Keine Cookies vor der Einwilligung setzen</li>
                <li>Einzelne Cookie-Kategorien ausw&auml;hlbar machen</li>
                <li>Widerrufsoption dauerhaft sichtbar bereitstellen</li>
                <li>Link zur Datenschutzerkl&auml;rung im Banner</li>
                <li>Einwilligungen dokumentieren und speichern</li>
                <li>Google Consent Mode v2 implementieren (f&uuml;r Google-Dienste)</li>
                <li>Cookie-Banner regelm&auml;&szlig;ig testen &mdash; besonders nach CMS-Updates</li>
                <li>Kostenlosen <a href="/">DSGVO-Check mit PrivacyChecker</a> durchf&uuml;hren</li>
            </ol>

            <h2>H&auml;ufig gestellte Fragen</h2>

            <h3>Brauche ich einen Cookie-Banner, wenn ich keine Cookies setze?</h3>
            <p>
                Wenn Ihre Website wirklich <strong>keine</strong> Cookies setzt und keine &auml;hnlichen
                Tracking-Technologien verwendet (Fingerprinting, Local Storage f&uuml;r Tracking), dann nein.
                Aber das ist in der Praxis extrem selten. Selbst eingebettete YouTube-Videos oder
                Social-Media-Buttons setzen Cookies.
            </p>

            <h3>Reicht ein einfacher Hinweis &bdquo;Diese Website verwendet Cookies&ldquo;?</h3>
            <p>
                <strong>Nein.</strong> Seit dem BGH-Urteil zu Planet49 (2020) ist klar: Ein blo&szlig;er Hinweis
                ohne echte Wahlm&ouml;glichkeit ist <strong>keine g&uuml;ltige Einwilligung</strong>. Der Nutzer
                muss aktiv zustimmen oder ablehnen k&ouml;nnen.
            </p>

            <h3>Was ist der Unterschied zwischen DSGVO und TTDSG bei Cookies?</h3>
            <p>
                Das <strong>TTDSG (&sect; 25)</strong> regelt den technischen Zugriff auf das Endger&auml;t
                (Cookie setzen/lesen). Die <strong>DSGVO</strong> regelt die anschlie&szlig;ende Verarbeitung
                der damit erhobenen personenbezogenen Daten. In der Praxis m&uuml;ssen beide Gesetze
                gleichzeitig beachtet werden.
            </p>
        </ArticleLayout>
    );
}
