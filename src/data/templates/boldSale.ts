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

export default boldSale;
