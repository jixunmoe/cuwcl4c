jQuery(function (window, $) { setTimeout (function () {
	Vue.config.debug = true;

	// Make v-model and Semantic-UI work with each other.
	$.fn.jTrigger = $.fn.trigger;
	$.fn.trigger = function (eveName) {
		if (eveName === 'change') {
			var e = new Event(eveName);
			this.each(function() {
				this.dispatchEvent(e);
			});
			return this;
		}

		return this.jTrigger.apply(this, arguments);
	};

	// 初始化界面库
	$('.ui.checkbox').checkbox();
	$('.ui.modal').modal();

	// 初始化控件
	var ctrlUpdate = new Vue ({
		el: '#update-check',
		data: {
			curVer: window.rScriptVersion,
			status: 0,
			latestVer: 'Unknown'
		},
		methods: {
			init: function () {
				if (!this.curVer) {
					this.status = -1;
					return ;
				}
				this.checkUpdate();
			},
			checkUpdate: function () {
				this.status = 0;
				var self = this;

				$.ajax({
					url: 'https://greasyfork.org/en/scripts/2600.jsonp',
					jsonpCallback: 'jxCheckVer',
					dataType: 'jsonp'
				}).success(function (r) {
					self.latestVer = r.version;
					if (r.version == self.curVer) {
						self.status = 2;
					} else {
						self.status = 1;
					}

				}).error(function () {
					this.status = -2;
				});
			}
		}
	});
	ctrlUpdate.init();

	if (!window.rScriptConfig) {
		$('#form-config').hide();
		return ;
	}

	var ctrlForm = new Vue ({
		el: '#form-config',
		data: {
			conf: JSON.parse(window.rScriptConfig)
		},
		methods: {
			init: function () {
				// 此时的 select 已经赋值, 可以绑定界面了
				$(this.$$.dAuth).dropdown();
			},
			save: function () {
				document.dispatchEvent ( new CustomEvent ('SaveConfig', {detail: JSON.stringify(this.conf) }) );
				// $('#dlg-saved').modal('show');
			},
			reset: function () {
				$('#dlg-reset').modal('show');
				document.dispatchEvent ( new CustomEvent ('SaveConfig', {detail: '{}' }) );
				setTimeout (location.reload.bind(location), 700);
			},
			preview: function () {
				var prevTxt = $('.rule-preview', this.$el);

				var codes = this.conf.sCustomRule;
				if (window.js_beautify) codes = js_beautify (codes, { indent_with_tabs: true });
				prevTxt.text(codes);
				if (window.hljs) window.hljs.highlightBlock (prevTxt[0]);
			},

			// 简易编辑器增强
			editor: function (ev) {
				// 如果不是回车或 TAB 则返回
				if (ev.keyCode != 13 && ev.keyCode != 9) return ;

				// start, end
				var s = this.$$.sCustomRule.selectionStart,
					e = this.$$.sCustomRule.selectionEnd,
					v = this.$$.sCustomRule.value,
					b = v.slice (0, s),
					a = v.slice (e);


				// 换行
				if (ev.keyCode == 13) {
					var newLine = b.substring (b.lastIndexOf ('\n') + 1, s).match (/^\s*/)[0];
					this.$$.sCustomRule.value = b + '\n' + newLine + a;
					this.$$.sCustomRule.selectionEnd = this.$$.sCustomRule.selectionStart = b.length + newLine.length + 1;
					ev.preventDefault ();
					return ;
				}

				ev.preventDefault ();
				var bIndent = !ev.shiftKey;

				// Cursor at indent area, and pressing [Shift + TAB]
				if (!bIndent && s === e) {
					var sIntents = b.substring (b.lastIndexOf ('\n') + 1, s);
					if (!sIntents || /^\s+$/.test(sIntents)) {
						this.$$.sCustomRule.value = b.substring (0, s - 1) + a;
						this.$$.sCustomRule.selectionEnd = this.$$.sCustomRule.selectionStart = --s;
						return ;
					}
				}

				if (s === e || -1 == v.substring (s, e).indexOf ('\n')) {
					// Don't have a new line or not selected, replace with a tab.
					this.$$.sCustomRule.value = b + '\t' + a;
					this.$$.sCustomRule.selectionEnd = this.$$.sCustomRule.selectionStart = ++s;
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

					this.$$.sCustomRule.value = v.slice (0, s) + indentedText + v.slice(e);
					this.$$.sCustomRule.selectionStart = s;
					this.$$.sCustomRule.selectionEnd   = s + indentedText.length;
				}
			}
		}
	});
	ctrlForm.init();
	window.x = ctrlForm;
}, 2) }.bind(0, window));