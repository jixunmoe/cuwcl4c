{
	id: 'music.baidu.yinyueyun',
	name: '音乐云下载',
	host: 'yinyueyun.baidu.com',
	noSubHost: true,
	path: '/',

	onStart: function () {
		H.waitUntil('userModel.set', function () {
			unsafeExec(function (scriptName, hookBatch) {
				var bakUserSetInfo = userModel.set;
				userModel.set = function (key, val, opts) {
					if (key === 'userInfo' && val) {
						val.vip = val.golden = true;
					}
					return bakUserSetInfo.apply(userModel, arguments);
				};
				
				// Force update user data via hook
				userModel.set('userInfo', userModel.get('userInfo'));
			});
		});
	}
}