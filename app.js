const navItems = document.querySelectorAll('.nav-item');
const views = document.querySelectorAll('.view');
const toast = document.querySelector('#toast');
let atlasMap;

function showView(viewId) {
  views.forEach((view) => view.classList.toggle('active', view.id === viewId));
  navItems.forEach((item) => item.classList.toggle('active', item.dataset.view === viewId));
  window.location.hash = viewId;
  if (viewId === 'atlas') {
    if (!atlasMap) initializeAtlasMap();
    window.setTimeout(() => atlasMap?.invalidateSize(), 0);
  }
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

const quizQuestions = [
  ['How did you feel when you spoke up at work today?', 'There is no right answer. Your private responses help us tailor support.', ['Heard and respected', 'Interrupted or talked over', 'Dismissed or minimized', 'I did not feel safe to speak']],
  ['What would make tomorrow feel 10% more sustainable?', 'You can choose the answer that feels most useful right now.', ['A clear priority list', 'Flexible working hours', 'More recognition', 'A trusted person to talk to']],
  ['What kind of support would help you feel less alone?', 'Small, practical support counts too.', ['A peer to check in with', 'A manager who listens', 'A legal resource', 'Time to recover']],
  ['What is one next step you want to carry forward?', 'Choose a step that feels possible, not perfect.', ['Name what you need', 'Ask for backup', 'Protect my time', 'Celebrate a small win']]
];
let quizStep = 0;
const quizAnswers = [];
const renderQuiz = () => {
  const [question, note, answers] = quizQuestions[quizStep];
  document.querySelector('.quiz-card h2').textContent = question;
  document.querySelector('.question-note').textContent = note;
  document.querySelector('.quiz-card .eyebrow').textContent = `Question ${quizStep + 1} of ${quizQuestions.length}`;
  document.querySelector('.step-count').textContent = `${String(quizStep + 1).padStart(2, '0')} / 04`;
  document.querySelector('.quiz-progress span').style.width = `${((quizStep + 1) / quizQuestions.length) * 100}%`;
  document.querySelectorAll('.answer-option').forEach((option, index) => {
    option.innerHTML = `<span>0${index + 1}</span>${answers[index]}`;
    option.classList.remove('selected');
  });
  const next = document.querySelector('#next-question');
  next.classList.remove('ready');
  next.textContent = quizStep === quizQuestions.length - 1 ? 'Finish check-in' : 'Choose an answer';
};
document.querySelector('.answer-grid').addEventListener('click', (event) => {
  const answer = event.target.closest('.answer-option');
  if (!answer) return;
  document.querySelectorAll('.answer-option').forEach((option) => option.classList.remove('selected'));
  answer.classList.add('selected');
  quizAnswers[quizStep] = answer.textContent.trim();
  document.querySelector('#next-question').classList.add('ready');
  document.querySelector('#next-question').textContent = quizStep === quizQuestions.length - 1 ? 'Finish check-in' : 'Continue ->';
});
document.querySelector('#next-question').addEventListener('click', () => {
  if (!document.querySelector('.answer-option.selected')) return;
  if (quizStep === quizQuestions.length - 1) {
    document.querySelector('.quiz-card h2').textContent = 'Your check-in is complete.';
    document.querySelector('.question-note').textContent = 'You named what matters today. Come back whenever you need a reset.';
    document.querySelector('.quiz-card .eyebrow').textContent = 'Check-in complete';
    document.querySelector('.answer-grid').style.display = 'none';
    document.querySelector('.quiz-actions').style.display = 'none';
    const result = document.createElement('div');
    result.className = 'checkin-result';
    const recommendation = quizAnswers[3]?.includes('Protect') || quizAnswers[1]?.includes('Flexible')
      ? 'Protect 20 minutes for yourself before taking on anything else.'
      : quizAnswers[3]?.includes('Ask') || quizAnswers[2]?.includes('manager')
        ? 'Ask one trusted person for backup today.'
        : 'Write down one thing you need, then name it plainly to someone who can help.';
    result.innerHTML = `<p class="eyebrow">Your next step</p><h3>Today, you should...</h3><p>${recommendation}</p><button class="outline-button" id="browse-recommendation">Find a helpful resource -></button>`;
    document.querySelector('.quiz-card').appendChild(result);
    document.querySelector('#browse-recommendation').addEventListener('click', () => showView('resources'));
    const restart = document.createElement('button');
    restart.className = 'text-button restart-checkin';
    restart.textContent = 'Restart check-in';
    result.appendChild(restart);
    restart.addEventListener('click', () => {
      quizStep = 0;
      quizAnswers.length = 0;
      result.remove();
      document.querySelector('.answer-grid').style.display = '';
      document.querySelector('.quiz-actions').style.display = '';
      renderQuiz();
    });
    return;
  }
  quizStep += 1;
  renderQuiz();
});

const resourceCatalog = {
  all: [
    ['LEGAL GUIDE', 'Pay transparency, decoded', 'What employers can ask, what you can ask back, and where to report a violation.', 'Ontario · 8 min read', 'Open guide ->', 'pink'],
    ['TOOLKIT', 'The boundary script library', 'Words for asking for credit, pushing back on scope creep, and protecting your time.', 'Any workplace · 12 scripts', 'View scripts ->', 'purple'],
    ['ORGANIZATION', 'UN Women', 'Global data, policy work, and ways to support gender equality in your community.', 'Global · unwomen.org', 'Visit site ->', 'yellow'],
    ['SUPPORT', 'Need to talk to someone?', 'Find confidential, local support for workplace harassment and safety planning.', '24/7 options available', 'Find support ->', 'coral']
  ],
  rights: [
    ['LEGAL GUIDE', 'Pay transparency, decoded', 'Understand salary bands, questions you can ask, and where to report a violation.', 'Ontario · 8 min read', 'Open guide ->', 'pink'],
    ['LEGAL GUIDE', 'Documenting workplace harm', 'A plain-language checklist for keeping a safe, useful record of incidents.', 'Any workplace · 6 min read', 'Open checklist ->', 'lavender']
  ],
  money: [
    ['TOOLKIT', 'The boundary script library', 'Words for asking for credit, pushing back on scope creep, and protecting your time.', 'Any workplace · 12 scripts', 'View scripts ->', 'purple'],
    ['TOOLKIT', 'The raise conversation planner', 'Prepare your evidence, target number, and next sentence before you ask.', 'Any workplace · 10 min', 'Open planner ->', 'yellow']
  ],
  wellbeing: [
    ['SUPPORT', 'A five-minute reset', 'A short grounding practice for when your body is carrying the whole day.', 'Private · 5 minutes', 'Start reset ->', 'coral'],
    ['SUPPORT', 'Find a trusted listener', 'Options for finding confidential support when work or care feels too heavy.', 'Local and confidential', 'Find support ->', 'pink']
  ]
};

function renderResources(filter) {
  const grid = document.querySelector('.resource-grid');
  grid.innerHTML = resourceCatalog[filter].map(([type, title, description, meta, action, color]) =>
    `<article class="resource-card ${color}-card"><span class="resource-type ${color}-text">${type}</span><h2>${title}</h2><p>${description}</p><div><span class="resource-meta">${meta}</span><button class="text-button">${action}</button></div></article>`
  ).join('');
}

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

document.querySelectorAll('.feed-tabs button').forEach((tab, tabIndex) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.feed-tabs button').forEach((item) => item.classList.remove('active'));
    tab.classList.add('active');
    const posts = document.querySelectorAll('.feed .post-card');
    posts.forEach((post, postIndex) => {
      const visible = tabIndex === 0 || (tabIndex === 1 && postIndex === 1) || (tabIndex === 2 && postIndex === 0);
      post.hidden = !visible;
    });
  });
});

document.querySelectorAll('.resource-tabs button').forEach((tab, tabIndex) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.resource-tabs button').forEach((item) => item.classList.remove('active'));
    tab.classList.add('active');
    renderResources(['all', 'rights', 'money', 'wellbeing'][tabIndex]);
  });
});

const gameFeedback = document.querySelector('#game-feedback');
const energyValues = document.querySelectorAll('.energy-value');
const gameState = { step: 0, energy: 72, recognition: 48, care: 64 };
const gameSteps = [
  {
    time: 'Tuesday, 7:08 AM',
    chapter: 'Your morning',
    prompt: 'The meeting starts in 52 minutes.',
    description: 'Your daughter needs a permission slip. Your inbox has 14 new messages. You were not included in the pre-read.',
    question: 'What do you do?',
    choices: [
      ['ask', 'Ask your manager for the missing context', '+ clarity · - 5 energy', 'You ask for context. It is awkward, then useful.', -5, 6, 0],
      ['care', 'Handle the permission slip first', '+ care · - 8 energy', 'The slip is signed. Your morning gets smaller.', -8, 0, 8],
      ['boundary', 'Block 20 minutes for yourself', '+ energy · - 1 social capital', 'You protect the time. The meeting can wait.', 5, -2, 0]
    ]
  },
  {
    time: 'Tuesday, 12:26 PM',
    chapter: 'At work',
    prompt: 'A colleague repeats your idea in the meeting.',
    description: 'The room responds to them. Your contribution is still in the notes under someone else’s name.',
    question: 'How do you respond?',
    choices: [
      ['claim', 'Name your original contribution', '+ recognition · - 4 energy', 'You calmly add the missing context. Your name is attached to the work.', -4, 12, 0],
      ['follow', 'Follow up privately after the meeting', '+ safety · - 3 energy', 'You send a clear note and create a record.', -3, 6, 0],
      ['let-go', 'Let it go for today', '+ capacity · - 1 recognition', 'You conserve energy, but the pattern stays invisible.', 3, -5, 0]
    ]
  },
  {
    time: 'Tuesday, 6:14 PM',
    chapter: 'The handoff',
    prompt: 'The day ends, but the second shift is waiting.',
    description: 'Dinner, homework, and tomorrow’s logistics are all still yours to coordinate.',
    question: 'What support do you choose?',
    choices: [
      ['ask-help', 'Ask someone to share the load', '+ support · - 2 energy', 'The work is not yours alone. Someone else steps in.', -2, 4, -10],
      ['simplify', 'Choose the simpler version tonight', '+ energy · - 0 care', 'Good enough is enough for today.', 6, 0, -6],
      ['push', 'Push through everything yourself', '+ completed · - 12 energy', 'Everything gets done, but the cost lands on you.', -12, 0, 8]
    ]
  }
];

function updateGameStats() {
  energyValues.forEach((value) => { value.textContent = gameState.energy; });
  document.querySelector('.pink-bar').style.width = `${gameState.energy}%`;
  document.querySelector('.recognition-value').textContent = gameState.recognition;
  document.querySelector('.purple-bar').style.width = `${gameState.recognition}%`;
  document.querySelector('.care-value').textContent = gameState.care;
  document.querySelector('.yellow-bar').style.width = `${gameState.care}%`;
}

function renderGameStep() {
  const step = gameSteps[gameState.step];
  document.querySelector('#game-time').textContent = step.time;
  document.querySelector('#game-chapter').textContent = step.chapter;
  document.querySelector('#game-prompt').textContent = step.prompt;
  document.querySelector('#game-description').textContent = step.description;
  document.querySelector('#game-question').textContent = `${step.question} (${gameState.step + 1} of ${gameSteps.length})`;
  document.querySelector('#choice-buttons').innerHTML = step.choices.map(([id, label, note]) =>
    `<button data-choice="${id}">${label}<small>${note}</small></button>`
  ).join('');
  gameFeedback.textContent = 'Choose an action to continue the day.';
}

document.querySelector('#choice-buttons').addEventListener('click', (event) => {
  const choice = event.target.closest('[data-choice]');
  if (!choice) return;
  const selected = gameSteps[gameState.step].choices.find(([id]) => id === choice.dataset.choice);
  if (!selected) return;
  const [, , , message, energyChange, recognitionChange, careChange] = selected;
  gameState.energy = Math.max(0, Math.min(100, gameState.energy + energyChange));
  gameState.recognition = Math.max(0, Math.min(100, gameState.recognition + recognitionChange));
  gameState.care = Math.max(0, Math.min(100, gameState.care + careChange));
  updateGameStats();
  gameFeedback.textContent = message;
  if (gameState.step < gameSteps.length - 1) {
    gameState.step += 1;
    window.setTimeout(renderGameStep, 500);
  } else {
    document.querySelector('#game-reveal').textContent = 'You made it through the day. The outcome changes, but the invisible load should never have been yours alone.';
    gameFeedback.textContent = 'The day is complete. You can restart and try another path.';
  }
});
document.querySelector('#reset-game').addEventListener('click', () => {
  gameState.step = 0;
  gameState.energy = 72;
  gameState.recognition = 48;
  gameState.care = 64;
  updateGameStats();
  renderGameStep();
});

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 2600);
}

function initializeAtlasMap() {
  const mapElement = document.querySelector('#atlas-map');
  if (!mapElement || typeof L === 'undefined') return;

  atlasMap = L.map(mapElement, {
    worldCopyJump: true,
    minZoom: 2,
    zoomControl: true
  }).setView([20, 0], 2);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(atlasMap);

  const gridStyle = { color: '#7656a7', weight: 0.7, opacity: 0.32, interactive: false };
  for (let latitude = -80; latitude <= 80; latitude += 10) {
    L.polyline([[latitude, -180], [latitude, 180]], gridStyle).addTo(atlasMap);
  }
  for (let longitude = -180; longitude <= 180; longitude += 10) {
    L.polyline([[-85, longitude], [85, longitude]], gridStyle).addTo(atlasMap);
  }

  const issueLocations = [
    [43.6532, -79.3832, 'Toronto'],
    [40.7128, -74.006, 'New York'],
    [51.5072, -0.1276, 'London'],
    [-1.2921, 36.8219, 'Nairobi']
  ];
  const regionalIssues = {
    Toronto: [
      ['Most discussed', 'Promotion criteria change without notice', 'The goalposts move, and we are expected to smile through it.', '2.4 km away', '86 women relate'],
      ['Workplace culture', 'Invisible admin work falls to women', 'Meeting notes, celebrations, emotional labor. It adds up.', '4.1 km away', '51 women relate'],
      ['Education', 'Care responsibilities shape attendance', 'Flexible options should not be a penalty on your record.', '8.7 km away', '34 women relate']
    ],
    'New York': [
      ['Most discussed', 'Pay bands stay hidden until the offer', 'Information should not arrive only after you have committed.', '1.8 km away', '92 women relate'],
      ['Workplace culture', 'The loudest voice gets the credit', 'Your idea deserves a name, not just a nod.', '3.6 km away', '64 women relate'],
      ['Care access', 'Care schedules are treated as a personal problem', 'Flexible work is a workplace design choice.', '6.2 km away', '29 women relate']
    ],
    London: [
      ['Most discussed', 'Promotion pathways are unclear', 'A fair process should not depend on who knows the right person.', '2.1 km away', '74 women relate'],
      ['Workplace culture', 'Meeting times ignore care responsibilities', 'Inclusion has to show up on the calendar.', '3.9 km away', '48 women relate'],
      ['Money & work', 'Salary conversations happen behind closed doors', 'Transparency gives everyone a fairer starting point.', '7.4 km away', '31 women relate']
    ],
    Nairobi: [
      ['Most discussed', 'Leadership opportunities are shared informally', 'The next opportunity should not depend on being in the room.', '1.6 km away', '67 women relate'],
      ['Workplace culture', 'Women carry the coordination work', 'Invisible planning is still work, even when nobody names it.', '4.4 km away', '43 women relate'],
      ['Care access', 'Commute and care shape who can stay late', 'A sustainable workplace plans for real lives.', '8.1 km away', '26 women relate']
    ]
  };
  const updateDiscussion = (latitude, longitude) => {
    const nearest = issueLocations.reduce((best, location) => {
      const distance = Math.hypot(latitude - location[0], longitude - location[1]);
      return distance < best.distance ? { distance, location } : best;
    }, { distance: Infinity, location: issueLocations[0] }).location;
    const city = nearest[2];
    const list = document.querySelector('.issue-list');
    list.querySelector('.eyebrow').textContent = `Around your pin · ${city}`;
    list.querySelector('.result-count').textContent = `${regionalIssues[city].length * 8} issues`;
    list.querySelectorAll('.issue-card').forEach((card, index) => {
      const [tag, title, quote, distance, relates] = regionalIssues[city][index];
      card.querySelector('.tag').textContent = tag;
      card.querySelector('.issue-card-top span:last-child').textContent = distance;
      card.querySelector('h3').textContent = title;
      card.querySelector('p').textContent = `“${quote}”`;
      card.querySelector('.issue-footer span').textContent = `♡ ${relates}`;
    });
  };
  issueLocations.forEach(([latitude, longitude, name]) => {
    L.circleMarker([latitude, longitude], {
      radius: 7,
      color: '#c95279',
      fillColor: '#f5b5c6',
      fillOpacity: 0.95,
      weight: 2
    }).bindTooltip(name).addTo(atlasMap);
  });

  let userPin;
  const placePin = (event) => {
    if (userPin) userPin.remove();
    userPin = L.marker(event.latlng, { title: 'Your selected location' }).addTo(atlasMap);
    userPin.bindTooltip(
      `${event.latlng.lat.toFixed(4)}°, ${event.latlng.lng.toFixed(4)}°`,
      { permanent: true, direction: 'top', offset: [0, -8] }
    ).openTooltip();
    document.querySelector('.map-instructions span').textContent =
      `Pinned at ${event.latlng.lat.toFixed(4)}°, ${event.latlng.lng.toFixed(4)}°`;
    updateDiscussion(event.latlng.lat, event.latlng.lng);
    showToast('Your location pin was placed.');
  };
  atlasMap.on('click', placePin);
}

const requestedView = window.location.hash.slice(1);
if (requestedView && document.querySelector(`#${requestedView}`)) {
  showView(requestedView);
} else {
  initializeAtlasMap();
}