const knex = require("knex");
const config = require('./config');
const path = require("path");

const databaseConfig = config.databaseConfig;

async function createDB() {
    const cfg = Object.assign({}, databaseConfig);
    cfg.migrations = {
        directory: path.resolve(__dirname, "migrations")
    };

    if (cfg.client == "sqlite3") {
        console.log(
            `Using sqlite database: ${databaseConfig.connection.filename}`
        );
        const db = await runMigrations(knex(cfg));

        await db.destroy();
    } else {
        await create(cfg);
        await runMigrations(knex(cfg)).then(db => db.destroy());
    }
}

async function runMigrations(db) {
    const before = await db.migrate.currentVersion().catch(e => {
        throw e;
    });
    await db.migrate.latest().catch(e => {
        console.log(`Error while migrating: ${e.message}`);
        throw e;
    });
    const after = await db.migrate.currentVersion().catch(e => {
        throw e;
    });
    if (after !== before) {
        console.log(`Successful migration from ${before} to ${after}`);
    } else {
        console.log(`Current db schema version: ${after}`);
    }
    return db;
}

async function create(cfg) {
    const createCfg = Object.assign({}, cfg);
    const { connection } = createCfg;

    const seperatorPos = connection.lastIndexOf("/");
    let dbName = connection.slice(seperatorPos + 1);

    const match = /\?.*/;
    dbName = dbName.replace(match, '');

    const create = knex(cfg);
    try {
        const precheck = await create
            .raw(
                "SELECT table_schema,table_name FROM information_schema.tables;"
            )
            .catch(err => {
                console.log(`Error while creating ${dbName}: ${err.message}`);
                throw err;
            });
        if (precheck.rows[0].exist) {
            console.log(`${dbName} already exists, not creating`);
            return;
        }
        const values = await create
            .raw(
                `select count(*) > 0 as exist from pg_catalog.pg_database where datname = '${dbName}';`
            )
            .catch(err => {
                console.log(`Error while creating ${dbName}: ${err.message}`);
                throw err;
            });
        if (!values.rows[0].exist) {
            await create.raw(`CREATE DATABASE ${dbName};`).catch(err => {
                console.log(`Error while creating ${dbName}: ${err.message}`);
                throw err;
            });
            console.log(`${dbName} successfully created!`);
        } else {
            console.log(`${dbName} already exists, not creating`);
        }
    } finally {
        create.destroy();
    }
}

module.exports = {
    db: knex(config.databaseConfig),
    createDB
}
