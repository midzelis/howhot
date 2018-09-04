const { createDB } = require('./db');
const express = require('express');
const morgan = require('morgan');
const compression = require('compression');
const https = require('http');
const auth = require('http-auth');
const terminus = require('@godaddy/terminus');
const path = require('path');

const { port, mode, isProduction } = require('./config');
const { router: apiRouter } = require('./routes/api');

const hosts = process.env.REDIRECT_HOSTS || '';
const pairs = hosts.split(',').map(p => p.split('::'));

function redirectHost() {
    return (req, res, next) => {
        if (pairs) {
            for (let i = 0; i < pairs.length; i++) {
                const pair = pairs[i];
                if (req.hostname === pair[0]) {
                    res.redirect(
                        302,
                        req.protocol + '://' + [pair[1]] + req.originalUrl,
                    );
                    return;
                }
            }
        }
        next();
    };
}

function redirectSSL() {
    return (req, res, next) => {
        if (
            process.env.SSL_REDIRECT &&
            req.headers['x-forwarded-proto'] !== 'https'
        ) {
            res.redirect(302, 'https://' + req.hostname + req.originalUrl);
            return;
        }
        next();
    };
}

function resolve(relPath) {
    return path.join(__dirname, relPath);
}

async function startup() {
    await createDB();

    const app = express();
    app.disable('x-powered-by');
    app.use(redirectSSL());
    app.use(redirectHost());
    app.set('trust proxy', true);
    app.use(compression());
    const pattern =
        ':method :url :status :response-time ms - :res[content-length]';
    app.use(morgan(isProduction ? 'combined' : pattern));

    app.use('/', express.static(resolve('../app')));
    app.use('/api', apiRouter);

    if (process.env.PASSWORD) {
        const basic = auth.basic(
            { realm: 'Enter password' },
            (username, password, callback) => {
                callback(username === '' && password === process.env.PASSWORD);
            },
        );
        app.use(auth.connect(basic));
    }

    const server = https.createServer(app);
    terminus(server, {
        signal: 'SIGINT',
    });
    server.listen(port, () => {
        console.log(
            `Server running on https://${require('os').hostname()}:${port} | ${mode} mode`,
        );
    });
}

startup();
