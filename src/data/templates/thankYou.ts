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

export default thankYou;
