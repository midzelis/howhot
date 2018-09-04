// load env from .env
require('dotenv').config();
const path = require('path');
const os = require('os');

const config = {
    test: {
        client: 'sqlite3',
        connection: {
            filename: path.resolve(os.tmpdir(), `./test-${Date.now()}.sqlite`),
        },
        useNullAsDefault: true,
    },
    production: {
        client: 'pg',
        connection: `${process.env.DATABASE_URL}?ssl=true`,
    },
    local: {
        client: 'sqlite3',
        connection: {
            filename: path.resolve(__dirname, '../runtime/local.sqlite'),
        },
        useNullAsDefault: true,
    },
};

let mode = process.env.NODE_ENV;
if (mode === 'production' && !process.env.DATABASE_URL) {
    console.log(
        'Specified production, but no DATABASE_URL provided, defaulting back to local sqlite database',
    );
    mode = 'local';
}
if (!mode) {
    mode = 'local';
}

const databaseConfig = config[mode];
if (!databaseConfig) {
    const availableEnv = Object.keys(config).join(', ');

    throw new Error(
        `Unknown config NODE_ENV=${mode} (available: ${availableEnv})`,
    );
}

module.exports = {
    mode,
    isProduction: mode === 'production',
    isTest: mode === 'test',
    port: process.env.PORT || 3000,
    databaseConfig,
    workers: process.env.WEB_CONCURRENCY || 1,
};
