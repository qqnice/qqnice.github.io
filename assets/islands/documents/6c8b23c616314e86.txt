# 近十年 WoS：生成式 AI、真實學習與評量效度之初步文獻盤點

更新日期：2026-10-02  
建議檢索期間：2016-01-01 至 2026-10-02

## 查詢狀態與限制

目前 Web of Science Core Collection 頁面要求個人或機構登入，因此本輪未能在 WoS 介面完成逐筆收錄查核，也不把一般網路搜尋宣稱為 WoS 檢索結果。

本文件是「WoS 候選核心文獻」：題名、作者、年份、期刊／會議及 DOI 已優先由出版商、期刊官網或 DOI 原始頁面核實。待取得 WoS 權限後，仍須逐筆補查 Accession Number、索引別與最終檢索筆數。

## 建議的研究主題界定

研究重點不宜只寫成「AI 對學生的負面影響」，較精確的主題是：

> 在允許使用生成式 AI 的技術實作課程中，AI 如何改變學生與機器之間的認知分工；教師又如何透過歷程、驗證、解釋、除錯、保留與遷移證據，辨識學生的真實學習。

核心概念鏈：

`AI 使用型態 → 認知卸載／自我調節／驗證行為 → 當下任務表現 → 撤除 AI 後的保留與遷移`

建議納入的調節因素：先備能力、任務複雜度、時間壓力、精熟／完成導向，以及 AI 是否設有教學護欄。

## 可直接貼入 WoS Advanced Search 的檢索式

### A. 生成式 AI、學習與評量

```text
TS=(("generative AI" OR GenAI OR ChatGPT OR "large language model*" OR LLM*)
AND (student* OR learner* OR universit* OR "higher education")
AND (learn* OR assessment OR "learning outcome*" OR retention OR transfer OR metacognit*))
AND PY=(2022-2026)
```

### B. 過度依賴、認知卸載與驗證

```text
TS=(("cognitive offload*" OR overreliance OR "over-reliance" OR dependenc* OR
"automation bias" OR "algorithm appreciation" OR "metacognitive laziness" OR
"self-regulated learning" OR "cognitive forcing")
AND (AI OR algorithm* OR chatbot* OR "large language model*"))
AND PY=(2016-2026)
```

### C. 評量效度、真實評量與學習證據

```text
TS=(("assessment valid*" OR "assessment integrity" OR "authentic assessment" OR
"evaluative judg*" OR "process evidence" OR "oral assessment" OR viva OR
"learning transfer" OR retention)
AND (universit* OR "higher education" OR engineering OR computing OR programming))
AND PY=(2016-2026)
```

### D. 程式設計、工程與 AI 程式助理

```text
TS=(("AI code generator*" OR "AI coding assistant*" OR Copilot OR ChatGPT OR
"large language model*")
AND ("programming education" OR "computer science education" OR engineering OR
programming OR coding)
AND (learn* OR debug* OR verif* OR explain* OR transfer OR assessment OR retention))
AND PY=(2022-2026)
```

正式檢索時建議限定：Web of Science Core Collection；索引 SSCI、SCI-EXPANDED、ESCI、CPCI-S／CPCI-SSH；Document Types 為 Article、Review、Proceedings Paper；語言先納入 English，中文研究另行補充。

## 建議納入與排除準則

納入：

- 研究學生或學習者使用 AI、LLM、程式助理的行為與學習。
- 至少測量一種真實學習證據：無輔助後測、延宕保留、遷移、概念理解、解釋、除錯、驗證、歷程資料或後設認知校準。
- 研究 AI 對評量效度、真實評量或學術誠信的影響。
- 能提供可轉用於 Linux、雲端、網路或程式設計課程的評量設計。

排除或另列：

- 只比較 AI 能不能答對考題，卻沒有學生學習資料的研究。
- 只調查滿意度、使用意願或自陳學習，沒有能力證據的研究。
- 純演算法效能或 AI 文字偵測模型開發，且未連結教育評量。
- 尚無同儕審查版本的預印本；若主題新穎可列為追蹤文獻，但不得與正式論文混列。

## 已核實的核心候選文獻

| 年份 | 文獻 | 類型與主要結果 | 對本研究的用途 | DOI／原始來源 |
|---|---|---|---|---|
| 2016 | Risko & Gilbert, *Cognitive Offloading* | 理論綜述；認知卸載受任務需求與個人後設認知判斷影響，而這些判斷可能有誤。 | 建立「把思考交給 AI」的理論基礎。 | [10.1016/j.tics.2016.07.002](https://doi.org/10.1016/j.tics.2016.07.002) |
| 2018 | Villarroel et al., *Authentic assessment: Creating a blueprint for course design* | 系統性回顧，提出真實評量的三個核心面向：真實性、認知挑戰與評價判斷。 | 建立雲端／Linux 擬真任務，但提醒真實情境本身還不足以證明個人理解。 | [10.1080/02602938.2017.1412396](https://doi.org/10.1080/02602938.2017.1412396) |
| 2018 | Tai et al., *Developing evaluative judgement* | 將 evaluative judgement 定義為判斷自己與他人作品品質的能力。 | 可把「驗證 AI 答案」界定為應培養與評量的能力。 | [10.1007/s10734-017-0220-3](https://doi.org/10.1007/s10734-017-0220-3) |
| 2019 | Bretag et al., *Contract cheating and assessment design* | 14,086 名學生、1,147 名教師；不同任務設計與外包風險相關。 | 說明問題並非始於 ChatGPT；單一成品式評量原本就有學習證據不足的弱點。 | [10.1080/02602938.2018.1527892](https://doi.org/10.1080/02602938.2018.1527892) |
| 2019 | Deslauriers et al., *Measuring actual learning versus feeling of learning* | 控制研究顯示「感覺學到」與「實際學到」可能呈反向關係。 | 支持區分學生自陳、作業順利程度與客觀學習成效。 | [10.1073/pnas.1821936116](https://doi.org/10.1073/pnas.1821936116) |
| 2021 | Buçinca, Malaya, & Gajos, *To Trust or to Think* | N=199；要求使用者先思考或延遲觀看 AI 建議的 cognitive forcing 可降低錯誤依賴，但使用者主觀偏好較低。 | 可轉化為「先預測、先診斷、先提交理由，再開放 AI」的評量介入。 | [10.1145/3449287](https://doi.org/10.1145/3449287) |
| 2023 | Kasneci et al., *ChatGPT for good?* | 跨領域評論，整理 LLM 在教育的機會、錯誤、偏誤、依賴與 AI literacy 問題。 | 作為生成式 AI 教育研究的總體背景，不當作單獨效果證據。 | [10.1016/j.lindif.2023.102274](https://doi.org/10.1016/j.lindif.2023.102274) |
| 2023 | Nikolic et al., *ChatGPT versus engineering education assessment* | 多校、多工程領域基準測試，顯示多種既有工程評量可被 ChatGPT 回答。 | 直接支持工程課程的評量脆弱性與重新設計需求。 | [10.1080/03043797.2023.2213169](https://doi.org/10.1080/03043797.2023.2213169) |
| 2023 | Kazemitabaar et al., *Studying the effect of AI Code Generators on Supporting Novice Learners in Introductory Programming* | 69 名初學者；AI 提高寫碼完成率與成績，未顯著降低一週後保留測驗，但效果受先備能力與使用策略影響。 | 提供「生成程式」與「修改程式」分開評量，以及延宕測驗的做法。 | [10.1145/3544548.3580919](https://doi.org/10.1145/3544548.3580919) |
| 2023 | Weber-Wulff et al., *Testing of detection tools for AI-generated text* | 測試 14 種工具與兩種商用系統；結論是偵測結果不夠準確、可靠，改寫後更差。 | 支持不把 AI 偵測器當成學生能力或違規的主要證據。 | [10.1007/s40979-023-00146-z](https://doi.org/10.1007/s40979-023-00146-z) |
| 2024 | Zhai, Wibowo, & Li, *The effects of over-reliance on AI dialogue systems on students' cognitive abilities* | PRISMA 系統性回顧，納入四資料庫 14 篇，聚焦決策、批判思考與分析推理。 | 用於界定「過度依賴」及其認知影響，但需注意原始研究數量仍有限。 | [10.1186/s40561-024-00316-7](https://doi.org/10.1186/s40561-024-00316-7) |
| 2024 | Stadler, Bannert, & Sailer, *Cognitive ease at a cost* | 91 名大學生隨機使用 ChatGPT 或 Google；LLM 組認知負荷較低，但最終論證與理由品質較差。 | 直接支持「更省力不一定學得更深」。 | [10.1016/j.chb.2024.108386](https://doi.org/10.1016/j.chb.2024.108386) |
| 2024 | Sun et al., *Would ChatGPT-facilitated programming mode impact college students’ programming behaviors, performances, and perceptions?* | 82 名大學生準實驗；AI 組複製貼上、除錯與讀取回饋較多，但兩組程式表現無顯著差異。 | 提供程式互動歷程編碼與「行為不同但成績相近」的證據。 | [10.1186/s41239-024-00446-5](https://doi.org/10.1186/s41239-024-00446-5) |
| 2024 | Scarfe et al., *A real-world test of artificial intelligence infiltration of a university examinations system* | 將 AI 生成答案盲投至真實評分流程；94% 未被辨識，且平均分數高於真實學生。 | 顯示教師直覺與成品評分不能可靠判斷作者或能力。 | [10.1371/journal.pone.0305354](https://doi.org/10.1371/journal.pone.0305354) |
| 2024 | Kazemitabaar et al., *CodeAid* | 700 人、12 週、約 8,000 次使用；系統提供概念、偽碼、逐行解釋與錯誤提示，但避免直接給完整答案。 | 是「允許 AI，但限制直接代答」的可操作工具設計範例。 | [10.1145/3613904.3642773](https://doi.org/10.1145/3613904.3642773) |
| 2025 | Fan et al., *Beware of metacognitive laziness* | 117 名大學生；ChatGPT 組文章改善較多，但知識增益與遷移未顯著較佳，且自我調節歷程改變。 | 最貼近「作業變好，但學生未必進步」的實證。 | [10.1111/bjet.13544](https://doi.org/10.1111/bjet.13544) |
| 2025 | Bastani et al., *Generative AI without guardrails can harm learning* | 近千名高中生隨機實驗；一般 GPT 提高練習表現 48%，但撤除 AI 後考試低於控制組 17%；有教學護欄版本大幅減輕傷害。 | 是本研究最重要的因果證據：必須同時測量 AI 在場表現與 AI 不在場能力。 | [10.1073/pnas.2422633122](https://doi.org/10.1073/pnas.2422633122) |
| 2025 | Kestin et al., *AI tutoring outperforms in-class active learning* | 194 名大學生、交叉隨機試驗；精心設計且具教學鷹架的 AI tutor 在兩個物理單元產生較高即時學習增益。 | 提供反例：問題不是 AI 必然傷害學習，而是無護欄、答案型使用與錯誤的認知分工。 | [10.1038/s41598-025-97652-6](https://doi.org/10.1038/s41598-025-97652-6) |
| 2025 | Kofinas, Tsay, & Pike, *The impact of generative AI on academic integrity of authentic assessments* | 實驗顯示教師不易辨識 AI 介入，且單靠 authentic assessment 仍不能保障評量真實性。 | 支持從成品轉向同步、互動、歷程與個別表現證據。 | [10.1111/bjet.13585](https://doi.org/10.1111/bjet.13585) |
| 2026 | Liu, Fan, & Pan, *Tool, tutor, or crutch?* | 程式教育質性研究；提出 Domain Mastery 與 Tool Mastery、Scaffolding Loop 與 Offloading Loop，並觀察「信任但無法驗證」與後設認知失準。 | 與 Linux／雲端課程最相近，可直接轉用互動紀錄、概念圖、訪談、驗證日誌與 AI 漸退。 | [10.1186/s40594-025-00592-w](https://doi.org/10.1186/s40594-025-00592-w) |

## 2026 年值得追蹤、但須登入 WoS 再確認收錄狀態

- Mohamed & Temimi, *Assessment design under imperfect information: generative AI, disclosure, and student response in higher education*. [10.1080/02602938.2026.2729791](https://doi.org/10.1080/02602938.2026.2729791)
- Ebrahimzadeh, Shibani, & Buckingham Shum, *Coauthorship Integrity: Reconceptualizing Assessment Validity for the Age of Generative AI*. [10.1016/j.caeai.2026.100609](https://doi.org/10.1016/j.caeai.2026.100609)
- Nakamura, *Augmentation or Erosion? Regulating Cognitive Offloading in Generative AI-Supported STEM Learning*. [10.1007/s10648-026-10224-6](https://doi.org/10.1007/s10648-026-10224-6)

## 初步綜合結論

1. **完成表現與學習已經脫鉤。** AI 可以提高答案品質、完成率與速度，但這些指標不能單獨代表知識增益、保留或遷移。
2. **學生的主觀感受也不可靠。** 任務變容易、作品變好，可能同時讓學生高估理解程度。
3. **AI 不是單一處理條件。** 無限制答案型 ChatGPT、蘇格拉底式提示、限制直接代答的程式助理，以及精心設計的 AI tutor，會產生不同結果。
4. **偵測作者不是穩定解法。** AI 偵測器、教師直覺與單一成品都不足以判斷學生是否理解。
5. **最有前景的是讓判斷可見。** 先作答再看 AI、要求驗證、錯誤診斷、口頭說明、變式任務、撤除 AI 的延宕測驗，以及互動歷程分析，皆比單純禁止或偵測更符合研究問題。

## 可發展的研究問題與假設

### 研究問題

- RQ1：開放生成式 AI 是否提高 Linux／雲端任務的當下完成表現，但不一定提高撤除 AI 後的保留與遷移？
- RQ2：加入「先判斷、再詢問、必須驗證與解釋」的認知迫使措施，能否降低答案型依賴？
- RQ3：哪些互動歷程能預測真實能力：直接索取答案、概念提問、錯誤診斷、驗證、修改或反駁 AI？
- RQ4：先備能力、時間壓力及任務複雜度，是否會改變 AI 由鷹架轉為拐杖的機率？
- RQ5：學生自評能力與獨立操作能力之間的校準程度，是否受到 AI 使用型態影響？

### 建議假設

- H1：無護欄 AI 組的 AI 在場任務分數高於控制組。
- H2：無護欄 AI 組在撤除 AI 後的變式遷移分數低於有護欄 AI 組。
- H3：有護欄 AI 組的驗證、解釋與錯誤診斷行為多於無護欄 AI 組。
- H4：驗證與解釋行為會中介「AI 使用條件」與「獨立遷移能力」之間的關係。
- H5：低先備能力與高時間壓力會強化直接索取答案及未驗證接受的行為。

## 最適合雲端／Linux 課程的三組實驗條件

1. **AI 開放、無護欄組**：可自由詢問並貼上指令。
2. **AI 開放、證據鏈組**：先提交診斷，之後才能使用 AI；必須留下提示、修改、驗證與理由。
3. **AI 暫停組**：可查一般教材／網路，但核心變式題與口頭解釋階段不得使用 AI。

主要依變項不使用「有沒有完成」單一指標，而是：

- 任務成功率與完成時間。
- AI 撤除後的近遷移與遠遷移。
- 故障定位、驗證指令及錯誤修正品質。
- 對關鍵命令、權限、服務與網路設定的口頭解釋。
- AI 對話中生成答案、理解、驗證、除錯、反駁與修改的比例。
- 自評能力與實際獨立能力的校準誤差。

## 待完成的 WoS 正式步驟

1. 使用機構帳號登入 Web of Science Core Collection。
2. 分別執行 A–D 四組檢索，不立即合併，以保留不同理論脈絡。
3. 匯出 Full Record and Cited References，格式選 Excel 或 Tab-delimited，另存 RIS 供 Zotero／EndNote。
4. 對本表文獻逐筆核對 WoS Accession Number 與索引別。
5. 去重後進行標題／摘要雙階段篩選，記錄排除理由。
6. 建立 PRISMA 流程與文獻編碼表，再進行主題統整。
