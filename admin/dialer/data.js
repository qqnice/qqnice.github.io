// =====================================================================
// 考生聯絡半自動撥號｜3D 語音互動導覽劇場 資料檔 (data.js)
// =====================================================================

const STEPS = [
  {
    step: 1,
    icon: '📋',
    shortTitle: '打開名單',
    title: '打開站勤表，名單電話直接點',
    tag: 'Step 1｜準備聯絡',
    voiceText: '第一步：同仁打開電腦上的考生追蹤名單，姓名、電話、狀態一目了然，電話號碼可以直接用滑鼠點擊。',
    pcState: '顯示可點擊考生名單',
    modemState: '序列埠待命中 (Idle)',
    phoneState: '話機掛上待命',
    modemCmd: 'READY (COM3)'
  },
  {
    step: 2,
    icon: '🖱️',
    shortTitle: '點擊號碼',
    title: '滑鼠點一下電話號碼，免按話機按鍵',
    tag: 'Step 2｜一鍵觸發',
    voiceText: '第二步：同仁直接用滑鼠點一下考生的電話號碼。完全不用低頭去按桌上話機的數字鍵，也不怕按錯號碼！',
    pcState: '送出號碼 0912-345-678',
    modemState: '收到電腦撥號請求',
    phoneState: '不用碰話機按鍵！',
    modemCmd: '收到號碼 -> 準備撥號'
  },
  {
    step: 3,
    icon: '📟',
    shortTitle: 'AT自動撥號',
    title: '電腦下 AT 指令，Modem 走電話線撥出',
    tag: 'Step 3｜硬體自動撥接',
    voiceText: '第三步：電腦小程式透過序列埠，對 Modem 下達 ATDT 撥號指令，Modem 直接走學校電話線把電話撥出去。',
    pcState: '傳送 ATZ / ATDT 指令',
    modemState: '摘機並送出雙音多頻撥號音',
    phoneState: '並接同線，維持掛上',
    modemCmd: 'ATDT 0912345678'
  },
  {
    step: 4,
    icon: '📡',
    shortTitle: '狀態與忙線判斷',
    title: '畫面顯示響鈴；若忙線或無人接，系統自動記一筆',
    tag: 'Step 4｜智慧判斷回應碼',
    voiceText: '第四步：等待接通時，畫面會顯示撥號中、響鈴中。如果遇到忙線或沒人接，Modem 會自動判斷並在名單記一筆「忙線待重撥」，同仁直接跳下一位！',
    pcState: '監聽回應碼 (RING / BUSY)',
    modemState: '偵測線路響鈴或忙線訊號',
    phoneState: '等待對方接聽中',
    modemCmd: 'RINGING... (偵測狀態)'
  },
  {
    step: 5,
    icon: '🤖',
    shortTitle: 'TTS開場白',
    title: '對方接聽！電腦先播 TTS 開場白表明身分',
    tag: 'Step 5｜爭取黃金幾秒鐘',
    voiceText: '第五步：考生接起電話！電腦立刻播放罐頭語音：「您好，這裡是國立臺中科技大學，關於您報考的相關事項，我們的同仁要跟您說明一下，請稍候。」讓考生知道是學校打來的，不會馬上掛斷。',
    pcState: '播放臺中科大開場白音訊',
    modemState: '將 TTS 語音注入電話線',
    phoneState: '畫面提示：請拿起話機！',
    modemCmd: '🔊 播放 TTS 開場白'
  },
  {
    step: 6,
    icon: '👩‍💼',
    shortTitle: '拿起話機接手',
    title: '同仁拿起話機無縫接手，Modem 自動掛斷讓出線路',
    tag: 'Step 6｜真人溫暖對話',
    voiceText: '第六步：畫面跳出「已接通，請拿起話機」。同仁拿起旁邊的實體話機，Modem 這時自動掛斷讓出線路，通話不會斷，接下來就像平常打電話一樣自然聊天！',
    pcState: '顯示：通話中（真人接手）',
    modemState: 'ATH0 掛斷讓出電話線',
    phoneState: '已拿起聽筒！真人正常對話',
    modemCmd: 'ATH0 (讓出線路)'
  },
  {
    step: 7,
    icon: '✅',
    shortTitle: '掛斷點選結果',
    title: '講完掛上話機，一鍵點選結果，繼續下一位',
    tag: 'Step 7｜快速完成歸檔',
    voiceText: '第七步：講完電話掛上話機，同仁只要在畫面上點一下這通的結果，像是「已聯絡」或「需再追蹤」，就能馬上點下一支號碼，輕鬆又不會漏記！',
    pcState: '點選結果標籤，自動存檔',
    modemState: '回到待命狀態',
    phoneState: '掛回聽筒，完成通話',
    modemCmd: 'IDLE (待命)'
  }
];

// 三大重點語音口白
const HIGHLIGHT_VOICES = [
  '設計重點一：電腦只負責撥號、播開場白、跟記結果這三件事。它不錄音、不辨識、也不代替人聊天，所以完全沒有 AI 講錯話的問題！',
  '設計重點二：因為走學校原本的電話線，考生手機看到的來電顯示就是學校代表號，不會像雲端電話顯示奇怪的美國號碼，接聽率跟信任感最高！',
  '設計重點三：不用付雲端平台每分鐘的通話費，沿用學校既有的電話線，每個座位只需要一台幾百塊的 USB Modem 硬體就能搞定！'
];

// 模擬考生名單資料
const CANDIDATES = [
  {
    id: 'c1',
    name: '林同學',
    dept: '資訊管理系',
    phone: '0912-345-678',
    mode: 'answered',
    statusText: '待聯絡',
    statusColor: 'slate',
    note: '點電話體驗「接通＋TTS＋拿起話機」'
  },
  {
    id: 'c2',
    name: '陳同學',
    dept: '商業設計系',
    phone: '0933-888-168',
    mode: 'busy',
    statusText: '10:20 忙線，待重撥',
    statusColor: 'amber',
    note: '點電話體驗「Modem 偵測忙線自動登記」'
  },
  {
    id: 'c3',
    name: '張同學',
    dept: '應用英語系',
    phone: '0955-123-999',
    mode: 'answered',
    statusText: '待聯絡',
    statusColor: 'slate',
    note: '備取名單追蹤'
  }
];
