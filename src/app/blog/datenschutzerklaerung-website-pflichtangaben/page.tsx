import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'datenschutzerklaerung-website-pflichtangaben')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                <strong>Kurzfassung:</strong> Jede Website, die personenbezogene Daten verarbeitet, braucht
                eine Datenschutzerkl&auml;rung. Das betrifft <strong>praktisch jede Website</strong> &mdash;
                denn schon das Erfassen einer IP-Adresse ist Datenverarbeitung. Hier finden Sie alle
                Pflichtangaben und eine Schritt-f&uuml;r-Schritt-Anleitung.
            </p>

            <h2>Warum ist eine Datenschutzerkl&auml;rung Pflicht?</h2>
            <p>
                Die DSGVO verpflichtet in <strong>Art. 13 und Art. 14</strong> jeden Verantwortlichen, betroffene
                Personen &uuml;ber die Verarbeitung ihrer personenbezogenen Daten zu informieren. Diese
                Informationspflicht wird in der Regel durch eine Datenschutzerkl&auml;rung auf der Website erf&uuml;llt.
            </p>
            <p>
                <strong>Wichtig:</strong> Eine fehlende oder unvollst&auml;ndige Datenschutzerkl&auml;rung ist
                nicht nur ein DSGVO-Versto&szlig; (Bu&szlig;geld bis 20 Mio. &euro;), sondern auch ein
                <strong>Wettbewerbsversto&szlig;</strong>. Konkurrenten k&ouml;nnen Sie abmahnen lassen.
            </p>

            <h2>Die 12 Pflichtangaben nach Art. 13 DSGVO</h2>
            <p>
                Folgende Angaben m&uuml;ssen in jeder Datenschutzerkl&auml;rung enthalten sein:
            </p>
            <table>
                <thead>
                    <tr><th>Nr.</th><th>Pflichtangabe</th><th>Rechtsgrundlage</th><th>Beispiel</th></tr>
                </thead>
                <tbody>
                    <tr><td>1</td><td>Name und Kontaktdaten des Verantwortlichen</td><td>Art. 13 Abs. 1 lit. a</td><td>Firmenname, Anschrift, E-Mail, Telefon</td></tr>
                    <tr><td>2</td><td>Kontaktdaten des DSB (falls vorhanden)</td><td>Art. 13 Abs. 1 lit. b</td><td>datenschutz@firma.de</td></tr>
                    <tr><td>3</td><td>Zwecke der Datenverarbeitung</td><td>Art. 13 Abs. 1 lit. c</td><td>Website-Analyse, Kontaktformular, Newsletter</td></tr>
                    <tr><td>4</td><td>Rechtsgrundlage je Verarbeitungszweck</td><td>Art. 13 Abs. 1 lit. c</td><td>Art. 6 Abs. 1 lit. a (Einwilligung), lit. f (berechtigtes Interesse)</td></tr>
                    <tr><td>5</td><td>Berechtigtes Interesse (falls zutreffend)</td><td>Art. 13 Abs. 1 lit. d</td><td>Website-Optimierung, Betrugspr&auml;vention</td></tr>
                    <tr><td>6</td><td>Empf&auml;nger der Daten</td><td>Art. 13 Abs. 1 lit. e</td><td>Hosting-Anbieter, Zahlungsdienstleister, Google</td></tr>
                    <tr><td>7</td><td>Drittlandtransfer</td><td>Art. 13 Abs. 1 lit. f</td><td>&Uuml;bermittlung in die USA via EU-US DPF</td></tr>
                    <tr><td>8</td><td>Speicherdauer</td><td>Art. 13 Abs. 2 lit. a</td><td>Logdateien: 30 Tage, Kundendaten: 10 Jahre</td></tr>
                    <tr><td>9</td><td>Betroffenenrechte</td><td>Art. 13 Abs. 2 lit. b</td><td>Auskunft, L&ouml;schung, Berichtigung, Widerspruch</td></tr>
                    <tr><td>10</td><td>Recht auf Widerruf der Einwilligung</td><td>Art. 13 Abs. 2 lit. c</td><td>Widerruf jederzeit m&ouml;glich</td></tr>
                    <tr><td>11</td><td>Beschwerderecht bei der Aufsichtsbeh&ouml;rde</td><td>Art. 13 Abs. 2 lit. d</td><td>Zust&auml;ndige Landesbeauftragte f&uuml;r Datenschutz</td></tr>
                    <tr><td>12</td><td>Automatisierte Entscheidungsfindung/Profiling</td><td>Art. 13 Abs. 2 lit. f</td><td>Falls KI-basierte Entscheidungen getroffen werden</td></tr>
                </tbody>
            </table>

            <h2>Zus&auml;tzliche Angaben f&uuml;r h&auml;ufige Website-Funktionen</h2>

            <h3>Hosting und Server-Logs</h3>
            <p>
                Jeder Webserver speichert bei jedem Aufruf technische Daten (IP-Adresse, Browser,
                Betriebssystem, Zeitstempel). Das ist eine <strong>Pflichtangabe</strong> in der
                Datenschutzerkl&auml;rung, auch wenn die Daten nur kurz gespeichert werden.
            </p>

            <h3>Kontaktformulare</h3>
            <p>
                Wenn Ihre Website ein Kontaktformular hat, m&uuml;ssen Sie angeben: welche Daten erhoben
                werden, auf welcher Rechtsgrundlage, wie lange sie gespeichert werden, und wer Zugriff hat.
            </p>

            <h3>Google Analytics / Tracking-Dienste</h3>
            <ul>
                <li>Name des Dienstes und Anbieter</li>
                <li>Art der erhobenen Daten (Cookie-IDs, IP-Adresse, Seitenaufrufe)</li>
                <li>Rechtsgrundlage: <strong>Einwilligung</strong> (Art. 6 Abs. 1 lit. a)</li>
                <li>Hinweis auf IP-Anonymisierung (falls aktiviert)</li>
                <li>Hinweis auf Google Consent Mode v2</li>
                <li>Hinweis auf EU-US Data Privacy Framework</li>
                <li>Widerspruchsm&ouml;glichkeit (Opt-out-Browser-Plugin)</li>
            </ul>

            <h3>Newsletter und E-Mail-Marketing</h3>
            <ul>
                <li>Double-Opt-In-Verfahren beschreiben</li>
                <li>Versanddienstleister nennen (z.B. Mailchimp, CleverReach)</li>
                <li>Hinweis auf Tracking im Newsletter (z.B. &Ouml;ffnungsraten)</li>
                <li>Abmeldem&ouml;glichkeit in jeder E-Mail</li>
            </ul>

            <h3>Social Media Plugins</h3>
            <ul>
                <li>Welche Netzwerke eingebunden sind (Facebook, Instagram, LinkedIn)</li>
                <li>Ob 2-Klick-L&ouml;sung oder Shariff verwendet wird</li>
                <li>Hinweis auf Datenweitergabe an den Plattformbetreiber</li>
            </ul>

            <h2>DSB-Pflicht: Wann brauchen Sie einen Datenschutzbeauftragten?</h2>
            <p>
                Nach <strong>&sect; 38 BDSG</strong> ist ein Datenschutzbeauftragter Pflicht, wenn:
            </p>
            <ul>
                <li>In der Regel mindestens <strong>20 Personen</strong> st&auml;ndig mit der automatisierten Verarbeitung personenbezogener Daten besch&auml;ftigt sind</li>
                <li>Die Kernt&auml;tigkeit in der <strong>umfangreichen Verarbeitung besonderer Datenkategorien</strong> besteht (Gesundheitsdaten, biometrische Daten)</li>
                <li>Eine <strong>Datenschutz-Folgenabsch&auml;tzung</strong> durchzuf&uuml;hren ist</li>
            </ul>

            <h2>Typische Fehler bei Datenschutzerkl&auml;rungen</h2>
            <table>
                <thead>
                    <tr><th>Fehler</th><th>Warum problematisch?</th><th>L&ouml;sung</th></tr>
                </thead>
                <tbody>
                    <tr><td>Copy-Paste aus dem Internet</td><td>Passt nicht zur eigenen Datenverarbeitung</td><td>Individuell anpassen oder Generator nutzen</td></tr>
                    <tr><td>Veraltete Rechtsgrundlagen</td><td>Privacy Shield statt EU-US DPF zitiert</td><td>Regelm&auml;&szlig;ig aktualisieren</td></tr>
                    <tr><td>Fehlende Dienste</td><td>Neues Plugin/Tool nicht erfasst</td><td>Bei jedem Website-Update Datenschutzerkl&auml;rung pr&uuml;fen</td></tr>
                    <tr><td>Nur auf Englisch</td><td>Muss in der Sprache des Zielpublikums sein</td><td>Deutsche Version f&uuml;r deutschsprachige Nutzer</td></tr>
                    <tr><td>Nicht erreichbar</td><td>Muss von jeder Seite aus erreichbar sein</td><td>Link im Footer auf jeder Seite</td></tr>
                    <tr><td>Kein Impressum verlinkt</td><td>Impressum und Datenschutzerkl&auml;rung sind separate Pflichten</td><td>Beide im Footer verlinken</td></tr>
                </tbody>
            </table>

            <h2>Checkliste: Datenschutzerkl&auml;rung pr&uuml;fen</h2>
            <ol>
                <li>Alle 12 Pflichtangaben nach Art. 13 DSGVO vorhanden?</li>
                <li>Alle verwendeten Dienste und Tools aufgef&uuml;hrt?</li>
                <li>Rechtsgrundlage f&uuml;r jeden Verarbeitungszweck angegeben?</li>
                <li>Aktuelle Drittlandtransfer-Regelungen (EU-US DPF) erw&auml;hnt?</li>
                <li>Betroffenenrechte vollst&auml;ndig aufgelistet?</li>
                <li>Kontaktdaten des Verantwortlichen korrekt?</li>
                <li>Datenschutzbeauftragter genannt (falls Pflicht)?</li>
                <li>Speicherdauern f&uuml;r alle Datenkategorien angegeben?</li>
                <li>Von jeder Unterseite aus erreichbar (max. 2 Klicks)?</li>
                <li>Regelm&auml;&szlig;ige &Uuml;berpr&uuml;fung eingeplant (mind. quartalweise)?</li>
            </ol>

            <h2>Automatisch pr&uuml;fen mit PrivacyChecker</h2>
            <p>
                Unser kostenloser <a href="/">DSGVO-Website-Check</a> erkennt automatisch, ob Ihre
                Website eine Datenschutzerkl&auml;rung hat und pr&uuml;ft die wichtigsten Bestandteile.
                Der Scan analysiert auch, ob alle eingebundenen Drittanbieter-Dienste in Ihrer
                Datenschutzerkl&auml;rung erw&auml;hnt werden.
            </p>

            <h2>H&auml;ufig gestellte Fragen</h2>

            <h3>Reicht eine Datenschutzerkl&auml;rung aus einem Generator?</h3>
            <p>
                Ein Datenschutzerkl&auml;rung-Generator (z.B. von der Kanzlei Siebert Lexow oder eRecht24)
                ist ein guter <strong>Ausgangspunkt</strong>, aber keine Garantie f&uuml;r Vollst&auml;ndigkeit.
                Sie m&uuml;ssen die generierten Texte immer an Ihre tats&auml;chliche Datenverarbeitung
                anpassen und regelm&auml;&szlig;ig aktualisieren.
            </p>

            <h3>Was passiert, wenn meine Datenschutzerkl&auml;rung unvollst&auml;ndig ist?</h3>
            <p>
                Eine unvollst&auml;ndige Datenschutzerkl&auml;rung kann zu einem <strong>Bu&szlig;geld der
                    Aufsichtsbeh&ouml;rde</strong> (bis 20 Mio. &euro;), einer <strong>wettbewerbsrechtlichen
                        Abmahnung</strong> durch Konkurrenten, oder einer <strong>Schadensersatzklage</strong>
                von betroffenen Nutzern f&uuml;hren.
            </p>

            <h3>Muss die Datenschutzerkl&auml;rung auf Deutsch sein?</h3>
            <p>
                Wenn sich Ihre Website an deutschsprachige Nutzer richtet, muss die Datenschutzerkl&auml;rung
                auf Deutsch verf&uuml;gbar sein. Bei internationalen Websites empfiehlt sich eine
                mehrsprachige Version. Die Anforderung leitet sich aus dem Transparenzgebot der DSGVO ab:
                Informationen m&uuml;ssen in <strong>klarer und einfacher Sprache</strong> bereitgestellt werden.
            </p>
        </ArticleLayout>
    );
}
