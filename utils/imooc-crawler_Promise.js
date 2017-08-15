const request = require('request');
const cheerio = require('cheerio');
const Promise = require('Promise');

const _URL_REG = /^(?:(\w+):\/\/)?(?:(\w+):?(\w+)?@)?([^:\/\?#]+)(?::(\d+))?(\/[^\?#]+)?(?:\?([^#]+))?(?:#(\w+))?/;

module.exports.startCrawler = function (uuid, callback) {
	uuid = uuid && typeof uuid === 'string' ? uuid : false;
	const host = 'http://www.imooc.com'
	const url  = host + '/u/' + uuid +'/courses?sort=publish';

	getCoursesList(url, failed)
	.then(getCoursesLinks, failed)
	.then(getCourseChapters, failed)
	.then(callback, failed)

	function failed(error){
		console.error('[Promise error] => ' + error)
	}

	function getCoursesList(url){
		console.time('Request-uesd-total-time');
		if (!url || !_URL_REG.test(url)) throw new TypeError('The url must be  a valid url string.')

		return new Promise(function(resolve, reject){
			request(url, function (error, response, body) {

				if (!error && response.statusCode == 200) {
					resolve(cheerio.load(body));
				}  else {
					reject(error)
				}
			})
		})
	}

	function getCoursesLinks($){
		let arr = [];

		return new Promise(function(resolve, reject){
			$('.course-list-cont .study-hd > a').each(function(){
				arr.push({
					url: host + $(this).attr('href'),
					name: $('.user-info .user-name > span').text()
				})
			})

			resolve(arr)
		})
	}

	function getCourseChapters(arr){
		let length = arr.length

		return new Promise(function(resolve, reject) {
			if (length) {
				for (let i = 0, item; item = arr[i++]; ) {
					request(item.url, function (error, response, body) {
						if (!error && response.statusCode == 200) {
							if (body) {
								handleCourseChaptersBody(item, cheerio.load(body))
								length--
							} else {
								throw new Error('[Request error] => getCourseChapters -> The body is an empty value like null or an empty string')
							}
						} else {
							reject(error)
						}

						if(length === 0) resolve(arr);
					})
				}
			}else{
				resolve(arr)
			}

			console.timeEnd('Request-uesd-total-time');
		})
	}

	function handleCourseChaptersBody(item, content) {
		if (!content) throw new Error('[ForEach error] => getCourseChaptersList -> The item.body is an empty value like null or an empty string')
		const $ = content

		item.chapters = []

		$('.chapter .video').each(function(){
			var self = this;
			item.chapters.push({
				title: $(this).prev().find('strong').text().trim().replace(/\r\n/g,''),
				links: function(){
					let arr = [];
					$(self).find('a').each(function(){
						arr.push(host + $(this).attr('href'));
			    })
			    return arr;
				}()
			})
		})
	}
}
