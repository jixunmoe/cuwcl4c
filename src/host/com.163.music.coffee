###
	网易音乐下载解析 By Jixun
	尝试使用 Coffee Script 写
###

name: '网易音乐下载解析',
host: 'music.163.com',
noSubHost: true,
dl_icon: true,
css: `<% ~com.163.music.dl.css %>`,
onBody: ->
	@linkDownload = $('<a>')
		.addClass(H.defaultDlIcon)
		.appendTo($ '.m-playbar .oper')

	H.waitUntil('nm.m.f.xr.prototype.Al', (->
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
			return
		, H.scriptName

		# 接收文件数据
		document.addEventListener H.scriptName, (((e) ->
			songObj = e.detail

			@linkDownload
				.attr
					href: H.uri(songObj.url, H.sprintf('%s [%s].mp3', songObj.name, songObj.artist))
					attr: '下载: ' + songObj.name
			return
		).bind(this))
		return
	).bind(this))
	return

