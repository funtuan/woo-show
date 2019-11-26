# wooShow
藉由一場秀，重視匿名聊天的淺在危險


## wooShow 是什麼？

以中間人攻擊概念，介入匿名聊天對話中，加上性別相關詞語交換

成為一場好看的秀，讓演員開心，讓觀眾更開心，也祝你玩得開心


## wooShow 如何使用？


### 安裝npm套件
    npm install

### 運行
    npm start


## wooShow 配對範例

    const Couple = require('./Couple.js');
    const couple = Couple('SESSION_TOKEN_1', 'SESSION_TOKEN_2', 0);
    
    couple.init();
