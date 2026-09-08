import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  Droplets,
  Leaf,
  Mail,
  MapPin,
  Menu,
  PackageCheck,
  Phone,
  Scissors,
  Send,
  ShieldCheck,
  Sparkles,
  Sprout,
  Snowflake,
  Truck,
  Wind,
  ListChecks,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const storage = "/manus-storage/";

const navItems = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Products", href: "#products" },
  { label: "Process", href: "#process" },
  { label: "Contact", href: "#contact" },
];

const categories = [
  {
    number: "01",
    name: "Dehydrated White Onion",
    short: "Clean, bright, naturally sweet.",
    variants: ["Flakes", "Chopped", "Minced", "Granules", "Powder"],
    tone: "saffron",
    visual: "rings",
  },
  {
    number: "02",
    name: "Dehydrated Pink Onion",
    short: "A rosy lift for modern kitchens.",
    variants: ["Flakes", "Chopped", "Minced", "Granules", "Powder"],
    tone: "rose",
    visual: "petals",
  },
  {
    number: "03",
    name: "Dehydrated Red Onion",
    short: "Deep colour. Full-bodied aroma.",
    variants: ["Flakes", "Chopped", "Minced", "Granules", "Powder"],
    tone: "wine",
    visual: "red-rings",
  },
  {
    number: "04",
    name: "Dehydrated Garlic",
    short: "Pungent, warm and reliably consistent.",
    variants: ["Flakes", "Chopped", "Minced", "Granules", "Powder"],
    tone: "cream",
    visual: "cloves",
  },
  {
    number: "05",
    name: "Fried Onion & Garlic",
    short: "Golden crunch with a kitchen-ready finish.",
    variants: ["Fried Onion", "Fried Garlic", "Crisps", "Toppings"],
    tone: "amber",
    visual: "crunch",
  },
  {
    number: "06",
    name: "Spices, Herbs & Seasonings",
    short: "The finishing note that makes a dish yours.",
    variants: ["Blends", "Herbs", "Chilli", "Turmeric", "Custom Mixes"],
    tone: "sage",
    visual: "spices",
  },
];

const productDepth = [
  { name: "White Onion", detail: "Sweet, versatile and clean", visual: "rings", items: ["White Onion Flakes", "White Onion Chopped", "White Onion Minced", "White Onion Granules", "White Onion Powder"] },
  { name: "Pink Onion", detail: "Rosy, aromatic and nuanced", visual: "petals", items: ["Pink Onion Flakes", "Pink Onion Chopped", "Pink Onion Minced", "Pink Onion Granules", "Pink Onion Powder"] },
  { name: "Red Onion", detail: "Full colour, full flavour", visual: "red-rings", items: ["Red Onion Flakes", "Red Onion Chopped", "Red Onion Minced", "Red Onion Granules", "Red Onion Powder"] },
  { name: "Garlic", detail: "Pungent, warm and dependable", visual: "cloves", items: ["Garlic Flakes", "Garlic Chopped", "Garlic Minced", "Garlic Granules", "Garlic Powder"] },
  { name: "Fried Range", detail: "Golden crunch, ready to finish", visual: "crunch", items: ["Fried Onion", "Fried Garlic", "Onion Crisps", "Garlic Crisps", "Ready-to-use Toppings"] },
  { name: "Spices + Herbs", detail: "Blends made for your brief", visual: "spices", items: ["Chilli Powder", "Turmeric", "Coriander", "Herb Blends", "Custom Seasonings"] },
];

const processSteps = [
  ["01", "Arrival of Raw Material", "Freshly harvested onions sourced directly from Mahuva farms"],
  ["02", "Grading", "Inspected for size, quality and defects before processing"],
  ["03", "Washing", "Multi-stage cleaning removes impurities, ensures hygiene"],
  ["04", "Slicing", "Uniformly sliced for consistent drying and product quality"],
  ["05", "Drying", "Controlled temperature and airflow preserves colour and nutrients"],
  ["06", "Cooling", "Air-conditioned conveyor room maintains integrity post-drying"],
  ["07", "Separation & Sorting", "Huller machine removes skins; defective pieces sorted out"],
  ["08", "Packaging & Storage", "Moisture-proof packing in temperature-controlled storage"],
];
const processIcons: LucideIcon[] = [Sprout, ClipboardCheck, Droplets, Scissors, Wind, Snowflake, ListChecks, PackageCheck];
const pillars: { icon: LucideIcon; title: string; copy: string }[] = [
  { icon: Leaf, title: "Premium raw material", copy: "We source close to the crop, selecting for aroma, maturity and dependable yield." },
  { icon: ShieldCheck, title: "Trusted quality", copy: "Internationally minded controls from first inspection through final packed lot." },
  { icon: Truck, title: "Reliable delivery", copy: "Clear communication and production planning that keeps your line moving." },
  { icon: CircleDollarSign, title: "Competitive by design", copy: "Process discipline gives you a better ingredient without the premium waste." },
];

const particleDots = [
  { left: "7%", top: "23%", size: 5, color: "gold" },
  { left: "13%", top: "71%", size: 3, color: "red" },
  { left: "29%", top: "15%", size: 4, color: "gold" },
  { left: "36%", top: "79%", size: 6, color: "sage" },
  { left: "58%", top: "19%", size: 3, color: "red" },
  { left: "69%", top: "76%", size: 4, color: "gold" },
  { left: "84%", top: "18%", size: 6, color: "sage" },
  { left: "92%", top: "62%", size: 3, color: "red" },
  { left: "78%", top: "88%", size: 5, color: "gold" },
];

function Reveal({ children, className = "", delay = 0, style }: { children: ReactNode; className?: string; delay?: number; style?: CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal ${visible ? "is-visible" : ""} ${className}`} style={{ "--reveal-delay": `${delay}ms`, ...style } as CSSProperties}>
      {children}
    </div>
  );
}

function Mark({ compact = false }: { compact?: boolean }) {
  return (
    <a className={`brand-mark ${compact ? "brand-mark--compact" : ""}`} href="#home" aria-label="Vorix Food Ingredients home">
      <span className="brand-mark__symbol" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <span className="brand-mark__words">
        <strong>VORIX</strong>
        {!compact && <small>Food Ingredients</small>}
      </span>
    </a>
  );
}

function ProductVisual({ type }: { type: string }) {
  const image = {
    rings: `${storage}vorix-white-onion-optimized_25fc991d.webp`,
    "red-rings": `${storage}vorix-red-onion-optimized_da315312.webp`,
    petals: `${storage}vorix-pink-onion-optimized_012ed84b.webp`,
    cloves: `${storage}vorix-garlic-optimized_71e1019f.webp`,
    crunch: `${storage}vorix-fried-range-optimized_b8cb7cbe.webp`,
    spices: `${storage}vorix-spices-herbs-optimized_e2b3e887.webp`,
  }[type] ?? `${storage}vorix-red-onion-optimized_da315312.webp`;
  return (
    <div className={`product-visual product-visual--${type}`} aria-hidden="true">
      <ImageWithLoader src={image} alt="" loading="lazy" />
    </div>
  );
}

function ImageWithLoader({ src, alt, loading, fetchPriority, className = "" }: { src: string; alt: string; loading?: "lazy" | "eager"; fetchPriority?: "high" | "low" | "auto"; className?: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <span className={`image-loader ${loaded ? "image-loader--loaded" : ""} ${className}`}>
      <span className="image-loader__shimmer" aria-hidden="true" />
      <img src={src} alt={alt} loading={loading} fetchPriority={fetchPriority} onLoad={() => setLoaded(true)} />
    </span>
  );
}

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const processRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 36);
      const process = processRef.current;
      if (process) {
        const rect = process.getBoundingClientRect();
        const progress = Math.min(1, Math.max(0, (window.innerHeight * 0.78 - rect.top) / (rect.height * 0.78)));
        process.style.setProperty("--process-progress", `${progress * 100}%`);
      }
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="site-shell">
      <header className={`site-nav ${scrolled ? "site-nav--scrolled" : ""}`}>
        <div className="nav-inner">
          <Mark />
          <nav className={`nav-links ${mobileOpen ? "nav-links--open" : ""}`} aria-label="Primary navigation">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} onClick={closeMobile}>{item.label}</a>
            ))}
            <a className="nav-inquiry" href="#contact" onClick={closeMobile}>Start an inquiry <ArrowUpRight size={14} /></a>
          </nav>
          <button className="menu-toggle" onClick={() => setMobileOpen((open) => !open)} aria-label={mobileOpen ? "Close menu" : "Open menu"} aria-expanded={mobileOpen}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero__grain" />
          {particleDots.map((dot, index) => (
            <span key={index} className={`particle particle--${dot.color}`} style={{ left: dot.left, top: dot.top, width: dot.size, height: dot.size, animationDelay: `${index * 170}ms` }} />
          ))}
          <div className="hero__rings hero__rings--one" />
          <div className="hero__rings hero__rings--two" />
          <div className="hero__inner container">
            <div className="hero__copy">
              <div className="eyebrow hero-eyebrow"><span className="eyebrow-line" /> Mahuva, Gujarat · Est. 2020</div>
              <h1>
                {"The quality like never before".split(" ").map((word, index) => (
                  <span className="hero-word" key={`${word}-${index}`} style={{ animationDelay: `${index * 70 + 110}ms` }}>{word}</span>
                ))}
              </h1>
              <p className="hero__lede">Premium dehydrated vegetables, spices and seasonings — made close to the crop, ready for the world.</p>
              <div className="hero__actions">
                <a className="button button--gold" href="#products">Explore products <ArrowDownRight size={16} /></a>
                <a className="text-link text-link--cream" href="#about">Why Vorix <ArrowUpRight size={15} /></a>
              </div>
              <div className="hero__meta">
                <span><strong>01</strong> rooted in India</span>
                <span><strong>02</strong> built for export</span>
              </div>
            </div>
            <div className="hero__visual" aria-label="Onion, dehydrated garlic and spice ingredients">
              <div className="hero__visual-caption"><span>Ingredient studies</span><span>Vol. 01 — 2026</span></div>
              <div className="hero__image-wrap">
                <div className="hero__image-aura" />
                <ImageWithLoader src={`${storage}vorix-hero-ingredients-hq_97cc58f7.webp`} alt="Whole onion, dehydrated garlic flakes, chilli and onion rings" fetchPriority="high" className="image-loader--hero" />
              </div>
              <div className="hero__stamp"><span>Pure</span><b>+</b><span>Precise</span></div>
              <div className="hero__visual-index">01 / <em>03</em></div>
            </div>
          </div>
          <div className="hero__scroll"><span>Scroll to explore</span><span className="hero__scroll-line" /></div>
        </section>

        <section className="about-strip section-light" id="about">
          <div className="container about-grid">
            <Reveal className="about-quote">
              <div className="section-kicker">A better way to preserve flavour</div>
              <p>“Quality is not a department.<br /><em>It is the power on our side.</em>”</p>
              <div className="about-quote__rule" />
              <span>— Vorix Food Ingredients</span>
            </Reveal>
            <Reveal className="about-story" delay={100}>
              <div className="about-story__stat"><strong>2020</strong><span>Founded in Mahuva, Gujarat</span></div>
              <div className="about-story__body">
                <h2>Born where the onion<br /><em>knows its way around.</em></h2>
                <p>Vorix Food Ingredients brings the aromatic richness of Saurashtra into a modern, dependable ingredient supply chain. We work with the character of each crop — then use precise dehydration, sorting and packing to make that character travel further.</p>
                <p>From our home in Mahuva, we serve food makers who need consistency without compromise.</p>
                <a className="text-link" href="#contact">Meet the team <ArrowUpRight size={15} /></a>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="products section-light" id="products">
          <div className="container">
            <Reveal className="section-heading-row">
              <div>
                <div className="section-kicker">The ingredient library</div>
                <h2>What we <em>make.</em></h2>
              </div>
              <p>Six families of flavour-forward ingredients, designed for the way modern kitchens actually work.</p>
            </Reveal>
            <div className="category-grid">
              {categories.map((category, index) => (
                <Reveal key={category.name} delay={index * 55} className={`category-card category-card--${category.tone}`}>
                  <div className="category-card__top"><span>{category.number}</span><ArrowUpRight size={17} /></div>
                  <ProductVisual type={category.visual} />
                  <div className="category-card__content">
                    <h3>{category.name}</h3>
                    <p>{category.short}</p>
                    <div className="variant-row">{category.variants.map((variant) => <span key={variant}>{variant}</span>)}</div>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal className="product-depth" delay={100}>
              <div className="product-depth__head">
                <div>
                  <div className="section-kicker">Go deeper</div>
                  <h3>Specify your <em>format.</em></h3>
                </div>
                <span className="product-depth__count">0{activeProduct + 1} <i>/ 06</i></span>
              </div>
              <div className="depth-tabs" role="tablist" aria-label="Product categories">
                {productDepth.map((product, index) => (
                  <button key={product.name} className={activeProduct === index ? "is-active" : ""} onClick={() => setActiveProduct(index)} role="tab" aria-selected={activeProduct === index}>
                    <span>{product.name}</span><ChevronDown size={14} />
                  </button>
                ))}
              </div>
              <div className="depth-catalog" role="tabpanel">
                <div className="depth-hero-card">
                  <ProductVisual type={productDepth[activeProduct].visual} />
                  <div className="depth-hero-card__shade" />
                  <div className="depth-hero-card__copy">
                    <span className="depth-panel__eyebrow">{productDepth[activeProduct].detail}</span>
                    <h4>{productDepth[activeProduct].name}<br /><em>in every cut.</em></h4>
                    <span className="depth-hero-card__note">Product range · specification-led</span>
                  </div>
                </div>
                <div className="format-grid">
                  {productDepth[activeProduct].items.map((item, index) => (
                    <div className="format-card" key={item}>
                      <div className="format-card__placeholder"><span>{String(index + 1).padStart(2, "0")}</span><small>Image coming soon</small></div>
                      <span className="format-card__eyebrow">{productDepth[activeProduct].name}</span>
                      <h5>{item.replace(`${productDepth[activeProduct].name} `, "")}</h5>
                      <p>Cut and packed to your production brief.</p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section ref={processRef} className="process section-dark" id="process">
          <div className="process__image" />
          <div className="process__overlay" />
          <div className="container process__inner">
            <Reveal className="process__heading">
              <div className="section-kicker section-kicker--light">Our 8-Step Process</div>
              <h2><span className="process-title-mobile">Farm to Flake</span><span className="process-title-desktop">Farm to flake —<br /><em>our process.</em></span></h2>
              <p>Close attention at every stage. No shortcuts between the soil and your specification.</p>
              <a className="text-link text-link--cream" href="#contact">Talk to production <ArrowUpRight size={15} /></a>
            </Reveal>
            <div className="process-mobile-timeline">
              <div className="process__spine" aria-hidden="true" />
              {processSteps.map(([number, name, description], index) => (
                <Reveal key={number} delay={index * 65} className="process-step">
                  <span className="process-step__node">{number}</span>
                  <div className="process-step__card"><div className="process-step__icon-wrap"><span className="process-step__number">{number}</span>{(() => { const Icon = processIcons[index]; return <Icon size={22} strokeWidth={1.5} aria-hidden="true" />; })()}</div><div><h3>{name}</h3><p>{description}</p></div></div>
                </Reveal>
              ))}
            </div>
            <div className="process-radial" aria-label="Our eight step process diagram">
              <svg className="process-radial__lines" viewBox="0 0 640 640" aria-hidden="true"><circle className="process-radial__orbit" cx="320" cy="320" r="228" /><path className="process-radial__arc" d="M320 92 A228 228 0 1 1 158.8 158.8" /></svg>
              <div className="process-radial__center"><span>Our</span><strong>Process</strong><i>08 steps</i></div>
              {processSteps.map(([number, name, description], index) => (
                <Reveal key={number} delay={index * 90} className="process-node-wrap" style={{ "--node-x": `${Math.sin(index * Math.PI / 4) * 228}px`, "--node-y": `${-Math.cos(index * Math.PI / 4) * 228}px` } as CSSProperties}>
                  <div className="process-node"><span className="process-node__number">{number}</span><span className="process-node__name">{(() => { const Icon = processIcons[index]; return <Icon size={16} strokeWidth={1.5} aria-hidden="true" />; })()}{name}</span><span className="process-node__tooltip">{description}</span></div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="why section-light">
          <div className="container why-grid">
            <Reveal className="why-intro">
              <div className="section-kicker">The Vorix advantage</div>
              <h2>A small distance<br />from the <em>source.</em></h2>
              <p>And a very clear line between what you ask for and what you receive.</p>
              <div className="why-note"><Sparkles size={17} /><span>Quality — the power on our side</span></div>
            </Reveal>
            <div className="pillar-grid">
              {pillars.map(({ icon: Icon, title, copy }, index) => (
                <Reveal key={title} delay={index * 70} className="pillar-card">
                  <Icon size={22} strokeWidth={1.5} />
                  <span className="pillar-card__index">0{index + 1}</span>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="retail-strip section-dark">
          <div className="retail-strip__marquee" aria-hidden="true">{Array.from({ length: 6 }, (_, index) => <span key={index}>made for real kitchens</span>)}</div>
          <div className="container retail-strip__inner">
            <div>
              <div className="section-kicker section-kicker--light">From our house to yours</div>
              <h2>Good ingredients<br /><em>make good brands.</em></h2>
            </div>
            <div className="retail-copy"><p>Our retail labels, Pinch Spices and Just Healthy, are already trusted by customers across Amazon and Flipkart.</p><div className="retail-badges"><span>PINCH<br /><small>SPICES</small></span><span>JUST<br /><small>HEALTHY</small></span><span className="market-badge market-badge--amazon"><strong>amazon</strong><i /></span><span className="market-badge market-badge--flip"><b>F</b><strong>Flipkart</strong></span></div></div>
          </div>
        </section>

        <section className="contact section-light" id="contact">
          <div className="container contact-grid">
            <Reveal className="contact-intro">
              <div className="section-kicker">Let’s make something consistent</div>
              <h2>Bring us<br /><em>your brief.</em></h2>
              <p>Tell us what you’re making, where you’re going and what the ingredient needs to do. We’ll take it from there.</p>
              <div className="contact-details">
                <a href="mailto:hussain@nexusfoods.co.in"><Mail size={16} /> <span><small>Domestic enquiries</small>hussain@nexusfoods.co.in</span></a>
                <a href="mailto:hasan@nexusfoods.co.in"><Send size={16} /> <span><small>Export enquiries</small>hasan@nexusfoods.co.in</span></a>
                <a href="tel:+919484699990"><Phone size={16} /> <span><small>Call us</small>+91 94846 99990</span></a>
                <div><MapPin size={16} /> <span><small>Find us</small>378–379, Ramkrupa Industrial Park<br />Mahuva – 364290, Gujarat</span></div>
              </div>
            </Reveal>
            <Reveal className="inquiry-card" delay={120}>
              <div className="inquiry-card__top"><span>INQUIRY / 01</span><Clock3 size={17} /></div>
              {submitted ? (
                <div className="form-success"><div className="form-success__icon"><Check size={22} /></div><h3>Brief received.</h3><p>Thank you for reaching out. Our team will get back to you shortly.</p><button className="text-link" onClick={() => setSubmitted(false)}>Send another inquiry <ArrowUpRight size={15} /></button></div>
              ) : (
                <form onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}>
                  <div className="field-row"><label><span>Name</span><input required name="name" placeholder="Your name" /></label><label><span>Company</span><input required name="company" placeholder="Company name" /></label></div>
                  <div className="field-row"><label><span>Email</span><input required type="email" name="email" placeholder="you@company.com" /></label><label><span>Phone</span><input name="phone" placeholder="+91" /></label></div>
                  <label><span>Inquiry type</span><select name="inquiry"><option value="domestic">Domestic</option><option value="export">Export</option></select></label>
                  <label><span>Message</span><textarea required name="message" placeholder="Tell us about your ingredient brief..." rows={4} /></label>
                  <button className="button button--dark" type="submit">Send inquiry <ArrowUpRight size={16} /></button>
                  <p className="form-note">We usually reply within one working day.</p>
                </form>
              )}
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-top">
          <div><Mark /><p>Premium dehydrated ingredients<br />from the heart of Gujarat.</p></div>
          <div className="footer-links"><span className="footer-label">Explore</span>{navItems.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}</div>
          <div className="footer-social"><span className="footer-label">Follow the ingredient trail</span><a href="https://instagram.com/vorixfoodingredients" target="_blank" rel="noreferrer">@vorixfoodingredients <ArrowUpRight size={14} /></a></div>
        </div>
        <div className="container footer-bottom"><span>© 2026 Vorix Food Ingredients Pvt Ltd</span><span>Quality — the power on our side</span><span>Mahuva, Gujarat / India</span></div>
      </footer>
    </div>
  );
}
