# 03 — Photos / Art Direction（OSAKA LIVE）

暫定ホットリンク用の写真リスト。全URLは 2026-10-30 に `curl -sI "<url>?w=400&q=60"` で **HTTP 200 / image/jpeg** を確認済み。
撮影地は各 Unsplash 写真ページの location 表示で確認（未表示のものは「場所タグなし」と明記）。向き・解像度は EXIF 回転後の実寸。

URL はパラメータなしの raw。使うときは imgix パラメータを付ける（下記「使い方」）。

| slot | best (raw) | backup (raw) | 被写体 JP / EN | 向き・px | 撮影者 (best / backup) | ページ (best / backup) |
|---|---|---|---|---|---|---|
| hero | https://images.unsplash.com/photo-1584505489290-96eb4e406d08 | https://images.unsplash.com/photo-1761165308046-174a56e73525 | best: 道頓堀・ブルーアワーの運河と遊覧船 / Dotonbori canal at blue hour with boat ・ backup: 夕暮れの大阪スカイライン / Osaka skyline at dusk | L 5970×3983 / L 6683×4458 | Juliana Barquero / Sir. Simo | https://unsplash.com/photos/boat-on-river-between-high-rise-buildings-during-nighttime-WaHPhFveWLk / https://unsplash.com/photos/cityscape-at-dusk-with-dramatic-clouds-and-lights-crUoLUUD0Ew |
| area-kita | https://images.unsplash.com/photo-1598559411608-e6dddb68e5f4 | https://images.unsplash.com/photo-1703305776804-40d12080e897 | 梅田スカイビルを見上げる / Umeda Sky Building, low angle ・ 梅田・HEP FIVE観覧車 / Umeda HEP FIVE Ferris wheel | L 5763×3842 / L 3840×2560 | Paul Cuoco / Hongwei FAN | https://unsplash.com/photos/low-angle-photography-of-high-rise-building-g1_bvwtEEi8 / https://unsplash.com/photos/AZKDx_Q7PjI |
| area-minami | https://images.unsplash.com/photo-1591115280721-38563b267cf5 | https://images.unsplash.com/photo-1590253230532-a67f6bc61c9e | 昼の道頓堀川・静かな運河 / Calm Dotonbori canal by day ・ 道頓堀・昼の遊覧船と看板街 / Dotonbori by day with tour boat | L 6000×4000 / L 5420×3785 | Alec Brunelle / Richard Tao | https://unsplash.com/photos/river-between-buildings-during-daytime-SPz6WOZwA1I / https://unsplash.com/photos/people-walking-on-street-near-buildings-during-daytime-dvBD4UvobSw |
| area-tennoji | https://images.unsplash.com/photo-1775986351635-85d61169ed17 | https://images.unsplash.com/photo-1723431306922-13c03f11445c | 新世界・通天閣と商店街 / Tsutenkaku above Shinsekai street ・ あべのハルカス / Abeno Harukas | L 6192×4128 / **P** 4000×6000 | Kent Chin / Filipe Freitas | https://unsplash.com/photos/tsutenkaku-tower-rises-above-a-bustling-osaka-street-js0vd83JEcE / https://unsplash.com/photos/a-very-tall-building-sitting-in-the-middle-of-a-street-EVsNEBBFuoo |
| area-nakanoshima | https://images.unsplash.com/photo-1706861744486-dda76a322221 | https://images.unsplash.com/photo-1686540576457-e73427913263 | 大阪市中央公会堂 / Osaka City Central Public Hall ・ 中之島公園ばら園の橋と川 / Nakanoshima Park rose garden bridge | L 5712×4284 / L 5917×3945 | explorecortex / Mingeon Go | https://unsplash.com/photos/a-large-building-with-a-clock-on-the-front-of-it-7x7SFzP8SPo / https://unsplash.com/photos/a-bridge-over-a-body-of-water-with-buildings-in-the-background-LbVDTxJT7LE |
| food | https://images.unsplash.com/photo-1764520406362-b1673b2213bf | https://images.unsplash.com/photo-1742633882704-41ec3a57dbb7 | 鉄板で焼くお好み焼き / Okonomiyaki on the teppan ・ たこ焼き（木のテーブル・暗め） / Takoyaki, moody wood table | L 6000×4000 / L 6240×4160 | Yosuke Ota / Allen Y | https://unsplash.com/photos/okonomiyaki-cooking-on-a-hot-plate-IveJAkyk7q8 / https://unsplash.com/photos/delicious-takoyaki-served-on-a-rectangular-plate-uKdzZgTP398 |
| health | https://images.unsplash.com/photo-1786828026440-ff6de650ed00 | https://images.unsplash.com/photo-1767520046018-0fd80d3fb45f | 抹茶の器を持つ手（白シャツ・顔なし） / Hands holding a matcha bowl ・ 夕方の川沿い並木道 / Tree-lined riverside path at golden hour | L 6000×4000 / L 4928×3264 | Spencer Liao / PJH | https://unsplash.com/photos/person-holding-bowl-of-matcha-powder-niJd2KnM2kM / https://unsplash.com/photos/tree-lined-path-beside-a-river-at-sunset-i2ra-xz5j20 |
| beauty | https://images.unsplash.com/photo-1748543668676-ea8241cb3886 | https://images.unsplash.com/photo-1576426863848-c21f53c60b19 | スキンケアのテクスチャと葉（ノーブランド） / Skincare textures with leaves, unbranded ・ 白いドロッパーボトル / White dropper bottle, minimal | L 5376×3072 / L 6000×4000 | ibnu ihza / Content Pixie | https://unsplash.com/photos/skincare-products-with-leaves-on-a-light-background-g6q3lFAe3kA / https://unsplash.com/photos/white-drop-bottle-on-white-surface-WdJ4WnLxyDs |
| culture | https://images.unsplash.com/photo-1690210684306-521cdb9990a9 | https://images.unsplash.com/photo-1562118501-7b229c3dfcfb | 天神祭の夜（天神橋） / Tenjin Matsuri at night, Tenjinbashi ・ 大阪城と御座船 / Osaka Castle with moat boat | L 6000×4000 / **P** 3827×5741 | Steven Marcellino / Sebastian Kurpiel | https://unsplash.com/photos/a-group-of-people-standing-around-a-building-at-night-QjMQsdLxQlI / https://unsplash.com/photos/people-on-boat-fjX0HGyT5Kw |
| guides | https://images.unsplash.com/photo-1746849199935-2302c71c458c | https://images.unsplash.com/photo-1646536590706-42fc527f35c9 | 西九条駅の静かなホーム / Quiet platform, Nishikujo Station ・ 自転車と猫のいる大阪の路地 / Cat and parked bicycles on an Osaka street | L 6192×4128 / L 5736×3226 | Rachel T / Karen Chew | https://unsplash.com/photos/empty-train-platform-awaiting-passengers-Ds4P1zJurqo / https://unsplash.com/photos/fHLjyErZMMY |
| season-autumn | https://images.unsplash.com/photo-1770284212085-20ef07376ffa | https://images.unsplash.com/photo-1772249491247-f84f243612ab | 紅葉と大阪城・池の映り込み / Osaka Castle with autumn foliage reflected ・ 箕面・龍安寺の赤い橋と紅葉 / Minoo Ryuan-ji red bridge in autumn | **P** 3208×4844 / **P** 3376×6000 | Esaias Tan / Ryo Harianto | https://unsplash.com/photos/osaka-castle-with-autumn-foliage-and-reflection-in-pond-UN8e2iz0I4U / https://unsplash.com/photos/red-bridge-leads-to-temple-surrounded-by-autumn-foliage-Ypvso-UXCIA |

## ADメモ（使用時の注意）

- **hero**: 運河の消失点と船が中央にあるので、16:9 でも 4:5（約3186×3983）でも中央クロップで成立する。左側に「ドラッグ」の看板が入るため、4:5 では中央寄せでクロップすると目立たない。backup のスカイラインも中央クロップで成立する。
- **area-kita backup**: 右端に HEP の看板が一部入る。右側を詰めてクロップする。
- **area-minami backup / culture best**: 人物はいるが、遠くて小さい。天神祭の写真は群衆なので、クロップを強めにする場合は顔が大きく写らないか確認する。
- **area-tennoji / culture backup**: backup は縦位置。カードに使う場合は `ar=4:3&fit=crop&crop=entropy` で切り出す。
- **food**: どちらも場所タグなし（大阪で撮影と断定できない）。キャプションに「大阪」と書かない。
- **health backup**: 撮影地は京都（ページのタグで確認）。大阪の写真としてキャプションを付けない。薬・パッケージ・錠剤は写っていない。
- **beauty**: どちらもブランドやロゴは見えない。顔も写っていない。
- 除外したもの: ayumi kubo の夕景の看板街（大阪っぽいが撮影地は東京・上野）。Huy Phan の公会堂（ページに "tokyo station" タグがあり、撮影地が不確か）。Unsplash+（plus.unsplash.com）の画像はすべて除外。

## 使い方（imgix パラメータ）

```
<raw>?auto=format&fit=crop&w=1920&h=1080&q=70&crop=entropy   # 16:9 hero
<raw>?auto=format&fit=crop&w=1080&h=1350&q=70&crop=entropy   # 4:5 portrait
<raw>?auto=format&fit=crop&w=800&ar=4:3&q=65                 # cards
```

## ライセンス

- 全22枚が **Unsplash License**（無料版で、Unsplash+ ではない）。各ページに "Free to use under the Unsplash License" と表示されていることを確認した。商用利用は無料、許可は不要、クレジットも不要（ただし推奨されている）。
- 禁止事項: 未加工のまま販売すること。Unsplash と競合するサービスを作るために、写真を集めて再配布すること。
- Unsplash License はモデルリリースや商標の権利処理を保証しない。そのため、識別できる人物や看板・ロゴを広告的に強調する使い方は避ける（特に道頓堀の看板）。
- `images.unsplash.com` へのホットリンクはあくまで暫定。本番では次のどちらかにする。(a) Unsplash API を正式に使う。この場合は API ガイドラインに沿って、撮影者クレジットと download エンドポイントの呼び出しが必要。(b) 自社 CDN にセルフホストする。いずれの場合も、クレジット表記（"Photo: 撮影者 / Unsplash"）を付けることを推奨する。

---

## Round 2 — 生活者目線（2026-10-30）

批評は「道頓堀のネオンや、大阪城・道頓堀の重複が、インバウンド観光客の大阪に見える」というもの。これを受けて差し替え候補を探した。検証方法は Round 1 と同じ。

- Unsplash License の無料版であること（Unsplash+ ではない）。
- `curl -sI` で HTTP 200 / image/jpeg が返ること。
- ブラウザで実際の写真を目視したこと。
- 撮影者と撮影地を写真ページで確認したこと。

向きと px は EXIF 回転後の値。

| slot | raw URL | 向き・px | 被写体 JP / EN | 区・市 | 撮影者 | ページ | 注意点 |
|---|---|---|---|---|---|---|---|
| hero-resident **best** | https://images.unsplash.com/photo-1772249491195-e95a8a5ed845 | P 3193×5720 | 黄葉したイチョウの下を歩く親子（後ろ姿） / Parent and toddler walking under golden ginkgo, seen from behind | 大阪市中央区（大阪城公園・教育塔付近。ページの location で確認） | Ryo Harianto | https://unsplash.com/photos/person-walks-through-a-park-with-golden-autumn-trees-oxQ983u1ts4 | **御堂筋ではない。** 城は写っていないが、キャプションに「大阪城」を使わない（「大阪城公園」は可）。人物は画面下部にいるので、4:5 は問題なく切れる。約1.1:1 では人物が切れやすいため、`crop=focalpoint&fp-y=0.78` で下寄せにする。顔、ロゴ、看板は写っていない。 |
| hero-resident backup | https://images.unsplash.com/photo-1765267388281-5394d21adcdc | L 5765×3924 | 府庁南交差点のイチョウ並木と行き交う車 / Ginkgo-lined avenue at the Osaka Pref. Govt. South crossing | 大阪市中央区（上町筋・府庁南交差点。画面内の道路標識で特定。ページは location 欄がなく、タグに osaka と ginkgo tree がある） | Huy Phan | https://unsplash.com/photos/cars-driving-on-a-street-lined-with-autumn-trees-hiyxw7wrIO8 | **御堂筋ではない（上町筋）。** 生活感の主役は車とタクシーで、歩行者は左端に小さく写る程度。4:5 と 1.1:1 は中央で切れば成立する。道路標識「府庁南」が写り込む。ロゴはない。 |
| bay **best** | https://images.unsplash.com/photo-1636590877238-76fa57e1806a | L 3091×2048 | 天保山岸壁のクルーズ船と大観覧車、夏雲（フィルム写真） / Cruise ship at Tempozan pier with the giant Ferris wheel | 大阪市港区（天保山。ページの location で確認） | Dong In Ham | https://unsplash.com/photos/a-cruise-ship-docked-in-a-harbor-with-a-ferris-wheel-in-the-background-UfJ6329ry78 | 解像度が低め（長辺 3091px）。カードには十分だが、全幅ヒーローには向かない。船の煙突に小さな船会社マークがある。人物は写っていない。季節は夏雲。 |
| bay backup | https://images.unsplash.com/photo-1759849398868-0f56ce17c685 | L 5838×3892 | 海遊館の外観（ジンベエザメの壁画）と広場 / Kaiyukan aquarium exterior with whale-shark mural | 大阪市港区海岸通（ページの location で確認） | waa towaw | https://unsplash.com/photos/I0jv1w3v88k | 観光施設そのものなので、観光感はやや強い。広場の来場者は小さく、顔は判別できない。施設名の表示は控えめ。 |
| tenma **best** | https://images.unsplash.com/photo-1585609332144-069e8576d9ca | P 3456×4608 | 天神橋筋商店街「天神橋1丁目」入口と買い物客 / Tenjinbashi-suji 1-chome arcade entrance with shoppers | 大阪市北区（アーケードの「天神橋1丁目」看板で特定。ページはタグ osaka のみ） | D Konishi | https://unsplash.com/photos/people-walking-on-street-during-daytime-lOIUNUbiZBA | 正面から歩いてくる2人（赤いコートの女性、マスクの男性）の顔が中くらいのサイズで写る。大きく使うなら上寄せ（`fp-y=0.35`）にしてアーケード看板を主役にする。右端に「ふくろうカフェ」の幟があるので、右側を詰める。薬局やドラッグストアの看板は見当たらない。冬服。 |
| tenma backup | https://images.unsplash.com/photo-1777900986816-91769929a58f | L 3840×2400 | 夜の天満の飲み屋街を歩く3人（後ろ姿） / Three people walking through Tenma's izakaya lanes at night | 大阪市北区天満（ページの location で確認） | Julien | https://unsplash.com/photos/SDeJuQY5tJg | 夜の飲み屋街で、「350円」などの酒の価格表示が写る。健康・美容誌のトーンとしては注意。人物は後ろ姿。 |
| season-autumn backup（再確認） | https://images.unsplash.com/photo-1772249491247-f84f243612ab | P 3376×6000 | 箕面・龍安寺の赤い橋と紅葉 / Minoo Ryuan-ji red bridge in autumn | 箕面市（Round 1 で確認済み） | Ryo Harianto | https://unsplash.com/photos/red-bridge-leads-to-temple-surrounded-by-autumn-foliage-Ypvso-UXCIA | 2026-10-30 に再確認し、**200 / image/jpeg を確認**。ブラウザでも表示を確認した。 |

### 見つからなかったもの

- **御堂筋のイチョウ並木は、条件を満たす写真がない。** "midosuji ginkgo" は0件。"midosuji" の結果はネオン、夜景、ブランド看板ばかりだった。"osaka ginkgo" で見つかった街路の写真は、上の backup（上町筋）だけだった。
- **空堀商店街は0件**（"karahori"）。**咲洲・南港も0件**（"sakishima"）。

### 除外したもの（理由）

- Muhammad Rahiman Abdulmanab「大阪城公園の黄葉とベンチ」（photo-1767526583534-963269bf1206）: 顔がはっきり分かる人物が複数いて、ツアーの旗も写る。観光客の群衆に見える。
- Josh Marty「大阪のアーケード」（photo-1790860188412-cefbe70e9b28）: 中央の男性がカメラ側を向いて歩いており、顔が判別できる。
- Wenhao Ruan「自転車と電線の下町」（photo-1760445726852-9d0f8bb3ba61）: ページのタグに pharmacy sign があり、左側に調剤薬局らしき看板が写る。
- Yanhao Fang「天保山観覧車とベンチの女性」（photo-1733448393259-c3a7178196da）: 人物が前景で大きく写っている。
- Arthur Tseng「港の帆船」（photo-1723536459642-990504a6a16b）: ページの location が Kyoto になっていて、撮影地が矛盾する。
- 予備候補（検証済み）: PJH「北区の踏切と住宅」（https://images.unsplash.com/photo-1769921595428-75efab3fb2bb 、L 4928×3264、北区）。生活感のある住宅街だが、人物はいない。季節感も弱い。

---

## Round 3 — 写真主導リデザイン用（2026-10-31）

機械可読版は `docs/photos-r3.json`（スロットごとに best / backup。項目は id, w, h, alt_ja, caption_ja, by, page, osaka, notes）。

検証方法は Round 1・2 と同じ。

- Unsplash License の無料版であること（Unsplash+ ではない）。
- `curl -sI` で 200 / image/jpeg が返ること。
- ブラウザで目視したこと。
- 写真ページで撮影者と location を確認したこと。

さらに、薬局・ドラッグストアの看板が写っていないことを目視で確認した。px は EXIF 回転後の値。「大阪」欄の ✗ は、大阪以外で撮影された写真か、撮影地が不明の写真（どちらもキャプションは「（イメージ）」）。

| slot | best ID（photo-…） | best 撮影者 / 向き | backup ID | backup 撮影者 / 向き | 大阪 | 主な注意点 |
|---|---|---|---|---|---|---|
| season-spring | 1648945740653-b0074db98bff | Yasuto Takeuchi / L 5472×3648 | 1680061337399-a175cebe51b1 | fumiko nishida / L 4608×3072 | ○/○ | best は川沿いの桜並木。撮影地はタグ「osaka city」のみで、川の名前は書かない。backup は大阪城公園。 |
| season-summer | 1692546699056-d4c6c7c1829e | YANGHONG YU / **P** 3888×5184 | 1690210683945-4a49d65017ee | Steven Marcellino / **P** 2955×4433 | ○/○ | **横位置の夏写真は見つからなかった。** best は花火と見物客のシルエット（大会名は不明）。backup は天神祭（北区天神橋）で、小さな横顔がある。 |
| season-winter | 1761292421196-362ca7eeee66 | Margarita B / L 3089×2048 | 1675002562047-e3e4e4abb3d1 | Steven Marcellino / **P** 4000×6000 | ○/○ | best は大阪市内のイルミネーション並木（御堂筋か中之島かは未確認）。backup は梅田のツリー。中之島「光のルネサンス」は見つからなかった。 |
| wx-rain | 1791777831346-c140a0d33aba | Wenhao Ruan / L 3361×2241 | 1701343199698-2c9f4f4d1ad8 | Hongwei FAN / L 3840×1774 | ○/○ | どちらも後ろ姿のみ。backup は約2.2:1の超横長。 |
| wx-clear | 1765434565396-ee7b5a7abc4a | Hat Trick / L 9504×6336 | 1591537644972-95b643c662a8 | D Konishi / L 4021×3015 | ○/○ | best は高所から見た大阪市街と生駒の山並み。 |
| wx-cloudy | 1588293595084-46d6e5347982 | Ryo Harianto / L 5000×2814 | 1756460886147-1804661e8a0f | Cuvii / L 7728×5152 | ○/○ | backup は左側に THK のロゴがあるので詰める。Cuvii の別カット（Axxs183UK1I）は病院の看板が写るため除外。 |
| sento | 1786343453481-3e53d1aa7108 | Fidel Fernando / **P** 4032×6048 | 1764057145833-8baa3efbe58f | waa towaw / L 6000×4000 | ✗/✗ | **大阪の銭湯、のれん付き外観とも、条件を満たす写真がない。** best は木の浴室（撮影地不明、イメージ）。backup は群馬県の草津温泉。 |
| run-river | 1591537645006-47ece459f6a7 | D Konishi / L 4160×3120 | 1648945741044-4dfc68dc38f2 | Yasuto Takeuchi / L 5472×3648 | ○/○ | best は大阪市の河川敷（淀川らしいが未確認）で、人物は小さい。backup は桜の季節の散歩道。ジョギングする人の写真は見つからなかった。 |
| sleep | 1764867248357-f1d63647bff3 | Efe Kekikciler / L 4275×2814 | 1779364867798-386fb7213a2c | Ксения Лапшина / **P** 3869×5804 | ✗/✗ | イメージ。人物はいない。 |
| water | 1723510044911-68fdbdc64f46 | Michael Kahn / L 3000×2000 | 1612375066516-11d6d394bd2a | Mateusz Butkiewicz / **P** 2560×3200 | ✗/✗ | イメージ。タグに alcohol があるグラス写真は除外した。お茶の写真が欲しい場合は、Sergey N の急須写真（photo-1559484379-68a6d9c90c73、P、検証済み）がある。 |
| map-aerial | 1769307530595-3edcfc022f49 | Hat Trick / L 9504×6336 | 1597959737184-ba65df19be44 | Paul Cuoco / L 6000×4000 | ○/○ | best は通天閣が入る俯瞰（ハルカスから撮影と推定）。backup は天王寺の夜景。 |
| shrine | 1695155441444-05c08368a68b | Pourya Gohari / L 9040×6027 | 1695155394703-63279dec2cd4 | Pourya Gohari / L 9214×6143 | ○/○ | どちらも住吉大社（住吉区）。別の神社にしたい場合は難波八阪神社（1678731714027-5a231a95fd23、P）を使う。 |
| market | 1584583528653-966964d48bf1 | Helga Christina / L 4685×2933 | 1768906964003-c45ebcf419ff | Da-shika / L 5719×3813 | ○/○ | どちらも黒門市場（中央区）。best は中景に小さな顔が数人。backup には「大丸白衣」の看板がある（薬局ではない）。 |
| takoyaki | 1771308458012-e60e667bbddf | Jason Leung / L 8192×5464 | 1701694492928-fd5919cfcb5e | Hardingferrent / L 3800×2534 | ✗/✗ | どちらも手元だけ。best は撮影地不明。backup はジャカルタ。大阪の屋台の写真は、店名看板が大きいか暗すぎたため除外した。 |
| station | 1740214784411-e41039c5f95e | Sam / L 6192×4128 | 1789664027098-7cf9cbbc068d | Zoltan Fekeshazy / **P** 2625×3500 | ○/○ | best は Osaka Metro の駅（乗換表示から本町駅と推定）で、人物は後ろ姿。backup はブレた人物と赤帯の車両。 |
| sumo | 1774014045694-a992783529e1 | Harman Tatla / L 7728×5152 | 1774014045695-7adba115441e | Harman Tatla / L 7728×5152 | ○/○ | どちらも大阪場所の会場（EDION の看板からエディオンアリーナ大阪と判断）。力士は極小で、顔は判別できない。**府立体育会館の幟の写真は見つからなかった。** backup は同じ構図の別カット。 |

### Round 3 で除外したもの（理由）
- Preet Patel の雨の通り、川沿いの遊歩道: 撮影地が東京（下北沢、スカイツリー）。
- 安 崔士 の花火: ビルに「関西医大」の看板が写る（医療機関の看板）。
- Cuvii の曇天スカイライン（Axxs183UK1I）: 「大阪回生病院」の看板が写る。
- alicharmant のたこ焼き屋台（大阪）: 店名看板「道頓堀店」が大きく写り、暗い。
- Stefan Szankowski の相撲イラスト提灯（道頓堀）: 飲食店の看板（串かつ、焼肉）が大半を占める。
- Clay Banks の木の浴室: 撮影地が米国 NY で、和風ではない。
- Kazuo ota の「のれん」写真: 東京のスーパーで、銭湯ではない。
- Jeong yunji の ♨ 看板: 撮影地の記載がなく、日本かどうか判断できない。
- li xiang の水グラス: タグに beer / alcohol がある。
