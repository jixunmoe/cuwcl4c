document.addEventListener ('DOMContentLoaded', (function ( $, click ) {
setTimeout (function () {
	this.configPageLoaded = true;

	var msgBox = $('opLog');
	var postMessage = function (msgContent, rmCallback) {
		var p = document.createElement ('p');
		p.textContent = msgContent ;
		msgBox.insertBefore (p, msgBox.firstChild);

		setTimeout (function () {
			p.parentNode.removeChild (p);

			rmCallback && rmCallback ();
		}, 3000);
	};

	$('scriptVer').textContent = this.rScriptVersion || '未知';

	click (document.body, function (e) {
		if (e.target && e.target.tagName == 'BUTTON')
			e.preventDefault ();
	});

	var configForm = document.forms.config,
		pRulePreview = $('rulePreview'),
		pRuleEditor  = configForm.sCustomRule;

	click($('btnPreviewCode'), function () {
		var codes = pRuleEditor.value ;
		if (this.js_beautify) codes = js_beautify (codes, { indent_with_tabs: true });
		pRulePreview.textContent = codes;
		if (this.hljs) this.hljs.highlightBlock (pRulePreview);
	}.bind(this));

	// 代码编辑框 TAB 缩进. 因为找不到现成的只好自己写一个了
	pRuleEditor.addEventListener ('keydown', function (ev) {
		if (ev.keyCode != 13 && ev.keyCode != 9) return ;

		// start, end
		var s = pRuleEditor.selectionStart,
			e = pRuleEditor.selectionEnd,
			v = pRuleEditor.value,
			b = v.slice (0, s),
			a = v.slice (e);


		if (ev.keyCode == 13) {
			var newLine = b.substring (b.lastIndexOf ('\n') + 1, s).match (/^\s*/)[0];
			console.log ('[%s][%s][%s]', b, newLine, a);
			pRuleEditor.value = b + '\n' + newLine + a;
			pRuleEditor.selectionEnd = pRuleEditor.selectionStart = b.length + newLine.length + 1;
			ev.preventDefault ();
			return ;
		}

		ev.preventDefault ();
		var bIndent = !ev.shiftKey;

		// Cursor at indent area, and pressing [Shift + TAB]
		if (!bIndent && s === e) {
			var sIntents = b.substring (b.lastIndexOf ('\n') + 1, s);
			if (!sIntents || /^\s+$/.test(sIntents)) {
				pRuleEditor.value = b.substring (0, s - 1) + a;
				pRuleEditor.selectionEnd = pRuleEditor.selectionStart = --s;
				return ;
			}
		}

		if (s === e || -1 == v.substring (s, e).indexOf ('\n')) {
			// Don't have a new line or not selected, replace with a tab.
			pRuleEditor.value = b + '\t' + a;
			pRuleEditor.selectionEnd = pRuleEditor.selectionStart = ++s;
		} else {
			// Indent all selected lines.
			var bNeedReCalc = false;
			// If doesn't end with new line
			if (b[b.length - 1] != '\n') {
				// Check if there's any line before
				s = -1 == b.indexOf ('\n')
					? 0 : b.lastIndexOf ('\n') + 1;
			}

			if (a[0] != '\n') {
				e += -1 == a.indexOf ('\n')
					? a.length : a.indexOf ('\n');
			}

			var indentedText = bIndent
				? '\t' + v.substring (s, e).replace (/\n/g, '\n\t')
				: v.substring (s, e).replace(/^\s/, '').replace (/\n\s?/g, '\n');

			pRuleEditor.value = v.slice (0, s) + indentedText + v.slice(e);
			pRuleEditor.selectionStart = s;
			pRuleEditor.selectionEnd   = s + indentedText.length;
		}
	});

	click ($('btnResetConfig'), function () {
		document.dispatchEvent ( new CustomEvent ('SaveConfig', {detail: '{}' }) );
		postMessage ('正在重设设定…');
		setTimeout (postMessage, 400, '设定重设完毕, 刷新页面 ..');
		setTimeout (location.reload.bind(location), 700);
	});

	this.j = (function (sid, scriptInfo) {
		this.j = null;
		clearTimeout (sid);
		$('scriptLatestVer').textContent = scriptInfo.version;
		if (this.rScriptVersion && this.rScriptVersion !== scriptInfo.version)
			$('updateLink').classList.remove ('hide');
	}).bind(this, setTimeout (function () {
		$('scriptLatestVer').textContent = '超时 :<';
	}, 3000));

	var toggleEl  = [$('aria2-auth'), $('main-config')];
	var authUser  = $('blockAuthUser'),
		authPass  = configForm.elements.sAria_pass,
		authBlock = $('blockAuthInfo');
	toggleEl[0].addEventListener ('change', function (e) {
		var hideUser = false, hidePass = false, passPlaceHolder = '密码';
		switch (parseInt(configForm.dAria_auth.value, 10)) {
			case 0:
				hideUser = hidePass = true;
				break;

			case 1:
				break;

			case 2:
				hideUser = true;
				passPlaceHolder = 'Secret';
				break;
		}

		authUser.classList[hideUser ? 'add' : 'remove'] ('hide');
		authBlock.classList[hideUser && hidePass ? 'add' : 'remove'] ('hide');
		authPass.placeholder = passPlaceHolder;
	});

	var aria2Config = $('aria2-config');
	toggleEl[1].addEventListener ('change', function (e) {
		var showAria2 = configForm.dUriType.value == '2';
		aria2Config.classList[showAria2 ? 'remove' : 'add'] ('hide');
	}, false);


	//// Config SAVE and LOAD
	click ($('btnSaveConfig'), function () {
		var _conf = {};
		[].forEach.call (configForm.elements, function (el) {
			if (el.hasAttribute ('name') && !_conf.hasOwnProperty(el.name))
				_conf[el.name] = configForm[el.name].value;
		});

		document.dispatchEvent ( new CustomEvent ('SaveConfig', {detail: JSON.stringify(_conf) }) );
		postMessage (this.rScriptVersion ? '设定储存完毕!' : '请先启用脚本!');
	}.bind(this));

	if (this.rScriptConfig) {
		var _conf = JSON.parse (this.rScriptConfig);
		
		for (var name in _conf) {
			if (_conf.hasOwnProperty (name)) {
				switch (name[0]) {
					case 'b':
						configForm[name].checked = _conf[name];
						break;

					default:
						configForm[name].value   = _conf[name];
						break;
				}
			}
		}
	} else {
		$('noteNoScript').classList.remove('hide');
	}

	toggleEl.forEach (function (e) {
		e.dispatchEvent (new CustomEvent ('change'));
	});

	var jsonpInfo = document.createElement ('script');
	jsonpInfo.src = 'https://greasyfork.org/scripts/2600-跳过网站等待-验证码及登录.jsonp?callback=j&antiCache=' + (new Date()).getDate();
	document.head.appendChild (jsonpInfo);
}.bind(this), 50);
}).bind (window, function ( $ ) {
	return document.getElementById ($);
}, function (el, cb) {
	return el.addEventListener ('click', cb, false);
}), false);
