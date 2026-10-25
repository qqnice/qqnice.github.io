// ============================================================================
// AI 時代大學課程翻轉：Semantic Web 與知識圖譜教學互動導覽網站 - 完整資料庫 (data.js)
// ============================================================================

window.COURSE_DATA = {
  // --------------------------------------------------------------------------
  // 1. 六大翻轉教學章節 (6-Chapter Pedagogical Journey)
  // --------------------------------------------------------------------------
  chapters: [
    {
      id: 1,
      tag: 'Chapter 1｜過去的教學痛點',
      shortTitle: '1. 傳統痛點：學完整學期還沒做出來',
      title: '過去教 Semantic Web：光鋪陳基礎技術，一學期就過去了',
      subtitle: '從網路爬蟲、斷字斷詞、Ontology 到 Neo4j，技術高牆擋住了學生的探索熱情',
      voiceText: '第一章，過去的教學痛點。以前在大學課堂講授語意網 Semantic Web，必須從網路爬蟲、斷字斷詞、本體論 Ontology、分類學 Taxonomy、RDF，一路講到圖資料庫 Neo4j 與資料視覺化，學生還得先具備程式設計與系統建置能力。光教完這些底層基礎，一個學期就過去了，根本來不及規劃真正的知識應用。',
      painPoint: '傳統「先學完所有底層技術、最後才做應用」的線性模式，讓大學生在看到知識圖譜的魅力之前，就先被語法、環境建置與演算法細節消磨光了熱情。',
      highlights: [
        '🕸️ 技術鏈條太長：爬蟲 ➔ 斷詞 (Tokenization) ➔ Ontology / Taxonomy ➔ RDF 三元組 ➔ Neo4j 圖資料庫 ➔ 前端視覺化',
        '⏳ 時間成本極高：每個環節都是獨立專業，18 週課程光講完語法與環境安裝就期末了',
        '😓 學生挫折感重：還沒體會到「電腦如何理解人類語言與推論知識」，就卡在 Bug 與資料庫設定'
      ],
      stageMode: 'legacy-wall'
    },
    {
      id: 2,
      tag: 'Chapter 2｜AI 時代翻轉課堂',
      shortTitle: '2. AI 翻轉：一堂課做出專屬知識圖譜',
      title: 'AI 協作破牆：複雜技術先交給 AI，一堂課玩出自己的成果！',
      subtitle: '掌握探索領域與問題意識，短短一堂課就能生成 Knowledge Graph、體驗 Semantic Search',
      voiceText: '第二章，AI 時代翻轉課堂。現在，繁瑣的底層技術過程可以先讓 AI 協助完成！同學只要掌握想探索的領域，了解這些技術能解決什麼問題，以及電腦如何理解人類的語言與文字，就能在課堂上透過 AI 直接動手實作，快速生成專屬的知識圖譜，實際體驗語意搜尋、知識分類與推論關係，短短一堂課就能看到成果，玩得不亦樂乎！',
      painPoint: '把「寫爬蟲、刻語法、架資料庫」的繁重苦工轉交給 AI 協作，教師將課堂重心拉回最核心的思維：「電腦究竟如何理解人類語言？知識之間如何建立分類與推論？」',
      highlights: [
        '🎯 聚焦核心提問：掌握想探索的領域，思考「這項技術能解決什麼真實問題？」',
        '⚡ 一堂課即時產出：課堂現場餵入領域文本，透過 AI 直接生成互動式 Knowledge Graph',
        '🔍 體感體驗語意網：親手操作 Semantic Search、觀察 Taxonomy 階層與跨節點推論，建立深刻直觀認知'
      ],
      stageMode: 'one-class-magic'
    },
    {
      id: 3,
      tag: 'Chapter 3｜學習進化新典範',
      shortTitle: '3. 學習進化：先體驗應用、再深究技術',
      title: '大學生提早解鎖研究所知識：從「先學技術」進化為「先體驗應用」',
      subtitle: '先知其然、產生興趣與體感認知，未來帶著真實問題再深入理論與技術細節',
      voiceText: '第三章，學習進化新典範。雖然同學在一堂課內還不清楚背後所有的技術細節，但透過快速實作，已經先建立直觀而深刻的體感認知。許多過去研究所才會接觸的知識，現在大學生就能提早體驗！從過去先學技術再做應用，轉變為現在先體驗應用、產生興趣後，再帶著問題深入理解每個環節為什麼要這樣做，真正落實從做中學。',
      painPoint: '傳統教育怕學生「不懂底層原理就用工具」；翻轉教育則深知：先有「做出來的成就感與直觀體感」，學生才會產生真正的內在動機去追問「為什麼要這樣做」。',
      highlights: [
        '🎓 研究級知識向下扎根：過去研究所才碰得到的 Ontology、知識推論與系統性回顧，大學部就能動手玩',
        '🧠 先建立體感認知（Intuitive Cognition）：親眼看見節點連線與推論跳出，比背誦十頁 RDF 定義更深刻',
        '🔄 帶著問題回頭深究：未來想精進時，自然會針對斷詞精準度、圖演算法或 Neo4j 效能主動深入學習'
      ],
      stageMode: 'paradigm-spiral'
    },
    {
      id: 4,
      tag: 'Chapter 4｜回家作業升級挑戰',
      shortTitle: '4. 作業升級：1+12 篇系統性文獻回顧',
      title: '技術門檻降低了，回家作業當然要更刺激好玩😄！',
      subtitle: '1 篇 2025 最新核心論文 ＋ 12 篇相關學術文獻 ＝ AI 輔助系統性文獻回顧 (SLR)',
      voiceText: '第四章，回家作業升級挑戰。既然技術門檻降低了，回家作業當然要更刺激好玩！我們設計了 AI 輔助系統性文獻回顧與知識圖譜建構挑戰。每位同學選定感興趣的主題，找出一篇 2025 年元旦後正式發表的最新核心論文，再搭配 12 篇相關論文，總共下載 13 篇完整 PDF。用 AI 協作萃取研究問題、方法與缺口，且嚴格要求每一項知識都必須有真實論文依據，杜絕 AI 幻覺！',
      painPoint: '當程式語法不再是障礙，評量標準就從「會不會寫 Code」全面升級為「學術探究力、分類邏輯力、批判查證力與推論創造力」。',
      highlights: [
        '📄 1+12 篇真實 PDF 實戰：1 篇 2025/01/01 後發表的最新核心論文 ＋ 12 篇跨資料庫關聯論文（共 13 篇完整 PDF）',
        '🔎 嚴謹紀錄搜尋策略：完整紀錄 Google Scholar / PubMed / Scopus / WoS 關鍵字、搜尋日期、納入與排除條件',
        '🛡️ 真實查證鐵律：用 AI 分析 13 篇論文的目的、方法、共同點與研究缺口，但絕不採用未經查證的 AI 幻覺資訊'
      ],
      stageMode: 'slr-13-funnel'
    },
    {
      id: 5,
      tag: 'Chapter 5｜分類學與推論引擎',
      shortTitle: '5. 核心思維：Taxonomy 與 3+ 推論關係',
      title: '不只羅列論文！建立 3 大類 × 2 層 Taxonomy 與「有憑有據的推論關係」',
      subtitle: '嚴格區分「文獻直接支持（實線）」與「AI 輔助延伸推論（虛線）」，培養高階學術思辨',
      voiceText: '第五章，分類學與推論引擎。這份作業最核心的訓練，是讓同學把 13 篇論文轉化為結構化的分類學 Taxonomy，至少包含 3 個主要類別與 2 層以上的階層，絕不能只是把 13 篇論文依序排排站。接著建立知識圖譜，除了呈現 is-a、uses-method、supports、contrasts-with 等直接關係外，更要根據文獻證據提出至少 3 條延伸推論關係，標明文獻來源與推論邏輯，並嚴格區分哪些是文獻直接支持、哪些是尚待驗證的推論！',
      painPoint: '許多學生做文獻回顧只是「第一篇說什麼、第二篇說什麼」的流水帳；透過 Taxonomy 與 Inference Graph，強迫大腦進行跨文獻綜合（Synthesis）與邏輯推演。',
      highlights: [
        '🗂️ 結構化分類學（Taxonomy）：至少 3 個主要知識領域類別 × 2 層以上從屬階層，收納核心概念與術語',
        '🔗 豐富語意關係（Edges）：涵蓋 is-a、contains、uses-method、studies、related-to、supports、contrasts-with',
        '💡 至少 3 條可溯源推論（Inference）：標示文獻依據與推論邏輯，視覺化區分「文獻直接實證」與「待驗證推論」'
      ],
      stageMode: 'taxonomy-inference'
    },
    {
      id: 6,
      tag: 'Chapter 6｜獨立 HTML 互動交付',
      shortTitle: '6. 成果交付：單一 HTML 互動知識圖譜',
      title: '零伺服器門檻！輸出可互動、可溯源的 `knowledge_graph.html`',
      subtitle: '點開瀏覽器就能縮放、拖拽、篩選分類、查閱論文出處，打造帶得走的個人研究代表作',
      voiceText: '第六章，獨立 HTML 互動交付。最後一步，同學將在 AI 協助下，把整套分類學與知識圖譜打包輸出成單一檔案 knowledge_graph.html。不需要架設外部伺服器，直接用瀏覽器打開就能觀看！圖譜必須透過顏色區分分類、用實線與虛線區分直接關係與推論關係，並且支援縮放、移動與點選節點查看對應的論文來源。完成後依規定命名個人資料夾繳交，成為每位同學最有成就感的作品！',
      painPoint: '過去用 Neo4j 或複雜前端框架做的專案，學期結束伺服器一關就打不開了；單一免伺服器的互動式 HTML，讓學生能隨時展示、老師能一鍵批閱！',
      highlights: [
        '🌐 免伺服器單檔交付：輸出獨立 `knowledge_graph.html`，雙擊即可在任何電腦瀏覽器流暢開啟',
        '🎨 視覺化與互動兼備：顏色圖例區分 Taxonomy 類別、實虛線區分直接/推論關係，支援縮放、拖拽與點擊溯源',
        '📁 標準化歸檔繳交：於共用資料夾建立「學號_姓名_研究主題」個人資料夾，完整保存 13 篇 PDF、整理報告與 HTML 圖譜'
      ],
      stageMode: 'html-deliverable'
    }
  ],

  // --------------------------------------------------------------------------
  // 2. 傳統教學 vs. AI 翻轉教學 深度對比資料
  // --------------------------------------------------------------------------
  comparison: {
    traditional: {
      badge: '過去模式：先學底層技術 ➔ 期末才碰應用',
      title: '傳統 Semantic Web 18 週技術苦行',
      summary: '學生必須先跨過 6 座高聳的工程技術大山，往往在看見知識圖譜的真正價值前就已精疲力竭。',
      timeline: [
        { weeks: 'Week 01 - 03', topic: '網路爬蟲與資料清洗 (Web Scraping & ETL)', pain: '光處理反爬蟲、HTML 標籤解析與編碼問題就卡關兩週' },
        { weeks: 'Week 04 - 06', topic: '自然語言處理：斷字斷詞與詞性標註 (NLP & Tokenization)', pain: '調校中英文斷詞字典、停用詞與正規表達式，尚未進入知識層' },
        { weeks: 'Week 07 - 09', topic: '本體論與分類學理論 (Ontology, OWL & Taxonomy)', pain: '抽象理論艱深難懂，缺乏真實領域資料可立即驗證體會' },
        { weeks: 'Week 10 - 12', topic: 'RDF 三元組與 SPARQL 查詢語法', pain: '背誦 XML/Turtle 語法結構，學生不知道學這個能解決什麼問題' },
        { weeks: 'Week 13 - 15', topic: 'Neo4j 圖資料庫建置與 Cypher 語法', pain: '電腦環境安裝失敗、Port 衝突、資料庫連線設定耗盡課堂時間' },
        { weeks: 'Week 16 - 18', topic: '前端 D3.js / Vis.js 視覺化與期末專題', pain: '學期已經結束，多數組別只做出陽春範例，來不及深入領域知識與推論' }
      ]
    },
    flipped: {
      badge: '現在模式：先體驗應用建立體感 ➔ 帶著問題深究技術',
      title: 'AI 時代翻轉課堂：一堂課體感實作 × 高階思維作業',
      summary: 'AI 先扛起繁瑣工程細節，讓大學生在第一堂課就站上「知識架構師」的高度，親手玩出成果！',
      timeline: [
        { weeks: '課堂前 15 分鐘', topic: '領域問題意識與語意網核心觀念', gain: '直接提問：「電腦如何理解人類文字？知識圖譜能幫我們發現什麼隱藏關聯？」' },
        { weeks: '課堂中 30 分鐘', topic: 'AI 協作快速生成 Knowledge Graph', gain: '餵入感興趣的主題文本，讓 AI 協助斷詞、萃取實體與關係，瞬間生成視覺化圖譜' },
        { weeks: '課堂後 30 分鐘', topic: '動手玩 Semantic Search、知識分類與推論', gain: '在自己的圖譜上測試語意搜尋、調整 Taxonomy 分類階層、觀察跨節點推論，玩得不亦樂乎！' },
        { weeks: '課堂總結 15 分鐘', topic: '建立深刻體感認知 (Intuitive Cognition)', gain: '先知其然！親眼看見「原來知識圖譜長這樣、能做這種推論」，點燃強烈好奇心' },
        { weeks: '課後回家作業', topic: '刺激好玩的 1+12 篇系統性文獻回顧與推論圖譜', gain: '挑戰過去研究所等級的 SLR 文獻分析、3×2 Taxonomy 建構與 3+ 條有據推論，輸出獨立 HTML' },
        { weeks: '未來自主精進', topic: '帶著真實問題回頭深入理論與技術 (Learn by Doing)', gain: '因為親手做過，自然想追問「如何讓斷詞更準？Neo4j 怎麼存百萬節點？」，主動深入演算法與系統建置' }
      ]
    }
  },

  // --------------------------------------------------------------------------
  // 3. 課堂示範：學生作品 `knowledge_graph.html` 互動模擬器資料
  //    主題範例：AI 輔助醫學影像診斷與臨床決策支持 (2025 核心論文 + 12 篇相關文獻)
  // --------------------------------------------------------------------------
  sampleGraph: {
    topicTitle: 'AI 輔助醫學影像診斷與可解釋性臨床決策 (2025 SLR 示範圖譜)',
    studentInfo: '示範學生：115001_林同學｜核心論文：Chen et al. (2025)《Multimodal Foundation Models for Explainable Thoracic Radiology》',
    taxonomyTree: [
      {
        id: 'cat-model',
        name: '大類 A：多模態基礎模型架構 (Foundation Models)',
        color: '#38bdf8', // sky
        children: [
          { id: 'sub-vlm', name: 'A1. 視覺語言模型 (Vision-Language Models)', terms: ['CLIP-Med', '跨模態對齊 (Cross-Modal Alignment)', '零樣本分類 (Zero-Shot)'] },
          { id: 'sub-seg', name: 'A2. 病灶分割與定位 (Lesion Segmentation)', terms: ['SAM-Med3D', '微鈣化點偵測', '邊界不確定性量化'] }
        ]
      },
      {
        id: 'cat-xai',
        name: '大類 B：臨床可解釋性與信任機制 (Explainable AI & Trust)',
        color: '#34d399', // emerald
        children: [
          { id: 'sub-vis', name: 'B1. 視覺與語意雙重解釋 (Dual Explanation)', terms: ['注意力熱區圖 (Grad-CAM)', '結構化病理報告生成', '推論鏈溯源 (Chain-of-Evidence)'] },
          { id: 'sub-bias', name: 'B2. 幻覺抑制與偏誤校準 (Hallucination Mitigation)', terms: ['RAG 臨床指引錨定', '跨院資料偏移 (Domain Shift)', '拒答門檻機制'] }
        ]
      },
      {
        id: 'cat-clinical',
        name: '大類 C：臨床工作流整合與評估 (Clinical Workflow & Evaluation)',
        color: '#fbbf24', // amber
        children: [
          { id: 'sub-triage', name: 'C1. 急診檢傷與優先序排程 (Emergency Triage)', terms: ['危急值自動預警', '放射科醫師閱片疲勞降低', '雙盲對照試驗'] },
          { id: 'sub-reg', name: 'C2. 醫療法規與隱私合規 (Governance & Privacy)', terms: ['聯邦學習 (Federated Learning)', '去識別化審計', 'FDA SaMD 查驗標準'] }
        ]
      }
    ],
    nodes: [
      {
        id: 'N_CORE',
        label: '核心論文：Chen (2025)\n多模態胸腔影像基礎模型',
        shortLabel: 'Chen (2025) 核心論文',
        category: 'cat-model',
        nodeType: '核心論文 (2025/02 發表)',
        x: 420,
        y: 195,
        r: 34,
        papers: ['[Core-01] Chen, L. et al. (2025.02). Multimodal Foundation Models for Explainable Thoracic Radiology. Nature Medicine.'],
        summary: '2025 年 2 月發表之核心論文。提出結合 3D 影像編碼器與臨床病歷語意對齊之基礎模型，在 14 種胸腔病灶達到 94.2% AUC，並能輸出對應影像區域之文字解釋。'
      },
      {
        id: 'N_VLM',
        label: '視覺語言跨模態對齊\n(Vision-Language Alignment)',
        shortLabel: '跨模態對齊技術',
        category: 'cat-model',
        nodeType: '核心概念 (Taxonomy A1)',
        x: 175,
        y: 115,
        r: 27,
        papers: [
          '[Core-01] Chen et al. (2025)',
          '[Rel-02] Wang & Patel (2024). Contrastive Pretraining on 2M Chest X-Rays. IEEE TMI.',
          '[Rel-03] Kim et al. (2024). Zero-Shot Rare Pathology Detection via VLM. MICCAI.'
        ],
        summary: '將醫學影像特徵向量與放射科醫師撰寫之自然語言報告投影至同一語意空間，使電腦能「理解」影像局部特徵對應之醫學術語。'
      },
      {
        id: 'N_SAM3D',
        label: '3D 病灶分割與微病灶偵測\n(SAM-Med3D)',
        shortLabel: '3D 病灶分割',
        category: 'cat-model',
        nodeType: '研究方法 (Taxonomy A2)',
        x: 155,
        y: 295,
        r: 26,
        papers: [
          '[Rel-04] Zhao et al. (2024). Adapting Segment Anything to Volumetric CT. Medical Image Analysis.',
          '[Rel-05] Liu et al. (2025.01). Sub-millimeter Nodule Segmentation with Uncertainty. Radiology AI.'
        ],
        summary: '針對低劑量電腦斷層 (LDCT) 進行微米級結節分割，並輸出邊界信賴區間，解決傳統 CNN 對微小病灶漏診問題。'
      },
      {
        id: 'N_XAI',
        label: '視覺熱區＋結構化推論鏈\n(Dual Explainability)',
        shortLabel: '視覺+語意雙重解釋',
        category: 'cat-xai',
        nodeType: '核心概念 (Taxonomy B1)',
        x: 420,
        y: 65,
        r: 28,
        papers: [
          '[Core-01] Chen et al. (2025)',
          '[Rel-06] Muller et al. (2023). Why Heatmaps Are Not Enough for Radiologists. Lancet Digital Health.',
          '[Rel-07] Park et al. (2024). Concept Bottleneck Models in Clinical Imaging. NeurIPS.'
        ],
        summary: '單純給出 Grad-CAM 熱區圖不足以說服臨床醫師；必須同時給出「因為觀察到右肺下葉毛玻璃樣陰影 (GGO) 且邊緣分葉，故推論高風險」之結構化概念鏈。'
      },
      {
        id: 'N_RAG',
        label: '臨床指引 RAG 抑制醫學幻覺\n(Guideline-Anchored RAG)',
        shortLabel: 'RAG 幻覺抑制',
        category: 'cat-xai',
        nodeType: '研究方法 (Taxonomy B2)',
        x: 685,
        y: 110,
        r: 27,
        papers: [
          '[Rel-08] Garcia et al. (2024). Grounding Medical LLMs with Fleischner Society Guidelines. JAMIA.',
          '[Rel-09] Tan et al. (2025.01). Detecting Hallucinated Findings in Automated Radiology Reports. ACL Clinical.'
        ],
        summary: '透過檢索增強生成 (RAG) 強制模型在產出診斷建議時，必須引用最新國際臨床指引條文，將虛構病灶描述（幻覺率）由 11.4% 降至 1.8%。'
      },
      {
        id: 'N_SHIFT',
        label: '跨院儀器資料偏移問題\n(Cross-Hospital Domain Shift)',
        shortLabel: '跨院資料偏移',
        category: 'cat-xai',
        nodeType: '研究發現／缺口 (Taxonomy B2)',
        x: 420,
        y: 350,
        r: 27,
        papers: [
          '[Rel-10] O’Connor et al. (2023). External Validation Failure of Chest AI Across 5 Countries. Nature Med.',
          '[Rel-11] Huang et al. (2024). Test-Time Adaptation for Heterogeneous CT Scanners. CVPR.'
        ],
        summary: '多篇文獻指出：在單一醫學中心訓練達 95% 準確率的模型，換到不同廠牌 CT 掃描儀或基層醫院時，準確率平均驟降 12%~18%。'
      },
      {
        id: 'N_TRIAGE',
        label: '急診危急值預警與閱片減負\n(Emergency Triage & Fatigue)',
        shortLabel: '急診檢傷與減負',
        category: 'cat-clinical',
        nodeType: '臨床應用發現 (Taxonomy C1)',
        x: 695,
        y: 265,
        r: 28,
        papers: [
          '[Rel-12] Rossi et al. (2024). Randomized Trial of AI Triage for Pneumothorax in ED. NEJM AI.',
          '[Core-01] Chen et al. (2025)'
        ],
        summary: '隨機臨床試驗顯示，導入 AI 自動檢傷可將氣胸與主動脈剝離之危急通報時間縮短 64%，並減少年輕住院醫師 31% 的夜間閱片漏診率。'
      },
      {
        id: 'N_FED',
        label: '聯邦學習與隱私合規架構\n(Federated Learning)',
        shortLabel: '聯邦學習隱私合規',
        category: 'cat-clinical',
        nodeType: '研究方法 (Taxonomy C2)',
        x: 670,
        y: 410,
        r: 26,
        papers: [
          '[Rel-13] Rieke & Silva (2024). Privacy-Preserving Multi-Institutional Radiology Training. npj Digital Medicine.'
        ],
        summary: '各醫院原始病患影像不出院區，僅加密上傳梯度參數進行聯合訓練，兼顧個資法規 (HIPAA/GDPR) 與多中心樣本多樣性。'
      }
    ],
    edges: [
      // 直接文獻支持關係 (Direct Edges)
      {
        id: 'E1',
        source: 'N_CORE',
        target: 'N_VLM',
        relation: 'uses-method (使用方法)',
        isInference: false,
        papers: '[Core-01] Chen et al. (2025)、[Rel-02] Wang & Patel (2024)',
        explanation: '【文獻直接支持】核心論文直接採用跨模態視覺語言對齊預訓練作為特徵萃取骨幹。'
      },
      {
        id: 'E2',
        source: 'N_CORE',
        target: 'N_XAI',
        relation: 'supports (支持與實證)',
        isInference: false,
        papers: '[Core-01] Chen et al. (2025)、[Rel-07] Park et al. (2024)',
        explanation: '【文獻直接支持】實驗證實同時提供視覺熱區與結構化病理概念，能使放射科醫師對 AI 建議之採納信任度提升 42%。'
      },
      {
        id: 'E3',
        source: 'N_SAM3D',
        target: 'N_CORE',
        relation: 'contains (包含模組)',
        isInference: false,
        papers: '[Rel-04] Zhao et al. (2024)、[Rel-05] Liu et al. (2025.01)',
        explanation: '【文獻直接支持】3D 病灶分割提供精確解剖區域錨點，作為多模態模型局部注意力機制之輸入。'
      },
      {
        id: 'E4',
        source: 'N_RAG',
        target: 'N_XAI',
        relation: 'supports (強化可信度)',
        isInference: false,
        papers: '[Rel-08] Garcia et al. (2024)、[Rel-09] Tan et al. (2025.01)',
        explanation: '【文獻直接支持】透過臨床指引 RAG 錨定，確保模型生成的文字解釋符合學會標準術語，大幅降低虛構推論。'
      },
      {
        id: 'E5',
        source: 'N_CORE',
        target: 'N_TRIAGE',
        relation: 'studies (研究臨床場域)',
        isInference: false,
        papers: '[Core-01] Chen et al. (2025)、[Rel-12] Rossi et al. (2024)',
        explanation: '【文獻直接支持】核心論文與隨機試驗均以急診胸腔危急病灶檢傷作為主要臨床驗證場域。'
      },
      {
        id: 'E6',
        source: 'N_SHIFT',
        target: 'N_CORE',
        relation: 'contrasts-with (挑戰與限制)',
        isInference: false,
        papers: '[Rel-10] O’Connor et al. (2023)、[Rel-11] Huang et al. (2024)',
        explanation: '【文獻直接支持】外部驗證文獻指出，單一中心訓練之大型模型在跨院異質掃描儀下仍存在顯著效能衰退。'
      },
      // 延伸推論關係 (Inference Relationships - 至少 3 條！)
      {
        id: 'INF1',
        source: 'N_FED',
        target: 'N_SHIFT',
        relation: '⚡ 推論 1：緩解跨院偏移 (mitigates-via-inference)',
        isInference: true,
        papers: '推論依據：[Rel-10] 跨院偏移痛點 ＋ [Rel-11] 測試時調適 ＋ [Rel-13] 多中心聯邦學習',
        explanation: '【AI 協助產生・尚待實證之推論關係 #1】\n● 推論邏輯：既然 [Rel-10] 證實單一醫院訓練會因儀器差異產生嚴重 Domain Shift，而 [Rel-13] 聯邦學習可在不違反醫療隱私下納入多國異質掃描儀參數，推論「將聯邦學習結合 [Rel-11] 測試時自動校準（TTA）」將能在合規前提下消除跨院效能落差。目前 13 篇文獻尚未將兩者結合實測，屬高價值研究缺口！'
      },
      {
        id: 'INF2',
        source: 'N_RAG',
        target: 'N_TRIAGE',
        relation: '⚡ 推論 2：降低急診誤報疲勞 (reduces-alert-fatigue)',
        isInference: true,
        papers: '推論依據：[Rel-08, Rel-09] RAG 抑制幻覺 ＋ [Rel-12] 急診檢傷警訊疲勞問題',
        explanation: '【AI 協助產生・尚待實證之推論關係 #2】\n● 推論邏輯：[Rel-12] 提到急診 AI 雖快，但高達 15% 的假陽性預警容易造成值班醫師「警報疲勞 (Alert Fatigue)」；而 [Rel-08/09] 證明臨床指引 RAG 能過濾不合邏輯的幻覺判讀。由此推論：在急診檢傷觸發警報前串接「RAG 臨床指引二次查核閘門」，可望在不延誤危急通報下大幅降低假陽性打擾。'
      },
      {
        id: 'INF3',
        source: 'N_SAM3D',
        target: 'N_XAI',
        relation: '⚡ 推論 3：像素級邊界不確定性轉化為語意信心度',
        isInference: true,
        papers: '推論依據：[Rel-05] 分割邊界不確定性量化 ＋ [Core-01, Rel-07] 結構化概念解釋',
        explanation: '【AI 協助產生・尚待實證之推論關係 #3】\n● 推論邏輯：[Rel-05] 能計算出 3D 結節邊界的像素級不確定性（Uncertainty Map），但未轉化為文字；而 [Core-01] 的語言模型常對模糊病灶給出過度自信的語氣。推論若將「3D 分割邊界熵值」直接注入 VLM 的 Prompt 權重中，能讓 AI 自動產出「邊界模糊建議三個月後追蹤」之審慎臨床表述。'
      }
    ]
  },

  // --------------------------------------------------------------------------
  // 4. 課堂作業六大步驟詳細規格與一鍵複製 AI 協作咒語
  // --------------------------------------------------------------------------
  homeworkSteps: [
    {
      stepNum: 'Step 1',
      badge: '步驟一｜起點錨定',
      title: '選定研究主題與 1 篇「2025 年後」核心論文',
      goal: '找到自己真正想探索的主題，並鎖定一篇 2025/01/01 起正式發表的最新學術論文作為知識圖譜的「核心種子節點」。',
      requirements: [
        '選擇一個自己有興趣的研究主題（越具體越好，避免範圍過大）。',
        '尋找一篇 **2024 年之後（即 2025 年 1 月 1 日起）正式發表的學術論文**，作為核心論文。',
        '下載該篇論文的**完整 PDF 檔案**（不可只有摘要頁或網頁截圖）。',
        '先親自閱讀論文摘要（Abstract），了解研究背景、目的、方法及主要發現。',
        '使用 AI 協助深度整理這篇論文的核心研究問題、方法論與重要概念術語。'
      ],
      pitfall: '⚠️ 注意：「2024 年之後」在作業規範中明確定義為 **2025 年 1 月 1 日起正式發表**！請確認論文上的 Publication Date 為 2025 或 2026 年，並下載完整 PDF。',
      promptTitle: '💬 步驟一 AI 協作參考咒語（上傳核心論文 PDF 後使用）：',
      promptText: `我目前正在進行「AI 輔助系統性文獻回顧與知識圖譜建構」課程作業。
我已上傳我選定的【核心論文 PDF】（發表於 2025 年 1 月 1 日之後）。
請嚴格根據這份 PDF 的實際內容（不可自行編造），幫我整理出：
1. 論文基本資訊（標題、作者、發表期刊/會議、確切發表日期）。
2. 研究背景與欲解決的核心研究問題（Research Questions）。
3. 採用的研究方法、實驗設計與研究對象。
4. 主要研究發現與貢獻（請標註對應原論文頁碼或段落）。
5. 萃取 8~12 個核心概念與關鍵術語（中英對照），並建議我接下來擴展搜尋 12 篇相關論文時，可以使用哪些資料庫查詢關鍵字組合（Boolean Search Strings）？`
    },
    {
      stepNum: 'Step 2',
      badge: '步驟二｜擴展蒐集',
      title: '搜尋 12 篇相關學術論文（湊齊 1+12＝13 篇完整 PDF）',
      goal: '以核心論文為圓心，運用學術資料庫與 AI 工具搜尋 12 篇具高度關聯性的論文，並完整紀錄系統性搜尋軌跡。',
      requirements: [
        '根據核心論文主題，使用 Google Scholar、PubMed、Scopus、Web of Science 等學術資料庫搜尋另外 **12 篇相關論文**。',
        '必須完整記錄：**搜尋使用的資料庫與關鍵字、文獻搜尋日期、文獻納入與排除條件（Inclusion / Exclusion Criteria）、各篇論文與核心主題的關聯性**。',
        '**論文數量硬性要求：1 篇核心論文 ＋ 12 篇相關論文 ＝ 共 13 篇。**',
        '下載全部 **13 篇論文的完整 PDF**，逐一打開確認論文真實存在、內容完整且沒有重複！'
      ],
      pitfall: '⚠️ 嚴禁讓 AI 直接「憑空生出 12 篇參考文獻清單」而不去下載實體 PDF！許多 LLM 會合成看似合理的假論文標題，請務必親自到資料庫下載全部 13 份 PDF 驗明正身。',
      promptTitle: '💬 步驟二 AI 協作參考咒語（建立搜尋紀錄與納入排除表）：',
      promptText: `我的核心論文主題是：「[填入你的研究主題]」，核心研究問題為：「[填入核心問題]」。
我準備在 Google Scholar、Scopus 與 Web of Science 搜尋另外 12 篇相關學術論文，組成共 13 篇的系統性文獻回顧（SLR）。
請協助我設計一份嚴謹的「系統性文獻搜尋紀錄表（Markdown 表格）」，欄位須包含：
1. 搜尋資料庫名稱、精確搜尋關鍵字組合（含 AND/OR）、搜尋日期（YYYY-MM-DD）。
2. 明確的「文獻納入條件（Inclusion Criteria）」與「文獻排除條件（Exclusion Criteria）」。
3. 13 篇論文總表（編號 P01 核心論文 ~ P13 相關論文：作者、年份、標題、來源期刊、PDF 檔名、與核心論文之具體關聯性說明）。`
    },
    {
      stepNum: 'Step 3',
      badge: '步驟三｜系統性整理',
      title: '進行 13 篇系統性文獻分析（嚴禁未查證 AI 幻覺）',
      goal: '透過 AI 批次與交叉閱讀 13 篇 PDF，有系統地提煉每篇的方法、發現，並找出跨文獻的共同點、矛盾差異與研究缺口。',
      requirements: [
        '使用 AI 深入分析這 13 篇學術論文，結構化整理以下 6 大維度：',
        '① 研究目的與研究問題 ｜ ② 研究方法與研究對象 ｜ ③ 核心概念與關鍵術語',
        '④ 主要研究發現 ｜ ⑤ 文獻之間的共同點、差異與研究缺口（Research Gaps） ｜ ⑥ 可建立關聯或進一步推論的知識點',
        '🛡️ **真實查證鐵律**：所有整理內容**必須以實際論文 PDF 內容為依據**，同學必須核對原文，絕對不能直接採用未經查證的 AI 生成資訊！'
      ],
      pitfall: '⚠️ 老師批改重點：步驟三不只是「13 篇各自的摘要剪貼」，更關鍵的是第 5 點「文獻間的共同點、差異（例如 A 論文與 B 論文結果不同）與研究缺口」以及第 6 點「可進一步推論的知識」！',
      promptTitle: '💬 步驟三 AI 協作參考咒語（上傳多篇 PDF 進行跨文獻矩陣分析）：',
      promptText: `我已上傳本組研究的 13 篇學術論文 PDF（P01 為 2025 核心論文，P02~P13 為相關論文）。
請完全依據我上傳的 PDF 實際內容（每一項論述請標註對應論文編號如 [P01, p.4]，嚴禁脫離文本自行推測），幫我完成「系統性文獻回顧綜合分析」：
1. 【13 篇文獻綜合比較矩陣表】：欄位包含「論文編號與作者年份、研究目的與問題、研究方法與對象、核心概念術語、主要研究發現」。
2. 【跨文獻深度綜合分析】：
   - 共同點（Consensus）：哪幾篇論文共同支持了什麼結論？
   - 差異與爭議（Contrasts）：哪幾篇論文在方法或結果上出現分歧或互補？為什麼？
   - 研究缺口（Research Gaps）：綜合這 13 篇文獻，目前還有哪些尚未解決或尚未結合驗證的空白地帶？
   - 潛在推論線索：哪些跨論文的發現可以串聯起來，進行下一步的延伸推論？`
    },
    {
      stepNum: 'Step 4',
      badge: '步驟四｜知識分類學',
      title: '建立分類學架構（Taxonomy：至少 3 大類 × 2 層以上）',
      goal: '將散落在 13 篇論文中的核心概念，收納進具有嚴謹階層與從屬關係的知識分類樹（Taxonomy）。',
      requirements: [
        '針對 13 篇論文萃取出的重要知識，建立有組織的分類架構（Taxonomy）。',
        '分類學應包含：**主題分類（主要知識領域）、次分類（特定研究面向）、核心概念與相關術語、各類別之間的階層或從屬關係**。',
        '**最低硬性要求：至少 3 個主要類別，並具有 2 層以上的分類階層（例如：研究主題 ➔ 3 大主類別 ➔ 各主類別下 2~3 個次分類 ➔ 具體概念術語與對應論文）。**',
        '🚫 **關鍵禁令**：分類架構必須符合研究主題的知識邏輯，**絕對不能只是將 13 篇論文依序排列（例如不能分成「第 1~4 篇、第 5~8 篇、第 9~13 篇」）！**'
      ],
      pitfall: '⚠️ 最常見扣分錯誤：把分類學做成「論文編號清單」！真正的 Taxonomy 是以「領域知識概念」為骨架（例如：模型架構類、臨床解釋類、法規工作流類），每篇論文會跨越多個概念分支。',
      promptTitle: '💬 步驟四 AI 協作參考咒語（建構 3 大類 × 2 層以上 Taxonomy）：',
      promptText: `根據我們在前一步驟從 13 篇論文萃取出的核心概念與關鍵術語，請幫我設計一套符合學術邏輯的「知識分類學（Taxonomy）架構」。
請嚴格遵守以下規範：
1. 必須以「研究主題的知識結構」進行分類，絕對不可只是把 13 篇論文依序排列。
2. 至少包含 3 個「主要類別（Level 1 主題分類）」，每個主要類別下至少包含 2~3 個「次分類（Level 2 特定研究面向）」，並在每個次分類下列出具體的「核心概念與相關術語（Level 3）」，形成清楚的階層與從屬關係（is-a / part-of）。
3. 請為每個概念標註它出自哪幾篇論文（例如 [P01, P04, P09]），並輸出成清楚的樹狀結構與對照表，供後續轉換為知識圖譜顏色分類使用。`
    },
    {
      stepNum: 'Step 5',
      badge: '步驟五｜推論知識圖譜',
      title: '建立具推論能力的知識圖譜（含至少 3 條可溯源推論關係）',
      goal: '將文獻、概念與分類轉換為節點（Nodes）與語意邊（Edges），並根據證據提出至少 3 條合理的延伸推論（Inference Relationships）。',
      requirements: [
        '**1. 節點（Nodes）**：呈現論文、研究主題、研究方法、核心概念、研究發現等知識實體。',
        '**2. 關係（Edges / Relationships）**：明確標示語意關係，例如：`屬於 (is-a)`、`包含 (contains)`、`使用方法 (uses-method)`、`研究對象 (studies)`、`相關於 (related-to)`、`支持或佐證 (supports)`、`與其他研究結果不同 (contrasts-with)`。',
        '**3. 推論關係（Inference Relationships）**：根據文獻證據與已建立關係，提出至少 **3 條可說明推論依據的延伸關係**，每條都必須標示**相關文獻來源**與**推論邏輯**。',
        '🛡️ **嚴格區分鐵律**：必須清楚區分「**文獻直接支持的關係**」與「**AI 協助產生、尚待驗證的推論關係**」，避免將推測當成已證實的研究結論！'
      ],
      pitfall: '⚠️ 步驟五是整份作業的靈魂！請確認圖譜中至少有 3 條明確標示為「推論關係（Inference）」的連線，且點擊或查閱時能看到「因為論文 A 證明了 X，且論文 B 指出 Y，因此我們推論 Z（尚待驗證）」的完整邏輯鏈。',
      promptTitle: '💬 步驟五 AI 協作參考咒語（建立 Nodes、Edges 與 3+ 條推論關係）：',
      promptText: `請根據我們整理的 13 篇論文與 Taxonomy 分類架構，幫我設計「具有推論能力的知識圖譜（Knowledge Graph）」完整資料結構：
1. 【節點清單（Nodes）】：涵蓋核心論文與相關論文、研究主題、研究方法、核心概念、主要研究發現，每個節點標註所屬 Taxonomy 類別與對應論文編號。
2. 【文獻直接支持的關係（Direct Edges）】：使用 is-a（屬於）、contains（包含）、uses-method（使用方法）、studies（研究對象）、related-to（相關於）、supports（支持或佐證）、contrasts-with（與其他研究結果不同）等關係詞連接節點，並標註支持該關係的確切論文編號。
3. 【延伸推論關係（Inference Relationships，至少 3 條）】：請根據現有文獻證據進行跨文獻邏輯推演，提出至少 3 條「文獻尚未直接合併實證、但具高度合理性的延伸推論關係」。每一條推論都必須清楚列出：
   - 推論起點節點 ➔ 推論關係名稱 ➔ 推論終點節點
   - 推論依據的文獻來源組合（例如：結合 [P02] 與 [P11]）
   - 完整推論邏輯說明，並明確標記為「AI 協助產生、尚待驗證的推論關係」。`
    },
    {
      stepNum: 'Step 6',
      badge: '步驟六｜視覺化交付',
      title: '輸出獨立互動網頁 `knowledge_graph.html` 並依規歸檔',
      goal: '將完整分類學、節點、直接關係與推論關係製作成免伺服器、點開即玩的互動式 HTML 知識圖譜，並整理至指定個人資料夾。',
      requirements: [
        '將最終成果輸出為單一檔案 **`knowledge_graph.html`**（不依賴外部後端伺服器，直接雙擊即可於瀏覽器開啟觀看）。',
        '清楚呈現所有節點（Nodes）及節點之間的關係（Edges）。',
        '透過**顏色、標籤或圖例**清楚區分不同的 Taxonomy 分類。',
        '透過**不同線條樣式（如實線 vs. 發光虛線）或標示**，一眼區分「文獻直接關係」與「延伸推論關係」。',
        '具備**點擊查閱功能**：點選節點或關係線時，能查閱對應的論文來源、摘要與推論邏輯。',
        '具備**基本互動功能**：支援畫布縮放（Zoom）、平移拖拽（Pan）、分類篩選或關鍵字搜尋。',
        '📁 **繳交格式**：於課堂指定共用資料夾內，建立以「**學號_姓名_研究主題**」命名的個人資料夾。'
      ],
      pitfall: '⚠️ 繳交前請務必在自己的電腦上「直接雙擊 `knowledge_graph.html`」測試！確認不需要啟動 Python/Node 伺服器就能正常顯示圖譜、切換篩選與點擊查看論文來源。',
      promptTitle: '💬 步驟六 AI 協作參考咒語（一鍵生成免伺服器 `knowledge_graph.html`）：',
      promptText: `請將我們在步驟四與步驟五完成的「Taxonomy 分類架構、13 篇論文清單、知識圖譜節點（Nodes）、文獻直接支持關係（Direct Edges）與至少 3 條推論關係（Inference Relationships）」，完整寫成一個單一、免外部伺服器、可直接於瀏覽器雙擊開啟的互動式網頁檔案 \`knowledge_graph.html\`。

網頁功能與視覺必須包含：
1. 開啟網頁即可直接觀看互動式知識圖譜（可使用內嵌 SVG、Canvas、D3.js CDN 或 Vis-network CDN），支援滑鼠滾輪縮放、拖曳移動節點與畫布重設。
2. 清楚的圖例（Legend）與顏色編碼：依 Taxonomy 的 3 大主要類別與次分類區分節點顏色。
3. 嚴格區分線條樣式：「文獻直接支持的關係」使用實線並標示關係詞（is-a, uses-method, supports, contrasts-with 等）；「AI 協助產生、尚待驗證的推論關係（至少 3 條）」使用醒目的彩色虛線/動畫線條並加上 ⚡ 推論標籤。
4. 互動詳情側邊欄：當使用者點擊任何節點或連線時，右側面板立即顯示該節點/關係的詳細說明、對應的 13 篇論文來源（作者、年份、標題），若為推論關係則完整顯示「推論依據文獻」與「推論邏輯鏈」。
5. 頂部提供「Taxonomy 階層樹狀檢視切換」與「只看推論關係 / 全部顯示」快速篩選按鈕。`
    }
  ]
};
