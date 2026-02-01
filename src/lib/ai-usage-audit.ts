/**
 * AI Usage & Compliance Audit
 * Detects AI/ML systems on websites and assesses EU AI Act compliance
 * For PrivacyChecker Pro/Pro+ users
 */

// ============ INTERFACES ============

export interface AIUsageResult {
    score: number; // 0-100 compliance score
    aiSystemsDetected: number;
    systems: AISystem[];
    riskBreakdown: {
        prohibited: number;
        highRisk: number;
        limitedRisk: number;
        minimalRisk: number;
    };
    alerts: AIAlert[];
    recommendations: AIRecommendation[];
    euAiActStatus: 'compliant' | 'action-needed' | 'high-risk' | 'critical';
    summary: string;
}

export interface AISystem {
    name: string;
    provider: string;
    category: AICategory;
    riskLevel: AIRiskLevel;
    detected: string; // URL/script where detected
    purpose: string;
    euAiActCategory: string;
    requiresDisclosure: boolean;
    requiresHumanOversight: boolean;
    dataProcessing: 'local' | 'cloud' | 'hybrid' | 'unknown';
}

export type AICategory =
    | 'generative-ai'
    | 'chatbot'
    | 'personalization'
    | 'analytics'
    | 'recommendation'
    | 'content-generation'
    | 'voice-assistant'
    | 'image-generation'
    | 'video-generation'
    | 'translation'
    | 'ad-optimization'
    | 'biometric'
    | 'unknown';

export type AIRiskLevel = 'prohibited' | 'high' | 'limited' | 'minimal';

export interface AIAlert {
    severity: 'critical' | 'high' | 'medium' | 'low';
    system: string;
    message: string;
    regulation: string;
}

export interface AIRecommendation {
    priority: 'critical' | 'high' | 'medium' | 'low';
    title: string;
    description: string;
    regulation: string;
}

// ============ AI PROVIDERS DATABASE ============

interface AIProviderInfo {
    name: string;
    category: AICategory;
    riskLevel: AIRiskLevel;
    purpose: string;
    euAiActCategory: string;
    requiresDisclosure: boolean;
    requiresHumanOversight: boolean;
    dataProcessing: 'local' | 'cloud' | 'hybrid' | 'unknown';
}

const AI_PROVIDERS: Record<string, AIProviderInfo> = {
    // ========== GENERATIVE AI / LLMs ==========
    'api.openai.com': {
        name: 'OpenAI API',
        category: 'generative-ai',
        riskLevel: 'limited',
        purpose: 'AI text generation, ChatGPT API',
        euAiActCategory: 'General Purpose AI',
        requiresDisclosure: true,
        requiresHumanOversight: true,
        dataProcessing: 'cloud',
    },
    'cdn.openai.com': {
        name: 'OpenAI CDN',
        category: 'generative-ai',
        riskLevel: 'limited',
        purpose: 'ChatGPT widget/embedding',
        euAiActCategory: 'General Purpose AI',
        requiresDisclosure: true,
        requiresHumanOversight: true,
        dataProcessing: 'cloud',
    },
    'chat.openai.com': {
        name: 'ChatGPT Widget',
        category: 'chatbot',
        riskLevel: 'limited',
        purpose: 'AI chatbot assistant',
        euAiActCategory: 'AI Chatbot',
        requiresDisclosure: true,
        requiresHumanOversight: false,
        dataProcessing: 'cloud',
    },
    'api.anthropic.com': {
        name: 'Anthropic Claude',
        category: 'generative-ai',
        riskLevel: 'limited',
        purpose: 'Claude AI API',
        euAiActCategory: 'General Purpose AI',
        requiresDisclosure: true,
        requiresHumanOversight: true,
        dataProcessing: 'cloud',
    },
    'api.cohere.ai': {
        name: 'Cohere AI',
        category: 'generative-ai',
        riskLevel: 'limited',
        purpose: 'Enterprise LLM',
        euAiActCategory: 'General Purpose AI',
        requiresDisclosure: true,
        requiresHumanOversight: true,
        dataProcessing: 'cloud',
    },
    'api.together.xyz': {
        name: 'Together AI',
        category: 'generative-ai',
        riskLevel: 'limited',
        purpose: 'Open source LLM hosting',
        euAiActCategory: 'General Purpose AI',
        requiresDisclosure: true,
        requiresHumanOversight: true,
        dataProcessing: 'cloud',
    },
    'api.replicate.com': {
        name: 'Replicate',
        category: 'generative-ai',
        riskLevel: 'limited',
        purpose: 'AI model hosting',
        euAiActCategory: 'General Purpose AI',
        requiresDisclosure: true,
        requiresHumanOversight: true,
        dataProcessing: 'cloud',
    },
    'api-inference.huggingface.co': {
        name: 'Hugging Face',
        category: 'generative-ai',
        riskLevel: 'limited',
        purpose: 'ML model inference',
        euAiActCategory: 'General Purpose AI',
        requiresDisclosure: true,
        requiresHumanOversight: true,
        dataProcessing: 'cloud',
    },
    'generativelanguage.googleapis.com': {
        name: 'Google Gemini',
        category: 'generative-ai',
        riskLevel: 'limited',
        purpose: 'Gemini AI API',
        euAiActCategory: 'General Purpose AI',
        requiresDisclosure: true,
        requiresHumanOversight: true,
        dataProcessing: 'cloud',
    },
    'api.mistral.ai': {
        name: 'Mistral AI',
        category: 'generative-ai',
        riskLevel: 'limited',
        purpose: 'European LLM',
        euAiActCategory: 'General Purpose AI',
        requiresDisclosure: true,
        requiresHumanOversight: true,
        dataProcessing: 'cloud',
    },

    // ========== AI CHATBOTS ==========
    'cdn.botpress.cloud': {
        name: 'Botpress',
        category: 'chatbot',
        riskLevel: 'limited',
        purpose: 'AI chatbot platform',
        euAiActCategory: 'AI Chatbot',
        requiresDisclosure: true,
        requiresHumanOversight: false,
        dataProcessing: 'cloud',
    },
    'cdn.voiceflow.com': {
        name: 'Voiceflow',
        category: 'chatbot',
        riskLevel: 'limited',
        purpose: 'Conversational AI',
        euAiActCategory: 'AI Chatbot',
        requiresDisclosure: true,
        requiresHumanOversight: false,
        dataProcessing: 'cloud',
    },
    'widget.intercom.com': {
        name: 'Intercom (Fin AI)',
        category: 'chatbot',
        riskLevel: 'limited',
        purpose: 'AI customer support',
        euAiActCategory: 'AI Chatbot',
        requiresDisclosure: true,
        requiresHumanOversight: false,
        dataProcessing: 'cloud',
    },
    'js.driftt.com': {
        name: 'Drift AI',
        category: 'chatbot',
        riskLevel: 'limited',
        purpose: 'AI sales chatbot',
        euAiActCategory: 'AI Chatbot',
        requiresDisclosure: true,
        requiresHumanOversight: false,
        dataProcessing: 'cloud',
    },
    'js.crisp.chat': {
        name: 'Crisp AI',
        category: 'chatbot',
        riskLevel: 'limited',
        purpose: 'AI chat assistant',
        euAiActCategory: 'AI Chatbot',
        requiresDisclosure: true,
        requiresHumanOversight: false,
        dataProcessing: 'cloud',
    },
    'widget.freshworks.com': {
        name: 'Freshworks Freddy AI',
        category: 'chatbot',
        riskLevel: 'limited',
        purpose: 'AI customer service',
        euAiActCategory: 'AI Chatbot',
        requiresDisclosure: true,
        requiresHumanOversight: false,
        dataProcessing: 'cloud',
    },
    'cdn.tidio.co': {
        name: 'Tidio AI',
        category: 'chatbot',
        riskLevel: 'limited',
        purpose: 'AI chat widget',
        euAiActCategory: 'AI Chatbot',
        requiresDisclosure: true,
        requiresHumanOversight: false,
        dataProcessing: 'cloud',
    },
    'embed.tawk.to': {
        name: 'Tawk.to AI',
        category: 'chatbot',
        riskLevel: 'limited',
        purpose: 'Live chat with AI',
        euAiActCategory: 'AI Chatbot',
        requiresDisclosure: true,
        requiresHumanOversight: false,
        dataProcessing: 'cloud',
    },
    'js.zendesk.com': {
        name: 'Zendesk AI',
        category: 'chatbot',
        riskLevel: 'limited',
        purpose: 'AI customer support',
        euAiActCategory: 'AI Chatbot',
        requiresDisclosure: true,
        requiresHumanOversight: false,
        dataProcessing: 'cloud',
    },

    // ========== AI PERSONALIZATION ==========
    'cdn.dynamicyield.com': {
        name: 'Dynamic Yield',
        category: 'personalization',
        riskLevel: 'limited',
        purpose: 'AI personalization engine',
        euAiActCategory: 'Recommendation System',
        requiresDisclosure: false,
        requiresHumanOversight: false,
        dataProcessing: 'cloud',
    },
    'cdn.optimizely.com': {
        name: 'Optimizely AI',
        category: 'personalization',
        riskLevel: 'limited',
        purpose: 'AI A/B testing & personalization',
        euAiActCategory: 'Recommendation System',
        requiresDisclosure: false,
        requiresHumanOversight: false,
        dataProcessing: 'cloud',
    },
    'cdn.segment.com': {
        name: 'Segment (Twilio)',
        category: 'personalization',
        riskLevel: 'minimal',
        purpose: 'AI customer data platform',
        euAiActCategory: 'Data Analytics',
        requiresDisclosure: false,
        requiresHumanOversight: false,
        dataProcessing: 'cloud',
    },
    'cdn.amplitude.com': {
        name: 'Amplitude AI',
        category: 'analytics',
        riskLevel: 'minimal',
        purpose: 'AI product analytics',
        euAiActCategory: 'Data Analytics',
        requiresDisclosure: false,
        requiresHumanOversight: false,
        dataProcessing: 'cloud',
    },
    'cdn.mixpanel.com': {
        name: 'Mixpanel AI',
        category: 'analytics',
        riskLevel: 'minimal',
        purpose: 'AI analytics insights',
        euAiActCategory: 'Data Analytics',
        requiresDisclosure: false,
        requiresHumanOversight: false,
        dataProcessing: 'cloud',
    },
    'cdn.heapanalytics.com': {
        name: 'Heap AI',
        category: 'analytics',
        riskLevel: 'minimal',
        purpose: 'AI behavioral analytics',
        euAiActCategory: 'Data Analytics',
        requiresDisclosure: false,
        requiresHumanOversight: false,
        dataProcessing: 'cloud',
    },

    // ========== AI RECOMMENDATION ==========
    'cdn.algolia.com': {
        name: 'Algolia AI',
        category: 'recommendation',
        riskLevel: 'limited',
        purpose: 'AI search & recommendations',
        euAiActCategory: 'Recommendation System',
        requiresDisclosure: false,
        requiresHumanOversight: false,
        dataProcessing: 'cloud',
    },
    'cdn.constructor.io': {
        name: 'Constructor.io',
        category: 'recommendation',
        riskLevel: 'limited',
        purpose: 'AI product discovery',
        euAiActCategory: 'Recommendation System',
        requiresDisclosure: false,
        requiresHumanOversight: false,
        dataProcessing: 'cloud',
    },
    'cdn.nosto.com': {
        name: 'Nosto AI',
        category: 'recommendation',
        riskLevel: 'limited',
        purpose: 'AI e-commerce personalization',
        euAiActCategory: 'Recommendation System',
        requiresDisclosure: false,
        requiresHumanOversight: false,
        dataProcessing: 'cloud',
    },
    'cdn.barilliance.com': {
        name: 'Barilliance',
        category: 'recommendation',
        riskLevel: 'limited',
        purpose: 'AI product recommendations',
        euAiActCategory: 'Recommendation System',
        requiresDisclosure: false,
        requiresHumanOversight: false,
        dataProcessing: 'cloud',
    },

    // ========== AI CONTENT GENERATION ==========
    'cdn.copy.ai': {
        name: 'Copy.ai',
        category: 'content-generation',
        riskLevel: 'limited',
        purpose: 'AI content writing',
        euAiActCategory: 'Content Generation',
        requiresDisclosure: true,
        requiresHumanOversight: true,
        dataProcessing: 'cloud',
    },
    'cdn.jasper.ai': {
        name: 'Jasper AI',
        category: 'content-generation',
        riskLevel: 'limited',
        purpose: 'AI marketing content',
        euAiActCategory: 'Content Generation',
        requiresDisclosure: true,
        requiresHumanOversight: true,
        dataProcessing: 'cloud',
    },
    'cdn.writer.com': {
        name: 'Writer AI',
        category: 'content-generation',
        riskLevel: 'limited',
        purpose: 'Enterprise AI writing',
        euAiActCategory: 'Content Generation',
        requiresDisclosure: true,
        requiresHumanOversight: true,
        dataProcessing: 'cloud',
    },

    // ========== AI VOICE / AUDIO ==========
    'cdn.elevenlabs.io': {
        name: 'ElevenLabs',
        category: 'voice-assistant',
        riskLevel: 'limited',
        purpose: 'AI voice synthesis',
        euAiActCategory: 'Synthetic Media',
        requiresDisclosure: true,
        requiresHumanOversight: false,
        dataProcessing: 'cloud',
    },
    'cdn.murf.ai': {
        name: 'Murf AI',
        category: 'voice-assistant',
        riskLevel: 'limited',
        purpose: 'AI voiceover',
        euAiActCategory: 'Synthetic Media',
        requiresDisclosure: true,
        requiresHumanOversight: false,
        dataProcessing: 'cloud',
    },
    'cdn.resemble.ai': {
        name: 'Resemble AI',
        category: 'voice-assistant',
        riskLevel: 'limited',
        purpose: 'AI voice cloning',
        euAiActCategory: 'Synthetic Media',
        requiresDisclosure: true,
        requiresHumanOversight: true,
        dataProcessing: 'cloud',
    },
    'cdn.play.ht': {
        name: 'Play.ht',
        category: 'voice-assistant',
        riskLevel: 'limited',
        purpose: 'AI text-to-speech',
        euAiActCategory: 'Synthetic Media',
        requiresDisclosure: true,
        requiresHumanOversight: false,
        dataProcessing: 'cloud',
    },

    // ========== AI VIDEO / IMAGE ==========
    'cdn.synthesia.io': {
        name: 'Synthesia',
        category: 'video-generation',
        riskLevel: 'limited',
        purpose: 'AI video avatars',
        euAiActCategory: 'Synthetic Media',
        requiresDisclosure: true,
        requiresHumanOversight: true,
        dataProcessing: 'cloud',
    },
    'cdn.heygen.com': {
        name: 'HeyGen',
        category: 'video-generation',
        riskLevel: 'limited',
        purpose: 'AI video generation',
        euAiActCategory: 'Synthetic Media',
        requiresDisclosure: true,
        requiresHumanOversight: true,
        dataProcessing: 'cloud',
    },
    'cdn.d-id.com': {
        name: 'D-ID',
        category: 'video-generation',
        riskLevel: 'limited',
        purpose: 'AI talking avatars',
        euAiActCategory: 'Synthetic Media',
        requiresDisclosure: true,
        requiresHumanOversight: true,
        dataProcessing: 'cloud',
    },
    'cdn.runway.ml': {
        name: 'Runway ML',
        category: 'video-generation',
        riskLevel: 'limited',
        purpose: 'AI video editing',
        euAiActCategory: 'Synthetic Media',
        requiresDisclosure: true,
        requiresHumanOversight: true,
        dataProcessing: 'cloud',
    },

    // ========== AI TRANSLATION ==========
    'cdn.deepl.com': {
        name: 'DeepL',
        category: 'translation',
        riskLevel: 'minimal',
        purpose: 'AI translation',
        euAiActCategory: 'Language Processing',
        requiresDisclosure: false,
        requiresHumanOversight: false,
        dataProcessing: 'cloud',
    },
    'translate.google.com': {
        name: 'Google Translate',
        category: 'translation',
        riskLevel: 'minimal',
        purpose: 'AI translation widget',
        euAiActCategory: 'Language Processing',
        requiresDisclosure: false,
        requiresHumanOversight: false,
        dataProcessing: 'cloud',
    },

    // ========== AI AD OPTIMIZATION ==========
    'connect.facebook.net': {
        name: 'Meta AI Ads',
        category: 'ad-optimization',
        riskLevel: 'minimal',
        purpose: 'AI ad targeting & bidding',
        euAiActCategory: 'Ad Optimization',
        requiresDisclosure: false,
        requiresHumanOversight: false,
        dataProcessing: 'cloud',
    },
    'googleads.g.doubleclick.net': {
        name: 'Google Smart Bidding',
        category: 'ad-optimization',
        riskLevel: 'minimal',
        purpose: 'AI ad bidding',
        euAiActCategory: 'Ad Optimization',
        requiresDisclosure: false,
        requiresHumanOversight: false,
        dataProcessing: 'cloud',
    },
    'cdn.criteo.com': {
        name: 'Criteo AI',
        category: 'ad-optimization',
        riskLevel: 'minimal',
        purpose: 'AI retargeting',
        euAiActCategory: 'Ad Optimization',
        requiresDisclosure: false,
        requiresHumanOversight: false,
        dataProcessing: 'cloud',
    },

    // ========== HIGH-RISK AI (EU AI Act) ==========
    'cdn.onfido.com': {
        name: 'Onfido',
        category: 'biometric',
        riskLevel: 'high',
        purpose: 'AI identity verification',
        euAiActCategory: 'Biometric ID',
        requiresDisclosure: true,
        requiresHumanOversight: true,
        dataProcessing: 'cloud',
    },
    'cdn.jumio.com': {
        name: 'Jumio',
        category: 'biometric',
        riskLevel: 'high',
        purpose: 'AI document verification',
        euAiActCategory: 'Biometric ID',
        requiresDisclosure: true,
        requiresHumanOversight: true,
        dataProcessing: 'cloud',
    },
    'cdn.veriff.com': {
        name: 'Veriff',
        category: 'biometric',
        riskLevel: 'high',
        purpose: 'AI identity verification',
        euAiActCategory: 'Biometric ID',
        requiresDisclosure: true,
        requiresHumanOversight: true,
        dataProcessing: 'cloud',
    },
    'cdn.trulioo.com': {
        name: 'Trulioo',
        category: 'biometric',
        riskLevel: 'high',
        purpose: 'AI identity verification',
        euAiActCategory: 'Biometric ID',
        requiresDisclosure: true,
        requiresHumanOversight: true,
        dataProcessing: 'cloud',
    },
    'cdn.ekata.com': {
        name: 'Ekata',
        category: 'biometric',
        riskLevel: 'high',
        purpose: 'AI fraud detection',
        euAiActCategory: 'Fraud Detection',
        requiresDisclosure: true,
        requiresHumanOversight: true,
        dataProcessing: 'cloud',
    },
    'cdn.sift.com': {
        name: 'Sift',
        category: 'biometric',
        riskLevel: 'high',
        purpose: 'AI fraud prevention',
        euAiActCategory: 'Fraud Detection',
        requiresDisclosure: true,
        requiresHumanOversight: true,
        dataProcessing: 'cloud',
    },
};

// AI keywords in scripts that might indicate AI usage
const AI_KEYWORDS = [
    'openai', 'gpt-3', 'gpt-4', 'gpt4', 'chatgpt',
    'anthropic', 'claude',
    'gemini', 'bard',
    'llm', 'large-language-model',
    'ai-assistant', 'ai-chat', 'ai-bot',
    'machine-learning', 'ml-model',
    'neural-network', 'deep-learning',
    'tensorflow', 'pytorch',
    'huggingface', 'transformers',
];

// ============ ANALYSIS FUNCTIONS ============

function detectAIProvider(url: string): AIProviderInfo | null {
    const lowerUrl = url.toLowerCase();

    for (const [pattern, info] of Object.entries(AI_PROVIDERS)) {
        if (lowerUrl.includes(pattern)) {
            return info;
        }
    }

    return null;
}

function detectAIKeywords(html: string): string[] {
    const found: string[] = [];
    const lowerHtml = html.toLowerCase();

    for (const keyword of AI_KEYWORDS) {
        if (lowerHtml.includes(keyword)) {
            found.push(keyword);
        }
    }

    return [...new Set(found)];
}

function generateAlerts(systems: AISystem[]): AIAlert[] {
    const alerts: AIAlert[] = [];

    // Check for high-risk systems
    const highRiskSystems = systems.filter(s => s.riskLevel === 'high');
    for (const system of highRiskSystems) {
        alerts.push({
            severity: 'high',
            system: system.name,
            message: `${system.name} is a HIGH-RISK AI system under EU AI Act - requires conformity assessment`,
            regulation: 'EU AI Act Article 6',
        });
    }

    // Check for systems requiring disclosure
    const undisclosedChatbots = systems.filter(s =>
        s.category === 'chatbot' && s.requiresDisclosure
    );
    for (const chatbot of undisclosedChatbots) {
        alerts.push({
            severity: 'medium',
            system: chatbot.name,
            message: `${chatbot.name} must disclose to users that they're interacting with AI`,
            regulation: 'EU AI Act Article 52',
        });
    }

    // Check for synthetic media
    const syntheticMedia = systems.filter(s =>
        s.euAiActCategory === 'Synthetic Media'
    );
    for (const media of syntheticMedia) {
        alerts.push({
            severity: 'medium',
            system: media.name,
            message: `${media.name} generates synthetic content - must be labeled as AI-generated`,
            regulation: 'EU AI Act Article 52(3)',
        });
    }

    // Check for human oversight requirements
    const needsOversight = systems.filter(s => s.requiresHumanOversight);
    if (needsOversight.length > 0) {
        alerts.push({
            severity: 'medium',
            system: needsOversight.map(s => s.name).join(', '),
            message: `Human oversight mechanism required for: ${needsOversight.map(s => s.name).join(', ')}`,
            regulation: 'EU AI Act Article 14',
        });
    }

    return alerts.sort((a, b) => {
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return severityOrder[a.severity] - severityOrder[b.severity];
    });
}

function generateRecommendations(
    systems: AISystem[],
    alerts: AIAlert[]
): AIRecommendation[] {
    const recommendations: AIRecommendation[] = [];

    // High-risk AI systems
    if (systems.some(s => s.riskLevel === 'high')) {
        recommendations.push({
            priority: 'critical',
            title: 'Conduct AI Conformity Assessment',
            description: 'High-risk AI systems require a conformity assessment before deployment in the EU',
            regulation: 'EU AI Act Article 43',
        });
    }

    // Chatbot disclosure
    if (systems.some(s => s.category === 'chatbot')) {
        recommendations.push({
            priority: 'high',
            title: 'Add AI Chatbot Disclosure',
            description: 'Clearly inform users when they are interacting with an AI system, not a human',
            regulation: 'EU AI Act Article 52(1)',
        });
    }

    // Synthetic media
    if (systems.some(s => s.euAiActCategory === 'Synthetic Media')) {
        recommendations.push({
            priority: 'high',
            title: 'Label AI-Generated Content',
            description: 'Mark all AI-generated images, audio, and video as artificially created',
            regulation: 'EU AI Act Article 52(3)',
        });
    }

    // General AI usage
    if (systems.length > 0) {
        recommendations.push({
            priority: 'medium',
            title: 'Document AI Systems in Privacy Policy',
            description: 'List all AI systems used, their purposes, and data processing activities',
            regulation: 'GDPR Article 13 + EU AI Act',
        });

        recommendations.push({
            priority: 'medium',
            title: 'Establish AI Governance Framework',
            description: 'Define roles, responsibilities, and monitoring processes for AI systems',
            regulation: 'EU AI Act Article 9',
        });
    }

    // Human oversight
    if (systems.some(s => s.requiresHumanOversight)) {
        recommendations.push({
            priority: 'high',
            title: 'Implement Human Oversight Mechanisms',
            description: 'Ensure humans can intervene, override, or stop AI system decisions',
            regulation: 'EU AI Act Article 14',
        });
    }

    // Generative AI
    if (systems.some(s => s.category === 'generative-ai')) {
        recommendations.push({
            priority: 'medium',
            title: 'Document Training Data & Model Cards',
            description: 'Maintain documentation on AI model training data and capabilities',
            regulation: 'EU AI Act Article 53',
        });
    }

    return recommendations.sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
}

// ============ MAIN ANALYSIS FUNCTION ============

export function analyzeAIUsage(
    scripts: { url: string; category?: string }[],
    trackers: string[],
    html?: string
): AIUsageResult {
    const systems: AISystem[] = [];
    const detectedProviders = new Set<string>();

    // Analyze external scripts
    for (const script of scripts) {
        const provider = detectAIProvider(script.url);
        if (provider && !detectedProviders.has(provider.name)) {
            detectedProviders.add(provider.name);
            systems.push({
                ...provider,
                provider: provider.name,
                detected: script.url,
            });
        }
    }

    // Analyze trackers
    for (const tracker of trackers) {
        const provider = detectAIProvider(tracker);
        if (provider && !detectedProviders.has(provider.name)) {
            detectedProviders.add(provider.name);
            systems.push({
                ...provider,
                provider: provider.name,
                detected: tracker,
            });
        }
    }

    // Analyze HTML for AI keywords (if provided)
    const aiKeywords = html ? detectAIKeywords(html) : [];

    // Calculate risk breakdown
    const riskBreakdown = {
        prohibited: systems.filter(s => s.riskLevel === 'prohibited').length,
        highRisk: systems.filter(s => s.riskLevel === 'high').length,
        limitedRisk: systems.filter(s => s.riskLevel === 'limited').length,
        minimalRisk: systems.filter(s => s.riskLevel === 'minimal').length,
    };

    // Generate alerts and recommendations
    const alerts = generateAlerts(systems);
    const recommendations = generateRecommendations(systems, alerts);

    // Calculate compliance score
    let score = 100;

    // Deductions for each AI system without proper controls
    for (const system of systems) {
        if (system.riskLevel === 'high') {
            score -= 20; // High-risk without conformity assessment
        } else if (system.riskLevel === 'limited' && system.requiresDisclosure) {
            score -= 10; // Limited risk without disclosure
        } else if (system.riskLevel === 'limited') {
            score -= 5;
        }
    }

    // Additional deductions
    if (alerts.some(a => a.severity === 'critical')) score -= 15;
    if (alerts.some(a => a.severity === 'high')) score -= 10;

    score = Math.max(0, Math.min(100, score));

    // Determine EU AI Act status
    let euAiActStatus: AIUsageResult['euAiActStatus'];
    if (riskBreakdown.prohibited > 0) {
        euAiActStatus = 'critical';
    } else if (riskBreakdown.highRisk > 0) {
        euAiActStatus = 'high-risk';
    } else if (score < 70) {
        euAiActStatus = 'action-needed';
    } else {
        euAiActStatus = 'compliant';
    }

    // Generate summary
    let summary: string;
    if (systems.length === 0) {
        summary = 'No AI systems detected on this website.';
    } else if (euAiActStatus === 'compliant') {
        summary = `${systems.length} AI system(s) detected. Appears compliant with EU AI Act requirements.`;
    } else if (euAiActStatus === 'action-needed') {
        summary = `${systems.length} AI system(s) detected. Some compliance actions may be required.`;
    } else if (euAiActStatus === 'high-risk') {
        summary = `${systems.length} AI system(s) detected including high-risk systems. Conformity assessment required.`;
    } else {
        summary = `Critical: Prohibited AI practices detected. Immediate action required.`;
    }

    return {
        score,
        aiSystemsDetected: systems.length,
        systems,
        riskBreakdown,
        alerts,
        recommendations,
        euAiActStatus,
        summary,
    };
}
