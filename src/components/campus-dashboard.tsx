"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowRight, ArrowUpRight, Bell, Bookmark, BookOpen,
  Braces, Check, ChevronDown, ChevronRight, CircleHelp,
  Clock3, CloudUpload, Command, Compass, Database, FileCheck2, FileText,
  Filter, Flame, FolderOpen, GraduationCap, LayoutDashboard, Library,
  ListChecks, Menu, MoreHorizontal, Plus, Search,
  ShieldCheck, Sigma, Sparkles, Upload, Workflow, X, Sun, Moon, House,
} from "lucide-react";
import { resources, subjects, type Resource } from "@/lib/demo-data";
import { getLocalFile, loadLocalState, saveLocalFile, saveLocalState } from "@/lib/local-store";
import type { CampusRole } from "@/components/campus-entry";

const navGroups = [
  { label: "WORKSPACE", items: [{ label: "Overview", icon: LayoutDashboard }, { label: "My subjects", icon: BookOpen }, { label: "Saved resources", icon: Bookmark }] },
  { label: "EXPLORE", items: [{ label: "Universities", icon: GraduationCap }, { label: "Resource library", icon: Library }, { label: "Study planner", icon: ListChecks }] },
];

const typeClass: Record<Resource["type"], string> = { PDF: "file-pdf", PPT: "file-ppt", DOC: "file-doc", LINK: "file-link" };

export default function CampusDashboard({ role, displayName, onLogout }: { role: CampusRole; displayName: string; onLogout: () => void }) {
  const [query, setQuery] = useState("");
  const [activeNav, setActiveNav] = useState("Overview");
  const [activeFilter, setActiveFilter] = useState("All resources");
  const [showUpload, setShowUpload] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [saved, setSaved] = useState<string[]>(["r2"]);
  const [hydrated, setHydrated] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [sortNewest, setSortNewest] = useState(true);
  const [toast, setToast] = useState("");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadSubject, setUploadSubject] = useState("Data Structures & Algorithms");
  const [uploaded, setUploaded] = useState<Resource[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("campusly-theme");
    if (savedTheme === "dark" || savedTheme === "light") setTheme(savedTheme);
    const localState = loadLocalState();
    if (localState) {
      setSaved(localState.saved);
      setUploaded(localState.uploaded);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveLocalState({ saved, uploaded });
  }, [saved, uploaded, hydrated]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("campusly-theme", theme);
  }, [theme]);

  const allResources = useMemo(() => [...uploaded, ...resources], [uploaded]);
  const filteredResources = useMemo(() => allResources.filter((item) => {
    const matchesQuery = `${item.title} ${item.subject} ${item.unit} ${item.author}`.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = activeFilter === "All resources" || item.category === activeFilter;
    return matchesQuery && matchesFilter;
  }), [allResources, query, activeFilter]);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  }

  function toggleSaved(id: string) {
    setSaved((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    notify(saved.includes(id) ? "Removed from saved resources" : "Saved for later");
  }

  async function openResource(resource: Resource) {
    if (resource.id.startsWith("local-")) {
      try {
        const blob = await getLocalFile(resource.id);
        if (!blob) {
          notify("File not found in this browser. Please upload it again.");
          return;
        }
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = resource.title + (resource.type === "PDF" ? ".pdf" : resource.type === "PPT" ? ".pptx" : resource.type === "DOC" ? ".docx" : "");
        anchor.click();
        URL.revokeObjectURL(url);
        notify("Download started");
      } catch {
        notify("Could not open the local file");
      }
      return;
    }
    if (resource.id.startsWith("demo-")) {
      notify("This contribution is pending review and is not public yet.");
      return;
    }
    notify("This sample resource has no attached file. Upload your own notes to test downloads.");
  }

  async function submitDemoUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!uploadTitle.trim() || !uploadFile) {
      notify("Add a title and choose a file first.");
      return;
    }
    if (uploadFile.size > 10 * 1024 * 1024) {
      notify("Please choose a file smaller than 10 MB.");
      return;
    }
    const extension = uploadFile.name.split(".").pop()?.toLowerCase() ?? "";
    const type: Resource["type"] = extension === "pdf" ? "PDF" : ["ppt", "pptx"].includes(extension) ? "PPT" : ["doc", "docx"].includes(extension) ? "DOC" : "PDF";
    const id = `local-${Date.now()}`;
    try {
      await saveLocalFile(id, uploadFile);
      const item: Resource = {
        id, title: uploadTitle.trim(), subject: uploadSubject,
        unit: "Awaiting moderator review", type, size: uploadFile.size < 1024 * 1024 ? `${Math.max(1, Math.round(uploadFile.size / 1024))} KB` : `${(uploadFile.size / (1024 * 1024)).toFixed(1)} MB`,
        updated: "Just now", author: "You", initials: "YO", color: "blue",
        category: type === "PPT" ? "Slides" : type === "DOC" ? "Lab manuals" : "Notes",
      };
      setUploaded((current) => [item, ...current]);
      setUploadTitle("");
      setUploadFile(null);
      setShowUpload(false);
      setActiveFilter("All resources");
      notify("File saved in this browser · pending review");
    } catch {
      notify("Could not save the file in this browser.");
    }
  }

  function navigate(label: string) {
    setActiveNav(label);
    setMobileNav(false);
    if (["Saved resources", "Resource library", "My subjects", "Overview"].includes(label)) {
      if (label !== "Saved resources") setActiveFilter("All resources");
      if (label === "My subjects") setTimeout(() => document.getElementById("subjects")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
      if (label === "Resource library" || label === "Saved resources") setTimeout(() => document.getElementById("resources")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
      return;
    }
    notify(`${label}: this section is not part of the local MVP yet.`);
  }

  const subjectFilteredResources = activeNav === "My subjects" ? filteredResources.filter((r) => subjects.some((subject) => subject.title === r.subject && (query === "" || subject.title.toLowerCase().includes(query.toLowerCase())))) : filteredResources;
  const visiblePool = (activeNav === "Saved resources" ? subjectFilteredResources.filter((r) => saved.includes(r.id)) : subjectFilteredResources);
  const visibleResources = (sortNewest ? visiblePool : [...visiblePool].reverse()).slice(0, showAll ? 50 : 4);

  return (
    <div className="app-shell" data-theme={theme}>
      {mobileNav && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMobileNav(false)} />}
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <div className="brand-row">
          <div className="brand-mark"><GraduationCap size={23} strokeWidth={2.3} /></div>
          <span className="brand-name">campusly<span>.</span></span>
          <button className="icon-button sidebar-close" aria-label="Close menu" onClick={() => setMobileNav(false)}><X size={18}/></button>
        </div>
        <button className="institution-switch" onClick={() => notify("University switcher · connect your institution in settings") }>
          <div className="institution-emblem">A</div>
          <div className="institution-copy"><strong>Adamas University</strong><span>Student workspace</span></div>
          <ChevronDown size={15} className="muted-icon" />
        </button>
        <div className="sidebar-scroll">
          {navGroups.map((group) => <div className="nav-group" key={group.label}>
            <div className="nav-label">{group.label}</div>
            {group.items.map(({ label, icon: Icon }) => <button key={label} className={`nav-item ${activeNav === label ? "active" : ""}`} onClick={() => navigate(label)}><Icon size={18} strokeWidth={1.8}/><span>{label}</span>{label === "Saved resources" && <span className="nav-count">{saved.length}</span>}</button>)}
          </div>)}
          <div className="nav-group">
            <div className="nav-label">YOUR SPACE</div>
            <button className={`nav-item ${activeNav === "Study streak" ? "active" : ""}`} onClick={() => navigate("Study streak")}><Flame size={18} strokeWidth={1.8}/><span>Study streak</span><span className="streak-pill">4 days</span></button>
            <button className={`nav-item ${activeNav === "Help & feedback" ? "active" : ""}`} onClick={() => navigate("Help & feedback")}><CircleHelp size={18} strokeWidth={1.8}/><span>Help & feedback</span></button>
          </div>
        </div>
        <div className="sidebar-bottom">
          <div className="upgrade-card"><div className="upgrade-icon"><Sparkles size={17}/></div><strong>Your study space,</strong><strong>all in one place.</strong><p>Find notes. Stay on track. Learn together.</p><button onClick={() => navigate("Resource library")}>Explore Campusly <ArrowRight size={14}/></button><div className="upgrade-orb orb-one"/><div className="upgrade-orb orb-two"/></div>
          <button className="profile-row" onClick={onLogout} title="Sign out"><div className="avatar avatar-user">{displayName.split(/\s+/).map(part=>part[0]).slice(0,2).join("").toUpperCase()}</div><div className="profile-copy"><strong>{displayName}</strong><span>{role === "admin" ? "Administrator" : role === "mentor" ? "Mentor / Faculty" : "Student account"} · Local preview</span></div><MoreHorizontal size={18} className="muted-icon"/></button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left"><button className="icon-button mobile-menu" aria-label="Open menu" onClick={() => setMobileNav(true)}><Menu size={21}/></button><div className="breadcrumb"><span>Workspace</span><ChevronRight size={14}/><strong>{activeNav}</strong></div></div>
          <div className="topbar-actions"><div className="global-search"><Search size={16}/><input aria-label="Search everything" placeholder="Search notes, subjects..." value={query} onChange={(e) => setQuery(e.target.value)}/><kbd><Command size={11}/> K</kbd></div><button className="icon-button theme-toggle" aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"} title={theme === "light" ? "Dark mode" : "Light mode"} onClick={() => setTheme((current) => current === "light" ? "dark" : "light")}>{theme === "light" ? <Moon size={18}/> : <Sun size={18}/>}</button><button className="icon-button notification-button" aria-label="Notifications" onClick={() => notify("You're all caught up — no new notifications.")}><Bell size={19}/><span/></button><div className="topbar-divider"/><button className="top-avatar" aria-label="Open profile" onClick={() => notify("Profile settings will be connected in the next build")}>AK</button></div>
        </header>

        <div className="page-content">
          <section className="welcome-row">
            <div><div className="eyebrow"><span className="live-dot"/> YOUR LEARNING SPACE</div><h1>{activeNav === "Saved resources" ? "Your saved resources" : activeNav === "Overview" ? <>Make today a <span>good study day.</span></> : activeNav}</h1><p className="welcome-subtitle">{activeNav === "Saved resources" ? "Everything you bookmarked, ready when you are." : "Pick up where you left off. Your next breakthrough starts here."}</p></div>
            <button className="primary-button" onClick={() => role === "admin" ? notify("Admin workspace: review tools are next to be connected to a live database.") : role === "mentor" ? notify("Mentor workspace: course management will connect after Supabase setup.") : setShowUpload(true)}><Plus size={17} strokeWidth={2.3}/> {role === "admin" ? "Review resources" : role === "mentor" ? "Manage courses" : "Contribute notes"}</button>
          </section>

          <section className="hero-banner">
            <div className="hero-copy"><div className="hero-chip"><Sparkles size={13}/> YOUR SEMESTER, SIMPLIFIED</div><h2>Never miss a lesson.<br/><em>Never lose the notes.</em></h2><p>All your syllabus, class notes and study resources — organised in one calm, simple space.</p><button className="hero-button" onClick={() => { setActiveNav("Resource library"); setActiveFilter("All resources"); document.getElementById("resources")?.scrollIntoView({ behavior: "smooth" }); }}>Explore your library <ArrowRight size={16}/></button></div>
            <div className="hero-art" aria-hidden="true"><div className="art-sun"/><div className="art-ring ring-one"/><div className="art-ring ring-two"/><div className="art-book book-back"><div/><div/><div/></div><div className="art-book book-front"><div className="book-spark">✳</div><span>YOUR<br/>NEXT<br/><b>CHAPTER.</b></span><i/></div><div className="art-sticker"><Check size={13}/> Lesson saved</div><div className="art-star star-a">✳</div><div className="art-star star-b">✦</div></div>
          </section>

          <section className="stats-grid" aria-label="Learning summary">
            <div className="stat-card"><div className="stat-top"><span className="stat-icon stat-violet"><BookOpen size={18}/></span><span className="stat-caption">THIS SEMESTER</span></div><div className="stat-number">04 <span>subjects</span></div><div className="stat-bottom"><span className="stat-dot dot-violet"/> All your classes, in one place</div></div>
            <div className="stat-card"><div className="stat-top"><span className="stat-icon stat-green"><FileCheck2 size={18}/></span><span className="stat-caption">READY TO REVISE</span></div><div className="stat-number">24 <span>resources</span></div><div className="stat-bottom"><span className="stat-dot dot-green"/> Notes, slides & practice sets</div></div>
            <div className="stat-card"><div className="stat-top"><span className="stat-icon stat-orange"><Flame size={18}/></span><span className="stat-caption">KEEP IT GOING</span></div><div className="stat-number">04 <span>day streak</span></div><div className="stat-bottom"><span className="stat-dot dot-orange"/> Small steps add up</div></div>
            <div className="stat-card stat-progress"><div className="stat-top"><span className="stat-icon stat-blue"><Compass size={18}/></span><span className="stat-caption">YOUR MOMENTUM</span></div><div className="stat-number">56<span>%</span></div><div className="progress-track"><div className="progress-fill" style={{width:"56%"}}/></div><div className="stat-bottom"><span className="stat-dot dot-blue"/> Average syllabus progress</div></div>
          </section>

          <section className="section-block subjects-section" id="subjects">
            <div className="section-heading"><div><div className="section-kicker">YOUR CLASSROOM</div><h2>Jump back into a subject</h2><p>Keep your learning moving, one topic at a time.</p></div><button className="text-link" onClick={() => navigate("My subjects")}>View all subjects <ArrowUpRight size={16}/></button></div>
            <div className="subjects-grid">{subjects.map((subject) => <button className="subject-card" key={subject.code} onClick={() => { setQuery(subject.title); setActiveNav("Resource library"); setActiveFilter("All resources"); document.getElementById("resources")?.scrollIntoView({behavior:"smooth"}); }}><div className="subject-card-top"><div className={`subject-icon tone-${subject.tone}`}>{subject.icon === "braces" ? <Braces size={20}/> : subject.icon === "database" ? <Database size={20}/> : subject.icon === "workflow" ? <Workflow size={20}/> : <Sigma size={20}/>}</div><span className="subject-code">{subject.code}</span><ArrowUpRight size={16} className="subject-arrow"/></div><h3>{subject.title}</h3><div className="subject-meta"><span>{subject.units}</span><span>{subject.progress}% covered</span></div><div className="subject-progress"><div className={`subject-progress-fill tone-fill-${subject.tone}`} style={{width:`${subject.progress}%`}}/></div><div className="subject-footer"><span><Clock3 size={13}/> Pick up where you left off</span><ChevronRight size={15}/></div></button>)}</div>
          </section>

          <section className="section-block resources-section" id="resources">
            <div className="section-heading resource-heading"><div><div className="section-kicker">THE GOOD STUFF</div><h2>{activeNav === "Saved resources" ? "Saved for your next study session" : "Recently added resources"}</h2><p>Useful notes from your faculty and fellow learners.</p></div><button className="outline-button" onClick={() => role === "admin" ? notify("Moderation requires the live backend; this local preview does not approve resources.") : role === "mentor" ? setShowUpload(true) : setShowUpload(true)}><Upload size={15}/> {role === "admin" ? "Moderation queue" : "Upload a resource"}</button></div>
            <div className="resource-toolbar"><div className="filter-tabs">{["All resources","Notes","Slides","Question papers","Lab manuals"].map((filter) => <button key={filter} onClick={() => setActiveFilter(filter)} className={activeFilter === filter ? "selected" : ""}>{filter}</button>)}</div><button className="filter-button" onClick={() => { setSortNewest((value) => !value); notify(sortNewest ? "Showing older resources first" : "Showing newest resources first"); }}><Filter size={15}/><span>{sortNewest ? "Latest first" : "Oldest first"}</span><ChevronDown size={14}/></button></div>
            <div className="resource-list">{visibleResources.length ? visibleResources.map((resource) => <article className="resource-row" key={resource.id}><div className={`resource-file ${typeClass[resource.type]}`}><FileText size={22}/><span>{resource.type}</span></div><div className="resource-main"><div className="resource-title-line"><h3>{resource.title}</h3>{resource.featured && <span className="verified-tag"><ShieldCheck size={12}/> Faculty pick</span>}{(resource.id.startsWith("demo-") || resource.id.startsWith("local-")) && <span className="pending-tag">Pending review</span>}</div><div className="resource-subtitle">{resource.subject} <span>·</span> {resource.unit}</div><div className="resource-byline"><span className={`mini-avatar avatar-${resource.color}`}>{resource.initials}</span><span>{resource.author}</span><i/> <span>{resource.updated}</span></div></div><div className="resource-size">{resource.size}</div><button className={`icon-button save-button ${saved.includes(resource.id) ? "is-saved" : ""}`} aria-label={saved.includes(resource.id) ? "Remove bookmark" : "Bookmark resource"} onClick={() => toggleSaved(resource.id)}><Bookmark size={18} fill={saved.includes(resource.id) ? "currentColor" : "none"}/></button><button className="row-open" aria-label={`Open ${resource.title}`} onClick={() => void openResource(resource)}><ArrowUpRight size={17}/></button></article>) : <div className="empty-state"><div className="empty-icon"><FolderOpen size={25}/></div><h3>No resources found</h3><p>Try another search or choose a different category.</p><button className="text-link" onClick={() => {setQuery("");setActiveFilter("All resources");}}>Clear filters <X size={14}/></button></div>}</div>
            {filteredResources.length > 4 && activeNav !== "Saved resources" && <button className="load-more" onClick={() => setShowAll(!showAll)}>{showAll ? "Show less" : "Browse all resources"} <ArrowRight size={15}/></button>}
          </section>

          <section className="bottom-grid">
            <div className="tip-card"><div className="tip-icon"><Sparkles size={18}/></div><div><span className="section-kicker">A LITTLE STUDY TIP</span><h3>Make a tiny plan. Keep a big promise.</h3><p>Pick one topic, set aside 25 minutes, and give it your full attention. That&apos;s a solid start.</p><button className="text-link" onClick={() => notify("Study planner will be available in a future release")}>Plan a study session <ArrowRight size={15}/></button></div><div className="tip-decoration">✳</div></div>
            <div className="contribute-card"><div className="contribute-illustration"><div className="contribute-paper"><FileText size={25}/><span/><span/><span/></div><div className="contribute-plus"><Plus size={18}/></div></div><div><h3>Have notes that helped?</h3><p>Share them with your classmates. Good learning gets better when it travels.</p><button className="contribute-link" onClick={() => setShowUpload(true)}>Share a resource <ArrowRight size={15}/></button></div></div>
          </section>
          <footer className="footer"><div className="footer-brand"><div className="brand-mark small-mark"><GraduationCap size={16}/></div><span>campusly<span>.</span></span></div><span>Built for curious minds. Made for every campus.</span><div className="footer-links"><button onClick={() => notify("Help centre coming soon")}>Help</button><button onClick={() => notify("Privacy details will be added before launch")}>Privacy</button><span>© 2026 Campusly</span></div></footer>
        </div>
      </main>

      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        {[{ label: "Home", icon: House, target: "Overview" }, { label: "Subjects", icon: BookOpen, target: "My subjects" }, { label: "Library", icon: Library, target: "Resource library" }, { label: "Saved", icon: Bookmark, target: "Saved resources" }].map(({ label, icon: Icon, target }) => (
          <button key={label} className={activeNav === target || (label === "Home" && activeNav === "Overview") ? "active" : ""} onClick={() => navigate(target)} aria-label={label}>
            <Icon size={19} strokeWidth={1.9}/><span>{label}</span>
          </button>
        ))}
      </nav>

      {showUpload && role !== "admin" && <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowUpload(false); }}><div className="upload-modal" role="dialog" aria-modal="true" aria-labelledby="upload-heading"><div className="modal-heading"><div><div className="section-kicker">GROW THE LIBRARY</div><h2 id="upload-heading">Share your notes</h2><p>Help someone else have a better study day.</p></div><button className="icon-button" onClick={() => setShowUpload(false)} aria-label="Close upload form"><X size={19}/></button></div><form onSubmit={submitDemoUpload}><label htmlFor="resource-title">Resource title</label><input id="resource-title" required maxLength={100} placeholder="e.g. Unit 2 — Linked Lists" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)}/><label htmlFor="resource-subject">Subject</label><select id="resource-subject" value={uploadSubject} onChange={(e) => setUploadSubject(e.target.value)}>{subjects.map((s) => <option key={s.code}>{s.title}</option>)}</select><div className="upload-dropzone"><CloudUpload size={25}/><strong>{uploadFile ? uploadFile.name : "Choose a PDF, PowerPoint, or Word file"}</strong><span>{uploadFile ? `${(uploadFile.size / 1024 / 1024).toFixed(2)} MB · saved privately in this browser` : "Maximum 10 MB. In this local mode, files stay in this browser."}</span><input aria-label="Choose resource file" type="file" accept=".pdf,.ppt,.pptx,.doc,.docx" required onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)} /></div><div className="review-notice"><ShieldCheck size={16}/><span>Student contributions are reviewed before they become public.</span></div><div className="modal-actions"><button type="button" className="outline-button" onClick={() => { setShowUpload(false); setUploadFile(null); }}>Cancel</button><button type="submit" className="primary-button"><Plus size={16}/> Submit for review</button></div></form></div></div>}
      {toast && <div className="toast-message"><Check size={17}/><span>{toast}</span><button onClick={() => setToast("")} aria-label="Dismiss notification"><X size={15}/></button></div>}
    </div>
  );
}
