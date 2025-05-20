
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Datenschutz = () => {
  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 w-full bg-fi-blue shadow-lg z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/rechtliches" className="text-fi-gold">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <span className="text-white font-bold">Datenschutz</span>
          <div className="w-6"></div>
        </div>
      </header>
      
      <main className="pt-16 pb-24 px-4">
        <div className="space-y-6">
          <section className="mb-8">
            <h1 className="text-2xl font-semibold mb-3">Datenschutzerklärung</h1>
            <div className="mb-4 text-neutral-600">
              <h2 className="text-lg font-medium mb-2">Inhaltsverzeichnis</h2>
              <ol className="list-decimal pl-5 space-y-1">
                <li><a href="#allgemeines" className="text-fi-gold">Allgemeines</a></li>
                <li><a href="#verantwortliche" className="text-fi-gold">Verantwortliche Stelle</a></li>
                <li><a href="#rechte" className="text-fi-gold">Ihre Rechte</a></li>
                <li><a href="#informatorisch" className="text-fi-gold">Verarbeitung personenbezogener Daten bei informatorischer Nutzung unserer Webseite</a></li>
                <li><a href="#cookies" className="text-fi-gold">Verarbeitung personenbezogener Daten durch Cookies</a></li>
                <li><a href="#funktionen" className="text-fi-gold">Weitere Funktionen und Angebote unserer Webseite</a></li>
                <li><a href="#kontakt" className="text-fi-gold">Kontaktaufnahme</a></li>
                <li><a href="#newsletter" className="text-fi-gold">Newsletter</a></li>
                <li><a href="#registrierung" className="text-fi-gold">Registrierung</a></li>
                <li><a href="#borlabs" className="text-fi-gold">Borlabs Cookie</a></li>
                <li><a href="#contactform" className="text-fi-gold">Contact Form 7</a></li>
                <li><a href="#analytics" className="text-fi-gold">Google Analytics</a></li>
                <li><a href="#fonts" className="text-fi-gold">Google Fonts</a></li>
                <li><a href="#recaptcha" className="text-fi-gold">Google reCAPTCHA</a></li>
                <li><a href="#tagmanager" className="text-fi-gold">Google Tag Manager</a></li>
                <li><a href="#wprocket" className="text-fi-gold">WP Rocket</a></li>
                <li><a href="#wufoo" className="text-fi-gold">Wufoo</a></li>
                <li><a href="#yoast" className="text-fi-gold">Yoast</a></li>
              </ol>
            </div>
          </section>

          <section id="allgemeines">
            <h2 className="text-xl font-semibold mb-3">I. Allgemeines</h2>
            <div className="space-y-3 text-neutral-700">
              <p>(1) Nachfolgend informieren wir Sie über die Erhebung personenbezogener Daten bei der Nutzung unserer Internetseite.</p>
              <p>(2) Der Begriff 'personenbezogene Daten' meint unter Verweis auf die Definition des Art. 4 Nr. 1 der Verordnung (EU) 2016/679 (nachfolgend bezeichnet als 'Datenschutz-Grundverordnung' bzw. kurz 'DSGVO') alle Daten, die auf Sie persönlich beziehbar sind. Darunter fallen beispielsweise Name, Adresse, E-Mail-Adresse, Nutzerverhalten. Hinsichtlich weiterer Begrifflichkeiten, insbesondere der Begriffe 'Verarbeitung', 'Verantwortlicher', 'Auftragsverarbeiter' und 'Einwilligung', verweisen wir auf die gesetzlichen datenschutzrechtlichen Definitionen des Art. 4 DSGVO.</p>
              <p>(3) Für Sachverhalte, welche sich in der Schweiz auswirken, auch wenn sie außerhalb der Schweiz veranlasst werden, gilt auch das Schweizer Bundesgesetz über den Datenschutz, nachfolgend bezeichnet als 'DSG'. Wir verwenden hier jedoch durchgehend die Begriffe der DSGVO. Die Begriffe der DSGVO 'Personenbezogene Daten', 'Verarbeitung', 'Auftragsverarbeiter', 'besondere Kategorien von Daten' und Datenübertragbarkeit meinen, soweit das DSG greift, auch die im DSG verwendeten Begriffe 'Personendaten', 'Bearbeitung', 'Auftragsbearbeiter', 'Datenübertragung' und 'besonders schützenswerte Personendaten' nach dem DSG. Die gesetzliche Bedeutung der Begriffe wird in diesem Fall durch das DSG bestimmt.</p>
              <p>(4) Wir verarbeiten personenbezogene Daten grundsätzlich nur, soweit dies zur Bereitstellung einer funktionsfähigen Webseite sowie der von uns angebotenen Inhalte und Leistungen erforderlich ist. Die Verarbeitung personenbezogener Daten erfolgt regelmäßig nur dann, wenn Sie uns eine Einwilligung im Sinne des Art. 6 Abs. 1 lit. a) DSGVO erteilt haben oder die Verarbeitung durch gesetzliche Vorschriften, insbesondere durch eine der in Art. 6 Abs. 1 lit. b) bis lit. f) DSGVO genannten Rechtsgrundlagen, gestattet ist.</p>
              <p>(5) Ihre personenbezogenen Daten werden gelöscht oder gesperrt, sobald der Zweck der Speicherung entfällt. Eine Speicherung kann darüber hinaus dann erfolgen, wenn dies durch nationale oder europäische Vorschriften, denen wir unterliegen, vorgesehen wurde. Eine Sperrung oder Löschung der Daten erfolgt in diesem Fall dann, wenn die in den jeweiligen Vorschriften vorgeschriebene Speicherfrist abgelaufen ist. Letzteres gilt dann nicht, wenn eine weitere Speicherung der Daten für einen Vertragsabschluss oder eine Vertragserfüllung erforderlich ist.</p>
              <p>(6) Soweit wir für einzelne Funktionen unserer Webseite auf beauftragte Dienstleister zurückgreifen oder Ihre Daten für werbliche Zwecke nutzen möchten, werden wir Sie nachfolgend im Detail über die jeweiligen Vorgänge informieren.</p>
            </div>
          </section>
          
          <section id="verantwortliche">
            <h2 className="text-xl font-semibold mb-3">II. Verantwortliche Stelle</h2>
            <div className="space-y-3 text-neutral-700">
              <p>(1) Verantwortlicher im Sinne des Art. 4 Nr. 7 DSGVO, der sonstigen in den Mitgliedstaaten der Europäischen Union geltenden Datenschutzgesetze und anderer Vorschriften sowie Bestimmungen mit datenschutzrechtlichem Charakter ist:</p>
              <div className="ml-4">
                <p>FI Emissions GmbH</p>
                <p>Geschäftsführer: Vito Micoli</p>
                <p>&nbsp;</p>
                <p>Ballindamm 27</p>
                <p>20095 Hamburg</p>
                <p>Deutschland</p>
                <p>&nbsp;</p>
                <p>Tel.: +49 40 696384155</p>
                <p>E-Mail: secretary@fi.group</p>
                <p>&nbsp;</p>
                <p>Registergericht: Amtsgericht Hamburg</p>
                <p>Registernummer: HRB 185398</p>
              </div>
              <p>(2) Weitere Einzelheiten zur verantwortlichen Stelle können Sie unserem <Link to="/impressum" className="text-fi-gold">Impressum</Link> entnehmen.</p>
            </div>
          </section>
          
          <section id="rechte">
            <h2 className="text-xl font-semibold mb-3">III. Ihre Rechte</h2>
            <div className="space-y-3 text-neutral-700">
              <p>(1) Sie haben uns gegenüber hinsichtlich der Sie betreffenden personenbezogenen Daten die nachfolgenden Rechte:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>das Recht auf Auskunft,</li>
                <li>das Recht auf Berichtigung und Löschung,</li>
                <li>das Recht auf Einschränkung der Verarbeitung,</li>
                <li>das Recht auf Widerspruch gegen die Verarbeitung,</li>
                <li>das Recht auf Datenübertragbarkeit.</li>
              </ul>
              <p>(2) Sie haben zusätzlich das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über die Verarbeitung Ihrer personenbezogenen Daten durch uns zu beschweren.</p>
              <p>(3) Im Geltungsbereich des DSG haben Sie zudem das Recht auf:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Datenherausgabe,</li>
                <li>Datenvernichtung</li>
              </ul>
            </div>
          </section>
          
          <section id="informatorisch">
            <h2 className="text-xl font-semibold mb-3">IV. Verarbeitung personenbezogener Daten bei informatorischer Nutzung unserer Webseite</h2>
            <div className="space-y-3 text-neutral-700">
              <p>(1) Wenn Sie unsere Webseite aufrufen, ohne sich dabei zu registrieren oder uns auf andere Weise Informationen zukommen zu lassen ('Informatorische Nutzung') erheben wir keine personenbezogenen Daten.</p>
              <p>(2) Die Erhebung und vorübergehende Speicherung der IP-Adresse ist notwendig, um die Auslieferung unserer Webseite auf Ihr Endgerät zu ermöglichen. Hierfür muss Ihre IP-Adresse für die Dauer des Besuchs unserer Webseite gespeichert werden.</p>
            </div>
          </section>
          
          <section id="cookies">
            <h2 className="text-xl font-semibold mb-3">V. Verarbeitung personenbezogener Daten durch Cookies</h2>
            <div className="space-y-3 text-neutral-700">
              <p>(1) Wir verwenden auf unserer Webseite sog. Cookies. Bei Cookies handelt es sich um kleine Textdateien, die auf dem Speichermedium Ihres Endgerätes, also beispielsweise auf einer Festplatte, gespeichert werden und durch die uns als Stelle, die den Cookie setzt, bestimmte Informationen zufließen. Cookies können keine Programme ausführen oder Viren auf Ihr Endgerät übertragen. Diese Webseite verwendet folgende Arten von Cookies, deren Umfang und Funktionsweise nachfolgend erläutert werden.</p>
              <p>(2) Cookies, die Ihrem Webbrowser zugehörig gespeichert werden:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li><strong>Transiente Cookies:</strong> Diese Cookies werden automatisiert gelöscht, wenn Sie Ihren Webbrowser schließen. Dazu zählen insbesondere Session-Cookies. Diese speichern eine sog. Session-ID, anhand der sich verschiedene Anfragen Ihres Webbrowsers der gemeinsamen Sitzung zuordnen lassen. Dies ermöglicht eine Wiedererkennung Ihres Endgeräts, wenn Sie auf unsere Website zurückkehren. Session-Cookies werden gelöscht, sobald Sie sich ausloggen oder den Webbrowser schließen.</li>
                <li><strong>Persistente Cookies:</strong> Diese Cookies werden automatisiert nach einer vorgegebenen Dauer gelöscht, die sich je nach Cookie unterscheiden kann. Diese Cookies können Sie in den Einstellungen Ihres Webbrowsers jederzeit löschen.</li>
              </ul>
              <p>(3) Die Verarbeitung personenbezogener Daten durch die vorstehenden Cookies dient dazu, das Angebot unserer Webseite insgesamt für Sie nutzerfreundlicher und effektiver zu machen. Einige Funktionen unserer Webseite können ohne den Einsatz dieser Cookies nicht angeboten werden. Insbesondere erfordern einige Funktionen unserer Webseite es, dass Ihr Webbrowser auch noch nach einem Seitenwechsel identifiziert werden kann. Soweit Sie über einen Account verfügen, setzen wir die Cookies ein, um Sie für Folgebesuche identifizieren zu können. Dadurch wird vermieden, dass Sie sich bei jedem Besuch unserer Webseite erneut einloggen müssen. Diejenigen Daten, die durch Cookies verarbeitet werden, die für die Bereitstellung der Funktionen unserer Webseite erforderlich sind, werden nicht zur Erstellung von Nutzerprofilen verwendet. Soweit Cookies zu Analysezwecken eingesetzt werden, dienen diese dazu, die Qualität und Nutzerfreundlichkeit unserer Webseite, ihrer Inhalte und Funktionen zu verbessern. Sie ermöglichen uns, nachzuvollziehen, wie die Webseite, welche Funktionen und wie oft diese genutzt werden. Dies ermöglicht uns, unser Angebot fortlaufend zu optimieren.</p>
              <p>(4) Soweit Cookies nicht technisch zwingend erforderlich sind, setzen wir diese nur mit Ihrer zuvor erklärten Einwilligung, die Sie zudem jederzeit widerrufen können. Rechtsgrundlage ist Art. 6 Abs. 1 lit. a) DSGVO.</p>
              <p>(5) Die vorstehenden Cookies werden auf Ihrem Endgerät gespeichert und von diesem an unseren Server übermittelt. Sie können daher die Verarbeitung der Daten und Informationen durch Cookies selbst konfigurieren. Sie können in den Einstellungen Ihres Webbrowsers entsprechende Konfigurationen vornehmen, durch die Sie beispielsweise Third-Party-Cookies oder Cookies insgesamt ablehnen können. In diesem Zusammenhang möchten wir Sie darauf hinweisen, dass Sie dann eventuell nicht alle Funktionen unserer Webseite ordnungsgemäß nutzen können. Darüber hinaus empfehlen wir eine regelmäßige manuelle Löschung von Cookies sowie Ihres Browser-Verlaufs.</p>
            </div>
          </section>
          
          {/* More sections follow the same pattern */}
          <section id="funktionen">
            <h2 className="text-xl font-semibold mb-3">VI. Weitere Funktionen und Angebote unserer Webseite</h2>
            <div className="space-y-3 text-neutral-700">
              <p>(1) Neben der vorbeschriebenen informatorischen Nutzung unserer Webseite bieten wir verschiedene Leistungen an, die Sie bei Interesse nutzen können. Hierfür ist in der Regel die Angabe weiterer personenbezogener Daten notwendig. Diese Daten benötigen wir zur Erbringung der jeweiligen Leistung. Es gelten hierfür die vorstehenden Grundsätze zur Datenverarbeitung.</p>
              <p>(2) Zum Teil greifen wir zur Verarbeitung dieser Daten auf externe Dienstleister zurück, die von uns sorgfältig ausgewählt und beauftragt wurden. Diese Dienstleister sind an unsere Weisungen gebunden und werden regelmäßig von uns kontrolliert. Soweit personenbezogene Daten im Zuge von Leistungen, die wir gemeinsam mit Partnern anbieten, an Dritte weitergegeben werden, können Sie nähere Informationen den nachfolgenden Beschreibungen der einzelnen Leistungen entnehmen. Soweit diese Dritten ihren Sitz in einem Staat außerhalb des Europäischen Wirtschaftsraumes haben, können Sie nähere Informationen über die Folgen dieses Umstands in den nachfolgenden Beschreibungen der einzelnen Leistungen entnehmen.</p>
            </div>
          </section>
          
          <section id="kontakt">
            <h2 className="text-xl font-semibold mb-3">VII. Kontaktaufnahme</h2>
            <div className="space-y-3 text-neutral-700">
              <p>(1) Wenn Sie mit uns per E-Mail Kontakt aufnehmen, werden die von Ihnen an uns mit Ihrer E-Mail übermittelten personenbezogenen Daten gespeichert.</p>
              <p>(2) Zudem halten wir auf unserer Webseite ein Kontaktformular vor, mit dem Sie Kontakt zu uns aufnehmen können. Dabei werden die von Ihnen in die Eingabemaske eingegebenen Daten an uns übermittelt und gespeichert: Vorname, Name, E-Mailadresse, Anschrift, Telefon.</p>
              <p>(3) Die Daten werden ausschließlich zur Beantwortung Ihrer Fragen verwendet. Soweit dies nicht explizit in dieser Datenschutzerklärung angegeben ist, erfolgt keine Weitergabe der Daten an Dritte. Zusätzlich erfassen wir Ihre IP-Adresse und den Zeitpunkt der Absendung.</p>
              <p>(4) Die Verarbeitung der vorstehenden personenbezogenen Daten dient allein zur Bearbeitung Ihrer Anfragen.</p>
              <p>(5) Die Verarbeitung weiterer personenbezogener Daten, die durch die Verwendung des auf unserer Webseite vorgehaltenen Kontaktformulars anfallen, dienen zur Verhinderung des Missbrauchs sowie zur Sicherstellung der Sicherheit unserer informationstechnischen Systeme.</p>
              <p>(6) Hierin liegt auch unser berechtigtes Interesse an der Verarbeitung Ihrer personenbezogenen Daten. Soweit Sie uns hierfür eine Einwilligung erteilt haben, ist Rechtsgrundlage für die Verarbeitung dieser Daten Art. 6 Abs. 1 lit. a) DSGVO. Im Übrigen ist Rechtsgrundlage für die Verarbeitung dieser Daten Art. 6 Abs. 1 lit. f) DSGVO, insbesondere für den Fall, dass uns die Daten von Ihnen durch Übersendung einer E-Mail übermittelt werden. Soweit Sie durch Ihre E-Mail auf den Abschluss eines Vertrages hinwirken wollen, stellt Art. 6 Abs. 1 lit. b) DSGVO eine zusätzliche Rechtsgrundlage dar.</p>
              <p>(7) Die Daten werden vorbehaltlich gesetzlicher Aufbewahrungsfristen gelöscht, sobald wir Ihre Anfrage abschließend bearbeitet haben. Bei einer Kontaktaufnahme per E-Mail können Sie der Speicherung Ihrer personenbezogenen Daten jederzeit widersprechen. Wir weisen Sie darauf hin, dass in diesem Fall Ihre Anfrage nicht weiterbearbeitet werden kann. Den Widerruf oder den Widerspruch können Sie durch Übersendung einer E-Mail an unsere im Impressum angegebene E-Mail-Adresse erklären.</p>
            </div>
          </section>
          
          <section id="newsletter">
            <h2 className="text-xl font-semibold mb-3">VIII. Newsletter</h2>
            <div className="space-y-3 text-neutral-700">
              <p>(1) Wir stellen Ihnen einen Newsletter zur Verfügung, den Sie auf unserer Webseite abonnieren können. Einzelheiten zum Newsletter, insbesondere dessen mögliche Inhalte werden in der Einwilligungserklärung benannt. Wenn Sie unseren Newsletter abonnieren, werden die von Ihnen bei der Anmeldung zum Newsletter in die Eingabemaske eingegebenen Daten an uns übermittelt. Um sich für die Übersendung des Newsletters anzumelden, müssen Sie von uns abgefragte Pflichtdaten angeben: E-Mailadresse.</p>
              <p>(2) Soweit Sie weitere personenbezogene Daten bei der Anmeldung angeben, ist die Angabe freiwillig.</p>
              <p>(3) Für die Anmeldung zu unserem Newsletter verwenden wir das sog. Double-Opt-In Verfahren. Nach Ihrer Anmeldung übersenden wir Ihnen eine E-Mail an die von Ihnen angegebene E-Mail-Adresse, in der wir Sie um Bestätigung bitten, dass Sie künftig von uns die Übersendung des Newsletters wünschen. Wenn Sie Ihre Anmeldung nicht binnen des in der E-Mail angegebenen Zeitraums bestätigen, werden die von Ihnen angegebenen Daten gesperrt und nach 24 Stunden gelöscht. Darüber hinaus speichern wir jeweils Ihre IP-Adresse und den Zeitpunkt der Anmeldung zum Newsletter sowie den Zeitpunkt der Bestätigung. Es erfolgt im Zusammenhang mit der Verarbeitung der Daten für den Versand des Newsletters keine Weitergabe der Daten an Dritte. Diese Daten werden ausschließlich für den Versand des Newsletters verwendet.</p>
              <p>(4) Soweit wir uns nicht eines unten genannten Drittanbieters zur Versendung des Newsletter bedienen, erfolgt im Zusammenhang mit der Verarbeitung der Daten für den Versand des Newsletters keine Weitergabe der Daten an Dritte.</p>
              <p>(5) Die von Ihnen bei der Anmeldung in die Eingabemaske eingegebenen Daten werden zu dem Zweck verarbeitet, Sie persönlich anzusprechen. Nach Ihrer Bestätigung speichern wir Ihre E-Mail-Adresse, um Ihnen den Newsletter übersenden zu können. Die jeweilige IP-Adresse und die Zeitpunkte der Anmeldung sowie der Bestätigung speichern wir, um Ihre Anmeldung nachweisen und ggf. einen möglichen Missbrauch Ihrer personenbezogenen Daten aufklären zu können. Hierin liegt auch unser berechtigtes Interesse. Soweit Sie uns eine Einwilligung erteilt haben, ist Rechtsgrundlage für die Verarbeitung Art. 6 Abs. 1 S. 1 lit. a) DSGVO. Soweit die Verarbeitung im Übrigen auf unseren berechtigten Interessen beruht, ist die Rechtsgrundlage Art. 6 Abs. 1 S. 1 lit. f) DSGVO.</p>
              <p>(6) Die vorstehenden Daten werden gelöscht, sobald sie für die Erreichung der vorstehenden Zwecke nicht mehr erforderlich sind. Ihre oben genannten Daten speichern wir daher, solange Sie den Newsletter abonniert haben. Nach Abbestellung des Newsletters speichern wir die vorgenannten Daten rein statistisch und anonym.</p>
              <p>(7) Ihre Einwilligung in die Übersendung des Newsletters können Sie jederzeit widerrufen, indem Sie den Newsletter abbestellen. Diesen können Sie durch Klicken auf den in einer jeden Ihnen von uns übersandten Newsletter-E-Mail enthaltenen Link abbestellen.</p>
              <p>(8) Alternativ können Sie den Newsletter auch durch das auf unserer Webseite vorgehaltene Formular abbestellen.</p>
            </div>
          </section>
          
          <section id="registrierung">
            <h2 className="text-xl font-semibold mb-3">IX. Registrierung</h2>
            <div className="space-y-3 text-neutral-700">
              <p>(1) Um zusätzliche Funktionen unseres Internetauftritts zu nutzen, bieten wir die Möglichkeit, sich unter Angabe personenbezogener Daten zu registrieren. Die Daten werden dabei in eine Eingabemaske eingegeben und an uns übermittelt und gespeichert. Eine Weitergabe der Daten an Dritte findet nicht statt. Die bei der Registrierung abgefragten Pflichtangaben sind entsprechend gekennzeichnet und müssen vollständig angegeben werden. Anderenfalls werden wir die Registrierung ablehnen. Folgende Daten werden im Rahmen des Registrierungsprozesses erhoben: Anrede, Vorname, Name, E-Mailadresse, Anschrift, Telefon.</p>
              <p>(2) Im Zeitpunkt der Registrierung werden zudem die IP-Adresse und Datum und Uhrzeit der Registrierung gespeichert. Im Rahmen des Registrierungsprozesses wird eine Einwilligung des Nutzers zur Verarbeitung dieser Daten eingeholt.</p>
              <p>(3) Eine Registrierung ist für das Bereithalten bestimmter Inhalte und Leistungen auf unserer Website erforderlich. Die dazu eingegebenen Daten verwenden wir nur zum Zwecke der Nutzung des jeweiligen Angebotes oder Dienstes oder zur Bereitstellung der Leistungen, für deren Inanspruchnahme Sie sich registriert haben. Im Falle wichtiger Änderungen unsere Angebote, Dienste oder Leistungen, etwa betreffend den Angebotsumfang oder bei technisch notwendigen Änderungen nutzen wir die bei der Registrierung angegebene E-Mail-Adresse, um Sie hierüber zu informieren. Rechtsgrundlage für die Verarbeitung der Daten ist Art. 6 Abs. 1 S. 1 lit. a) DSGVO. Soweit die Registrierung zum Abschluss oder der Durchführung eines Vertrages dient, stellt Art. 6 Abs. 1 S. 1 lit. b) DSGVO eine zusätzliche Rechtsgrundlage dar.</p>
              <p>(4) Eine von Ihnen erteilte Einwilligung können Sie jederzeit widerrufen. Die Rechtmäßigkeit der bereits erfolgten Datenverarbeitung bleibt vom Widerruf unberührt.</p>
              <p>(5) Die Daten werden gelöscht, sobald sie für die Erreichung des Zweckes ihrer Erhebung nicht mehr erforderlich sind. Dies ist der Fall, wenn die Registrierung auf unserer Internetseite aufgehoben oder abgeändert wird. Sie haben jederzeit die Möglichkeit, die Registrierung aufzulösen. Die über Sie gespeicherten Daten können Sie jederzeit abändern lassen. Gesetzliche Aufbewahrungsfristen bleiben unberührt.</p>
              <p>(6) Wir übermitteln personenbezogene Daten nur dann an Dritte, wenn dies im Rahmen der Vertragsabwicklung notwendig ist. Eine weitergehende Übermittlung der Daten erfolgt nicht bzw. nur dann, wenn Sie der Übermittlung ausdrücklich zugestimmt haben. Eine Weitergabe Ihrer Daten an Dritte ohne ausdrückliche Einwilligung, etwa zu Zwecken der Werbung, erfolgt nicht.</p>
              <p>(7) Soweit Sie uns eine Einwilligung erteilt haben, ist Rechtsgrundlage für die Verarbeitung der Daten Art. 6 Abs. 1 S. 1 lit. a) DSGVO. Im Übrigen ist Rechtsgrundlage Art. 6 Abs. 1 S. 1 lit. b) DSGVO.</p>
              <p>(8) Ihre personenbezogenen Daten verarbeiten und/oder speichern wir auf einem Server eines externen Anbieters in der Europäischen Union. Dadurch wird sichergestellt, dass die Standards und Vorschriften des europäischen Datenschutzrechts eingehalten werden.</p>
            </div>
          </section>

          <section id="borlabs">
            <h2 className="text-xl font-semibold mb-3">X. Borlabs Cookie</h2>
            <div className="space-y-3 text-neutral-700">
              <p>Wir setzen den Dienst auf unserer Website ein. Bei Nutzung des Dienstes werden keine personenbezogenen Daten verarbeitet.</p>
              <p>Anbieter:<br />
              Benjamin A. Bornschein<br />
              Rübenkamp 32<br />
              22305 Hamburg<br />
              Deutschland<br />
              <a href="https://de.borlabs.io/" className="text-fi-gold">https://de.borlabs.io/</a><br />
              <a href="https://de.borlabs.io/impressum/" className="text-fi-gold">https://de.borlabs.io/impressum/</a></p>
            </div>
          </section>
          
          <section id="contactform">
            <h2 className="text-xl font-semibold mb-3">XI. Contact Form 7</h2>
            <div className="space-y-3 text-neutral-700">
              <p>Wir setzen den Dienst auf unserer Website ein. Bei Nutzung des Dienstes werden keine personenbezogenen Daten verarbeitet.</p>
            </div>
          </section>

          <section id="analytics">
            <h2 className="text-xl font-semibold mb-3">XII. Google Analytics</h2>
            <div className="space-y-3 text-neutral-700">
              <p>Wir setzen den Dienst auf unserer Website ein.</p>
              <p>Wir verwenden den Dienst, um die Nutzung unserer Webseite analysieren und einzelne Funktionen und Angebote sowie das Nutzungserlebnis fortlaufend verbessern zu können. Durch die statistische Auswertung des Nutzerverhaltens können wir unser Angebot verbessern und für Sie als Nutzer interessanter ausgestalten. Die Daten werden gelöscht, sobald sie für die Erreichung des Zweckes ihrer Erhebung nicht mehr erforderlich sind.</p>
              <p>Der Dienst verwendet Cookies, also kleine Textdateien, die auf Ihrem Endgerät gespeichert werden und die eine Analyse der Benutzung unserer Website durch Sie ermöglichen. Die durch das Cookie erzeugten Informationen über die Benutzung unserer Website werden an einen Server des Anbieters innerhalb der EU übertragen und dort gespeichert. Auf diesen Servern werden die IP-Adressen gekürzt. Ein entsprechend pseudonymisierter Datensatz wird in die USA übermittelt.</p>
              <p>Der Dienst übermittelt personenbezogene Daten in die USA. Die EU-Kommission hat beschlossen, dass dieses Land ein angemessenes Datenschutzniveau bietet (TADPF). Der Dienst hat sich dem TADPF unterworfen.</p>
              <p>Sie können das Speichern der von diesem Dienst erzeugten Cookies auch durch Vornahme entsprechender Einstellungen Ihres Webbrowsers verhindern. Wir weisen Sie darauf hin, dass Sie in diesem Fall möglicherweise nicht sämtliche Funktionen unserer Webseite nutzen können. Wenn Sie die Erhebung der durch das Cookie erzeugten und auf Ihr Nutzerverhalten bezogenen Daten (auch Ihrer IP-Adresse) sowie die Verarbeitung dieser Daten durch den Anbieter des Dienstes verhindern wollen, können Sie auch das unter dem nachfolgenden Link verfügbare Webbrowser-Plugin herunterladen und installieren:</p>
              <p><a href="https://tools.google.com/dlpage/gaoptout?hl=de" className="text-fi-gold">https://tools.google.com/dlpage/gaoptout?hl=de</a></p>
              <p>Um den Anbieter dieses Dienstes zur Auftragsverarbeitung der übermittelten Daten nur entsprechend unserer Weisungen und zur Einhaltung der geltenden Datenschutzvorschriften zu verpflichten, haben wir mit dem Anbieter einen Auftragsverarbeitungsvertrag abgeschlossen.</p>
              <p>Rechtsgrundlage ist Art. 6 Abs. 1 S. 1 lit. a) DSGVO (Einwilligung).</p>
              <p>Anbieter:<br />
              Google Ireland Limited<br />
              Google Building Gordon House<br />
              Barrow St<br />
              4 Dublin<br />
              Irland<br />
              Tel. +353 1 543 1000<br />
              Fax +353 1 686 5660<br />
              <a href="https://www.google.de/" className="text-fi-gold">https://www.google.de/</a></p>
            </div>
          </section>

          <section id="fonts">
            <h2 className="text-xl font-semibold mb-3">XIII. Google Fonts</h2>
            <div className="space-y-3 text-neutral-700">
              <p>Wir setzen den Dienst auf unserer Website ein.</p>
              <p>Der Dienst ermöglicht uns die Verwendung externer Schriftarten. Dazu wird beim Abrufen unserer Webseite die benötigte Schriftart von Ihrem Webbrowser in den Browsercache geladen. Dies ist notwendig damit Ihr Browser eine optisch verbesserte Darstellung unserer Texte anzeigen kann. Wenn Ihr Browser diese Funktion nicht unterstützt, wird eine Standardschrift von Ihrem Computer zur Anzeige genutzt. Die Einbindung dieser Schriftarten erfolgt durch einen Serveraufruf bei einem Server des Anbieters. Hierdurch wird an den Server übermittelt, welche unserer Internetseiten Sie besucht haben. Auch wird die IP-Adresse des Browsers Ihres Endgerätes vom Anbieter gespeichert. Wir haben keinen Einfluss auf den Umfang und die weitere Verwendung der Daten, die durch den Einsatz des Dienstes seitens des Anbieters erhoben und verarbeitet werden.</p>
              <p>Wir verwenden den Dienst zu Optimierungszwecken, insbesondere um die Nutzung unserer Webseite für Sie zu verbessern und um deren Ausgestaltung nutzerfreundlicher zu machen.</p>
              <p>Der Dienst übermittelt personenbezogene Daten in die USA. Die EU-Kommission hat beschlossen, dass dieses Land ein angemessenes Datenschutzniveau bietet (TADPF). Der Dienst hat sich dem TADPF unterworfen.</p>
              <p>Rechtsgrundlage ist Art. 6 Abs. 1 S. 1 lit. f) DSGVO.</p>
              <p>Anbieter:<br />
              Google Ireland Limited<br />
              Google Building Gordon House<br />
              Barrow St<br />
              4 Dublin<br />
              Irland<br />
              Tel. +353 1 543 1000<br />
              Fax +353 1 686 5660<br />
              <a href="https://www.google.de/" className="text-fi-gold">https://www.google.de/</a>
              <br />
              <a href="https://fonts.google.com/" className="text-fi-gold">https://fonts.google.com/</a></p>
            </div>
          </section>

          <section id="recaptcha">
            <h2 className="text-xl font-semibold mb-3">XIV. Google reCAPTCHA</h2>
            <div className="space-y-3 text-neutral-700">
              <p>Wir setzen den Dienst auf unserer Website ein.</p>
              <p>Wir verwenden den Dienst zur Prüfung, ob die Eingabe durch einen Menschen oder missbräuchlich durch automatisierte, maschinelle Verarbeitung erfolgt. Das Verfahren dient damit der Abwehr von Spam, Bots, DDoS-Attacken und ähnlichen automatisierten Schadzugriffen. Der Einsatz des Dienstes dient damit unmittelbar der Sicherstellung der Integrität und Funktionsfähigkeit unserer Systeme.</p>
              <p>Die im Rahmen des Dienstes übermittelte IP-Adresse wird nicht mit anderen Daten des Anbieters zusammengeführt, außer Sie sind zum Zeitpunkt der Nutzung des Dienstes mit Ihrem Account bei dem Anbieter angemeldet. Wenn Sie diese Übermittlung und Speicherung von Daten über Sie und Ihr Verhalten auf unserer Webseite durch den Anbieter unterbinden wollen, müssen Sie sich beim Anbieter ausloggen und zwar bevor Sie unsere Seite besuchen bzw. den Dienst benutzen.</p>
              <p>Der Dienst übermittelt personenbezogene Daten in die USA. Die EU-Kommission hat beschlossen, dass dieses Land ein angemessenes Datenschutzniveau bietet (TADPF). Der Dienst hat sich dem TADPF unterworfen.</p>
              <p>Rechtsgrundlage ist Art. 6 Abs. 1 S. 1 lit. a) DSGVO (Einwilligung).</p>
              <p>Anbieter:<br />
              Google Ireland Limited<br />
              Google Building Gordon House<br />
              Barrow St<br />
              4 Dublin<br />
              Irland<br />
              Tel. +353 1 543 1000<br />
              Fax +353 1 686 5660<br />
              <a href="https://www.google.de/" className="text-fi-gold">https://www.google.de/</a>
              <br />
              <a href="https://policies.google.com/privacy?hl=de&gl=de" className="text-fi-gold">https://policies.google.com/privacy?hl=de&gl=de</a></p>
            </div>
          </section>

          <section id="tagmanager">
            <h2 className="text-xl font-semibold mb-3">XV. Google Tag Manager</h2>
            <div className="space-y-3 text-neutral-700">
              <p>Wir setzen den Dienst auf unserer Website ein.</p>
              <p>Der Dienst ermöglicht uns als Vermarkter, Webseiten-Tags über eine Oberfläche verwalten zu können. Das Tool, welches die Tags implementiert, ist eine cookielose Domain und erfasst selbst keine personenbezogenen Daten. Der Dienst sorgt für die Auslösung anderer Tags, die ihrerseits unter Umständen Daten erfassen. Der Dienst greift nicht auf diese Daten zu. Wenn auf Domain- oder Cookie-Ebene eine Deaktivierung vorgenommen wurde, bleibt diese für alle Tracking-Tags bestehen, die mit mit dem Dienst implementiert werden.</p>
              <p>Anbieter:<br />
              Google Ireland Limited<br />
              Google Building Gordon House<br />
              Barrow St<br />
              4 Dublin<br />
              Irland<br />
              Tel. +353 1 543 1000<br />
              Fax +353 1 686 5660<br />
              <a href="https://www.google.de/" className="text-fi-gold">https://www.google.de/</a>
              <br />
              <a href="https://policies.google.com/privacy?hl=de&gl=de" className="text-fi-gold">https://policies.google.com/privacy?hl=de&gl=de</a></p>
            </div>
          </section>

          <section id="wprocket">
            <h2 className="text-xl font-semibold mb-3">XVI. WP Rocket</h2>
            <div className="space-y-3 text-neutral-700">
              <p>Wir setzen den Dienst auf unserer Website ein. Bei Nutzung des Dienstes werden keine personenbezogenen Daten verarbeitet.</p>
              <p>Anbieter:<br />
              SAS WP MEDIA<br />
              18/20 rue Tronchet<br />
              69006 Lyon<br />
              Frankreich<br />
              <a href="https://wp-rocket.me/" className="text-fi-gold">https://wp-rocket.me/</a></p>
            </div>
          </section>

          <section id="wufoo">
            <h2 className="text-xl font-semibold mb-3">XVII. Wufoo</h2>
            <div className="space-y-3 text-neutral-700">
              <p>Wir setzen den Dienst auf unserer Website ein.</p>
              <p>Wir nutzen den Dienst, um Online-Formulare in unsere Website einzubinden. Als Nutzer haben Sie die Möglichkeit, über bereitgestellte Formulare mit uns in Kontakt zu treten. Dabei werden die von Ihnen in die Eingabemaske eingegebenen Daten an uns übermittelt und gespeichert. Des weiteren wird Ihre IP-Adresse an den Betreiber der Formularsoftware weitergegeben und bei diesem gespeichert.</p>
              <p>Rechtsgrundlage ist Art. 6 Abs. 1 S. 1 lit. a) DSGVO (Einwilligung).</p>
              <p>Der Dienst übermittelt personenbezogene Daten in die USA. Die EU-Kommission hat beschlossen, dass dieses Land ein angemessenes Datenschutzniveau bietet (TADPF). Der Dienst hat sich dem TADPF unterworfen.</p>
              <p>Anbieter:<br />
              SurveyMonkey Europe UC<br />
              Ella House, Suite 40.4<br />
              40 Merrion Square East<br />
              D02 NP96 Dublin 2<br />
              Irland<br />
              <a href="https://www.wufoo.com/" className="text-fi-gold">https://www.wufoo.com/</a><br />
              <a href="https://www.surveymonkey.com/mp/legal/privacy/" className="text-fi-gold">https://www.surveymonkey.com/mp/legal/privacy/</a></p>
            </div>
          </section>

          <section id="yoast">
            <h2 className="text-xl font-semibold mb-3">XVIII. Yoast</h2>
            <div className="space-y-3 text-neutral-700">
              <p>Wir setzen den Dienst auf unserer Website ein. Bei Nutzung des Dienstes werden keine personenbezogenen Daten verarbeitet.</p>
              <p>Anbieter:<br />
              Yoast BV<br />
              Don Emanuelstraat 3<br />
              6602 GX Wijchen<br />
              Niederlande<br />
              Tel. +31 24 8200337<br />
              <a href="https://yoast.com/" className="text-fi-gold">https://yoast.com/</a></p>
            </div>
          </section>
        </div>
      </main>
      
      <footer className="fixed bottom-0 w-full bg-fi-blue text-white">
        <div className="px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="text-sm">
              <Link to="/faq" className="text-white">Kundenservice</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Datenschutz;
