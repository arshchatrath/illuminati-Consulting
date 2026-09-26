import PageEffects from '../components/PageEffects';
import { sceneMarkup } from '../lib/scene';

const LINKS = [['#story', 'Approach'], ['#results', 'Results'], ['#work', 'Work'], ['#team', 'Team']];

const PAIRS = [
  ['Fragmented sales efforts', 'AI-led sales planning', 'ML + GenAI', '+4% topline growth'],
  ['Suboptimal pricing & promotions', 'Dynamic pricing & promotion optimisation', 'ML', '+3% margin unlock'],
  ['Manual, non-standard operations', 'Multi-agent hubs as a service', 'Agentic', '40% efficiency gain'],
  ['Subjective performance management', 'Health index & action board', 'ML + Agentic', '20% productivity gain'],
  ['Lead funnel leakage', 'AI-led lead conversion', 'ML + Agentic', '+2% lead conversion'],
  ['Stockouts', 'Order forecasting & inventory planning', 'ML + Agentic', 'Working capital unlock'],
  ['Siloed insights', 'Enterprise insights factory', 'GenAI + Agentic', 'Better decision support'],
  ['Rigid training programmes', 'On-demand tailored content delivery', 'Agentic', 'Higher employee productivity'],
];

const CASES = [
  ['Machine learning', 'Leading private sector bank', 'Next best action for balance growth', 'Personalised customer action recommendations that supported account engagement and balance growth.'],
  ['Agentic AI', 'Global food & FMCG leader', 'Agentic AI Center of Excellence', 'Governance, operating model and capabilities to scale agentic AI adoption across the enterprise.'],
  ['Machine learning', 'Integrated logistics & shipping company', 'Container network optimisation', 'Optimised container allocation and movement, improving asset utilisation and operational efficiency.'],
  ['Agentic AI', 'Concrete equipment manufacturer', 'Agentic contact centre operations', 'AI agents supporting service workflows and customer interactions, improving responsiveness and scale.'],
  ['ML + GenAI', 'Leading Indian FMCG company', 'AI-enabled sales planning', 'Predictive insights and AI-assisted decision support for more agile commercial execution.'],
  ['Machine learning', 'Quick service restaurant chain', 'Pricing & promotion optimisation', 'Optimal pricing and promotional strategies, enhancing revenue realisation and campaign effectiveness.'],
  ['Agentic AI', 'Major insurance provider', 'AgentOps operating model', 'Frameworks for monitoring, governance and lifecycle management of AI agents at scale.'],
  ['Agentic AI', 'Leading hospitality company', 'Autonomous e-commerce operations agent', 'AI-driven task execution and workflow orchestration that reduced manual effort.'],
  ['Machine learning', 'Consumer electronics retailer', 'Demand-driven order forecasting', 'Better inventory planning, reducing stock-outs and excess inventory.'],
  ['Machine learning', 'Leading Indian automotive manufacturer', 'Dealer performance intelligence', 'A dealer performance framework with targeted actions to lift productivity and commercial outcomes.'],
  ['AI strategy', 'Heavy equipment manufacturer', 'Enterprise AI strategy & roadmap', 'A prioritised AI opportunity portfolio and transformation roadmap tied to value realisation.'],
  ['GenAI + Agentic AI', 'Leading private sector bank', 'Agentic & GenAI governance framework', 'Governance for generative and agentic AI across the bank.'],
];

const MODELS = ['Strategy', 'Training', 'Co-delivery', 'Rapid prototyping', 'Prototype + programme', 'Full value realisation'];

const Bulb = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z" /></svg>
);

export default function Home() {
  return (
    <>
      <a className="skip" href="#results">Skip to content</a>

      <header className="nav">
        <a className="nav__brand" href="#top">
          <img src="/img/logowhite.png" alt="" width="30" height="27" />
          <span>Illuminati <small>Consulting</small></span>
        </a>
        <nav className="nav__links" aria-label="Primary">
          {LINKS.map(([href, label]) => <a key={href} href={href}>{label}</a>)}
        </nav>
        <a className="btn btn--gold btn--sm nav__cta" href="#contact"><Bulb />Book a call</a>
        <button className="nav__menu" popoverTarget="menu" aria-label="Menu">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h16M4 16h16" /></svg>
        </button>
      </header>

      {/* Native popover: opens, closes on Escape or outside tap, and works without JavaScript. */}
      <div
        id="menu"
        popover="auto"
        className="fixed inset-x-3 top-[4.5rem] bottom-auto m-0 w-auto rounded-xl border border-line bg-bg-raised/95 p-2 text-text shadow-2xl backdrop-blur-md"
      >
        <nav aria-label="Menu" className="grid">
          {LINKS.map(([href, label]) => (
            <a key={href} href={href} className="rounded-lg px-4 py-3 font-display text-2xl no-underline hover:bg-gold/10 hover:text-gold-lit">
              {label}
            </a>
          ))}
          <a href="#contact" className="btn btn--gold mt-2 justify-center">Book a strategy call</a>
        </nav>
      </div>

      <main id="top">
        <section className="story" id="story" aria-label="How we work: insights, fit, action, value">
          <div className="story__sticky">
            <div className="hero" id="hero">
              <p className="hero__eyebrow">
                AI-first advisory<span className="hero__eyebrow-sep" aria-hidden="true"> &nbsp;·&nbsp; </span><span className="hero__eyebrow-more">Strategy · Generative AI · Agentic AI · ML</span>
              </p>
              <h1 className="hero__title">
                <span>The <em>best-fit</em> AI</span>{' '}
                <span>for every business problem.</span>
              </h1>
              <p className="hero__sub">We find the AI that fits each business problem, build it with your teams, and prove it in your P&amp;L.</p>
            </div>

            <div className="frame" id="frame">
              <div className="stage" id="stage" dangerouslySetInnerHTML={{ __html: sceneMarkup() }} />
              <div className="frame__shade" aria-hidden="true" />
              <p className="frame__caption" id="caption">
                Scroll
                <span className="frame__cue" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" /></svg></span>
              </p>
            </div>
            <div className="frame__ring" id="ring" aria-hidden="true" />

            <div className="chapters" id="chapters">
              <article className="chapter">
                <p className="chapter__eyebrow"><span>01</span>Insights</p>
                <h2>Every problem,<br /><em>illuminated.</em></h2>
                <p>We start with your P&amp;L, not a model. Strategy and audit work that maps where AI moves a real number, and where it won&apos;t.</p>
                <ul className="chips"><li>AI strategy</li><li>Use-case roadmap</li><li>AI audit</li><li>Governance</li></ul>
              </article>
              <article className="chapter">
                <p className="chapter__eyebrow"><span>02</span>Fit</p>
                <h2>The best-fit answer,<br /><em>not the flashiest.</em></h2>
                <p>ML, GenAI, agents, or a mix. We design the solution that fits the problem, and prototype it on your real data in weeks.</p>
                <ul className="chips"><li>Solution design</li><li>Rapid prototyping</li><li>Agentic Storefront</li></ul>
              </article>
              <article className="chapter">
                <p className="chapter__eyebrow"><span>03</span>Action</p>
                <h2>Built with your team.<br /><em>Run in production.</em></h2>
                <p>We co-deliver alongside your teams, take agents live, and train everyone from the C-suite to the field so it sticks.</p>
                <ul className="chips"><li>Co-delivery</li><li>Implementation</li><li>AI-led operate</li><li>Enterprise AI training</li></ul>
              </article>
              <article className="chapter">
                <p className="chapter__eyebrow"><span>04</span>Value</p>
                <h2>Measured where<br /><em>it matters.</em></h2>
                <ul className="metrics">
                  <li><b data-count="4" data-prefix="+" data-suffix="%">+4%</b><span>topline growth<br />AI-led sales planning</span></li>
                  <li><b data-count="3" data-prefix="+" data-suffix="%">+3%</b><span>margin unlock<br />dynamic pricing</span></li>
                  <li><b data-count="40" data-suffix="%">40%</b><span>efficiency gain<br />multi-agent hubs</span></li>
                  <li><b data-count="20" data-suffix="%">20%</b><span>productivity gain<br />health index &amp; action board</span></li>
                </ul>
              </article>
            </div>

            <ol className="progress" id="progress" aria-hidden="true">
              <li>01</li><li>02</li><li>03</li><li>04</li>
            </ol>
          </div>
        </section>

        <section className="section" id="results">
          <div className="wrap">
            <header className="section__head">
              <p className="eyebrow">The puzzle, solved</p>
              <h2>Eight problems we solve<br /><em>again and again.</em></h2>
            </header>
            <ol className="pairs">
              {PAIRS.map(([problem, solution, tag, result]) => (
                <li key={problem}>
                  <span className="pairs__p">{problem}</span>
                  <span className="pairs__s">{solution}</span>
                  <span className="tag">{tag}</span>
                  <b>{result}</b>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section section--tight section--tint" aria-label="Track record">
          <div className="wrap">
            <ul className="stats">
              <li><b data-count="21" data-suffix="+">21+</b><span>years of AI leadership</span></li>
              <li><b data-count="15" data-suffix="+">15+</b><span>large-scale AI programmes</span></li>
              <li><b data-count="50" data-suffix="+">50+</b><span>business problems solved</span></li>
              <li><b data-count="9" data-suffix="+">9+</b><span>sectors</span></li>
            </ul>
            <p className="proof__line">
              Led by the team behind <strong>HDFC Bank&apos;s analytics function</strong>, <strong>Deloitte India&apos;s AI practice</strong> and <strong>Deloitte South Asia&apos;s Agentic AI CoE</strong>.
            </p>
          </div>
        </section>

        <section className="section" id="work">
          <div className="wrap">
            <header className="section__head section__head--row">
              <div>
                <p className="eyebrow">Selected work</p>
                <h2>From roadmap<br /><em>to production.</em></h2>
              </div>
              <div className="work__nav">
                <button className="round" data-dir="-1" aria-label="Previous case studies"><svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6" /></svg></button>
                <button className="round" data-dir="1" aria-label="Next case studies"><svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" /></svg></button>
              </div>
            </header>
          </div>
          <div className="cases" id="cases" tabIndex={0} aria-label="Case studies">
            {CASES.map(([tag, client, title, text]) => (
              <article className="case" key={title}>
                <span className="tag">{tag}</span>
                <p className="case__client">{client}</p>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section section--tint" id="engage">
          <div className="wrap">
            <header className="section__head">
              <p className="eyebrow">How we engage</p>
              <h2>Turn us up<br /><em>as far as you need.</em></h2>
              <p className="section__lede">Six ways to work together, from a strategy sprint to full ownership of the outcome.</p>
            </header>
            <div className="dimmer" id="dimmer">
              <div className="dimmer__track"><span className="dimmer__fill" /></div>
              <div className="dimmer__stops" role="tablist" aria-label="Engagement models">
                {MODELS.map((m) => <button key={m} role="tab">{m}</button>)}
              </div>
              <div className="dimmer__ends"><span>You lead, we advise</span><span>We own the outcome</span></div>
              <p className="dimmer__desc" id="dimmer-desc" role="tabpanel" aria-live="polite" />
            </div>
          </div>
        </section>

        <section className="section" id="team">
          <div className="wrap">
            <header className="section__head">
              <p className="eyebrow">Leadership</p>
              <h2>Two decades of turning<br /><em>data into decisions.</em></h2>
            </header>
            <div className="people">
              <article className="person">
                <img src="/img/moumita.webp" alt="Moumita Sarker" width="288" height="293" loading="lazy" />
                <div>
                  <h3>Moumita Sarker</h3>
                  <p className="person__role">Founder &amp; CEO</p>
                  <ul>
                    <li>21 years of AI leadership, from founding HDFC Bank&apos;s analytics function to heading the Agentic AI CoE at Deloitte South Asia.</li>
                    <li>Led Deloitte India&apos;s AI practice, co-founded Cartesian Consulting and held AI strategy roles at J.P. Morgan.</li>
                  </ul>
                </div>
              </article>
              <article className="person">
                <img src="/img/kaushik.webp" alt="Kaushik Agate" width="271" height="281" loading="lazy" />
                <div>
                  <h3>Kaushik Agate</h3>
                  <p className="person__role">Business Head</p>
                  <ul>
                    <li>10+ years across data and analytics, covering the full AI lifecycle from problem framing to production.</li>
                    <li>Specialises in AI solution design: turning complex business problems into robust, scalable AI architectures.</li>
                  </ul>
                </div>
              </article>
            </div>
            <p className="team__more">+ a team of analysts and AI engineers across Mumbai &amp; Bengaluru</p>
          </div>
        </section>

        <section className="section contact" id="contact">
          <div className="contact__glow" aria-hidden="true" />
          <div className="wrap contact__inner">
            <div>
              <p className="eyebrow">Start the conversation</p>
              <h2>Bring us your<br /><em>hardest problem.</em></h2>
              <p className="section__lede">Tell us what you&apos;re trying to move. We&apos;ll come back with a point of view on the best-fit AI, not a sales deck.</p>
              <ul className="contact__direct">
                <li><a href="mailto:moumita.sarker@illuminaticonsulting.ai">moumita.sarker@illuminaticonsulting.ai</a></li>
                <li><a href="mailto:kaushik.agate@illuminaticonsulting.ai">kaushik.agate@illuminaticonsulting.ai</a></li>
                <li>Remote-first · Mumbai · Bengaluru</li>
              </ul>
            </div>
            <form className="form" id="contact-form" noValidate>
              <div className="form__row">
                <label>Name<input name="name" autoComplete="name" required /></label>
                <label>Work email<input name="email" type="email" autoComplete="email" required /></label>
              </div>
              <label>Company<input name="company" autoComplete="organization" /></label>
              <label>What problem should we look at?<textarea name="message" rows={4} required /></label>
              <button className="btn btn--gold" type="submit">Send <span aria-hidden="true">→</span></button>
              <p className="form__status" role="status" aria-live="polite" />
            </form>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="wrap footer__inner">
          <a className="nav__brand" href="#top">
            <img src="/img/logowhite.png" alt="" width="26" height="24" />
            <span>Illuminati <small>Consulting</small></span>
          </a>
          <p className="footer__tag">Insights · Action · Value</p>
          <nav className="footer__links" aria-label="Footer">
            {LINKS.map(([href, label]) => <a key={href} href={href}>{label}</a>)}
            <a href="https://www.linkedin.com/company/illuminati-consulting" target="_blank" rel="noopener">LinkedIn</a>
          </nav>
          <p className="footer__legal">© {new Date().getFullYear()} Illuminati Consulting</p>
        </div>
      </footer>

      <div className="grain" aria-hidden="true" />
      <PageEffects />
    </>
  );
}
