const fs = require('fs');

let buildScript = fs.readFileSync('build_pages.mjs', 'utf8');

const oldStyle = `<style>
  *{box-sizing:border-box;margin:0;padding:0;}
  html{scroll-behavior:smooth;}
  body{background:#FDF8F5;color:#1B2021;font-family:'Inter',system-ui,sans-serif;-webkit-font-smoothing:antialiased;-webkit-text-size-adjust:100%;text-size-adjust:100%;overflow-x:hidden;}
  img{display:block;max-width:100%;}
  a{color:inherit;text-decoration:underline;text-decoration-color:rgba(238,123,91,0.4);text-underline-offset:4px;transition:all 0.2s ease;}
  a:hover{color:#EE7B5B;text-decoration-color:#EE7B5B;}
  ::selection{background:#EE7B5B;color:#1B2021;}
</style>`;

if(buildScript.includes(oldStyle)) {
  buildScript = buildScript.replace(oldStyle, '');
  fs.writeFileSync('build_pages.mjs', buildScript);
  console.log("Removed old style from build_pages.mjs");
} else {
  console.log("Could not find style in build_pages.mjs");
}
