# 跳过网站等待、验证码及登录 [CUWCL4C]

基于 `简单成就下载 by Yulei`，在此表示感谢。

脚本配置界面：[Github.io](https://jixunmoe.github.io/cuwcl4c/config/)

脚本安装地址：[GreasyFork (主站)](https://greasyfork.org/zh-CN/scripts/2600)、[GitHub](https://github.com/JixunMoe/cuwcl4c/raw/master/out/CUWCL4C.user.js)

相关源码托管至：[GitHub](https://github.com/JixunMoe/cuwcl4c)

订阅 ABP 规则屏蔽广告: [Simple List](https://jixunmoe.github.io/SimpleList/)

## 特色功能

### 快速下载文件

快速跳过倒计时等待，直达下载地址。  
下载从未如此轻松!

> 不支持 `YunFile`; 其它网盘兼容请参见下方自带规则。

### 批量下载歌单

![批量下载歌曲](https://jixunmoe.github.io/cuwcl4c/res/batchDownloadSong.png)

> 目前仅限`网易云音乐`，需要启用 Aria2 下载方式

## 自带规则
- 脚本配置页面 - `[localhost, jixunmoe.github.io]`
- 119g 网盘 - `[d.119g.com]`
- 千军万马网盘系列 - `[7958.com, qjwm.com]`
- 9盘 - `[www.9pan.net]`
- 百度盘免下载管家 - `[yun.baidu.com, pan.baidu.com]`
- 暴雪盘 - `[bx0635.com]`
- 可乐盘 - `[colafile.com]`
- 城通网盘系列 - `[400gb.com, ctdisk.com, pipipan.com, bego.cc]`
- 好盘 - `[howfile.com]`
- 飞速网 - `[rayfile.com]`
- 速度盘 - `[sudupan.com]`
- 威盘 - `[vdisk.cn]`
- 一木禾网盘 - `[yimuhe.com]`
- 豆瓣电台 - `[douban.fm]`
- Jing.fm - `[jing.fm]`
- 萌电台 [moe.fm] - `[moe.fm]`
- QQ 电台下载解析 - `[fm.qq.com]`
- 网易音乐下载解析 - `[music.163.com]`
- 一听音乐 - `[www.1ting.com]`
- 565656 音乐 - `[www.565656.com]`
- 5sing 下载解析 - `[5sing.com, 5sing.kugou.com]`
- 9酷音乐 - `[www.9ku.com]`
- 百度音乐 - `[music.baidu.com]`
- 百度音乐盒 - `[play.baidu.com]`
- DJCC 舞曲 - `[www.djcc.com]`
- DJ 嗨嗨 - `[www.djkk.com]`
- DJ 爷爷网 - `[www.djye.com]`
- 多乐音乐 - `[www.duole.com]`
- 邻居的耳朵 - `[ear.duomi.com]`
- 噢音乐下载解析 - `[oyinyue.com]`
- QQ 音乐、电台海外访问限制解除 - `[y.qq.com, fm.qq.com]`
- QQ 音乐下载解析 - `[y.qq.com, soso.music.qq.com]`
- SongTaste 下载解析 - `[songtaste.com]`
- 虾米音乐 - `[www.xiami.com]`
- 音悦台下载解析 - `[yinyuetai.com]`
- 通用 phpDisk.a 网盘规则 - `[ 79pan.com, 7mv.cc, pan.52zz.org, 258pan.com, huimeiku.com, wpan.cc, lepan.cc, sx566.com ]`
- 通用 phpDisk.z 网盘规则 - `[ azpan.com, gxdisk.com, 2kuai.com, 1wp.me, 77pan.cc, vvpan.com, fmdisk.com, bx0635.com ]`

测试于 Chrome & Firefox 32 (GreasyMonkey 2.2)


## 脚本内嵌资源标记
`<% Filename %>`

 标记  | 含义
:-----:|:---------
   ~   | Stuff in `res` directory, passed as function-comment-extract.
   $   | Stuff in `res` directory, passed as raw file i.e. no quote no wrapper.
  \#   | Execute script and get its return (from `src` directory).
   @   | Include raw file from `src` directory.
