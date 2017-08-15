const request = require('request');
const cheerio = require('cheerio');
const async   = require('async');

const _URL_REG = /^(?:(\w+):\/\/)?(?:(\w+):?(\w+)?@)?([^:\/\?#]+)(?::(\d+))?(\/[^\?#]+)?(?:\?([^#]+))?(?:#(\w+))?/;

module.exports.startCrawler = function(uuid, cb){
	var uuid = uuid && typeof uuid === 'string' ? uuid : 290139;
	var url  = 'http://www.imooc.com/u/' + uuid +'/courses?sort=publish';
	var host = _URL_REG.exec(url)[4];

	console.time('Request-uesd-total-time');
	async.waterfall([
		function(callback){
			request(url, function (error, response, body) {
				if (!error && response.statusCode == 200) {
					callback(null, cheerio.load(body));
				}else{
					callback(error, null)
				}
			})
		},
		function($, callback){
			let arr = [], host = 'http://www.imooc.com';
			$('.course-list-cont .study-hd > a').each(function(){
				arr.push({ url : host + $(this).attr('href') });
			});
			callback(null, arr)
		},
		function(arr, callback){
			let length = arr.length;
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
							callback(error, null)
						}

						if(length === 0) callback(null, arr);
					})
				})
			}else{
				callback(null, arr);
			}
		},
		function(arr, callback){
			let length = arr.length;
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
					if(length === 0) callback(null, arr);
				})
			}else{
				callback(null, arr);
			}
		}
	],function(error, result){
   		cb(result);
    	console.time('Request-uesd-total-time');
	})

	function failed(error){
		console.error('[Promise error] =>' + error)
	};
}
