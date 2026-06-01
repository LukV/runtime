import Image from 'next/image'
import Link from 'next/link'
import { pageMetadata } from '@/lib/site-metadata'
import { Page, PageHeader, Prose, Section } from '../_components/Prose'
import { Ribbon } from '../_components/Ribbon'

export const metadata = pageMetadata({
  title: 'Hoe het werkt',
  description:
    'Drie stappen: je kiest een doel, je krijgt een plan, en het plan beweegt mee met je leven.',
  path: '/hoe-het-werkt',
})

export default function HoeHetWerkt() {
  return (
    <Page>
      <PageHeader eyebrow="Hoe het werkt" title="Drie stappen. En je bent vertrokken." />

      {/* The loop as a visual summary, replacing a lede sentence that drowned.
          Connectors are drawn via CSS so the markup stays valid <ol>/<li>. */}
      <ol className="loop" aria-label="De drie stappen">
        <li className="loop__step">
          <span className="loop__num">01</span>
          <span className="loop__label">Kies een doel</span>
        </li>
        <li className="loop__step">
          <span className="loop__num">02</span>
          <span className="loop__label">Krijg een plan</span>
        </li>
        <li className="loop__step">
          <span className="loop__num">03</span>
          <span className="loop__label">Stuur plan bij</span>
        </li>
      </ol>

      {/* Step 1 — kies een doel. Hero: the open road ahead. */}
      <Section>
        <p className="step__index">01</p>
        <h2 className="step__title">Kies een doel.</h2>
        <p className="step__tagline">Want beslissen is de eerste training.</p>
        <figure className="figure">
          <Image
            src="/images/hero-1.jpg"
            alt="Een loper op een landweg bij zonsopgang, op weg naar een dorp in de verte."
            width={1535}
            height={1024}
            sizes="(max-width: 736px) 100vw, 46rem"
            priority
          />
        </figure>
        <Prose>
          <p>
            Een doel is een afstand, een tijd, of een comeback.{' '}
            <em>10 km onder het uur. Een halve marathon afmaken. Terug aan het lopen geraken na de winter.</em>{' '}
            Wil je het vastpinnen op een echte wedstrijd uit de kalender? Dat mag.
          </p>
          <p>
            Het doel is de ruggengraat; de wedstrijd is gewoon de datum waarop het doel valt.
          </p>
        </Prose>
      </Section>

      {/* Step 2 — krijg een plan. The Ribbon is the centrepiece; no photo. */}
      <Section>
        <p className="step__index">02</p>
        <h2 className="step__title">Krijg een plan.</h2>
        <p className="step__tagline">Het plan volgt het plan.</p>
        <Ribbon
          currentWeek={6}
          totalWeeks={12}
          caption="Week 6 / 12 · Mechelen over 34 dagen"
        />
        <Prose>
          <p>
            Zodra je kiest, bouwt Runtime een plan tot aan je doel. Het schaalt naar de tijd die je
            hebt, acht weken, twaalf, achttien.
          </p>
          <p>
            Bovenaan elk scherm loopt het lint: één streepje per week, een amberkleurig stipje op
            vandaag, je doel aan de rechterkant. Eén oogopslag, en je weet waar je staat.
          </p>
        </Prose>
      </Section>

      {/* Step 3 — stuur plan bij. Hero: changing weather on the trail. */}
      <Section>
        <p className="step__index">03</p>
        <h2 className="step__title">Stuur plan bij.</h2>
        <p className="step__tagline">Het leven gebeurt. Het plan beweegt mee.</p>
        <figure className="figure">
          <Image
            src="/images/hero-2.jpg"
            alt="Een loper op een bospad in de mist, in wisselend ochtendlicht."
            width={1535}
            height={1024}
            sizes="(max-width: 736px) 100vw, 46rem"
          />
        </figure>
        <Prose>
          <p>
            Sterker gelopen dan verwacht? Een week ziek? Een hittegolf? Het plan herschikt, zonder
            drama. <em>Plan vanmorgen aangepast. Je liep zaterdag sterker.</em>
          </p>
          <p>Geen schuldgevoel, geen rode cijfers. Gewoon: vandaag, wat klopt voor vandaag.</p>
        </Prose>
      </Section>

      {/* Enrichment — first to cut if the weekend runs out. */}
      <Section>
        <h2 className="page__h2">Van 5 km tot marathon.</h2>
        <Prose>
          <p>
            Eerste 5 km of tweede marathon: hetzelfde principe. Een doel, een plan dat ernaartoe
            bouwt, en een lint dat meegroeit met de afstand. Start vandaag. Stel een doel.
          </p>
        </Prose>
      </Section>

      <Section>
        <Prose>
          <p>
            <Link href="/">Bekijk de kalender →</Link>
          </p>
        </Prose>
      </Section>
    </Page>
  )
}
