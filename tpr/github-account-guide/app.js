/**
 * GitHub 帳號申請與兩階段驗證（2FA）互動教學指南
 * 依據《GitHub帳號申請與兩階段驗證手冊.md》與 GitHub 官方文件製作
 * 核對日期：2026 年 10 月 26 日
 * 零資料收集：本腳本僅在瀏覽器本機 localStorage 記錄步驟勾選狀態，不收集任何個人輸入。
 */

const STORAGE_KEY = 'github_guide_antigravity_progress_v1';

// ==================== 0. 申請前準備（4 項） ====================
const PREP_ITEMS = [
  {
    id: 'prep-1',
    tag: '準備 1 · 年齡與帳號獨立',
    title: '確認年齡（至少 13 歲）且一人一號',
    desc: 'GitHub 的服務條款要求用戶至少 13 歲；美國以外地區若法律有更高的最低年齡，也須遵守。每人使用自己的個人帳號，不與同學或他人共用登入。學校或機構配發的 Enterprise Managed User (EMU) 帳號，請直接依管理員指示登入。',
    links: [
      { label: '來源：GitHub 服務條款', url: 'https://docs.github.com/en/site-policy/github-terms/github-terms-of-service' }
    ]
  },
  {
    id: 'prep-2',
    tag: '準備 2 · 電子郵件信箱',
    title: '準備可長期收信的有效電子郵件',
    desc: '註冊時須提供有效信箱。絕對不要使用到期即失效的「臨時信箱 / 拋棄式信箱」，因為 GitHub 不接受其驗證。若使用學校信箱，請考慮畢業或離職後是否還能收信（信箱日後可在設定中新增或更換主要信箱）。',
    links: [
      { label: '來源：建立帳號', url: 'https://docs.github.com/en/account-and-profile/how-tos/account-management/creating-an-account-on-github' },
      { label: '來源：信箱驗證疑難排解', url: 'https://docs.github.com/en/account-and-profile/how-tos/email-preferences/troubleshooting-email-verification' }
    ]
  },
  {
    id: 'prep-3',
    tag: '準備 3 · 驗證器與密碼管理',
    title: '準備可安裝驗證器的手機（或可使用 TOTP 的電腦）',
    desc: '建議準備智慧型手機安裝 TOTP 驗證器 App（如 Google Authenticator），並同時準備安全的密碼管理工具，用來保存密碼和 2FA 復原碼（Recovery codes）。在學校電腦教室等公用電腦操作時，切記避免將復原碼留在「下載」資料夾。',
    links: [
      { label: '來源：設定 2FA', url: 'https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/configuring-two-factor-authentication' },
      { label: '來源：復原方法', url: 'https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/configuring-two-factor-authentication-recovery-methods' }
    ]
  },
  {
    id: 'prep-4',
    tag: '準備 4 · 瀏覽器環境',
    title: '確認瀏覽器已開啟 JavaScript',
    desc: '目前的 GitHub 官方註冊頁（https://github.com/signup）需要啟用 JavaScript 才能正常載入表單與真人驗證挑戰。請使用最新版 Chrome、Edge、Firefox 或 Safari 一般視窗操作。',
    links: [
      { label: '實際註冊頁：github.com/signup', url: 'https://github.com/signup' }
    ]
  }
];

// ==================== 1. 第一部分：申請 GitHub 個人帳號（10 步驟） ====================
const SIGNUP_STEPS = [
  {
    id: 'signup-1',
    num: 1,
    shortTitle: '開啟真正的 GitHub 註冊頁',
    title: '步驟 1：開啟真正的 GitHub 官方註冊頁',
    summary: '在瀏覽器網址列輸入 https://github.com/signup，或從 GitHub 首頁右上方按 Sign up。輸入任何資料前，請先核對網址網域確實是 github.com。',
    bullets: [
      '目前官方註冊頁面的網頁標題為 <code>Create your free account</code>，表單區標題為 <code>Sign up for GitHub</code>。',
      '也可以先開啟 <a href="https://github.com/" target="_blank" rel="noopener noreferrer">GitHub 首頁 (https://github.com/) ↗</a>，再點選右上方的 <strong>Sign up</strong> 按鈕。',
      '<strong>已有帳號免重複註冊：</strong>若瀏覽器已登入既有帳號，點開註冊連結會直接帶回帳號首頁；學生不必為了不同課程再建立第二個個人帳號。'
    ],
    uiTerms: ['https://github.com/signup', 'Create your free account', 'Sign up for GitHub', 'Sign up'],
    calloutType: 'warning',
    calloutTitle: '防釣魚與界面變動提醒',
    calloutText: '請認明網址列為 https://github.com/signup。GitHub 實際畫面排版與配色可能因時地或實驗版本調整，請以當時官方頁面上的英文字樣（Sign up for GitHub）為準。',
    visualHtml: `
      <div class="static-ui-diagram" aria-label="唯讀示意：GitHub 註冊頁網址與標題對照">
        <div class="static-ui-title">瀏覽器網址與標題核對（唯讀示意，非輸入表單）</div>
        <div class="static-field-row">
          <span class="static-field-label">網址列 (URL)</span>
          <div class="static-field-box"><span>🔒 https://github.com/signup</span><span>官方網域</span></div>
        </div>
        <div class="static-field-row">
          <span class="static-field-label">頁面主標題 / 表單區標題</span>
          <div class="static-field-box"><span>Create your free account / Sign up for GitHub</span></div>
        </div>
      </div>
    `,
    links: [
      { label: '實際註冊頁 (github.com/signup)', url: 'https://github.com/signup' },
      { label: 'GitHub 首頁', url: 'https://github.com/' },
      { label: '來源：服務條款', url: 'https://docs.github.com/en/site-policy/github-terms/github-terms-of-service' }
    ]
  },
  {
    id: 'signup-2',
    num: 2,
    shortTitle: '選擇註冊方式（表單／社群）',
    title: '步驟 2：選擇註冊方式（Email＋密碼表單 或 Google/Apple）',
    summary: '本教學以最通用的「直接填寫下方 Email、Password、Username 表單」為主要示範；畫面上方另有 Continue with Google 與 Continue with Apple。',
    bullets: [
      '<strong>方式 A（推薦課堂統一教學）：</strong>直接往下填寫表單中的 <code>Email</code>、<code>Password</code>、<code>Username</code>。',
      '<strong>方式 B（社群帳號快速連動）：</strong>點選畫面上方的 <code>Continue with Google</code> 或 <code>Continue with Apple</code>，依授權畫面與後續個人帳號設定完成（iOS 用戶即使開啟 Apple「隱藏我的電子郵件」仍會建立新 GitHub 帳號）。',
      '若已經擁有 GitHub 帳號，請點選右上角或提示文字中的 <code>Sign in</code> 直接登入。'
    ],
    uiTerms: ['Continue with Google', 'Continue with Apple', 'Sign in', 'Email / Password / Username'],
    calloutType: 'warning',
    calloutTitle: '課堂教學建議',
    calloutText: '若學生使用學校電腦教室公用電腦，直接填寫「Email＋密碼」比在公用瀏覽器登入整個私人 Google / Apple 帳號更容易控制登出與安全。',
    visualHtml: `
      <div class="static-ui-diagram" aria-label="唯讀示意：GitHub 註冊方式選擇區塊">
        <div class="static-ui-title">Sign up for GitHub 註冊入口結構（唯讀示意）</div>
        <div class="static-field-row">
          <div class="static-field-box"><span>[G] Continue with Google</span><span>社群註冊選項</span></div>
        </div>
        <div class="static-field-row">
          <div class="static-field-box"><span>[] Continue with Apple</span><span>社群註冊選項</span></div>
        </div>
        <div style="text-align:center; color:#57606a; font-size:0.78rem; margin:6px 0;">— or 填寫下方表單（本手冊主要示範）—</div>
        <div class="static-field-box"><span>Email* / Password* / Username*</span><span>標準表單</span></div>
      </div>
    `,
    links: [
      { label: '實際註冊頁', url: 'https://github.com/signup' },
      { label: '來源：建立帳號 (GitHub Docs)', url: 'https://docs.github.com/en/account-and-profile/how-tos/account-management/creating-an-account-on-github' }
    ]
  },
  {
    id: 'signup-3',
    num: 3,
    shortTitle: '輸入 Email 電子郵件',
    title: '步驟 3：輸入 Email（確認可收信且未重複綁定）',
    summary: '在 Email 欄輸入能立即收到 GitHub 驗證信的電子郵件地址，並仔細檢查拼字是否正確。',
    bullets: [
      '<strong>檢查拼字與收信權限：</strong>確認 <code>@</code> 前後網域沒有打錯（例如 <code>gmail.com</code> 不要誤打成 <code>gamil.com</code>），且不要使用臨時信箱。',
      '<strong>若提示信箱已被使用（Email is already taken / in use）：</strong>代表您過去可能已註冊過 GitHub！請先嘗試登入或重設原帳號密碼；同一個信箱不能同時關聯到兩個個人帳號。',
      '<strong>畢業換信箱免擔心：</strong>信箱之後隨時可在 GitHub <code>Settings → Emails</code> 中新增備用信箱或更換主要信箱（Primary email），不必因學校信箱將來可能失效而重建新帳號。'
    ],
    uiTerms: ['Email', 'Primary email', 'Settings > Emails'],
    calloutType: 'warning',
    calloutTitle: 'Enterprise Managed User (EMU) 特別注意',
    calloutText: '如果您的學校信箱已被機構用於「受管使用者帳號（Enterprise Managed User）」，GitHub 官方說明指出該信箱無法再用來註冊新的個人帳號，請改用個人常用信箱。',
    visualHtml: `
      <div class="static-ui-diagram" aria-label="唯讀示意：Email 欄位填寫說明">
        <div class="static-ui-title">表單欄位對照：Email（唯讀示意，請勿在此輸入）</div>
        <div class="static-field-row">
          <span class="static-field-label">Email *</span>
          <div class="static-field-box"><span>student.example@mail.edu.tw</span><span>範例格式</span></div>
        </div>
        <div style="font-size:0.78rem; color:#424a53;">✔ 需能立即收信驗證 · ✖ 禁用臨時拋棄式信箱 · ✔ 日後可於 Settings 更換主信箱</div>
      </div>
    `,
    links: [
      { label: '來源：信箱已被使用排解', url: 'https://docs.github.com/en/account-and-profile/how-tos/email-preferences/troubleshooting-adding-an-email' },
      { label: '來源：更換主要信箱', url: 'https://docs.github.com/en/account-and-profile/how-tos/email-preferences/changing-your-primary-email-address' }
    ]
  },
  {
    id: 'signup-4',
    num: 4,
    shortTitle: '設定 Password 高強度密碼',
    title: '步驟 4：設定 Password（符合長度與強度規則）',
    summary: '在 Password 欄設定專屬於自己 GitHub 帳號的獨特密碼，並立即存入自己的密碼管理工具。',
    bullets: [
      '<strong>目前 GitHub 註冊頁密碼規則（二擇一）：</strong><br>① <strong>至少 15 個字元</strong>（不限字元組合）；或<br>② <strong>至少 8 個字元，且同時包含「數字」與「小寫英文字母」</strong>。',
      '<strong>安全建議：</strong>建議直接用密碼管理工具產生 <strong>15 個字元以上</strong>的獨特隨機密碼。GitHub 系統也會自動攔截已知曾外洩的弱密碼。',
      '<strong>課堂資安守則：</strong>絕對不要在課堂上大聲念出密碼、不要把密碼寫在便利貼貼在螢幕上、不要拍照或傳給教師與同學。'
    ],
    uiTerms: ['Password', '15 characters', '8 characters including a number and a lowercase letter'],
    calloutType: 'danger',
    calloutTitle: '密碼保密底線',
    calloutText: '本教學網站絕對不會要求您輸入密碼。請只在 https://github.com/signup 真實頁面的 Password 欄位輸入，並由學生本人自行保管。',
    visualHtml: `
      <div class="static-ui-diagram" aria-label="唯讀示意：Password 欄位與規則說明">
        <div class="static-ui-title">表單欄位對照：Password（唯讀示意，非輸入框）</div>
        <div class="static-field-row">
          <span class="static-field-label">Password *</span>
          <div class="static-field-box"><span>••••••••••••••••</span><span>至少 15 字元推薦</span></div>
        </div>
        <div style="font-size:0.78rem; color:#1a7f37; font-weight:600;">
          官方規則：Password should be at least 15 characters OR at least 8 characters including a number and a lowercase letter.
        </div>
      </div>
    `,
    links: [
      { label: '實際註冊頁', url: 'https://github.com/signup' },
      { label: '來源：建立高強度密碼 (GitHub Docs)', url: 'https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-strong-password' }
    ]
  },
  {
    id: 'signup-5',
    num: 5,
    shortTitle: '設定 Username 公開帳號名稱',
    title: '步驟 5：設定 Username（公開顯示的個人頁代號）',
    summary: '在 Username 欄輸入公開顯示的帳號名稱；它會成為您的個人作品集網址，例如 https://github.com/your-name。',
    bullets: [
      '<strong>命名格式規則：</strong>只能使用<strong>英文字母、數字与單個連字號 <code>-</code>（hyphen）</strong>；連字號 <code>-</code> 不能放在開頭或結尾，也不能連續兩個連字號。',
      '<strong>若顯示名稱已被使用（Username is not available）：</strong>由於全球共用命名空間，請加上數字、縮寫或單個連字號調整成容易辨識的名稱。',
      '<strong>重要觀念釐清：</strong><code>Username</code> 是公開代號，<strong>不是密碼，也不是電子郵件地址</strong>。日後老師收作業或同學協作時，只需要提供這個 Username。'
    ],
    uiTerms: ['Username', 'https://github.com/your-name', 'Alphanumeric characters or single hyphens'],
    calloutType: 'warning',
    calloutTitle: '給學生的命名小建議',
    calloutText: 'Username 未來會出現在您的履歷與程式作品集網址中，建議選擇簡潔、專業且好記的英文與數字組合。',
    visualHtml: `
      <div class="static-ui-diagram" aria-label="唯讀示意：Username 欄位與個人網址預覽">
        <div class="static-ui-title">表單欄位對照：Username（唯讀示意）</div>
        <div class="static-field-row">
          <span class="static-field-label">Username *</span>
          <div class="static-field-box"><span>lin-student-2026</span><span>可用英數與單一連字號 -</span></div>
        </div>
        <div style="font-size:0.78rem; color:#424a53;">
          對應公開個人頁網址：<code>https://github.com/lin-student-2026</code><br>
          規則：Username may only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen.
        </div>
      </div>
    `,
    links: [
      { label: '實際註冊頁', url: 'https://github.com/signup' }
    ]
  },
  {
    id: 'signup-6',
    num: 6,
    shortTitle: '選擇 Country/Region 與郵件偏好',
    title: '步驟 6：選擇 Your Country/Region 與電子郵件通知偏好',
    summary: '在必填的 Your Country/Region 下拉選單選擇所在地（臺灣使用者選 Taiwan），並依個人意願決定是否勾選產品消息郵件。',
    bullets: [
      '<strong>Your Country/Region（必填）：</strong>用於遵循地區法規與服務條款，在臺灣的師生請選擇 <code>Taiwan</code>。',
      '<strong>Email preferences（選填）：</strong>下方的 <code>Receive occasional product updates and announcements</code> 是「接收不定期產品更新與公告」的行銷郵件偏好，可按個人意願勾選或不勾選。',
      '<strong>不會影響驗證信：</strong>無論是否勾選產品消息，<strong>註冊驗證信與帳號安全通知郵件都會正常寄送</strong>。'
    ],
    uiTerms: ['Your Country/Region', 'Taiwan', 'Email preferences', 'Receive occasional product updates and announcements'],
    calloutType: 'warning',
    calloutTitle: '欄位核對提醒',
    calloutText: 'Your Country/Region 為必填欄位，若未選擇將無法順利點選送出建立帳號。',
    visualHtml: `
      <div class="static-ui-diagram" aria-label="唯讀示意：Country/Region 與郵件偏好">
        <div class="static-ui-title">表單欄位對照：地區與郵件偏好（唯讀示意）</div>
        <div class="static-field-row">
          <span class="static-field-label">Your Country/Region *</span>
          <div class="static-field-box"><span>Taiwan</span><span>▼ 下拉選單</span></div>
        </div>
        <div class="static-field-row">
          <span class="static-field-label">Email preferences</span>
          <div class="static-field-box"><span>☐ Receive occasional product updates and announcements</span><span>可自由勾選</span></div>
        </div>
      </div>
    `,
    links: [
      { label: '實際註冊頁', url: 'https://github.com/signup' }
    ]
  },
  {
    id: 'signup-7',
    num: 7,
    shortTitle: '完成人工驗證並建立帳號',
    title: '步驟 7：完成真人驗證（Verify your account）並按 Create account',
    summary: '在 Verify your account 區塊完成互動式人機挑戰（視覺拼圖或語音題），核對條款後點擊 Create account。',
    bullets: [
      '<strong>真人驗證（Verify your account / CAPTCHA）：</strong>依畫面指示完成視覺圖形題或語音驗證。題型、按鈕文字（如 <code>Verify</code> / <code>Submit</code>）與先後順序可能隨時間、網路環境或風險檢查而改變。',
      '<strong>閱讀服務條款與隱私聲明：</strong>確認註冊頁下方的 Terms of Service 與 Privacy Statement。',
      '<strong>建立帳號：</strong>點擊 <strong><code>Create account</code></strong> 按鈕。建立帳號代表同意 GitHub 服務條款，請務必由申請者本人完成最後確認。'
    ],
    uiTerms: ['Verify your account', 'Create account', 'Terms of Service', 'Privacy Statement'],
    calloutType: 'danger',
    calloutTitle: '卡在真人驗證時怎麼辦？',
    calloutText: '若人機驗證一直失敗，請確認瀏覽器未安裝阻擋腳本的外掛、網路連線穩定，或切換為語音題。千萬不要為了請別人幫忙過驗證而把剛設好的密碼交給他人！',
    visualHtml: `
      <div class="static-ui-diagram" aria-label="唯讀示意：Verify your account 與 Create account 按鈕">
        <div class="static-ui-title">表單底部對照：驗證與建立帳號（唯讀示意）</div>
        <div class="static-field-row">
          <span class="static-field-label">Verify your account</span>
          <div class="static-field-box"><span>[ 互動式真人驗證挑戰區 / CAPTCHA ]</span><span>依畫面指示完成</span></div>
        </div>
        <div style="margin-top:10px;">
          <span class="static-btn-mock" style="background:#1f2328; width:100%; text-align:center;">Create account ›</span>
        </div>
      </div>
    `,
    links: [
      { label: '實際註冊頁', url: 'https://github.com/signup' },
      { label: '來源：GitHub 服務條款', url: 'https://docs.github.com/en/site-policy/github-terms/github-terms-of-service' }
    ]
  },
  {
    id: 'signup-8',
    num: 8,
    shortTitle: '依畫面完成電子郵件驗證',
    title: '步驟 8：到信箱收信，完成電子郵件驗證（Email Verification）',
    summary: '前往步驟 3 填寫的電子郵件信箱，找到 GitHub 寄來的驗證信，依當時畫面要求輸入郵件中的驗證碼（Launch code）或點擊驗證連結。',
    bullets: [
      '<strong>立即檢查收件匣與垃圾郵件匣：</strong>找到來自 GitHub 的信件，依註冊完成後跳轉畫面的提示，輸入信中提供的單次驗證代碼或點擊驗證按鈕／連結。',
      '<strong>未驗證信箱的功能限制：</strong>GitHub 官方文件明確指出，若尚未完成電子郵件驗證，將<strong>無法建立儲存庫（Repository）</strong>等基本功能。',
      '<strong>防詐騙鐵則：</strong>只在 <code>github.com</code> 官方網域頁面輸入 GitHub 發來的驗證碼；不要把驗證碼或驗證連結轉傳給教師或同學。'
    ],
    uiTerms: ['Verify your email address', 'Enter code / Verification link', 'github.com'],
    calloutType: 'danger',
    calloutTitle: '再次提醒：電子郵件驗證 ≠ 兩階段驗證（2FA）',
    calloutText: '完成這個步驟代表您的信箱有效、可以使用 GitHub 基本功能，但「還沒有」開啟兩階段驗證（2FA）。完成步驟 10 後，請繼續前往本網站「獨立專區：兩階段驗證 2FA 完整教學」。',
    visualHtml: `
      <div class="static-ui-diagram" aria-label="唯讀示意：電子郵件驗證流程">
        <div class="static-ui-title">電子郵件驗證對照（唯讀示意，請勿在此輸入驗證碼）</div>
        <div class="static-field-row">
          <span class="static-field-label">1. 打開個人信箱收件匣</span>
          <div class="static-field-box"><span>主旨：GitHub launch code / Verify your email address</span></div>
        </div>
        <div class="static-field-row">
          <span class="static-field-label">2. 回到 github.com 驗證畫面</span>
          <div class="static-field-box"><span>輸入信中驗證碼 或 點擊信中 Verify email address 連結</span></div>
        </div>
      </div>
    `,
    links: [
      { label: '來源：建立帳號 (GitHub Docs)', url: 'https://docs.github.com/en/account-and-profile/how-tos/account-management/creating-an-account-on-github' },
      { label: '來源：驗證電子郵件', url: 'https://docs.github.com/en/account-and-profile/how-tos/email-preferences/verifying-your-email-address' }
    ]
  },
  {
    id: 'signup-9',
    num: 9,
    shortTitle: '檢查信箱狀態，必要時重寄',
    title: '步驟 9：在 Settings → Emails 檢查信箱狀態，必要時重寄驗證信',
    summary: '登入後按右上角個人頭像 → Settings → 左側 Access 下的 Emails。若顯示 Unverified，請按 Resend verification email（有效期 24 小時）。',
    bullets: [
      '<strong>進入路徑：</strong>登入 GitHub 後，點右上角個人頭像 → 點選 <strong><code>Settings</code></strong> → 在左側邊欄 <strong><code>Access</code></strong> 區塊下點選 <strong><code>Emails</code></strong>（或直接開啟 <a href="https://github.com/settings/emails" target="_blank" rel="noopener noreferrer">github.com/settings/emails ↗</a>）。',
      '<strong>檢查狀態：</strong>已驗證的主要信箱會標示綠色的 <code>Primary</code> 且無未驗證警告；若顯示 <code>Unverified</code>，請點擊旁邊的 <strong><code>Resend verification email</code></strong>。',
      '<strong>24 小時時效規定：</strong>GitHub 官方說明指出，電子郵件驗證連結的有效期為 <strong>24 小時</strong>；若超過 24 小時才點擊就會失效，只需按 <code>Resend verification email</code> 重新寄送即可。'
    ],
    uiTerms: ['Settings', 'Access > Emails', 'Unverified', 'Resend verification email', 'Primary'],
    calloutType: 'warning',
    calloutTitle: '官方畫面對照說明',
    calloutText: '右側為 GitHub Docs 官方說明截圖（畫面日期核對：2026-10-26），橘色框標示處即為「Resend verification email」按鈕位置。實際畫面可能微調，請以現場文字為準。',
    visualHtml: `
      <div class="official-screenshot-wrap">
        <img src="assets/email-verify-button-official.png" alt="GitHub Docs 官方截圖：Settings > Emails 頁面中未驗證信箱下方的 Resend verification email 連結" loading="lazy" />
        <div class="screenshot-caption">
          <strong>【GitHub Docs 官方說明截圖 · 僅供位置對照，非可點擊表單】</strong><br>
          來源：<a href="https://docs.github.com/en/account-and-profile/how-tos/email-preferences/verifying-your-email-address" target="_blank" rel="noopener noreferrer">Verifying your email address ↗</a>（核對日期：2026-10-26）。圖中顯示 <code>Primary</code> 已驗證信箱與下方 <code>Unverified</code> 信箱的 <code>Resend verification email</code> 按鈕。
        </div>
      </div>
    `,
    links: [
      { label: '直達：GitHub Settings > Emails', url: 'https://github.com/settings/emails' },
      { label: '來源：驗證電子郵件 (GitHub Docs)', url: 'https://docs.github.com/en/account-and-profile/how-tos/email-preferences/verifying-your-email-address' },
      { label: '來源：信箱驗證疑難排解', url: 'https://docs.github.com/en/account-and-profile/how-tos/email-preferences/troubleshooting-email-verification' }
    ]
  },
  {
    id: 'signup-10',
    num: 10,
    shortTitle: '確認 GitHub Free 方案與完成狀態',
    title: '步驟 10：確認選擇 GitHub Free 免費方案與首次登入完成狀態',
    summary: '若引導畫面出現方案選擇，基礎課程與個人學習選擇 GitHub Free（免費方案）即可，不必為了建立個人帳號選付費方案。',
    bullets: [
      '<strong>選擇 GitHub Free：</strong>GitHub Free 已包含無限個公開與私有儲存庫（Repositories）等完整基礎功能，完全足夠學生與教師日常課程使用，不需綁定信用卡或選付費方案。',
      '<strong>第一部分完成標準（自我檢查 3 件事）：</strong><br>① 可以正常登入自己的 <code>github.com</code> 帳號；<br>② 清楚知道自己的公開 <code>Username</code>（個人頁網址 <code>https://github.com/你的Username</code>）；<br>③ <code>Settings → Emails</code> 中主要電子郵件（Primary email）已完成驗證。',
      '<strong>下一步：</strong>帳號建立完成後，請立即點選下方按鈕進入「<strong>兩階段驗證（2FA）完整教學</strong>」，為帳號加上驗證器 App 與復原碼保護！'
    ],
    uiTerms: ['GitHub Free', 'Dashboard', 'Verified Primary Email', 'https://github.com/<username>'],
    calloutType: 'warning',
    calloutTitle: '恭喜完成第一部分！接著請設定兩階段驗證（2FA）',
    calloutText: '即使註冊當下沒有跳出強制 2FA 橫幅，在申請當天一併設好 TOTP 驗證器與下載 Recovery codes，能避免日後課程組織要求或貢獻程式碼時被鎖定。',
    visualHtml: `
      <div class="static-ui-diagram" aria-label="唯讀示意：第一部分完成狀態確認卡">
        <div class="static-ui-title">第一部分：個人帳號完成狀態確認單（唯讀示意）</div>
        <div class="static-field-row">
          <span class="static-field-label">目前方案 (Plan)</span>
          <div class="static-field-box"><span>GitHub Free (個人免費方案)</span><span style="color:#1a7f37;font-weight:700;">✔ 免付費</span></div>
        </div>
        <div class="static-field-row">
          <span class="static-field-label">信箱狀態 (Settings > Emails)</span>
          <div class="static-field-box"><span>Primary Email — Verified</span><span style="color:#1a7f37;font-weight:700;">✔ 已驗證</span></div>
        </div>
        <div class="static-field-row">
          <span class="static-field-label">個人頁面網址</span>
          <div class="static-field-box"><span>https://github.com/你的Username</span><span style="color:#0969da;font-weight:700;">可正常開啟</span></div>
        </div>
      </div>
    `,
    links: [
      { label: '來源：帳號入門指南 (GitHub Docs)', url: 'https://docs.github.com/en/get-started/onboarding/getting-started-with-your-github-account' },
      { label: '來源：GitHub 方案說明', url: 'https://docs.github.com/en/get-started/learning-about-github/githubs-plans' }
    ]
  }
];

// ==================== 2. 第四部分：在 GitHub 開啟驗證器 2FA（10 步驟） ====================
const TWOFA_STEPS = [
  {
    id: 'twofa-1',
    num: 1,
    shortTitle: '登入 GitHub 進入 Settings',
    title: '2FA 步驟 1：登入 GitHub，按右上角個人頭像 → Settings',
    summary: '建議「電腦開著 GitHub 設定頁，手機開著已安裝好的驗證器 App（如 Google Authenticator）」，最容易掃描 QR code。',
    bullets: [
      '在電腦瀏覽器確認已登入自己的 GitHub 個人帳號。',
      '點擊網頁右上角的<strong>個人頭像（Profile picture）</strong>，在下拉選單中點選 <strong><code>Settings</code></strong>（齒輪圖示）。',
      '若系統提示再次輸入密碼（Sudo mode 安全確認），請在 <code>github.com</code> 頁面輸入您的 GitHub 密碼繼續。'
    ],
    uiTerms: ['Profile picture (右上角頭像)', 'Settings'],
    calloutType: 'warning',
    calloutTitle: '雙裝置操作最順暢',
    calloutText: '電腦螢幕顯示設定頁面、手機拿在手上開啟 Google Authenticator 準備掃描，整個過程只需約 2～3 分鐘。',
    visualHtml: `
      <div class="static-ui-diagram" aria-label="唯讀示意：右上角個人頭像選單">
        <div class="static-ui-title">導覽路徑示意：右上角個人頭像選單（唯讀示意）</div>
        <div class="static-field-row">
          <div class="static-field-box"><span>👤 your-username (右上角頭像)</span><span>點擊展開選單</span></div>
        </div>
        <div class="static-field-row">
          <div class="static-field-box" style="border-color:#0969da; background:#eef5ff; color:#0550ae; font-weight:700;"><span>⚙️ Settings</span><span>點擊進入帳號設定</span></div>
        </div>
      </div>
    `,
    links: [
      { label: '直達：GitHub Settings', url: 'https://github.com/settings/profile' },
      { label: '來源：設定 2FA (GitHub Docs)', url: 'https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/configuring-two-factor-authentication' }
    ]
  },
  {
    id: 'twofa-2',
    num: 2,
    shortTitle: '點選 Password and authentication',
    title: '2FA 步驟 2：在左側 Access 區按 Password and authentication',
    summary: '在 Settings 頁面左側邊欄找到 Access 分組，點擊 Password and authentication 進入密碼與兩階段驗證管理頁。',
    bullets: [
      '查看左側導覽列，找到標題為 <strong><code>Access</code></strong> 的區塊。',
      '點擊 <strong><code>Password and authentication</code></strong>（也可直接點下方直達按鈕開啟 <code>https://github.com/settings/security</code>）。',
      '在此頁面中，您可以管理密碼、通行密鑰（Passkeys）以及兩階段驗證（Two-factor authentication）。'
    ],
    uiTerms: ['Access', 'Password and authentication', 'Two-factor authentication'],
    calloutType: 'warning',
    calloutTitle: '快速核對位置',
    calloutText: '左側 Access 區塊下常見順序為：Billing and plans → Emails → Password and authentication → Sessions → SSH and GPG keys。',
    visualHtml: `
      <div class="static-ui-diagram" aria-label="唯讀示意：左側 Access 選單">
        <div class="static-ui-title">Settings 左側邊欄路徑（唯讀示意）</div>
        <div style="font-size:0.78rem; font-weight:700; color:#57606a; margin-bottom:6px;">Access</div>
        <div class="static-field-row">
          <div class="static-field-box"><span>✉️ Emails</span><span>步驟 9 信箱設定</span></div>
        </div>
        <div class="static-field-row">
          <div class="static-field-box" style="border-color:#0969da; background:#eef5ff; color:#0550ae; font-weight:700;"><span>🛡️ Password and authentication</span><span>點此進入 2FA 設定</span></div>
        </div>
      </div>
    `,
    links: [
      { label: '直達：Password and authentication', url: 'https://github.com/settings/security' },
      { label: '來源：設定 2FA (GitHub Docs)', url: 'https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/configuring-two-factor-authentication' }
    ]
  },
  {
    id: 'twofa-3',
    num: 3,
    shortTitle: '按 Enable two-factor authentication',
    title: '2FA 步驟 3：按 Enable two-factor authentication 開始設定',
    summary: '在頁面的 Two-factor authentication 區塊，點擊綠色的 Enable two-factor authentication 按鈕。',
    bullets: [
      '往下捲動找到 <strong><code>Two-factor authentication</code></strong> 區塊。',
      '點擊 <strong><code>Enable two-factor authentication</code></strong> 按鈕啟動設定精靈。',
      '若您的帳號剛好收到 GitHub 強制設定 2FA 的橫幅或強制提示頁，也可以直接依該提示畫面點擊繼續。'
    ],
    uiTerms: ['Two-factor authentication', 'Enable two-factor authentication', 'Authenticator app'],
    calloutType: 'warning',
    calloutTitle: '選擇驗證器 App (TOTP) 作為主要方法',
    calloutText: '進入設定畫面後，請確認選擇以「Authenticator app（TOTP 驗證器應用程式）」進行設定，而非 SMS 簡訊（簡訊易受攔截且部分國家/組織不支援）。',
    visualHtml: `
      <div class="static-ui-diagram" aria-label="唯讀示意：Enable two-factor authentication 按鈕">
        <div class="static-ui-title">Two-factor authentication 區塊（唯讀示意）</div>
        <p style="margin:0 0 10px; font-size:0.82rem; color:#424a53;">Two-factor authentication is not enabled yet. Two-factor authentication adds an additional layer of security to your account...</p>
        <span class="static-btn-mock">Enable two-factor authentication</span>
      </div>
    `,
    links: [
      { label: '直達：Password and authentication', url: 'https://github.com/settings/security' },
      { label: '來源：設定 2FA (GitHub Docs)', url: 'https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/configuring-two-factor-authentication' }
    ]
  },
  {
    id: 'twofa-4',
    num: 4,
    shortTitle: '用驗證器 App 掃描 QR code',
    title: '2FA 步驟 4：在 Scan the QR code 畫面，用手機驗證器 App 掃描',
    summary: '當 GitHub 畫面顯示 Scan the QR code 時，打開手機上的 Google Authenticator，點選右下角「＋」→「掃描 QR 圖碼」對準電腦螢幕掃描。',
    bullets: [
      '在手機打開已安裝的 <strong>Google Authenticator</strong>（或其他 TOTP 驗證器 App）。',
      '點選新增帳號（<strong><code>+</code></strong> 號）→ 選擇 <strong>「掃描 QR 圖碼（Scan a QR code）」</strong>，將手機鏡頭對準自己電腦螢幕上的 GitHub QR code。',
      '掃描成功後，手機 App 畫面會立刻出現一筆 <code>GitHub:你的Username</code> 項目，並顯示一組每 30 秒自動更新的 <strong>6 位數動態驗證碼</strong>。',
      '<strong>多裝置同時綁定小技巧：</strong>若想在平板與手機同時備份 TOTP，可在這個畫面同時用兩台裝置掃描同一個 QR code。'
    ],
    uiTerms: ['Scan the QR code', 'Use an authenticator app or browser extension to scan', 'setup key'],
    calloutType: 'danger',
    calloutTitle: '資安紅線：QR code 與 setup key 是最高機密！',
    calloutText: '畫面上的 QR code 與 setup key 等同於您的第二把鑰匙！絕對不能截圖公開、不能投影給全班看、不能傳給老師或同學（任何人掃描您的 QR code 都能產生您的驗證碼）。右側圖片為已塗黑遮蔽的官方說明圖，請勿拿手機掃描本教學網頁上的示意圖！',
    visualHtml: `
      <div class="official-screenshot-wrap">
        <img src="assets/github-2fa-qr-official.png" alt="GitHub Docs 官方截圖：Scan the QR code 畫面（QR code 已遮蔽，下方標示 setup key 連結）" loading="lazy" />
        <div class="screenshot-caption">
          <strong>【GitHub Docs 官方說明截圖 · 圖中黑色方塊為已遮蔽之示意圖，請勿掃描此圖！】</strong><br>
          來源：<a href="https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/configuring-two-factor-authentication" target="_blank" rel="noopener noreferrer">Configuring two-factor authentication ↗</a>（本地檔案：<code>assets/github-2fa-qr-official.png</code>，核對日期：2026-10-26）。請在您自己登入的 <code>github.com</code> 設定頁掃描屬於您自己的 QR code。
        </div>
      </div>
    `,
    links: [
      { label: '來源：設定 2FA (GitHub Docs)', url: 'https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/configuring-two-factor-authentication' },
      { label: '官方圖片原始連結', url: 'https://docs.github.com/assets/cb-48626/images/help/2fa/ghes-3.8-and-higher-2fa-wizard-app-click-code.png' }
    ]
  },
  {
    id: 'twofa-5',
    num: 5,
    shortTitle: '無法掃碼時：改用 setup key 手動輸入',
    title: '2FA 步驟 5：（無法掃碼時的替代方案）點擊 setup key 手動加入金鑰',
    summary: '若手機鏡頭故障，或您使用的是電腦版 TOTP 工具（如 KeePassXC）無法掃描螢幕，請點選 QR code 下方的 setup key 連結。',
    bullets: [
      '在 GitHub 的 <code>Scan the QR code</code> 下方文字：<code>Unable to scan? You can use the setup key to manually configure your authenticator app.</code> 中，點擊藍色的 <strong><code>setup key</code></strong>（如步驟 4 官方截圖橘色框標示處）。',
      '在驗證器 App 中改選「<strong>輸入設定金鑰（Enter a setup key）</strong>」，將畫面顯示的 <code>Secret</code> 金鑰字串複製或輸入進去。',
      '<strong>GitHub 官方手動 TOTP 技術參數（如需填寫）：</strong><br>• Type: <code>TOTP</code> ｜ Issuer: <code>GitHub</code> ｜ Label: <code>GitHub:&lt;username&gt;</code><br>• Algorithm: <code>SHA1</code>（預設）｜ Digits: <code>6</code> ｜ Period: <code>30</code> 秒。',
      '<strong>已成功掃描 QR code 者：</strong>可直接跳過此手動步驟，進入步驟 6。'
    ],
    uiTerms: ['setup key', 'Unable to scan?', 'Type: TOTP / SHA1 / 6 digits / 30s'],
    calloutType: 'danger',
    calloutTitle: '切勿將 setup key 抄寫到共用文件',
    calloutText: 'setup key 就是 QR code 背後的原始種子密碼（TOTP secret）。請勿將它貼在公開筆記、雲端共用文件或聊天室中。',
    visualHtml: `
      <div class="official-screenshot-wrap">
        <img src="assets/github-2fa-qr-official.png" alt="GitHub Docs 官方截圖：點擊橘色框標示的 setup key 可改用手動金鑰設定" loading="lazy" />
        <div class="screenshot-caption">
          <strong>【GitHub Docs 官方說明截圖 · 橘色框即為 setup key 點擊位置】</strong><br>
          若已在步驟 4 成功用鏡頭掃描 QR code，不需再點 setup key，請直接進行步驟 6。
        </div>
      </div>
    `,
    links: [
      { label: '來源：手動設定 TOTP 參數 (GitHub Docs)', url: 'https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/configuring-two-factor-authentication#manually-configuring-a-totp-app' }
    ]
  },
  {
    id: 'twofa-6',
    num: 6,
    shortTitle: '輸入驗證器 App 的 6 位數 TOTP 代碼',
    title: '2FA 步驟 6：在 Verify the code from the app 欄輸入 6 位數動態代碼',
    summary: '查看手機驗證器 App 上針對 GitHub 當下顯示的 6 位數代碼，輸入到 GitHub 頁面的 Verify the code from the app 欄位中。',
    bullets: [
      '看手機 Google Authenticator 畫面上的 6 位數數字（每 30 秒會變動一次）。',
      '<strong>小技巧：</strong>如果看到手機上的倒數圓餅圖已經快轉完（剩不到 5 秒即將過期），<strong>請先等它跳出下一組新的 6 位數代碼再輸入</strong>，避免輸入到一半剛好過期。',
      '<strong>若提示代碼無效（Invalid two-factor code）：</strong>請檢查手機的「設定 → 一般 → 日期與時間」是否已開啟「<strong>自動設定（Set Automatically）</strong>」，時間不準會導致 TOTP 計算誤差！'
    ],
    uiTerms: ['Verify the code from the app', '6-digit authentication code'],
    calloutType: 'warning',
    calloutTitle: '本網頁不收集驗證碼',
    calloutText: '右側方框僅為欄位名稱示意，請在您瀏覽器的真實 github.com 設定頁輸入 6 位數代碼。',
    visualHtml: `
      <div class="static-ui-diagram" aria-label="唯讀示意：Verify the code from the app 欄位">
        <div class="static-ui-title">欄位位置對照：輸入 6 位數動態碼（唯讀示意，非輸入框）</div>
        <div class="static-field-row">
          <span class="static-field-label">Verify the code from the app</span>
          <div class="static-field-box"><span>XXXXXX (請於真實 github.com 頁面輸入手機 App 顯示的 6 位數)</span><span>30秒更新</span></div>
        </div>
      </div>
    `,
    links: [
      { label: '來源：設定 2FA (GitHub Docs)', url: 'https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/configuring-two-factor-authentication' },
      { label: '來源：2FA 疑難排解', url: 'https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/troubleshooting-two-factor-authentication-issues' }
    ]
  },
  {
    id: 'twofa-7',
    num: 7,
    shortTitle: '按 Download 下載並妥善保存 Recovery codes',
    title: '2FA 步驟 7：在 Save your recovery codes 頁按 Download 下載復原碼',
    summary: '驗證 6 位數代碼通過後，會進入 Save your recovery codes 頁面。請務必點擊 Download 下載復原碼，並妥善保存到安全且能異地取用的位置！',
    bullets: [
      '在 <strong><code>Save your recovery codes</code></strong> 區域下，點擊 <strong><code>Download</code></strong> 按鈕下載復原碼文字檔（或使用 <code>Print</code> / <code>Copy</code> 存入密碼管理器）。',
      '<strong>如何安全保存復原碼？</strong>請將復原碼存入可信賴的密碼管理工具（如 1Password、Bitwarden、iCloud 鑰匙圈或加密備忘錄），或列印紙本鎖在個人安全處。',
      '<strong>三個絕對不要：</strong><br>① <strong>不要只留在同一支手機裡</strong>（手機遺失時就拿不到復原碼了）；<br>② <strong>不要留在學校電腦教室的「下載」資料夾</strong>；<br>③ <strong>不要交給老師或同學保管</strong>。',
      '<strong>一次性使用原則：</strong>每一組復原碼（Recovery code）<strong>只能使用一次</strong>。'
    ],
    uiTerms: ['Save your recovery codes', 'Download', 'Print', 'Copy'],
    calloutType: 'danger',
    calloutTitle: '為什麼 Recovery codes 是救命關鍵？',
    calloutText: '未來萬一您的手機遺失、摔壞或重置，這份 Recovery codes 就是您登入 GitHub 重設驗證器的最重要憑證！若沒有保存復原碼也沒有備用金鑰，手機不見時帳號可能永久無法救回。',
    visualHtml: `
      <div class="static-ui-diagram" aria-label="唯讀示意：Save your recovery codes 與 Download 按鈕">
        <div class="static-ui-title">Save your recovery codes 頁面結構（唯讀示意）</div>
        <div class="static-field-row">
          <div class="static-field-box" style="flex-direction:column; align-items:flex-start; gap:4px;">
            <span>•••••-••••• &nbsp;&nbsp; •••••-••••• (共 16 組單次復原碼示意)</span>
            <span style="font-size:0.75rem; color:#cf222e;">※ 真實復原碼為機密，請勿外流，每組僅能用一次</span>
          </div>
        </div>
        <div style="display:flex; gap:8px; margin-top:8px;">
          <span class="static-btn-mock" style="background:#24292f;">⬇ Download (必按！)</span>
          <span class="static-btn-mock" style="background:#f6f8fa; color:#1f2328; border:1px solid #d0d7de;">Print</span>
          <span class="static-btn-mock" style="background:#f6f8fa; color:#1f2328; border:1px solid #d0d7de;">Copy</span>
        </div>
      </div>
    `,
    links: [
      { label: '來源：設定 2FA 復原方法 (GitHub Docs)', url: 'https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/configuring-two-factor-authentication-recovery-methods' }
    ]
  },
  {
    id: 'twofa-8',
    num: 8,
    shortTitle: '按 I have saved my recovery codes 完成啟用',
    title: '2FA 步驟 8：確認保存後，按 I have saved my recovery codes 正式啟用',
    summary: '確認復原碼已下載並移至安全位置後，點擊 I have saved my recovery codes 按鈕，才算真正完成啟用兩階段驗證！',
    bullets: [
      '點擊 <strong><code>I have saved my recovery codes</code></strong> 按鈕。',
      '<strong>極常見錯誤提醒：</strong>許多學生<strong>只掃了 QR code、只輸入了 6 位數代碼，卻在下載復原碼這頁直接關掉視窗</strong>！請注意：沒有按下最後確認按鈕前，整個 2FA 設定可能尚未完成或未妥善備份。',
      '完成後，回到 <code>Password and authentication</code> 頁面，會看到 <strong><code>Authenticator app</code></strong> 旁出現綠色的 <strong><code>Enabled</code></strong> 與藍色的 <strong><code>Preferred</code></strong> 標籤。'
    ],
    uiTerms: ['I have saved my recovery codes', 'Authenticator app — Enabled'],
    calloutType: 'danger',
    calloutTitle: '務必看到「Enabled」才算大功告成！',
    calloutText: '只掃描 QR code 並輸入 6 位數代碼、卻沒完成復原碼確認，不能視為整個 2FA 設定完成。請確認頁面顯示 Authenticator app [Enabled]。',
    visualHtml: `
      <div class="static-ui-diagram" aria-label="唯讀示意：I have saved my recovery codes 最終確認">
        <div class="static-ui-title">最後確認按鈕與完成狀態對照（唯讀示意）</div>
        <div style="margin-bottom:10px;">
          <span class="static-btn-mock" style="width:100%; text-align:center;">I have saved my recovery codes</span>
        </div>
        <div class="static-field-box" style="border-color:#1a7f37; background:#eafbef; color:#116329; font-weight:700;">
          <span>📱 Authenticator app</span>
          <span>[Enabled] [Preferred]</span>
        </div>
      </div>
    `,
    links: [
      { label: '來源：設定 2FA (GitHub Docs)', url: 'https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/configuring-two-factor-authentication' }
    ]
  },
  {
    id: 'twofa-9',
    num: 9,
    shortTitle: '選配：加入 Passkey、安全金鑰或 GitHub Mobile',
    title: '2FA 步驟 9：（選配強化）加入 Passkey、Security Key 或 GitHub Mobile 備用方法',
    summary: '完成 TOTP 驗證器設定後，建議再加設一個備用驗證方式，能大幅降低日後「手機遺失或沒電」導致無法登入的風險。',
    bullets: [
      '<strong>為什麼要先設好 TOTP 才能加這些？</strong>GitHub 目前要求必須先用 TOTP 驗證器 App（或簡訊）完成初次 2FA 啟用，之後才能加入安全金鑰或 GitHub Mobile，並作為 Passkey 的基礎保障。',
      '<strong>選配 1：Passkeys（通行密鑰）：</strong>在頁面上方 <code>Passkeys</code> 區點選 <code>Add a passkey</code>，可用電腦或手機的 Touch ID、Face ID、Windows Hello 快速無密碼登入，同時滿足密碼與 2FA 要求。',
      '<strong>選配 2：Security keys（硬體安全金鑰）：</strong>如右側官方截圖所示，在 <code>Two-factor methods</code> 下的 <code>Security keys</code> 旁按 <code>Add</code> 註冊 WebAuthn 安全金鑰。',
      '<strong>選配 3：GitHub Mobile App：</strong>在手機安裝官方 GitHub Mobile 並登入開啟推播通知，即可用手機按推播認證登入。'
    ],
    uiTerms: ['Passkeys > Add a passkey', 'Security keys > Add', 'GitHub Mobile'],
    calloutType: 'warning',
    calloutTitle: '官方畫面對照說明',
    calloutText: '右側為 GitHub Docs 官方截圖（核對日期：2026-10-26），清楚展示 Authenticator app 顯示綠色的 Enabled 狀態，以及下方 Security keys 的 Add 按鈕。',
    visualHtml: `
      <div class="official-screenshot-wrap">
        <img src="assets/add-security-keys-official.png" alt="GitHub Docs 官方截圖：Two-factor methods 區塊顯示 Authenticator app Enabled 與 Security keys Add 按鈕" loading="lazy" />
        <div class="screenshot-caption">
          <strong>【GitHub Docs 官方說明截圖 · 僅供狀態與按鈕位置對照】</strong><br>
          來源：<a href="https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/configuring-two-factor-authentication" target="_blank" rel="noopener noreferrer">Configuring two-factor authentication ↗</a>（核對日期：2026-10-26）。教師驗收學生 2FA 狀態時，即可請學生展示此畫面中 <code>Authenticator app</code> 旁的綠色 <code>Enabled</code> 標籤。
        </div>
      </div>
    `,
    links: [
      { label: '來源：設定 Passkey 與安全金鑰 (GitHub Docs)', url: 'https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/configuring-two-factor-authentication#configuring-two-factor-authentication-using-a-passkey' }
    ]
  },
  {
    id: 'twofa-10',
    num: 10,
    shortTitle: '日後登入驗證與 28 天檢查期確認',
    title: '2FA 步驟 10：了解日後登入流程與 GitHub「28 天檢查期」機制',
    summary: '啟用 2FA 後，帳號會進入 28 天檢查期（28-day check up period）。只要在 28 天內成功執行一次 2FA 驗證即可通過檢查。',
    bullets: [
      '<strong>日常登入方式：</strong>日後在新裝置或瀏覽器登入 GitHub 輸入帳號密碼後，系統會提示輸入手機驗證器 App 當下的 6 位數 TOTP 代碼（若已設 Passkey 則可直接用 Passkey 登入）。',
      '<strong>什麼是 28 天檢查期（28-day check up period）？</strong>為了確認您沒有弄丟剛設好的驗證器，GitHub 在您啟用 2FA 後的 28 天內，若您曾成功完成一次 2FA 登入，就會自動通過檢查期；若一直沒登出重登，系統會在<strong>第 28 天</strong>於現有登入視窗跳出提示請您輸入一次 2FA 代碼確認。',
      '<strong>保留瀏覽器 Cookie 建議：</strong>GitHub 官方建議在自己常用的個人電腦保留 <code>github.com</code> 的 Cookie（包含 <code>_device_id</code>），這樣該電腦會被記錄為「已驗證裝置（Verified device）」，有助於降低頻繁驗證與日後緊急復原。'
    ],
    uiTerms: ['28-day check up period', 'Two-factor authentication code', 'Verified device (_device_id)'],
    calloutType: 'warning',
    calloutTitle: '換手機或遺失手機怎麼辦？',
    calloutText: '請務必往下捲動閱讀本頁下方的「重要應變指南：換手機、重置手機或遺失驗證器裝置時怎麼辦？」，了解如何用 Edit 重新綁定新手機或用 Recovery codes 登入。',
    visualHtml: `
      <div class="static-ui-diagram" aria-label="唯讀示意：2FA 啟用後 28 天檢查期與日常登入">
        <div class="static-ui-title">2FA 完成後運作機制摘要（唯讀示意）</div>
        <div class="static-field-row">
          <span class="static-field-label">1. 日常登入流程</span>
          <div class="static-field-box"><span>輸入 Username/Email + Password ➔ 輸入驗證器 App 6 位數代碼</span></div>
        </div>
        <div class="static-field-row">
          <span class="static-field-label">2. 28 天檢查期 (Check up period)</span>
          <div class="static-field-box"><span>啟用後 28 天內成功執行一次 2FA 即可通過（否則第 28 天會提示驗證）</span></div>
        </div>
      </div>
    `,
    links: [
      { label: '來源：設定 2FA 檢查期說明 (GitHub Docs)', url: 'https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/configuring-two-factor-authentication' },
      { label: '來源：使用 2FA 存取 GitHub', url: 'https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/accessing-github-using-two-factor-authentication' }
    ]
  }
];

// ==================== 3. 第五部分：常見問題與排除方法（9 大情境） ====================
const FAQ_ITEMS = [
  {
    id: 'faq-1',
    category: 'email',
    q: 'Q1：收不到 GitHub 寄來的驗證信件怎麼辦？',
    a: `
      <p><strong>建議處理步驟：</strong></p>
      <ol>
        <li>先檢查信箱的「垃圾郵件匣（Spam）」、「促銷內容」與學校信箱的外部信件封鎖規則。</li>
        <li>登入 GitHub，按右上角頭像 → <code>Settings</code> → 左側 <code>Access</code> 下的 <strong><code>Emails</code></strong>（<a href="https://github.com/settings/emails" target="_blank" rel="noopener noreferrer">github.com/settings/emails ↗</a>），核對註冊信箱有沒有拼錯字。</li>
        <li>若拼字正確但顯示 <code>Unverified</code>，請點擊 <strong><code>Resend verification email</code></strong> 重新寄送驗證信。</li>
        <li><strong>注意：</strong>請勿使用到期即失效的臨時信箱（拋棄式信箱），GitHub 官方不接受臨時信箱驗證。</li>
      </ol>
      <p><small>參考來源：<a href="https://docs.github.com/en/account-and-profile/how-tos/email-preferences/troubleshooting-email-verification" target="_blank" rel="noopener noreferrer">信箱驗證疑難排解 (GitHub Docs) ↗</a></small></p>
    `
  },
  {
    id: 'faq-2',
    category: 'email',
    q: 'Q2：點擊電子郵件裡的驗證連結，卻顯示驗證連結失效或錯誤？',
    a: `
      <p><strong>建議處理步驟：</strong></p>
      <ul>
        <li><strong>超過 24 小時過期：</strong>GitHub 官方說明指出驗證連結有效期為 <strong>24 小時</strong>。若超過時間才點開，請到 <code>Settings → Emails</code> 按 <strong><code>Resend verification email</code></strong> 重寄一封新的驗證信，並點選最新一封信裡的連結。</li>
        <li><strong>剛收到卻還是出錯：</strong>請先確認您目前瀏覽器登入的 GitHub 帳號，是否就是「發送該封驗證信的同一個 GitHub 帳號」（若在公用電腦登入了別人的帳號或不同帳號，驗證連結會比對失敗）。</li>
      </ul>
      <p><small>參考來源：<a href="https://docs.github.com/en/account-and-profile/how-tos/email-preferences/verifying-your-email-address" target="_blank" rel="noopener noreferrer">驗證電子郵件 (GitHub Docs) ↗</a></small></p>
    `
  },
  {
    id: 'faq-3',
    category: 'account',
    q: 'Q3：設定 Username 時一直顯示已被使用（Not available）或格式錯誤？',
    a: `
      <p><strong>建議處理步驟：</strong></p>
      <ul>
        <li>GitHub 的 Username 是全球唯一的公開名稱（對應 <code>https://github.com/你的Username</code>）。若已被他人註冊，請加上數字、英文縮寫或單個連字號 <code>-</code> 改用另一個容易辨識的名稱。</li>
        <li><strong>檢查符號規則：</strong>只能包含英文字母、數字與「單個連字號 <code>-</code>」；連字號不能放在開頭或結尾，且不能出現底線 <code>_</code>、空白或特殊符號。</li>
      </ul>
    `
  },
  {
    id: 'faq-4',
    category: 'account',
    q: 'Q4：設定 Password 密碼時被系統拒絕（Password is compromised / too weak）？',
    a: `
      <p><strong>建議處理步驟：</strong></p>
      <ul>
        <li>確認符合目前註冊頁規則：<strong>至少 15 個字元（不限組合）</strong>，或<strong>至少 8 個字元且包含數字與小寫英文字母</strong>。</li>
        <li>即使符合長度，若該密碼曾出現在公開資料外洩庫中（例如常見密碼組合），GitHub 也會自動攔截拒絕。請改用密碼管理工具產生的 <strong>15 字元以上獨特密碼</strong>。</li>
      </ul>
      <p><small>參考來源：<a href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-strong-password" target="_blank" rel="noopener noreferrer">建立高強度密碼 (GitHub Docs) ↗</a></small></p>
    `
  },
  {
    id: 'faq-5',
    category: 'account',
    q: 'Q5：註冊時卡在「Verify your account（真人驗證）」無法完成？',
    a: `
      <p><strong>建議處理步驟：</strong></p>
      <ol>
        <li>依畫面提示重新嘗試，或切換為語音驗證題型。</li>
        <li>確認瀏覽器已開啟 JavaScript、網路連線穩定，並暫時關閉廣告阻擋或隱私防追蹤擴充套件，必要時改用一般 Chrome / Edge / Safari 視窗重試，或聯絡 GitHub Support。</li>
        <li><strong>嚴禁代辦：</strong>千萬不要為了通過真人驗證而請他人代做並交出自己的密碼！</li>
      </ol>
    `
  },
  {
    id: 'faq-6',
    category: 'twofa',
    q: 'Q6：輸入 2FA 驗證器 App 的 6 位數代碼，GitHub 卻提示代碼錯誤？',
    a: `
      <p><strong>建議處理步驟：</strong></p>
      <ol>
        <li><strong>確認對應帳號：</strong>確認手機打開的是當初綁定這個 GitHub 帳號的 TOTP App 項目（若 App 裡有多個帳號，請看清楚標籤是否為 <code>GitHub:你的Username</code>）。</li>
        <li><strong>校正手機時間（最常見原因！）：</strong>TOTP 代碼是依據標準時間每 30 秒計算出來的。請進入手機的「系統設定 → 日期與時間」，確認已開啟「<strong>自動設定日期與時間（網路提供時間）</strong>」。</li>
        <li><strong>等待下一組新代碼：</strong>若畫面上的 6 位數代碼剛好在倒數最後幾秒，請等它跳出下一組新的 6 位數代碼再輸入。</li>
      </ol>
      <p><small>參考來源：<a href="https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/troubleshooting-two-factor-authentication-issues" target="_blank" rel="noopener noreferrer">2FA 疑難排解 (GitHub Docs) ↗</a></small></p>
    `
  },
  {
    id: 'faq-7',
    category: 'twofa',
    q: 'Q7：手機遺失、損壞或更換新手機時，無法取得 2FA 驗證碼怎麼辦？',
    a: `
      <p><strong>建議處理步驟：</strong></p>
      <ul>
        <li><strong>換新手機前（舊手機還在）：</strong>先在 Google Authenticator 確認帳號雲端同步或使用「轉移帳戶」功能移至新手機；或登入 GitHub <code>Settings → Password and authentication</code>，在 <code>Authenticator app</code> 旁按 <code>Edit</code> 用新手機重新掃描設定（確認新手機可登入後再清除舊手機）。</li>
        <li><strong>手機已遺失／故障（使用復原碼）：</strong>在 GitHub 登入驗證畫面選擇使用 <strong>Recovery code（復原碼）</strong> 或先前設定的備用方法（如 Passkey、安全金鑰、GitHub Mobile）登入，進入帳號後再重新綁定新的驗證器 App。</li>
        <li><strong>所有因素與復原碼皆遺失：</strong>若沒有保存復原碼、也沒有任何備用方法，只能嘗試透過曾經登入過的已驗證裝置（保留有 <code>_device_id</code> cookie）、SSH 金鑰或 PAT 走 GitHub 帳號復原流程，且<strong>官方不保證一定能恢復帳號</strong>。</li>
      </ul>
      <p><small>參考來源：<a href="https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/recovering-your-account-if-you-lose-your-2fa-credentials" target="_blank" rel="noopener noreferrer">遺失 2FA 憑證時復原帳號 (GitHub Docs) ↗</a></small></p>
    `
  },
  {
    id: 'faq-8',
    category: 'email',
    q: 'Q8：提示「Email is already taken（此信箱已被使用）」，或是擔心學校信箱畢業後失效？',
    a: `
      <p><strong>建議處理步驟：</strong></p>
      <ul>
        <li><strong>信箱已被使用：</strong>同一個電子郵件地址不能同時綁定在兩個 GitHub 個人帳號上。請直接點選 <code>Sign in</code> 嘗試用該信箱登入，或使用 <code>Forgot password?</code> 重設舊帳號密碼，不必重新申請。</li>
        <li><strong>學校信箱畢業問題：</strong>您可以在註冊後進入 <code>Settings → Emails</code>，新增一個私人長期信箱（如 Gmail）並完成驗證，未來隨時可將主要信箱（Primary email）切換為私人信箱，原帳號的所有儲存庫與紀錄都會完整保留。</li>
      </ul>
      <p><small>參考來源：<a href="https://docs.github.com/en/account-and-profile/how-tos/email-preferences/changing-your-primary-email-address" target="_blank" rel="noopener noreferrer">更換主要電子郵件地址 (GitHub Docs) ↗</a></small></p>
    `
  },
  {
    id: 'faq-9',
    category: 'twofa',
    q: 'Q9：已完成電子郵件驗證，為什麼組織或系統還是要求我開啟 2FA？',
    a: `
      <p><strong>官方政策說明：</strong></p>
      <ul>
        <li><strong>電子郵件驗證不等於 2FA：</strong>GitHub 官方明確規定，電子郵件驗證（或新裝置的 Email 登入確認碼）不能充當兩階段驗證（2FA）的第二因素。</li>
        <li>當您的帳號被選入 GitHub 程式碼貢獻者強制 2FA 計畫（有 45 天設定期＋7 天寬限期），或是您加入的學校課程／專案組織開啟了強制 2FA 要求時，就必須到 <code>Settings → Password and authentication</code> 完成 TOTP 驗證器與復原碼設定。</li>
      </ul>
      <p><small>參考來源：<a href="https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/about-mandatory-two-factor-authentication" target="_blank" rel="noopener noreferrer">關於強制 2FA (GitHub Docs) ↗</a></small></p>
    `
  }
];

// ==================== 4. 完成檢查表（5 項，手冊原文對照） ====================
const FINAL_CHECKLIST = [
  {
    id: 'verify-1',
    text: '我能登入 github.com，並記得自己的 Username（公開帳號名稱）。'
  },
  {
    id: 'verify-2',
    text: '我已完成主要電子郵件驗證（Settings → Emails 顯示 Primary 且無 Unverified 警告）。'
  },
  {
    id: 'verify-3',
    text: '我已安裝可信來源的 TOTP 驗證器 App（如 Google LLC 開發之 Google Authenticator），並在 GitHub 啟用 2FA（顯示 Enabled）。'
  },
  {
    id: 'verify-4',
    text: '我已把 2FA 復原碼（Recovery codes）下載存到安全位置，且知道日後如何找回。'
  },
  {
    id: 'verify-5',
    text: '我沒有把密碼、電子郵件驗證碼、TOTP 設定金鑰（QR code / setup key）或復原碼交給別人。'
  }
];

// ==================== 狀態管理 ====================
const state = {
  activeModule: 'signup', // 'prep' | 'signup' | 'twofa' | 'faq' | 'verify'
  activeSignupIdx: 0,
  activeTwofaIdx: 0,
  faqCategory: 'all',
  faqSearch: '',
  completedIds: new Set()
};

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        state.completedIds = new Set(parsed);
      }
    }
  } catch (e) {
    // 忽略無痕模式或存取限制
  }
}

function saveProgress() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(state.completedIds)));
  } catch (e) {
    // 忽略儲存限制
  }
}

function toggleCompleted(id, forceState) {
  if (typeof forceState === 'boolean') {
    if (forceState) state.completedIds.add(id);
    else state.completedIds.delete(id);
  } else {
    if (state.completedIds.has(id)) state.completedIds.delete(id);
    else state.completedIds.add(id);
  }
  saveProgress();
  renderAll();
}

// ==================== 渲染函式 ====================

function renderPrepModule() {
  const container = document.getElementById('prep-cards-container');
  if (!container) return;

  container.innerHTML = PREP_ITEMS.map((item) => {
    const isDone = state.completedIds.has(item.id);
    const linksHtml = item.links
      .map((l) => `<a href="${l.url}" target="_blank" rel="noopener noreferrer">${l.label} ↗</a>`)
      .join(' · ');

    return `
      <article class="prep-card ${isDone ? 'completed' : ''}">
        <div>
          <div class="prep-card-header">
            <span class="prep-step-tag">${item.tag}</span>
            ${isDone ? '<span class="step-done-tag">✓ 已確認</span>' : ''}
          </div>
          <h3>${item.title}</h3>
          <p>${item.desc}</p>
          <div style="font-size:0.84rem;">${linksHtml}</div>
        </div>
        <label class="prep-check-label">
          <input type="checkbox" data-check-id="${item.id}" ${isDone ? 'checked' : ''} />
          <span>${isDone ? '已完成此項準備確認' : '勾選確認已完成此項準備'}</span>
        </label>
      </article>
    `;
  }).join('');
}

function renderWorkbench(steps, activeIdx, listElId, stageElId, countElId, workbenchType) {
  const listEl = document.getElementById(listElId);
  const stageEl = document.getElementById(stageElId);
  const countEl = document.getElementById(countElId);
  if (!listEl || !stageEl) return;

  const doneCount = steps.filter((s) => state.completedIds.has(s.id)).length;
  if (countEl) {
    countEl.textContent = `已完成 ${doneCount} / ${steps.length}`;
  }

  // 渲染左側清單
  listEl.innerHTML = steps.map((step, idx) => {
    const isDone = state.completedIds.has(step.id);
    const isActive = idx === activeIdx;
    return `
      <li>
        <button type="button" class="step-nav-btn ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}"
          data-workbench="${workbenchType}" data-step-idx="${idx}"
          aria-current="${isActive ? 'step' : 'false'}">
          <span class="step-index-circle">${isDone ? '✓' : step.num}</span>
          <span class="step-nav-title">步驟 ${step.num}：${step.shortTitle}</span>
          ${isDone ? '<span class="step-done-tag">完成</span>' : ''}
        </button>
      </li>
    `;
  }).join('');

  // 渲染右側舞台
  const current = steps[activeIdx];
  const isCurrentDone = state.completedIds.has(current.id);
  const hasPrev = activeIdx > 0;
  const hasNext = activeIdx < steps.length - 1;

  const bulletsHtml = current.bullets.map((b) => `<li>${b}</li>`).join('');
  const termsHtml = current.uiTerms
    .map((t) => `<span class="ui-term-chip" title="GitHub 畫面英文原文對照">${t}</span>`)
    .join('');
  const linksHtml = current.links
    .map((l) => `<a href="${l.url}" target="_blank" rel="noopener noreferrer">${l.label} ↗</a>`)
    .join(' · ');

  let nextActionBtnHtml = '';
  if (hasNext) {
    nextActionBtnHtml = `
      <button type="button" class="btn btn-primary" data-nav-workbench="${workbenchType}" data-nav-dir="1">
        下一步：步驟 ${steps[activeIdx + 1].num} →
      </button>
    `;
  } else if (workbenchType === 'signup') {
    nextActionBtnHtml = `
      <button type="button" class="btn btn-primary" data-goto-module="twofa">
        進入獨立專區：兩階段驗證 (2FA) 教學 →
      </button>
    `;
  } else {
    nextActionBtnHtml = `
      <button type="button" class="btn btn-primary" data-goto-module="verify">
        前往完成檢查表與驗收確認 →
      </button>
    `;
  }

  stageEl.innerHTML = `
    <div class="stage-top-bar">
      <div class="stage-step-badge">
        <span>${workbenchType === 'signup' ? '第一部分 · 帳號申請導覽' : '第四部分 · 開啟驗證器 2FA 導覽'}</span>
        <span>｜</span>
        <span>第 ${current.num} / ${steps.length} 步</span>
      </div>
      <label class="stage-check-toggle ${isCurrentDone ? 'checked' : ''}">
        <input type="checkbox" data-check-id="${current.id}" ${isCurrentDone ? 'checked' : ''} />
        <span>${isCurrentDone ? '✓ 本步驟已標記完成' : '勾選標記本步驟完成'}</span>
      </label>
    </div>

    <h3 class="stage-title">${current.title}</h3>
    <p class="stage-summary">${current.summary}</p>

    <div class="stage-columns">
      <div class="instruction-box">
        <h4>操作步驟與核對重點</h4>
        <ul class="instruction-list">
          ${bulletsHtml}
        </ul>
        <div class="ui-terms-row" aria-label="畫面英文按鈕與欄位名稱對照">
          <span style="font-size:0.78rem; color:#57606a; font-weight:700; width:100%;">GitHub 畫面原文／按鈕名稱對照：</span>
          ${termsHtml}
        </div>
      </div>

      <div class="visual-preview-card">
        <div class="visual-preview-banner">
          <span class="specimen-tag">唯讀對照畫面</span>
          <span>非真實輸入表單 · 實際操作請至 github.com</span>
        </div>
        <div class="visual-preview-body">
          ${current.visualHtml}
        </div>
      </div>
    </div>

    <div class="stage-callout ${current.calloutType === 'danger' ? 'callout-danger' : ''}" role="note">
      <strong>⚠️ ${current.calloutTitle}</strong>
      <div>${current.calloutText}</div>
    </div>

    <div class="stage-footer-nav">
      <div class="stage-sources">
        <strong>官方來源與直達連結：</strong>
        ${linksHtml}
      </div>
      <div class="stage-nav-buttons">
        <button type="button" class="btn btn-outline" data-nav-workbench="${workbenchType}" data-nav-dir="-1" ${!hasPrev ? 'disabled style="opacity:0.45;cursor:not-allowed;"' : ''}>
          ← 上一步
        </button>
        <button type="button" class="btn btn-secondary" data-complete-and-next="${workbenchType}" data-check-id="${current.id}">
          ✓ 勾選完成並前往下一步
        </button>
        ${nextActionBtnHtml}
      </div>
    </div>
  `;
}

function renderFaqModule() {
  const container = document.getElementById('faq-list-container');
  if (!container) return;

  const qSearch = state.faqSearch.trim().toLowerCase();
  const filtered = FAQ_ITEMS.filter((item) => {
    const matchCat = state.faqCategory === 'all' || item.category === state.faqCategory;
    const matchText = !qSearch || item.q.toLowerCase().includes(qSearch) || item.a.toLowerCase().includes(qSearch);
    return matchCat && matchText;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="instruction-box" style="text-align:center; padding:28px;">
        <p style="margin:0;">找不到符合「<strong>${state.faqSearch}</strong>」的常見問題，請嘗試其他關鍵字或切換回「全部問題」。</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map((item) => `
    <details class="faq-item" open>
      <summary class="faq-question-btn">
        <span>${item.q}</span>
        <span style="font-size:0.82rem; color:#0969da;">點擊收合/展開</span>
      </summary>
      <div class="faq-answer">
        ${item.a}
      </div>
    </details>
  `).join('');
}

function renderVerifyModule() {
  const container = document.getElementById('final-checklist-container');
  if (!container) return;

  container.innerHTML = FINAL_CHECKLIST.map((item) => {
    const isDone = state.completedIds.has(item.id);
    return `
      <label class="final-check-item ${isDone ? 'checked' : ''}">
        <input type="checkbox" data-check-id="${item.id}" ${isDone ? 'checked' : ''} />
        <span>${item.text}</span>
      </label>
    `;
  }).join('');
}

function renderProgressBadges() {
  const prepDone = PREP_ITEMS.filter((i) => state.completedIds.has(i.id)).length;
  const signupDone = SIGNUP_STEPS.filter((i) => state.completedIds.has(i.id)).length;
  const twofaDone = TWOFA_STEPS.filter((i) => state.completedIds.has(i.id)).length;
  const verifyDone = FINAL_CHECKLIST.filter((i) => state.completedIds.has(i.id)).length;

  const totalCount = PREP_ITEMS.length + SIGNUP_STEPS.length + TWOFA_STEPS.length + FINAL_CHECKLIST.length; // 4 + 10 + 10 + 5 = 29
  const totalDone = prepDone + signupDone + twofaDone + verifyDone;
  const pct = Math.round((totalDone / totalCount) * 100);

  const badgePrep = document.getElementById('badge-prep');
  const badgeSignup = document.getElementById('badge-signup');
  const badgeTwofa = document.getElementById('badge-twofa');
  const badgeVerify = document.getElementById('badge-verify');

  if (badgePrep) badgePrep.textContent = `${prepDone}/${PREP_ITEMS.length}`;
  if (badgeSignup) badgeSignup.textContent = `${signupDone}/${SIGNUP_STEPS.length}`;
  if (badgeTwofa) badgeTwofa.textContent = `${twofaDone}/${TWOFA_STEPS.length}`;
  if (badgeVerify) badgeVerify.textContent = `${verifyDone}/${FINAL_CHECKLIST.length}`;

  const textEl = document.getElementById('overall-progress-text');
  const fillEl = document.getElementById('overall-progress-fill');
  const barEl = document.getElementById('overall-progressbar');

  if (textEl) textEl.textContent = `${totalDone} / ${totalCount} 項 (${pct}%)`;
  if (fillEl) fillEl.style.width = `${pct}%`;
  if (barEl) barEl.setAttribute('aria-valuenow', String(pct));
}

function switchModule(targetModule, shouldScroll = false) {
  state.activeModule = targetModule;

  document.querySelectorAll('.module-tab').forEach((tab) => {
    const isMatch = tab.getAttribute('data-target') === targetModule;
    tab.classList.toggle('active', isMatch);
    tab.setAttribute('aria-selected', isMatch ? 'true' : 'false');
  });

  document.querySelectorAll('.module-panel').forEach((panel) => {
    const isMatch = panel.id === `panel-${targetModule}`;
    panel.classList.toggle('active', isMatch);
    if (isMatch) {
      panel.removeAttribute('hidden');
    } else {
      panel.setAttribute('hidden', '');
    }
  });

  if (shouldScroll) {
    const mainEl = document.getElementById('main-content');
    if (mainEl) {
      mainEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

function renderAll() {
  renderPrepModule();
  renderWorkbench(SIGNUP_STEPS, state.activeSignupIdx, 'signup-step-list', 'signup-step-stage', 'signup-progress-count', 'signup');
  renderWorkbench(TWOFA_STEPS, state.activeTwofaIdx, 'twofa-step-list', 'twofa-step-stage', 'twofa-progress-count', 'twofa');
  renderFaqModule();
  renderVerifyModule();
  renderProgressBadges();
}

// ==================== 事件綁定與鍵盤操作 ====================
function initEvents() {
  // 頂部模組切換 Tab
  document.querySelectorAll('.module-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-target');
      if (target) switchModule(target, false);
    });
  });

  // 全域點擊委派（步驟切換、前後導覽、跨模組跳轉）
  document.addEventListener('click', (e) => {
    const stepBtn = e.target.closest('[data-workbench][data-step-idx]');
    if (stepBtn) {
      const wb = stepBtn.getAttribute('data-workbench');
      const idx = parseInt(stepBtn.getAttribute('data-step-idx'), 10);
      if (wb === 'signup') state.activeSignupIdx = idx;
      if (wb === 'twofa') state.activeTwofaIdx = idx;
      renderAll();
      return;
    }

    const navBtn = e.target.closest('[data-nav-workbench]');
    if (navBtn && !navBtn.disabled) {
      const wb = navBtn.getAttribute('data-nav-workbench');
      const dir = parseInt(navBtn.getAttribute('data-nav-dir'), 10);
      if (wb === 'signup') {
        const next = state.activeSignupIdx + dir;
        if (next >= 0 && next < SIGNUP_STEPS.length) {
          state.activeSignupIdx = next;
          renderAll();
        }
      } else if (wb === 'twofa') {
        const next = state.activeTwofaIdx + dir;
        if (next >= 0 && next < TWOFA_STEPS.length) {
          state.activeTwofaIdx = next;
          renderAll();
        }
      }
      return;
    }

    const completeNextBtn = e.target.closest('[data-complete-and-next]');
    if (completeNextBtn) {
      const wb = completeNextBtn.getAttribute('data-complete-and-next');
      const checkId = completeNextBtn.getAttribute('data-check-id');
      state.completedIds.add(checkId);
      saveProgress();
      if (wb === 'signup') {
        if (state.activeSignupIdx < SIGNUP_STEPS.length - 1) {
          state.activeSignupIdx += 1;
        } else {
          switchModule('twofa', true);
        }
      } else if (wb === 'twofa') {
        if (state.activeTwofaIdx < TWOFA_STEPS.length - 1) {
          state.activeTwofaIdx += 1;
        } else {
          switchModule('verify', true);
        }
      }
      renderAll();
      return;
    }

    const gotoBtn = e.target.closest('[data-goto-module]');
    if (gotoBtn) {
      const target = gotoBtn.getAttribute('data-goto-module');
      switchModule(target, true);
      return;
    }

    const faqCatBtn = e.target.closest('[data-faq-cat]');
    if (faqCatBtn) {
      state.faqCategory = faqCatBtn.getAttribute('data-faq-cat');
      document.querySelectorAll('[data-faq-cat]').forEach((b) => {
        b.classList.toggle('active', b === faqCatBtn);
      });
      renderFaqModule();
    }
  });

  // 勾選框變更委派
  document.addEventListener('change', (e) => {
    const checkbox = e.target.closest('input[type="checkbox"][data-check-id]');
    if (checkbox) {
      const id = checkbox.getAttribute('data-check-id');
      toggleCompleted(id, checkbox.checked);
    }
  });

  // 一鍵勾選與重設進度
  const btnSignupAll = document.getElementById('btn-signup-mark-all');
  if (btnSignupAll) {
    btnSignupAll.addEventListener('click', () => {
      const allDone = SIGNUP_STEPS.every((s) => state.completedIds.has(s.id));
      SIGNUP_STEPS.forEach((s) => {
        if (allDone) state.completedIds.delete(s.id);
        else state.completedIds.add(s.id);
      });
      saveProgress();
      renderAll();
    });
  }

  const btnTwofaAll = document.getElementById('btn-twofa-mark-all');
  if (btnTwofaAll) {
    btnTwofaAll.addEventListener('click', () => {
      const allDone = TWOFA_STEPS.every((s) => state.completedIds.has(s.id));
      TWOFA_STEPS.forEach((s) => {
        if (allDone) state.completedIds.delete(s.id);
        else state.completedIds.add(s.id);
      });
      saveProgress();
      renderAll();
    });
  }

  const btnReset = document.getElementById('btn-reset-progress');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      state.completedIds.clear();
      saveProgress();
      renderAll();
    });
  }

  // FAQ 搜尋與全部展開/收合
  const faqInput = document.getElementById('faq-search-input');
  if (faqInput) {
    faqInput.addEventListener('input', (e) => {
      state.faqSearch = e.target.value || '';
      renderFaqModule();
    });
  }

  const btnExpandAll = document.getElementById('btn-faq-expand-all');
  if (btnExpandAll) {
    btnExpandAll.addEventListener('click', () => {
      document.querySelectorAll('#faq-list-container details').forEach((d) => d.setAttribute('open', ''));
    });
  }

  const btnCollapseAll = document.getElementById('btn-faq-collapse-all');
  if (btnCollapseAll) {
    btnCollapseAll.addEventListener('click', () => {
      document.querySelectorAll('#faq-list-container details').forEach((d) => d.removeAttribute('open'));
    });
  }

  // 鍵盤左右方向鍵切換步驟（當焦點不在輸入框時）
  document.addEventListener('keydown', (e) => {
    const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

    if (e.key === 'ArrowRight') {
      if (state.activeModule === 'signup' && state.activeSignupIdx < SIGNUP_STEPS.length - 1) {
        state.activeSignupIdx += 1;
        renderAll();
      } else if (state.activeModule === 'twofa' && state.activeTwofaIdx < TWOFA_STEPS.length - 1) {
        state.activeTwofaIdx += 1;
        renderAll();
      }
    } else if (e.key === 'ArrowLeft') {
      if (state.activeModule === 'signup' && state.activeSignupIdx > 0) {
        state.activeSignupIdx -= 1;
        renderAll();
      } else if (state.activeModule === 'twofa' && state.activeTwofaIdx > 0) {
        state.activeTwofaIdx -= 1;
        renderAll();
      }
    }
  });
}

// 啟動初始化
document.addEventListener('DOMContentLoaded', () => {
  loadProgress();
  initEvents();
  renderAll();
});
