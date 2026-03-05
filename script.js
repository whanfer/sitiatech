const pages=[...document.querySelectorAll('.page')];
const navAs=[...document.querySelectorAll('.nav-links a[data-sec]')];
const navEl=document.getElementById('nav');
const menuBtn=document.getElementById('menuBtn');
const labels=['Inicio','Servicios','Proceso','Casos','Sobre mí','Contacto'];
const ANIM_END=720;
const WHEEL_LOCK=880;
const SWIPE_THRESHOLD=40;
const COUNTER_DURATION=1400;
let cur_sec=0, busy=false;

function goTo(next,dir){
  if(next===cur_sec||busy||next<0||next>=pages.length)return;
  busy=true;
  const from=pages[cur_sec], to=pages[next];
  to.classList.add(dir>0?'from-below':'from-above');
  to.style.opacity='0';
  to.classList.remove('active');
  to.offsetHeight;
  from.classList.add('anim');
  to.classList.add('anim');
  requestAnimationFrame(()=>{
    requestAnimationFrame(()=>{
      from.classList.add(dir>0?'to-above':'to-below');
      from.classList.remove('active');
      to.classList.remove('from-below','from-above');
      to.style.opacity='';
      to.classList.add('active');
      cur_sec=next;
      updateUI();
      setTimeout(()=>{
        from.classList.remove('anim','to-above','to-below');
        to.classList.remove('anim');
        busy=false;
        runCounters(to);
      },ANIM_END);
    });
  });
}

function updateUI(){
  const progFill=document.getElementById('progFill');
  const progLabel=document.getElementById('progLabel');
  if(progFill)progFill.style.height=((cur_sec+1)/pages.length*100)+'%';
  if(progLabel)progLabel.textContent=labels[cur_sec];
  navAs.forEach(a=>{
    const isActive=+a.dataset.sec===cur_sec;
    a.classList.toggle('active',isActive);
    a.setAttribute('aria-current',isActive?'page':null);
  });
  if(navEl)navEl.classList.toggle('opaque',cur_sec>0);
}

/* Wheel */
let wLock=false;
window.addEventListener('wheel',e=>{
  if(wLock||busy)return;
  wLock=true;setTimeout(()=>wLock=false,WHEEL_LOCK);
  goTo(cur_sec+(e.deltaY>0?1:-1),e.deltaY>0?1:-1);
},{passive:true});

/* Keys */
window.addEventListener('keydown',e=>{
  if(e.key==='ArrowDown'||e.key==='PageDown'){e.preventDefault();goTo(cur_sec+1,1);}
  if(e.key==='ArrowUp'||e.key==='PageUp'){e.preventDefault();goTo(cur_sec-1,-1);}
});

/* Touch */
let tY=null;
window.addEventListener('touchstart',e=>{tY=e.touches[0].clientY;},{passive:true});
window.addEventListener('touchend',e=>{
  if(tY===null)return;
  const dy=tY-e.changedTouches[0].clientY;
  if(Math.abs(dy)>SWIPE_THRESHOLD)goTo(cur_sec+(dy>0?1:-1),dy>0?1:-1);
  tY=null;
},{passive:true});

/* Click: delegación en document para [data-sec] */
document.addEventListener('click',e=>{
  const el=e.target.closest('[data-sec]');
  if(!el)return;
  e.preventDefault();
  const t=+el.dataset.sec;
  goTo(t,t>cur_sec?1:-1);
  if(navEl.querySelector('.nav-links')?.classList.contains('open'))navEl.querySelector('.nav-links').classList.remove('open');
});

/* Menú móvil */
if(menuBtn){
  menuBtn.addEventListener('click',()=>{
    const links=document.getElementById('navLinks');
    links.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded',links.classList.contains('open'));
  });
}

/* Counter */
function runCounters(sec){
  sec.querySelectorAll('[data-count]').forEach(el=>{
    const target=+el.dataset.count, suffix=el.dataset.suffix||'';
    let start=null;
    function step(ts){
      if(!start)start=ts;
      const p=Math.min((ts-start)/COUNTER_DURATION,1);
      const ease=1-Math.pow(1-p,3);
      el.textContent=Math.round(ease*target)+suffix;
      if(p<1)requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}
if(pages.length)setTimeout(()=>runCounters(pages[0]),500);