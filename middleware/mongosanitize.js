const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value);

const sanitize = (obj) => {
    if (!isObject(obj)) return;

    for (const key in obj) {
        if (key.startsWith('$') || key.includes('.')) {
            // Remove dangerous keys
            delete obj[key];
        } else if (isObject(obj[key])) {
            // Recursively sanitize nested objects
            sanitize(obj[key]);
        }
    }
};

const sanitizeMiddleware = (req, res, next) => {
    if (req.body) {
        // Deep clone to avoid read-only errors
        req.body = JSON.parse(JSON.stringify(req.body));
        sanitize(req.body);
    }

    if (req.query) {
        // Deep clone
        req.query = JSON.parse(JSON.stringify(req.query));
        sanitize(req.query);
    }

    if (req.params) {
        // Deep clone
        req.params = JSON.parse(JSON.stringify(req.params));
        sanitize(req.params);
    }

    next();
};

module.exports = sanitizeMiddleware;
