const DATA = window.__DATA_TODOS__;
const STAGES = DATA.stages;
const BUCKETS = STAGES.flatMap((s) => s.buckets);
const BUCKET_BY_SLUG = Object.fromEntries(BUCKETS.map((b) => [b.slug, b]));
const STAGE_BY_SLUG = Object.fromEntries(STAGES.map((s) => [s.slug, s]));
const STAGE_BY_BUCKET_SLUG = Object.fromEntries(
  STAGES.flatMap((s) => s.buckets.map((b) => [b.slug, s]))
);
const TASK_BY_ID = Object.fromEntries(BUCKETS.flatMap((b) => b.tasks.map((t) => [t.id, t])));
const TAB_COLORS = ["var(--tab-1)", "var(--tab-2)", "var(--tab-3)", "var(--tab-4)", "var(--tab-5)"];
const TOTAL_TASKS = BUCKETS.reduce((n, b) => n + b.count, 0);

function el(html) {
  const div = document.createElement("div");
  div.innerHTML = html.trim();
  return div.firstElementChild;
}

function renderHome() {
  const stageSections = STAGES.map((s, si) => {
    const bucketCards = s.buckets.map((b, bi) => `
      <a class="bucket-card" href="#/bucket/${b.slug}" style="--tab-color:${TAB_COLORS[(si + bi) % TAB_COLORS.length]}">
        <div class="bc-name">${b.name}</div>
        <div class="bc-blurb">${b.blurb}</div>
        <div class="bc-count"><b>${b.count}</b> task${b.count === 1 ? "" : "s"}</div>
      </a>
    `).join("");

    return `
      <section class="stage-section">
        <div class="stage-head">
          <h2>${s.name}</h2>
          <p>${s.blurb}</p>
        </div>
        <div class="bucket-grid">${bucketCards}</div>
      </section>
    `;
  }).join("");

  return el(`
    <div class="view">
      <div class="intro">
        <h1>Marin Lab Data ToDos and HowDos</h1>
        <p>A field guide to open data work across the Marin Lab, laid out along the path data
           actually takes: sourced and cleaned, mixed for pretraining, then adapted again for
           post-training/RL and evaluation. Every task comes from a real, currently-open ask —
           a public GitHub issue/PR or paraphrased internal Discord discussion. Click a bucket
           to see its tasks; click a task for a short note on how to approach it.</p>
        <div class="stat-line">${TOTAL_TASKS} open tasks &middot; ${BUCKETS.length} buckets &middot; ${STAGES.length} stages</div>
      </div>
      ${stageSections}
    </div>
  `);
}

function renderBucket(slug) {
  const b = BUCKET_BY_SLUG[slug];
  if (!b) return renderNotFound();
  const stage = STAGE_BY_BUCKET_SLUG[slug];

  const rows = b.tasks.map((t) => `
    <a class="task-row" href="#/task/${t.id}">
      <div class="tr-top">
        <span class="badge ${t.source}">${t.source === "github" ? "#" + t.ref : "discord"}</span>
        ${t.source === "discord" ? `<span>${t.ref}</span>` : ""}
      </div>
      <div class="tr-title">${t.title}</div>
      <div class="tr-summary">${t.summary}</div>
    </a>
  `).join("");

  return el(`
    <div class="view">
      <a class="back-link" href="#/">&larr; all buckets</a>
      <div class="bucket-header">
        ${stage ? `<div class="stage-crumb">${stage.name}</div>` : ""}
        <h1>${b.name}</h1>
        <p>${b.blurb}</p>
      </div>
      <div class="task-list">${rows}</div>
    </div>
  `);
}

function renderTask(id) {
  const t = TASK_BY_ID[id];
  if (!t) return renderNotFound();
  const b = BUCKET_BY_SLUG[t.bucket];

  const sourceLine = t.source === "github"
    ? `<a class="source-link" href="${t.url}" target="_blank" rel="noopener">View on GitHub &rarr; #${t.ref}</a>`
    : `<div class="source-link">From internal Discord &middot; #${t.ref} &mdash; paraphrased, no message link retained</div>`;

  return el(`
    <div class="view">
      <a class="back-link" href="#/bucket/${t.bucket}">&larr; ${b ? b.name : "back"}</a>
      <div class="task-detail">
        <div class="td-top">
          <span class="badge ${t.source}">${t.source === "github" ? "#" + t.ref : "discord"}</span>
        </div>
        <h1>${t.title}</h1>

        <div class="detail-section">
          <h2>Context</h2>
          <p>${t.summary}</p>
        </div>

        <div class="detail-section">
          <h2>How to tackle it</h2>
          <div class="howto-box"><p>${t.howto}</p></div>
        </div>

        ${sourceLine}
      </div>
    </div>
  `);
}

function renderNotFound() {
  return el(`
    <div class="view">
      <a class="back-link" href="#/">&larr; all buckets</a>
      <h1>Not found</h1>
    </div>
  `);
}

function route() {
  const hash = location.hash.replace(/^#/, "") || "/";
  const app = document.getElementById("app");
  app.innerHTML = "";

  const bucketMatch = hash.match(/^\/bucket\/([^/]+)$/);
  const taskMatch = hash.match(/^\/task\/([^/]+)$/);

  let node;
  if (bucketMatch) node = renderBucket(decodeURIComponent(bucketMatch[1]));
  else if (taskMatch) node = renderTask(decodeURIComponent(taskMatch[1]));
  else node = renderHome();

  app.appendChild(node);
  window.scrollTo({ top: 0, behavior: "instant" });
}

window.addEventListener("hashchange", route);
document.addEventListener("DOMContentLoaded", route);
