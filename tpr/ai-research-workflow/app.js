const documents = [
  { id: "manual", category: "core", type: "MD", size: "62 KB", title: "教學實踐研究計畫撰寫教學手冊", description: "從成果網站資料準備、文獻查核到PAVET研究設計的完整16小時教學流程。", file: "files/01-writing-manual.md", readable: true },
  { id: "concept", category: "core", type: "MD", size: "11 KB", title: "教學實踐研究構想", description: "課堂問題發現、研究動機、目的、假設及具體教學介入。", file: "files/02-research-concept.md", readable: true },
  { id: "literature", category: "core", type: "MD", size: "29 KB", title: "AI衝擊與PAVET教學介入：文獻探討", description: "整合AI正負面影響、前後辯證、條件性結論與研究缺口。", file: "files/03-literature-review.md", readable: true },
  { id: "course", category: "core", type: "MD", size: "17 KB", title: "Linux進階課程：18週教學規劃", description: "以容器部署、監控與災難復原為載體的PAVET課程設計。", file: "files/04-course-plan.md", readable: true },
  { id: "method", category: "core", type: "MD", size: "23 KB", title: "研究方法與實施步驟", description: "研究架構、問題、範圍、對象、工具、分析、倫理與18週程序。", file: "files/05-research-method.md", readable: true },
  { id: "outcomes", category: "core", type: "MD", size: "14 KB", title: "預期完成工作項目與成果", description: "教學成果、學生效益指標、公開分享及教學社群貢獻。", file: "files/06-expected-outcomes.md", readable: true },
  { id: "citations", category: "evidence", type: "MD", size: "7 KB", title: "文獻引用查核表", description: "核實作者、年份、題名、來源、DOI及文獻實際支持的主張。", file: "files/07-citation-check.md", readable: true },
  { id: "wos", category: "evidence", type: "MD", size: "15 KB", title: "近10年WoS候選文獻初步盤點", description: "AI、認知卸載、評量效度與工程教育的檢索組塊及候選文獻。", file: "files/08-wos-literature-map.md", readable: true },
  { id: "manifest", category: "evidence", type: "CSV", size: "110 KB", title: "113–114年度工程學門成果清單", description: "235筆成果資料，包含年度、學校、作者、題名、公開狀態與來源。", file: "files/09-tpr-manifest.csv", readable: true },
  { id: "abstracts", category: "evidence", type: "XLSX", size: "440 KB", title: "工程學門成果摘要擷取資料庫", description: "148筆摘要、替代摘錄、頁碼、研究目的、結果及擷取狀態。", file: "files/10-tpr-abstracts.xlsx", readable: false },
  { id: "passport", category: "tool", type: "YAML", size: "8 KB", title: "Linux進階課程 Course Passport", description: "以結構化格式保存學習成果、評量、週次與AI使用政策。", file: "files/11-course-passport.yaml", readable: true },
  { id: "assessment", category: "tool", type: "DOCX", size: "39 KB", title: "評量設計AI可答性檢視", description: "檢查任務是否只需AI代答，並改善可歸因的學生能力證據。", file: "files/12-ai-assessment-review.docx", readable: false },
  { id: "downloader", category: "tool", type: "PY", size: "14 KB", title: "成果報告下載工具", description: "建立完整清單、逐筆下載公開文件、驗證PDF及保存錯誤紀錄。", file: "files/13-download-reports.py", readable: true },
  { id: "extractor", category: "tool", type: "PY", size: "14 KB", title: "成果摘要擷取工具", description: "分級處理正式摘要、目的加結果摘錄、單一章節及擷取失敗。", file: "files/14-extract-abstracts.py", readable: true },
  { id: "audit-input", category: "tool", type: "JSON", size: "4 KB", title: "抗AI評量分析輸入", description: "評量AI可答性檢視所使用的結構化分析資料。", file: "files/15-assessment-input.json", readable: true },
  { id: "validation", category: "tool", type: "JSON", size: "1 KB", title: "評量文件驗證紀錄", description: "DOCX成果產製後的格式與內容驗證摘要。", file: "files/16-assessment-validation.json", readable: true },
  { id: "execution-handout", category: "core", type: "MD", size: "25 KB", title: "執行階段與文章發表講義", description: "從倫理、18週執行、訪談轉寫、因果論述到投稿與AI揭露的完整講義。", file: "files/17-execution-publication-handout.md", readable: true },
  { id: "execution-slides", category: "core", type: "PPTX", size: "11.2 MB", title: "執行階段與文章發表圖文投影片", description: "48頁可編輯投影片，與網站維持一致的研究工作流視覺。", file: "files/18-execution-publication-slides.pptx", readable: false }
];

const grid = document.querySelector("#document-grid");
const emptyState = document.querySelector("#empty-state");
const search = document.querySelector("#search");
const filters = [...document.querySelectorAll(".filter")];
const reader = document.querySelector("#reader");
const readerTitle = document.querySelector("#reader-title");
const readerType = document.querySelector("#reader-type");
const readerContent = document.querySelector("#reader-content");
const readerDownload = document.querySelector("#reader-download");
let activeFilter = "all";

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char]);
}

const sourceLinkMap = {
  "教學實踐研究構想_課堂問題至教學介入.md": "?doc=concept#library",
  "文獻探討_AI衝擊與PAVET教學介入.md": "?doc=literature#library",
  "Linux進階課程_PAVET教學方法與18週課程規劃_草案.md": "?doc=course#library",
  "研究方法與實施步驟_PAVET_Linux進階課程_草案.md": "?doc=method#library",
  "預期完成工作項目與成果_PAVET_Linux進階課程_草案.md": "?doc=outcomes#library",
  "course_passport_linux_advanced_draft.yaml": "files/11-course-passport.yaml",
  "文獻探討_引用查核表.md": "?doc=citations#library",
  "download_tpr_engineering_reports.py": "files/13-download-reports.py",
  "extract_tpr_abstracts.py": "files/14-extract-abstracts.py",
  "成果清單.csv": "files/09-tpr-manifest.csv",
  "tpr_工程學門_113-114_摘要擷取.xlsx": "files/10-tpr-abstracts.xlsx",
  "近10年WoS_AI與評量真實性_初步文獻盤點.md": "?doc=wos#library"
};

function resolveMarkdownLink(href) {
  if (/^(https?:|mailto:|#)/.test(href)) return href;
  const base = href.split("/").pop();
  return sourceLinkMap[base] || href;
}

function renderDocuments() {
  const query = search.value.trim().toLowerCase();
  const visible = documents.filter(doc => {
    const categoryMatch = activeFilter === "all" || doc.category === activeFilter;
    const textMatch = `${doc.title} ${doc.description} ${doc.type}`.toLowerCase().includes(query);
    return categoryMatch && textMatch;
  });
  grid.innerHTML = visible.map(doc => `
    <article class="document-card">
      <div class="document-meta"><span class="file-type">${doc.type}</span><span>${doc.size}</span></div>
      <h3>${escapeHtml(doc.title)}</h3>
      <p>${escapeHtml(doc.description)}</p>
      <div class="document-actions">
        ${doc.readable ? `<button data-open-doc="${doc.id}">開啟閱讀</button>` : `<a href="${doc.file}" download>下載並開啟</a>`}
        <a href="${doc.file}" download>下載原檔</a>
      </div>
    </article>`).join("");
  emptyState.hidden = visible.length > 0;
}

filters.forEach(button => button.addEventListener("click", () => {
  filters.forEach(item => item.classList.remove("active"));
  button.classList.add("active");
  activeFilter = button.dataset.filter;
  renderDocuments();
}));
search.addEventListener("input", renderDocuments);

function inlineMarkup(text) {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) =>
      '<a href="' + escapeHtml(resolveMarkdownLink(href)) + '" target="_blank" rel="noopener">' + label + '</a>');
}

function parseTable(lines) {
  const rows = lines.map(line => line.trim().replace(/^\||\|$/g, "").split("|").map(cell => inlineMarkup(cell.trim())));
  const header = rows[0] || [];
  const body = rows.slice(2);
  return `<table><thead><tr>${header.map(cell => `<th>${cell}</th>`).join("")}</tr></thead><tbody>${body.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
}

function renderMarkdown(markdown) {
  const lines = markdown.replace(/\r/g, "").split("\n");
  const output = [];
  let paragraph = [];
  let listType = null;
  let listItems = [];
  let inCode = false;
  let code = [];

  const flushParagraph = () => {
    if (paragraph.length) output.push(`<p>${inlineMarkup(paragraph.join(" "))}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (listItems.length) output.push(`<${listType}>${listItems.map(item => `<li>${inlineMarkup(item)}</li>`).join("")}</${listType}>`);
    listItems = [];
    listType = null;
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (line.startsWith("```")) {
      flushParagraph(); flushList();
      if (inCode) { output.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`); code = []; }
      inCode = !inCode;
      continue;
    }
    if (inCode) { code.push(line); continue; }
    if (/^\|.*\|\s*$/.test(line) && i + 1 < lines.length && /^\|?\s*:?-+/.test(lines[i + 1])) {
      flushParagraph(); flushList();
      const tableLines = [line, lines[i + 1]];
      i += 2;
      while (i < lines.length && /^\|.*\|\s*$/.test(lines[i])) { tableLines.push(lines[i]); i += 1; }
      i -= 1;
      output.push(parseTable(tableLines));
      continue;
    }
    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      flushParagraph(); flushList();
      const level = heading[1].length;
      output.push(`<h${level}>${inlineMarkup(heading[2])}</h${level}>`);
      continue;
    }
    const unordered = line.match(/^\s*[-*]\s+(.+)$/);
    const ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (unordered || ordered) {
      flushParagraph();
      const nextType = unordered ? "ul" : "ol";
      if (listType && listType !== nextType) flushList();
      listType = nextType;
      listItems.push((unordered || ordered)[1]);
      continue;
    }
    if (line.startsWith("> ")) {
      flushParagraph(); flushList();
      output.push(`<blockquote>${inlineMarkup(line.slice(2))}</blockquote>`);
      continue;
    }
    if (/^---+$/.test(line.trim())) {
      flushParagraph(); flushList(); output.push("<hr>"); continue;
    }
    if (!line.trim()) { flushParagraph(); flushList(); continue; }
    paragraph.push(line.trim());
  }
  flushParagraph(); flushList();
  if (inCode && code.length) output.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
  return `<article>${output.join("\n")}</article>`;
}

function parseCsv(text) {
  const rows = [];
  let row = [], field = "", quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') { field += '"'; i += 1; }
      else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") { row.push(field); field = ""; }
    else if (char === "\n") { row.push(field.replace(/\r$/, "")); rows.push(row); row = []; field = ""; }
    else field += char;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function renderCsv(text) {
  const rows = parseCsv(text);
  const limit = 100;
  const header = rows[0] || [];
  const body = rows.slice(1, limit + 1);
  const headHtml = header.map(cell => "<th>" + escapeHtml(cell) + "</th>").join("");
  const bodyHtml = body.map(row => "<tr>" + row.map(cell => "<td>" + escapeHtml(cell) + "</td>").join("") + "</tr>").join("");
  return '<article class="csv-table"><p class="data-note">網頁預覽前 ' +
    Math.min(limit, Math.max(rows.length - 1, 0)) + " 筆；完整資料共 " +
    Math.max(rows.length - 1, 0) +
    ' 筆，請下載原始CSV。</p><table><thead><tr>' + headHtml +
    "</tr></thead><tbody>" + bodyHtml + "</tbody></table></article>";
}

function renderPlainText(text, type) {
  const label = type === "PY" ? "Python程式碼" : type + "原始內容";
  return '<article><p class="data-note">' + label +
    '；可使用右上角下載原檔。</p><pre class="plain-file"><code>' +
    escapeHtml(text) + "</code></pre></article>";
}

async function openDocument(id, updateUrl = true) {
  const doc = documents.find(item => item.id === id);
  if (!doc || !doc.readable) return;
  readerTitle.textContent = doc.title;
  readerType.textContent = `${doc.type} · ${doc.size}`;
  readerDownload.href = doc.file;
  readerContent.innerHTML = '<p class="reader-loading">正在載入文件…</p>';
  if (!reader.open) reader.showModal();
  if (updateUrl && location.protocol !== "file:") history.replaceState(null, "", `?doc=${encodeURIComponent(doc.id)}#library`);
  try {
    let text = window.localDocumentContent?.[doc.file];
    if (typeof text !== "string" && location.protocol !== "file:") {
      const response = await fetch(doc.file);
      if (!response.ok) throw new Error("load failed");
      text = await response.text();
    }
    if (typeof text !== "string") throw new Error("content unavailable");
    readerContent.innerHTML = doc.type === "MD" ? renderMarkdown(text)
      : doc.type === "CSV" ? renderCsv(text)
      : renderPlainText(text, doc.type);
    readerContent.scrollTop = 0;
  } catch {
    readerContent.innerHTML = '<p class="reader-error">文件暫時無法載入，請使用「下載原檔」。</p>';
  }
}

document.addEventListener("click", event => {
  const target = event.target.closest("[data-open-doc]");
  if (target) openDocument(target.dataset.openDoc);
});
document.querySelector("#reader-close").addEventListener("click", () => reader.close());
reader.addEventListener("click", event => { if (event.target === reader) reader.close(); });
reader.addEventListener("close", () => {
  if (location.protocol !== "file:") {
    const url = new URL(location.href);
    url.searchParams.delete("doc");
    history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }
});

renderDocuments();
if (location.protocol === "file:") document.querySelector("#local-mode").hidden = false;
const initialDoc = new URLSearchParams(location.search).get("doc");
if (initialDoc) openDocument(initialDoc, false);
