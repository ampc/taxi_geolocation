var express = require('express');
var router = express.Router();
var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/trabalho_tabd';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/api/paths/:id_car',function (req,res) {
	var results =[];
	var id = req.params.id_car;
	pg.connect(connectionString, function (err,client,done) {
		if(err){
			done();
			console.log(err);
			return res.status(500).json({success:false, data:err});
		}

		var query = client.query("SELECT id_car, ST_AsGeoJSON(geom) FROM paths WHERE id_car=($1)",[id]);

		query.on('row',function (row) {
			results.push(row);

		});

		query.on('end',function(row){
			done();
			return res.json(results);
		});

	})
});
router.get('/api/paths/timestamps/:id_car',function (req,res) {
	var results =[];
	var id = req.params.id_car;
	pg.connect(connectionString, function (err,client,done) {
		if(err){
			done();
			console.log(err);
			return res.status(500).json({success:false, data:err});
		}

		var query = client.query("SELECT paths.id_car,timestamps FROM paths_timestamps INNER JOIN paths ON paths.id_car=paths_timestamps.id_car WHERE paths.id_car=($1);",[id]);

		query.on('row',function (row) {
			results.push(row);

		});

		query.on('end',function(row){
			done();
			return res.json(results);
		});

	})
});
router.get('/api/posturas/',function (req,res) {
	var results =[];
	pg.connect(connectionString, function (err,client,done) {
		if(err){
			done();
			console.log(err);
			return res.status(500).json({success:false, data:err});
		}

		var query = client.query("SELECT name, ST_AsGeoJSON(local_post) FROM posturas;");

		query.on('row',function (row) {
			results.push(row);

		});

		query.on('end',function(row){
			done();
			return res.json(results);
		});

	})
});
//comeca em 1
router.get('/api/posturas/:id_post',function (req,res) {
	var results =[];
	var id_post = req.params.id_post
	pg.connect(connectionString, function (err,client,done) {
		if(err){
			done();
			console.log(err);
			return res.status(500).json({success:false, data:err});
		}

		var query = client.query("SELECT name, ST_AsGeoJSON(local_post), ST_AsGeoJSON(lugares_post) FROM posturas WHERE id_post=($1);",[id_post]);

		query.on('row',function (row) {
			results.push(row);

		});

		query.on('end',function(row){
			done();
			return res.json(results);
		});

	})
});

module.exports = router;
