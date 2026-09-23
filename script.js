// Text is configured exclusively in config.json. HTML keeps a fallback for loading errors.
async function boot() {
 let config;
 try {
  const response = await fetch('./config.json', {cache: 'no-cache'});
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  config = await response.json();
  if (!Array.isArray(config.chat.messages) || !config.rsvp.taunts.length) throw new Error('Invalid chat / RSVP config');
  document.title = config.meta.title;
  document.documentElement.lang = config.meta.language;
  document.querySelector('meta[name="description"]').content = config.meta.description;
  document.querySelectorAll('[data-copy]').forEach(el => {
   const [section, key] = el.dataset.copy.split('|');
   const values = config.text[section][key];
   const nodes = [...el.childNodes].filter(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
   if (!Array.isArray(values) || values.length !== nodes.length) throw new Error(`Invalid text: ${section}.${key}`);
   nodes.forEach((node, i) => node.textContent = values[i]);
  });
  document.querySelectorAll('[data-label]').forEach(el => el.setAttribute('aria-label', config.accessibility[el.dataset.label]));
  document.querySelectorAll('[data-image]').forEach(el => {
   const image = config.images[el.dataset.image]; el.src = image.src; el.alt = image.alt;
  });
 } catch (error) {
  console.error('Cannot load config.json:', error);
  const notice = document.createElement('p');
  notice.setAttribute('role', 'alert');
  notice.textContent = 'Không tải được config.json. Hãy kiểm tra cú pháp JSON và mở trang qua máy chủ HTTP (xem README).';
  notice.style.cssText = 'position:fixed;inset:0 0 auto;padding:16px;background:white;color:#a00;z-index:9999';
  document.body.prepend(notice);
  return;
 }
const $ = selector => document.querySelector(selector);
const scenes = ['intro', 'chat-scene', 'invite', 'success'];
let chatTimer, chatIndex = 0, paused = false, dodges = 0;
const messages = config.chat.messages;
function show(id) {
  clearTimeout(chatTimer);
  scenes.forEach(scene => $('#' + scene).classList.toggle('active', scene === id));
  window.scrollTo({top:0, behavior:'instant'});
  const heading = $('#' + id + ' h1, #' + id + ' h2');
  if (heading) { heading.tabIndex = -1; heading.focus({preventScroll:true}); }
}
$('#open-letter').onclick = () => { show('chat-scene'); startChat(); };
$('#back-to-intro').onclick = () => show('intro');
$('#skip-chat').onclick = () => show('invite');
$('#to-invite').onclick = () => show('invite');
$('#back-to-invite').onclick = () => show('invite');
function startChat() {
  clearTimeout(chatTimer);
  chatIndex = 0; paused = false;
  $('#chat-log').replaceChildren();
  $('#to-invite').hidden = true;
  $('#chat-progress').style.width = '0%';
  $('#chat-status').textContent = config.chat.playing;
  $('#pause-chat').textContent = config.chat.pauseIcon;
  $('#pause-chat').disabled = false;
  $('#pause-chat').setAttribute('aria-label', config.chat.pauseLabel);
  nextMessage();
}
function nextMessage() {
  if (paused) return;
  if (chatIndex >= messages.length) {
    $('#typing').hidden = true;
    $('#to-invite').hidden = false;
    $('#chat-status').textContent = config.chat.finished;
    $('#pause-chat').disabled = true;
    return;
  }
  $('#typing').hidden = false;
  chatTimer = setTimeout(() => {
    const message = messages[chatIndex++];
    $('#typing').hidden = true;
    const item = document.createElement('div');
    item.className = 'message' + (message.me ? ' me' : '');
    const avatar = document.createElement('div');
    avatar.className = 'avatar avatar-' + (message.name.codePointAt(0) % 4);
    avatar.textContent = message.initials;
    avatar.setAttribute('aria-hidden', 'true');
    const group = document.createElement('div');
    group.className = 'bubble-group';
    const sender = document.createElement('div');
    sender.className = 'sender';
    sender.textContent = message.name;
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = message.text;
    group.append(sender, bubble);
    item.append(avatar, group);
    $('#chat-log').append(item);
    $('#chat-body').scrollTop = $('#chat-body').scrollHeight;
    $('#chat-progress').style.width = (chatIndex / messages.length * 100) + '%';
    nextMessage();
  }, chatIndex === 0 ? 600 : Math.min(2800, 1300 + messages[chatIndex - 1].text.length * 28));
}
$('#replay-chat').onclick = startChat;
$('#pause-chat').onclick = () => {
  paused = !paused;
  $('#pause-chat').textContent = paused ? config.chat.resumeIcon : config.chat.pauseIcon;
  $('#pause-chat').setAttribute('aria-label', paused ? config.chat.resumeLabel : config.chat.pauseLabel);
  $('#chat-status').textContent = paused ? config.chat.paused : config.chat.playing;
  if (paused) { clearTimeout(chatTimer); $('#typing').hidden = true; }
  else nextMessage();
};
const taunts = config.rsvp.taunts;
const zone = $('#choice-zone'), no = $('#no');
function dodge(event) {
  if (event) event.preventDefault();
  dodges++;
  $('#nudge').textContent = taunts[Math.min(dodges - 1, taunts.length - 1)];
  const scale = [.92,.84,.77,.70][Math.min(dodges - 1,3)];
  const area = zone.getBoundingClientRect(), current = no.getBoundingClientRect(), yes = $('#yes').getBoundingClientRect();
  const width = no.offsetWidth * scale, height = no.offsetHeight * scale;
  const maxX = Math.max(0, area.width - width - 2), maxY = Math.max(0, area.height - height - 2);
  const candidates = [];
  for (let i = 0; i < 80; i++) {
    const x = Math.random() * maxX, y = Math.random() * maxY;
    const overlap = x < yes.right-area.left+14 && x+width > yes.left-area.left-14 && y < yes.bottom-area.top+14 && y+height > yes.top-area.top-14;
    if (!overlap) {
      const pointerX = event && event.clientX ? event.clientX : current.left + current.width / 2;
      const pointerY = event && event.clientY ? event.clientY : current.top + current.height / 2;
      const distance = Math.hypot(area.left+x+width/2-pointerX, area.top+y+height/2-pointerY);
      candidates.push({x,y,distance});
    }
  }
  candidates.sort((a,b) => b.distance - a.distance);
  const target = candidates[0] || {x:maxX,y:8};
  no.style.right = 'auto';
  no.style.left = target.x + 'px'; no.style.top = target.y + 'px';
  no.style.transform = `scale(${scale})`;
}
new ResizeObserver(() => {
  if (!dodges || !zone.clientWidth) return;
  const scale = [.92,.84,.77,.70][Math.min(dodges - 1,3)];
  no.style.left = Math.max(0, Math.min(parseFloat(no.style.left)||0, zone.clientWidth-no.offsetWidth*scale-2)) + 'px';
  no.style.top = Math.max(0, Math.min(parseFloat(no.style.top)||0, zone.clientHeight-no.offsetHeight*scale-2)) + 'px';
}).observe(zone);
no.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') dodge(event); });
no.addEventListener('pointerdown', event => { if (event.pointerType !== 'mouse') dodge(event); });
no.addEventListener('click', event => { if (event.detail === 0) dodge(event); });
$('#yes').onclick = () => { show('success'); celebrate(); };
function celebrate() {
  if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  const layer = $('#confetti-layer'); layer.replaceChildren();
  const colors = ['#cc1927','#4f9e43','#235438','#ffffff','#b8d791'];
  for (let i = 0; i < 85; i++) {
    const bit = document.createElement('span'); bit.className = 'confetti';
    bit.style.left = Math.random()*100 + '%'; bit.style.background = colors[i%colors.length];
    bit.style.animationDelay = Math.random()*.75 + 's'; bit.style.animationDuration = 2+Math.random()*2 + 's';
    bit.style.setProperty('--drift',(Math.random()-.5)*260 + 'px'); layer.append(bit);
  }
  setTimeout(() => layer.replaceChildren(), 5000);
}

}
boot();
