jQuery(function (window, $) {
	Vue.config.debug = true;

	// 初始化界面库
	$('.ui.checkbox').checkbox();
	$('.ui.modal').modal();

	// 下拉菜单不兼容 Vue
	// $('.ui.dropdown').dropdown();

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

				return self.status = 2;

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
				console.info (this.conf);
			},
			save: function () {

			},
			reset: function () {
				// document.dispatchEvent ( new CustomEvent ('SaveConfig', {detail: '{}' }) );
				$('#dlg-reset').modal('show');
				setTimeout (location.reload.bind(location), 700);
			},
			preview: function () {
				var prevTxt = $('.rule-preview', this.$el);

				var codes = this.conf.sCustomRule;
				if (window.js_beautify) codes = js_beautify (codes, { indent_with_tabs: true });
				prevTxt.text(codes);
				if (window.hljs) window.hljs.highlightBlock (prevTxt[0]);
			}
		}
	});
	ctrlForm.init();
	window.x = ctrlForm;
}.bind(0, window));