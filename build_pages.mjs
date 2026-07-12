import fs from 'fs';
import path from 'path';

const TEMPLATE = `<!DOCTYPE html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#0E4F52">
<title>__TITLE__</title>
<meta name="description" content="__DESC__">
<link rel="canonical" href="https://physiobyrutvi.in__PATH__">
<meta property="og:title" content="__TITLE__">
<meta property="og:description" content="__DESC__">
<meta property="og:url" content="https://physiobyrutvi.in__PATH__">
<meta property="og:image" content="https://physiobyrutvi.in/assets/social-share.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/mobile-responsive-enhancements.css" media="screen">
<link rel="icon" href="/favicon.ico" sizes="any">
<script defer src="/vendor/react.production.min.js"></script>
<script defer src="/vendor/react-dom.production.min.js"></script>
<script defer src="/support.min.js"></script>
</head>
<body>
<x-dc>
<helmet>
<title>__TITLE__</title>
<meta name="description" content="__DESC__">

</helmet>

<dc-import name="Header" hint-size="100%,66px"></dc-import>

<main style="background:#FDF8F5; min-height:100vh;">
  __CONTENT__
</main>

<dc-import name="Footer"></dc-import>
</x-dc>
<script type="text/x-dc" data-dc-script>
class Component extends DCLogic {
  componentDidMount(){
    const reveals = document.querySelectorAll('[data-reveal]');
    const ob = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if(e.isIntersecting){
          e.target.style.opacity=1;
          e.target.style.transform='translateY(0)';
          ob.unobserve(e.target);
        }
      });
    },{threshold:0.1});
    reveals.forEach(el=>{
      el.style.opacity=0;
      el.style.transform='translateY(20px)';
      el.style.transition='opacity 0.6s ease-out, transform 0.6s ease-out';
      if(el.getAttribute('data-delay')) el.style.transitionDelay = el.getAttribute('data-delay')+'ms';
      ob.observe(el);
    });
  }
}
</script>
</body>
</html>`;

const pages = [
  {
    path: 'privacy-policy/index.html',
    title: 'Privacy Policy | PhysioByRutvi',
    desc: 'Privacy Policy for PhysioByRutvi.',
    content: `
      <section style="padding:clamp(64px,8vw,120px) clamp(20px,5vw,52px); max-width:800px; margin:0 auto;">
        <h1 data-reveal style="font-family:'Fraunces',serif; font-size:clamp(36px,5vw,64px); color:#0E4F52; line-height:1.1; margin-bottom:40px;">Privacy Policy</h1>
        <div data-reveal style="font-size:17px; color:#4A4F4C; line-height:1.6;">
          <p>This Privacy Policy describes how your personal information is collected, used, and shared when you visit or make a booking with PhysioByRutvi.</p>
          <h2 style="font-family:'Fraunces',serif; font-size:24px; color:#0E4F52; margin:32px 0 16px;">Information We Collect</h2>
          <p>When you contact us via WhatsApp or phone, we collect the personal information you provide, such as your name, contact number, location, and details about your medical condition for the purpose of assigning appropriate care.</p>
          <h2 style="font-family:'Fraunces',serif; font-size:24px; color:#0E4F52; margin:32px 0 16px;">How We Use Your Information</h2>
          <p>We use the information we collect to communicate with you, schedule appointments, and ensure our clinical team has the necessary context to provide safe and effective physiotherapy treatment. We do not sell your personal or medical information to third parties.</p>
          <h2 style="font-family:'Fraunces',serif; font-size:24px; color:#0E4F52; margin:32px 0 16px;">Contact Us</h2>
          <p>For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us by e-mail at support@physiobyrutvi.in.</p>
        </div>
      </section>
    `
  },
  {
    path: 'terms/index.html',
    title: 'Terms of Service | PhysioByRutvi',
    desc: 'Terms of Service for PhysioByRutvi.',
    content: `
      <section style="padding:clamp(64px,8vw,120px) clamp(20px,5vw,52px); max-width:800px; margin:0 auto;">
        <h1 data-reveal style="font-family:'Fraunces',serif; font-size:clamp(36px,5vw,64px); color:#0E4F52; line-height:1.1; margin-bottom:40px;">Terms of Service</h1>
        <div data-reveal style="font-size:17px; color:#4A4F4C; line-height:1.6;">
          <h2 style="font-family:'Fraunces',serif; font-size:24px; color:#0E4F52; margin:32px 0 16px;">1. Medical Disclaimer</h2>
          <p>The information provided on this website is for educational purposes only and is not intended as a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.</p>
          <h2 style="font-family:'Fraunces',serif; font-size:24px; color:#0E4F52; margin:32px 0 16px;">2. Services</h2>
          <p>PhysioByRutvi provides in-home physiotherapy assessments and treatments. By scheduling an appointment, you consent to receive care from our qualified practitioners in your home environment.</p>
          <h2 style="font-family:'Fraunces',serif; font-size:24px; color:#0E4F52; margin:32px 0 16px;">3. Cancellations</h2>
          <p>We kindly request at least 24 hours' notice for cancellations. This allows us to reallocate the practitioner's travel time to other patients in need of care.</p>
          <h2 style="font-family:'Fraunces',serif; font-size:24px; color:#0E4F52; margin:32px 0 16px;">4. Contact</h2>
          <p>Questions about the Terms of Service should be sent to us at support@physiobyrutvi.in.</p>
        </div>
      </section>
    `
  }
];

// Ensure directories exist
['privacy-policy', 'terms'].forEach(dir => {
  const fullDir = path.join(process.cwd(), dir);
  if (!fs.existsSync(fullDir)) {
    fs.mkdirSync(fullDir, { recursive: true });
  }
});

pages.forEach(p => {
  let out = TEMPLATE
    .replace(/__TITLE__/g, p.title)
    .replace(/__DESC__/g, p.desc)
    .replace(/__PATH__/g, '/' + p.path.replace('index.html',''))
    .replace('__CONTENT__', p.content);
  
  const fullPath = path.join(process.cwd(), p.path);
  fs.writeFileSync(fullPath, out);
  console.log('Wrote', p.path);
});

console.log('Done generating policy pages.');
