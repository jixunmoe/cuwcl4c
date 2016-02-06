MODULE
/**
 * 酷狗音乐解析 By Jixun
 * 抓包酷狗音乐 :D
 */
({
	id: 'music.kugou',
	name: '酷狗音乐下载解析',
	host: ['web.kugou.com', 'kugou.com', 'www.kugou.com'],
	noSubHost: true,
	noFrame: true,
	hide: '#adv',
	//-// css: <% ~com.kugou.css %>,

	onStart: function () {
		if (H.config.dUriType === 2/* URI_USE_ARIA */) {
			H.setupAria();
		}
	},

	onBody: function () {
		var _CONST_BASE = 'https://jixunmoe.github.io/cuwcl4c/kugou-dl';

		var $dlShadow = $('<div>').addClass('dialog-shadow').hide().appendTo('body');
		var $dlDialog = $('<div>').addClass('dialog-container').appendTo($dlShadow);
		var $dlDialogTitle = $('<div>').addClass('dialog-bar').appendTo($dlDialog).text('下载窗口');
		var $dlDialogContainer = $('<div>').addClass('dialog-content').appendTo($dlDialog);
		var $dlDialogCloseBtn = $('<span>').addClass('dialog-bar-btn').appendTo($dlDialogTitle).text('关');
		var $dlDialogManageBtn = $('<span>').addClass('dialog-bar-btn').appendTo($dlDialogTitle).text('管');

		// 关闭按钮被点击
		$dlDialogCloseBtn.click(function () {
			$dlShadow.hide();
		});

		$dlDialogManageBtn.click(function () {
			$wndDownloadBox.toggle();
			$wndDownloadManager.toggle();
		});

		var $waitMsg = $('<div>').text('正在获取相关信息..').appendTo($dlDialogContainer);

		var frameDlDialog = document.createElement('iframe');
		var $wndDownloadBox = $(frameDlDialog).hide().appendTo($dlDialogContainer);
		frameDlDialog.src = _CONST_BASE;

		var frameDlManager = document.createElement('iframe');
		var $wndDownloadManager = $(frameDlManager).hide().appendTo($dlDialogContainer);
		frameDlManager.src = _CONST_BASE + '/dl.html';

		var actionDlDialog  = ['set', 'clear'];
		var actionDlManager = ['add'];
		function post (action, data) {
			var frame = actionDlDialog.indexOf(action) != -1 ? frameDlDialog : frameDlManager;
			var msg = {
				action: action,
				data: data
			};

			frame.contentWindow.postMessage(JSON.stringify(msg), '*');
		}

		function handleDownload (songs) {
			post('clear');
			$waitMsg.hide();
			$wndDownloadBox.show();
			$wndDownloadManager.hide();
			$dlShadow.show();
			var resource = JSON.parse(unescape(songs)).map(function (song) {
				return {
					type: 'audio',
					id: 0,
					hash: song.Hash
				};
			});

			var payload = {
				"userid": 0,
				"token": "",
				"vip": 1,
				"behavior": "download",
				"relate": 1,
				"resource": resource,
				"appid": 1001,
				"clientver": "8031",
				"source": {
					"module": "1",
					"type": "0",
					"id": 0
				}
			};

			GM_xmlhttpRequest({
				method: "POST",
				url: "http://media.store.kugou.com/v1/get_res_privilege",
				data: JSON.stringify(payload),
				headers: {
					"Content-Type": "application/x-www-form-urlencoded"
				},
				onload: function(response) {
					post('set', JSON.parse(response.responseText));
					$waitMsg.hide();
					$wndDownloadBox.show();
				},
				onerror: function () {
					alert('接口获取失败, 请稍后重试!');
					$dlShadow.hide();
				}
			});
		}

		var looper = new IntervalLoop([], proc_hash, 500);
		looper.loop();
		window.addEventListener("message", onMessage, false);
		function onMessage (e) {
			var data = JSON.parse(e.data);
			if (data.action == 'cancel') {
				$dlShadow.hide();
			} else if (data.action == 'download') {
				$wndDownloadBox.hide();
				$wndDownloadManager.show();

				looper.add.apply(looper, data.data);
			} else {
				H.error('Undefined action: ' + data.action);
			}
		}

		function handle_dl (song) {
			var fileName = song.fileName + '.' + song.extName;
			var url = song.url;

			post('add', song);
			if (H.config.dUriType === 2/* URI_USE_ARIA */) {
				H.addToAria(url, file);
			}
		}

		function proc_hash (next, hash) {
			hash = hash.toLowerCase();
			var key = CryptoJS.MD5(hash + 'kgcloud').toString();
			GM_xmlhttpRequest({
				method: 'GET',
				url: 'http://trackercdn.kugou.com/i/?cmd=4&hash=' + hash + '&key=' + key + '&pid=1&forceDown=0&vip=1',
				onload: function (response) {
					var song = JSON.parse(response.responseText);
					handle_dl(song);
					next();
				},
				onerror: function () {
					H.error('Error while fetching data for %s', hash);
					next();
				}
			});
		}

		/* 导出函数 */
		exportFunction(handleDownload, unsafeWindow, {
			defineAs: "dl_jixun"
		});

		unsafeExec(function () {
			downLoad = dl_jixun;
		});
	}
});