// server.js
// where your node app starts

// init project
const express = require("express");
const moment = require('moment');
const config = require('../../configUlises-dev.json');
const app = express();

function log() {

	var msg = '';
	for (var i=0; i<arguments.length; i++) {
        msg += (JSON.stringify(arguments[i]) + ', ');
    }
	console.log(msg);
} 

var logging = {
	Info: log,
	Error: log
}
// we've started you off with Express,
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function(request, response) {
  //response.sendFile(__dirname + "/index.html");
   response.status(200).send('asdf');
  response.end();
});

// listen for requests :)
const listener = app.listen(9999, function() {
  console.log("Your app is listening on port " + listener.address().port);
});

/** Supervidor de Memoria. Cuando la memoria utlizada supere en un 100% la inicial, y el intervalo horario sea de 20:00 a 06:00
    se reinicia la aplicacion */
logging.Info('Memory Supervisor started: ', config.MemorySupervisor);
var heapInit = 0;
setInterval(function(){	
  try {
    global.gc();
  } catch (e) {
    logging.Info("You must run program with 'node --expose-gc'");
    process.exit();
  }

  //2. Output Heap stats
	var heapUsed = process.memoryUsage().heapUsed;
	if (heapInit===0){
		heapInit = heapUsed;
		logging.Info('Program started with ',  heapInit, " bytes allocated...");
	}
	else  {
		var percent = ((heapUsed/heapInit)*100).toFixed(2);
		logging.Info('The program is using ' + heapUsed + ' bytes of memory, ' + percent + '% of the memory used at startup');
		if (percent > config.MemorySupervisor.PercentLimit) {
			logging.Error('Program is running out of memory');		
			if (moment().isBetween(moment(config.MemorySupervisor.ResetIntervalStart, "HH:mm a"), moment(config.MemorySupervisor.ResetIntervalEnd, "HH:mm a"))) {
				logging.Error('Program exit because is running out of memory');
				process.exit();
			}
		}
	}
  }, config.MemorySupervisor.Tick);
