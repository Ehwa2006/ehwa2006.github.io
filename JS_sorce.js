/* ---------- Helpers ---------- */
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

/* ---------- 로더 ---------- */
window.addEventListener('load', () => {
  const ld = $('#loader');
  setTimeout(()=> { ld.style.display = 'none'; }, 400); // 짧은 페이드 후 숨김
});

/* ---------- 다크모드 저장 & 토글 ---------- */
const themeKey = 'pf_theme';
const body = document.body;
function applyTheme(theme){
  if(theme === 'light') body.classList.add('light');
  else body.classList.remove('light');
  localStorage.setItem(themeKey, theme);
}
const savedTheme = localStorage.getItem(themeKey) || 'dark';
applyTheme(savedTheme);
$('#themeToggle').addEventListener('click', ()=>{
  const next = body.classList.contains('light') ? 'dark' : 'light';
  applyTheme(next);
});

/* ---------- 햄버거(menu) ---------- */
const hamburger = $('#hamburger');
const navList = document.querySelector('.nav-list');
hamburger && hamburger.addEventListener('click', ()=> navList.classList.toggle('show'));

/* 네비 링크 클릭 시 모바일 메뉴 닫기 + 부드러운 스크롤 */
document.querySelectorAll('.nav-list a[href^="#"]').forEach(a=>{
  a.addEventListener('click', (e)=>{
    e.preventDefault();
    const id = a.getAttribute('href');
    const el = document.querySelector(id);
    if(el) window.scrollTo({top: el.offsetTop - 70, behavior:'smooth'});
    navList.classList.remove('show');
  });
});

/* ---------- 스크롤에 따른 섹션 show & nav active ---------- */
const observer = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('show');
      // 네비 active
      const id = entry.target.id;
      document.querySelectorAll('.nav-list a').forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + id);
      });
    }
  });
},{threshold: 0.18});

document.querySelectorAll('.section').forEach(s => observer.observe(s));

/* ---------- TOP 버튼 ---------- */
const topBtn = document.createElement('button');
topBtn.id = 'topBtn';
topBtn.textContent = '↑ TOP';
topBtn.style.display = 'none';
document.body.appendChild(topBtn);
window.addEventListener('scroll', ()=> {
  topBtn.style.display = window.scrollY > 400 ? 'block' : 'none';
});
topBtn.addEventListener('click', ()=> window.scrollTo({top:0, behavior:'smooth'}));

/* ---------- 프로젝트 모달 + 슬라이더 ---------- */
const modal = $('#projectModal');
const modalTitle = $('#modalTitle');
const modalDesc = $('#modalDesc');
const modalSlider = $('#modalSlider');
const modalClose = $('#modalClose');

function openProjectModal(card){
  const title = card.dataset.title || card.querySelector('h4')?.innerText;
  const desc = card.dataset.desc || card.querySelector('p')?.innerText;
  const items = (card.dataset.images || '').split(',').map(s=>s.trim()).filter(Boolean);

  modalTitle.textContent = title;
  modalDesc.textContent = desc;
  modalSlider.innerHTML = ''; // 초기화

  if(items.length){
    items.forEach(src => {
      const ext = src.split('.').pop().toLowerCase(); // 확장자 추출

      if(["mp4","webm","ogg"].includes(ext)){       // 🔥 영상일 때
        const video = document.createElement('video');
        video.src = src;
        video.controls = true;
        video.autoplay = true;
        video.loop = true;
        video.style.width = '100%';
        modalSlider.appendChild(video);
      }
      else{                                        // 🔥 이미지일 때
        const img = document.createElement('img');
        img.src = src;
        img.alt = title;
        modalSlider.appendChild(img);
      }
    });
  } else {
    modalSlider.textContent = '미디어 없음';
  }

  modal.setAttribute('aria-hidden', 'false');
}


/* ---------- 간단한 타이핑 이펙트 (다국어 토글 지원) ---------- */
const typingEl = document.querySelector('.typing');
const langToggle = $('#langToggle');
let lang = 'kor';
function startTyping(){
  if(!typingEl) return;
  const txt = lang === 'eng' ? typingEl.dataset.textEng || typingEl.dataset.textEng : typingEl.dataset.textKor || typingEl.dataset.textKor;
  let i=0;
  typingEl.textContent = '';
  const iv = setInterval(()=>{
    typingEl.textContent += txt[i++] || '';
    if(i>txt.length) { clearInterval(iv); }
  }, 45);
}
langToggle.addEventListener('click', (e)=>{
  e.preventDefault();
  lang = lang === 'kor' ? 'eng' : 'kor';
  langToggle.textContent = lang === 'kor' ? 'EN' : 'KR';
  startTyping();
});
startTyping();

/* ---------- 폼 전송 (Formspree 예시) ---------- */
/* ---------- 폼 전송 (Formspree) ---------- */
const form = $('#contactForm');
const formStatus = $('#formStatus');

if(form){
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    formStatus.textContent = '전송중...';

    try{
      const data = new FormData(form);
      const resp = await fetch(form.action, {
        method: form.method,
        body: data,
        headers: { 'Accept': 'application/json' }
      });

      const result = await resp.json();

      if(resp.ok){
        formStatus.textContent = '전송 완료! 감사합니다😊';
        form.reset();
      } else {
        formStatus.textContent = result.errors
          ? result.errors.map(e => e.message).join(', ')
          : '전송 실패';
      }

    } catch(err){
      console.error(err);
      formStatus.textContent = '서버 오류로 전송 실패';
    }
  });
}


/* ---------- 방문자 카운트 (간단 로컬 스토리지 기반) ---------- */
const visitsKey = 'pf_visits';
let visits = parseInt(localStorage.getItem(visitsKey) || '0', 10);
visits++; localStorage.setItem(visitsKey, visits);
console.log('This browser visited this portfolio', visits, 'times.'); // 대체 분석 로그

/* ---------- 간단한 접근성: ESC로 모달 닫기, focus 관리 ---------- */
document.addEventListener('keydown', (e)=> {
  if(e.key === 'Escape') {
    if(modal.getAttribute('aria-hidden') === 'false') modal.setAttribute('aria-hidden','true');
  }
});

/* ---------- 간단한 analytics placeholder (콘솔 로그) ---------- */
function track(event, data = {}) {
  // 여기서 실 서비스 연결 가능 (GA, Plausible 등)
  console.log('[track]', event, data);
}
['click','scroll','load'].forEach(ev => window.addEventListener(ev, ()=> track(ev)));

/* ---------- 초기화 로그 ---------- */
console.info('Portfolio script initialized');

/* ---------- 프로젝트 카드 모달 열기 이벤트 연결 ---------- */
$$('.open-modal').forEach(btn => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.project-card');
    if(card) openProjectModal(card);
  });
});

/* 모달 닫기 */
modalClose.addEventListener('click', ()=> modal.setAttribute('aria-hidden','true'));
modal.addEventListener('click', (e)=>{
  if(e.target === modal) modal.setAttribute('aria-hidden','true'); // 바깥 클릭 닫기
});
// 모달 열릴 때 스크롤 잠금
function openProjectModal(card) {
  modalTitle.textContent = card.dataset.title;
  modalDesc.textContent = card.dataset.desc;
  modalSlider.innerHTML = "";

  const files = card.dataset.images.split(',');
  files.forEach(file => {
    if(file.trim().endsWith(".mp4")){
      modalSlider.innerHTML += `<video src="${file.trim()}" controls autoplay></video>`;
    } else {
      modalSlider.innerHTML += `<img src="${file.trim()}" alt="">`;
    }
  });

  modal.setAttribute('aria-hidden','false');
  document.body.style.overflow = "hidden";   // 스크롤 방지
}

// 닫으면 스크롤 복구
modalClose.addEventListener('click', ()=> {
  modal.setAttribute('aria-hidden','true');
  document.body.style.overflow = "";
});
modal.addEventListener('click', e=>{
  if(e.target === modal){
    modal.setAttribute('aria-hidden','true');
    document.body.style.overflow = "";
  }
});
let slideIndex = 0;

function showSlide(n){
  const slides = document.querySelectorAll('#modalSlider .slide-item');
  if(slides.length === 0) return;

  slideIndex = (n + slides.length) % slides.length;

  slides.forEach(s => s.classList.remove('active'));
  slides[slideIndex].classList.add('active');
}

function openProjectModal(card){
  modalTitle.textContent = card.dataset.title;
  modalDesc.textContent = card.dataset.desc;

  const files = card.dataset.images.split(',');
  modalSlider.innerHTML = "";  // 초기화

  files.forEach((file,i)=>{
    const ext = file.trim().split('.').pop();

    const wrap = document.createElement('div');
    wrap.classList.add('slide-item');
    if(i === 0) wrap.classList.add('active'); // 첫 화면

    if(["mp4","webm","ogg"].includes(ext)){
      wrap.innerHTML = `<video src="${file.trim()}" controls autoplay loop></video>`;
    } else {
      wrap.innerHTML = `<img src="${file.trim()}" alt="" />`;
    }
    modalSlider.appendChild(wrap);
  });

  slideIndex = 0;
  modal.setAttribute('aria-hidden','false');
  document.body.style.overflow = "hidden";
}

// 버튼 이벤트
$('#slidePrev').addEventListener('click', ()=> showSlide(slideIndex - 1));
$('#slideNext').addEventListener('click', ()=> showSlide(slideIndex + 1));


async function loadSerpBg(){
  const vercelUrl = "https://ehwa2006.vercel.app/api/game-images";
  const localProxyUrl = "http://localhost:3000/api/game-images";
  const timeoutMs = 2000;
  const timeout = (ms) => new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms));

  const urls = [vercelUrl, localProxyUrl];
  for (const url of urls) {
    try {
      const res = await Promise.race([fetch(url), timeout(timeoutMs)]);
      if(!res || !res.ok) throw new Error('fetch failed');
      const data = await res.json();
      console.log(`✅ 응답 수신: ${url}`);
      return applyBackgroundImage(data);
    } catch(err){
      console.warn(`⚠️ ${url} 실패: ${err.message}`);
      continue;
    }
  }

  console.warn('🔁 모든 프록시 실패, Unsplash로 폴백');
  applyBackgroundImage(null);
}

function applyBackgroundImage(data, unsplashUrl = null) {
  let pick = unsplashUrl;

  if(data && data.images_results){
    let imgs = data.images_results
      .map(i => i.original || i.thumbnail || i.source || i.link)
      .filter(u => u && (u.startsWith('http') || u.startsWith('https')));

    console.log(`📌 필터링 후 이미지 수: ${imgs?.length || 0}`);
    if(imgs?.length){
      console.log(`📸 첫 3개 이미지:`, imgs.slice(0,3));
      pick = imgs[Math.floor(Math.random() * Math.min(imgs.length, 100))];
      console.log(`🎯 선택된 이미지:`, pick);
    }
  }

  if(!pick){
    pick = `https://source.unsplash.com/random/1600x900/?game&sig=${Date.now()}`;
    console.log(`✅ Unsplash 사용:`, pick);
  }

  let bg = document.querySelector('.dynamic-bg');
  if(!bg){
    bg = document.createElement('div');
    bg.className = 'dynamic-bg';
    document.body.appendChild(bg);
    console.log('✅ .dynamic-bg 요소 생성됨');
  }

  bg.style.backgroundImage = `url("${pick}")`;
  bg.style.opacity = '0.65';
  console.log('✅ 배경 이미지 설정됨, opacity: 0.65');
  setTimeout(()=>{
    bg.style.opacity = '0.28';
    console.log('✅ opacity 변경됨: 0.28');
  }, 600);
}

window.addEventListener("load", loadSerpBg);
