# K3s 與地端 LLM 服務講義：為什麼用、怎麼搭、用在哪裡

Nov 18, 2026 · @Lin Wen Yen

## 一、為什麼 Docker 還不夠

Docker 解決了「怎麼把一個服務打包好、到哪都能跑」，但沒有解決「服務上線後誰來照顧它」。

沿用廚房的比喻：一個容器像一座備齊廚具與食材的工作站，開起來就能出菜。客人變多時，問題才開始：

- 誰決定再開幾座工作站？
- 某座工作站突然停擺，誰發現並補上新的一座？
- 客人進門後，誰負責分配到不同的工作站？

只用 Docker，這些事都要人手動處理：自己多下幾次 `docker run`、自己修改 Nginx 的後端清單、自己盯著容器有沒有掛。Docker Compose 能把多個容器寫進同一份檔案，但它的主要場景是單一主機，也不會依負載自動增減副本。

這類工作稱為**容器編排（orchestration）**，相當於餐廳的經理。Kubernetes 是被廣泛採用的編排系統，K3s 則是它的輕量版本（第三節說明）。

## 二、Kubernetes 的核心觀念：宣告期望狀態，系統負責達成

Kubernetes（簡稱 K8s）的做法是：你只描述「我要什麼樣子」，系統持續讓現實貼近這份描述。本週任務會用到下列六個角色。

| 物件 | 白話角色 | 本週任務中的用途 |
| --- | --- | --- |
| Pod | 一座工作站，是 K8s 排程的最小單位，裡面跑一個或幾個緊密配合的容器 | 每個 Pod 跑一份 Open WebUI |
| Deployment | 「我要 N 座相同工作站」的訂單，底下由 ReplicaSet 維持副本數，也負責更新版本 | 宣告 Open WebUI 的映像、環境變數與資源需求 |
| Service | 工作站的固定櫃台。Pod 會換，Service 的位址不變，並把流量分給就緒的 Pod | 給 Ingress 一個穩定的後端入口 |
| Ingress | 餐廳大門的接待，依網域與路徑把外部 HTTP 請求導向對應的 Service，需要 Ingress Controller 執行（K3s 內建 Traefik） | 讓 `qN.qqnice.org` 進得來 |
| HPA | 依忙碌程度自動調整訂單數量的調度員 | 依 CPU 使用率在 1 到 4 個 Pod 之間調整 |
| metrics-server | 提供各 Pod 用量的儀表 | HPA 的資料來源 |

理解這些物件的關鍵是一個比對迴圈，也就是任務書中的「自癒」原理：

1. 你宣告期望：Open WebUI 要有 N 個副本。
2. 控制器持續比對「實際的副本數」和「期望的副本數」。
3. 兩者不同就動手：少了就補，多了就收。

學生手動刪除一個 Pod，等於讓實際少了一個，控制器發現後就補一個新的。HPA 則是改變「期望的 N」，Deployment 再讓現實去追上。

## 三、K3s 是什麼：把 Kubernetes 精簡打包成單一執行檔

K3s 是符合 Kubernetes 標準、可用於正式環境的輕量發行版，把非容器化的叢集元件整合成一個小於 100 MB 的執行檔。官方將它定位為「distribution」而非 fork，目標是盡量貼近上游 Kubernetes（[K3s 官方 README](https://github.com/k3s-io/k3s)）。預設資料庫使用 sqlite3，也支援 etcd3、MariaDB、MySQL 與 Postgres。

它原本就是為資源有限、維運人力有限的場景設計。官方列出的適用情境包括 Edge、IoT、CI、開發環境、ARM 架構，以及無法投入大量 Kubernetes 專業維運資源的情境。官方最低硬體需求為 server 2 核心、2 GB RAM，agent 1 核心、512 MB RAM，這些數字不包含工作負載本身（[K3s 需求說明](https://docs.k3s.io/installation/requirements)）。

### 安裝完就已經附帶的元件

上游 Kubernetes 需要自己挑選並安裝網路外掛、Ingress、metrics-server 等。K3s 把常用的已經備好，這也是本週任務能在一臺 VM 上快速完成的原因：

| 元件 | 功能 | 與本週任務的關係 |
| --- | --- | --- |
| containerd 與 runc | 容器執行環境，K3s 不依賴 Docker | 拉映像、跑 Pod。K3s 的映像庫與 Docker 分開，本機 Docker 映像不會自動出現在 K3s |
| Flannel | Pod 之間的網路（CNI） | Pod 連到主機 Ollama 的網路路徑 |
| CoreDNS | 叢集內的名稱解析 | Service 名稱對應到 IP |
| Traefik | Ingress Controller | 對外入口，讓網域導向 Open WebUI |
| Klipper-lb（ServiceLB） | 讓 LoadBalancer 類型的 Service 在沒有雲端的環境也能運作 | 讓 Traefik 能對外接收流量，預設會使用主機的 80/443 |
| Metrics Server | 提供 Pod 與節點的 CPU、記憶體用量 | HPA 的資料來源，`kubectl top` 也靠它 |
| Local-path-provisioner | 用主機本機目錄提供儲存 | 本週不使用（容器採無狀態設計） |

以上元件列表來自 K3s 官方 README，這些元件都可以停用或替換。

### 和 Docker Compose、完整 Kubernetes 比較

| 比較項目 | Docker Compose | K3s | 完整 Kubernetes（自行組裝） |
| --- | --- | --- | --- |
| 設計重點 | 以單一主機描述多個容器 | 輕量、單一執行檔、內建常用元件 | 彈性高，元件自行挑選組裝 |
| 容器掛掉時 | 依 restart policy 重啟該容器 | Deployment 控制器補回副本 | 同 K3s |
| 依負載自動增減 | 無 | 有（HPA + Metrics Server） | 有（需自行安裝 metrics-server） |
| 多主機叢集 | 以單機為主 | 支援（server 與 agent 節點） | 支援 |
| 起步成本 | 低 | 中，需要理解 K8s 物件 | 高 |

最後一列為概略比較，不是官方數據。

## 四、本課場景：前端交給 K3s，模型留在主機

這個架構把「很重、不適合複製」的模型留在主機，把「很輕、可以複製」的網頁前端交給 K3s 管理。

&#91;embedded content: 架構圖 · 使用者經 Traefik 到 Open WebUI Pod，再連到主機上的 Ollama\]

圖中畫出 3 個 Open WebUI 副本作為示意，實際數量由 HPA 在 1 到 4 之間調整；Ollama 始終只有一個。

| 元件 | 放在哪裡 | 為什麼 | 誰負責維持運作 |
| --- | --- | --- | --- |
| Ollama | 主機，由 systemd 管控 | 模型載入後占用大量記憶體：CPU 推論用系統記憶體，GPU 推論用 VRAM；Ollama 也自帶請求排隊機制（[Ollama FAQ](https://docs.ollama.com/faq.md)）。合理推論：多開一份只會多載入一份模型 | systemd |
| Open WebUI | K3s 內的 Pod | 合理推論：網頁前端本身運算量小，容易複製；各副本設定一致，就能互相替換 | Deployment 維持副本數，HPA 調整數量 |
| Traefik | K3s 內建的 Ingress Controller | 對外只開 80/443，依網域導向 Open WebUI | K3s |

### 為什麼這個場景選 K3s

- 一臺 VM 要同時跑 Ollama 與叢集，資源吃緊。K3s 官方最低需求是 server 2 核心、2 GB RAM（不含工作負載），比自行組裝的完整 Kubernetes 輕量（[K3s 需求說明](https://docs.k3s.io/installation/requirements)）。
- K3s 已內建 Traefik 與 Metrics Server，不必另外安裝就能做到 Ingress 與 HPA（[K3s 官方 README](https://github.com/k3s-io/k3s)）。
- 單一節點就能完整體驗 Deployment、Service、Ingress、HPA 這組概念，之後換成多節點或雲端託管叢集，觀念可以直接沿用。

### 最容易卡關的一條連線

圖中最右邊那條箭頭，是本週最容易卡關的地方。Ollama 預設只綁定 127.0.0.1:11434，只接受主機本機的連線（[Ollama FAQ](https://docs.ollama.com/faq.md)）；而 Pod 有自己獨立的網路空間，從 Pod 裡看出去的 127.0.0.1 並不是主機。

這條連線為什麼會不通、要怎麼打通，是本週任務的探索重點之一，請自己驗證，不要只依賴 AI 給的答案。同時要記得，Ollama 的 11434 埠不應該對公網開放。

## 五、這個架構的限制：誠實說明

本任務驗證的是 Kubernetes 的擴展與自癒機制，並不代表聊天服務的實際容量因此提高。有兩個限制要先說清楚。

### 限制一：增加 Open WebUI Pod，不會讓模型回答變快

Ollama 每個已載入的模型，預設一次只處理 1 個請求（`OLLAMA_NUM_PARALLEL` 預設為 1），其餘請求排隊；佇列預設上限為 512，超過就回傳 `503` 過載錯誤。調高並行數需要更多記憶體，所需 RAM 與 `OLLAMA_NUM_PARALLEL` 乘以上下文長度成正比（[Ollama FAQ](https://docs.ollama.com/faq.md)）。

所以瓶頸在模型推論端，不在網頁前端。前端 Pod 再多，請求還是要排隊等同一個 Ollama。合理推論：真正要提高容量，需要在模型服務端擴充，例如更多 GPU 或主機，這不屬於本課範圍。這也是任務書要求「壓測別打聊天 API」的原因：那會壓到 Ollama，而不是觸發 HPA。

### 限制二：Open WebUI 預設不支援直接多副本

Open WebUI 官方說明，標準映像檔是單一實例，內含嵌入式 SQLite、嵌入式 ChromaDB 與本機檔案儲存，這種設定不能直接多實例運行。水平擴展需要共享的持久化與協調服務（[Scaling Open WebUI](https://docs.openwebui.com/getting-started/advanced-topics/scaling.md)）。官方列出的需求與本課做法對照如下：

| 項目 | 官方多副本需求 | 本課的簡化做法 |
| --- | --- | --- |
| 資料庫 | PostgreSQL（`DATABASE_URL`） | 每個 Pod 內建 SQLite，不共享 |
| 即時協調 | Redis | 不使用 |
| `WEBUI_SECRET_KEY` | 所有副本必須相同，否則發生登入循環與 401 錯誤 | 用 Secret 注入，所有副本相同 |
| 向量資料庫 | 必須使用外部向量資料庫 | 內建 ChromaDB，不使用文件上傳與 RAG 功能 |
| 檔案儲存 | 共享檔案系統或物件儲存 | 不使用 |

因此，本課「無狀態、不持久化」的做法是為了教學而簡化，不是官方支援的正式多副本部署。後果有三點：

- 各 Pod 的資料彼此獨立，對話紀錄不會跨 Pod 保留。
- 官方說明嵌入式 ChromaDB 只允許單一程序寫入，多副本同時寫入（例如上傳文件）可能導致程序崩潰。實作時請不要上傳文件。
- 若不關閉登入功能，帳號也會因為資料庫各自獨立而不一致，所以任務書要求以單一使用者模式運行。

要把它改成正式環境，就是把上表每一項改成共享服務，這也是任務書「取捨說明」這一題要你回答的內容。

## 六、業界應用情境：K3s 適合用在哪裡

K3s 適合資源有限、維運人力有限，卻仍想使用 Kubernetes 機制的場景。下表標明哪些是官方列出的適用情境，哪些是根據課程脈絡的合理推論。

| 情境 | 為什麼適合 | 和本課的對應 |
| --- | --- | --- |
| 邊緣與現場（分店、工廠、IoT 閘道） | 官方適用情境之一。小型主機就能運行，現場沒有專職維運人員，靠自愈機制維持服務 | 合理推論：單節點 K3s 搭配本地模型，提供現場使用的 AI 助理 |
| 企業內部的私有 LLM 入口 | 合理推論：模型與對話都在自己的主機，不需把內容送到外部雲端服務，較容易配合內部資料管理規定 | 前端用 Open WebUI 多副本分流，模型留在主機。正式上線需要第五節表格中的共享服務 |
| 開發與測試、CI | 官方適用情境之一。一臺 VM 或筆電就能建出與正式環境相近的叢集，快速建立、快速重置 | 在送上雲端託管 Kubernetes 之前，先用 K3s 驗證 YAML |
| 教學與實驗室、小型團隊自架 | 合理推論：一臺主機就能實作 Deployment、Service、Ingress、HPA 等物件，門檻低 | 本週任務就是這個場景 |

官方適用情境的依據：[K3s 官方 README](https://github.com/k3s-io/k3s)。

### 和雲端託管 Kubernetes 的關係

K3s 符合 Kubernetes 標準，所以學到的觀念可以直接移轉。Open WebUI 官方的 Helm 部署文件說明，它可部署在任何 Kubernetes 發行版上，列出的包括 EKS、AKS、GKE、OpenShift、Rancher 與自行架設的叢集（[Open WebUI Helm 部署](https://docs.openwebui.com/enterprise/deployment/kubernetes-helm.md)）。其中 AKS 就是 Azure 的託管服務，也是同學平常實作所在的雲端。

差異主要在周邊元件。例如這份文件的範例使用 nginx Ingress，而 K3s 內建的是 Traefik，設定與註解的寫法會不同。Deployment、Service、HPA 的概念則相同。

### 什麼時候不需要 K3s

合理推論：單一主機、單一服務、流量穩定、不需要自動擴展的情況，Docker Compose 已經足夠，硬上編排反而增加維運負擔。是否要用編排工具，要看的是需求，而不是工具本身是否流行。

## 七、本週任務與 Kubernetes 物件的對照

三個驗收指標各自在驗證不同的機制。先知道「這一項在驗證什麼」，卡關時才知道從哪裡查。

| 驗收指標 | 驗證的機制 | 你應該看到的證據 | 失敗時先查 |
| --- | --- | --- | --- |
| 對外服務正常 | Ingress 到 Service 再到 Pod 的路徑，以及 Pod 到 Ollama 的連線 | 瀏覽器開得到網域，選模型後對話有回覆 | Traefik 是否拿得到 80/443；Ollama 監聽位址（`OLLAMA_HOST`）；Open WebUI 的 `OLLAMA_BASE_URL` |
| 動態擴展 | HPA、Metrics Server、資源 `requests` | `kubectl get hpa -w` 的 TARGETS 上升，REPLICAS 從 1 增加到至少 3，停止壓測後縮回 | TARGETS 顯示 `<unknown>`：檢查 `requests` 與 `kubectl top pods`。縮減較慢是正常的 |
| 自動修復 | Deployment 與 ReplicaSet 的控制迴圈，搭配 readinessProbe | 刪除 Pod 後新 Pod 自動出現並進入 Ready，持續請求沒有整體中斷 | 沒有 readinessProbe，或副本只有 1 個，都可能造成短暫中斷 |

兩個容易誤解的觀念：

- HPA 的 CPU 使用率是相對於 Pod 容器上所指定的資源量計算（[HPA Walkthrough](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale-walkthrough)），實務上就是 `requests`。沒設定時算不出百分比，TARGETS 會顯示 `<unknown>`。
- 縮減比擴展慢，是因為縮減預設有 300 秒的穩定視窗，用來避免副本數因短暫波動而來回跳動（[HPA API 參考](https://docs.okd.io/4.15/rest_api/autoscale_apis/horizontalpodautoscaler-autoscaling-v2.html)）。這是設計使然，不是故障。

## 八、課堂討論題與名詞表

以下是課堂討論題，用來檢查自己是否真的理解。驗收時的口頭問答另有題庫，不在此列。

1. 如果同時有 100 位同學對同一個 Ollama 送出聊天請求，增加 Open WebUI Pod 會改善什麼？不會改善什麼？
2. 你的公司只有一台主機、一個內部工具、使用者約 20 人。你會選 Docker Compose 還是 K3s？說明理由。
3. 畫出一個請求從瀏覽器到 Ollama 回覆的完整路徑，標出每一個經過的元件。
4. 把 Open WebUI 的資料改放 PostgreSQL 與 Redis 之後，哪些問題會消失？哪些新元件要自己維運？
5. K3s 預設內建 Traefik。如果公司已經標準化使用 nginx Ingress，你會怎麼處理？

| 名詞 | 說明 |
| --- | --- |
| 容器編排（Orchestration） | 自動管理多個容器的部署、副本數、網路與更新 |
| 期望狀態（Desired state） | 你宣告「應該是什麼樣子」，控制器負責讓實際狀態符合它 |
| 發行版（Distribution） | 以上游 Kubernetes 為基礎、另行打包與整合的版本，K3s 即屬此類 |
| Pod | Kubernetes 排程的最小單位，內含一個或數個容器 |
| Deployment / ReplicaSet | 宣告並維持指定數量的相同 Pod，也負責更新版本 |
| Service | 為一組 Pod 提供穩定的位址，並把流量分給就緒的 Pod |
| Ingress / Ingress Controller | Ingress 是依網域與路徑導流的規則，Controller 是實際執行規則的元件（K3s 內建 Traefik） |
| HPA | 依指標（如 CPU 使用率）自動調整副本數 |
| Metrics Server | 蒐集並提供 Pod 與節點的資源用量 |
| requests / limits | requests 是排程與 HPA 計算使用率的資源基準，limits 是資源使用上限 |
| readinessProbe | 檢查 Pod 是否準備好接收流量，未就緒的 Pod 不會被導入流量 |
| livenessProbe | 檢查容器是否仍正常運作，失敗時容器會被重啟 |
| 無狀態（Stateless） | 容器內不保存需要長期保留的資料，任何副本被替換都不影響服務 |

## 九、參考資料

下列頁面為撰寫本講義時實際開啟或檢視過的官方文件，資料截至 2026-11-18。

- [K3s 官方 README](https://github.com/k3s-io/k3s)：定義、內建元件、預設資料庫、適用情境
- [K3s 安裝需求](https://docs.k3s.io/installation/requirements)：最低硬體需求與連接埠
- [Scaling Open WebUI](https://docs.openwebui.com/getting-started/advanced-topics/scaling.md)：多副本的前置條件與 SQLite 限制
- [Open WebUI Helm 部署](https://docs.openwebui.com/enterprise/deployment/kubernetes-helm.md)：可部署的 Kubernetes 發行版與 Ingress 範例
- [Ollama FAQ](https://docs.ollama.com/faq.md)：預設綁定位址、並行與佇列設定
- [Kubernetes Ingress 概念](https://kubernetes.io/docs/concepts/services-networking/ingress/)：Ingress 與 Ingress Controller
- [Kubernetes HPA 概念](https://kubernetes.io/docs/concepts/workloads/autoscaling/horizontal-pod-autoscale) 與 [HPA Walkthrough](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale-walkthrough)：HPA 的運作與 CPU 使用率的計算基準
- [HPA API 參考（OKD）](https://docs.okd.io/4.15/rest_api/autoscale_apis/horizontalpodautoscaler-autoscaling-v2.html)：縮減穩定視窗預設值

註：Kubernetes 官方頁面在擷取時內容被截斷，HPA 與 Ingress 的細節是依搜尋摘要與頁面可見部分整理，教學前建議對照原文。
