var pg = require('pg');
var connectionString = process.env.DATABASE_URK || 'postgres://localhost:5432/trabalho_tabd';

var client = new pg.Client(connectionString);
client.connect();

var query = client.query('SELECT NOW() AS "theTime"');
query.on('end',function () {
	client.end();

})
