import { isBot } from '../platform';
import { isStaging } from '../url/helpers';

/*
 * Simplified configuration with unified WebSocket server
 */

export const livechat_license_id = 12049137;
export const livechat_client_id = '66aa088aad5a414484c1fd1fa8a5ace7';

// Keep only essential platform mappings
export const platform_app_ids = {
    derivgo: 23789,
};

// Default app IDs for special cases
const DEFAULT_APP_IDS = {
    LOCALHOST: 36300,
    BOT_STAGING: 19112,
    BOT_PRODUCTION: 19111,
    DEFAULT_STAGING: 16303,
    DEFAULT_PRODUCTION: 16929,
    DERIV_ME: 1411,
    DERIV_BE: 30767,
    DERIV_BE_STAGING: 31186,
    TEST_APP: 51072
};

export const domain_app_ids = {
    'deriv.app': DEFAULT_APP_IDS.DEFAULT_PRODUCTION,
    'app.deriv.com': DEFAULT_APP_IDS.DEFAULT_PRODUCTION,
    'staging-app.deriv.com': DEFAULT_APP_IDS.DEFAULT_STAGING,
    'app.deriv.me': DEFAULT_APP_IDS.DERIV_ME,
    'staging-app.deriv.me': DEFAULT_APP_IDS.DERIV_ME,
    'app.deriv.be': DEFAULT_APP_IDS.DERIV_BE,
    'staging-app.deriv.be': DEFAULT_APP_IDS.DERIV_BE_STAGING,
    'binary.com': 1,
    'test-app.deriv.com': DEFAULT_APP_IDS.TEST_APP,
};

export const getCurrentProductionDomain = () => {
    const productionDomains = Object.keys(domain_app_ids).filter(domain => !domain.startsWith('staging-'));
    return productionDomains.find(domain => window.location.hostname === domain);
};

export const getAppId = () => {
    // 1. First check for app_id in URL parameters (passed from parent if applicable)
    const urlParams = new URLSearchParams(window.location.search);
    const urlAppId = urlParams.get('app_id');
    
    if (urlAppId && !isNaN(parseInt(urlAppId, 10))) {
        return parseInt(urlAppId, 10);
    }

    // 2. Check for platform-specific app ID
    const platform = window.sessionStorage.getItem('config.platform');
    if (platform && platform_app_ids[platform as keyof typeof platform_app_ids]) {
        return platform_app_ids[platform as keyof typeof platform_app_ids];
    }

    // 3. Check localStorage for manually configured app ID
    const config_app_id = window.localStorage.getItem('config.app_id');
    if (config_app_id) {
        return parseInt(config_app_id, 10);
    }

    // 4. Handle special domain cases
    if (/app\.deriv\.me/i.test(window.location.hostname)) {
        return DEFAULT_APP_IDS.DERIV_ME;
    }
    
    if (/app\.deriv\.be/i.test(window.location.hostname)) {
        return DEFAULT_APP_IDS.DERIV_BE;
    }
    
    if (/staging-app\.deriv\.be/i.test(window.location.hostname)) {
        return DEFAULT_APP_IDS.DERIV_BE_STAGING;
    }
    
    if (/test-app\.deriv\.com/i.test(window.location.hostname)) {
        return DEFAULT_APP_IDS.TEST_APP;
    }

    // 5. Handle local development
    if (/localhost/i.test(window.location.hostname)) {
        return DEFAULT_APP_IDS.LOCALHOST;
    }

    // 6. Default to staging/production based on environment
    if (isStaging()) {
        return isBot() ? DEFAULT_APP_IDS.BOT_STAGING : DEFAULT_APP_IDS.DEFAULT_STAGING;
    }
    
    return isBot() ? DEFAULT_APP_IDS.BOT_PRODUCTION : DEFAULT_APP_IDS.DEFAULT_PRODUCTION;
};

export const getSocketURL = () => {
    // 1. Check for manually configured server URL
    const local_storage_server_url = window.localStorage.getItem('config.server_url');
    if (local_storage_server_url) return local_storage_server_url;

    // 2. Default to unified WebSocket URL
    return 'ws.derivws.com';
};

export const checkAndSetEndpointFromUrl = () => {
    if (isTestLink()) {
        const url_params = new URLSearchParams(location.search.slice(1));

        if (url_params.has('qa_server') && url_params.has('app_id')) {
            const qa_server = url_params.get('qa_server') || '';
            const app_id = url_params.get('app_id') || '';

            if (/^(^(www\.)?qa[0-9]{1,4}\.deriv.dev|(.*)\.derivws\.com)$/.test(qa_server) && /^[0-9]+$/.test(app_id)) {
                localStorage.setItem('config.app_id', app_id);
                localStorage.setItem('config.server_url', qa_server);
                
                // Clean up URL
                url_params.delete('qa_server');
                url_params.delete('app_id');
                const params = url_params.toString();
                const hash = location.hash;
                location.href = `${location.protocol}//${location.hostname}${location.pathname}${
                    params ? `?${params}` : ''
                }${hash || ''}`;

                return true;
            }
        }
    }
    return false;
};

export const getDebugServiceWorker = () => {
    const debug_service_worker_flag = window.localStorage.getItem('debug_service_worker');
    return debug_service_worker_flag ? !!parseInt(debug_service_worker_flag) : false;
};

// Simplified helper functions
export const isProduction = () => {
    const all_domains = Object.keys(domain_app_ids).map(domain => `(www\\.)?${domain.replace('.', '\\.')}`);
    return new RegExp(`^(${all_domains.join('|')})$`, 'i').test(window.location.hostname);
};

export const isTestLink = () => {
    return /^((.*)\.binary\.sx)$/i.test(window.location.hostname);
};

export const isLocal = () => /localhost(:\d+)?$/i.test(window.location.hostname);
