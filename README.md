node.js
====================

Info
--
Node.js server to get distance using Google Map, and query sites from the elasticSearch


Install
--
Install Node.js

Install extensions using npm on the Node.js command line

* npm install fs
* npm install http
* npm install googlemaps
* npm install path
* npm install request
* npm install url

Configure
--

change the elastic server IP address at line #35, host: '192.168.5.186',

Launch Server
--

node server/index.js 


Queries
--

* http://localhost:8888/distance?origin=LONG,LAT&destination=LONG,LAT[&units=metric|imperial]
  * units is either metric or imperial, and is optional (default is metric)
  * origin and destination is the googlemap way lat,long

  http://localhost:8888/distance?origin=50.7972419,4.3991661&destination=50.8333589,4.3943596
  http://localhost:8888/distance?origin=50.7972419,4.3991661&destination=50.8333589,4.3943596&units=imperial

* http://localhost:8888/poi?origin=LONG,LAT[&range=DISTANCE][&cat=CATEGORIES]
  * range is optional, and can be km (2km) or m (500) (default is 1km)
  * cat is optional, and string formated with , for multiple categories (default is '', meaning all)
  * origin is the googlemap way lat,long
  
  http://localhost:8888/poi?origin=50.7972419,4.3991661
  http://localhost:8888/poi?origin=50.7972419,4.3991661&range=3km
  http://localhost:8888/poi?origin=50.7972419,4.3991661&range=5km&cat=museum
  http://localhost:8888/poi?origin=50.7972419,4.3991661&cat=museum
  http://localhost:8888/poi?origin=50.7972419,4.3991661&cat=museum,theatre
