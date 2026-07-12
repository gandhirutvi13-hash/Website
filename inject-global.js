const fs = require('fs');

const cssPath = 'mobile-responsive-enhancements.css';
let cssContent = fs.readFileSync(cssPath, 'utf8');

const globalReset = `/* GLOBAL RESET & TYPOGRAPHY BASE */
*{box-sizing:border-box;margin:0;padding:0;}
html{scroll-behavior:smooth;}
body{background:#FDF8F5;color:#1B2021;font-family:'Inter',system-ui,sans-serif;-webkit-font-smoothing:antialiased;-webkit-text-size-adjust:100%;text-size-adjust:100%;overflow-x:hidden;}
img{display:block;max-width:100%;}
a{color:inherit;text-decoration:none;transition:all 0.2s ease;}
a:focus-visible,button:focus-visible{outline:3px solid #EE7B5B;outline-offset:3px;border-radius:4px;}
::selection{background:#EE7B5B;color:#1B2021;}

`;

if (!cssContent.includes('GLOBAL RESET & TYPOGRAPHY BASE')) {
  fs.writeFileSync(cssPath, globalReset + cssContent);
  console.log('Injected global reset into mobile-responsive-enhancements.css');
} else {
  console.log('Global reset already present.');
}
