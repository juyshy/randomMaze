 

var TimerView = function () {

	var startTime = Date.now(), prevTime = startTime;
	var ms = 0, msMin = Infinity, msMax = 0;
	var time = 0, timeMin = Infinity, timeMax = 0;
	var frames = 0, mode = 0;

	var container = document.createElement( 'div' );
	container.id = 'timerView';
 
	container.style.cssText = 'width:80px;opacity:0.9;cursor:pointer';

	var timeDiv = document.createElement( 'div' );
	timeDiv.id = 'time';
	timeDiv.style.cssText = 'padding:0 0 3px 3px;text-align:left;background-color:#002';
	container.appendChild( timeDiv );

	var timeText = document.createElement( 'div' );
	timeText.id = 'timeText';
	timeText.style.cssText = 'color:#0ff;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px';
	timeText.innerHTML = 'FPS';
	timeDiv.appendChild( timeText );

  
	return {

 

		domElement: container,

 

		begin: function () {

			startTime = Date.now();

		},

		end: function () {

			var time = Date.now();

			ms = time - startTime;
			msMin = Math.min( msMin, ms );
			msMax = Math.max( msMax, ms );

			timeText.textContent = ms + ' MS (' + msMin + '-' + msMax + ')';
 
 

			return time;

		},

		update: function () {

			startTime = this.end();

		}

	}

};
