function Lerp(from, to, p) {
	return from + ((to-from)*p);
}

var _reRenderTimeout;
function reRenderFBXML() {
    if (_reRenderTimeout) {
        clearTimeout(_reRenderTimeout);
        _reRenderTimeout = false;
    }
    
    _reRenderTimeout = setTimeout(function() {
        FB.XFBML.parse();
    }, 1000);
}

function printInsightDataForPost(post, pageid) {
	var $container = $("#pimpum");

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
    
	var datahref = post.link.indexOf("https://www.facebook.com") === 0 ? post.link : ("https://www.facebook.com/" + pageid + "/posts/" + post.id.split("_").pop());
	$post = $('<div class="post">\
		<div class="engagement">\
			<span class="engagement_num" id="eng'+post.id+'">'+engagement_rate_num+'</span>\
			<span class="math">'+engages+'/'+impressions+'</span>\
		</div>\
		<div class="fb-post" data-href="'+ datahref  +'" data-width="466"></div>\
	</div>').appendTo($container);
    
    reRenderFBXML();

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
	});
}

// Init FB SDK
window.fbAsyncInit = function() {
    FB.init({
        appId      : '1462923687292654',
        xfbml      : true,
        version    : 'v2.5'
    });
    
    checkLogin();
};

// Download FB SDK
(function(d, s, id){
var js, fjs = d.getElementsByTagName(s)[0];
if (d.getElementById(id)) {return;}
js = d.createElement(s); js.id = id;
js.src = "https://connect.facebook.net/en_US/sdk.js";
fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

function checkLogin() {
    $("#login").hide();
    if (!FB) {
        setTimeout(checkLogin, 1000);
    }
    
    FB.getLoginStatus(function(response) {
        if (response.status === 'connected') {
            FB.api('/me/permissions', function(response) {
                var read_insights = false;
                var manage_pages = false;
                response.data.forEach(function(permission) {
                    if (permission.status === 'granted') {
                        if (permission.permission === 'read_insights') {
                            read_insights = true;
                        }
                        if (permission.permission === 'manage_pages') {
                            manage_pages = true;
                        }
                    }
                });
                
                if (manage_pages && read_insights) {
                    listFacebookPages();
                } else {
                    $("#login").show();
                }
            });
        } else {
            $("#login").show();
        }
    });
}

function listFacebookPages() {
    $("#select-page").hide();
    FB.api('/me/accounts', 'get', function(response) {
        $option = $("#select-page-select").html("<option>Select a page you want to inspect</option>");
        response.data.forEach(function(page) {
            $("<option />").text(page.name).attr("value", page.id).appendTo($option);
        });
        $("#select-page").show();
    });
}

$(function() {
    $("#login-btn").click(function() {
        FB.login(checkLogin, {scope: 'public_profile,manage_pages,read_insights'});
    });
    
    $("#select-page-select").change(function() {
        $("#pimpum").html("");
        var pageID = $(this).val();
        FB.api('/' + pageID + '/posts?fields=message,id,link', 'get', function(response) {
            response.data.forEach(function(post) {
                FB.api('/' + post.id + '/insights/post_impressions_unique,post_engaged_users', function(response) {
                    post.insigths = response;
                    printInsightDataForPost(post, pageID);
                });
            });
        });
    })
})
