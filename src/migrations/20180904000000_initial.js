exports.up = function(knex) {
    return knex.schema.createTable('temperature', t => {
        t.increments().primary();
        t.integer('version')
            .unsigned()
            .defaultTo(1);
        if (knex.connection().client.config.client === 'sqlite3') {
            t.dateTime('createdAt').defaultTo(knex.raw("(datetime('now'))"));
        } else {
            t.dateTime('createdAt').defaultTo(knex.raw('now()'));
        }
        t.decimal('temp1');
        t.decimal('rh1');

        t.decimal('temp2');
        t.decimal('rh2');

        t.decimal('temp3');
        t.decimal('rh3');

        t.decimal('temp4');
        t.decimal('rh4');
    });
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('temperature');
};
