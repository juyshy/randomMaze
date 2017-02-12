var fs = require("fs");
var url = require("url");


var argumentsAr = new Array();
var args = process.argv.slice(2);
args.forEach(function (val, index, array) {
	//console.log(index + ': ' + val);
	argumentsAr.push({ "index": index, "val": val });
});
var $boardActive = false;
var $data1 = {"boardActive" : 0};
if (argumentsAr[0].val == "board" && argumentsAr[1].val == 1) {
	 $boardActive = true;
	 $data1 = {"boardActive" : 1};
}
console.log("boardActive " + $boardActive);
//process.exit();

/* Create the server in the port 9000 */
var http = require("http").createServer(function (req, res) {
	var request = url.parse(req.url, false);
	var filename = request.pathname;

	if (filename == "/")
		filename = "/index.html";

	/* Append the frontend folder */
	filename = 'front' + filename;

	fs.readFile(filename, function (err, data) {
		/* Any error on reading the file? */
		if (err) {
			if (err.errno == 34)  // File not found
				res.writeHead(404);
			else
				res.writeHead(500);
			res.end();
			return;
		}

		res.writeHead(200);
		res.write(data);
		res.end();
	});
}
).listen(9000);


var io = require("socket.io").listen(http);

//io.set('log level', 1);

io.sockets.on("connection", function (socket) {
	// On a new Socket.io connection, load the data provider we want. For now, just Arduino.
	var $provider = require('./providers/arduino.js').init(socket, $data1);
});

