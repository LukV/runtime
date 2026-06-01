import Image from 'next/image'
import Link from 'next/link'
import { pageMetadata } from '@/lib/site-metadata'
import { Page, PageHeader, Prose, Section } from '../_components/Prose'

export const metadata = pageMetadata({
  title: 'Over ons',
  description:
    'Runtime, en de man erachter. Waarom je een loper wordt aan de startlijn, niet aan de finish — en een open oproep aan coaches en sportwetenschappers.',
  path: '/over-ons',
})

export default function OverOns() {
  return (
    <Page>
      <PageHeader eyebrow="Over ons" title="Over Runtime" />

      <Section>
        <figure className="figure figure--portrait">
          <Image
            src="/images/luk-runner.jpg"
            alt="Luk, lopend door een straat in Brussel."
            width={1135}
            height={1386}
            sizes="(max-width: 736px) 100vw, 22rem"
            priority
          />
        </figure>
        <Prose>
          <p>
            <strong>Dag, ik ben Luk.</strong> Belgische software engineer, weekendbouwer, en loper.
            Ik loop al jaren graag, net omdat het simpel is. Je trekt je schoenen aan, je stapt naar
            buiten, en je gaat. Geen ingewikkelde regels. Geen dure spullen. Gewoon jij, de weg, en
            het tempo dat vandaag goed voelt.
          </p>
          <p>
            Maar toen vrienden en familie wilden beginnen lopen, viel me iets vreemds op. Een goede
            loopkalender vinden in België was niet evident. Betaalbare begeleiding vinden was nog
            moeilijker. De meeste schema&apos;s voelden generiek, duur, of gemaakt voor mensen die al
            liepen. Dat kon beter. Dus begon ik aan Runtime. Niet omdat de wereld nog een
            fitness-app nodig heeft, maar omdat ik geloof dat meer mensen het plezier van lopen
            zouden ontdekken als beginnen wat makkelijker was.
          </p>
        </Prose>
      </Section>

      <Section>
        <h2 className="page__h2">In het openbaar bouwen.</h2>
        <Prose>
          <p>
            Runtime is nog vroeg. Heel vroeg. Vandaag is het vooral ik, een laptop, een hoop ideeën,
            en veel kilometers op Belgische wegen. Ik bouw alles in het openbaar, omdat ik geloof dat
            de beste producten samen vorm krijgen met de mensen die ze gebruiken. Je zal experimenten
            zien. Je zal fouten zien. Je zal features zien veranderen. Dat hoort erbij.
          </p>
        </Prose>
      </Section>

      <Section>
        <h2 className="page__h2">Je wordt een loper aan de startlijn.</h2>
        <Prose>
          <p>
            De meeste mensen denken dat je een loper wordt wanneer je je eerste 5 km uitloopt. Of je
            eerste 10 km. Of je eerste halve marathon. Ik niet. Ik denk dat je een loper wordt op een
            mistige zondagochtend, wanneer je beslist om naar buiten te gaan, op start drukt, en die
            eerste passen zet. De finish maakt je geen loper. De start doet dat.
          </p>
        </Prose>
      </Section>

      {/* The full call for partners now lives on /meebouwen — a short pointer
          keeps it discoverable here without burying it mid-story. */}
      <Section tone="raised">
        <h2 className="page__h2">Dit bouw ik niet alleen.</h2>
        <Prose>
          <p>
            Coaches, medeoprichters, mensen die Runtime bij lopers krijgen, testers — ik zoek mensen
            die mee willen bouwen. Eén ding staat vast: de trainingsschema&apos;s komen uit
            sportwetenschap, niet uit AI.{' '}
            <Link href="/meebouwen">Kijk wie ik zoek en doe mee →</Link>
          </p>
        </Prose>
      </Section>

      <Section>
        <h2 className="page__h2">Het werk is het feest.</h2>
        <Prose>
          <p>
            Lopen heeft me ontelbare goede momenten gegeven. Stille ochtenden. Onverwachte
            doorbraken. Gesprekken met vrienden. De voldoening van komen opdagen als niemand kijkt.
            Runtime bestaat omdat ik wil dat meer mensen dat gevoel ervaren. Mocht dat nu lukken...
          </p>
        </Prose>
        <p className="page__brand-line">Het werk is het feest.</p>
      </Section>
    </Page>
  )
}
