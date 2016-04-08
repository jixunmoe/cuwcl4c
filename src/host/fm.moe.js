MODULE
/**
 * 萌否音乐电台
 * 2016.04.08: 修复以适应新版播放器代码。
 */
({
	id: 'fm.moe',
	name: '萌电台 [moe.fm]',
	host: 'moe.fm',
	noSubHost: true,
	path: '/listen/h5',
	hide: ['#promotion_ls'],

	onBody: function () {
		H.waitUntil('seajs', function () {
			// 登录破解
			unsafeWindow.is_login = true;
			
			// 下载按钮
			var dlLink = $('<a>').addClass('player-button left').css(H.makeRotateCss(90)).css({
				'width': '26px',
				'background-position': '-19px -96px'
			}).insertAfter ($('div.player-button.button-volume').first());
			
			// 监听
			document.addEventListener (H.scriptName, function (e) {
				var songObj = e.detail;
				H.info(songObj);

				dlLink
					.attr('href', H.uri(songObj.url, songObj.sub_title + '.mp3'))
					.attr('title', '下载: ' + songObj.sub_title);
			}, false);

			// 挂载外挂模组
			unsafeExec (function (scriptName) {
				function notifyUpdate (clip) {
					document.dispatchEvent ( new CustomEvent (scriptName, {detail: clip }) );
				}

				define('plugin/jixun', function(require, exports) {
					console.info('[CUWCL4C] 开始注入 ...');
					var listen = require('/public/js/fm/page/listen.js');
					var player = require('player/player');

					var _initPlayer = player.initPlayer;
					player.initPlayer = function (clip) {
						notifyUpdate(clip);
						_initPlayer.apply(this, arguments);
					};
					console.info('[CUWCL4C] 注入结束 ...');
				});
				
				// 要求载入外挂模组
				seajs.use('plugin/jixun');
			}, H.scriptName);
		});
	}
});