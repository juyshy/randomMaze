var fs = require("fs");
var serial = require("serialport");
var SerialPort = serial.SerialPort;

// Replace with the device name in your machine.
var portName = "COM3"; // /dev/cu.usbmodem1421

var serialMessaegeCounter = 0;

var scriptStartTime = Date.now();
var prevTime = scriptStartTime;
module.exports = {

	init: function (socket, params) {
		var params2Front = "boardActive:" + params.boardActive;

		socket.emit("message", params2Front.toString());
		console.log(params2Front.toString());
		/* When we get a new line from the arduino, send it 
		to the browser via this socket */
		var log2file = params.logging;
		if (params.boardActive) {
			var sp = new SerialPort(portName, {
				baudrate: 115200,
				parser: serial.parsers.readline("\n")
			});
			sp.on("data", function (data) {
				var nowtime = Date.now();

				if (prevTime != nowtime) {
					var datatoCollect = Date.now() + ":" + data;
					console.log(datatoCollect);
					if (log2file) {
						fs.appendFile('logs/serialLogs/accel_values' + scriptStartTime + ".txt", datatoCollect, function (err) {
							//console.log(err);
						});
					}
					serialMessaegeCounter++;


					if (serialMessaegeCounter % 1000 == 0) {
						socket.emit("message", params2Front.toString());
						console.log(params2Front.toString());
					}
				}
				prevTime = nowtime;
				socket.emit("message", data.toString());


			}); 
		}

	}

};

