const LESSONS = {
  cohortStartDate: "2026-02-23",
  days: [
    {
      day: 1,
      skill: "Structured Prompting",
      objective: "Direct AI intentionally with explicit structure.",
      concept:
        "Define role, context, objective, constraints, and output format to reduce ambiguity and improve reliability.",
      strong:
        "You are: A CPG growth strategist.\nContext: Mission targets Gen Z grocery shoppers.\nObjective: 3 growth opportunities in 12 months.\nConstraints: retail + digital, budget < $2M, measurable sales lift.\nOutput: bullets, max 300 words.",
      challengeFields: [
        "Original vague prompt",
        "Structured prompt",
        "Result",
        "What changed in output quality"
      ]
    },
    {
      day: 2,
      skill: "Task Decomposition",
      objective: "Break complex work into systems and steps.",
      concept:
        "Decompose into inputs, sequence, outputs, and ownership. AI handles repeatable components; humans keep judgment calls.",
      strong:
        "Task: Build an AI strategy deck.\nBreakdown: 1) extract current usage, 2) map friction, 3) identify opportunities, 4) estimate ROI, 5) outline proposal.",
      challengeFields: ["Project name", "Step breakdown", "AI opportunities per step"]
    },
    {
      day: 3,
      skill: "Critique Loop",
      objective: "Improve quality through deliberate iteration.",
      concept:
        "Use critique prompts to stress-test assumptions, find weak logic, and produce a stronger second draft.",
      strong:
        "Critique this output as a senior strategist. Identify weak logic, missing assumptions, and risk factors. Then improve it.",
      challengeFields: ["Original version", "Critique prompt", "Improved version", "What changed?"]
    },
    {
      day: 4,
      skill: "Reusable Templates",
      objective: "Turn frequent prompts into reusable assets.",
      concept:
        "If a prompt is reused, template it. Reuse increases speed, consistency, and delegation across teams.",
      strong:
        "Reusable format: role, context block, objective, constraints, output format.",
      challengeFields: ["Template name", "Intended use", "Example output"]
    },
    {
      day: 5,
      skill: "Executive Artifacts",
      objective: "Convert raw notes into leadership-ready outputs.",
      concept:
        "AI can synthesize notes into concise, action-oriented summaries with implications and next steps.",
      strong:
        "Transform this transcript into a one-page executive summary: key insights, risks, implications, next actions.",
      challengeFields: ["Raw input", "Final artifact", "Decision clarity gained"]
    },
    {
      day: 6,
      skill: "AI Upgrade Memo",
      objective: "Translate capability into initiative proposals.",
      concept:
        "Operators propose systems: workflow, friction, intervention, impact, required tools, risk, and pilot scope.",
      strong:
        "Title: AI Upgrade Opportunity. Include workflow, friction, solution, impact, tools, risk, and pilot.",
      challengeFields: [
        "Current workflow",
        "Friction",
        "Proposed AI solution",
        "Estimated impact",
        "Tools required",
        "Risk level",
        "Suggested pilot"
      ]
    },
    {
      day: 7,
      skill: "Reflection",
      objective: "Assess leverage gains and define next automation.",
      concept:
        "Reflection hardens behavior change and clarifies where automation should happen next.",
      strong:
        "Capture score delta, behavior shift, strongest insight, and one automation to build.",
      challengeFields: [
        "Leverage score improved from __ to __",
        "Biggest behavior shift",
        "Most powerful insight",
        "One automation I want to build"
      ]
    },
    {
      day: 8,
      skill: "Knowing When NOT to Use AI",
      objective:
        "Build judgment. Know when AI helps, when it hurts, and when it creates risk.",
      concept:
        "Operators are measured by deployment quality, not usage volume. Before using AI ask: 1) What's the cost if wrong? 2) Can I verify independently? 3) Does this require trust, relationship, or lived judgment? Risk zones include high-stakes facts, confidential data, deeply personal communication, novel decisions, and skill atrophy. Selective use builds credibility.",
      strong:
        "Use AI to draft a sensitive message, then rewrite in your own voice, review with stakeholders, and own every word before sending.",
      challengeFields: [
        "One task where AI was the right call and why",
        "One task where you should have done it yourself",
        "One task where you're unsure and the risk factors"
      ]
    },
    {
      day: 9,
      skill: "Context Window Management",
      objective:
        "Stop overfeeding and underfeeding AI. Prepare inputs like an operator.",
      concept:
        "Both low-context prompting and context-dumping fail. Manage the context window with four techniques: summarize before analyze, chunk long documents, front-load critical instruction, and edit out irrelevant context.",
      strong:
        "Step 1: Summarize a long brief in under 200 words. Step 2: Use that summary to generate targeted growth opportunities.",
      challengeFields: [
        "Original one-shot approach you would have taken",
        "Chunked or summarized approach you used instead",
        "Quality difference in the output",
        "Confidence comparison before vs after"
      ]
    }
  ]
};

const STORAGE = "operator-sprint-v3";

const el = {
  dayBadge: document.getElementById("dayBadge"),
  title: document.getElementById("title"),
  objective: document.getElementById("objective"),
  stats: document.getElementById("stats"),
  checkin: document.getElementById("checkin"),
  lesson: document.getElementById("lesson"),
  lockedNote: document.getElementById("lockedNote"),
  challenge: document.getElementById("challenge"),
  challengeLock: document.getElementById("challengeLock"),
  card: document.getElementById("card"),
  best: document.getElementById("best"),
  buildCard: document.getElementById("buildCard"),
  copyCard: document.getElementById("copyCard"),
  resetBtn: document.getElementById("resetBtn"),
  stepCheck: document.getElementById("stepCheck"),
  stepLesson: document.getElementById("stepLesson"),
  stepChallenge: document.getElementById("stepChallenge"),
  stepShare: document.getElementById("stepShare")
};

let state = load();
let cardText = "";

boot();

function boot() {
  const day = getDay();
  const lesson = LESSONS.days.find((d) => d.day === day) || LESSONS.days[0];

  renderHeader(day, lesson);
  renderStats(day);
  wireEvents(day, lesson);

  hydrateCheckin(day);
  renderLesson(day, lesson);
  renderChallenge(day, lesson);
  renderStepRail(day);
}

function wireEvents(day, lesson) {
  el.checkin.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const data = obj(new FormData(el.checkin));
    state.checkins[String(day)] = {
      use: data.use,
      score: Number(data.score),
      platform: data.platform,
      upgrade: data.upgrade,
      at: new Date().toISOString()
    };
    save();
    renderLesson(day, lesson);
    renderChallenge(day, lesson);
    renderStats(day);
    renderStepRail(day);
  });

  el.challenge.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const data = obj(new FormData(el.challenge));
    state.submissions[String(day)] = { data, at: new Date().toISOString() };
    computeStreak(day);
    save();
    renderChallenge(day, lesson);
    renderStats(day);
    renderStepRail(day);
  });

  el.buildCard.addEventListener("click", () => {
    const key = String(day);
    const c = state.checkins[key];
    const s = state.submissions[key];
    if (!c || !s) return;
    const best = el.best.value.trim();
    cardText = [
      `Day ${day} completed ✅`,
      `Skill: ${lesson.skill}`,
      `Leverage score: ${c.score}/10`,
      `Preferred platform: ${c.platform}`,
      `What I upgraded today: ${c.upgrade}`,
      `Current streak: ${state.streak} day${state.streak === 1 ? "" : "s"}`,
      best ? `Best prompt today: ${best}` : null
    ]
      .filter(Boolean)
      .join("\n");

    el.card.innerHTML = cardText.split("\n").map((line) => `<p>${esc(line)}</p>`).join("");
    el.card.classList.remove("hidden");
    el.copyCard.disabled = false;
    el.stepShare.classList.add("done");
  });

  el.copyCard.addEventListener("click", async () => {
    if (!cardText) return;
    try {
      await navigator.clipboard.writeText(cardText);
      alert("Copied. Paste in Teams.");
    } catch {
      alert("Clipboard blocked. Copy manually from the card.");
    }
  });

  el.resetBtn.addEventListener("click", () => {
    if (!confirm("Clear local progress for this browser?")) return;
    localStorage.removeItem(STORAGE);
    location.reload();
  });
}

function renderHeader(day, lesson) {
  el.dayBadge.textContent = `Day ${day} of ${LESSONS.days.length}`;
  el.title.textContent = `Day ${day}: ${lesson.skill}`;
  el.objective.textContent = lesson.objective;
}

function renderStats(day) {
  const key = String(day);
  const checked = Boolean(state.checkins[key]);
  const submitted = Boolean(state.submissions[key]);
  const pills = [
    `Cohort day: ${day}`,
    `Streak: ${state.streak}`,
    `Best streak: ${state.bestStreak}`,
    checked ? "Check-in complete" : "Check-in pending",
    submitted ? "Challenge submitted" : "Challenge pending"
  ];
  el.stats.innerHTML = pills.map((p) => `<span class=\"pill\">${esc(p)}</span>`).join("");
}

function renderLesson(day, lesson) {
  const unlocked = Boolean(state.checkins[String(day)]);
  if (!unlocked) {
    el.lesson.classList.add("hidden");
    el.lockedNote.classList.remove("hidden");
    return;
  }

  el.lockedNote.classList.add("hidden");
  el.lesson.classList.remove("hidden");
  el.lesson.innerHTML = `
    <p>${esc(lesson.concept)}</p>
    <pre>${esc(lesson.strong)}</pre>
  `;
}

function renderChallenge(day, lesson) {
  const checked = Boolean(state.checkins[String(day)]);
  el.challenge.innerHTML = "";

  if (!checked) {
    el.challenge.classList.add("hidden");
    el.challengeLock.classList.remove("hidden");
    el.buildCard.disabled = true;
    return;
  }

  el.challenge.classList.remove("hidden");
  el.challengeLock.classList.add("hidden");

  lesson.challengeFields.forEach((label) => {
    const wrap = document.createElement("label");
    wrap.textContent = label;
    const area = document.createElement("textarea");
    area.name = slug(label);
    area.rows = 3;
    area.required = true;
    wrap.appendChild(area);
    el.challenge.appendChild(wrap);
  });

  const submit = document.createElement("button");
  submit.type = "submit";
  const has = Boolean(state.submissions[String(day)]);
  submit.textContent = has ? "Challenge Saved" : "Submit Challenge";
  el.challenge.appendChild(submit);

  const prior = state.submissions[String(day)]?.data || {};
  Object.entries(prior).forEach(([k, v]) => {
    const field = el.challenge.elements.namedItem(k);
    if (field) field.value = v;
  });

  if (has) {
    [...el.challenge.elements].forEach((f) => (f.disabled = true));
  }

  el.buildCard.disabled = !has;
}

function renderStepRail(day) {
  const key = String(day);
  const checked = Boolean(state.checkins[key]);
  const challenge = Boolean(state.submissions[key]);

  el.stepCheck.classList.toggle("done", checked);
  el.stepLesson.classList.toggle("done", checked);
  el.stepChallenge.classList.toggle("done", challenge);
}

function computeStreak(day) {
  const key = String(day);
  if (state.completedDays[key]) return;

  const prevDone = Boolean(state.submissions[String(day - 1)]);
  state.streak = prevDone ? state.streak + 1 : 1;
  state.bestStreak = Math.max(state.bestStreak, state.streak);
  state.completedDays[key] = true;
}

function hydrateCheckin(day) {
  const data = state.checkins[String(day)];
  if (!data) return;

  setVal(el.checkin, "use", data.use);
  setVal(el.checkin, "score", String(data.score));
  setVal(el.checkin, "platform", data.platform || "");
  setVal(el.checkin, "upgrade", data.upgrade);

  [...el.checkin.elements].forEach((f) => (f.disabled = true));
  const submit = el.checkin.querySelector("button[type='submit']");
  if (submit) submit.textContent = "Check-in Complete";
}

function getDay() {
  const start = new Date(`${LESSONS.cohortStartDate}T00:00:00`);
  const now = new Date();
  start.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const offset = Math.floor((now - start) / 86400000) + 1;
  return Math.max(1, Math.min(offset, LESSONS.days.length));
}

function load() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE) || "{}");
    return {
      checkins: parsed.checkins || {},
      submissions: parsed.submissions || {},
      completedDays: parsed.completedDays || {},
      streak: Number(parsed.streak || 0),
      bestStreak: Number(parsed.bestStreak || 0)
    };
  } catch {
    return { checkins: {}, submissions: {}, completedDays: {}, streak: 0, bestStreak: 0 };
  }
}

function save() {
  localStorage.setItem(STORAGE, JSON.stringify(state));
}

function obj(fd) {
  return Object.fromEntries(fd.entries());
}

function setVal(form, name, val) {
  const field = form.elements.namedItem(name);
  if (field) field.value = val;
}

function slug(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
