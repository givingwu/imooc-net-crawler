'use static';
var _AJAX_URL = '//'+ window.location.host +'/results';

$('button[data-optional]').on('click', this, function(){
	$('#uuid').val($(this).text().trim());
})

$('button[data-confirm-btn]').on('click', this, function(){
	var uuid = $('#uuid').val().trim();
	if(uuid && $.isNumeric(uuid)){
		$.post('/crawler/imooc',{uuid: uuid},render);
	}
})

var render = function(r){
	var $showData = $('.show-data');
	if($.isArray(r.data) && r.data.length){
		$showData.find('small,.panel').remove();
		r = r.data;
 
		for(var i=0,l=r.length; i<l; i++){
			var chapters = r[i].chapters;
			
			$showData.append('<div class="panel panel-primary">\
		      <div class="panel-heading">\
		      	<h3 class="panel-title">Course links: <a href="'+ r[i].url +'">'+ r[i].url +'</a></h3>\
		      </div>\
		      <div class="panel-body"></div>\
		    </div>');

		    if(chapters.length){
		    	var $courses = $('<ul class="list-group"></ul>');

		    	for(var j=0, k = chapters.length; j<k; j++){
		    		var links = chapters[j].links;
		    		var linkStatus = links.length && links.length === 1 ? 'video' : 'videos';

		    		$courses.append('<li class="list-group-item">\
					    <span class="badge">'+ links.length  + ' ' + linkStatus +'</span>'+ chapters[j].title +'\
					</li>');

					if(links.length){
						var $links = $('<ul class="list-group"></ul>');
						
						for(var a=0, b = links.length; a<b; a++){
							$links.append('<li class="list-group-item"><a href="'+ links[a] +'"> '+ links[a] +'</a></li>');
						}

						$courses.children('li').eq(j).append($links);
					}

					$('.panel-body').eq(i).append($courses);
		    	}
		    }
		}
	}else{
		$showData.html('<small>'+ r.msg +'</small>')
	}
}

//ajax start
$(document).ajaxStart(function(){
	window.swal({
		width : '90px',
		padding : '10',
		customClass : 'loading-wrap',
		allowOutsideClick : false,
		allowEscapeKey : false,
		showConfirmButton : false,
		imageUrl : 'images/loading.gif',
		imageWidth : '32px',
		imageHeight : '32px',
		imageClass : 'loading-img',
		background : 'rgba(0,0,0,1)'
	})
});

// ajax stop
$(document).ajaxStop(function(){
	window.swal.close()
});