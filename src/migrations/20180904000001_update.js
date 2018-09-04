exports.up = function(knex) {
    return knex.schema.table('temperature', table => {
        table.decimal('pressure1');
        table.decimal('pressure2');
        table.decimal('pressure3');
    });
};

exports.down = function(knex) {
    return knex.schema.table('temperature', table => {
        table.dropColumns('pressure1', 'pressure2', 'pressure3');
    });
};
