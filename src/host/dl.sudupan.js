{
	id: 'dl.sudupan',
	name: '速度盘',
	host: ['sudupan.com'],
	show: ['#sdpxzlj', '#sdpxzlj > td'],
	onStart: function () {
		if (H.beginWith(location.pathname, '/down_')) {
			location.pathname = location.pathname.replace ('/down_', '/sdp/xiazai_');
		}
	}
}