
exports.up = function(knex, Promise) {
    return knex.schema.createTable('users', function(tbl){
        tbl.increments('id').primary();
        tbl.string("name", 255).notNullable();
        tbl.string("email", 255);
        tbl.string("google_id", 500).notNullable();
        tbl.integer("phone")
        tbl.enum('user_type', ['mothers', 'drivers', 'caretakers']).notNullable()
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('users');
};