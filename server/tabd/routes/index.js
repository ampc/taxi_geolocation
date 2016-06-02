var express = require('express');
var router = express.Router();
var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/trabalho_tabd';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//GET path(id,geom) from table paths
router.get('/api/paths/:id_car',function (req,res) {
	var results =[];
	var id = req.params.id_car;
	pg.connect(connectionString, function (err,client,done) {
		if(err){
			done();
			console.log(err);
			return res.status(500).json({success:false, data:err});
		}

		var query = client.query("SELECT id_car, ST_AsText(geom) FROM paths WHERE id_car=($1)",[id]);

		query.on('row',function (row) {
			results.push(row);

		});

		query.on('end',function(row){
			done();
			return res.json(results);
		});

	})
});
//GET all timestamps related with id_car
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

//GET all paths
router.get('/api/paths/',function (req,res) {
	var results =[];
	pg.connect(connectionString, function (err,client,done) {
		if(err){
			done();
			console.log(err);
			return res.status(500).json({success:false, data:err});
		}

		var query = client.query("SELECT id_car FROM paths;");

		query.on('row',function (row) {
			results.push(row);

		});

		query.on('end',function(row){
			done();
			return res.json(results);
		});

	})
});

//GET posturas
router.get('/api/posturas/',function (req,res) {
	var results =[];
	pg.connect(connectionString, function (err,client,done) {
		if(err){
			done();
			console.log(err);
			return res.status(500).json({success:false, data:err});
		}

		var query = client.query("SELECT name, ST_AsText(local_post)  FROM posturas;");

		query.on('row',function (row) {
			results.push(row);

		});

		query.on('end',function(row){
			done();
			return res.json(results);
		});

	})
});
//GET posturas name,local praça, locais acesso
router.get('/api/posturas/:id_post',function (req,res) {
	var results =[];
	var id_post = req.params.id_post
	pg.connect(connectionString, function (err,client,done) {
		if(err){
			done();
			console.log(err);
			return res.status(500).json({success:false, data:err});
		}

		var query = client.query("SELECT name, ST_AsText(local_post) as local_post, ST_AsText(lugares_post) as lugares_post FROM posturas WHERE id_post=($1);",[id_post]);

		query.on('row',function (row) {
			results.push(row);

		});

		query.on('end',function(row){
			done();
			return res.json(results);
		});

	})
});

//GET nearest praça to current location(:coords)
router.get('/api/nearest/:coords',function (req,res) {
	var results =[];
	var coords = req.params.coords;
	pg.connect(connectionString, function (err,client,done) {
		if(err){
			done();
			console.log(err);
			return res.status(500).json({success:false, data:err});
		}

		var query = client.query("SELECT name, st_AsText(local_post), st_distance(local_post, dcc)/1000 AS distance_km FROM posturas, (select ST_MakePoint("+coords+")::geography as dcc) as dcc WHERE ST_DWithin(local_post, dcc, 10000) ORDER BY ST_Distance(local_post, dcc) LIMIT 10;");
		console.log(query);
		query.on('row',function (row) {
			results.push(row);

		});

		query.on('end',function(row){
			done();
			return res.json(results);
		});

	})
});

//GET centroid o
router.get('/api/centroid',function (req,res) {
	var results =[];
	pg.connect(connectionString, function (err,client,done) {
		if(err){
			done();
			console.log(err);
			return res.status(500).json({success:false, data:err});
		}

		var query = client.query("select ST_AsText(ST_Centroid(ST_Union(ST_GeomFromText(ST_asText(local_post))))) from posturas;");
		console.log(query);
		query.on('row',function (row) {
			results.push(row);

		});

		query.on('end',function(row){
			done();
			return res.json(results);
		});

	})
});

router.get('/api/distance/:praca1/:praca2/',function (req,res) {
	var results =[];
	console.log(req.params);
	var praca1 = req.params.praca1;
	console.log(praca1);
	var praca2 = req.params.praca2;
	console.log(praca2);
	pg.connect(connectionString, function (err,client,done) {
		if(err){
			done();
			console.log(err);
			return res.status(500).json({success:false, data:err});
		}

		var query = client.query("select st_distance(a.local_post, b.local_post)/1000 AS distance_km from posturas a, posturas b where a.name='"+praca1+"' and b.name='"+praca2+"';");
		console.log(query);
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
