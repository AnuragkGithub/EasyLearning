"use client";

import { useEffect, useState, type FormEvent } from "react";
import { BookOpen, GraduationCap, ShieldCheck, Sparkles, Users, ArrowRight, Eye, EyeOff } from "lucide-react";
import CampusDashboard from "@/components/campus-dashboard";

export type CampusRole = "student" | "mentor" | "admin";
export type CampusSession = { name: string; email: string; role: CampusRole };
const SESSION_KEY = "campusly-local-session";
const roleOptions: { id: CampusRole; title: string; description: string; icon: typeof BookOpen }[] = [
  { id: "student", title: "Student", description: "Find notes, follow subjects and save resources.", icon: BookOpen },
  { id: "mentor", title: "Mentor / Faculty", description: "Share course materials and guide learners.", icon: Users },
  { id: "admin", title: "Administrator", description: "Review contributions and manage the workspace.", icon: ShieldCheck },
];

export default function CampusEntry() {
  const [session, setSession] = useState<CampusSession | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) setSession(JSON.parse(stored) as CampusSession);
    } catch { localStorage.removeItem(SESSION_KEY); }
    setReady(true);
  }, []);
  function signIn(next: CampusSession) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(next));
    setSession(next);
  }
  function signOut() {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
  }
  if (!ready) return <div className="login-loading"><div className="login-logo"><GraduationCap/></div><span>Preparing your learning space…</span></div>;
  return session ? <CampusDashboard role={session.role} displayName={session.name} onLogout={signOut} /> : <LoginScreen onSignIn={signIn} />;
}

function LoginScreen({ onSignIn }: { onSignIn: (session: CampusSession) => void }) {
  const [role, setRole] = useState<CampusRole>("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.includes("@") || password.length < 4) {
      setError("Enter a valid email and a password of at least 4 characters.");
      return;
    }
    const fallback = email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    onSignIn({ name: name.trim() || fallback || "Campusly learner", email: email.trim(), role });
  }
  return <main className="login-screen">
    <div className="login-glow login-glow-a"/><div className="login-glow login-glow-b"/>
    <header className="login-header"><a className="login-brand" href="/"><span className="login-logo"><GraduationCap size={23}/></span><span>campusly<span className="brand-dot">.</span></span></a><span className="login-header-note"><Sparkles size={14}/> Your next chapter starts here</span></header>
    <div className="login-layout">
      <section className="login-story"><div className="login-eyebrow"><span/> YOUR LEARNING SPACE</div><h1>Never miss a lesson.<br/><em>Never lose the notes.</em></h1><p>One calm place for your syllabus, class notes, lecture resources and the people who help you learn.</p>
        <div className="login-preview-card"><div className="preview-orbit orbit-one"/><div className="preview-orbit orbit-two"/><div className="preview-book"><Sparkles size={18}/><span>YOUR NEXT<br/><b>CHAPTER.</b></span><i/></div><div className="preview-note"><BookOpen size={15}/><span><b>Data Structures</b><small>Unit 02 · Linked Lists</small></span><span className="preview-check">✓</span></div></div>
        <div className="login-trust-row"><span><ShieldCheck size={15}/> Organized by syllabus</span><span><BookOpen size={15}/> Built for every campus</span></div>
      </section>
      <section className="login-panel"><div className="login-panel-top"><span className="login-panel-kicker">WELCOME TO CAMPUSLY</span><h2>Sign in to your space</h2><p>Choose how you use Campusly to continue.</p></div>
        <div className="role-picker" aria-label="Choose account type">{roleOptions.map(({id,title,description,icon:Icon})=><button type="button" key={id} className={`role-option ${role===id?"selected":""}`} onClick={()=>{setRole(id);setError("");}} aria-pressed={role===id}><span className="role-icon"><Icon size={19}/></span><span className="role-copy"><b>{title}</b><small>{description}</small></span><span className="role-radio"/></button>)}</div>
        <form className="login-form" onSubmit={submit}><label htmlFor="login-name">Your name <span>(optional)</span></label><input id="login-name" autoComplete="name" placeholder="e.g. Anurag Karmakar" value={name} onChange={e=>setName(e.target.value)}/><label htmlFor="login-email">Email address</label><input id="login-email" type="email" required autoComplete="email" placeholder="you@university.edu" value={email} onChange={e=>setEmail(e.target.value)}/><div className="password-label"><label htmlFor="login-password">Password</label><span>Local preview</span></div><div className="password-wrap"><input id="login-password" type={showPassword?"text":"password"} required minLength={4} autoComplete="current-password" placeholder="Enter any 4+ characters" value={password} onChange={e=>setPassword(e.target.value)}/><button type="button" aria-label={showPassword?"Hide password":"Show password"} onClick={()=>setShowPassword(v=>!v)}>{showPassword?<EyeOff size={17}/>:<Eye size={17}/>}</button></div>{error&&<p className="login-error" role="alert">{error}</p>}<button className="login-submit" type="submit">Continue as {roleOptions.find(r=>r.id===role)?.title}<ArrowRight size={17}/></button></form>
        <div className="login-demo-note"><ShieldCheck size={16}/><p><b>Local demo sign-in</b><br/>This preview saves a role on this browser only. It does not verify credentials or secure accounts. Connect Supabase Auth before real users sign in.</p></div>
      </section>
    </div>
    <footer className="login-footer"><span>© 2026 Campusly</span><span>Learn together, from any campus.</span></footer>
  </main>;
}
