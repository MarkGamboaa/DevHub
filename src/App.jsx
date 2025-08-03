import { useEffect, useRef, useState } from "react";

const GITHUB_COLORS = {
  light: {
    bg: "bg-[hsl(0,0%,100%)]",
    text: "text-[hsl(210,10%,23%)]",
    muted: "text-[hsl(210,10%,40%)]",
    border: "border-[hsl(210,16%,88%)]",
    input: "bg-[hsl(210,16%,96%)]",
    primary: "text-[hsl(212,100%,45%)]",
    btn: "bg-[hsl(212,100%,45%)] hover:bg-[hsl(212,100%,40%)] text-white",
    card: "bg-[hsl(0,0%,100%)]",
  },
  dark: {
    bg: "bg-[#010409]",
    text: "text-[hsl(210,10%,88%)]",
    muted: "text-[hsl(210,10%,60%)]",
    border: "border-[hsl(222,14%,25%)]",
    input: "bg-[hsl(222,14%,20%)]",
    primary: "text-[hsl(212,100%,65%)]",
    btn: "bg-[hsl(212,100%,65%)] hover:bg-[hsl(212,100%,60%)] text-[hsl(222,14%,16%)]",
    card: "bg-[#0d1117]",
  },
};

function getTheme() {
  if (typeof window === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export default function App() {
  const [theme, setTheme] = useState(getTheme());
  const [username, setUsername] = useState("");
  const [input, setInput] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [repos, setRepos] = useState([]); // <-- new state
  const [reposOpen, setReposOpen] = useState(false); // <-- new state
  const [reposLoading, setReposLoading] = useState(false); // <-- new state
  const cardRef = useRef(null);

  // Load last searched user and theme
  useEffect(() => {
    const last = localStorage.getItem("lastUser");
    if (last) {
      setInput(last);
      setUsername(last);
    }
    setTheme(getTheme());
  }, []);

  // Fetch user when username changes
  useEffect(() => {
    if (!username) return;
    setLoading(true);
    setError("");
    setUser(null);
    fetch(`https://api.github.com/users/${username}`)
      .then((res) => {
        if (!res.ok) throw new Error("User not found");
        return res.json();
      })
      .then((data) => {
        setUser(data);
        localStorage.setItem("lastUser", username);
        // Animate card
        if (cardRef.current) {
          cardRef.current.classList.remove("opacity-0");
          void cardRef.current.offsetWidth;
          cardRef.current.classList.add("opacity-100");
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [username]);

  // Fetch repos when user and reposOpen changes
  useEffect(() => {
    if (!user || !reposOpen || repos.length > 0) return;
    setReposLoading(true);
    fetch(`https://api.github.com/users/${user.login}/repos?sort=updated&per_page=3`)
      .then((res) => {
        if (!res.ok) throw new Error("Could not fetch repos");
        return res.json();
      })
      .then((data) => setRepos(data))
      .catch(() => setRepos([]))
      .finally(() => setReposLoading(false));
  }, [user, reposOpen, repos.length]);

  // Reset repos and close section when user changes
  useEffect(() => {
    setRepos([]);
    setReposOpen(false);
  }, [user]);

  // Theme toggle handler
  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  }

  // Handle form submit
  function handleSubmit(e) {
    e.preventDefault();
    if (input.trim()) {
      if (input.trim() === username) {
        setUsername("");
        setTimeout(() => setUsername(input.trim()), 0);
      } else {
        setUsername(input.trim());
      }
      setError("");
    }
  }

  const c = GITHUB_COLORS[theme];

  return (
    <div className={`min-h-screen w-full px-4 py-6 sm:px-0 flex flex-col items-center justify-center ${c.bg} transition-colors duration-300 relative`}>
      {/* Content wrapper, no extra mx-4 */}
      <div className="w-full flex flex-col items-center">
        {/* Logo above DevHub title */}
        <img
          src={theme === 'dark' ? '/logo_dark.png' : '/logo_light.png'}
          alt="DevHub Logo"
          width={64}
          height={64}
          className="mb-2 mx-auto"
          draggable={false}
        />
        {/* Title and Tagline OUTSIDE the card */}
        <div className="mb-6 text-center">
          <div className={`font-extrabold text-3xl sm:text-4xl mb-1 ${theme === 'dark' ? 'text-white' : c.text}`}>DevHub</div>
          <div className={`text-base sm:text-lg font-medium ${theme === 'dark' ? 'text-[hsl(210,10%,88%)]' : c.muted}`}>Find devs. Check stats. Stay curious.</div>
        </div>
        {/* Search form and profile output, no card container */}
        <form onSubmit={handleSubmit} className="flex gap-2 mb-8 w-full max-w-xl">
          <input
            type="text"
            placeholder="Search GitHub username..."
            value={input}
            onChange={e => setInput(e.target.value)}
            className={`flex-1 px-4 py-2 rounded-lg border ${c.input} ${c.text} ${c.border} focus:outline-none focus:ring-2 focus:ring-[hsl(212,100%,45%)] focus:border-[hsl(212,100%,45%)] transition`}
            autoFocus
            aria-label="GitHub username"
          />
          <button
            type="submit"
            className={`px-4 py-2 rounded-lg font-semibold transition
              bg-[#238636] text-white hover:bg-[#196c2e]
              disabled:opacity-60 disabled:cursor-not-allowed
            `}
            disabled={loading || !input.trim()}
          >
            Search
          </button>
        </form>
        {/* Loading state */}
        {loading && (
          <div className="flex justify-center py-8">
            <svg className="animate-spin h-8 w-8 text-[hsl(137,65%,47%)] dark:text-[hsl(137,65%,55%)]" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          </div>
        )}
        {/* Error state */}
        {error && (
          <div className={`text-red-600 dark:text-red-400 text-center mb-4`}>{error}</div>
        )}
        {/* User card, no card container */}
        {user && !loading && (
          <div
            ref={cardRef}
            className={`opacity-0 transition-opacity duration-700 animate-fade-in w-full sm:max-w-xl border ${c.border} p-6 rounded-xl flex flex-col relative ${theme === 'dark' ? c.card : 'bg-white'}`}
            style={{ animation: 'fadeIn 0.7s forwards' }}
          >
            {/* Close button at top right of card */}
            <button
              onClick={() => { setUser(null); setInput(""); setRepos([]); setReposOpen(false); }}
              aria-label="Close profile"
              className="absolute top-2 right-2 sm:top-4 sm:right-4 p-2 rounded-full border border-transparent hover:border-[hsl(210,16%,88%)] dark:hover:border-[hsl(222,14%,25%)] focus:outline-none focus:ring-2 focus:ring-[hsl(137,65%,47%)] transition bg-transparent z-10"
            >
              <svg
                className={`w-5 h-5 ${theme === 'dark' ? 'text-[hsl(210,10%,60%)]' : 'text-[hsl(210,10%,40%)]'}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6" />
              </svg>
            </button>
            {/* Top: Profile Picture + Info */}
            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start w-full">
              <img
                src={user.avatar_url}
                alt={user.name || user.login}
                className="w-28 h-28 rounded-full border border-[hsl(210,16%,88%)] dark:border-[hsl(222,14%,25%)] shadow-md flex-shrink-0 min-w-[7rem] min-h-[7rem] object-cover"
              />
              <div className="flex-1 min-w-0 mt-4 sm:mt-0 w-full relative">
                <div className={`text-2xl font-bold truncate ${theme === 'dark' ? 'text-white' : c.text}`}>{user.name || <span className={c.muted}>No name</span>}</div>
                <div className={`text-lg font-mono ${theme === 'dark' ? 'text-white' : c.primary} truncate`}>@{user.login}</div>
                <div className={`mt-2 mb-4 ${theme === 'dark' ? 'text-[hsl(210,10%,88%)]' : c.muted}`}>{user.bio || <span className="italic">No bio</span>}</div>
                <div className="flex flex-wrap gap-4 text-sm mb-2">
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-lg border ${theme === 'dark' ? 'bg-[#161b22] border-[hsl(222,14%,25%)] text-[hsl(210,10%,88%)]' : 'bg-[hsl(210,16%,96%)] border-[hsl(210,16%,88%)] text-[hsl(210,10%,23%)]'}`}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="inline"><path d="M12 20.5V3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                    <span className="font-semibold">{user.public_repos}</span> <span className={c.muted}>Repos</span>
                  </div>
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-lg border ${theme === 'dark' ? 'bg-[#161b22] border-[hsl(222,14%,25%)] text-[hsl(210,10%,88%)]' : 'bg-[hsl(210,16%,96%)] border-[hsl(210,16%,88%)] text-[hsl(210,10%,23%)]'}`}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="inline"><path d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/></svg>
                    <span className="font-semibold">{user.followers}</span> <span className={c.muted}>Followers</span>
                  </div>
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-lg border ${theme === 'dark' ? 'bg-[#161b22] border-[hsl(222,14%,25%)] text-[hsl(210,10%,88%)]' : 'bg-[hsl(210,16%,96%)] border-[hsl(210,16%,88%)] text-[hsl(210,10%,23%)]'}`}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="inline"><path d="M7 21v-2a4 4 0 014-4h6a4 4 0 014 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="15" cy="7" r="4" stroke="currentColor" strokeWidth="2"/></svg>
                    <span className="font-semibold">{user.following}</span> <span className={c.muted}>Following</span>
                  </div>
                  {user.location && (
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-lg border ${theme === 'dark' ? 'bg-[#161b22] border-[hsl(222,14%,25%)] text-[hsl(210,10%,88%)]' : 'bg-[hsl(210,16%,96%)] border-[hsl(210,16%,88%)] text-[hsl(210,10%,23%)]'}`}>
                      <img src="/location.svg" alt="Location" width={16} height={16} className="inline" style={{color: 'currentColor'}} />
                      <span className="font-semibold">{user.location}</span>
                    </div>
                  )}
                </div>
                <a
                  href={user.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-lg font-semibold shadow-sm transition border focus:outline-none focus:ring-2 focus:ring-[#238636]
                    bg-[#238636] text-white hover:bg-[#196c2e]
                    ${theme === 'dark' ? 'border-[hsl(222,14%,25%)]' : 'border-[hsl(210,16%,88%)]'}
                  `}
                  aria-label="View on GitHub"
                >
                  {/* GitHub logo SVG */}
                  <svg viewBox="0 0 16 16" width="20" height="20" fill="currentColor" aria-hidden="true" className="inline-block">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.01.08-2.12 0 0 .67-.21 2.2.82a7.65 7.65 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.11.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.19 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
                  </svg>
                  View on GitHub
                </a>
              </div>
            </div>
            {/* Bottom: Recent Repositories */}
            <div className="w-full mt-6">
              <hr className={`mb-4 border-t ${theme === 'dark' ? 'border-[hsl(222,14%,25%)]' : 'border-[hsl(210,16%,88%)]'}`} />
              <div className="mb-2 w-full">
                <div className="flex items-center justify-between w-full">
                  <span className={`font-semibold ${theme === 'dark' ? 'text-white' : c.text}`}>Recent Repositories</span>
                  <button
                    aria-label={reposOpen ? 'Hide recent repositories' : 'Show recent repositories'}
                    className={`ml-2 p-1 rounded-full border border-transparent hover:border-[hsl(210,16%,88%)] dark:hover:border-[hsl(222,14%,25%)] focus:outline-none focus:ring-2 focus:ring-[#238636] transition bg-transparent`}
                    tabIndex={0}
                    type="button"
                    onClick={() => setReposOpen((v) => !v)}
                  >
                    <svg
                      className={`w-5 h-5 transition-transform duration-200 ${reposOpen ? 'rotate-180' : ''} ${theme === 'dark' ? 'text-[hsl(210,10%,60%)]' : 'text-[hsl(210,10%,40%)]'}`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                {reposOpen && (
                  <div className="mt-3 w-full">
                    {reposLoading ? (
                      <div className="text-sm text-[hsl(210,10%,60%)]">Loading...</div>
                    ) : repos.length === 0 ? (
                      <div className="text-sm text-[hsl(210,10%,60%)]">No recent repositories found.</div>
                    ) : (
                      <ul className="space-y-2 w-full">
                        {repos.map((repo, idx) => (
                          <li key={repo.id} className={`w-full pb-4 ${idx < repos.length - 1 ? 'border-b' : ''} ${theme === 'dark' ? 'border-[hsl(222,14%,25%)]' : 'border-[hsl(210,16%,88%)]'}`}>
                            <a
                              href={repo.html_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold text-[hsl(212,100%,65%)] hover:underline text-lg"
                            >
                              {repo.name}
                            </a>
                            {repo.description && (
                              <div className={`text-sm mt-1 mb-2 ${theme === 'dark' ? 'text-[hsl(210,10%,88%)]' : c.muted}`}>{repo.description}</div>
                            )}
                            <div className="flex items-center gap-4 text-xs mt-1">
                              {repo.language && (
                                <span className="flex items-center gap-1">
                                  <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: languageColor(repo.language) }}></span>
                                  <span className={theme === 'dark' ? 'text-[hsl(210,10%,60%)]' : c.muted}>{repo.language}</span>
                                </span>
                              )}
                              <span className={theme === 'dark' ? 'text-[hsl(210,10%,60%)]' : c.muted}>
                                Updated {formatUpdated(repo.updated_at)}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Dark mode toggle OUTSIDE the content wrapper */}
      <button
        aria-label="Toggle dark mode"
        onClick={toggleTheme}
        className="fixed z-20 top-4 right-4 p-2 rounded-full border border-transparent hover:border-[hsl(210,16%,88%)] dark:hover:border-[hsl(222,14%,25%)] focus:outline-none focus:ring-2 focus:ring-[hsl(212,100%,45%)] transition bg-transparent"
      >
        {theme === "dark" ? (
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" className="text-[hsl(210,10%,88%)]"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        ) : (
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" className="text-[hsl(212,100%,45%)]"><circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        )}
      </button>
      {/* Fade-in animation keyframes */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}

// Helper functions at the bottom:
function languageColor(lang) {
  // Simple mapping for demo; GitHub uses more
  const colors = {
    JavaScript: '#f1e05a',
    TypeScript: '#3178c6',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Python: '#3572A5',
    Java: '#b07219',
    Shell: '#89e051',
    C: '#555555',
    Cpp: '#f34b7d', // changed from 'C++' to 'Cpp'
    Go: '#00ADD8',
    PHP: '#4F5D95',
    Ruby: '#701516',
    Vue: '#41b883',
    SCSS: '#c6538c',
    Swift: '#ffac45',
    Rust: '#dea584',
    Dart: '#00B4AB',
    Kotlin: '#A97BFF',
    // Add more as needed
  };
  // Map 'C++' to 'Cpp' for lookup
  if (lang === 'C++') return colors.Cpp;
  return colors[lang] || '#bbb';
}
function formatUpdated(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'today';
  if (diff === 1) return 'yesterday';
  if (diff < 7) return `${diff} days ago`;
  if (diff < 30) return `last week`;
  if (diff < 365) return `${Math.floor(diff / 30)} month${Math.floor(diff / 30) > 1 ? 's' : ''} ago`;
  return `${Math.floor(diff / 365)} year${Math.floor(diff / 365) > 1 ? 's' : ''} ago`;
}
