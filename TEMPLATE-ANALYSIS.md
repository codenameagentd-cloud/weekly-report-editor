# Template Design Analysis

> 設計新模板前必讀此文件。這是 14 套 David 認可模板的共性分析與設計原則。

## 分類與模板清單

### Dark / Bold（4 套）
| 模板 | 核心強項 | 設計語言 |
|------|---------|---------|
| Noir | 極端對比 + 反對稱佈局 | 純黑底、electric blue 單色 accent、172px 巨型標題、文字貼邊不居中 |
| Neon | 氛圍感 + 材質表現 | 霓虹 glow（text-shadow 多層）、scanline overlay、脈衝邊框 |
| Cinematic | 敘事節奏 + 沉浸感 | Letterbox 黑條、film grain、字幕式內容漸入、電影章節結構 |
| Mono Grid | 系統感 + 身份辨識 | 全 monospace、terminal prompt 裝飾、ASCII progress bars、行號 |

**共性：** 暗色背景讓 accent color 極其突出。typography 是唯一的視覺載體（無插圖依賴）。動效偏克制——Noir 用硬切、Mono Grid 用打字機效果，都服務於各自的「角色設定」。

**為什麼有效：** 暗色模板自帶權威感和專業度。單一 accent color 策略避免視覺噪音，讓資訊層級非常清晰。

---

### Minimal / Clean（4 套）
| 模板 | 核心強項 | 設計語言 |
|------|---------|---------|
| Swiss | 結構嚴謹 + 網格紀律 | Rigid 12-column grid、紅色幾何色塊作構圖元素、flush-left 大字 |
| Keynote | 呼吸感 + 聚焦 | 一頁一句、40% viewport 填充率、純 typography 無裝飾 |
| Outline | 輕盈感 + 動態驚喜 | 純線條定義空間、fill-on-enter 動效製造視覺節奏 |
| Classic | 完成度 + 可讀性 | Eyebrow line + card shadow + gradient text、最接近「標準簡報」但有設計感 |

**共性：** 大量留白不是「空」而是有意圖的負空間。Typography 承擔 80% 的設計工作。裝飾元素極少但每一個都有結構功能（Swiss 的色塊是構圖、Classic 的 eyebrow line 是層級）。

**為什麼有效：** 簡潔 = 信任。發給 VP/Director 時，乾淨的設計傳達「我知道什麼重要」。Keynote 的一頁一句強制精煉內容。

---

### Editorial / Warm（2 套）
| 模板 | 核心強項 | 設計語言 |
|------|---------|---------|
| Magazine | 排版工藝 + 非對稱張力 | Serif 大標、60/40 非對稱 grid、earth tones、pull-quote |
| Editorial | 閱讀體驗 + 文學感 | Drop cap、line-height 1.8+、quotation marks 裝飾、分隔線節奏 |

**共性：** Serif 字體帶來溫度和可信度。非對稱佈局製造視覺張力但不失平衡。內容密度比其他類別高，適合文字較多的報告。

**為什麼有效：** 當報告內容較長時，editorial 風格讓閱讀不疲勞。Serif + 大行距 = 長文閱讀最佳組合。

---

### Structural / Layout（3 套）
| 模板 | 核心強項 | 設計語言 |
|------|---------|---------|
| Split | 空間分割 + 導航感 | 固定暗色側欄 + 內容區、timeline dots、persistent navigation |
| Dashboard | 資訊密度 + 狀態一覽 | Metric cards、progress bars、status badges、section numbers |
| Kinetic | 動態體驗 + 驚喜感 | 左出右入 slide transition、word stagger、微旋轉、animated underline |

**共性：** 結構本身就是設計。Split 用空間分割建立階層，Dashboard 用卡片密度傳達效率，Kinetic 用動態建立節奏。這三套最「像產品」而非「像簡報」。

**為什麼有效：** 結構型模板讓複雜資訊自然分區。Dashboard 特別適合進度報告（有 progress bars）。Split 的 sidebar 讓觀眾隨時知道自己在哪。

---

### Experimental（2 套）
| 模板 | 核心強項 | 設計語言 |
|------|---------|---------|
| Brutalist | 態度 + 反設計的設計 | 3-4px 粗邊框、零圓角、[DONE] 標籤、黃色單色 accent |
| Isometric | 空間感 + 未來感 | CSS 3D transform、stacked depth、shimmer gradient、purple + teal |

**共性：** 打破簡報設計的常規預期。Brutalist 用「醜」製造記憶點，Isometric 用 3D 製造「哇」的瞬間。

**為什麼有效：** 偶爾用一次 = 印象深刻。每週用 = 疲勞。適合特殊場合或想表達「我不只會做安全的設計」。

---

## 跨類別設計原則（所有模板的共性）

### 1. Typography 即設計
14 套模板沒有一套依賴插圖或照片。所有視覺衝擊都來自：
- **字號對比**：標題 56-172px vs 內文 16-24px（至少 3:1 比例）
- **字重對比**：800/900 標題 vs 400 內文
- **字體配對**：display + body 雙字體策略（永遠不超過 2 種）

### 2. 單一 Accent Color 策略
沒有一套用超過 2 個 accent color。大部分只用 1 個：
- Noir: #0066FF
- Brutalist: #FFD600
- Swiss: #FF0000
- Kinetic: #5B21B6

**原則：accent color 越少，層級越清晰。**

### 3. 動效服務敘事
好的動效：
- Kinetic 的 word stagger → 模擬「思考」的節奏
- Outline 的 fill-on-enter → 製造「揭曉」的時刻
- Cinematic 的字幕漸入 → 模擬電影敘事

壞的動效：
- 純裝飾的 bounce/rotate
- 不配合設計語言的通用 fade

### 4. 空間即資訊
- Keynote 用 60% 留白說「這句話很重要」
- Dashboard 用密集卡片說「資訊量大但有序」
- Swiss 用 grid 說「一切在控制之中」

### 5. 一頁一個 Takeaway
14 套全部遵守 7×7 rule 的精神。沒有一套在單頁放超過 3 個獨立資訊塊。

---

## 設計新模板時的 Checklist

1. ✅ 確定屬於哪個分類（Dark/Minimal/Editorial/Structural/Experimental）
2. ✅ 選定 1 個核心強項（動效？結構？typography？氛圍？）
3. ✅ 不超過 2 種字體、1-2 個 accent color
4. ✅ 標題 ≥ 56px，內文 ≥ 16px
5. ✅ 每頁最多 3 個資訊塊
6. ✅ 動效必須配合設計語言（不用通用 fade）
7. ✅ 測試暗色 / 亮色背景下的對比度
8. ✅ 鍵盤導航 + page indicator 必備
9. ✅ 先做 title slide，確認視覺語言，再展開內頁
10. ✅ 和同分類現有模板比較——結構必須不同
