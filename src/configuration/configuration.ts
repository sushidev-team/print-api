export default () => ({
    key: process.env.APP_KEY || 'default',
    port: parseInt(process.env.PORT, 10) || 3000,
    jwt: {
        active: process.env.JWT_ACTIVE || true,
        secret: process.env.JWT_SECRET,
        issuer: process.env.JWT_ISSUER || 'http://localhost:8000/api/auth/login'
    },
    basicAuth: {
        active: process.env.BASIC_ACTIVE || true,
        user: process.env.BASIC_USER || null,
        secret: process.env.BASIC_SECRET || null
    },
    permissions: {
        browseCreate: process.env.PERMISSION_BROWSE_CREATE || 'browse-create',
        browseDestroy: process.env.PERMISSION_BROWSE_DELETE || 'browse-delete',
        browseRead: process.env.PERMISSION_BROWSE_READ || 'browse-read'
    },
    browser: process.env.BROWSER_PATH || null,
    healthcheck: {
        dnsUrl: process.env.HEALTHCHECK_DNS_CHECK_URL || 'https://google.com',
    }
  });