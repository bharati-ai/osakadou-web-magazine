# One-off assembler: head + inline CSS + body + inline JS -> D:/Projects/Osakadou.live/index.html
import json, pathlib, re, sys
from urllib.parse import quote
sys.stdout.reconfigure(encoding="utf-8")
T = pathlib.Path(__file__).parent
OUT = T.parent / "index.html"  # legacy static build
sys.path.insert(0, str(T)); from seigaiha import tile

IMG = json.loads((T / "images.json").read_text(encoding="utf-8"))  # slot -> {url, alt, w, h}

CONTENTS = [
    ("#areas", "大阪<wbr>エリアガイド", "Area Guide", "キタ・ミナミから天満まで、6エリアの横顔。"),
    ("#unwell", "体調が<wbr>すぐれない<wbr>ときの<wbr>相談先", "Help Lines", "救急や電話相談など、公的な窓口の一覧。"),
    ("#calendar", "大阪の<wbr>季節カレンダー", "Seasonal Calendar", "祭りや行事と、季節ごとの体調メモ。"),
    ("#checklist", "大阪暮らし<wbr>チェックリスト", "Living Checklist", "防災・医療・手続きを12項目で確認。"),
    ("#themes", "5つのテーマと、<wbr>これからの連載", "Five Themes", "暮らし・健康・美容・カルチャー・ガイドの、15の連載。"),
    ("#policy", "編集方針・<wbr>運営者情報", "Editorial Policy", "記事のつくり方と、情報の扱いについて。"),
]
contents = '<ol class="contents">' + "".join(
    f'<li><a href="{h}"><span class="n">{i:02d}</span><span class="t">{t}<span class="en" lang="en">{e}</span></span><span class="d">{d}</span></a></li>'
    for i, (h, t, e, d) in enumerate(CONTENTS, 1)) + "</ol>"

# Hero: art-directed CDN crops sized to the box, 2:3 on phones and square on desktop (people sit at the bottom).
# ponytail: widths capped (540w phone / 900w desktop); the ginkgo texture costs bytes, pixel count is the lever.
_hb = "https://images.unsplash.com/photo-" + IMG["hero"]["id"] + "?auto=format&fit=crop&crop=bottom"
HERO_MOB = (", ".join(f"{_hb}&q=45&w={x}&h={x * 3 // 2} {x}w" for x in (400, 540)), "calc(100vw - 121px)")
HERO_DESK = (", ".join(f"{_hb}&q=50&w={x}&h={x} {x}w" for x in (600, 900)), "(min-width:1280px) 600px, 47vw")
HERO_SRC = f"{_hb}&q=45&w=540&h=810"

def img(slot):
    m = IMG[slot]
    u = "https://images.unsplash.com/photo-" + m["id"]
    ar = m.get("ar")
    w, h = (int(x) * 300 for x in ar.split(":")) if ar else (m["w"], m["h"])
    fp = m.get("fp")
    crop = f"&crop=focalpoint&fp-x={fp.split(',')[0]}&fp-y={fp.split(',')[1]}" if fp else "&crop=entropy"
    if slot == "hero":
        return (f'<picture><source media="(min-width:960px)" sizes="{HERO_DESK[1]}" srcset="{HERO_DESK[0]}">'
                f'<img src="{HERO_SRC}" srcset="{HERO_MOB[0]}" sizes="{HERO_MOB[1]}" width="540" height="810" '
                f'alt="{m["alt"]}" fetchpriority="high"></picture>')
    q = f"auto=format&fit=crop&q={45 if slot == 'note' else 55}" + (f"&ar={ar}{crop}" if ar else "")
    widths = (400, 600, 800, 1200) if slot == "beauty" else (400, 600, 800)
    srcset = ", ".join(f"{u}?{q}&w={x} {x}w" for x in widths)
    sizes = {"beauty": "(min-width:960px) 900px, calc(100vw - 32px)",
             "note": "(min-width:960px) 300px, 340px"}.get(slot,
             "(min-width:960px) 360px, 280px" if slot.startswith("a_") else "(min-width:960px) 400px, calc(100vw - 32px)")
    return f'<img src="{u}?{q}&w=600" srcset="{srcset}" sizes="{sizes}" width="{w}" height="{h}" alt="{m["alt"]}" loading="lazy" decoding="async">'

CREDITS = "、".join(f'<span class="nw">{n}</span>' for n in dict.fromkeys(m["by"] for m in IMG.values()))
import datetime
TODAY = datetime.date.today()
body = (T / "body.html").read_text(encoding="utf-8")
body = body.replace("{{updated_iso}}", TODAY.isoformat()).replace("{{updated_ja}}", f"{TODAY.year}年{TODAY.month}月{TODAY.day}日")
body = body.replace("{{contents}}", contents).replace("{{credits}}", CREDITS)
body = re.sub(r"\{\{img:(\w+)\}\}", lambda m: img(m.group(1)), body)

# Noto Serif JP is loaded only for the glyphs the mincho headings use (Google Fonts text= subset).
# ponytail: regex-scoped; self-host a pyftsubset file (keep vert/vrt2) at deploy.
def mincho_text(html):
    # gothic-styled headings (.res, .policy) and <b> outside the cover lines don't use the webfont
    html = re.sub(r'<ul class="res">.*?</ul>|<div class="policy">.*?</section>', "", html, flags=re.S)
    chunks = [m[1] for m in re.findall(r"<(h[1-4])\b[^>]*>(.*?)</\1>", html, re.S)]
    chunks += re.findall(r'<span class="n">\d+</span><b>(.*?)</b>', html, re.S)
    chunks += [t for _, t, _, _ in CONTENTS]
    chunks += re.findall(r'<ul class="series">(.*?)</ul>', html, re.S)
    chunks += re.findall(r'<p class="deck">(.*?)</p>', html, re.S)
    chunks += re.findall(r'<span class="kanji"[^>]*>(.*?)<', html, re.S)
    txt = re.sub(r"<[^>]+>", "", "".join(chunks)).replace("&amp;", "&")
    return "".join(sorted(set(txt) - set("\n\t ")))
SUBSET = mincho_text(body)
FONT_TEXT = quote(SUBSET)
# guard: the deck and the vertical H1 must be fully covered, or they mix typefaces
for must in re.findall(r'<p class="deck">(.*?)</p>|<h1[^>]*>(.*?)</h1>', body, re.S):
    missing = set(re.sub(r"<[^>]+>", "", "".join(must))) - set(SUBSET) - set("\n ")
    assert not missing, f"subset misses {missing}"

css = (T / "base.css").read_text(encoding="utf-8") + (T / "components.css").read_text(encoding="utf-8")
css = css.replace(":root{\n", ":root{\n  --wagara:" + tile("#F7F7F4", "#D3D5CF") + ";\n", 1)
css = css.replace("@media (prefers-color-scheme:dark){:root{\n", "@media (prefers-color-scheme:dark){:root{\n  --wagara:" + tile("#14181F", "#2E3542") + ";\n", 1)
js = (T / "app.js").read_text(encoding="utf-8")

DESC = "大阪で暮らす人のためのWebマガジン「OSAKA LIVE（オオサカライブ）」。休日・夜間の医療相談先（#7119・#8000）、祭りと体調の季節カレンダー、防災・ごみ・転入の12項目チェックリストを、公的な出典つきでまとめました。"
OG = "大阪で、暮らす。住む人の目線で、出典を明記して書くWebマガジン。休日・夜間の相談先、季節カレンダー、暮らしのチェックリストを掲載。"
TITLE = "大阪の暮らし・健康・美容のWebマガジン｜OSAKA LIVE"
URL = "https://osakadou.live/"
OGIMG = URL + "og-cover.jpg"
FONTS = ["https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,500;6..96,700&display=swap",
         f"https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@700&display=swap&text={FONT_TEXT}"]
ld = {"@context": "https://schema.org", "@graph": [
    {"@type": "WebSite", "@id": URL + "#website", "url": URL, "name": "OSAKA LIVE", "alternateName": "オオサカライブ",
     "inLanguage": "ja", "publisher": {"@id": URL + "#org"}},
    {"@type": ["Organization", "NewsMediaOrganization"], "@id": URL + "#org", "name": "OSAKA LIVE", "alternateName": "オオサカライブ", "url": URL,
     "logo": {"@type": "ImageObject", "url": URL + "logo-512.png", "width": 512, "height": 512},
     "publishingPrinciples": URL + "#policy", "correctionsPolicy": URL + "#policy", "ethicsPolicy": URL + "#policy"},
    {"@type": "WebPage", "@id": URL + "#webpage", "url": URL, "name": TITLE, "description": DESC, "inLanguage": "ja",
     "isPartOf": {"@id": URL + "#website"}, "about": {"@type": "City", "name": "大阪市", "sameAs": "https://www.wikidata.org/wiki/Q35765"},
     "primaryImageOfPage": OGIMG, "dateModified": TODAY.isoformat()},
]}

head = f"""<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{TITLE}</title>
<meta name="description" content="{DESC}">
<link rel="canonical" href="{URL}">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta name="theme-color" content="#F7F7F4" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#14181F" media="(prefers-color-scheme: dark)">
<meta property="og:type" content="website">
<meta property="og:locale" content="ja_JP">
<meta property="og:site_name" content="OSAKA LIVE">
<meta property="og:title" content="{TITLE}">
<meta property="og:description" content="{OG}">
<meta property="og:url" content="{URL}">
<meta property="og:image" content="{OGIMG}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="OSAKA LIVE 創刊準備号　大阪で、暮らす。住む人の目線で、出典を明記して書くWebマガジン。">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://images.unsplash.com">
<link rel="preload" as="image" media="(max-width:959px)" imagesrcset="{HERO_MOB[0]}" imagesizes="{HERO_MOB[1]}" fetchpriority="high">
<link rel="preload" as="image" media="(min-width:960px)" imagesrcset="{HERO_DESK[0]}" imagesizes="{HERO_DESK[1]}" fetchpriority="high">
<script>
document.documentElement.classList.add('js');
// only a failure of our own inline script reverts to the no-JS layout (not LINE/extension injections)
addEventListener('error', (e) => {{ if (!window.__ol && (!e.filename || e.filename === location.href)) document.documentElement.classList.remove('js'); }});
// webfont CSS is added from script so it never blocks first paint (display=swap)
{json.dumps(FONTS)}.forEach((h) => {{ const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = h; document.head.append(l); }});
</script>
<noscript>{"".join(f'<link rel="stylesheet" href="{h}">' for h in FONTS)}</noscript>
<style>
{css}</style>
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
</head>
<body>
"""
OUT.write_text(head + body + f"\n<script>\n{js}</script>\n</body>\n</html>\n", encoding="utf-8")
html = OUT.read_text(encoding="utf-8")
assert "{{" not in html, "unfilled token"
assert not re.search("[\u2014\u2015\u2013]", html), "dash found"
assert not re.search(r'lang="en">[^<]*[\u3040-\u30ff\u4e00-\u9fff]', html), "Japanese text marked lang=en"
(OUT.parent / "sitemap.xml").write_text(
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    f'  <url><loc>{URL}</loc><lastmod>{TODAY.isoformat()}</lastmod></url>\n</urlset>\n', encoding="utf-8")
import subprocess
r = subprocess.run(["node", "--check", str(T / "app.js")], capture_output=True, text=True)
assert r.returncode == 0, r.stderr
# media overrides must come after the base rule they override (equal specificity)
for mq in ("@media (max-width:599px) and (max-height:700px)", "@media (max-height:500px) and (orientation:landscape)"):
    assert css.index(mq) > css.index(".cover h1{"), f"override before base rule: {mq}"
print("ok", len(html.encode()), "bytes")
