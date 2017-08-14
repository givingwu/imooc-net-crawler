const request = require('request');
const cheerio = require('cheerio');
const Promise = require('Promise').default;

const _URL_REG = /^(?:(\w+):\/\/)?(?:(\w+):?(\w+)?@)?([^:\/\?#]+)(?::(\d+))?(\/[^\?#]+)?(?:\?([^#]+))?(?:#(\w+))?/;

module.exports.startCrawler = function(uuid, callback){
	var uuid = uuid && typeof uuid === 'string' ? uuid : false;
	var url  = 'http://www.imooc.com/u/' + uuid +'/courses?sort=publish';
	var host = _URL_REG.exec(url)[4];

	getCoursesList(url, failed)
	.then(getCoursesLinks, failed)
	.then(getCourseChapters, failed)
	.then(getCourseChaptersList, failed)
	.then(callback, failed);

	function failed(error){
		console.error('[Promise error] =>' + error)
	};

	function getCoursesList(url){
		console.time('Promise');
		return new Promise(function(resolve, reject){
			request(url, function (error, response, body) {
				if (!error && response.statusCode == 200) {
					resolve(cheerio.load(body));
				}else{
					reject(error)
				}
			})
		})
	};

	function getCoursesLinks($){
		return new Promise(function(resolve, reject){
			let arr = [], host = 'http://www.imooc.com';
			$('.course-list-cont .study-hd > a').each(function(){
				arr.push({ url : host + $(this).attr('href') });
			});
			resolve(arr)
		})
	};

	function getCourseChapters(arr){
		let length = arr.length;
		return new Promise(function(resolve,reject){
			if(arr.length){
				arr.forEach(function(item, index){
					request(item.url, function (error, response, body) {
						if (!error && response.statusCode == 200) {
							if(body){
								item.body = cheerio.load(body);
								length--;
							}else{
								console.error('[Request error] => getCourseChapters -> The body is an empty value like null or an empty string')
							}
						}else{
							reject(error)
						}

						if(length === 0) resolve(arr);
					})
				})
			}else{
				resolve(arr)
			}
		})
	};

	function getCourseChaptersList(arr){
		let length = arr.length;
		return new Promise(function(resolve, reject){
			if(arr.length){
				arr.forEach(function(item, index){
					if(item.body){
						var $ = item.body, host = 'http://www.imooc.com';
						item.chapters = [];
						$('.chapter .video').each(function(){
							var that = this;					
							item.chapters.push({
								title: $(this).prev().find('strong').text().trim().replace(/\r\n/g,''),
								links : function(){
									let arr = [];
									$(that).find('a').each(function(){
										arr.push(host + $(this).attr('href'));
								    })
								    return arr;
								}()
							})
						});
						delete item.body;
						length--;
					}else{
						console.error('[ForEach error] => getCourseChaptersList -> The item.body is an empty value like null or an empty string')
					}
					if(length === 0) resolve(arr);
				})
			}else{
				resolve(arr);
			}
			console.timeEnd('Promise');
		})
	}

}