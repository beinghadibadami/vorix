import { content } from "@/content";
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

const processIcons: LucideIcon[] = [Sprout, ClipboardCheck, Droplets, Scissors, Wind, Snowflake, ListChecks, PackageCheck];

const { categories, productDepth, processSteps, pillars } = content;
const navItems = content.navigation;
const pillarIcons = [Leaf, ShieldCheck, Truck, CircleDollarSign];

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
    <a className={`brand-mark ${compact ? "brand-mark--compact" : ""}`} href="/" aria-label="Vorix Food Ingredients home">
      <span className="brand-mark__symbol" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <span className="brand-mark__words">
        <strong>{content.copy.brand.textVORIX}</strong>
        {!compact && <small>{content.copy.brand.textFoodIngredients}</small>}
      </span>
    </a>
  );
}

function ProductVisual({ type, image }: { type: string; image: { path: string; alt: string } }) {
  const src = image.path;
  const srcSet = src.startsWith("/assets/vorix-showcase-")
    ? src.replace(".webp", "-640.webp") + " 640w, " + src.replace(".webp", "-960.webp") + " 960w, " + src + " 1448w"
    : undefined;
  return <div className={`product-visual product-visual--${type}`} aria-hidden={image.alt ? undefined : true}>
    <ImageWithLoader src={src} srcSet={srcSet} sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw" alt={image.alt} loading="lazy" />
  </div>;
}
function FormatVisual({ item }: { item: typeof content.productDepth[number]['items'][number] }) {
  return <div className="format-card__visual"><ImageWithLoader src={item.image.path} alt={item.image.alt} loading="lazy" /></div>;
}

function ImageWithLoader({ src, srcSet, sizes, alt, loading, fetchPriority, className = "" }: { src: string; srcSet?: string; sizes?: string; alt: string; loading?: "lazy" | "eager"; fetchPriority?: "high" | "low" | "auto"; className?: string }) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  // Prerendered images may finish loading before hydration, so onLoad never fires.
  useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true);
  }, []);
  return (
    <span className={`image-loader ${loaded ? "image-loader--loaded" : ""} ${className}`}>
      <span className="image-loader__shimmer" aria-hidden="true" />
      <img ref={imgRef} src={src} srcSet={srcSet} sizes={sizes} alt={alt} loading={loading} fetchPriority={fetchPriority} decoding="async" onLoad={() => setLoaded(true)} />
    </span>
  );
}

export default function Home({ page = "home" }: { page?: "home" | "about" | "products" | "faq" | "blog" }) {
  const isHome = page === "home";
  const isAbout = page === "about";
  const isProducts = page === "products";
  const isFaq = page === "faq";
  const isBlog = page === "blog";
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
      <header className={`site-nav ${scrolled ? "site-nav--scrolled" : ""} ${!isHome ? "site-nav--light" : ""}`}>
        <div className="nav-inner">
          <Mark />
          <nav className={`nav-links ${mobileOpen ? "nav-links--open" : ""}`} aria-label="Primary navigation">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} onClick={closeMobile}>{item.label}</a>
            ))}
            <a className="nav-inquiry" href="/#contact" onClick={closeMobile}>{content.copy.navigation.textStartAnInquiry}<ArrowUpRight size={14} /></a>
          </nav>
          <button className="menu-toggle" onClick={() => setMobileOpen((open) => !open)} aria-label={mobileOpen ? "Close menu" : "Open menu"} aria-expanded={mobileOpen}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      <main>
        {isHome && <section className="hero" id="home">
          <div className="hero__grain" />
          {particleDots.map((dot, index) => (
            <span key={index} className={`particle particle--${dot.color}`} style={{ left: dot.left, top: dot.top, width: dot.size, height: dot.size, animationDelay: `${index * 170}ms` }} />
          ))}
          <div className="hero__rings hero__rings--one" />
          <div className="hero__rings hero__rings--two" />
          <div className="hero__inner container">
            <div className="hero__copy">
              <div className="eyebrow hero-eyebrow"><span className="eyebrow-line" />{content.copy.hero.textMahuvaGujaratEst2020}</div>
              <h1>
                {content.copy.hero.headingQualityLikeNeverBefore.split(" ").map((word, index) => (
                  <span className="hero-word" key={`${word}-${index}`} style={{ animationDelay: `${index * 70 + 110}ms` }}>{word}</span>
                ))}
              </h1>
              <p className="hero__lede">{content.copy.hero.textPremiumDehydratedVegetablesSpicesAndSeasonings}</p>
              <div className="hero__actions">
                <a className="button button--gold" href="/products">{content.copy.hero.textExploreProducts}<ArrowDownRight size={16} /></a>
                <a className="text-link text-link--cream" href="/about">{content.copy.hero.textWhyVorix}<ArrowUpRight size={15} /></a>
              </div>
              <div className="hero__meta">
                <span><strong>{content.copy.hero.text01}</strong>{content.copy.hero.textRootedInIndia}</span>
                <span><strong>{content.copy.hero.text02}</strong>{content.copy.hero.textBuiltForExport}</span>
              </div>
            </div>
            <div className="hero__visual" aria-label="Onion, dehydrated garlic and spice ingredients">
              <div className="hero__image-wrap">
                <div className="hero__image-aura" />
                <ImageWithLoader src={content.heroImage.path} alt={content.heroImage.alt} fetchPriority="high" className="image-loader--hero" />
              </div>
              <div className="hero__stamp"><span>{content.copy.hero.textPure}</span><b>{content.copy.hero.textText}</b><span>{content.copy.hero.textPrecise}</span></div>
            </div>
          </div>
          <div className="hero__scroll"><span>{content.copy.hero.textScrollToExplore}</span><span className="hero__scroll-line" /></div>
        </section>}

        {(isHome || isAbout) && <section className="about-strip section-light" id="about">
          <div className="container about-grid">
            <Reveal className="about-quote">
              <div className="section-kicker">{content.copy.about.textABetterWayToPreserveFlavour}</div>
              <p>{content.copy.about.textQualityIsNotADepartment}<br /><em>{content.copy.about.textItIsThePowerOnOur}</em>{content.copy.about.textText}</p>
              <div className="about-quote__rule" />
              <span>{content.copy.about.textVorixFoodIngredients}</span>
            </Reveal>
            <Reveal className="about-story" delay={100}>
              <div className="about-story__stat"><strong>{content.copy.about.text2020}</strong><span>{content.copy.about.textFoundedInMahuvaGujarat}</span></div>
              <div className="about-story__body">
                <h2>{content.copy.about.textBornWhereTheOnion}<br /><em>{content.copy.about.textKnowsItsWayAround}</em></h2>
                <p>{content.copy.about.textVorixFoodIngredientsBringsTheAromatic}</p>
                <p>{content.copy.about.textFromOurHomeInMahuvaWe}</p>
                <a className="text-link" href="/#contact">{content.copy.about.textMeetTheTeam}<ArrowUpRight size={15} /></a>
              </div>
            </Reveal>
          </div>
        </section>}

        {(isHome || isProducts) && <section className="products section-light" id="products">
          <div className="container">
            <Reveal className="section-heading-row">
              <div>
                <div className="section-kicker">{content.copy.products.textTheIngredientLibrary}</div>
                <h2>{content.copy.products.textWhatWe}<em>{content.copy.products.textMake}</em></h2>
              </div>
              <p>{content.copy.products.textSixFamiliesOfFlavourForwardIngredients}</p>
            </Reveal>
            <div className="category-grid">
              {categories.map((category, index) => (
                <Reveal key={category.name} delay={index * 55} className={`category-card category-card--${category.tone}`}>
                  <div className="category-card__top"><span>{category.number}</span><ArrowUpRight size={17} /></div>
                  <ProductVisual type={category.visual} image={category.image} />
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
                  <div className="section-kicker">{content.copy.products.textGoDeeper}</div>
                  <h3>{content.copy.products.textSpecifyYour}<em>{content.copy.products.textFormat}</em></h3>
                </div>
                <span className="product-depth__count">
                  {String(activeProduct + 1).padStart(2, "0")} <i>{content.copy.products.textText}{String(productDepth.length).padStart(2, "0")}</i>
                </span>
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
                  <ProductVisual type={productDepth[activeProduct].visual} image={productDepth[activeProduct].image} />
                  <div className="depth-hero-card__shade" />
                  <div className="depth-hero-card__copy">
                    <span className="depth-panel__eyebrow">{productDepth[activeProduct].detail}</span>
                    <h4>{productDepth[activeProduct].name}<br /><em>{content.copy.products.textInEveryCut}</em></h4>
                    <span className="depth-hero-card__note">{content.copy.products.textProductRangeSpecificationLed}</span>
                  </div>
                </div>
                <div className="format-grid">
                  {productDepth[activeProduct].items.map((item) => (
                    <div className="format-card" key={item._key}>
                      <FormatVisual item={item} />
                      <span className="format-card__eyebrow">{productDepth[activeProduct].name}</span>
                      <h5>{item.name.replace(`${productDepth[activeProduct].name} `, "")}</h5>
                      <p>{content.copy.products.textCutAndPackedToYourProduction}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>}

        {isHome && <section ref={processRef} className="process section-dark" id="process">
          <div className="process__image" style={content.processImage.path === "/assets/vorix-process-texture.webp" ? undefined : { backgroundImage: `url("${content.processImage.path}")` }} />
          <div className="process__overlay" />
          <div className="container process__inner">
            <Reveal className="process__heading">
              <div className="section-kicker section-kicker--light">{content.copy.process.textOur8StepProcess}</div>
              <h2><span className="process-title-mobile">{content.copy.process.textFarmToFlake}</span><span className="process-title-desktop">{content.copy.process.textFarmToFlakeMore}<br /><em>{content.copy.process.textOurProcess}</em></span></h2>
              <p>{content.copy.process.textCloseAttentionAtEveryStageNo}</p>
              <a className="text-link text-link--cream" href="/#contact">{content.copy.process.textTalkToProduction}<ArrowUpRight size={15} /></a>
            </Reveal>
            <div className="process-mobile-timeline">
              <div className="process__spine" aria-hidden="true" />
              {processSteps.map(({number, name, description}, index) => (
                <Reveal key={number} delay={index * 65} className="process-step">
                  <span className="process-step__node">{number}</span>
                  <div className="process-step__card"><div className="process-step__icon-wrap"><span className="process-step__number">{number}</span>{(() => { const Icon = processIcons[index]; return <Icon size={22} strokeWidth={1.5} aria-hidden="true" />; })()}</div><div><h3>{name}</h3><p>{description}</p></div></div>
                </Reveal>
              ))}
            </div>
            <div className="process-radial" aria-label="Our eight step process diagram">
              <svg className="process-radial__lines" viewBox="0 0 640 640" aria-hidden="true"><circle className="process-radial__orbit" cx="320" cy="320" r="228" /><path className="process-radial__arc" d="M320 92 A228 228 0 1 1 158.8 158.8" /></svg>
              <div className="process-radial__center"><span>{content.copy.process.textOur}</span><strong>{content.copy.process.textProcess}</strong><i>{content.copy.process.text08Steps}</i></div>
              {processSteps.map(({number, name, description}, index) => (
                <Reveal key={number} delay={index * 90} className="process-node-wrap" style={{ "--node-x": `${Math.sin(index * Math.PI / 4) * 228}px`, "--node-y": `${-Math.cos(index * Math.PI / 4) * 228}px` } as CSSProperties}>
                  <div className="process-node"><span className="process-node__number">{number}</span><span className="process-node__name">{(() => { const Icon = processIcons[index]; return <Icon size={16} strokeWidth={1.5} aria-hidden="true" />; })()}{name}</span><span className="process-node__tooltip">{description}</span></div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>}

        {(isHome || isAbout) && <section className="why section-light">
          <div className="container why-grid">
            <Reveal className="why-intro">
              <div className="section-kicker">{content.copy.why.textTheVorixAdvantage}</div>
              <h2>{content.copy.why.textASmallDistance}<br />{content.copy.why.textFromThe}<em>{content.copy.why.textSource}</em></h2>
              <p>{content.copy.why.textAndAVeryClearLineBetween}</p>
              <div className="why-note"><Sparkles size={17} /><span>{content.copy.why.textQualityThePowerOnOurSide}</span></div>
            </Reveal>
            <div className="pillar-grid">
              {pillars.map(({ title, copy }, index) => (
                <Reveal key={title} delay={index * 70} className="pillar-card">
                  {(() => { const Icon = pillarIcons[index % pillarIcons.length]; return <Icon size={22} strokeWidth={1.5} />; })()}
                  <span className="pillar-card__index">{content.copy.why.text0}{index + 1}</span>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>}

        {isHome && <section className="contact section-light" id="contact">
          <div className="container contact-grid">
            <Reveal className="contact-intro">
              <div className="section-kicker">{content.copy.contact.textLetSMakeSomethingConsistent}</div>
              <h2>{content.copy.contact.textBringUs}<br /><em>{content.copy.contact.textYourBrief}</em></h2>
              <p>{content.copy.contact.textTellUsWhatYouReMaking}</p>
              <div className="contact-details">
                <a href={`mailto:${content.contact.domesticEmail}`}><Mail size={16} /> <span><small>{content.copy.contact.textDomesticEnquiries}</small>{content.contact.domesticEmail}</span></a>
                <a href={`mailto:${content.contact.exportEmail}`}><Send size={16} /> <span><small>{content.copy.contact.textExportEnquiries}</small>{content.contact.exportEmail}</span></a>
                <a href={`tel:${content.contact.phone.replace(/\s/g, "")}`}><Phone size={16} /> <span><small>{content.copy.contact.textCallUs}</small>{content.contact.phone}</span></a>
                <div><MapPin size={16} /> <span><small>{content.copy.contact.textFindUs}</small>{content.copy.contact.text378379RamkrupaIndustrialPark}<br />{content.copy.contact.textMahuva364290Gujarat}</span></div>
              </div>
            </Reveal>
            <Reveal className="inquiry-card" delay={120}>
              <div className="inquiry-card__top"><span>{content.copy.contact.textINQUIRY01}</span><Clock3 size={17} /></div>
              {submitted ? (
                <div className="form-success"><div className="form-success__icon"><Check size={22} /></div><h3>{content.copy.contact.textBriefReceived}</h3><p>{content.copy.contact.textThankYouForReachingOutOur}</p><button className="text-link" onClick={() => setSubmitted(false)}>{content.copy.contact.textSendAnotherInquiry}<ArrowUpRight size={15} /></button></div>
              ) : (
                <form onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}>
                  <div className="field-row"><label><span>{content.copy.contact.textName}</span><input required name="name" placeholder="Your name" /></label><label><span>{content.copy.contact.textCompany}</span><input required name="company" placeholder="Company name" /></label></div>
                  <div className="field-row"><label><span>{content.copy.contact.textEmail}</span><input required type="email" name="email" placeholder="you@company.com" /></label><label><span>{content.copy.contact.textPhone}</span><input name="phone" placeholder="+91" /></label></div>
                  <label><span>{content.copy.contact.textInquiryType}</span><select name="inquiry"><option value="domestic">{content.copy.contact.textDomestic}</option><option value="export">{content.copy.contact.textExport}</option></select></label>
                  <label><span>{content.copy.contact.textMessage}</span><textarea required name="message" placeholder="Tell us about your ingredient brief..." rows={4} /></label>
                  <button className="button button--dark" type="submit">{content.copy.contact.textSendInquiry}<ArrowUpRight size={16} /></button>
                  <p className="form-note">{content.copy.contact.textWeUsuallyReplyWithinOneWorking}</p>
                </form>
              )}
            </Reveal>
          </div>
        </section>}
        {isFaq && <section className="content-page section-light">
          <div className="container content-page__intro"><div className="section-kicker">{content.copy.faq.textAnswersForFoodMakers}</div><h1>{content.copy.faq.textFrequentlyAsked}<br /><em>{content.copy.faq.textQuestions}</em></h1><p>{content.copy.faq.textClearAnswersAboutVorixIngredientsSourcing}</p></div>
          <div className="container faq-list">
            {content.faqs.map(({question, answer}) => <details key={question}><summary>{question}<span>{content.copy.faq.textText}</span></summary><p>{answer}</p></details>)}
          </div>
        </section>}
        {isBlog && <section className="content-page section-light">
          <div className="container content-page__intro"><div className="section-kicker">{content.copy.journal.textTheIngredientJournal}</div><h1>{content.copy.journal.textNotesFromThe}<br /><em>{content.copy.journal.textSource}</em></h1><p>{content.copy.journal.textPracticalPerspectivesOnDehydrationIngredientConsistency}</p></div>
          <div className="container journal-grid">
            {content.journal.map(({title, copy}, index) => <article key={title}><span className="journal-index">{content.copy.journal.text0}{index + 1}{content.copy.journal.textJOURNAL}</span><h2>{title}</h2><p>{copy}</p><a className="text-link" href="/#contact">{content.copy.journal.textTalkToOurTeam}<ArrowUpRight size={15} /></a></article>)}
          </div>
        </section>}
      </main>

      <footer className="site-footer">
        <div className="container footer-top">
          <div className="footer-brand"><Mark /><p>{content.copy.footer.textPremiumDehydratedIngredients}<br />{content.copy.footer.textFromTheHeartOfGujarat}</p><a className="footer-email" href={`mailto:${content.contact.domesticEmail}`}>{content.contact.domesticEmail}{" "}<ArrowUpRight size={14} /></a></div>
          <div className="footer-links"><span className="footer-label">{content.copy.footer.textExplore}</span>{navItems.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}<a href="/#contact">{content.copy.footer.textStartAnInquiry}</a></div>
          <div className="footer-links"><span className="footer-label">{content.copy.footer.textKnowledge}</span><a href="/faq">{content.copy.footer.textFAQs}</a><a href="/journal">{content.copy.footer.textIngredientJournal}</a><a href="/sitemap.xml">{content.copy.footer.textSitemap}</a></div>
          <div className="footer-social"><span className="footer-label">{content.copy.footer.textFollowTheIngredientTrail}</span><a href={content.contact.instagramUrl} target="_blank" rel="noreferrer">{content.contact.instagramLabel}{" "}<ArrowUpRight size={14} /></a></div>
        </div>
        <div className="container footer-bottom"><span>{content.copy.footer.text2026VorixFoodIngredientsPvtLtd}</span><span>{content.copy.footer.textQualityThePowerOnOurSide}</span><span>{content.copy.footer.textMahuvaGujaratIndia}</span></div>
      </footer>
    </div>
  );
}
