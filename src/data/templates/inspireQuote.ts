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

export default inspireQuote;
