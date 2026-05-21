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

export default newsletter;
