/* https://www.antmoe.com/posts/ff6aef7b/#post-comment */
/**
 * 代码
 * 只適用於Hexo默认的代码渲染
 */
const $figureHighlight = $('figure.highlight')

if ($figureHighlight.length) {
	$figureHighlight.prepend('<div class="highlight-tools"></div>')
	const $highlightTools = $('.highlight-tools')

	/**
	* 代码语言
	*/
	let langNameIndex, langName
	$figureHighlight.each(function () {
		langNameIndex = langName = $(this).attr('class').split(' ')[1]
		if (langNameIndex === 'plain' || langNameIndex === undefined) langName = 'Code'
		$(this).find('.highlight-tools').append('<div class="code-lang">' + langName + '</div>')
	})

	/**
	* 代码copy
	* copy function
	*/
	$highlightTools.append('<div class="copy-notice"></div><i class="fa fa-paste copy-button" title="复制"></i>')
	const copy_code = function (text, ctx) {
		const copy_success   = "复制成功"
		const copy_error     = "复制失败"
		const copy_noSupport = "不支持复制"
		if (document.queryCommandSupported && document.queryCommandSupported('copy')) {
			try {
				document.execCommand('copy') // Security exception may be thrown by some browsers.
				$(ctx).prev('.copy-notice')
					.text(copy_success)
					.animate({
						opacity: 1
					}, 450, function () {
						setTimeout(function () {
							$(ctx).prev('.copy-notice').animate({
								opacity: 0
							}, 650)
						}, 400)
					})
			} catch (ex) {
				$(ctx).prev('.copy-notice')
					.text(copy_error)
					.animate({
						opacity: 1
					}, 650, function () {
						setTimeout(function () {
							$(ctx).prev('.copy-notice').animate({
								opacity: 0
							}, 650)
						}, 400)
					})
				return false
			}
		} else {
			$(ctx).prev('.copy-notice').text(copy_noSupport)
		}
	}
	// click events
	$(document).on('click', '.highlight-tools>.copy-button', function () {
		const $buttonParent = $(this).parents('figure.highlight')
		const selection = window.getSelection()
		const range = document.createRange()
		range.selectNodeContents($buttonParent.find('table .code pre')[0])
		selection.removeAllRanges()
		selection.addRange(range)
		const text = selection.toString()
		copy_code(text, this)
		selection.removeAllRanges()
	})

	/**
   * 代码收缩
   */
	$highlightTools.append('<i class="fa fa-angle-down code-expand" title="隐藏代码"></i>')
	$(document).on('click', '.highlight-tools >.code-expand', function () {
		const $hideItem = $(this).parent().nextAll()
		if ($(this).hasClass('code-closed')) {
			$hideItem.css('display', 'block');
			$(this).removeClass('code-closed');
			$(this).attr('title', '隐藏代码');
		} else {
			$hideItem.css('display', 'none');
			$(this).addClass('code-closed');
			$(this).attr('title', '显示代码');
		}
	})
}