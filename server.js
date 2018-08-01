'use strict';

const app = require('express')(),
	http = require('http'),
	compression = require('compression'),
	fs = require('fs'),
	xpath = require('xpath'),
	dom = require('xmldom').DOMParser,
	convert = require('xml-js'),
	console = require('console');

const out = process.stdout;
const err = process.stderr;
const myConsole = new console.Console(out, err);


app.use(compression());

var categories = null,
	natures = null,
	deliberations = null,
	deliberations2Json = null,
	categories2Json = null,
	natures2Json = null,
	listeningPort = 3000,
	fichierDeTaxation = "/data/taxe_sejour_2018_05_31_reformate.xml";


Object.prototype.xml2json = function () {
	var out = [];
	for (var node of this) {
		out.push(JSON.parse(convert.xml2json(node.toString(), {
			compact: true
		})));
	}
	return out;
};

var search2json = function (xPath, parentNode) {
	return new Promise(function (onFulfill, onReject) {
		onFulfill(xpath.select(xPath, parentNode).xml2json());
	});
};


app.all('*', function (req, res, next) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		myConsole.log("%s - request : %s", Date.now(), req.url);
		next();
	})
	.get('/deliberations', function (req, res) {
		res.send({
			status: 0,
			count: deliberations2Json.length,
			deliberations: deliberations2Json
		});
	})
	.get('/natures', function (req, res) {
		res.send({
			status: 0,
			count: natures2Json.length,
			natures: natures2Json
		});
	})
	.get('/categories', function (req, res) {
		res.send({
			status: 0,
			count: categories2Json.length,
			categories: categories2Json
		});
	})
	.get('/deliberations/commune/siren/:siren', function (req, res) {
		var reqSiren = req.params.siren;
		search2json('//deliberation/collectivites/collectivite[@siren="' + reqSiren + '"]/parent::*/parent::deliberation', deliberations)
			.then(function (result) {
				res.send({
					status: 0,
					count: result.length,
					deliberations: result
				});
			}).catch(function (err) {
				res.status(500).send({
					status: 1,
					error: 'Something failed !',
					message: err.stack
				});
			});
	})
	.get('/deliberations/commune/nom/:nom', function (req, res) {
		var reqNom = req.params.nom;
		search2json('//deliberation/collectivites/collectivite/nom[contains(text(),"' + reqNom + '")]/../parent::*/parent::deliberation', deliberations)
			.then(function (result) {
				res.send({
					status: 0,
					count: result.length,
					deliberations: result
				});
			}).catch(function (err) {
				res.status(500).send({
					status: 1,
					error: 'Something failed !',
					message: err.stack
				});
			});
	})
	.get('/deliberations/siren/:siren', function (req, res) {
		var reqSiren = req.params.siren;
		search2json('//deliberation/saisie/collectiviteDeliberante[@siren="' + reqSiren + '"]/parent::*/parent::deliberation', deliberations)
			.then(function (result) {
				res.send({
					status: 0,
					count: result.length,
					deliberations: result
				});
			}).catch(function (err) {
				res.status(500).send({
					status: 1,
					error: 'Something failed !',
					message: err.stack
				});
			});
	})
	.get('/deliberations/nom/:nom', function (req, res) {
		var reqNom = req.params.nom;
		search2json('//deliberation/saisie/collectiviteDeliberante/nom[contains(text(),"' + reqNom + '")]/../parent::*/parent::deliberation', deliberations)
			.then(function (result) {
				res.send({
					status: 0,
					count: result.length,
					deliberations: result
				});
			}).catch(function (err) {
				res.status(500).send({
					status: 1,
					error: 'Something failed !',
					message: err.stack
				});
			});
	})
	.get('*', function (req, res) {
		res.status(404).send({
			status: 1,
			error: 'Page inexistante !'
		});
	});

fs.readFile(__dirname + fichierDeTaxation, 'utf8', 'r', function (err, data) {

	if (err) myConsole.warn(err.stack);

	let lecture = "Lecture du fichier",
		construction = "Construction des json des referentiels";

	myConsole.time(lecture);

	var doc = new dom().parseFromString(data.toString());

	categories = xpath.select("//categories", doc)[0];
	natures = xpath.select("//natures", doc)[0];
	deliberations = xpath.select("//deliberations", doc)[0];

	myConsole.timeEnd(lecture);

	myConsole.log("%s catégories d'herbergements", categories.childNodes.length);
	myConsole.log("%s natures d'hebergements", natures.childNodes.length);
	myConsole.log("%s délibérations", deliberations.childNodes.length);

	myConsole.time(construction);
	search2json("//deliberation", deliberations).then(function (result) {
		deliberations2Json = result;
	});
	search2json("//nature", natures).then(function (result) {
		natures2Json = result;
	});
	search2json("//categories", categories).then(function (result) {
		categories2Json = result;
	});
	myConsole.timeEnd(construction);

});


http.createServer(app).listen(listeningPort, function () {
	myConsole.log("===> Listening on %s <===", listeningPort);
});
