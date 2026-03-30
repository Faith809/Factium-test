
import { LanguageCode } from "../types";

export interface TranslationSet {
  hubTitle: string;
  hubDesc: string;
  recalibrate: string;
  language: string;
  selectLanguage: string;
  save: string;
  intro: string;
  explore: string;
  manifesto: string;
  activeSeekers: string;
  nav: {
    research: string;
    factChecker: string;
    policy: string;
    finance: string;
    models: string;
    profile: string;
    about: string;
  };
    setup: {
      language: string;
      engine: string;
      security: string;
      title1: string;
      desc1: string;
      title2: string;
      desc2: string;
      continue: string;
      linkTitle: string;
      back: string;
      filamentTitle: string;
      filamentDesc: string;
      apiKeyLabel: string;
      activate: string;
      geminiConfig: string;
      customFoundry: string;
      customName: string;
      customEndpoint: string;
      customGateway: string;
      customSite: string;
      customDescription: string;
      privacyAssurance: string;
      forgeAndActivate: string;
      skip: string;
    };
    guide: {
      dashboard: {
        welcome: { title: string; desc: string };
        overview: { title: string; desc: string };
        captured: { title: string; desc: string };
        next: { title: string; desc: string };
      };
      research: {
        terminal: { title: string; desc: string };
        modes: { title: string; desc: string };
        files: { title: string; desc: string };
      };
      factChecker: {
        terminal: { title: string; desc: string };
        tabs: { title: string; desc: string };
      };
      policy: {
        profile: { title: string; desc: string };
        terminal: { title: string; desc: string };
        results: { title: string; desc: string };
      };
      finance: {
        terminal: { title: string; desc: string };
        stats: { title: string; desc: string };
      };
      models: {
        vault: { title: string; desc: string };
        marketplace: { title: string; desc: string };
        list: { title: string; desc: string };
        add: { title: string; desc: string };
      };
      about: {
        mission: { title: string; desc: string };
        philosophy: { title: string; desc: string };
        roadmap: { title: string; desc: string };
      };
      profile: {
        form: { title: string; desc: string };
      };
      setup: {
        language: { title: string; desc: string };
        engine: { title: string; desc: string };
        security: { title: string; desc: string };
      };
      common: {
        manual: { title: string; desc: string };
      };
    };
  research: {
    title: string;
    subtitle: string;
    modeRestricted: string;
    modeUnrestricted: string;
    placeholder1: string;
    placeholder2: string;
    loading: string;
    briefing: string;
    controversies: string;
    insights: string;
    social: string;
    visuals: string;
    sources: string;
    initiate: string;
  };
  factChecker: {
    title: string;
    subtitle: string;
    modeRestricted: string;
    modeUnrestricted: string;
    placeholder: string;
    run: string;
    loading: string;
    tabs: {
      report: string;
      forensic: string;
      discovery: string;
      proof: string;
    };
  };
  policy: {
    title: string;
    subtitle: string;
    denied: string;
    deniedDesc: string;
    configureBtn: string;
    activeProfile: string;
    refillProfile: string;
    profileVault: string;
    placeholder: string;
    runBtn: string;
    scoreTitle: string;
    narrativeTitle: string;
    timelineTitle: string;
    tabs: {
      impact: string;
      analysis: string;
      news: string;
      discourse: string;
      verification: string;
    };
  };
  finance: {
    title: string;
    subtitle: string;
    placeholder: string;
    btn: string;
    briefTitle: string;
    tabs: {
      donors: string;
      social: string;
      news: string;
      analysis: string;
      verification: string;
    };
    sourceVerify: string;
    noData: string;
  };
  models: {
    title: string;
    subtitle: string;
    tabs: {
      vault: string;
      marketplace: string;
      custom: string;
    };
    vaultHeader: string;
    vaultDesc: string;
    geminiStatus: string;
    saveBtn: string;
    purchase: string;
    licenseAcquired: string;
    forgeTitle: string;
    forgeBtn: string;
    identityLabel: string;
    personaLabel: string;
    activeModelsTitle: string;
  };
  profile: {
    title: string;
    subtitle: string;
    autofill: string;
    restored: string;
    labels: {
      name: string;
      location: string;
      income: string;
      family: string;
      occupation: string;
      political: string;
    };
    saveBtn: string;
    savedMsg: string;
  };
  common: {
    back: string;
    home: string;
    verify: string;
    viewArchive: string;
    accessPulse: string;
    unveil: string;
    discoveryChambers: string;
  };
}

const generateSet = (base: any): TranslationSet => base as TranslationSet;

// Define base English set to be used as fallback for missing languages
const enSet = generateSet({
  hubTitle: "Home Station",
  hubDesc: "Your space for clear facts",
  recalibrate: "Reset Settings",
  language: "Language",
  selectLanguage: "Pick Your Language",
  save: "Save My Choices",
  intro: "Welcome. Let's find some honest answers together.",
  explore: "Start Learning",
  manifesto: "Our Story",
  activeSeekers: "People Here",
  nav: { research: "Topic Search", factChecker: "Check the Facts", policy: "Future Look", finance: "Money Tracker", models: "Smart Tools", profile: "My Details", about: "Our Story" },
    setup: { 
      language: "Language", 
      engine: "Start Up", 
      security: "Privacy", 
      title1: "Pick Your Language", 
      desc1: "Choose how you want to read and talk.", 
      title2: "Choose Your Helper", 
      desc2: "Pick the tool you want to use for your search.", 
      continue: "Next", 
      linkTitle: "Connect Tool", 
      back: "Go Back", 
      filamentTitle: "Keep It Safe", 
      filamentDesc: "We respect your privacy. All your keys stay on your own device.", 
      apiKeyLabel: "Your Secret Key", 
      activate: "Start the App", 
      geminiConfig: "Google Gemini is already set up and ready to go.",
      customFoundry: "Custom Foundry",
      customName: "Model Name",
      customModelId: "Model ID (e.g. gpt-4)",
      customEndpoint: "API Endpoint (URL)",
      customGateway: "Gateway Dashboard",
      customSite: "Official Site",
      customDescription: "Brief Description",
      privacyAssurance: "PRIVACY ASSURED: Your custom model details and API keys are stored exclusively on this device. No data is sent to our servers.",
      forgeAndActivate: "FORGE & ACTIVATE",
      skip: "Skip Guide"
    },
    guide: {
      dashboard: {
        welcome: { title: "Home Station", desc: "Welcome to your command center. This is where your journey into the truth begins." },
        overview: { title: "Intelligence Overview", desc: "Get a high-level view of your active research and global metrics." },
        captured: { title: "Captured Intelligence", desc: "Quickly access your recently verified facts and saved reports." },
        next: { title: "Specialized Terminals", desc: "Use the navigation rail to access deep-dive tools for research, finance, and more." }
      },
      research: {
        terminal: { title: "Topic Search", desc: "Deep-dive into any subject with multi-model verification and cross-referencing." },
        modes: { title: "Search Filters", desc: "Toggle between 'Filtered' for speed and 'Unfiltered' for raw, deep-web discovery." },
        files: { title: "Evidence Upload", desc: "Attach documents or images to your query for forensic analysis." }
      },
      factChecker: {
        terminal: { title: "Fact Checker", desc: "Paste claims or articles here to dismantle bias and verify authenticity." },
        tabs: { title: "Analysis Layers", desc: "Switch between summary, forensic evidence, and social sentiment views." }
      },
      policy: {
        profile: { title: "Impact Profile", desc: "Ensure your details are set to see how policies specifically affect your life." },
        terminal: { title: "Future Look", desc: "Simulate the impact of new laws on the economy and your personal situation." },
        results: { title: "Simulation Results", desc: "Analyze the projected outcomes across different timelines and sectors." }
      },
      finance: {
        terminal: { title: "Money Tracker", desc: "Follow the money trail behind political figures, events, and organizations." },
        stats: { title: "Financial Metrics", desc: "View donor history, market impact, and potential conflicts of interest." }
      },
      models: {
        vault: { title: "Secure Vault", desc: "Manage your API keys. Your credentials never leave this device." },
        marketplace: { title: "Model Marketplace", desc: "Acquire licenses for specialized AI models forged for specific truth-seeking tasks." },
        list: { title: "Active Helpers", desc: "Configure and verify your connected AI models and custom personas." },
        add: { title: "Model Foundry", desc: "Forge new custom AI assistants or browse the marketplace for specialized tools." }
      },
      about: {
        mission: { title: "The Manifesto", desc: "Understand the core mission and decentralized technology powering Factium AI." },
        philosophy: { title: "Our Philosophy", desc: "Learn about our commitment to privacy, transparency, and data sovereignty." },
        roadmap: { title: "Future Roadmap", desc: "See what's next for the truth layer and how we're evolving." }
      },
      profile: {
        form: { title: "My Details", desc: "Keep your profile updated to ensure all simulations and predictions are accurate." }
      },
      setup: {
        language: { title: "Language Selection", desc: "Choose your primary interface language for all communications." },
        engine: { title: "Engine Selection", desc: "Select the primary AI processing engine for your research." },
        security: { title: "Security Setup", desc: "Configure your secure connection and manage your local data vault." }
      },
      common: {
        manual: { title: "Manual Restart", desc: "You can always restart the guide for any feature by clicking this button." }
      }
    },
  research: { title: "SEARCH CENTER", subtitle: "A quiet place to find out what's really happening.", modeRestricted: "Filtered", modeUnrestricted: "Unfiltered", placeholder1: "Ask me anything...", placeholder2: "Look for deep and hidden answers...", loading: "Finding the details...", briefing: "Clear Summary", controversies: "Controversies & Conspiracies", insights: "Important Notes", social: "What People Say", visuals: "Images", sources: "Where We Found It", initiate: "Pick a section to see more." },
  factChecker: { title: "THE TRUTH CHECKER", subtitle: "Taking out the noise to find the real story.", modeRestricted: "Quick Check", modeUnrestricted: "Deep Look", placeholder: "Paste a story or link here...", run: "Check It Now", loading: "Thinking it over...", tabs: { report: "Controversies", forensic: "How we know", discovery: "More to see", proof: "Reference Sources" } },
  policy: { title: "FUTURE LOOK", subtitle: "See how new laws might change your life.", denied: "WE NEED MORE INFO", deniedDesc: "Please tell us a bit about yourself so we can give you a better answer.", configureBtn: "FILL OUT MY DETAILS", activeProfile: "DETAILS LOADED", refillProfile: "Change my details", profileVault: "Profile Vault", placeholder: "E.g., A new tax law or job program...", runBtn: "SEE MY FUTURE", scoreTitle: "The Change (-10 to +10)", narrativeTitle: "What this means for you", timelineTitle: "When things happen", tabs: { impact: "Impact Summary", analysis: "Detailed Analysis", news: "News & Trends", discourse: "Public Discourse", verification: "Verification" } },
  finance: { title: "MONEY TRACKER", subtitle: "See who is paying for the big events.", placeholder: "Enter a person or event...", btn: "TRACK MONEY", briefTitle: "Simple Summary", tabs: { donors: "Top Givers", social: "Online Chat", news: "Latest News", analysis: "Analysis", verification: "Reference Sources" }, sourceVerify: "Check Proof", noData: "Nothing found right now." },
  models: { title: "THE TOOL BOX", subtitle: "Manage your keys and pick your favorite helpers.", tabs: { vault: "Secure Keys", marketplace: "More Tools", custom: "Make Your Own" }, vaultHeader: "Connect to the Web", vaultDesc: "Add your keys to use different smart tools.", geminiStatus: "Gemini is already active and ready.", saveBtn: "Save My Keys", purchase: "Get Access", licenseAcquired: "Ready to Use", forgeTitle: "Create a Helper", forgeBtn: "Save Helper", identityLabel: "Helper Name", personaLabel: "How they should act", activeModelsTitle: "My Current Helpers" },
  profile: { title: "MY DETAILS", subtitle: "Tell us a bit about you for better results.", autofill: "Fill from Device", restored: "Done", labels: { name: "Name or Nickname", location: "Where you live", income: "Money you earn", family: "Family size", occupation: "What you do", political: "General views" }, saveBtn: "SAVE MY INFO", savedMsg: "Your info is safe and saved." },
  common: { back: "BACK", home: "HOME", verify: "Check Source", viewArchive: "View More", accessPulse: "Read More", unveil: "Open", discoveryChambers: "Rooms" },
});

export const translations: Record<LanguageCode, TranslationSet> = {
  en: enSet,
  es: generateSet({
    hubTitle: "Estación Principal",
    hubDesc: "Tu espacio para hechos claros",
    recalibrate: "Reiniciar",
    language: "Idioma",
    selectLanguage: "Elige tu idioma",
    save: "Guardar",
    intro: "Bienvenido. Busquemos respuestas honestas juntos.",
    explore: "Empezar",
    manifesto: "Nuestra Historia",
    activeSeekers: "Personas",
    nav: { research: "Buscar Tema", factChecker: "Verificar Hechos", policy: "Ver Futuro", finance: "Seguir Dinero", models: "Herramientas", profile: "Mis Datos", about: "Nuestra Historia" },
    setup: { language: "Idioma", engine: "Inicio", security: "Privacidad", title1: "Elige tu idioma", desc1: "Escoge cómo quieres leer y hablar.", title2: "Elige tu ayudante", desc2: "Selecciona la herramienta que prefieras.", continue: "Siguiente", linkTitle: "Conectar", back: "Atrás", filamentTitle: "Seguridad", filamentDesc: "Tus llaves se quedan en tu dispositivo.", apiKeyLabel: "Tu llave secreta", activate: "Empezar", geminiConfig: "Gemini ya está listo." },
    guide: {
      dashboard: {
        welcome: { title: "Estación Principal", desc: "Bienvenido a tu centro de mando. Aquí comienza tu viaje hacia la verdad." },
        overview: { title: "Resumen de Inteligencia", desc: "Obtén una vista de alto nivel de tus investigaciones activas y métricas globales." },
        captured: { title: "Inteligencia Capturada", desc: "Accede rápidamente a tus hechos verificados recientemente y reportes guardados." },
        next: { title: "Terminales Especializados", desc: "Usa la barra de navegación para acceder a herramientas profundas de investigación, finanzas y más." }
      },
      research: {
        terminal: { title: "Búsqueda de Temas", desc: "Profundiza en cualquier tema con verificación de múltiples modelos y referencias cruzadas." },
        modes: { title: "Filtros de Búsqueda", desc: "Cambia entre 'Filtrado' para velocidad y 'Sin Filtrar' para descubrimientos profundos en la red." },
        files: { title: "Subida de Evidencia", desc: "Adjunta documentos o imágenes a tu consulta para un análisis forense." }
      },
      factChecker: {
        terminal: { title: "Verificador de Hechos", desc: "Pega afirmaciones o artículos aquí para desmantelar sesgos y verificar la autenticidad." },
        tabs: { title: "Capas de Análisis", desc: "Cambia entre vistas de resumen, evidencia forense y sentimiento social." }
      },
      policy: {
        profile: { title: "Perfil de Impacto", desc: "Asegúrate de que tus datos estén configurados para ver cómo las políticas afectan específicamente tu vida." },
        terminal: { title: "Vista Futura", desc: "Simula el impacto de nuevas leyes en la economía y tu situación personal." },
        results: { title: "Resultados de Simulación", desc: "Analiza los resultados proyectados a través de diferentes líneas de tiempo y sectores." }
      },
      finance: {
        terminal: { title: "Seguimiento de Dinero", desc: "Sigue el rastro del dinero detrás de figuras políticas, eventos y organizaciones." },
        stats: { title: "Métricas Financieras", desc: "Mira el historial de donantes, el impacto en el mercado y posibles conflictos de interés." }
      },
      models: {
        vault: { title: "Bóveda Segura", desc: "Gestiona tus llaves API. Tus credenciales nunca salen de este dispositivo." },
        marketplace: { title: "Mercado de Modelos", desc: "Adquiere licencias para modelos de IA especializados forjados para tareas específicas de búsqueda de la verdad." },
        list: { title: "Ayudantes Activos", desc: "Configura y verifica tus modelos de IA conectados y personas personalizadas." },
        add: { title: "Fundición de Modelos", desc: "Crea nuevos asistentes de IA personalizados o navega por el mercado de herramientas especializadas." }
      },
      about: {
        mission: { title: "El Manifiesto", desc: "Comprende la misión central y la tecnología descentralizada que impulsa Factium AI." },
        philosophy: { title: "Nuestra Filosofía", desc: "Conoce nuestro compromiso con la privacidad, la transparencia y la soberanía de los datos." },
        roadmap: { title: "Hoja de Ruta Futura", desc: "Mira qué sigue para la capa de verdad y cómo estamos evolucionando." }
      },
      profile: {
        form: { title: "Mis Datos", desc: "Mantén tu perfil actualizado para asegurar que todas las simulaciones y predicciones sean precisas." }
      },
      setup: {
        language: { title: "Selección de Idioma", desc: "Elige tu idioma de interfaz principal para todas las comunicaciones." },
        engine: { title: "Selección de Motor", desc: "Selecciona el motor de procesamiento de IA principal para tu investigación." },
        security: { title: "Configuración de Seguridad", desc: "Configura tu conexión segura y gestiona tu bóveda de datos local." }
      },
      common: {
        manual: { title: "Reinicio Manual", desc: "Siempre puedes reiniciar la guía para cualquier función haciendo clic en este botón." }
      }
    },
    research: { title: "CENTRO DE BÚSQUEDA", subtitle: "Un lugar tranquilo para saber qué pasa realmente.", modeRestricted: "Filtrado", modeUnrestricted: "Sin Filtrar", placeholder1: "Pregúntame lo que sea...", placeholder2: "Busca respuestas profundas...", loading: "Buscando...", briefing: "Resumen Claro", controversies: "Controversias y Conspiraciones", insights: "Notas Importantes", social: "Lo que dicen", visuals: "Fotos", sources: "Fuentes", initiate: "Elige una sección." },
    factChecker: { title: "VERIFICADOR", subtitle: "Quitando el ruido para encontrar la historia.", modeRestricted: "Chequeo Rápido", modeUnrestricted: "Mirada Profunda", placeholder: "Pega una historia aquí...", run: "Verificar", loading: "Pensando...", tabs: { report: "Controversias", forensic: "Cómo sabemos", discovery: "Más", proof: "Fuentes de Referencia" } },
    policy: { title: "VISTA FUTURA", subtitle: "Mira cómo te afectan las leyes.", denied: "MÁS INFO", deniedDesc: "Dinos un poco sobre ti para ayudarte mejor.", configureBtn: "MIS DATOS", activeProfile: "CARGADO", refillProfile: "Cambiar datos", profileVault: "Bóveda de Perfiles", placeholder: "Ej. Una nueva ley...", runBtn: "VER MI FUTURO", scoreTitle: "El Cambio", narrativeTitle: "Qué significa", timelineTitle: "Cuándo", tabs: { impact: "Impacto", analysis: "Análisis", news: "Noticias", discourse: "Discurso", verification: "Verificación" } },
    finance: { title: "SEGUIMIENTO", subtitle: "Mira quién paga.", placeholder: "Escribe un nombre...", btn: "RASTREAR", briefTitle: "Resumen", tabs: { donors: "Donantes", social: "Chat En Línea", news: "Noticias", analysis: "Análisis", verification: "Fuentes" }, sourceVerify: "Probar", noData: "Sin datos." },
    models: { title: "CAJA DE HERRAMIENTAS", subtitle: "Gestiona tus herramientas.", tabs: { vault: "Llaves", marketplace: "Mercado", custom: "Crear" }, vaultHeader: "Conectar", vaultDesc: "Añade llaves.", geminiStatus: "Listo.", saveBtn: "Guardar", purchase: "Comprar", licenseAcquired: "Listo", forgeTitle: "Crear Ayudante", forgeBtn: "Guardar", identityLabel: "Nombre", personaLabel: "Cómo actúa", activeModelsTitle: "Activos" },
    profile: { title: "MY DETAILS", subtitle: "Dinos sobre ti.", autofill: "Cargar", restored: "Listo", labels: { name: "Nombre", location: "Lugar", income: "Ingresos", family: "Familia", occupation: "Trabajo", political: "Vistas" }, saveBtn: "GUARDAR", savedMsg: "Guardado" },
    common: { back: "ATRÁS", home: "INICIO", verify: "Probar", viewArchive: "Ver", accessPulse: "Leer", unveil: "Abrir", discoveryChambers: "Salas" },
  }),
  fr: generateSet({ 
    hubTitle: "Station de Base", 
    hubDesc: "Votre espace pour des faits clairs", 
    recalibrate: "Réinitialiser", 
    language: "Langue", 
    selectLanguage: "Choisissez votre langue", 
    save: "Enregistrer", 
    intro: "Bienvenue. Trouvons ensemble des réponses honnêtes.", 
    explore: "Commencer", 
    manifesto: "Notre Histoire", 
    activeSeekers: "Utilisateurs", 
    nav: { research: "Recherche", factChecker: "Vérification", policy: "Futur", finance: "Argent", models: "Outils", profile: "Profil", about: "Histoire" }, 
    setup: { language: "Langue", engine: "Démarrage", security: "Confidentialité", title1: "Votre langue", desc1: "Choisissez comment vous lirez.", title2: "Votre aide", desc2: "Choisissez votre outil.", continue: "Suivant", linkTitle: "Connecter", back: "Retour", filamentTitle: "Sécurité", filamentDesc: "Vos clés restent ici.", apiKeyLabel: "Votre clé", activate: "Lancer", geminiConfig: "Gemini est prêt." }, 
    guide: {
      dashboard: {
        welcome: { title: "Station de Base", desc: "Bienvenue dans votre centre de commande. C'est ici que commence votre voyage vers la vérité." },
        overview: { title: "Aperçu de l'Intelligence", desc: "Obtenez une vue d'ensemble de vos recherches actives et de vos métriques mondiales." },
        captured: { title: "Intelligence Capturée", desc: "Accédez rapidement à vos faits récemment vérifiés et à vos rapports enregistrés." },
        next: { title: "Terminaux Spécialisés", desc: "Utilisez le rail de navigation pour accéder aux outils d'approfondissement pour la recherche, la finance, et plus encore." }
      },
      research: {
        terminal: { title: "Recherche de Sujets", desc: "Plongez dans n'importe quel sujet avec une vérification multi-modèles et des références croisées." },
        modes: { title: "Filtres de Recherche", desc: "Basculez entre 'Filtré' pour la vitesse et 'Non Filtré' pour une découverte brute sur le web profond." },
        files: { title: "Envoi de Preuves", desc: "Joignez des documents ou des images à votre requête pour une analyse forensique." }
      },
      factChecker: {
        terminal: { title: "Vérificateur de Faits", desc: "Collez des affirmations ou des articles ici pour démanteler les biais et vérifier l'authenticité." },
        tabs: { title: "Couches d'Analyse", desc: "Basculez entre les vues de résumé, de preuves forensiques et de sentiment social." }
      },
      policy: {
        profile: { title: "Profil d'Impact", desc: "Assurez-vous que vos détails sont configurés pour voir comment les politiques affectent spécifiquement votre vie." },
        terminal: { title: "Regard sur le Futur", desc: "Simulez l'impact des nouvelles lois sur l'économie et votre situation personnelle." },
        results: { title: "Résultats de Simulation", desc: "Analysez les résultats projetés à travers différentes chronologies et secteurs." }
      },
      finance: {
        terminal: { title: "Suivi de l'Argent", desc: "Suivez la trace de l'argent derrière les figures politiques, les événements et les organisations." },
        stats: { title: "Métriques Financières", desc: "Consultez l'historique des donateurs, l'impact sur le marché et les conflits d'intérêts potentiels." }
      },
      models: {
        vault: { title: "Coffre-fort Sécurisé", desc: "Gérez vos clés API. Vos identifiants ne quittent jamais cet appareil." },
        marketplace: { title: "Marché des Modèles", desc: "Acquérez des licences pour des modèles d'IA spécialisés forgés pour des tâches spécifiques de recherche de la vérité." },
        list: { title: "Aides Actives", desc: "Configurez et vérifiez vos modèles d'IA connectés et vos personas personnalisés." },
        add: { title: "Fonderie de Modèles", desc: "Forgez de nouveaux assistants d'IA personnalisés ou parcourez le marché pour des outils spécialisés." }
      },
      about: {
        mission: { title: "Le Manifeste", desc: "Comprenez la mission centrale et la technologie décentralisée qui propulsent Factium AI." },
        philosophy: { title: "Notre Philosophie", desc: "Découvrez notre engagement envers la confidentialité, la transparence et la souveraineté des données." },
        roadmap: { title: "Feuille de Route Future", desc: "Découvrez la suite pour la couche de vérité et comment nous évoluons." }
      },
      profile: {
        form: { title: "Mes Détails", desc: "Gardez votre profil à jour pour vous assurer que toutes les simulations et prédictions sont précises." }
      },
      setup: {
        language: { title: "Sélection de la Langue", desc: "Choisissez votre langue d'interface principale pour toutes les communications." },
        engine: { title: "Sélection du Moteur", desc: "Sélectionnez le moteur de traitement d'IA principal pour votre recherche." },
        security: { title: "Configuration de la Sécurité", desc: "Configurez votre connexion sécurisée et gérez votre coffre-fort de données local." }
      },
      common: {
        manual: { title: "Redémarrage Manuel", desc: "Vous pouvez toujours redémarrer le guide pour n'importe quelle fonction en cliquant sur ce bouton." }
      }
    },
    research: { title: "RECHERCHE", subtitle: "Un endroit calme pour comprendre.", modeRestricted: "Filtré", modeUnrestricted: "Non Filtré", placeholder1: "Posez une question...", placeholder2: "Cherchez plus loin...", loading: "En cours...", briefing: "Résumé", controversies: "Controverses et Complots", insights: "Notes", social: "Réseaux", visuals: "Images", sources: "Sources", initiate: "Choisissez une section." }, 
    factChecker: { title: "VÉRIFICATEUR", subtitle: "Trouvez la vraie histoire.", modeRestricted: "Rapide", modeUnrestricted: "Profond", placeholder: "Coller ici...", run: "Vérifier", loading: "Analyse...", tabs: { report: "Controverses", forensic: "Preuves", discovery: "Plus", proof: "Sources de Référence" } }, 
    policy: { title: "REGARD SUR LE FUTUR", subtitle: "L'effet des lois sur vous.", denied: "INFOS MANQUANTES", deniedDesc: "Parlez-nous de vous.", configureBtn: "MES INFOS", activeProfile: "PRÊT", refillProfile: "Modifier", profileVault: "Bóveda de Profils", placeholder: "Ex: Nouvelle taxe...", runBtn: "VOIR LE FUTUR", scoreTitle: "Le Score", narrativeTitle: "Signification", timelineTitle: "Quand", tabs: { impact: "Impact", analysis: "Analyse", news: "Actu", discourse: "Débat", verification: "Preuves" } }, 
    finance: { title: "ARGENT", subtitle: "Suivez les dons.", placeholder: "Un nom...", btn: "SUIVRE", briefTitle: "Résumé", tabs: { donors: "Donateurs", social: "Discussion", news: "Actu", analysis: "Analyse", verification: "Références" }, sourceVerify: "Preuve", noData: "Rien." }, 
    models: { title: "OUTILS", subtitle: "Gérez vos aides.", tabs: { vault: "Clés", marketplace: "Market", custom: "Créer" }, vaultHeader: "Connexion", vaultDesc: "Ajoutez des clés.", geminiStatus: "Actif.", saveBtn: "Enregistrer", purchase: "Accès", licenseAcquired: "Prêt", forgeTitle: "Crear Aide", forgeBtn: "Sauver", identityLabel: "Nom", personaLabel: "Rôle", activeModelsTitle: "Actifs" }, 
    profile: { title: "PROFIL", subtitle: "Dites-nous tout.", autofill: "Charger", restored: "Fait", labels: { name: "Nom", location: "Lieu", income: "Revenus", family: "Famille", occupation: "Métier", political: "Vues" }, saveBtn: "SAUVER", savedMsg: "Sauvé" }, 
    common: { back: "RETOUR", home: "ACCUEIL", verify: "Preuve", viewArchive: "Voir", accessPulse: "Lire", unveil: "Ouvrir", discoveryChambers: "Salles" } 
  }),
  de: enSet,
  zh: enSet,
  ja: enSet,
  ru: enSet,
  pt: enSet,
  ar: enSet,
  hi: enSet,
  it: enSet,
  ko: enSet,
  tr: enSet,
  vi: enSet,
  id: enSet,
};

export const languageNames: Record<LanguageCode, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  zh: "中文",
  ja: "日本語",
  ru: "Русский",
  pt: "Português",
  ar: "العربية",
  hi: "हिन्दी",
  it: "Italiano",
  ko: "한국어",
  tr: "Türkçe",
  vi: "Tiếng Việt",
  id: "Bahasa Indonesia"
};
