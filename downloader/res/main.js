HTMLElement.prototype.find    = HTMLElement.prototype.querySelector;
HTMLElement.prototype.findAll = HTMLElement.prototype.querySelectorAll;

document.addEventListener ('DOMContentLoaded', function () {
	var lenStep = 20;
	[].forEach.call (document.getElementsByClassName('breakdown'), function (breakdown) {
		var that = {};
		that.canvas = breakdown.find ('.drawing');
		that.info   = breakdown.find ('.info');
		that.raw    = breakdown.find ('.raw');

		that.paint  = that.canvas.getContext('2d');
		that.canvas.width = breakdown.offsetWidth;
		that.canvas.height = 150;

		var xSrcOffset = -that.info.offsetLeft;
		var xTarOffset = - that.raw.offsetLeft;

		var reDraw = function (activeClass) {
			that.paint.clearRect(0, 0, that.canvas.width, that.canvas.height);
			[].forEach.call (that.info.children, function (source, i) {
				var srcStyle = this.getComputedStyle (source);
				that.paint.strokeStyle = srcStyle.color;


				var xSource = source.offsetLeft + xSrcOffset + source.offsetWidth / 2;
				var yMiddle = 130 - i * 17;

				that.paint.lineWidth = 2;
				that.paint.beginPath();
				that.paint.moveTo(xSource, 150);
				that.paint.lineTo(xSource, yMiddle);

				that.paint.globalAlpha = source.className == activeClass ? 1 : .4;

				[].forEach.call (that.raw.getElementsByClassName (source.className), function (to) {
					that.paint.moveTo (xSource, yMiddle);
					var xTarget = to.offsetLeft + xTarOffset + to.offsetWidth / 2 - parseInt(this.getComputedStyle(to).paddingRight, 10) / 2;
					that.paint.lineTo (xTarget, yMiddle);
					that.paint.lineTo (xTarget, 0);
				});

				that.paint.stroke();

			}.bind (this));
		}.bind (this);

		var markActive = function (activeClass) {
			[].concat.apply ([].slice.call(that.info.children), that.raw.children).forEach (function (c) {
				if (activeClass && c.classList.contains (activeClass)) {
					c.classList.add ('active');
				} else {
					c.classList.remove ('active');
				}
			});

		};

		var handleMouseOver = function (e) {
			markActive (e.target.className);
			reDraw (e.target.className);
		};

		reDraw ();
		that.raw. addEventListener ('mouseover', handleMouseOver);
		that.info.addEventListener ('mouseover', handleMouseOver);

		var handleMouseOut = function () {
			markActive ('');
			reDraw ();
		};
		that.raw .addEventListener ('mouseout', handleMouseOut);
		that.info.addEventListener ('mouseout', handleMouseOut);

		[].map.call (document.body.findAll ('pre.render'), function (pre) {
			pre.textContent = pre.textContent.trim ();
			hljs.highlightBlock (pre);
		});
	}.bind (window));
}, false);