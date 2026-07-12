const fs = require('fs');

let homeHtml = fs.readFileSync('Home.dc.html', 'utf8');

// The block to remove:
/*
<style>
  *{box-sizing:border-box;margin:0;padding:0;}
  html{scroll-behavior:smooth;}
  body{background:#F6F2EC;color:#1B2021;font-family:'Inter',system-ui,sans-serif;-webkit-font-smoothing:antialiased;-webkit-text-size-adjust:100%;text-size-adjust:100%;overflow-x:hidden;}
  img{display:block;max-width:100%;}
  a{color:inherit;}
  a:focus-visible,button:focus-visible{outline:3px solid #EE7B5B;outline-offset:3px;border-radius:4px;}
  ::selection{background:#EE7B5B;color:#1B2021;}
  @supports (content-visibility:auto){
    section:nth-of-type(n+2){content-visibility:auto;contain-intrinsic-size:720px;}
  }
  #heroTrack::-webkit-scrollbar,.pbrScroll::-webkit-scrollbar{display:none;}
  @media (prefers-reduced-motion:reduce){html{scroll-behavior:auto;}}
</style>
*/

// Regex to catch the specific style block inside helmet
const styleRegex = /<style>[\s\S]*?@media \(prefers-reduced-motion:reduce\)\{html\{scroll-behavior:auto;\}\}\s*<\/style>/;
if(styleRegex.test(homeHtml)) {
  homeHtml = homeHtml.replace(styleRegex, '');
  fs.writeFileSync('Home.dc.html', homeHtml);
  console.log("Removed inline style block from Home.dc.html");
} else {
  console.log("Could not find style block in Home.dc.html");
}

let indexHtml = fs.readFileSync('index.html', 'utf8');
if(styleRegex.test(indexHtml)) {
  indexHtml = indexHtml.replace(styleRegex, '');
  fs.writeFileSync('index.html', indexHtml);
  console.log("Removed inline style block from index.html");
} else {
  console.log("Could not find style block in index.html");
}
