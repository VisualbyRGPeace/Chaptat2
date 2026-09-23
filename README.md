# ♟️ 🎴 ♟️ CHẤP TẤT — Chess with Fate

**CHẤP TẤT** là một biến thể cờ vua giữ nguyên toàn bộ luật di chuyển tiêu chuẩn, nhưng bổ sung một hệ thống
**rút lá bài định mệnh, chấp quân và hồi sinh**. Kết quả là những ván cờ có yếu tố bất ngờ nhưng vẫn có luật rõ
ràng, kiểm soát được, và có thể mô phỏng lại trên một bàn cờ thật nếu muốn.

> Cờ vua. Nhưng số phận có luật riêng.

---

## Mục lục

- [Game Flow](#game-flow)
- [4 bộ bài](#4-bộ-bài)
- [Hệ thống Rarity](#hệ-thống-rarity)
- [Cơ chế hồi sinh](#cơ-chế-hồi-sinh)
- [Kiến trúc dự án](#kiến-trúc-dự-án)
- [Cài đặt & phát triển](#cài-đặt--phát-triển)
- [Triển khai lên GitHub Pages](#triển-khai-lên-github-pages)
- [Testing](#testing)
- [Giới hạn của bản MVP](#giới-hạn-của-bản-mvp)

---

## Game Flow

Một ván CHẤP TẤT đi qua các phase theo đúng thứ tự:

```
SETUP
  ↓
HANDICAP      — mỗi bên rút 1 lá Handicap, phải bỏ quân theo card trước khi bắt đầu
  ↓
OPENING       — mỗi bên rút 1 lá Opening Fate, áp dụng hiệu ứng khai cuộc
  ↓
PLAYING       — ván cờ diễn ra bình thường theo luật cờ vua tiêu chuẩn
  ↓
MIDGAME       — mở khóa khi đạt ít nhất 2/3 điều kiện trung cuộc (xem bên dưới);
                  từ đây mỗi lượt người chơi có thể chọn PLAY MOVE hoặc DRAW CARD
                  (rút bài Midgame khiến mất lượt đó)
  ↓
LAST_CHANCE   — khi một bên bị chiếu hết và còn quyền Last Chance, họ rút 1 lá
                  Last Chance thay vì thua ngay
  ↓
RESURRECTION  — vua được hồi sinh tại 1 trong 3 ô hợp lệ do engine đề xuất,
                  các quân hỗ trợ (nếu có) được hồi sinh ngẫu nhiên
  ↓
GAME_OVER
```

**Điều kiện mở khóa MIDGAME** (đạt ít nhất 2/3):
1. Cả hai bên đã đi tổng cộng ít nhất 8 nước mỗi bên (16 nửa nước).
2. Ít nhất 1 hậu đã rời vị trí xuất phát.
3. Ít nhất 4 quân không phải tốt (mã/tượng/xe) đã bị di chuyển hoặc bị bắt.

## 4 bộ bài

| Deck | Ký hiệu | Số lá | Khi nào rút |
|---|---|---|---|
| Handicap | ⚖️ | 20 | Trước ván, mỗi bên rút 1 lá bắt buộc |
| Opening Fate | ♟️ | 20 | Trước nước đi đầu tiên, mỗi bên rút 1 lá |
| Midgame Fate | ⚡ | 20 | Trong trung cuộc, tối đa 2 lần rút chủ động mỗi bên (+ bonus) |
| Last Chance | 👑 | 20 | Chỉ khi bị chiếu hết, tối đa 1 lần mỗi bên |

Mỗi người chơi có **bộ bài riêng** cho từng deck (xác suất của bạn không bị lệch vì đối thủ đã rút bài).
Một lá bài, một khi đã được dùng bởi bất kỳ ai trong trận, **không bao giờ xuất hiện lại** trong cùng ván đó.

## Hệ thống Rarity

| Rarity | Icon | Handicap | Opening | Midgame | Last Chance |
|---|---|---|---|---|---|
| Common | 🟢 | 60% | 50% | 45% | 55% |
| Rare | 🔵 | 25% | 30% | 30% | 30% |
| Epic | 🟣 | 12% | 15% | 20% | 12% |
| Legendary | 🟡 | 3% | 5% | 5% | 3% |

Xác suất không hiển thị cho người chơi trong lúc chơi — chỉ có thể xem trong trang **Rules**.

## Cơ chế hồi sinh

Khi một bên bị chiếu hết và còn Last Chance:

1. Engine quét toàn bộ 64 ô, loại bỏ mọi ô đang bị đối phương kiểm soát, gây chiếu ngay lập tức, hoặc khiến
   hai vua đứng cạnh nhau.
2. Engine chọn ngẫu nhiên (từ seed của trận) tối đa **3 ô hợp lệ** để vua hồi sinh.
3. Người chơi chọn đúng 1 trong 3 ô đó.
4. Nếu lá bài yêu cầu quân hỗ trợ, engine chỉ hồi sinh những loại quân **đã thực sự bị bắt** trong trận này,
   không bao giờ vượt quá số lượng đã mất thực tế.
5. Vị trí của quân hỗ trợ hoàn toàn ngẫu nhiên — người chơi **không được** tự chọn — và mỗi lần spawn đều được
   kiểm tra lại tính hợp lệ của bàn cờ; nếu không hợp lệ, engine thử ô khác thay vì để game vỡ trạng thái.

Nếu không còn lá bài, không có quân hợp lệ để hồi sinh, hoặc không tìm được ô đặt vua hợp lệ → xác nhận
**CHECKMATE — GAME OVER**.

## Kiến trúc dự án

```
src/
  data/               80 lá bài dưới dạng dữ liệu thuần (không hard-code trong UI)
    handicapCards.ts
    openingCards.ts
    midgameCards.ts
    lastChanceCards.ts
    decks.ts

  game/               toàn bộ game logic, tách biệt khỏi UI
    types.ts            các type dùng chung (GameState, FateCard, ActiveEffect, ...)
    chessEngine.ts       wrapper DUY NHẤT quanh chess.js
    cardEngine.ts        rút bài: seeded, rarity-weighted, không lặp lại
    effectEngine.ts      diễn giải effectType + params của từng card một cách tổng quát
    turnEngine.ts        áp dụng nước đi, kiểm tra active effects, mở khóa MIDGAME
    legalityEngine.ts    validate bàn cờ sau mỗi hiệu ứng (không vua đôi, không vua biến mất...)
    resurrectionEngine.ts cơ chế 3 ô hồi sinh + spawn quân hỗ trợ ngẫu nhiên
    gameState.ts          khởi tạo state, log, localStorage save/resume
    useGame.ts             React hook điều phối toàn bộ flow

  components/         UI thuần, không chứa logic luật chơi
    ChessBoard/  Card/  CardDeck/  CardReveal/
    MoveHistory/ CardLog/ PlayerPanel/ GameSetup/

  pages/
    Home.tsx  Game.tsx  Rules.tsx

  utils/
    random.ts   seeded PRNG duy nhất của toàn bộ project (không Math.random() rải rác)
    rarity.ts   bảng xác suất + màu sắc theo rarity
    validation.ts

  test/                unit test cho chess, handicap, opening, midgame, last chance
```

### Nguyên tắc thiết kế

- **Không hard-code luật bài trong JSX.** Mọi hiệu ứng được mô tả bằng `effectType` + `params` trong
  `src/data/*.ts` và được diễn giải chung bởi `effectEngine.ts`. Thêm một lá bài mới = thêm một object dữ liệu,
  không cần sửa UI.
- **Một luồng validate duy nhất:** mọi hiệu ứng đi qua `CHECK CONDITION → CALCULATE EFFECT → VALIDATE BOARD →
  COMMIT EFFECT`. Nếu validate thất bại, state được rollback về trước khi áp dụng — game không bao giờ crash vì
  một lá bài không áp dụng được.
- **Random tập trung:** không có `Math.random()` nào rải rác trong code. Toàn bộ đi qua `utils/random.ts`, được
  seed từ `matchSeed` của trận — cho phép replay/debug và tránh gian lận.

## Cài đặt & phát triển

Yêu cầu Node.js ≥ 18.

```bash
npm install
npm run dev       # chạy dev server tại http://localhost:5173
npm run build     # build production vào ./dist
npm run preview   # xem thử bản build
npm run test      # chạy toàn bộ unit test (vitest)
```

## Triển khai lên GitHub Pages

1. Đổi giá trị `base` trong `vite.config.ts` thành đúng tên repository của bạn:
   ```ts
   base: "/ten-repo-cua-ban/",
   ```
2. Push code lên nhánh `main` của một repository GitHub.
3. Vào **Settings → Pages → Build and deployment → Source**, chọn **GitHub Actions**.
4. Workflow có sẵn tại `.github/workflows/deploy.yml` sẽ tự động `npm ci → test → build → deploy` mỗi khi có
   push lên `main`. Bạn cũng có thể chạy thủ công qua tab **Actions → Deploy CHẤP TẤT to GitHub Pages → Run
   workflow**.

Dự án hoàn toàn tĩnh (static), không cần server hay API secret nào ở frontend.

## Testing

`npm run test` chạy các bộ test trong `src/test/`:

- **chessEngine.test.ts** — nước đi hợp lệ, chiếu, chiếu hết, nhập thành, phong hậu, bắt tốt qua đường.
- **handicap.test.ts** — mỗi loại chấp quân, không thể chấp vua, yêu cầu chọn quân hợp lệ.
- **opening.test.ts** — hiệu ứng khóa quân, cấm ô, xử lý an toàn khi setup card không áp dụng được.
- **midgame.test.ts** — rút bài mất lượt, số lượt rút mặc định + bonus, hiệu ứng có thời hạn.
- **lastChance.test.ts** — tìm ô hồi sinh hợp lệ, chỉ hồi sinh quân đã từng bị bắt, không tạo hai vua kề nhau.

## Giới hạn của bản MVP

Đây là bản MVP ưu tiên đúng thứ tự: **gameplay đúng → state đúng → legality đúng → card logic đúng → UI đẹp →
animation**, theo đúng yêu cầu gốc. Một vài điểm còn đơn giản hoá có chủ ý và nên được tinh chỉnh thêm trước khi
dùng cho các trận đấu nghiêm túc:

- Một số hiệu ứng "nước đi đặc biệt tức thời" (Xe Tốc Hành, Mã Bóng Đêm, Cuồng Nộ...) hiện dùng cơ chế "cấp
  quyền đi thêm" chung (`ActiveEffect` dạng `pendingFreeMove`) thay vì UI chuyên biệt cho từng lá — đúng tinh
  thần data-driven nhưng trải nghiệm chọn nước đi bổ sung còn tối giản.
- Chưa có đồng hồ thi đấu thực sự (Time Control hiện mặc định `Unlimited`, các mốc thời gian khác chỉ là UI).
- Chưa có Sound, Settings (theme bàn cờ/quân cờ), và Debug Mode (`?debug=true`) đầy đủ như mô tả trong spec gốc
  — đây là các hạng mục Phase 7+ trong roadmap gốc, dự kiến bổ sung sau khi phần lõi (Phase 1–6) đã ổn định.
- Kiến trúc đã chuẩn bị sẵn để tích hợp Firebase Auth/Firestore, phòng chơi (room code) và multiplayer online,
  nhưng phiên bản này chạy hoàn toàn offline, 2 người chơi cùng thiết bị (Local 2 Player).

Đóng góp, báo lỗi hay đề xuất thêm card mới đều chỉ cần thêm entry vào `src/data/*.ts` — không cần đụng vào
engine hay UI.
