// Configuration file for API endpoints and constants

const CONFIG = {
    API_BASE_INVENTARIOS: 'https://nestorcornejo.com/macguiver-inventarios',
    API_ENDPOINTS: {
        PRODUCTS: {
            LIST: '/products',
            STATS: '/products/stats',
            CREATE: '/products',
            UPDATE: '/products',
            BULK_IMPORT: '/products/bulk-import'
        },
        USERS: {
            LIST: '/users',
            CREATE: '/users',
            UPDATE: '/users',
            UPDATE_PASSWORD: '/users',
            DELETE: '/users'
        }
    }
};

// Helper function to get full API URL
function getApiUrl(endpoint) {
    return CONFIG.API_BASE_INVENTARIOS + endpoint;
}
