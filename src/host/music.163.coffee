###
	网易音乐下载解析 By Jixun
	尝试使用 Coffee Script 写
###

id: 'music.163',
name: '网易音乐下载解析',
host: 'music.163.com',
noSubHost: yes,
noFrame: no,
dl_icon: yes,
css: `<% ~com.163.music.dl.css %>`,

onStart: ->
	@regPlayer()

	# 优先使用 HTML5 播放器, 如果没有再考虑 Flash 支援
	unsafeExec ->
		fakePlatForm = navigator.platform + "--Fake-mac"
		Object.defineProperty navigator, "platform",
			get: -> fakePlatForm
			set: -> null
		window.GRestrictive = false;

_doRemoval: ->
	H.waitUntil 'nm.x', =>
		hook1 = @searchFunction unsafeWindow.nej.e, 'nej.e', '.dataset;if'
		hook2 = @searchFunction unsafeWindow.nm.x, 'nm.x',  '.copyrightId=='
	
		# 因为 nm.x.jC 后加载, 能保证 nej.e.bI 存在
		H.waitUntil 'nm.x.' + hook2, ->
			unsafeExec (bIsFrame, hook1, hook2)->
				_bK = nej.e[hook1]
				nej.e[hook1] = (z, name) ->
					return 1 if name is 'copyright' or name is 'resCopyright'
					_bK.apply this, arguments
				
				nm.x[hook2] =-> false
				
				# 完全忘了下面的是啥
				#if bIsFrame and nm.m.c.xB::zB
				#	nm.m.c.xB::zB =-> true
			, H.isFrame, hook1, hook2
		, 7000, 500
	
searchFunction: (base, name, key) ->
	for baseName, fn of base
		if (fn && typeof fn == 'function')
			fnStr = String(fn)
			if fnStr.indexOf(key) != -1
				H.info('Search %s, found: %s.%s', key, name, baseName);
				return baseName
	
	H.info('Search %s, found nothing.', key);
	return null;

# 接收文件数据
regPlayer: ->
	document.addEventListener H.scriptName, (e) =>
		songObj = e.detail

		@linkDownload
			.attr
				href: H.uri(@getUri(JSON.parse songObj.song), "#{songObj.name} [#{songObj.artist}].mp3")
				title: '下载: ' + songObj.name

hookPlayer: ->
	H.waitUntil 'nm.m.f', =>
		playerHooks = null
		for baseName, clsFn of unsafeWindow.nm.m.f
			protoName = @searchFunction clsFn::, "nm.m.f.#{baseName}", '<em>00:00</em>'
			if protoName
				playerHooks = [baseName, protoName]
				break;
		
		unsafeExec (scriptName, playerHooks) ->
			_bakPlayerUpdateUI = nm.m.f[playerHooks[0]]::[playerHooks[1]]
			nm.m.f[playerHooks[0]]::[playerHooks[1]] = (songObj) ->
				eveSongObj = 
					artist: songObj.artists.map((artist) -> artist.name).join '、'
					name: songObj.name
					song: JSON.stringify songObj

				document.dispatchEvent new CustomEvent(scriptName, detail: eveSongObj);

				_bakPlayerUpdateUI.apply this, arguments
			return
		, H.scriptName, playerHooks
		return
	return

hookPlayerFm: ->
	H.waitUntil 'nm.m.fO', =>
		hook = @searchFunction unsafeWindow.nm.m.fO::, 'nm.x',  '.mp3Url,true'
		@linkDownload = $ '<a>'
			.prependTo '.opts.f-cb>.f-fr'
			.addClass 'icon icon-next'
			.html '&nbsp;'
			.css 'transform', 'rotate(90deg)'


		unsafeExec (scriptName, hook) ->
			_bakPlaySong = nm.m.fO::[hook];
			nm.m.fO::[hook] = (songObj) ->
				eveSongObj = 
					artist: songObj.artists.map((artist) -> artist.name).join '、'
					name: songObj.name
					song: JSON.stringify songObj

				document.dispatchEvent new CustomEvent(scriptName, detail: eveSongObj);

				_bakPlaySong.apply this, arguments
			return
		, H.scriptName, hook
		return
	

onBody: ->
	@_doRemoval()
	return if H.isFrame

	# 单曲下载
	@linkDownload = $('<a>')
		.addClass(H.defaultDlIcon)
		.appendTo($ '.m-playbar .oper')
		.attr
			title: '播放音乐, 即刻解析'
		.click (e)->
			e.stopPropagation()
			return

	# 播放列表下载
	@linkDownloadAll = $('<a>')
		.addClass(H.defaultDlIcon)
		.addClass('addall')
		.text('全部下载')
		.attr
			title: '下载列表里的所有歌曲'
		.click (e) =>
			# 编译出来的代码量好大!
			e.stopPropagation()
			do (trackQueue = localStorage['track-queue'],
				aria2 = new Aria2.BATCH(H.aria2, -> H.info arguments),
			) =>
				for i, track of JSON.parse trackQueue
					aria2.add Aria2.fn.addUri, [@getUri track], H.buildAriaParam
						out: "#{i}. #{track.name} [#{track.artists.map((artist) -> artist.name).join '、'}].mp3"
				aria2.send yes
				return
			return

	if H.config.dUriType is 2
		H.captureAria @linkDownload
	else
		@linkDownloadAll.addClass('jx_hide')


	H.waitUntil () -> $('.listhdc > .addall').length,
	() =>
		@linkDownloadAll
			.insertBefore $('.m-playbar .listhdc .addall')
			.after $('<a>').addClass 'line jx_dl_line'
		return
	, yes, 500

	if location.pathname == '/demo/fm' then @hookPlayerFm() else @hookPlayer()

dfsHash: ( () ->
	strToKeyCodes = (str) -> Array::slice.call(String(str).split '').map (e) -> e.charCodeAt()

	# 还原:
	# arr.map(function (e) { return String.fromCharCode(e) }).join('');
	# 不能直接传 String.fromCharCode !! 参数2 的 index 会玩坏返回值
	(dfsid) ->
		key = [ 51, 103, 111, 56, 38, 36, 56, 42, 51, 42, 51, 104, 48, 107, 40, 50, 41, 50 ]
		fids = strToKeyCodes(dfsid).map (fid, i) -> (fid ^ key[i % key.length]) & 0xFF
		
		CryptoJS
			.MD5(CryptoJS.lib.ByteArray(fids))
			.toString(CryptoJS.enc.Base64)
			.replace(/\//g, "_")
			.replace(/\+/g, "-")
)()

getUri: (song) ->
	dsfId = (song.hMusic || song.mMusic || song.lMusic).dfsId;

	# 服务器 1 ~ 4; 但是貌似 1 ~ 2 的最稳定
	randServer = Math.floor(Math.random() * 2) + 1
	return "http://m#{randServer}.music.126.net/#{@dfsHash(dsfId)}/#{dsfId}.mp3";
