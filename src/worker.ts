const ORG = "the-oracle-keeps-the-human-human";
const GITHUB_API = "https://api.github.com";

async function fetchGitHub(path: string): Promise<any> {
  const res = await fetch(`${GITHUB_API}${path}`, {
    headers: { "User-Agent": "oracle-board/1.0", Accept: "application/vnd.github+json" },
  });
  return res.json();
}

function timeAgo(date: string): string {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function eventIcon(type: string): string {
  const icons: Record<string, string> = {
    PushEvent: "📦", PullRequestEvent: "🔀", IssuesEvent: "📋",
    IssueCommentEvent: "💬", CreateEvent: "🌱", DeleteEvent: "🗑️",
    ForkEvent: "🍴", WatchEvent: "⭐", MemberEvent: "👤",
    PublicEvent: "🌐", ReleaseEvent: "🚀",
  };
  return icons[type] || "📌";
}

function eventText(e: any): string {
  const repo = e.repo?.name?.replace(`${ORG}/`, "") || "";
  const actor = e.actor?.login || "unknown";
  const p = e.payload || {};
  switch (e.type) {
    case "PushEvent": return `<b>${actor}</b> pushed ${p.size || 1} commit(s) to <b>${repo}</b>`;
    case "PullRequestEvent": return `<b>${actor}</b> ${p.action} PR #${p.pull_request?.number} in <b>${repo}</b> — ${p.pull_request?.title || ""}`;
    case "IssuesEvent": return `<b>${actor}</b> ${p.action} issue #${p.issue?.number} in <b>${repo}</b> — ${p.issue?.title || ""}`;
    case "IssueCommentEvent": return `<b>${actor}</b> commented on #${p.issue?.number} in <b>${repo}</b>`;
    case "CreateEvent": return `<b>${actor}</b> created ${p.ref_type} ${p.ref || ""} in <b>${repo}</b>`;
    case "ForkEvent": return `<b>${actor}</b> forked <b>${repo}</b>`;
    case "WatchEvent": return `<b>${actor}</b> starred <b>${repo}</b>`;
    case "MemberEvent": return `<b>${actor}</b> ${p.action} member ${p.member?.login} in <b>${repo}</b>`;
    default: return `<b>${actor}</b> ${e.type?.replace("Event", "")} in <b>${repo}</b>`;
  }
}

function renderHTML(events: any[], issues: any[], repos: any[]): string {
  const eventRows = events.slice(0, 30).map(e =>
    `<div class="event">${eventIcon(e.type)} ${eventText(e)} <span class="time">${timeAgo(e.created_at)}</span></div>`
  ).join("");

  const issueRows = issues.slice(0, 15).map((i: any) =>
    `<div class="issue"><span class="label">${i.pull_request ? "🔀 PR" : "📋"}</span> <a href="${i.html_url}" target="_blank"><b>${i.title}</b></a> <span class="meta">${i.repository_url?.split("/").pop()} · ${i.user?.login} · ${timeAgo(i.created_at)}</span></div>`
  ).join("");

  const repoCards = repos.slice(0, 12).map((r: any) =>
    `<div class="repo-card"><a href="${r.html_url}" target="_blank"><b>${r.name}</b></a><p>${r.description || ""}</p><span class="meta">⭐ ${r.stargazers_count} · ${r.language || "—"} · ${timeAgo(r.updated_at)}</span></div>`
  ).join("");

  return `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Oracle Board 🏛️</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family: system-ui, -apple-system, sans-serif; background:#0d1117; color:#c9d1d9; min-height:100vh; }
header { background:linear-gradient(135deg, #161b22 0%, #1a1f2e 100%); padding:2rem; text-align:center; border-bottom:1px solid #30363d; }
header h1 { font-size:2rem; color:#f0f6fc; } header h1 span { color:#f7931a; }
header p { color:#8b949e; margin-top:0.5rem; }
.grid { display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; max-width:1200px; margin:2rem auto; padding:0 1rem; }
@media(max-width:768px) { .grid { grid-template-columns:1fr; } }
.panel { background:#161b22; border:1px solid #30363d; border-radius:8px; padding:1.5rem; }
.panel h2 { color:#f7931a; margin-bottom:1rem; font-size:1.1rem; }
.event { padding:0.5rem 0; border-bottom:1px solid #21262d; font-size:0.9rem; line-height:1.4; }
.event:last-child { border:none; }
.time { color:#8b949e; font-size:0.8rem; }
.issue { padding:0.5rem 0; border-bottom:1px solid #21262d; }
.issue a { color:#58a6ff; text-decoration:none; }
.issue a:hover { text-decoration:underline; }
.issue .label { font-size:0.8rem; }
.meta { color:#8b949e; font-size:0.8rem; }
.repos { display:grid; grid-template-columns:repeat(auto-fill, minmax(200px, 1fr)); gap:1rem; max-width:1200px; margin:0 auto 2rem; padding:0 1rem; }
.repo-card { background:#161b22; border:1px solid #30363d; border-radius:8px; padding:1rem; }
.repo-card a { color:#58a6ff; text-decoration:none; } .repo-card a:hover { text-decoration:underline; }
.repo-card p { color:#8b949e; font-size:0.85rem; margin:0.5rem 0; }
.section-title { color:#f0f6fc; font-size:1.2rem; max-width:1200px; margin:2rem auto 1rem; padding:0 1rem; }
footer { text-align:center; padding:2rem; color:#8b949e; font-size:0.8rem; border-top:1px solid #30363d; }
</style>
</head>
<body>
<header>
<h1>🏛️ <span>Oracle Board</span></h1>
<p>the-oracle-keeps-the-human-human — realtime activity</p>
</header>
<div class="grid">
<div class="panel"><h2>⚡ Activity Feed</h2>${eventRows || "<p>No events yet</p>"}</div>
<div class="panel"><h2>💬 Latest Issues & PRs</h2>${issueRows || "<p>No issues yet</p>"}</div>
</div>
<h3 class="section-title">📦 Repositories</h3>
<div class="repos">${repoCards}</div>
<footer>🤖 Oracle Board — powered by GitHub API + CF Workers · auto-refreshes every 60s<br>
<script>setTimeout(()=>location.reload(), 60000)</script>
</footer>
</body>
</html>`;
}

export default {
  async fetch(request: Request): Promise<Response> {
    const [events, issues, repos] = await Promise.all([
      fetchGitHub(`/orgs/${ORG}/events?per_page=30`),
      fetchGitHub(`/search/issues?q=org:${ORG}+sort:created&per_page=15`).then((r: any) => r.items || []),
      fetchGitHub(`/orgs/${ORG}/repos?sort=updated&per_page=12`),
    ]);

    return new Response(renderHTML(events, issues, repos), {
      headers: { "Content-Type": "text/html;charset=UTF-8", "Cache-Control": "s-maxage=30" },
    });
  },
};
