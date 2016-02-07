$(function () {
	function init_dropdown () {
		$('.quality-selector').dropdown();
	}

	function checkDl (song) {
		return song._dl;
	}

	function getHash (song) {
		return song._h;
	}

	var dlBox = new Vue({
		el: '#app',
		data: {
			songs: [{relate_goods:[{info:{filesize:1,bitrate:3}},{info:{filesize:1,bitrate:999}},{info:{filesize:1,bitrate:3}}]}]
		},

		methods: {
			init: function () {
				window.addEventListener("message", this.onMessage, false);
			},

			onMessage: function (e) {
				var data = JSON.parse(e.data);
				if (data.action == 'set') {
					this.songs = data.data.data;
					this.init_dropdown();
				} else if (data.action == 'clear') {
					this.songs = [];
				} else {
					$.error('Undefined action: ' + data.action);
				}
			},

			init_dropdown: function () {
				setTimeout(init_dropdown, 1);
			},

			post: function (action, data) {
				var msg = {
					action: action,
					data: data
				};

				parent.postMessage(JSON.stringify(msg), '*');
			},

			download: function () {
				this.post('download', this.songs.filter(checkDl).map(getHash));
			},

			cancel: function () {
				this.post('cancel');
			}
		}
	});
	dlBox.init();
	window.dlBox = dlBox;
});