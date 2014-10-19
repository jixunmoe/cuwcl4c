###
	网易音乐下载解析 By Jixun
	尝试使用 Coffee Script 写
###

name: '网易音乐下载解析',
host: 'music.163.com',
noSubHost: yes,
noFrame: yes,
dl_icon: yes,
css: `<% ~com.163.music.dl.css %>`,

onBody: ->
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
		.click (e) ->
			# 编译出来的代码量好大!
			H.batchDownload (bAddDownloadFailed, err) ->
				if bAddDownloadFailed is yes
					alert err
			, no, do (trackQueue = localStorage['track-queue']) ->
				for i, track of JSON.parse trackQueue
					uri: track.mp3Url
					options: 
						out: "#{track.name} [#{track.artists.map((artist) -> artist.name).join '、'}].mp3"
			e.stopPropagation()
			return

	H.captureAria @linkDownload

	H.waitUntil () -> $('.listhdc > .addall').length,
	() =>
		@linkDownloadAll
			.insertBefore $('.m-playbar .listhdc .addall')
			.after $('<a>').addClass 'line jx_dl_line'
		return
	, yes, 500

	H.waitUntil 'nm.m.f.xr.prototype.Al', =>
		unsafeExec (scriptName) ->
			_bakPlayerAl = nm.m.f.xr::Al
			nm.m.f.xr::Al = (songObj) ->
				eveSongObj = 
					artist: songObj.artists.map((artist) -> artist.name).join '、'
					name: songObj.name
					url: songObj.mp3Url

				document.dispatchEvent new CustomEvent(scriptName, detail: eveSongObj);

				_bakPlayerAl.apply this, arguments
				return
		, H.scriptName

		# 接收文件数据
		document.addEventListener H.scriptName, (e) =>
			songObj = e.detail

			@linkDownload
				.attr
					href: H.uri(songObj.url, "#{songObj.name} [#{songObj.artist}].mp3")
					title: '下载: ' + songObj.name
			return
		return
	return

