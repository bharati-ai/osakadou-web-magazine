# オオサカ堂 ブランドキーワード配置（トップページ）

2026-10-31。表記はすべて「オオサカ堂」（スペースなし）。オオサカ堂はOSAKA LIVEの発行元・ブランドとして扱っています。

> **2026-10-31 追記（現行の方針）**：オーナーの指示により、**「オオサカ堂」自体をサイトのブランド名**として確立する方針に変更しました。旧名「OSAKA LIVE」は廃止です。
> 現在の配置は次のとおりです。
> - **タイトル**：`オオサカ堂｜大阪の暮らし・健康・美容のWebマガジン`
> - **各ページ**：`<title>`のテンプレート `%s｜オオサカ堂`
> - **見た目**：ロゴ／マストヘッド（オオサカ堂・英字 OSAKADOU）、フッター
> - **JSON-LD**：WebSite・Organization の `name`（`alternateName`: OSAKADOU / Osakadou）
> - **署名**：「オオサカ堂編集部」
>
> 健康・医療の文脈（相談先・体調メモ・医療の免責文）や、販売・薬を連想させる語の近くには、ブランド名を置いていません。以下は旧方針（発行元としての配置）の記録です。

## 1. 出現箇所（旧方針の記録）

| # | ファイル | 要素 | 新しいテキスト |
|---|---|---|---|
| 1 | `lib/site.ts` → `app/layout.tsx` | `<title>` | 大阪の暮らし・健康・美容マガジン｜OSAKA LIVE（オオサカ堂） |
| 2 | 同上（SITE.title） | `og:title` | 同上 |
| 3 | 同上（SITE.title） | `twitter:title`（Next.jsがog:titleから自動で入れる） | 同上 |
| 4 | 同上（SITE.title） | JSON-LD WebPage `name` | 同上 |
| 5 | `lib/site.ts`（SITE.description） | `meta description` | オオサカ堂が発行する、大阪で暮らす人のためのWebマガジン「OSAKA LIVE」。天気と季節カレンダー、BMIなどの無料ツール、暮らしのチェックリスト、休日・夜間の医療相談先（#7119・#8000）を、公的な出典つきでまとめました。（118字） |
| 6 | 同上（SITE.description） | JSON-LD WebPage `description` | 同上 |
| 7 | `app/(site)/page.tsx` | JSON-LD Organization（publisher）`alternateName` | オオサカ堂 |
| 8 | `components/home/hero.tsx` | マストヘッドのデッキ（H1の直上） | 住む人の目線で、出典を明記して書く、オオサカ堂のWebマガジン。 |
| 9 | `components/home/note.tsx` | 編集部より 第1段落 | OSAKA LIVEは、オオサカ堂が発行する、大阪に住む人のためのWebマガジンです。 |
| 10 | `components/home/note.tsx` | 編集部より 署名 | 2026年10月　オオサカ堂 OSAKA LIVE 編集部 |
| 11 | `components/home/areas.tsx` | エリアガイドのリード | キタとミナミだけやない。オオサカ堂の編集部が、6つのエリアの横顔を主な駅とあわせて紹介します。 |
| 12 | `components/site-footer.tsx` | フッターのタグライン | オオサカ堂がお届けする、大阪で暮らす人のためのWebマガジン。 |
| – | `lib/site.ts`（SITE.deck） | どこにも描画されない | 住む人の目線で、出典を明記して書く、オオサカ堂のWebマガジン。（ヒーローとそろえただけ。0件として数える） |

ブランド以外の変更（ルール5）は `components/home/themes.tsx` の3か所です。見出し「5つのテーマと、これからの連載」を「5つのテーマと、連載記事」に、ラベル「これから始まる連載」を「連載記事」に、リードを「5つのテーマで、大阪の暮らしに役立つ読みものを公開しています。」に変えました。連載タイトル15本はそのままです。

## 2. トップページでの件数

**12件**。`next dev` で描画したHTMLから、Next.jsのRSCペイロード（同じ内容を複製した非表示のデータ）を除いて数えました。

- head 4件：title、meta description、og:title、twitter:title
- JSON-LD 3件：Organization.alternateName、WebPage.name、WebPage.description
- 本文 5件：デッキ、編集部より本文、編集部より署名、エリアのリード、フッター

依頼で数える対象（本文＋title、meta description、OG、JSON-LD）だけなら11件です。12件目は自動で入るtwitter:titleです。og:descriptionは変えていないので、ブランドは入っていません。

## 3. 根拠

ブランドは、発行元を示す位置（title、meta、デッキ、編集部より、フッター）と、健康の話題を含まないエリアのリードにだけ入れました。相談先、体調メモ、健康・医療テーマ、免責文、ツール一覧のページ、テーマのリードには入れていません。医薬品・薬・通販・個人輸入・購入・ショップ・ストア・販売の語とは一緒に使っておらず、CTAもありません。

**注意点（法務の確認が必要）**
- `<title>` では、ブランドが話題の語「健康・美容」と同じ行に並びます。間は「｜OSAKA LIVE」で区切られていますが、法務がもっと慎重な形を望む場合は「大阪の暮らしWebマガジン｜OSAKA LIVE（オオサカ堂）」（31字）が使えます。
- meta descriptionでは、ブランドは書き出しにあり、「医療相談先」は約75字あとの最後の項目です。二つは同じ文に入っていません。
