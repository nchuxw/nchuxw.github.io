/* live2d一言和工具栏 */
!(function() {
  function randomOneFromArr(arr) {
    if (Array.isArray(arr)) {
      return arr[Math.floor(Math.random() * arr.length)];
    }
    return arr;
  }
  class Message {
    constructor() {
      this.messageTimer = null;
    }
    say(msg, durationTime = 12000) {
      let temp = $('<div class="waifu-tip-item"></div>');
      temp.text(randomOneFromArr(msg));
      $('.waifu-tips').append(temp);
      setTimeout(() => {
        temp.remove();
      }, durationTime);
    }
  }
  var message = new Message();
  function seyRandom() {
    fetch('https://v1.hitokoto.cn/')
      .then(res => res.json())
      .then(res => {
        message.say(res.hitokoto);
      });
  }
  seyRandom();
  setInterval(seyRandom, 60 * 1000);

  // 工具栏交互事件
  $('.waifu-tool .fa-commenting').click(seyRandom);
  $('.waifu-tool .fa-camera').click(function() {
    Live2D.captureName = '看板娘^-^!';
    Live2D.captureFrame = true;
  });
  $('.waifu-tool .fa-chevron-down').click(function() {
    $('.waifu').slideToggle();
    $('.waifu-show').css("display","block");
  });
  $('.waifu-show').click(function() {
    $('.waifu-show').css("display","none");
    $('.waifu').slideToggle();
  });
})();