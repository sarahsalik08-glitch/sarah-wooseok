// ── PETAL CANVAS ──
(function(){
  const canvas = document.getElementById('petal-canvas');
  const ctx    = canvas.getContext('2d');
  let W, H, petals = [];

  const COLORS = ['#E8C5BE','#C9847A','#F5E6D3','#C4A882','#8A9E8C'];

  function resize(){ W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  window.addEventListener('resize', resize); resize();

  function makePetal(){
    return {
      x: Math.random()*W, y: -20,
      size: 6 + Math.random()*8,
      speedY: .4 + Math.random()*.7,
      speedX: -.3 + Math.random()*.6,
      rot: Math.random()*Math.PI*2,
      rotSpeed: (Math.random()-.5)*.02,
      color: COLORS[Math.floor(Math.random()*COLORS.length)],
      opacity: .25 + Math.random()*.35,
    };
  }

  for(let i=0;i<28;i++){
    const p = makePetal(); p.y = Math.random()*H;
    petals.push(p);
  }

  function draw(){
    ctx.clearRect(0,0,W,H);
    petals.forEach(p=>{
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(0,0,p.size*.55,p.size,0,0,Math.PI*2);
      ctx.fill();
      ctx.restore();
      p.y += p.speedY; p.x += p.speedX; p.rot += p.rotSpeed;
      if(p.y > H+20){ Object.assign(p, makePetal()); }
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

// ── COUNTDOWN ──
(function(){
  const target = new Date('2026-12-12T14:00:00+08:00');
  function tick(){
    const diff = target - Date.now();
    if(diff <= 0){
      document.getElementById('cd-days').textContent  = '000';
      document.getElementById('cd-hours').textContent = '00';
      document.getElementById('cd-mins').textContent  = '00';
      document.getElementById('cd-secs').textContent  = '00';
      return;
    }
    const d = Math.floor(diff/864e5);
    const h = Math.floor((diff%864e5)/36e5);
    const m = Math.floor((diff%36e5)/6e4);
    const s = Math.floor((diff%6e4)/1e3);
    document.getElementById('cd-days').textContent  = String(d).padStart(3,'0');
    document.getElementById('cd-hours').textContent = String(h).padStart(2,'0');
    document.getElementById('cd-mins').textContent  = String(m).padStart(2,'0');
    document.getElementById('cd-secs').textContent  = String(s).padStart(2,'0');
  }
  tick(); setInterval(tick, 1000);
})();

// ── REVEAL ──
const io = new IntersectionObserver(entries=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target); }});
},{threshold:.1});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

// ── GUEST LOOKUP ──
const GUEST_LIST = [
  'Sarah Kim','Woo Seok Park','Maria Santos','Jose Reyes','Emily Cruz',
  'Miguel Lopez','Anna Garcia','David Lim','Rachel Tan','James Ong',
  'Sophia Chen','Carlos Rivera','Mia Dela Cruz','Luke Mendoza','Grace Yoon',
  'Patrick Lee','Isabella Ramos','Nathan Hong','Chloe Bautista','Kevin Wu'
];
let selectedGuest = '';

function searchGuests(){
  const q = document.getElementById('lookupInput').value.trim().toLowerCase();
  const results = document.getElementById('lookupResults');
  if(q.length < 2){ results.innerHTML = '<p class="lookup-hint">Type at least 2 characters to search.</p>'; return; }
  const matches = GUEST_LIST.filter(g=>g.toLowerCase().includes(q));
  if(!matches.length){
    results.innerHTML = '<p class="lookup-hint">No guests found. Please contact the couple if you think this is an error.</p>';
    return;
  }
  results.innerHTML = matches.map(g=>
    `<span class="guest-chip${selectedGuest===g?' selected':''}" onclick="selectGuest('${g}',this)">
      <span class="guest-chip-dot"></span>${g}
    </span>`
  ).join('') + '<p class="lookup-hint" style="margin-top:.6rem">Tap your name to pre-fill the RSVP form.</p>';
}

function selectGuest(name, el){
  selectedGuest = name;
  document.querySelectorAll('.guest-chip').forEach(c=>c.classList.remove('selected'));
  el.classList.add('selected');
  const parts = name.split(' ');
  document.getElementById('rfirst').value = parts[0] || '';
  document.getElementById('rlast').value  = parts.slice(1).join(' ') || '';
  document.getElementById('rsvp').scrollIntoView({behavior:'smooth', block:'start'});
}

// ── RSVP FORM STATE ──
let attending = null, meal = null;

function setAttend(val, btn){
  attending = val;
  document.querySelectorAll('.attend-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('mealSection').style.display = val==='yes' ? '' : 'none';
}

function setMeal(val, btn){
  meal = val;
  document.querySelectorAll('.meal-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
}

// hide meal if declined initially
document.getElementById('mealSection').style.display = 'none';

function submitRSVP(){
  const first = document.getElementById('rfirst').value.trim();
  const email = document.getElementById('remail').value.trim();
  const btn   = document.getElementById('rsvpSubmitBtn');

  if(!first || !email || attending===null){
    btn.textContent = 'Please fill in all required fields';
    btn.style.background = '#C9847A';
    setTimeout(()=>{ btn.textContent = 'Send my RSVP'; btn.style.background = ''; }, 2500);
    return;
  }
  if(attending==='yes' && !meal){
    btn.textContent = 'Please select a meal preference';
    btn.style.background = '#C9847A';
    setTimeout(()=>{ btn.textContent = 'Send my RSVP'; btn.style.background = ''; }, 2500);
    return;
  }
  btn.disabled = true; btn.textContent = 'Sending…';
  setTimeout(()=>{
    document.getElementById('rsvpFormWrap').style.display = 'none';
    document.getElementById('rsvpSuccess').style.display  = 'block';
  }, 1000);
}

// ── PLAYLIST ──
let songCount = 2;
function addSong(){
  const song   = document.getElementById('songInput').value.trim();
  const artist = document.getElementById('artistInput').value.trim();
  const note   = document.getElementById('noteInput').value.trim();
  if(!song) return;
  songCount++;
  const li = document.createElement('li');
  li.className = 'playlist-item';
  li.innerHTML = `
    <span class="playlist-num">${songCount}</span>
    <div class="playlist-info">
      <div class="playlist-song">${song}</div>
      ${artist ? `<div class="playlist-artist">${artist}</div>` : ''}
      ${note   ? `<div class="playlist-note">${note}</div>`   : ''}
    </div>`;
  document.getElementById('playlistList').appendChild(li);
  document.getElementById('songInput').value   = '';
  document.getElementById('artistInput').value = '';
  document.getElementById('noteInput').value   = '';
  li.scrollIntoView({behavior:'smooth', block:'nearest'});
}

// allow Enter key on song inputs
['songInput','artistInput','noteInput'].forEach(id=>{
  document.getElementById(id).addEventListener('keydown', e=>{ if(e.key==='Enter') addSong(); });
});
document.getElementById('lookupInput').addEventListener('keydown', e=>{ if(e.key==='Enter') searchGuests(); });
