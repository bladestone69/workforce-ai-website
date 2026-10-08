// Approved, deterministic site facts for previews and provider outages.
// This is a guide, not a substitute for the server-side AI assistant.
export function guidedAnswer(question) {
    const text = String(question || '').toLowerCase();
    if (/which website option|what website option|site option.*fit|website.*fit me/.test(text)) {
        return {
            text: 'If you already have a site, Starter Improvement is a focused tune-up and Website Rescue is a deeper overhaul. If you need a new site, Lead Website is the starting route. Tell the team about your current site and goal so they can recommend the right scope.',
            href: 'websites-apps.html', label: 'Compare website services'
        };
    }
    if (/price|cost|budget|package|how much|website option|website care/.test(text)) {
        return {
            text: 'Website starting points are R3,000 for Starter Improvement, R6,500 for Website Rescue, and R12,500 for a new Lead Website. Care starts at R499/month; the fuller Website Care starts at R1,999/month. A person will confirm the right scope and quote.',
            href: 'websites-apps.html', label: 'Explore website services'
        };
    }
    if (/website|web site|site redesign|landing page|web app|\bapp\b/.test(text)) {
        return {
            text: 'We improve existing websites, build new lead-focused sites, and create web apps around a defined goal. Tell us what your current site needs to achieve and we can recommend a starting route.',
            href: 'websites-apps.html', label: 'Explore website services'
        };
    }
    if (/game|play|prototype|drift|mobile test/.test(text)) {
        return {
            text: 'We design games and interactive prototypes. You can try the one-level Drift Protocol preview and explore our studio-owned games; a custom game project is scoped after a brief.',
            href: 'games-interactive.html', label: 'Explore games'
        };
    }
    if (/3d|animation|asset|model/.test(text)) {
        return {
            text: 'We create 3D assets and animation for visual and interactive projects. The right format, detail and production scope depend on where the work will be used.',
            href: '3d-animation.html', label: 'Explore 3D and animation'
        };
    }
    if (/ai|assistant|avatar|automation|luna/.test(text)) {
        return {
            text: 'We scope AI assistants, business avatars and automations around a specific task and its limits. Custom pricing depends on knowledge, integrations, channels and support; a person can help define the brief.',
            href: 'ai-automation.html', label: 'Explore AI and automation'
        };
    }
    if (/project|portfolio|our work|demo|example/.test(text)) {
        return {
            text: 'The Projects page separates studio-owned games, playable prototypes, work in progress, fictional website design demos and digital assets. Service offerings and custom AI solutions have their own pages.',
            href: 'work.html', label: 'Explore projects'
        };
    }
    if (/quote|contact|call|enquir|email|talk|person|human|start/.test(text)) {
        return {
            text: 'Tell us what you are trying to achieve through the contact form. You can request a free 15-minute call there too; the studio will follow up by email.',
            href: 'index.html#contact', label: 'Contact the studio'
        };
    }
    return {
        text: 'I can guide you through websites, apps, games, 3D, AI services and how to contact the studio. For a specific quote, availability or technical decision, please speak to the team.',
        href: 'index.html#contact', label: 'Contact the studio'
    };
}
