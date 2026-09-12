import { Link } from "react-router-dom";
import { Repeat, ArrowUpRight, Sparkles, CalendarCheck, Users2 } from "lucide-react";
import PlatformIcon from "../components/PlatformIcon.jsx";

const steps = [
  {
    title: "Connect your accounts",
    body: "Link LinkedIn, Instagram, X and Facebook once. Loop keeps every connection alive in the background.",
    icon: Users2,
  },
  {
    title: "Write it, or let Loop draft it",
    body: "Type your own update, or describe what you want to say and get a caption (and image) back in your voice.",
    icon: Sparkles,
  },
  {
    title: "Pick a time and walk away",
    body: "Choose a date, choose your platforms, and Loop publishes exactly on schedule — no reminders needed.",
    icon: CalendarCheck,
  },
];

const testimonials = [
  {
    quote:
      "I stopped dreading Monday posting. I queue a week of updates in twenty minutes and get my afternoons back.",
    name: "Priya D.",
    role: "Startup founder",
    color: "#46705B",
  },
  {
    quote:
      "The drafts actually sound like our team wrote them. That was the thing I was most skeptical about going in.",
    name: "Marcus L.",
    role: "Independent creator",
    color: "#5B6FA8",
  },
  {
    quote:
      "Our agency runs twelve client accounts through Loop now. The activity log alone has saved us from three missed posts.",
    name: "Sarah K.",
    role: "Marketing manager",
    color: "#BF4E2E",
  },
];

const LandingPage = () => {
  return (
    <div className="bg-cream text-ink">
      {/* Nav */}
      <header className="max-w-6xl mx-auto flex items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-rust flex items-center justify-center">
            <Repeat size={17} className="text-white" />
          </div>
          <span className="font-display text-xl font-semibold">Loop</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-ink-light">
          <a href="#how-it-works" className="hover:text-ink transition-colors">How it works</a>
          <a href="#testimonials" className="hover:text-ink transition-colors">Stories</a>
        </nav>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-ink-light hover:text-ink transition-colors">
            Sign in
          </Link>
          <Link
            to="/signup"
            className="inline-flex items-center gap-1 bg-rust text-white text-sm font-medium px-4 py-2.5 rounded-full hover:bg-rust-600 transition-colors"
          >
            Get started
            <ArrowUpRight size={15} />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-10 pb-24 grid md:grid-cols-2 gap-14 items-center">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-medium text-sage-600 bg-sage-50 px-3 py-1.5 rounded-full mb-6">
            Built for people who post, not marketers who schedule
          </p>
          <h1 className="font-display text-5xl md:text-6xl leading-[1.05] font-semibold mb-6 text-balance">
            Say it once.<br />
            Loop puts it <span className="text-rust">everywhere</span>.
          </h1>
          <p className="text-lg text-ink-light max-w-md mb-8 leading-relaxed">
            Write a post, or hand Loop a rough idea and let it draft one for you.
            Pick your platforms, pick a time, and get on with your day —
            we'll handle the publishing.
          </p>
          <div className="flex items-center gap-4">
            <Link
              to="/signup"
              className="bg-ink text-white text-sm font-medium px-6 py-3.5 rounded-full hover:bg-rust-700 transition-colors"
            >
              Start scheduling — it's free
            </Link>
            <Link
              to="/login"
              className="text-sm font-medium text-ink-light hover:text-ink transition-colors"
            >
              I already have an account
            </Link>
          </div>
        </div>

        {/* Hero visual: a believable product moment, not a gradient blob */}
        <div className="relative">
          <div className="bg-white rounded-xl2 shadow-warm border border-cream-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm font-semibold text-ink">Compose post</p>
              <div className="flex items-center gap-2">
                {["twitter", "linkedin", "instagram"].map((p) => (
                  <div key={p} className="h-7 w-7 rounded-full bg-cream-100 flex items-center justify-center">
                    <PlatformIcon platform={p} size={14} />
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-cream-100 rounded-lg p-4 text-sm text-ink-light leading-relaxed mb-4">
              We just shipped dark mode based on your feedback — 400+ of you asked,
              so we built it over the weekend. Try it from Settings and tell us
              what still feels off.
            </div>
            <div className="flex items-center justify-between text-xs text-ink-muted mb-5">
              <span>Thu, Sep 4 · 9:30 AM</span>
              <span className="text-sage-600 font-medium">Ready to schedule</span>
            </div>
            <button className="w-full bg-rust text-white text-sm font-medium py-3 rounded-full">
              Schedule post
            </button>
          </div>

          <div className="absolute -bottom-8 -left-8 bg-white rounded-xl shadow-warm-sm border border-cream-200 px-4 py-3 hidden sm:flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-sage-50 flex items-center justify-center">
              <CalendarCheck size={15} className="text-sage-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-ink">Published to 3 platforms</p>
              <p className="text-[11px] text-ink-muted">2 minutes ago</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-20 border-t border-cream-200">
        <div className="max-w-lg mb-14">
          <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4">
            Three steps, then you're mostly done
          </h2>
          <p className="text-ink-light leading-relaxed">
            No onboarding calls, no setup fees. Most people are scheduling
            their first post within five minutes of signing up.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map(({ title, body, icon: Icon }, i) => (
            <div key={title} className="relative pt-2">
              <div className="h-11 w-11 rounded-full bg-white border border-cream-200 shadow-warm-sm flex items-center justify-center mb-5">
                <Icon size={19} className="text-rust" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">{title}</h3>
              <p className="text-ink-light text-[15px] leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="bg-white border-t border-cream-200">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="max-w-lg mb-14">
            <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4">
              People who used to post less than they meant to
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-cream-100 rounded-xl2 p-6 flex flex-col justify-between">
                <p className="text-[15px] leading-relaxed text-ink-light mb-6">
                  {t.quote}
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="h-9 w-9 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                    style={{ backgroundColor: t.color }}
                  >
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink">{t.name}</p>
                    <p className="text-xs text-ink-muted">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA footer */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <h2 className="font-display text-3xl md:text-4xl font-semibold mb-5 max-w-xl mx-auto">
          Your next post is one prompt away
        </h2>
        <Link
          to="/signup"
          className="inline-flex items-center gap-2 bg-rust text-white text-sm font-medium px-7 py-3.5 rounded-full hover:bg-rust-600 transition-colors"
        >
          Create your free account
          <ArrowUpRight size={15} />
        </Link>
      </section>

      <footer className="border-t border-cream-200 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs text-ink-muted">
          <span>© {new Date().getFullYear()} Loop.</span>
          <span>Publishing powered by the Zernio API.</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
