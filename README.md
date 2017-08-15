
# Net crawler

> 使用express搭建的网络爬虫，不过功能很简单，只爬取了 *慕课网上指定老师ID下的所有课程*

## 功能

1. 点击 button 或使用 input 输入 ID

2. 点击 confirm 自动获取该 id 下所有老师课程

3. 如果该 ID 下无课程，则返回无数据

4. 若有数据 则显示所有课程 和 课程下所有的视频

![functional picture](https://github.com/GivingWu/givingwu.github.io/blob/master/images/imooc-net-crawler.gif "details operation")

## 技术

* [nodeJS](https://nodejs.org/)
* [express](https://www.npmjs.com/package/express) - Fast, unopinionated, minimalist web framework
* [jade](http://jadelang.net/) - Jade is a terse language for writing HTML templates.
* [request](https://www.npmjs.com/package/request) - Simplified HTTP request client.
* [cheerio](cheerio) - Fast, flexible & lean implementation of core jQuery designed specifically for the server.
* [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
* [AsyncJS](https://github.com/caolan/async) - Async utilities for node and the browser

## 实现思路

1. input 输入值[点击](https://github.com/GivingWu/imooc-net-crawler/blob/master/public/scripts/index.js#L11) confirm button 后，向后端[特定路径](https://github.com/GivingWu/imooc-net-crawler/blob/master/routes/index.js#L13)发起请求。

2. 后端处理该请求，调用 [imoocCrawler.startCrawler()](https://github.com/GivingWu/imooc-net-crawler/blob/master/utils/imooc-crawler_Promise.js#L7) 方法。

3. 对于 startCrawler() 方法我做了两种实现，一种是 [Promise](https://github.com/GivingWu/imooc-net-crawler/blob/master/utils/imooc-crawler_Promise.js), 一种是 [Async](https://github.com/GivingWu/imooc-net-crawler/blob/master/utils/imooc-crawler_Async.js) 方法，两种方法作用一致也都有效，作对比学习使用。切换使用只需要在[调用位置](https://github.com/GivingWu/imooc-net-crawler/blob/master/routes/index.js#L4)更改注释就好。

3. 对指定的 慕课网老师ID 进行 URL [拼接](https://github.com/GivingWu/imooc-net-crawler/blob/master/utils/imooc-crawler_Promise.js#L10)操作，执行 `getCoursesList()` 方法使用 `request` 开始请求 html body，使用 `cheerio.load(htmlBody)` 解析 dom, 进入 `getCoursesLinks()` 方法解析所有课程名称及老师名称放入 `arr` 中，继续调用 `getCourseChapters()` 方法获取每门课下面所有的视频列表并返回。

4. 在[imoocCrawler.startCrawler()](https://github.com/GivingWu/imooc-net-crawler/blob/master/routes/index.js#L14)的回调中，判断 `arr` 的长度，如果有值则返回 JOSN 格式字符串 data，或者返回 暂无数据的 msg.

# Usage

* 首先 npm 安装 dependencies

```
  npm install
```

* 启动项目

```
  npm run start
```

# license

[MIT](https://opensource.org/licenses/MIT)

# Thanks

谢谢观看。(Thanks for your watching).
