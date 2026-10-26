export const ISLANDS = [
  {id:'linux',name:'Linux',nav:'Linux',title:'運算港灣',english:'COMPUTING HARBOR',color:'#b56334',position:[-10,-11],grass:'#80a879',tagline:'把想法，部署成真實運作的世界。',description:'從第一個容器出發，學會部署網站、管理伺服器，並在日誌中讀懂系統的訊號。沿著碼頭的學習航線，讓每一次實作都成為你的能力。',topics:[
    {id:'docker',name:'貨櫃港',subtitle:'Docker 與 Compose',description:'容器就像可以搬運的貨櫃，把環境與服務一起打包。從概念、部署到專案實作，逐站完成你的航程。',order:'建議航線：容器概念 → WEEK1 入門 → WEEK2 部署 → WEEK3 維運。'},
    {id:'logs',name:'日誌觀測塔',subtitle:'Graylog 與日誌整合',description:'收集來自 Linux 與 Windows 的日誌，學習部署 Graylog、整合 NXLog 與 Rsyslog，找出系統背後的線索。'},
    {id:'lab',name:'實作基地',subtitle:'備份、還原與主機安全',description:'進入實作工作台，練習備份與還原，再用檢查表確認每一項操作。'},
    {id:'tools',name:'工具補給站',subtitle:'本地 AI、網路與雲端安全',description:'準備你的系統工具箱：部署本地 AI、設定固定 IP，理解雲端防護。'}]},
  {id:'unreal',name:'Unreal',nav:'Unreal',title:'創世工坊島',english:'WORLD BUILDING WORKSHOP',color:'#6663a5',position:[9,-10],grass:'#92a1a2',tagline:'讓邏輯連線，讓想像開始運轉。',description:'在這座島，想像可以被看見，也可以被操作。從 Unreal Engine 的第一個場景，到 Blueprint 的每一條連線，親手搭建會回應你的世界。',topics:[
    {id:'start',name:'啟航學院',subtitle:'引擎安裝與第一個場景',description:'認識 Unreal Engine 的專案、編輯器與視埠操作，為創作準備好第一套工具。'},
    {id:'blueprint',name:'藍圖工坊',subtitle:'事件、變數與流程控制',description:'把事件、條件與動作連成藍圖，理解 Actor 溝通與程式邏輯。'},
    {id:'elevator',name:'電梯實驗塔',subtitle:'ElevatorKit 與狀態機',description:'從讓電梯動起來，到處理門、燈、樓層與請求佇列，用可以操作的實驗理解狀態機。',order:'建議航線：學生操作手冊 → 電梯狀態實驗 → 聲光與藍圖進階實驗。'},
    {id:'debug',name:'維修補給站',subtitle:'快捷鍵、除錯與速查',description:'遇到卡關時，回來找快捷鍵、除錯方式與常見問題。'}]},
  {id:'tpr',name:'TPR',nav:'TPR 教學實踐',title:'研究探索島',english:'TEACHING & RESEARCH ISLAND',color:'#3a7960',position:[-12,5],grass:'#8eaf77',tagline:'從課堂裡的疑問，走向有證據的改變。',description:'教學中的一個疑問，就是研究旅程的起點。在觀測、閱讀與實驗之間，讓問題逐步成形，走向可以檢驗與分享的教學實踐。',topics:[
    {id:'question',name:'問題觀測所',subtitle:'教學實踐研究的起點',description:'認識教學實踐研究計畫，從課堂現象找到值得研究的問題。'},
    {id:'library',name:'文獻圖書館',subtitle:'AI 協作、驗證與研究閱讀',description:'在 AI 協作與教學反思中練習提問，建立能追溯來源的思考習慣。'},
    {id:'research',name:'研究工坊',subtitle:'研究發想、計畫與方法',description:'走過研究構想、文獻驗證、計畫撰寫與評量設計，把各階段的材料接起來。'},
    {id:'outcomes',name:'成果與教學展館',subtitle:'執行、投稿與延伸資源',description:'從執行紀錄走向成果報告與投稿，也在這裡探索老師整理的其他教學資源。'}]},
  {id:'admin',name:'行政 AI',nav:'行政 AI 協作',title:'智慧協作島',english:'HUMAN + AI COLLABORATION',color:'#99733b',position:[12,5],grass:'#a5b587',tagline:'讓 AI 接住瑣事，把時間留給重要的事。',description:'你是判斷與決策的大腦，AI 小幫手負責協助執行。從一張戰情表出發，把招生、排程、核銷與資料整理連成清楚的工作流。',topics:[
    {id:'command',name:'協作指揮所',subtitle:'任務盤點、提示詞與總控',description:'先看清任務，再安排小幫手。認識工作拆解、提示詞與總控調度。'},
    {id:'events',name:'活動服務港',subtitle:'招生與活動行政流程',description:'跟著活動案例走過建檔、報名、通知、公文與成果回收，理解各階段的分工。'},
    {id:'daily',name:'日常工作站',subtitle:'課表、核銷、評鑑與補助',description:'從日常重複工作出發，探索排會議、資料整理、支出證明單與補助資訊的 AI 協作。'},
    {id:'verify',name:'查核與評量中心',subtitle:'資料查核與 AI 時代評量',description:'練習查核 AI 的輸出，並探索可以看見真實能力的評量方式。'}]},
  {id:'youtube',type:'youtube',name:'YouTube',nav:'YouTube 影音',title:'影音學習島',english:'QQ VIDEO LEARNING ISLAND',color:'#b65f46',position:[0,13.5],scale:1.23,grass:'#98af7e',tagline:'把每一次觀看，變成下一次動手的起點。',description:'20 個精選入口，從 Unreal、雲端與系統，到遠距教學、MOOCs 與跨域應用。跟著 QQ 老師，一段一段看懂、一步一步實作。',topics:[
    {id:'unreal',name:'3D 創作影城',filter:'Unreal 與作品',subtitle:'Unreal 與學生作品',description:'從操作示範到學生作品，看見 3D 世界的創作過程。'},
    {id:'cloud',name:'雲端實作站',filter:'雲端與系統',subtitle:'AWS、Azure、Linux 與 AI',description:'跟著實作影片，探索雲端、系統架設與工具整合。'},
    {id:'teaching',name:'遠距放映室',filter:'遠距與 MOOCs',subtitle:'TronClass、遠距課程與 MOOCs',description:'從登入學習平台，到一整系列遠距與磨課師課程。'},
    {id:'cross',name:'跨域探索館',filter:'跨域與資安',subtitle:'資安、長照 VR 與數位工具',description:'在不同領域之間，看見科技如何走進生活與專業。'}]}
];
