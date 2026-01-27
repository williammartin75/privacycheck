// Cookie Banner Translations
// Supported languages: EN, FR, DE, ES, IT, PT, NL, PL

export const translations: Record<string, {
    bannerText: string;
    learnMore: string;
    acceptAll: string;
    rejectAll: string;
    preferences: string;
    savePreferences: string;
    necessary: string;
    necessaryDesc: string;
    analytics: string;
    analyticsDesc: string;
    marketing: string;
    marketingDesc: string;
    functional: string;
    functionalDesc: string;
}> = {
    en: {
        bannerText: "We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.",
        learnMore: "Learn more",
        acceptAll: "Accept All",
        rejectAll: "Reject All",
        preferences: "Preferences",
        savePreferences: "Save Preferences",
        necessary: "Necessary",
        necessaryDesc: "Required for the website to function properly.",
        analytics: "Analytics",
        analyticsDesc: "Help us understand how visitors interact with our website.",
        marketing: "Marketing",
        marketingDesc: "Used to deliver personalized advertisements.",
        functional: "Functional",
        functionalDesc: "Enable enhanced functionality and personalization.",
    },
    fr: {
        bannerText: "Nous utilisons des cookies pour améliorer votre expérience. En continuant à visiter ce site, vous acceptez notre utilisation des cookies.",
        learnMore: "En savoir plus",
        acceptAll: "Tout accepter",
        rejectAll: "Tout refuser",
        preferences: "Préférences",
        savePreferences: "Enregistrer",
        necessary: "Nécessaires",
        necessaryDesc: "Requis pour le bon fonctionnement du site.",
        analytics: "Analytiques",
        analyticsDesc: "Nous aident à comprendre comment les visiteurs utilisent notre site.",
        marketing: "Marketing",
        marketingDesc: "Utilisés pour afficher des publicités personnalisées.",
        functional: "Fonctionnels",
        functionalDesc: "Permettent des fonctionnalités améliorées et la personnalisation.",
    },
    de: {
        bannerText: "Wir verwenden Cookies, um Ihre Erfahrung zu verbessern. Durch die weitere Nutzung dieser Website stimmen Sie der Verwendung von Cookies zu.",
        learnMore: "Mehr erfahren",
        acceptAll: "Alle akzeptieren",
        rejectAll: "Alle ablehnen",
        preferences: "Einstellungen",
        savePreferences: "Speichern",
        necessary: "Notwendig",
        necessaryDesc: "Erforderlich für die ordnungsgemäße Funktion der Website.",
        analytics: "Analyse",
        analyticsDesc: "Helfen uns zu verstehen, wie Besucher mit unserer Website interagieren.",
        marketing: "Marketing",
        marketingDesc: "Werden verwendet, um personalisierte Werbung zu liefern.",
        functional: "Funktional",
        functionalDesc: "Ermöglichen erweiterte Funktionalität und Personalisierung.",
    },
    es: {
        bannerText: "Utilizamos cookies para mejorar su experiencia. Al continuar visitando este sitio, acepta nuestro uso de cookies.",
        learnMore: "Más información",
        acceptAll: "Aceptar todo",
        rejectAll: "Rechazar todo",
        preferences: "Preferencias",
        savePreferences: "Guardar",
        necessary: "Necesarias",
        necessaryDesc: "Requeridas para el correcto funcionamiento del sitio.",
        analytics: "Analíticas",
        analyticsDesc: "Nos ayudan a entender cómo los visitantes interactúan con nuestro sitio.",
        marketing: "Marketing",
        marketingDesc: "Se utilizan para mostrar anuncios personalizados.",
        functional: "Funcionales",
        functionalDesc: "Permiten funcionalidad mejorada y personalización.",
    },
    it: {
        bannerText: "Utilizziamo i cookie per migliorare la tua esperienza. Continuando a visitare questo sito accetti l'utilizzo dei cookie.",
        learnMore: "Scopri di più",
        acceptAll: "Accetta tutto",
        rejectAll: "Rifiuta tutto",
        preferences: "Preferenze",
        savePreferences: "Salva",
        necessary: "Necessari",
        necessaryDesc: "Richiesti per il corretto funzionamento del sito.",
        analytics: "Analitici",
        analyticsDesc: "Ci aiutano a capire come i visitatori interagiscono con il nostro sito.",
        marketing: "Marketing",
        marketingDesc: "Utilizzati per mostrare annunci personalizzati.",
        functional: "Funzionali",
        functionalDesc: "Abilitano funzionalità avanzate e personalizzazione.",
    },
    pt: {
        bannerText: "Utilizamos cookies para melhorar a sua experiência. Ao continuar a visitar este site, concorda com a nossa utilização de cookies.",
        learnMore: "Saiba mais",
        acceptAll: "Aceitar tudo",
        rejectAll: "Rejeitar tudo",
        preferences: "Preferências",
        savePreferences: "Guardar",
        necessary: "Necessários",
        necessaryDesc: "Necessários para o funcionamento correto do site.",
        analytics: "Analíticos",
        analyticsDesc: "Ajudam-nos a compreender como os visitantes interagem com o nosso site.",
        marketing: "Marketing",
        marketingDesc: "Utilizados para apresentar anúncios personalizados.",
        functional: "Funcionais",
        functionalDesc: "Permitem funcionalidades melhoradas e personalização.",
    },
    nl: {
        bannerText: "Wij gebruiken cookies om uw ervaring te verbeteren. Door deze site te blijven bezoeken, gaat u akkoord met ons gebruik van cookies.",
        learnMore: "Meer informatie",
        acceptAll: "Alles accepteren",
        rejectAll: "Alles weigeren",
        preferences: "Voorkeuren",
        savePreferences: "Opslaan",
        necessary: "Noodzakelijk",
        necessaryDesc: "Vereist voor de goede werking van de website.",
        analytics: "Analytisch",
        analyticsDesc: "Helpen ons te begrijpen hoe bezoekers onze website gebruiken.",
        marketing: "Marketing",
        marketingDesc: "Worden gebruikt om gepersonaliseerde advertenties te tonen.",
        functional: "Functioneel",
        functionalDesc: "Maken verbeterde functionaliteit en personalisatie mogelijk.",
    },
    pl: {
        bannerText: "Używamy plików cookie, aby poprawić Twoje wrażenia. Kontynuując wizytę na tej stronie, zgadzasz się na używanie przez nas plików cookie.",
        learnMore: "Dowiedz się więcej",
        acceptAll: "Zaakceptuj wszystko",
        rejectAll: "Odrzuć wszystko",
        preferences: "Preferencje",
        savePreferences: "Zapisz",
        necessary: "Niezbędne",
        necessaryDesc: "Wymagane do prawidłowego działania strony.",
        analytics: "Analityczne",
        analyticsDesc: "Pomagają nam zrozumieć, jak odwiedzający korzystają z naszej strony.",
        marketing: "Marketingowe",
        marketingDesc: "Używane do wyświetlania spersonalizowanych reklam.",
        functional: "Funkcjonalne",
        functionalDesc: "Umożliwiają ulepszone funkcje i personalizację.",
    },
};

export function getTranslation(lang: string) {
    const normalizedLang = lang.toLowerCase().substring(0, 2);
    return translations[normalizedLang] || translations.en;
}
