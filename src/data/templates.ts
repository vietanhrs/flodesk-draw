export interface Template {
  id: string;
  title: string;
  categoryId: string;
  html: string;
}

const boldSale = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Bold sale announcement</title>
<style>
  html, body { margin: 0; overflow: hidden; }
  body {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    background: #1a1411;
    color: #f4ece1;
    width: 600px;
    height: 785px;
    box-sizing: border-box;
    padding: 96px 64px 80px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .pill { font-size: 12px; letter-spacing: 6px; text-transform: uppercase; opacity: 0.7; margin: 0 0 24px; }
  h1 { font-size: 132px; font-weight: 900; letter-spacing: -5px; line-height: 0.86; margin: 0; color: #f8c97a; }
  p { font-size: 17px; line-height: 1.7; max-width: 400px; margin: 36px 0 0; opacity: 0.85; }
  .cta { display: inline-block; background: #f8c97a; color: #1a1411; padding: 18px 36px; text-decoration: none; font-weight: 700; letter-spacing: 1.5px; font-size: 13px; text-transform: uppercase; margin-top: 44px; }
  .footer { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; opacity: 0.4; }
</style>
</head>
<body>
  <div>
    <p class="pill">Black Friday</p>
    <h1>70%<br/>OFF</h1>
    <p>Our biggest sale of the year. Everything in store is marked down through midnight Sunday.</p>
    <a href="#" class="cta">Shop the sale</a>
  </div>
  <div class="footer">Use code BLACK70 at checkout</div>
</body>
</html>`;

const welcomeFamily = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Welcome to the family</title>
<style>
  html, body { margin: 0; overflow: hidden; }
  body {
    font-family: 'Georgia', 'Times New Roman', serif;
    background: #f4ede3;
    color: #3a2f29;
    width: 600px;
    height: 785px;
    box-sizing: border-box;
    padding: 80px 72px;
    text-align: center;
  }
  .mark { font-size: 13px; letter-spacing: 8px; text-transform: uppercase; font-family: 'Helvetica Neue', Arial, sans-serif; color: #8a7665; }
  h1 { font-family: 'Georgia', serif; font-style: italic; font-size: 72px; font-weight: 400; line-height: 1.05; margin: 56px 0 32px; color: #2a201b; }
  .rule { width: 48px; height: 1px; background: #b8a896; margin: 28px auto; border: 0; }
  p { font-size: 16px; line-height: 1.85; max-width: 380px; margin: 0 auto 36px; color: #5a4a40; }
  .cta { display: inline-block; background: transparent; color: #3a2f29; border: 1px solid #3a2f29; padding: 16px 40px; text-decoration: none; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 12px; letter-spacing: 3px; text-transform: uppercase; margin-top: 24px; }
  .signature { margin-top: 56px; font-style: italic; font-size: 18px; color: #6a5648; }
</style>
</head>
<body>
  <div class="mark">Welcome</div>
  <h1>Hello,<br/>lovely&nbsp;friend.</h1>
  <hr class="rule" />
  <p>I'm so glad you're here. This little corner of the internet is where I share studio notes, slow living rituals, and the occasional recipe.</p>
  <p>Pour yourself something warm and stay a while.</p>
  <a href="#" class="cta">Read the journal</a>
  <div class="signature">— with love, Mira</div>
</body>
</html>`;

const newsletter = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Spring newsletter</title>
<style>
  html, body { margin: 0; overflow: hidden; }
  body {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    background: #ffffff;
    color: #1f1f1f;
    width: 600px;
    height: 785px;
    box-sizing: border-box;
    padding: 56px 64px;
  }
  .masthead { display: flex; align-items: baseline; justify-content: space-between; border-bottom: 2px solid #1f1f1f; padding-bottom: 18px; }
  .logo { font-family: 'Georgia', serif; font-size: 34px; font-weight: 700; letter-spacing: -0.5px; }
  .meta { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #6a6a6a; }
  h2 { font-family: 'Georgia', serif; font-size: 38px; font-weight: 500; line-height: 1.15; margin: 36px 0 12px; }
  .lede { font-size: 15px; line-height: 1.7; color: #404040; margin: 0 0 32px; }
  .cols { display: flex; gap: 28px; border-top: 1px solid #e0ddd6; padding-top: 28px; }
  .col { flex: 1; }
  .cat { font-size: 10px; letter-spacing: 2.5px; text-transform: uppercase; color: #a06d3a; margin: 0 0 8px; }
  h3 { font-family: 'Georgia', serif; font-size: 18px; font-weight: 500; line-height: 1.3; margin: 0 0 10px; }
  .blurb { font-size: 13px; line-height: 1.65; color: #555; margin: 0; }
  .cta { display: block; text-align: center; background: #1f1f1f; color: #fff; padding: 16px; text-decoration: none; font-size: 12px; letter-spacing: 3px; text-transform: uppercase; font-weight: 600; margin-top: 36px; }
</style>
</head>
<body>
  <div class="masthead">
    <div class="logo">The Atelier</div>
    <div class="meta">Issue 14 · Spring</div>
  </div>
  <h2>Slow mornings, small wins, and a studio update.</h2>
  <p class="lede">A round-up of what we have been making, reading, and obsessing over this season.</p>
  <div class="cols">
    <div class="col">
      <p class="cat">Studio notes</p>
      <h3>A new collection in linen</h3>
      <p class="blurb">Seven everyday pieces in undyed European linen, made in small runs to order.</p>
    </div>
    <div class="col">
      <p class="cat">Reading</p>
      <h3>Three books on quiet</h3>
      <p class="blurb">Slim volumes from our shelf to yours — for the in-between hours of the day.</p>
    </div>
  </div>
  <a href="#" class="cta">Read the full issue</a>
</body>
</html>`;

const thankYou = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Thank you</title>
<style>
  html, body { margin: 0; overflow: hidden; }
  body {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    background: #ece4d6;
    color: #322821;
    width: 600px;
    height: 785px;
    box-sizing: border-box;
    padding: 100px 72px;
    text-align: center;
  }
  .leaf { width: 64px; height: 64px; margin: 0 auto 36px; opacity: 0.7; }
  .leaf svg { width: 100%; height: 100%; }
  h1 { font-family: 'Georgia', 'Times New Roman', serif; font-style: italic; font-size: 86px; font-weight: 400; line-height: 1; margin: 0; color: #2a201b; letter-spacing: -1.5px; }
  .sub { font-size: 13px; letter-spacing: 6px; text-transform: uppercase; margin: 32px 0 24px; color: #6a5849; }
  p { font-size: 16px; line-height: 1.85; max-width: 360px; margin: 0 auto 28px; color: #4a3d34; }
  .signoff { font-family: 'Georgia', serif; font-style: italic; font-size: 22px; color: #5a4838; margin-top: 48px; }
  .name { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; letter-spacing: 4px; text-transform: uppercase; color: #8a7665; margin-top: 8px; }
</style>
</head>
<body>
  <div class="leaf">
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 6 C44 18 50 30 50 42 C50 52 42 58 32 58 C22 58 14 52 14 42 C14 30 20 18 32 6 Z" stroke="#6a5849" stroke-width="1.5" />
      <path d="M32 14 L32 56" stroke="#6a5849" stroke-width="1" />
    </svg>
  </div>
  <h1>thank&nbsp;you</h1>
  <div class="sub">For being here</div>
  <p>Your support means more than you know. Every order, message, and share helps keep this small studio going.</p>
  <p>As a little token, here is a code for 15% off your next order: <strong>STAY15</strong></p>
  <div class="signoff">with gratitude,</div>
  <div class="name">The Atelier Team</div>
</body>
</html>`;

const inspireQuote = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Find your light</title>
<style>
  html, body { margin: 0; overflow: hidden; }
  body {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    background: #faf6ef;
    color: #2a241f;
    width: 600px;
    height: 785px;
    box-sizing: border-box;
    padding: 80px 64px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .top { font-size: 12px; letter-spacing: 5px; text-transform: uppercase; color: #a08c75; }
  .quote-mark { font-family: 'Georgia', serif; font-size: 140px; line-height: 1; color: #e3d3b8; margin: 0; height: 60px; overflow: hidden; }
  blockquote { font-family: 'Georgia', 'Times New Roman', serif; font-style: italic; font-size: 42px; font-weight: 400; line-height: 1.25; margin: 0; color: #2a241f; letter-spacing: -0.5px; }
  cite { display: block; font-family: 'Helvetica Neue', Arial, sans-serif; font-style: normal; font-size: 12px; letter-spacing: 4px; text-transform: uppercase; color: #8a7665; margin-top: 36px; }
  .cta { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; letter-spacing: 3px; text-transform: uppercase; color: #2a241f; text-decoration: none; border-bottom: 1px solid #2a241f; padding-bottom: 6px; align-self: flex-start; }
  .bottom { display: flex; align-items: flex-end; justify-content: space-between; }
  .issue { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #b0a08c; }
</style>
</head>
<body>
  <div class="top">A Monday Note</div>
  <div>
    <p class="quote-mark">"</p>
    <blockquote>
      Almost everything will work again if you unplug it for a few minutes — including you.
      <cite>— Anne Lamott</cite>
    </blockquote>
  </div>
  <div class="bottom">
    <a href="#" class="cta">Read this week</a>
    <div class="issue">No. 042</div>
  </div>
</body>
</html>`;

const plainText = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Quick update</title>
<style>
  html, body { margin: 0; overflow: hidden; }
  body {
    font-family: 'Georgia', 'Times New Roman', serif;
    background: #ffffff;
    color: #1a1a1a;
    width: 600px;
    height: 785px;
    box-sizing: border-box;
    padding: 96px 96px 80px;
  }
  .date { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: #8a8a8a; margin: 0 0 32px; }
  h1 { font-size: 22px; font-weight: 500; margin: 0 0 28px; }
  p { font-size: 16px; line-height: 1.8; margin: 0 0 18px; color: #2a2a2a; }
  a { color: inherit; }
  .signoff { margin-top: 40px; }
  .pen { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #8a8a8a; margin-top: 36px; }
</style>
</head>
<body>
  <p class="date">Friday, May 10</p>
  <h1>A quick note from my desk —</h1>
  <p>Hi friend,</p>
  <p>I wanted to write a short letter instead of the usual newsletter this week. No pictures, no buttons — just a few honest thoughts about what I have been working on.</p>
  <p>The new project is taking longer than I expected, but that has turned out to be a gift. Slowing down has surfaced ideas that the deadline version of me would have steamrolled.</p>
  <p>If you ever feel like writing back, I read everything. Just hit reply.</p>
  <div class="signoff">Warmly,<br/>Mira</div>
  <p class="pen">Sent from a quiet morning</p>
</body>
</html>`;

export const templates: Template[] = [
  {
    id: "bold-sale-announcement",
    title: "Bold sale announcement",
    categoryId: "make-money",
    html: boldSale,
  },
  {
    id: "welcome-to-the-family",
    title: "Welcome to the family",
    categoryId: "welcome",
    html: welcomeFamily,
  },
  {
    id: "spring-newsletter",
    title: "Spring newsletter",
    categoryId: "share-news",
    html: newsletter,
  },
  {
    id: "thank-you-note",
    title: "Thank you note",
    categoryId: "say-thanks",
    html: thankYou,
  },
  {
    id: "find-your-light",
    title: "Find your light",
    categoryId: "inspire",
    html: inspireQuote,
  },
  {
    id: "quick-update",
    title: "Quick update",
    categoryId: "plain-text",
    html: plainText,
  },
];

export const TEMPLATE_PREVIEW_WIDTH = 600;
export const TEMPLATE_PREVIEW_HEIGHT = 785;
