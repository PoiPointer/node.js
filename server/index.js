var http =require ("http") ;
var url =require ("url") ;
var path =require ("path") ;
var fs =require ("fs") ;
var requestLib =require ('request') ;
var gm =require ('googlemaps') ;
var util =require ('util') ;
var elasticsearch =require ('elasticsearch') ;

// https://github.com/moshen/node-googlemaps
var GOOGLE_MAP_DISTANCE ="https://maps.googleapis.com/maps/api/distancematrix/output"
var MYKEY ="918108961534-r5dknljt9qk8fl9ovo1ntdp3qqipl719.apps.googleusercontent.com" ;
var MYSECRET ="at-kx3oJSjYrkeJ7rDySPu09" ;

var elasticSearch ='http://192.168.5.186:9200/poipointer/_search' ;

var port =process.argv [2] || 8888 ;
console.log ('Starting server @ http://localhost:' + port + '/') ;

// 50.7972419,4.3991661
// Entree+de+l'It+Tower/@50.8333589,4.3943596
// Hôtel+Solvay/@50.8333589,4.3943596
// Hôtel+Ciamberlani+asbl/@50.8333589,4.3943596
// Europe/@50.8333589,4.3943596
// Tour+D'Angle/@50.8333589,4.3943596

// http://localhost:8888/destination?origin=50.7972419,4.3991661&destination=50.8333589,4.3943596

function PostCode (categories, bodyReq, response) {
    // Build the post string from an object
    var post_data =JSON.stringify (bodyReq) ;

    // An object of options to indicate where to post to
    var post_options ={
        host: '192.168.5.186',
        port: '9200',
        path: '/poipointer' + categories + '/_search',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': post_data.length
        }
    } ;

    // Set up the request
    var post_req =http.request (post_options, function (res) {
    res.setEncoding('utf8');
        res.on ('data', function (chunk) {
            console.log ('Response: ' + chunk) ;
            //var jsc =JSON.parse (chunk) ;
            //console.log (jsc.hits) ;
            //response.write (JSON.stringify (jsc)) ;
            response.write (chunk) ;
            response.end () ;
        }) ;
    }) ;

    // post the data
    post_req.write (post_data) ;
    post_req.end () ;
}

http.createServer (function (request, response) {

	var uri =url.parse (request.url).pathname ;
    console.log (uri) ;
    
	if ( uri == '/distance' ) {
        var params =url.parse (request.url, true).query ;
        
        //gm.reverseGeocode (gm.checkAndConvertPoint ([41.850033, -87.6500523]), function (err, data) {
        //  util.puts (JSON.stringify (data)) ;
        //}) ;
        //gm.distance ('48.3421719,-4.7131939', '48.3397471,-4.7157371', function (err, data) {
        var units ='metric' ;
        if ( !!('units' in params) )
            units =params.units ; //'imperial ' ;
        gm.distance (params.origin, params.destination, function (err, data) {
                console.log (data) ;
                //util.puts (JSON.stringify (data)) ;
                response.write (JSON.stringify (data)) ;
				response.end () ;
                //for ( var attributename in data ) {
                //    console.log (attributename + ": " + data [attributename]) ;
                //}
            },
            null, //MYKEY,
            'walking',
            null,
            units
        ) ;
        return ;
	}
    if ( uri == '/search' ) {
        var params =url.parse (request.url, true).query ;
        var lat =parseFloat (params.origin.split (',') [0]) ;
        var long =parseFloat (params.origin.split (',') [1]) ;
        var bodySearch ={
            query: {
                filtered: {
                    filter: {
                        geo_distance: {
                            distance: '1km',
                            'geometry.coordinates': [ long, lat ]
                        }
                    }
                }
            }
        }     ;       
        var categories ='' ;
        if ( !!('cat' in params) )
            categories ='/' + params.cat ; // '/museum' ;
        PostCode (categories, bodySearch, response) ;
        return ;
    }
	
	var filename =path.join (process.cwd (), uri) ;
	console.log (filename) ;

	fs.exists (filename, function (exists) {
		if ( !exists ) {
			response.writeHead (404, { "Content-Type": "text/plain" }) ;
			response.write ("404 Not Found\n") ;
			response.end () ;
			return ;
		}

		if ( fs.statSync (filename).isDirectory () )
			filename +='/index.html' ;

		fs.readFile (filename, "binary", function (err, file) {
			if ( err ) {
				response.writeHead (500, { "Content-Type": "text/plain" }) ;
				response.write (err + "\n") ;
				response.end () ;
				return ;
			}

			response.writeHead (200) ;
			response.write (file, "binary") ;
			response.end () ;
		}) ;
	}) ;
	
}).listen (parseInt (port, 10)) ;

console.log ("Server running @ http://localhost:" + port + "/\n\tCTRL + C to shutdown") ;
