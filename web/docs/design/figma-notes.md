# Figma notes (Boy frame 178:362, file eTEYdoqmxEjUpUNlypwRPs)

Source: Figma MCP, 2026-11-13. Starter-plan MCP call limit was hit mid-task: sections marked NOT CAPTURED
still need a screenshot/design-context pass once the limit resets.

## Global
- Desktop frame 1440 wide, 6438 tall. Page bg #FFFFFF. Container = 1280 wide, side padding 80, inner px 32 (content 1216).
- Font: Sora only. Weights 400 / 600 / 700 / 800. Mono-black design: black #000, white #FFF, neutral #404040.
- Zinc: 500 #71717A (body grey, card border), 300 #D4D4D8 (text on black), 800 #27272A.
- Radius: buttons/tiles 4px, experience cards 10px. Borders 2px black (tiles, outline buttons), 1px #71717A (cards).
- Type scale (size/line-height/tracking as Figma px letterSpacing, ~ em in code):
  - Display 48/56, tracking -0.96px; Regular 400 + ExtraBold 800 pair ("My" regular, "Skills" extrabold; 16px gap, centred)
  - H2 32/40 bold; H3 28/32 semibold; H4 24/28 semibold, -0.48px; H5 20/24 bold or semibold, -0.4px
  - H6 16/20 semibold, -0.32px; body P2 16/24 regular, +0.32px, colour #71717A
  - Button text 20/24 semibold, +0.4px, white on black
- "Outlined" display text: ExtraBold 48 with transparent fill + black stroke (hero word "Developer").
- Section vertical rhythm: section padding 60px top/bottom; heading row h96 (20px v-pad); gap 20px between heading and body.
- Section order (y, h): Header 0/104, Hero 104/716, Skills 820/728, Experience 1548/956 (black cards), About 2504/692,
  Projects 3196/1824, Testimonial 5020/714, Contact 5734/604, Footer 6338/100.
  (Frame file names the experience & testimonial sections both "Testimonial".)

## Header (h104, px80 py24, inner w1280 px32, h56)
- Left: logo mark 40x40 + wordmark "Personal" 20 bold capitalize -0.4px, 12px gap (logo w139.9).
- Centre nav, gap 32: About Me / Skills / Project / Contact me, 20/24 semibold capitalize black, no underline styling captured.
- Right: black button "Resume" + download icon 20px, h56, px20 py16, radius 4, gap 8, text white 20 semibold.

## Hero (h716, container 1280, px32, items centred, justify-between)
- Left text column w600, vertical centre, gap 32:
  - 3 display lines (gap 20): "Hello I'am" (400) + "Evren Shah." (800); "Frontend" (800 black) + "Developer" (800 outlined/transparent);
    "Based In" (400) + "India." (800). Words separated by 16px.
  - Paragraph 16/24 #71717A, w600, 4 lines.
- Right: illustration box 889x596, overflow hidden; art = hero.svg (natural 889x596), black baseline bar (3px) at bottom.
- Social buttons row absolutely at x112,y620 (section coords), 4 buttons 56x56, gap 32: first filled black, other three 2px black outline; icons 20px.

## Skills
- Heading "My Skills" centred. Grid 2 rows x 5 columns, tiles 186x186, justify-between (gap ~71.5), row gap ~20 (+20 py).
- Tile: bg white, 2px black border, radius 4, p24, col gap 32, icon 56x56 centred, label 20/24 bold capitalize centred, -0.4px.
- Selected/hover variant: bg black, white label, inverted icon.
- Labels seen: Javascript, Git, Sass/scss, Nest.Js, Storybook, Socket.io (icons are brand SVGs, 56px).

## Experience (band)
- Heading "My Experience". 3 cards stacked, each 1168x192, x24, vertical gap 32 (y 40 / 264 / 488 in 720 row).
- Band background: black (cards read white text); card: border 1px #71717A, radius 10, px24 py30, col gap 28.
- Card top row: company logo 32px + 30px gap + title 24/28 semibold white ("Lead Software Engineer at Google");
  right-aligned date 16/20 semibold #D4D4D8 ("Nov 2019 - Present").
- Card body 16/24 #D4D4D8 regular.
- NOT CAPTURED: exact fill of the band wrapper (section frame 410:483) and heading colour on black (assume white).

## About (h692)
- Two columns: left illustration 525x572 (about.svg, natural 530x572), right text column w610 at x638.
- Heading "About Me" (Me extrabold). Three paragraphs 16/24 #71717A, gap 20, width 610.
- About art: framed square (rounded black border) with person, crossed arms; fits column left-aligned.

## Projects (numbered, alternating)
- Heading "My Projects". Three rows 1216x516, row gap 20 (y 116 / 652 / 1188).
- Image cell 594x476 containing screenshot 530x398 (radius, offset y39); Details cell 582 wide, vertically centred.
- Row 1 & 3: image left, details right (x634). Row 2: details left (x0), image right (x622; image inset x64).
- Details stack: number "01/02/03" 48/56 (display style), 28px gap, title 28/32 semibold-ish (40px box single line, 80px two lines),
  gap, 16/24 #71717A body (96px, 4 lines; row 2 144px), "Read More" 20x20 arrow icon link at bottom.

## Testimonial (3 cards)
- Heading "My Testimonial". Cards 370x398 each, x24 / 423 / 822 (gap 29), y40 in 478 row.
- NOT CAPTURED: card styling (call limit); assume same border/radius as Experience cards but light.

## Contact (h604)
- Two columns 608 wide, gap 32. Left form: inputs 500 wide, h56 (name/email/subject), message 500x140,
  gap 20; then button row: primary button 173x56 ("Send") + four 56x56 social squares, gap 24.
- Right: "Let's talk for" (display, regular + extrabold), "Something special" line 56; paragraph 16/24 #71717A 608 wide;
  email "Youremail@gmail.com" and phone "1234567890" 32px boxes (gap 16), 20-24px semibold black.

## Footer (h100)
- Container py24, row h52: logo left; right block 181x52 right-aligned text 2 lines 16/20?: "@ 2019-2023 Personal" / "Made In Figma".
- NOT CAPTURED: footer bg/border colour (assume white, optional top border).

## Responsive frame 288:310
- NOT CAPTURED (call limit). Stack columns at <1024; hero text first then art; skill grid wraps; tiles 186 -> fluid.

## Illustrations
- web/public/illustrations/hero.svg (889x596) and about.svg (530x572): exported from nodes 181:1068 and 203:202,
  background rects stripped, svgo-optimised. Fills are black/white (about also has #1A2E35/#2B454E/#EDEFEF skin accents, one #FF9581).
  Art has white fills: always display on a light "paper" panel (#FFF / #F5F5F5), also in dark mode. Do not recolour.

# Article page (file c2dDsBhvEQiPJmDxmXzjgl, frame 1:2): NOT CAPTURED (MCP call limit).
Needed: card width, grey bg, serif names, date, title, dashed divider, quote style, highlight colour, references box.

# Code block (file JEcslpRqCqnuz4WBYPSxiA, node 6:186): NOT CAPTURED (MCP call limit).
Needed: header bar (language label + "Copy code"), colours, radius, font.
