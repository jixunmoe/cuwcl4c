$(function () {

	var app = new Vue({
		el: '#app',
		data: {
			songs: []
		},
		methods: {
			init: function () {
				window.addEventListener("message", this.onMessage, false);
			},

			onMessage: function (e) {
				var data = JSON.parse(e.data);
				if (data.action == 'add') {
					this.songs.push(data.data);
				} else {
					$.error('Undefined action: ' + data.action);
				}
			},

			clear: function () {
				this.songs = [];
			},

			rm: function (index) {
				this.songs.splice(index, 1);
			}
		}
	});
	app.init();
});