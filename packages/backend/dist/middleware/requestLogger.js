"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
const requestLogger = (req, res, next) => {
    const start = Date.now();
    console.log(`📥 ${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
    if (req.method !== 'GET' && req.body && Object.keys(req.body).length > 0) {
        console.log('📦 Request Body:', JSON.stringify(req.body, null, 2));
    }
    const originalEnd = res.end;
    res.end = function (chunk, encoding) {
        const duration = Date.now() - start;
        const statusCode = res.statusCode;
        const statusEmoji = statusCode >= 200 && statusCode < 300 ? '✅' :
            statusCode >= 400 && statusCode < 500 ? '⚠️' : '❌';
        console.log(`${statusEmoji} ${req.method} ${req.originalUrl} - ${statusCode} (${duration}ms)`);
        originalEnd.call(this, chunk, encoding);
    };
    next();
};
exports.requestLogger = requestLogger;
//# sourceMappingURL=requestLogger.js.map