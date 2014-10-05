# 跳过网站等待、验证码及登录 [CUWCL4C]

基于 `简单成就下载 by Yulei`，在此表示感谢。


## 主治功能
测试于 Chrome & Firefox 32 (GreasyMonkey 2.2)


## 脚本内嵌资源标记
`<% #Filename %>`

 标记  | 含义
:-----:|:---------
   ~   | Stuff in `res` directory, passed as function-comment-extract.
   $   | Stuff in `res` directory, passed as raw file i.e. no quote no wrapper.
  \#   | Execute script and get its return (from `src` directory).
   @   | Include raw file from `src` directory.