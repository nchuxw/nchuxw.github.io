/* 自动跳转到主要内容部分（主页除外） */
const stxw = {
	load_to_main: function () {
		var pathname = window.location.pathname;
		var pre_pathname = sessionStorage.getItem("pre_pathname");
		var cur_st = $(document).scrollTop();
		if (pathname != "/" && cur_st < 10 && pathname != pre_pathname) {
			$('html, body').animate({
				scrollTop: $("#main").offset().top - 50
			}, 500);
		}
		sessionStorage.setItem("pre_pathname", pathname);
	},

	use_img_mirror: function(prefix) {
		var imgs = document.getElementsByTagName("img");
		for(var i = 0; i < imgs.length; i++) {
			img_src = imgs[i].src;
			ind = img_src.indexOf("images");
			if(ind >= 0) {
				imgs[i].src = prefix + img_src.substring(ind);
			}
		}
	}
}

$(function () {
	if (window.CONFIG.load_to_main) {
		stxw.load_to_main();
	}
	if (window.CONFIG.img_mirror.enable) {
		stxw.use_img_mirror(window.CONFIG.img_mirror.prefix);
	}
})
