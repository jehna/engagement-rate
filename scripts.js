var $data = null; /*<?php echo json_encode($posts); ?>*/

function Lerp(from, to, p) {
	return from + ((to-from)*p);
}

$(function() {
	var $container = $("#pimpum");

	for(var i in $data.data) {
		var post = $data.data[i];
		console.log(post);
		var insights = post.insigths.data;
		var impressions, engages;

		for(var j = 0; j < insights.length; j++) {
			switch(insights[j].name) {
				case "post_impressions_unique":
					impressions = insights[j].values[0].value;
					break;
				case "post_engaged_users":
					engages = insights[j].values[0].value;
					break;
				default:
					console.log(insights[j].name);
			}
		}

		var engagement_rate = engages / impressions;
		var engagement_rate_num = Math.round(engagement_rate * 1000) / 10;
		var log_rate = Math.log(engagement_rate_num)/Math.log(50);

		var datahref = post.link.indexOf("https://www.facebook.com") === 0 ? post.link : ("https://www.facebook.com/createtrips/posts/" + post.id.split("_").pop());
		$post = $('<div class="post">\
			<div class="engagement">\
				<span class="engagement_num" id="eng'+post.id+'">'+engagement_rate_num+'</span>\
				<span class="math">'+engages+'/'+impressions+'</span>\
			</div>\
			<div class="fb-post" data-href="'+ datahref  +'" data-width="466"></div>\
		</div>').appendTo($container);

		Circles.create({
		    id:         'eng'+post.id,
		    radius:     80,
		    value:      engagement_rate_num,
		    maxValue:   100,
		    width:      11.5,
		   // text:       function(value){return value + '%';},
		    colors:     [
					"hsl("+Lerp(0,122,log_rate)+",80%,"+(50+engagement_rate_num)+"%)",
					"hsl("+Lerp(0,122,log_rate)+",40%,"+(50+engagement_rate_num)+"%)",
				   ],
		    duration:   400,
		    wrpClass:   'circles-wrp',
		    textClass:  'circles-text'
		})


	}

	//FB.init();
});
