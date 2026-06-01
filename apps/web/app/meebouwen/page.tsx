import Image from 'next/image'
import { pageMetadata } from '@/lib/site-metadata'
import { Page, PageHeader, Prose, Section } from '../_components/Prose'

export const metadata = pageMetadata({
  title: 'Meebouwen',
  description:
    'Runtime wordt in het openbaar gebouwd. Voor wie wil meedoen: mensen die het bij lopers krijgen, medeoprichters, loopcoaches, en testers.',
  path: '/meebouwen',
})

export default function Meebouwen() {
  return (
    <Page>
      {/* Header — a build crew assembling a giant running shoe. Dark linework on
          a transparent ground, so it floats directly on the Krijt page (no box,
          no fill). See public/images/README. */}
      <figure className="figure figure--illustration">
        <Image
          src="/images/shoe-sketch.png"
          alt="Schets: een ploeg bouwvakkers bouwt samen een reusachtige loopschoen op een steiger."
          width={1536}
          height={1024}
          sizes="(max-width: 736px) 100vw, 46rem"
          priority
        />
      </figure>

      <PageHeader
        eyebrow="Meebouwen"
        title="Meebouwen aan Runtime"
        lede="Runtime wordt in het openbaar gebouwd. De code, de plannen, de twijfels het staat allemaal open. Niet omdat het af is, maar net omdat het dat niet is. Ik geloof dat de beste producten samen vorm krijgen met de mensen die ze gebruiken en mee maken. Dit is de pagina voor wie wil meedoen."
      />

      <Section>
        <h2 className="page__h2">Waar dit naartoe gaat.</h2>
        <Prose>
          <p>
            Runtime is een loopcoach, gebouwd rond één idee: je wordt een loper aan de startlijn,
            niet aan de finish. Je kiest een doel, je krijgt een plan dat ernaartoe bouwt, en het
            plan beweegt mee met je week.
          </p>
          <p>
            We beginnen klein en heel concreet: een Vlaamse loopkalender en een handvol lopers die we
            van begin tot finish begeleiden. Maar de ambitie reikt verder. Het einddoel is een coach
            die naast élke recreatieve loper kan staan — eerst in Vlaanderen, daarna overal waar
            mensen lopen en wedstrijden bestaan. We bouwen vanaf dag één met dat pad voor ogen, ook al
            zetten we vandaag maar de eerste passen.
          </p>
        </Prose>
      </Section>

      <Section>
        <h2 className="page__h2">Onze invalshoek.</h2>
        <Prose>
          <p>
            De meeste loopapps gaan uit van competitie. Klop je PR. Klim in het klassement. Runtime
            gaat uit van iets anders: afmaken is het punt. Het werk is het feest.
          </p>
          <p>
            Dat is de Flandrien-ethiek, vertaald naar lopen. Je komt opdagen, in elk weer, zonder
            drama. Doen, niet zagen. Geen enkele loopapp is vandaag gebouwd voor de loper die de
            prestatiecultuur van het genre eerlijk gezegd wat gênant vindt. Runtime wel.
          </p>
          <p>
            En onder de motorkap één duidelijke keuze: de trainingsschema&apos;s komen uit
            sportwetenschap, niet uit AI. De plannen volgen vaste, veilige principes — periodisering,
            80/20, een opbouw van hoogstens tien procent per week, een doordachte taper. AI verzint
            nooit je training. Wat AI wel doet: het gesprek menselijk en toegankelijk maken — een
            schema uitleggen, een vraag beantwoorden, mensen weer op weg helpen na een gemiste week.
          </p>
        </Prose>
      </Section>

      <Section>
        <h2 className="page__h2">Wie we zoeken.</h2>
        <Prose>
          <p>
            Runtime is vandaag vooral één persoon, een laptop, en veel kilometers. Dat moet
            veranderen. Een paar soorten mensen kunnen het verschil maken:
          </p>
        </Prose>
        <dl className="roles">
          <div className="role">
            <dt className="role__title">Mensen die Runtime bij lopers krijgen.</dt>
            <dd className="role__body">
              Een medeoprichter die er energie van krijgt om iets te laten groeien: een community opbouwen, de
              juiste loopgroepen en kanalen vinden, ervoor zorgen dat de mensen voor wie dit gemaakt
              is, het ook tegenkomen. Bouwen is gemakkelijk; gevonden worden is iets anders.
            </dd>
          </div>
          <div className="role">
            <dt className="role__title">Loopcoaches — student of gecertificeerd.</dt>
            <dd className="role__body">
              Jij bent de reden dat de schema&apos;s deugen. Studenten sport- en
              bewegingswetenschappen, trainers met een diploma, ervaren coaches: iedereen die mee
              evidence-based plannen wil maken die mensen écht beter doen lopen. Dit is de rol waar het
              hele product op steunt.
            </dd>
          </div>
          <div className="role">
            <dt className="role__title">Testers.</dt>
            <dd className="role__body">
              Lopers met een doel in de komende maanden, die de app willen uitproberen terwijl ze
              gebouwd wordt. Je krijgt vroege toegang via TestFlight en een directe lijn naar wat er
              verandert. In ruil: eerlijke feedback en wat geduld met de <i>ruwe kantjes</i>.
            </dd>
          </div>
        </dl>
      </Section>

      <Section tone="raised">
        <h2 className="page__h2">Alles staat open.</h2>
        <Prose>
          <p>
            De volledige code en de planningsdocumenten staan op GitHub:{' '}
            <a href="https://github.com/LukV/runtime" target="_blank" rel="noopener noreferrer">
              github.com/LukV/runtime
            </a>
            . Geen pitch deck, geen mooie praatjes — de echte plannen en de echte code. Wil je weten
            waar Runtime staat en waar het naartoe wil, kijk daar.
          </p>
          <p>
            Herken je jezelf in een van deze rollen? Of zie je een vijfde die ik vergeet? Stuur een
            mail naar <a href="mailto:luk@runtime.training?subject=Meebouwen">luk@runtime.training</a>.
            Ik antwoord zelf.
          </p>
        </Prose>
      </Section>
    </Page>
  )
}
