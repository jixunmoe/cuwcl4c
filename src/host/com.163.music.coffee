###
	网易音乐下载解析 By Jixun
	尝试使用 Coffee Script 写
###

name: '网易音乐下载解析',
host: 'music.163.com',
noSubHost: yes,
noFrame: no,
dl_icon: yes,
css: `<% ~com.163.music.dl.css %>`,

onStart: ->
	# 优先使用 HTML5 播放器, 如果没有再考虑 Flash 支援
	unsafeExec ->
		fakePlatForm = navigator.platform + "--Fake-mac"
		Object.defineProperty navigator, "platform",
			get: -> fakePlatForm
			set: -> null

_doRemoval: ->
	# 因为 nm.x.mK 后加载, 能保证 nej.e.bK 存在
	H.waitUntil 'nm.x.mK', ->
		unsafeExec (bIsFrame)->
			_bK = nej.e.bK
			nej.e.bK = (z, name) ->
				return 1 if name is 'copyright' or name is 'resCopyright'
				_bK.apply this, arguments
			nm.x.mK =-> false
			if bIsFrame and nm.m.c.xB::zB
				nm.m.c.xB::zB =-> true
			return
		, H.isFrame
		return
	, 7000, 500
	return

onBody: ->
	@_doRemoval()
	return if H.isFrame

	getUri = (song) => @getUri song

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
			) ->
				for i, track of JSON.parse trackQueue
					aria2.add Aria2.fn.addUri, [getUri track], H.buildAriaParam
						out: "#{track.name} [#{track.artists.map((artist) -> artist.name).join '、'}].mp3"
				aria2.send yes
				return
			return

	if H.config.dAria_auth is 2
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

	H.waitUntil 'nm.m.f.xr.prototype.Al', =>
		unsafeExec (scriptName) ->
			_bakPlayerUpdateUI = nm.m.f.xr::Al
			nm.m.f.xr::Al = (songObj) ->
				eveSongObj = 
					artist: songObj.artists.map((artist) -> artist.name).join '、'
					name: songObj.name
					song: JSON.stringify songObj

				document.dispatchEvent new CustomEvent(scriptName, detail: eveSongObj);

				_bakPlayerUpdateUI.apply this, arguments
			return
		, H.scriptName

		# 接收文件数据
		document.addEventListener H.scriptName, (e) =>
			songObj = e.detail

			@linkDownload
				.attr
					href: H.uri(getUri(JSON.parse songObj.song), "#{songObj.name} [#{songObj.artist}].mp3")
					title: '下载: ' + songObj.name
			return
		return
	return

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

	# 服务器 1 ~ 4
	randServer = Math.floor(Math.random() * 4) + 1
	return "http://m#{randServer}.music.126.net/#{@dfsHash(dsfId)}/#{dsfId}.mp3";
