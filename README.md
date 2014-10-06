# 跳过网站等待、验证码及登录 [CUWCL4C]

基于 `简单成就下载 by Yulei`，在此表示感谢。

脚本配置界面：[Github.io](http://jixunmoe.github.io/cuwcl4c/config/)

脚本安装地址：[GreasyFork (主站)](https://greasyfork.org/zh-CN/scripts/2600)、[GitHub](https://github.com/JixunMoe/cuwcl4c/raw/master/out/CUWCL4C.user.js)


## 自带规则
- 脚本配置页面 - `[localhost, jixunmoe.github.io]`
- 通用 phpDisk 网盘规则 - `[azpan.com, gxdisk.com, 2kuai.com, 1wp.me]`
- 乐盘 - `[lepan.cc, sx566.com]`
- 威盘 - `[vdisk.cn]`
- 119g 网盘 - `[d.119g.com]`
- 一听音乐 - `[www.1ting.com]`
- 565656 音乐 - `[www.565656.com]`
- 5sing 下载解析 - `[5sing.com, 5sing.kugou.com]`
- 千军万马网盘系列 - `[7958.com, qjwm.com]`
- 79 盘 - `[79pan.com]`
- 9酷音乐 - `[www.9ku.com]`
- 百度盘免下载管家 - `[yun.baidu.com, pan.baidu.com]`
- 可乐盘 - `[colafile.com]`
- 城通网盘系列 - `[400gb.com, ctdisk.com, pipipan.com, bego.cc]`
- DJCC 舞曲 - `[www.djcc.com]`
- DJ 嗨嗨 - `[www.djkk.com]`
- DJ 爷爷网 - `[www.djye.com]`
- 多乐音乐 - `[www.duole.com]`
- 邻居的耳朵 - `[ear.duomi.com]`
- 好盘 - `[howfile.com]`
- 噢音乐下载解析 - `[oyinyue.com]`
- QQ 电台下载解析 - `[fm.qq.com]`
- QQ 音乐、电台海外访问限制解除 - `[y.qq.com, fm.qq.com]`
- QQ 音乐下载解析 - `[y.qq.com]`
- 飞速网 - `[rayfile.com]`
- SongTaste 下载解析 - `[songtaste.com]`
- 速度盘 - `[sudupan.com]`
- 虾米音乐 - `[www.xiami.com]`
- 一木禾网盘 - `[yimuhe.com]`
- 音悦台下载解析 - `[yinyuetai.com]`
- 豆瓣电台 - `[douban.fm]`
- Jing.fm - `[jing.fm]`
- 萌电台 [moe.fm] - `[moe.fm]`
- 9盘 - `[www.9pan.net]`

测试于 Chrome & Firefox 32 (GreasyMonkey 2.2)


## 脚本内嵌资源标记
`<% Filename %>`

 标记  | 含义
:-----:|:---------
   ~   | Stuff in `res` directory, passed as function-comment-extract.
   $   | Stuff in `res` directory, passed as raw file i.e. no quote no wrapper.
  \#   | Execute script and get its return (from `src` directory).
   @   | Include raw file from `src` directory.
