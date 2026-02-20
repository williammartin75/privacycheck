import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'dsgvo-website-check-kostenlos')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                <strong>Kurzfassung:</strong> Ein DSGVO-Website-Check analysiert Ihre Website auf datenschutzrechtliche
                Schwachstellen &mdash; von Cookie-Consent-Bannern &uuml;ber Datenschutzerkl&auml;rungen bis hin zu
                Tracking-Diensten und Sicherheitsheadern. Mit dem kostenlosen Tool von PrivacyChecker erhalten Sie in
                unter 60 Sekunden einen vollst&auml;ndigen Compliance-Bericht.
            </p>

            <h2>Warum brauchen Sie einen DSGVO-Website-Check?</h2>
            <p>
                Seit dem Inkrafttreten der DSGVO im Mai 2018 sind alle Unternehmen, die personenbezogene Daten von
                EU-B&uuml;rgern verarbeiten, zur Einhaltung strenger Datenschutzvorschriften verpflichtet. Das gilt
                f&uuml;r <strong>jeden Website-Betreiber</strong> &mdash; vom Einzelunternehmer bis zum internationalen
                Konzern.
            </p>
            <p>
                Die meisten Websiten versto&szlig;en unwissentlich gegen die DSGVO. H&auml;ufige Probleme sind:
            </p>
            <ul>
                <li>Fehlende oder fehlerhafte <strong>Cookie-Consent-Banner</strong></li>
                <li>Unvollst&auml;ndige <strong>Datenschutzerkl&auml;rung</strong></li>
                <li>Tracking ohne Einwilligung (Google Analytics, Facebook Pixel)</li>
                <li>Fehlende <strong>SSL/TLS-Verschl&uuml;sselung</strong> (kein HTTPS)</li>
                <li>Externe Ressourcen wie Google Fonts ohne Einwilligung</li>
                <li>Fehlende Angaben zum <strong>Datenschutzbeauftragten (DSB)</strong></li>
            </ul>

            <h2>DSGVO-Bu&szlig;gelder: Das finanzielle Risiko</h2>
            <p>
                Die Datenschutzbeh&ouml;rden in Deutschland und &Ouml;sterreich setzen die DSGVO konsequent durch.
                Die m&ouml;glichen Strafen sind erheblich:
            </p>
            <table>
                <thead>
                    <tr><th>Versto&szlig;</th><th>H&ouml;chststrafe</th><th>Beispiel</th></tr>
                </thead>
                <tbody>
                    <tr><td>Schwerwiegend (Art. 83 Abs. 5)</td><td>20 Mio. &euro; oder 4% des Jahresumsatzes</td><td>Fehlende Rechtsgrundlage f&uuml;r Datenverarbeitung</td></tr>
                    <tr><td>Weniger schwerwiegend (Art. 83 Abs. 4)</td><td>10 Mio. &euro; oder 2% des Jahresumsatzes</td><td>Fehlende technische Ma&szlig;nahmen</td></tr>
                    <tr><td>Google Fonts (LG M&uuml;nchen)</td><td>100 &euro; pro Seitenaufruf</td><td>IP-Transfer an Google ohne Einwilligung</td></tr>
                    <tr><td>Fehlender Cookie-Banner</td><td>Bis zu 300.000 &euro;</td><td>CNIL/BfDI-Durchsetzungsverfahren</td></tr>
                </tbody>
            </table>

            <h2>Was pr&uuml;ft ein DSGVO-Website-Check?</h2>
            <p>
                Ein umfassender DSGVO-Check analysiert Ihre Website in mehreren Kategorien:
            </p>

            <h3>1. Cookie-Analyse</h3>
            <ul>
                <li>Welche Cookies werden gesetzt? (First-Party, Third-Party)</li>
                <li>Werden Cookies <strong>vor der Einwilligung</strong> gesetzt?</li>
                <li>Sind alle Cookies in der Datenschutzerkl&auml;rung deklariert?</li>
                <li>Entspricht die Cookie-Laufzeit den Empfehlungen (max. 13 Monate)?</li>
            </ul>

            <h3>2. Consent-Banner-Pr&uuml;fung</h3>
            <ul>
                <li>Ist ein Cookie-Banner vorhanden?</li>
                <li>Bietet es eine echte <strong>Ablehnungsoption</strong> (nicht nur &bdquo;Akzeptieren&ldquo;)?</li>
                <li>Werden <strong>Dark Patterns</strong> verwendet (z.B. farblich hervorgehobener Akzeptieren-Button)?</li>
                <li>Funktioniert die Ablehnung technisch korrekt?</li>
            </ul>

            <h3>3. Datenschutzerkl&auml;rung</h3>
            <ul>
                <li>Ist eine Datenschutzerkl&auml;rung vorhanden und vollst&auml;ndig?</li>
                <li>Sind alle <strong>Pflichtangaben nach Art. 13 DSGVO</strong> enthalten?</li>
                <li>Wird der Datenschutzbeauftragte genannt?</li>
                <li>Sind die Angaben zu Drittlandtransfers aktuell?</li>
            </ul>

            <h3>4. Sicherheits-Check</h3>
            <ul>
                <li><strong>HTTPS/SSL:</strong> Ist die Verbindung verschl&uuml;sselt?</li>
                <li><strong>HSTS:</strong> Wird HTTP Strict Transport Security verwendet?</li>
                <li><strong>Security Headers:</strong> Content-Security-Policy, X-Frame-Options, etc.</li>
                <li><strong>SPF/DKIM/DMARC:</strong> E-Mail-Authentifizierung konfiguriert?</li>
            </ul>

            <h3>5. Tracker &amp; externe Dienste</h3>
            <ul>
                <li>Welche <strong>Third-Party-Tracker</strong> sind eingebunden?</li>
                <li>Werden Google Analytics, Facebook Pixel oder &auml;hnliche Dienste vor der Einwilligung geladen?</li>
                <li>Gibt es <strong>Google Fonts</strong> &uuml;ber CDN (IP-Transfer-Problem)?</li>
                <li>Werden externe Ressourcen ohne Einwilligung geladen?</li>
            </ul>

            <h2>DSGVO-Check in 3 Schritten</h2>
            <ol>
                <li><strong>Website-URL eingeben:</strong> Geben Sie Ihre Domain auf <a href="/">privacychecker.pro</a> ein</li>
                <li><strong>Automatische Analyse:</strong> Unser Scanner pr&uuml;ft bis zu 200 Unterseiten auf DSGVO-Verst&ouml;&szlig;e</li>
                <li><strong>Bericht erhalten:</strong> Sie erhalten einen detaillierten Compliance-Score mit konkreten Handlungsempfehlungen</li>
            </ol>

            <h2>Die h&auml;ufigsten DSGVO-Verst&ouml;&szlig;e auf deutschen Websites</h2>
            <table>
                <thead>
                    <tr><th>Rang</th><th>Versto&szlig;</th><th>H&auml;ufigkeit</th><th>Risikostufe</th></tr>
                </thead>
                <tbody>
                    <tr><td>1</td><td>Tracking ohne Einwilligung</td><td>67% aller Websites</td><td>Hoch</td></tr>
                    <tr><td>2</td><td>Kein richtiger Cookie-Banner</td><td>58%</td><td>Hoch</td></tr>
                    <tr><td>3</td><td>Google Fonts &uuml;ber CDN</td><td>43%</td><td>Mittel</td></tr>
                    <tr><td>4</td><td>Unvollst&auml;ndige Datenschutzerkl&auml;rung</td><td>41%</td><td>Mittel</td></tr>
                    <tr><td>5</td><td>Fehlende SSL-Verschl&uuml;sselung</td><td>12%</td><td>Kritisch</td></tr>
                </tbody>
            </table>

            <h2>Kostenloser vs. Pro DSGVO-Check</h2>
            <table>
                <thead>
                    <tr><th>Funktion</th><th>Kostenlos</th><th>Pro</th><th>Pro+</th></tr>
                </thead>
                <tbody>
                    <tr><td>Seiten gescannt</td><td>20</td><td>100</td><td>200</td></tr>
                    <tr><td>Cookie-Analyse</td><td>Ja</td><td>Ja</td><td>Ja</td></tr>
                    <tr><td>Tracker-Erkennung</td><td>Ja</td><td>Ja</td><td>Ja</td></tr>
                    <tr><td>Security Headers</td><td>Ja</td><td>Ja</td><td>Ja</td></tr>
                    <tr><td>Dark Patterns Erkennung</td><td>Begrenzt</td><td>Vollst&auml;ndig</td><td>Vollst&auml;ndig</td></tr>
                    <tr><td>Domain-Risiko-Analyse</td><td>&mdash;</td><td>Ja</td><td>Ja</td></tr>
                    <tr><td>E-Mail-Sicherheitscheck</td><td>&mdash;</td><td>Ja</td><td>Ja</td></tr>
                    <tr><td>PDF-Export</td><td>&mdash;</td><td>Ja</td><td>Ja</td></tr>
                    <tr><td>Supply-Chain-Analyse</td><td>&mdash;</td><td>&mdash;</td><td>Ja</td></tr>
                    <tr><td>Bu&szlig;geld-Risikosch&auml;tzung</td><td>&mdash;</td><td>&mdash;</td><td>Ja</td></tr>
                </tbody>
            </table>

            <h2>Nach dem Check: Die wichtigsten Ma&szlig;nahmen</h2>
            <p>
                Die Ergebnisse Ihres DSGVO-Checks zeigen Ihnen genau, wo Handlungsbedarf besteht.
                Priorisieren Sie die Behebung nach Risikostufe:
            </p>
            <ol>
                <li><strong>Kritisch:</strong> HTTPS aktivieren, Tracking ohne Einwilligung stoppen</li>
                <li><strong>Hoch:</strong> Cookie-Banner korrigieren, Datenschutzerkl&auml;rung erg&auml;nzen</li>
                <li><strong>Mittel:</strong> Google Fonts selbst hosten, Security Headers konfigurieren</li>
                <li><strong>Niedrig:</strong> Cookie-Laufzeiten optimieren, Meta-Tags pr&uuml;fen</li>
            </ol>

            <h2>H&auml;ufig gestellte Fragen</h2>

            <h3>Wie oft sollte ich einen DSGVO-Check durchf&uuml;hren?</h3>
            <p>
                Mindestens <strong>vierteljährlich</strong> oder nach jeder &Auml;nderung an Ihrer Website.
                Neue Plugins, Marketing-Tools oder CMS-Updates k&ouml;nnen unbemerkt neue Tracker einf&uuml;gen.
                Mit PrivacyChecker Pro k&ouml;nnen Sie automatische monatliche Scans einrichten.
            </p>

            <h3>Gilt die DSGVO auch f&uuml;r kleine Unternehmen?</h3>
            <p>
                <strong>Ja.</strong> Die DSGVO gilt f&uuml;r alle Unternehmen, die personenbezogene Daten von
                EU-B&uuml;rgern verarbeiten &mdash; unabh&auml;ngig von der Unternehmensgr&ouml;&szlig;e.
                Auch ein Einzelunternehmer mit einer einfachen Website muss die DSGVO einhalten.
            </p>

            <h3>Was ist der Unterschied zwischen DSGVO und BDSG?</h3>
            <p>
                Die DSGVO ist die europ&auml;ische Verordnung, die in allen EU-Mitgliedstaaten direkt gilt.
                Das <strong>Bundesdatenschutzgesetz (BDSG)</strong> erg&auml;nzt die DSGVO mit nationalen
                Regelungen f&uuml;r Deutschland, z.B. zur Bestellung eines Datenschutzbeauftragten
                (ab 20 Mitarbeitern, die regelm&auml;&szlig;ig personenbezogene Daten verarbeiten).
            </p>
        </ArticleLayout>
    );
}
