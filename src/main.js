<% @header.js %>

(function () {
	<% @helper.js %>

	var sites = [ <% #sites.js %> ];
	var handleSite = function (event) {
		<% @handleSite.js %>
	};

	try {

		H.log ('onStart 准备阶段 :: 开始');
		handleSite ('onStart');
		H.log ('onStart 准备阶段 :: 结束');

		document.addEventListener ('DOMContentLoaded', function () {
			H.log ('onBody 阶段 :: 开始');
			handleSite ('onBody');
			H.log ('onBody 阶段 :: 结束');
		}, false);

	} catch (e) {
		if (e.isExit) {
			H.log.apply ( 0, [].concat.apply ( ['脚本退出, 错误信息'], e.message ) );
		} else {
			H.error ('请务必将下述错误追踪代码提交至 %s\n\n%s', H.reportUrl, e.message);
		}
	}
}) ();