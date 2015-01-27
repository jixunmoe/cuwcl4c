# 跳过网站等待、验证码及登录 [CUWCL4C]

基于 `简单成就下载 by Yulei`，在此表示感谢。

脚本配置界面：[Github.io](https://jixunmoe.github.io/cuwcl4c/config/)

脚本安装地址：[GreasyFork (主站)](https://greasyfork.org/zh-CN/scripts/2600)、[GitHub](https://github.com/JixunMoe/cuwcl4c/raw/master/out/CUWCL4C.user.js)

相关源码托管至：[GitHub](https://github.com/JixunMoe/cuwcl4c)

订阅 ABP 规则屏蔽广告: [Simple List](https://jixunmoe.github.io/SimpleList/)

\*\* 跳过短链接等待请使用 [Ads Bypasser](https://greasyfork.org/scripts/4881)，或 [Ads Bypasser Lite](https://greasyfork.org/scripts/4882) (该版去掉了图床网站支援) \*\*

## 特色功能

### 快速下载文件

快速跳过倒计时等待，直达下载地址。  
下载从未如此轻松!

> 不支持 `YunFile`; 其它网盘兼容请参见下方自带规则。

### 批量下载歌单

![批量下载歌曲](https://jixunmoe.github.io/cuwcl4c/res/batchDownloadSong.png)

> 目前仅限`网易云音乐`，需要启用 Aria2 下载方式

## 自带规则
- <% #genSites.js %>

测试于 Chrome & Firefox 32 (GreasyMonkey 2.2)


## 脚本内嵌资源标记
`<% Filename %>`

 标记  | 含义
:-----:|:---------
   ~   | Stuff in `res` directory, passed as function-comment-extract.
   $   | Stuff in `res` directory, passed as raw file i.e. no quote no wrapper.
  \#   | Execute script and get its return (from `src` directory).
   @   | Include raw file from `src` directory.
