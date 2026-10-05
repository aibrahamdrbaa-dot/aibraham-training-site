const menuBtn=document.querySelector('.menu-btn'),nav=document.querySelector('.nav-links');
if(menuBtn&&nav){menuBtn.addEventListener('click',()=>{document.body.classList.toggle('nav-open');nav.classList.toggle('nav-open');if(nav.classList.contains('nav-open')){nav.style.display='grid';nav.style.position='fixed';nav.style.inset='68px 0 auto 0';nav.style.background='var(--paper)';nav.style.padding='24px 20px 30px';nav.style.borderBottom='1px solid var(--line)';nav.style.zIndex='99'}else nav.removeAttribute('style')});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{document.body.classList.remove('nav-open');nav.classList.remove('nav-open');nav.removeAttribute('style')}))}
const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in')}),{threshold:.12});document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
const cursor=document.querySelector('.cursor-dot');if(cursor&&matchMedia('(pointer:fine)').matches){window.addEventListener('pointermove',e=>{cursor.style.left=e.clientX+'px';cursor.style.top=e.clientY+'px'});document.querySelectorAll('a,button,.stage-card,.verify-box').forEach(el=>{el.addEventListener('mouseenter',()=>{cursor.style.width='22px';cursor.style.height='22px'});el.addEventListener('mouseleave',()=>{cursor.style.width='12px';cursor.style.height='12px'})})}

const certBox=document.querySelector('[data-verify]');
if(certBox){
  const form=certBox.querySelector('form'),
        input=certBox.querySelector('input'),
        submitButton=form?.querySelector('button'),
        result=certBox.querySelector('.verify-result');
  let data=[];

  const getTokenFromUrl=()=>{
    const pathParts=location.pathname.split('/').filter(Boolean);
    const verifyIndex=pathParts.findIndex(p=>p.toLowerCase()==='verify');
    if(verifyIndex>=0&&pathParts[verifyIndex+1]){
      return decodeURIComponent(pathParts[verifyIndex+1]);
    }
    return new URLSearchParams(location.search).get('token')||'';
  };

  const escapeHtml=s=>String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

  function renderChecking(){
    result.classList.add('show');
    result.innerHTML='<div class="verify-status"><span class="dot"></span>جارٍ التحقق من الشهادة...</div><p class="verify-help">يتم مطابقة رمز الشهادة مع السجل الرسمي لدى Aibraham.</p>';
  }

  function verify(token){
    const clean=(token||'').trim();
    const record=data.find(x=>x.token===clean);
    result.classList.add('show');
    if(!record){
      result.innerHTML='<div class="verify-status"><span class="dot"></span>شهادة غير موجودة</div><div class="result-name">لم يتم العثور على شهادة مطابقة</div><p class="verify-help">تحقق من أن رابط QR صحيح أو جرّب رمز تحقق آخر.</p>';
      return;
    }
    const valid=record.status==='valid';
    result.innerHTML='<div class="verify-status"><span class="dot"></span>'+ (valid?'شهادة موثقة وسارية':'الشهادة ملغاة') +'</div>'+
      '<div class="result-name">'+escapeHtml(record.name)+'</div>'+
      '<p class="verify-help">'+(valid?'تم العثور على الشهادة في سجل التحقق الرسمي لدى Aibraham.':'هذه الشهادة موجودة في السجل لكنها غير سارية حاليًا.')+'</p>'+
      '<div class="result-grid">'+
      '<div class="result-item"><span>Course</span><strong>'+escapeHtml(record.course)+'</strong></div>'+
      '<div class="result-item"><span>Training hours</span><strong>'+escapeHtml(record.hours)+'</strong></div>'+
      (record.certificateId?'<div class="result-item"><span>Certificate ID</span><strong>'+escapeHtml(record.certificateId)+'</strong></div>':'')+
      '<div class="result-item"><span>Status</span><strong>'+escapeHtml(valid?'Valid / سارية':'Revoked / ملغاة')+'</strong></div>'+
      '</div>';
  }

  async function loadAndVerify(){
    const tokenFromUrl=getTokenFromUrl();
    if(tokenFromUrl){
      input.value=tokenFromUrl;
      input.readOnly=true;
      if(submitButton)submitButton.hidden=true;
      renderChecking();
    }
    try{
      const response=await fetch('/certificates.json',{cache:'no-store'});
      if(!response.ok)throw new Error('registry unavailable');
      const json=await response.json();
      data=json.records||[];
      if(tokenFromUrl)verify(tokenFromUrl);
    }catch{
      result.classList.add('show');
      result.innerHTML='<div class="verify-status"><span class="dot"></span>تعذر إكمال التحقق</div><p class="verify-help">تعذر الوصول إلى سجل الشهادات حاليًا. حاول تحديث الصفحة بعد لحظات.</p>';
    }
  }

  form.addEventListener('submit',e=>{e.preventDefault();verify(input.value)});
  loadAndVerify();
}