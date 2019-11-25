const uniqid = require('uniqid');
const Chat = require('./Chat.js');

/**
 * 配對兩個聊天室
 */
class Couple {
  /**
   * 建構
   * @param {string} session1 _wootalk_session
   * @param {string} session2 _wootalk_session
   */
  constructor(session1, session2, id) {
    this.roomID = uniqid('room-');
    this.chat1 = new Chat(id+':1');
    this.chat2 = new Chat(id+':2');

    this.session1 = session1;
    this.session2 = session2;

    this.messageCount = 0;
    this.messageCreate = new Date();
  }

  /**
   * 初始化
   */
  init() {
    this.chat1.listMsg = (data) => {
      this.messageCount++;
      this.messageCreate = new Date();
      this.chat2.sellMsg(data.message, (msg)=>{

      });
    };
    this.chat2.listMsg = (data) => {
      this.messageCount++;
      this.messageCreate = new Date();
      this.chat1.sellMsg(data.message, (msg)=>{
      });
    };

    this.chat1.listTyping = (typing) => {
      this.chat2.sellTyping(typing);
    };
    this.chat2.listTyping = (typing) => {
      this.chat1.sellTyping(typing);
    };

    this.chat1.listAction = (status) => {
      if (status === 'chat_otherleave') {
        this.restart();
      }
      if (status === 'chat_botcheck') {
      }
    };
    this.chat2.listAction = (status) => {
      if (status === 'chat_otherleave') {
        this.restart();
      }
      if (status === 'chat_botcheck') {
      }
    };

    this.chat1.init({
      'Cookie': `_wootalk_session=${this.session1};`,
    });
    this.chat2.init({
      'Cookie': `_wootalk_session=${this.session2};`,
    });

    const nowDate = new Date();
    this.messageCreate = nowDate;
    setTimeout(()=>{
      if (this.messageCreate === nowDate && this.messageCount === 0) {
        this.restart();
      }
    }, 20000);

    setInterval(()=>{
      if (new Date().getTime() - this.messageCreate.getTime() > 1000 * 60 * 3) {
        this.restart();
      }
    }, 1000);
  }

  /**
   * 重新配對聊天
   */
  restart() {
    const nowDate = new Date();
    this.messageCreate = nowDate;
    this.chat1.leaveChat();
    this.chat2.leaveChat();
    setTimeout(()=>{
      this.roomID = uniqid('room-');
      this.messageCount = 0;
      this.chat1.startChat();
    }, 1000);
    setTimeout(()=>{
      this.chat2.startChat();
    }, 3000);
    setTimeout(()=>{
      if (this.messageCreate === nowDate && this.messageCount === 0) {
        this.restart();
      }
    }, 20000);
    setTimeout(()=>{
      if (this.messageCreate === nowDate && this.messageCount < 6) {
        this.restart();
      }
    }, 120*1000);
  }
}

module.exports = Couple;
