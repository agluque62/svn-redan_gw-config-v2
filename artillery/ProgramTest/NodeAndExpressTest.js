var express = require('express');

var app = express();

app.get('/', function(req, res) {
  res.status(200).send('asdf');
  res.end();
});

function generateHeapDumpAndStats() {
  //1. Force garbage collection every time this function is called
  try {
    global.gc();
  } catch (e) {
    console.log("You must run program with 'node --expose-gc'");
    process.exit();
  }

  //2. Output Heap stats
  var heapUsed = process.memoryUsage().heapUsed;
  console.log('Program is using ' + heapUsed + ' bytes of Heap.');
}

const PORT = process.env.PORT || 9000;

app.listen(PORT, function() {
  console.log(`App listening on port ${PORT}!`);
});

setInterval(generateHeapDumpAndStats, 3000);
