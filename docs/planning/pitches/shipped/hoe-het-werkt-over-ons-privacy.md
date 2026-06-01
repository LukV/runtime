---
project: runtime
type: pitch
area: website
block: website-foundation
appetite: a weekend
created: 2026-06-01
started: 2026-06-01
status: shipped
shipped_on: 2026-06-01
---
# Hoe het werkt + Over ons + Privacy

## Problem

The nav and footer link to three destinations that don't exist yet. *Kalender · Hoe het werkt · Over ons · Krijg de app* sits across the top of every page ([[shipped/nav-footer-shared-components]]); the footer carries secondary links including privacy. Today **/hoe-het-werkt and /over-ons 404** — the sitemap already lists them ([[shipped/page-chrome-seo-metadata]]), so the first Google crawl is being pointed at dead URLs — and there is no privacy page at all, which the brand voice needs as much as GDPR does.

These aren't filler pages. The product thesis is calendar SEO, but the calendar is block 3 — until it lands, *these three pages are the only real content on the site*. And under the resequenced go-to-market ([[../../product-design/003-pilot-scope#8. Going to market — calendar first, coaching partner-gated]]), they carry more weight than before: with the coached pilot gated on a partner who isn't found yet, the public funnel is *calendar → TestFlight waitlist → call for partners*, and these three pages are where a visitor decides whether Runtime is real. *Hoe het werkt* is the product explanation. *Over ons* is the credibility. *Meebouwen* is the standing call for partners and the rest of the team ([[../../product-design/003-pilot-scope#8.3 The call for partners is now a first-class surface]]). *Privacy* is the proof that the anti-surveillance posture in the brief ([[../../product-design/002-design-brief]]) is honoured, not just claimed.

## Appetite

**A weekend.** Cap is binding. Four static routes, the shared chrome and `pageMetadata()` helper already in place, the design tokens and `Wordmark`/`Ribbon` components already built. The weekend goes into *layout and rhythm*, not infrastructure — and into the honest scoping of what each page can truthfully say before the app and intake exist.

The copy is no longer the open question it was: first-draft Dutch for all four pages is written below (and *Over ons* / *Meebouwen* started from Luk's own words). The weekend's job is to lay it into the design language, not to write from scratch.

The non-negotiable: **all four routes return 200, render inside the existing `SiteHeader`/`SiteFooter` chrome, carry correct per-page metadata via `pageMetadata()`, read in the brand voice, and the sitemap's dead-link problem is gone.** Below that bar the pitch hasn't shipped.

If the weekend runs out, cut in this order:
1. **Drop bespoke imagery on *Hoe het werkt*** and lean on the `Ribbon` component + type as the entire visual language. The ribbon *is* the product's central metaphor; it carries the page alone.
2. **Ship *Over ons* and *Meebouwen* text-led with photo slots left empty** (a styled placeholder block), real photos dropped in as a ~10-min follow-up once they exist.
3. **Trim *Hoe het werkt* to the three-step loop only**, dropping the secondary sections (the distance ladder, the *wat het niet is* contrast). The three steps are the whole job; everything else is enrichment.

Privacy does not get cut — a site that says it doesn't surveil you needs the page that proves it. *Meebouwen* does not get cut either — with the pilot partner-gated, the public ask for a partner is now load-bearing go-to-market, not a nice-to-have.

## Sketch

Four routes under `apps/web/app/`, each a server component exporting `metadata` via the helper from [[shipped/page-chrome-seo-metadata]]. The chrome wraps them for free (it's in `layout.tsx`). No new infrastructure — these are content pages assembled from the existing token system and components.

```
apps/web/app/
├── hoe-het-werkt/page.tsx
├── over-ons/page.tsx
├── meebouwen/page.tsx
└── privacy/page.tsx
```

Plus one shared content primitive — a `Prose` / section-rhythm wrapper so the pages share vertical rhythm, max-width, and type scale instead of each re-deriving it. Lives at `app/_components/Prose.tsx`. Everything else composes from `Wordmark`, `Ribbon`, and the color/type tokens already in `globals.css`.

The Dutch copy below is **first-draft, Luk edits in place.** It follows the voice in [[../../product-design/002-design-brief#5. Voice and copy]]: calm coach, flat-honest, *je*-not-*u*, no exclamation marks, no emoji. The three brand lines stay disciplined — one surface, one line, never two: *Over ons* closes on the brand line *Het werk is het feest*; *Meebouwen* uses it once, in the angle section; the conversion line *Inschrijven is de eerste training* belongs to the waitlist form, not these pages.

### 1. `hoe-het-werkt/page.tsx`

The three-step product loop in long form, in the design language ([[../../product-design/004-design-system-and-screens#4. The website]]). The spine is **kies een doel → krijg een plan → het past zich aan**, mapped to the confirmed strings and the vision ([[../../product-design/001-product-vision]]). The **`Ribbon`** is the centrepiece of step 2 — it earns its place on the page and, per the cut-path, can carry the whole page alone if imagery slips.

**First-draft copy:**

> **Hoe het werkt**
> Drie stappen. Geen toeters, geen bellen. Je kiest een doel, je krijgt een plan, en het plan beweegt mee met je leven.
>
> **1. Kies een doel.** *Beslissen is de eerste training.*
> Een doel is een afstand, een tijd, of een comeback. *10 km onder het uur. Een halve marathon afmaken. Terug aan het lopen geraken na de winter.* Wil je het vastpinnen op een echte wedstrijd uit de kalender? Dat mag. Het doel is de ruggengraat; de wedstrijd is gewoon de datum waarop het doel valt.
>
> **2. Krijg een plan.** *Het plan volgt.*
> Zodra je kiest, bouwt Runtime een plan tot aan je doel. Het schaalt naar de tijd die je hebt — acht weken, twaalf, achttien. Bovenaan elk scherm loopt het lint: één streepje per week, een amberkleurig stipje op vandaag, je doel aan de rechterkant. Eén oogopslag, en je weet waar je staat.
>
> **3. Het past zich aan.** *Het leven gebeurt. Het plan beweegt mee.*
> Sterker gelopen dan verwacht? Een week ziek? Een hittegolf? Het plan herschikt, zonder drama. *Plan vanmorgen aangepast. Je liep zaterdag sterker.* Geen schuldgevoel, geen rode cijfers. Gewoon: vandaag, wat klopt voor vandaag.
>
> *(enrichment, first to cut)*
> **Van 5 km tot marathon.** Eerste 5 km of tweede marathon: hetzelfde principe. Een doel, een plan dat ernaartoe bouwt, en een lint dat meegroeit met de afstand.
>
> **Wat Runtime niet is.** Geen generiek schema dat je overal vindt. Geen app die je punten geeft om je terug te lokken. En geen plan zonder doel — *geen schema voor er een doel is.* Runtime traint je niet in het abstracte. Je kiest waar je naartoe wil, en dan beginnen we.
>
> **CTA:** Bekijk de kalender → (links to `/kalender` once block 3 lands; until then, the *Krijg de app* / waitlist destination)

**Beeldtaal.** The `Ribbon` is the hero of step 2 — render it live, not as a screenshot. Around it, atmospheric imagery only as accent (CC0 or AI, tone notes below). Step 2 needs no photo; let the ribbon do the work. Steps 1 and 3 can each take one quiet atmospheric image (the open road ahead for *kies een doel*; changing weather for *het past zich aan*). If imagery slips, the page is ribbon + type and loses nothing essential.

### 2. `over-ons/page.tsx`

Luk's story and the why. Personal, photo-led, no corporate copy. **An is not on this page.** The coaching partner ("An" in the designs) isn't found yet ([[../../product-design/003-pilot-scope#8. Going to market — calendar first, coaching partner-gated]]), so *Over ons* foregrounds Luk; the partner ask and the wider "join us" story now live on their own page, [[#4. `meebouwen/page.tsx`|/meebouwen]] (§8.3 made the call for partners a first-class surface — it earned its own page rather than being buried mid-story here). When a partner commits, her introduction is added here as a follow-up; until then the page does not name or imply a coach who isn't there. The *why* is the vision's insight in human form: *je wordt een loper aan de startlijn, niet aan de finish.* Closes on the brand line *Het werk is het feest.*

Photo-led by design — but Luk sources his own runner photo, and the page is built to render gracefully with styled photo slots until it (and any atmospheric imagery) is dropped in.

**First-draft copy** (adapted from Luk's own draft into the Flemish house voice). Note the change from the earlier draft: the *In het openbaar bouwen* and *Op zoek naar partners* blocks have moved to [[#4. `meebouwen/page.tsx`|/meebouwen]]; *Over ons* keeps a one-line pointer and stays focused on Luk's story.

> **Over Runtime**
>
> **Dag, ik ben Luk.**
> Belgische software engineer, weekendbouwer, en loper. Ik loop al jaren graag, net omdat het simpel is. Je trekt je schoenen aan, je stapt naar buiten, en je gaat. Geen ingewikkelde regels. Geen dure spullen. Gewoon jij, de weg, en het tempo dat vandaag goed voelt.
>
> Maar toen vrienden en familie wilden beginnen lopen, viel me iets vreemds op. Een goede loopkalender vinden in België was niet evident. Betaalbare begeleiding vinden was nog moeilijker. De meeste schema's voelden generiek, duur, of gemaakt voor mensen die al liepen. Dat klopte niet voor mij. Dus begon ik aan Runtime. Niet omdat de wereld nog een fitness-app nodig heeft, maar omdat ik geloof dat meer mensen het plezier van lopen zouden ontdekken als beginnen wat makkelijker was.
>
> **Je wordt een loper aan de startlijn.**
> De meeste mensen denken dat je een loper wordt wanneer je je eerste 5 km uitloopt. Of je eerste 10 km. Of je eerste halve marathon. Ik niet. Ik denk dat je een loper wordt op een vochtige maandagochtend, wanneer je beslist om naar buiten te gaan, op start drukt, en die eerste passen zet. De finish maakt je geen loper. De beslissing doet dat.
>
> Dat is het idee achter Runtime. We zijn er niet om topatleten te vieren. We zijn er om gewone mensen te helpen die eerste stap te zetten — en lang genoeg vol te houden om te ontdekken dat ze meer kunnen dan ze dachten.
>
> **Ik bouw dit in het openbaar.**
> Runtime is nog vroeg. Heel vroeg. Vandaag is het vooral ik, een laptop, een hoop ideeën, en veel kilometers op Belgische wegen. Ik bouw alles in het openbaar — de code en de plannen staan online — omdat ik geloof dat de beste producten samen vorm krijgen met de mensen die ze gebruiken. Wil je meebouwen, of zoek je een rol? Lees verder op [meebouwen](/meebouwen).
>
> **Het werk is het feest.**
> Lopen heeft me ontelbare goede momenten gegeven. Stille ochtenden. Onverwachte doorbraken. Gesprekken met vrienden. De voldoening van komen opdagen als niemand kijkt. Runtime bestaat omdat ik wil dat meer mensen dat gevoel ervaren. Niet ooit. Niet nadat ze loper geworden zijn. Nu. Want dat zijn ze al.
>
> Het werk is het feest.

**Beeldtaal.** Photo-led. `luk-runner.jpg` is the anchor — a real, warm photo of Luk on a Belgian road, which works as the *"Dag, ik ben Luk"* opener. Around it, one or two atmospheric images (CC0 or AI, tone notes below): a damp morning road, shoes by a door, a small-town *stadsloop* crowd. Styled empty slots ship first; images drop in after.

### 3. `meebouwen/page.tsx`

The fourth page — the "join us" surface. This is where §8.3's call for partners lives, lifted out of *Over ons* so it isn't buried in Luk's story, and widened past coaches to the full set of people Runtime needs: distribution/community, co-founders, coaches, testers. It restates *building in the open* and makes the public GitHub repo (`github.com/LukV/runtime`) the proof of it — docs and code both. Indexable; a public "we're building this openly, come help" page is itself trust-building.

This page is the natural home for the build-in-the-open thread, the ambition, and the angle — all drawn from [[../../product-design/001-product-vision]] (the Flandrien "finishing is the engine" wedge, the deterministic-rules-plus-AI-conversation posture, Flanders-first-then-global). Same `Prose` rhythm as the others; no new infrastructure. Nav placement is open (see risks) — footer link is the safe default, promotion to top-nav a later call.

**First-draft copy:**

> **Meebouwen aan Runtime**
> Runtime wordt in het openbaar gebouwd. De code, de plannen, de twijfels — het staat allemaal open. Niet omdat het af is, maar net omdat het dat niet is. Ik geloof dat de beste producten samen vorm krijgen met de mensen die ze gebruiken en mee maken. Dit is de pagina voor wie wil meedoen.
>
> **Waar dit naartoe gaat.**
> Runtime is een loopcoach, gebouwd rond één idee: je wordt een loper aan de startlijn, niet aan de finish. Je kiest een doel, je krijgt een plan dat ernaartoe bouwt, en het plan beweegt mee met je week.
> We beginnen klein en heel concreet: een Vlaamse loopkalender en een handvol lopers die we van begin tot finish begeleiden. Maar de ambitie reikt verder. Het einddoel is een coach die naast élke recreatieve loper kan staan — eerst in Vlaanderen, daarna overal waar mensen lopen en wedstrijden bestaan. We bouwen vanaf dag één met dat pad voor ogen, ook al zetten we vandaag maar de eerste passen.
>
> **Onze invalshoek.**
> De meeste loopapps gaan uit van competitie. Klop je PR. Klim in het klassement. Hier is je trainingsstress-score. Runtime gaat uit van iets anders: afmaken is het punt. Het werk is het feest.
> Dat is de Flandrien-ethiek, vertaald naar lopen. Je komt opdagen, in elk weer, zonder drama. *Doen, niet zagen.* Geen enkele loopapp is vandaag gebouwd voor de loper die de prestatiecultuur van het genre eerlijk gezegd wat gênant vindt. Runtime wel.
> En onder de motorkap één duidelijke keuze: de trainingsschema's komen uit sportwetenschap, niet uit AI. De plannen volgen vaste, veilige principes — periodisering, 80/20, een opbouw van hoogstens tien procent per week, een doordachte taper. AI verzint nooit je training. Wat AI wél doet: het gesprek menselijk en toegankelijk maken — een schema uitleggen, een vraag beantwoorden, je weer op weg helpen na een gemiste week. De regels eronder, het gesprek erbovenop. Dat is onze hoek.
>
> **Wie we zoeken.**
> Runtime is vandaag vooral één persoon, een laptop, en veel kilometers. Dat moet veranderen. Een paar soorten mensen kunnen het verschil maken:
> **Mensen die Runtime bij lopers krijgen.** Iemand die er energie van krijgt om iets te laten groeien — een community opbouwen, de juiste loopgroepen en kanalen vinden, ervoor zorgen dat de mensen voor wie dit gemaakt is, het ook tegenkomen. Bouwen is één ding; gevonden worden is een ander.
> **Medeoprichters.** Mensen die dit niet als project maar als zaak willen zien, en die mee de richting willen bepalen. Tech, product, coaching, of de zakelijke kant — ik bouw liever met iemand dan alleen.
> **Loopcoaches — student of gecertificeerd.** Jij bent de reden dat de schema's deugen. Studenten sport- en bewegingswetenschappen, trainers met een diploma, ervaren coaches: iedereen die mee evidence-based plannen wil maken die mensen écht beter doen lopen. Dit is de rol waar het hele product op steunt.
> **Testers.** Lopers met een doel in de komende maanden, die de app willen uitproberen terwijl ze gebouwd wordt. Je krijgt vroege toegang via TestFlight en een directe lijn naar wat er verandert. In ruil: eerlijke feedback en wat geduld met de ruwe kantjes.
>
> **Alles staat open.**
> De volledige code en de planningsdocumenten staan op GitHub: github.com/LukV/runtime. Geen pitch deck, geen mooie praatjes — de echte plannen en de echte code. Wil je weten waar Runtime staat en waar het naartoe wil, kijk daar.
> Herken je jezelf in een van deze rollen? Of zie je een vijfde die ik vergeet? Stuur een mail naar luk@runtime.training. Ik antwoord zelf.

**Beeldtaal.** Lightest-touch of the four pages — it's an invitation, not a showcase. One atmospheric image at most (the open-road *"first steps"* register fits the ambition section); the GitHub link and the role list carry the page. Same CC0/AI tone as below. The repo link is the real centrepiece — render it prominently, not as a buried inline link.

### 4. `privacy/page.tsx`

Plain Dutch, no legalese template ([[../../product-design/002-design-brief]] voice). Scoped honestly to **what is actually true today and in the near-term**, not to a hypothetical full product. Note the partner change: the *wie wat ziet* line no longer names two coaches — today it's Luk, with a coach partner gaining access only once one joins.

**First-draft copy:**

> **Privacy**
> Korte versie: we volgen je niet, we verkopen niets, en we bewaren zo weinig mogelijk. Hieronder staat wat dat concreet betekent — in gewone taal, niet in juridisch jargon.
>
> **Wat we meten op de site.**
> We gebruiken Plausible voor websitestatistieken. Plausible draait op Europese servers, gebruikt geen cookies, en volgt je niet over andere sites. Er worden geen persoonlijke profielen opgebouwd. Daarom zie je ook geen cookiebanner: er valt niets om toestemming voor te vragen. Geen Google Analytics. Met opzet.
>
> **Wat we bewaren.**
> Je gegevens staan in een database in de Europese regio (Supabase). In deze vroege fase werkt de app met een sleutel per toestel — geen account, geen wachtwoord. We bewaren wat de app nodig heeft om te werken, en niet meer.
>
> **Wie wat ziet.**
> Voorlopig is dat Luk. Zodra er een coach-partner aan boord komt, krijgt die toegang tot de gegevens die nodig zijn om jou te begeleiden — en niemand anders. Geen advertentienetwerken. We verkopen je gegevens niet, aan niemand.
>
> **Jouw rechten en contact.**
> Wil je weten wat we van jou hebben, of wil je dat we het wissen? Stuur een mail naar luk@runtime.training en we regelen het. Eén mens leest die mailbox. Dat blijft zo zolang het kan.
>
> *Laatst bijgewerkt: [datum invullen bij publicatie].*

The footer's privacy link points here; `/privacy` gets added to `sitemap.ts` at a low priority. Indexable (not `noIndex`) — a public privacy posture is a feature, not something to hide. The Plausible *event list itself* ships with the Plausible pitch ([[../../architecture/001-stack-decisions#Plausible for analytics]]); this page states the *posture*. Supabase EU residency and per-device tokens are per [[../../architecture/001-stack-decisions]].

### Beeldtaal — tone for CC0 / AI imagery

Applies to *Over ons*, *Hoe het werkt*, and *Meebouwen*. The voice principle carries straight into the pictures: **calm, honest, Flemish, un-glossy.**

- **Yes:** muted natural light, overcast or early-morning, slightly damp. Flat Belgian roads, polders, town centres, a small *stadsloop*. Ordinary recreational runners — a range of ages and body types, not models. Documentary feel. The brand's amber turning up naturally where it can (sunrise, a race bib).
- **No:** glossy fitness-model hero shots, neon sportswear, gym interiors, fake finish-line high-fives, stock-photo smiles, drone-epic landscapes. Nothing that says *"motivational fitness brand."*
- **CC0 sources:** Pexels and Unsplash (free-to-use; check each photo's license line), Openverse filtered to CC0, Wikimedia Commons (CC0/public domain). Keep a one-line credit/source note per image in the repo even when not legally required.
- **AI prompt seed** (tune per shot): *"Overcast early morning, flat Belgian country road, a middle-aged recreational runner in plain clothing seen from behind, soft diffuse light, slight mist, muted natural colours, documentary photography, no text, no logos."* Vary the subject (shoes by a front door; a small-town race start) and keep the register the same.
- Luk's own runner photo is the exception to "atmospheric only" — it's the one image that should be unmistakably *him*, and it anchors *Over ons*.

**Provenance.** Three images already exist in `docs/product-design/assets/`: `luk-runner.jpg` (a real photo of Luk, warm/approachable, the *Over ons* opener), and `hero-1.jpg` + `hero-2.jpg` (**AI-generated**, on-tone — sunrise country road, misty forest trail). The two heroes map to *Hoe het werkt* step 1 (*kies een doel* — the road ahead) and step 3 (*het past zich aan* — changing conditions); step 2 stays ribbon-only. Keep a note in the repo that the heroes are AI, not real locations, so nobody later captions them as a real place.

**Build handling.** These are design-source originals (1–2 MB each) and need to move into `apps/web/public/` and be served via `next/image` (resize + modern format) before they ship — a multi-MB hero undercuts the SEO/credibility job these pages exist to do. Originals stay in `docs/product-design/assets/` as the source of record.

### Metadata + sitemap

Each page: `export const metadata = pageMetadata({ title: 'Hoe het werkt', path: '/hoe-het-werkt' })` (and equivalents). This is the first real exercise of the helper's per-page path — and therefore where the **trailing-slash canonical** behaviour the page-chrome pitch flagged gets verified against Vercel's actual serving ([[shipped/page-chrome-seo-metadata]] risks). Add `/privacy` and `/meebouwen` to the sitemap; the existing entries stop being dead links the moment this ships.

## Out of scope

- **The Kalender page.** That's the whole of block 3. The *Krijg de app* / Kalender nav links keep pointing where they already point.
- **The TestFlight waitlist form + the partner-application path.** *Meebouwen* states the call for partners and gives the email; the calendar carries the waitlist band. The actual form logic, TestFlight on-ramp, and any application handling live in their own blocks (intake / launch), per [[../../product-design/003-pilot-scope#8. Going to market — calendar first, coaching partner-gated]]. These pages link toward those surfaces; they don't build them.
- **Cookie consent banner.** Plausible is cookieless — the *absence* of a banner is the point. Building one would contradict the privacy posture.
- **Separate legal pages** (terms of service, full cookiebeleid, GDPR DPA). One plain-Dutch privacy page is the right surface for now; formal legal docs come if/when there's a paying product.
- **A CMS or MDX pipeline.** Pages are hardcoded TSX, consistent with the existing `page.tsx`. (If long-form copy churns enough to want MDX later, that's its own small pitch — noted in risks.)
- **English / i18n.** Dutch-only ([[../../product-design/003-pilot-scope]]).
- **Bespoke illustration commissioning.** If custom illustrations don't exist, the pages use the `Ribbon` + type + CC0/AI atmospheric imagery rather than blocking on commissioned art.
- **The Plausible event list + script.** That's the next slot. This privacy page describes the posture; the wiring is separate.

## Risks / unknowns

- **An is not found — and the pages are built for that.** *Over ons* foregrounds Luk; *Meebouwen* turns the partner question into a public ask. Neither names a coach who isn't there. This *resolves* the old consent/photo risk (there's no one to get consent from yet) but introduces a softer one: the pages must not imply a coaching team that doesn't exist. The copy is careful — *"daarom zoek ik partners"*, not *"ons team"*. When a partner commits, adding her is a small, happy follow-up; until then, keep the singular *ik*. The same singular discipline applies to the privacy page's *wie wat ziet*.
- **Over-promising coaching anywhere on the site.** Tied to the GTM rethink: until a partner is on board, no public surface — these pages included — should promise *live human coaching*. *Hoe het werkt* describes the product loop (goal → plan → adaptation), which is true of the app itself; it does not promise a human on the other end. Worth a read-through of all four pages against this line before publish.
- **The GitHub repo is now a public surface.** *Meebouwen* sends people straight to `github.com/LukV/runtime` for "the real plans and the real code." Before publish: confirm the repo is public, that the README is a decent front door (not an empty scaffold), and that nothing in the docs is embarrassing or sensitive to have open (keys, private names, half-thoughts about specific people). Building in the open is a strength only if the open thing is presentable.
- **Privacy accuracy is a correctness concern, not a copy one.** Every claim must match actual data handling — cookieless Plausible, Supabase EU, device tokens, admin = Luk (plus a partner once one joins). Over-claiming about app/coaching data flows that don't exist yet is the trap; the copy is scoped to what's true today and gets revisited when intake (block 4) actually collects data.
- **Copy is first-draft, not final.** The Dutch above is Luk-editable in place and *Over ons* / *Meebouwen* started from his own words, but it's a draft — especially the rhythm of the personal pages. Read it aloud before shipping; the house voice lives or dies on cadence.
- **Nav placement of *Meebouwen*.** It's a fourth content route but the top nav is already four items (*Kalender · Hoe het werkt · Over ons · Krijg de app*). Default: link *Meebouwen* from the footer and from the *Over ons* pointer, not the top nav, to avoid crowding. If partner recruitment becomes the priority, promoting it to the nav is a one-line change — but that's a deliberate call, not a default.
- **Imagery availability.** *Over ons* is photo-led and leans on Luk's own runner photo plus CC0/AI atmospherics. If none exist at build time, ship styled slots and the ribbon-and-type fallback, drop images in later. Flagging so *"photo-led"* doesn't silently become *"no photos."*
- **Trailing-slash canonical, now live for real.** These are the first sub-routes to exercise `pageMetadata({ path })`. Verify on `/hoe-het-werkt` once deployed to a preview; fix in the helper if Next's canonical and Vercel's trailing-slash serving disagree ([[shipped/page-chrome-seo-metadata]]).

## Related

- Block: [[blocks/02-website-foundation]] (slot 7 of 8)
- Go-to-market context: [[../../product-design/003-pilot-scope#8. Going to market — calendar first, coaching partner-gated]] (calendar-first, TestFlight waitlist, partner-gated coaching) — this pitch builds the *Meebouwen* surface that carries the call for partners
- Design source: [[../../product-design/004-design-system-and-screens#4. The website]], §5 (confirmed voice strings)
- Product why: [[../../product-design/001-product-vision]]; pilot framing: [[../../product-design/003-pilot-scope]]; brand voice: [[../../product-design/002-design-brief#5. Voice and copy]]
- Architecture (privacy facts): [[../../architecture/001-stack-decisions]] — Plausible, Supabase EU, per-device auth
- Builds on: [[shipped/page-chrome-seo-metadata]] (the `pageMetadata()` helper + sitemap these pages fill in), [[shipped/nav-footer-shared-components]] (the chrome that wraps them), [[shipped/race-ribbon-component]] + [[shipped/wordmark-as-component]] (the visual language)
- Unblocks: the next slot's Plausible event list references this privacy page; block 3's calendar makes the Kalender nav link real.

---

## What actually happened

Shipped as **four** pages, not three — the call for partners earned its own `/meebouwen` page mid-cycle rather than staying buried in *Over ons* (where a short pointer now sends people on). Shared `Prose`/`Section` primitives carry the rhythm; the pages compose from existing tokens, `Wordmark`, and `Ribbon` with no new infrastructure. *Hoe het werkt* gained a three-step stepper visualisation (a lede sentence was drowning under the title) and renders the `Ribbon` live as the step-2 centrepiece. Adding `/meebouwen` pushed the nav past a phone's width, which surfaced two more issues at once — so the nav was extracted into a `SiteNav` client island with a mobile hamburger and `aria-current` active-state, fixing the separate "which page am I on" gap in the same pass. Images: one real photo of Luk plus three AI illustrations, optimised into `public/images` (originals kept as source). The shoe-sketch header went two rounds — first flattened onto Inkt because the light linework vanished on Krijt, then re-done transparent once Luk removed a Nike swoosh and darkened the strokes so it floats on the page. Nothing was cut; the weekend's work landed by Monday, well under the 2026-06-08 cap. To watch: the trailing-slash canonical is consistent locally (Next 308-redirects `/x/` → `/x`) but worth a glance on the Vercel preview; and *Over ons* still carries a short "in het openbaar bouwen" note that overlaps thematically with `/meebouwen`.
