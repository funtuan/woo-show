# wooShow 一場wootalk 一場秀


## wooShow 是什麼？

藉由一場秀，讓全世界重視匿名聊天的安全

使兩個陌生人性別兌換，讓世界更美好


## wooShow 如何使用？


### 安裝npm套件
    npm install

### 運行
    npm start


## wooShow 配對範例

    const Couple = require('./Couple.js');
    const couple = Couple('SESSION_TOKEN_1', 'SESSION_TOKEN_2', 0);
    
    couple.init();
