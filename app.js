const navItems = document.querySelectorAll('.nav-item');
const views = document.querySelectorAll('.view');
const toast = document.querySelector('#toast');

function showView(viewId) {
  views.forEach((view) => view.classList.toggle('active', view.id === viewId));
  navItems.forEach((item) => item.classList.toggle('active', item.dataset.view === viewId));
  window.location.hash = viewId;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.addEventListener('click', (event) => {
  const viewTrigger = event.target.closest('[data-view]');
  if (viewTrigger) showView(viewTrigger.dataset.view);
});

navItems.forEach((item) => item.addEventListener('click', () => showView(item.dataset.view)));

const quotes = [
  ['Your voice is data. Your rest is resistance. Your future is not a negotiation.', 'Tricia Hersey'],
  ['There is no force more powerful than a woman determined to rise.', 'Bosa Sebele'],
  ['We cannot all succeed when half of us are held back.', 'Malala Yousafzai'],
  ['The most common way people give up their power is by thinking they do not have any.', 'Alice Walker']
];
let quoteIndex = 0;
document.querySelector('#refresh-quote').addEventListener('click', () => {
  quoteIndex = (quoteIndex + 1) % quotes.length;
  document.querySelector('#inspiration-text').textContent = quotes[quoteIndex][0];
  document.querySelector('#inspiration-credit').textContent = `— ${quotes[quoteIndex][1]}`;
});

const issueModal = document.querySelector('#issue-modal');
document.querySelector('#open-issue').addEventListener('click', () => issueModal.classList.add('open'));
document.querySelector('.modal-close').addEventListener('click', () => issueModal.classList.remove('open'));
issueModal.addEventListener('click', (event) => { if (event.target === issueModal) issueModal.classList.remove('open'); });
document.querySelector('#submit-issue').addEventListener('click', () => {
  const input = document.querySelector('#issue-input');
  if (!input.value.trim()) { input.focus(); return; }
  issueModal.classList.remove('open');
  input.value = '';
  showToast('Added to your atlas. Thank you for naming it.');
});

document.querySelectorAll('.answer-option').forEach((answer) => answer.addEventListener('click', () => {
  document.querySelectorAll('.answer-option').forEach((option) => option.classList.remove('selected'));
  answer.classList.add('selected');
  const next = document.querySelector('#next-question');
  next.classList.add('ready');
  next.textContent = 'Continue ->';
}));
document.querySelector('#next-question').addEventListener('click', () => {
  if (!document.querySelector('.answer-option.selected')) return;
  document.querySelector('.quiz-card h2').textContent = 'What would make tomorrow feel 10% more sustainable?';
  document.querySelector('.question-note').textContent = 'You can choose more than one answer in the next step.';
  document.querySelector('.quiz-progress span').style.width = '50%';
  document.querySelector('.quiz-card .eyebrow').textContent = 'Question 2 of 4';
  document.querySelector('#next-question').textContent = 'Save and continue ->';
  document.querySelectorAll('.answer-option')[0].innerHTML = '<span>01</span>A clear priority list';
  document.querySelectorAll('.answer-option')[1].innerHTML = '<span>02</span>Flexible working hours';
  document.querySelectorAll('.answer-option')[2].innerHTML = '<span>03</span>More recognition';
  document.querySelectorAll('.answer-option')[3].innerHTML = '<span>04</span>A trusted person to talk to';
  document.querySelectorAll('.answer-option').forEach((option) => option.classList.remove('selected'));
  document.querySelector('#next-question').classList.remove('ready');
});

document.querySelectorAll('.connect-button').forEach((button) => button.addEventListener('click', () => {
  button.textContent = button.textContent === 'Connect' ? 'Requested' : 'Connect';
  button.classList.toggle('connected');
  showToast(button.textContent === 'Requested' ? 'Connection request sent.' : 'Connection request withdrawn.');
}));

document.querySelector('#new-post').addEventListener('click', () => {
  const copy = window.prompt('What would you like to share with the community?');
  if (!copy || !copy.trim()) return;
  const post = document.createElement('article');
  post.className = 'post-card';
  post.innerHTML = `<div class="post-author"><span class="avatar">JM</span><div><strong>Jordan M.</strong><small>Just now</small></div><button class="more-button">...</button></div><p class="post-copy"></p><div class="post-actions"><button>♡ 0</button><button>□ Reply</button><button>↗ Share</button></div>`;
  post.querySelector('.post-copy').textContent = copy;
  document.querySelector('.feed').insertBefore(post, document.querySelector('.feed').children[1]);
  showToast('Your post is live.');
});

const gameFeedback = document.querySelector('#game-feedback');
const energyValues = document.querySelectorAll('.energy-value');
const gameResponses = { ask: ['You ask for context. It is awkward, then useful. + clarity.', 5], care: ['The slip is signed. Your morning gets smaller. + care.', 8], boundary: ['You take the time. The meeting can wait. + energy.', -5] };
document.querySelectorAll('[data-choice]').forEach((choice) => choice.addEventListener('click', () => {
  const [message, cost] = gameResponses[choice.dataset.choice];
  const current = Number(energyValues[0].textContent);
  const next = Math.max(0, Math.min(100, current - cost));
  energyValues.forEach((value) => value.textContent = next);
  document.querySelector('.pink-bar').style.width = `${next}%`;
  gameFeedback.textContent = message;
}));
document.querySelector('#reset-game').addEventListener('click', () => {
  energyValues.forEach((value) => value.textContent = '72');
  document.querySelector('.pink-bar').style.width = '72%';
  gameFeedback.textContent = 'Choose an action to continue the day.';
});

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 2600);
}

const requestedView = window.location.hash.slice(1);
if (requestedView && document.querySelector(`#${requestedView}`)) showView(requestedView);