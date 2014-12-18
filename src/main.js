<% @meta.js %>

(function () {
	<% @helper.js %>

	var sites = [ <% #sites.js %> ];

	if (H.config.bUseCustomRules) {
		try {
			[].splice.apply (sites, [0, 0].concat(eval (H.sprintf('[%s\n]', H.config.sCustomRule))));
		} catch (e) {
			H.info ('解析自定义规则时发生错误: %s', e.message);
		}
	}

	var handleSite = (function () {
		<% @handleSite.js %>
	})();

	try {
		GM_registerMenuCommand (H.sprintf('配置 %s[%s]', H.scriptName, H.version), function () {
			GM_openInTab('https://jixunmoe.github.io/cuwcl4c/config/', false);
		});

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