const puppeteer = require('puppeteer');
const HTMLDecoderEncoder = require('html-encoder-decoder');
const nodejieba = require('nodejieba');

const fs = require('fs');
const replaceMsg = JSON.parse(fs.readFileSync('replaceMsg.json'));

const width = 450;
const height = 650;

/**
 * 替換訊息
 * @param  {string} message 訊息
 * @return {string}         訊息
 */
function replaceMessage(message) {
  message = message.toLowerCase();
  console.log(nodejieba.cut(message));
  const messages = nodejieba.cut(message).map((word) => {
    if (replaceMsg.filter((one) => one.word1 === word).length > 0) {
      return replaceMsg.filter((one) => one.word1 === word)[0].word2;
    }
    if (replaceMsg.filter((one) => one.word2 === word).length > 0) {
      return replaceMsg.filter((one) => one.word2 === word)[0].word1;
    }
    return word;
  });
  message = '';
  messages.forEach((one) => {
    message = message + one;
  });

  let strArray = message.replace(/([1-9][0-9]{0,})/g, '<int>$1<int>').split('<int>');
  strArray = strArray.map((str)=>{
    if (/^\d+$/.test(str)) {
      let i = parseInt(str);
      if (i > 50 && i < 210) {
        i = i - 15;
      }
      return i.toString();
    }
    return str;
  });
  let outMessage = '';
  strArray.forEach((str)=>{
    outMessage = outMessage + str;
  });

  if (outMessage.indexOf('罩') != -1) outMessage = '';
  if (outMessage.indexOf('奶') != -1) outMessage = '';
  if (outMessage.indexOf('胸') != -1) outMessage = '';

  return outMessage;
}

/**
 * 替換詞彙
 * @param  {string} message 訊息
 * @param  {string} text1   詞彙1
 * @param  {string} text2   詞彙2
 * @return {string}         訊息結果
 */
function changeText(message, text1, text2) {
  message = message.replace(new RegExp(text2, 'g'), `${text1}<changeText>`);
  message = message.replace(new RegExp(text1, 'g'), text2);
  message = message.replace(new RegExp(`${text2}<changeText>`, 'g'), text1);
  return message;
}

/**
 * 聊天視窗
 */
class Chat {
  /**
   * 聊天建構
   */
  constructor(id) {
    this.id = id;
    this.page = null;
    this.replaceBool = true;
    this.lastMessageTime = 0;
  }

  /**
   * 發送聊天訊息
   * @param  {string}   message 訊息
   * @param  {function} next    回傳函數
   */
  sellMsg(message, next = ()=>{}) {
    if (this.replaceBool) {
      message = replaceMessage(message);
    }
    this.page.evaluate((message) => {
      document.querySelector('#messageInput').value = message;
      document.querySelector('input[value=傳送]').click();
    }, message);
    next(message);
  }

  /**
   * 發送正在輸入
   * @param  {boolen} typing 輸入狀態
   */
  sellTyping(typing) {
    if (typing) {
      this.page.evaluate(() => {
        document.querySelector('#messageInput').value = 'typing';
      });
    } else {
      this.page.evaluate(() => {
        document.querySelector('#messageInput').value = '';
      });
    }
  }

  /**
   * 離開聊天室
   */
  leaveChat() {
    this.page.evaluate(() => {
      document.querySelector('#messageInput').value = '';
      document.querySelector('input[value=離開]').click();
      // changePerson();
      document.querySelector('#popup-yes').click();
      setTimeout(()=>{
        document.querySelector('#ensureText').value = 'leave';
        document.querySelector('#popup-yes').click();
      }, 1);
    });
  }

  /**
   * 開始聊天
   */
  startChat() {
    this.replaceBool = true;
    this.page.evaluate(() => {
      clickStartChat();
      document.querySelector('.mfp-container').click();
    }).catch((err) => {});
  }

  /**
   * 監聽聊天訊息
   */
  listMsg() {}

  /**
   * 監聽正在輸入
   */
  listTyping() {}

  /**
   * 監聽動作
   * @param  {string} status 動作名稱
   */
  listAction(status) {}

  /**
   * 初始化
   * @param  {object} headers header設置
   */
  init(headers) {
    (async () => {
      const browser = await puppeteer.launch({
        headless: false,
        args: [
          `--window-size=${width},${height}`,
        ],
        slowMo: 100,
      });
      this.page = await browser.newPage();
      await this.page.setViewport({width, height: height-150});
      await this.page.setExtraHTTPHeaders(headers);
      await this.page.goto('https://wootalk.today/');

      const client = await this.page._client;

      client.on('Network.webSocketCreated', ({requestId, url}) => {
        // console.log('Network.webSocketCreated', requestId, url)
      });

      client.on('Network.webSocketClosed', ({requestId, timestamp}) => {
        // console.log('Network.webSocketClosed', requestId, timestamp)
      });

      client.on('Network.webSocketFrameSent', ({requestId, timestamp, response}) => {
        // console.log('Network.webSocketFrameSent', requestId, timestamp, response.payloadData)
      });

      client.on('Network.webSocketFrameReceived', ({requestId, timestamp, response}) => {
        console.log(`【${this.id}】`, requestId, timestamp, response.payloadData);

        if (response.payloadData.indexOf('[["update_state"') === 0) {
          const aRegExp =/\{.*\}/;
          const updateState = JSON.parse(response.payloadData.match(aRegExp));
          const data = updateState.data;
          if (data.typing) {
            this.listTyping(true);
          } else {
            this.listTyping(false);
          }
        }
        if (response.payloadData.indexOf('[["new_message"') === 0) {
          const aRegExp =/\{.*\}/;
          const newMessage = JSON.parse(response.payloadData.match(aRegExp));
          const data = newMessage.data;
          // console.log(newMessage);
          if (data.sender === 2) {
            if (this.lastMessageTime != data.time) {
              data.message = HTMLDecoderEncoder.decode(data.message);
              this.listMsg(data);
            }
            this.lastMessageTime = data.time;
          }
          if (data.sender === 0) {
            this.listAction(data.status);
            if (data.status === 'announce') {
              // console.log('announce');
              this.page.evaluate(() => {
                if (document.querySelector('#messageInput').value === 'typing')document.querySelector('#messageInput').value = '';
                document.querySelector('input[value=傳送]').click();
                // sendMessage();
              });
            }
          }
          if (data.length === 1) {
            this.listAction(data[0].status);
          }
        }
      });
    })();
  }
}

module.exports = Chat;
