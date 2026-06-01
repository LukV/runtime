import { pageMetadata } from '@/lib/site-metadata'
import { Page, PageHeader, Prose, Section } from '../_components/Prose'

export const metadata = pageMetadata({
  title: 'Privacy',
  description:
    'We volgen je niet, we verkopen niets, en we bewaren zo weinig mogelijk. In gewone taal, niet in juridisch jargon.',
  path: '/privacy',
})

export default function Privacy() {
  return (
    <Page>
      <PageHeader
        eyebrow="Privacy"
        title="Privacy"
        lede="Korte versie: we volgen je niet, we verkopen niets, en we bewaren zo weinig mogelijk. Hieronder staat wat dat concreet betekent."
      />

      <Section>
        <h2 className="page__h2">Wat we meten op de site.</h2>
        <Prose>
          <p>
            We gebruiken Plausible voor websitestatistieken. Plausible draait op Europese servers,
            gebruikt geen cookies, en volgt je niet over andere sites. Er worden geen persoonlijke
            profielen opgebouwd. Daarom zie je ook geen cookiebanner: er valt niets om toestemming
            voor te vragen. Geen Google Analytics. Met opzet.
          </p>
        </Prose>
      </Section>

      <Section>
        <h2 className="page__h2">Wat we bewaren.</h2>
        <Prose>
          <p>
            Je gegevens staan in een database in de Europese regio (Supabase). In deze vroege fase
            werkt de app met een sleutel per toestel — geen account, geen wachtwoord. We bewaren wat
            de app nodig heeft om te werken, en niet meer.
          </p>
        </Prose>
      </Section>

      <Section>
        <h2 className="page__h2">Wie wat ziet.</h2>
        <Prose>
          <p>
            Voorlopig is dat Luk. Zodra er een coach-partner aan boord komt, krijgt die toegang tot
            de gegevens die nodig zijn om jou te begeleiden — en niemand anders. Geen
            advertentienetwerken. We verkopen je gegevens niet, aan niemand.
          </p>
        </Prose>
      </Section>

      <Section>
        <h2 className="page__h2">Jouw rechten en contact.</h2>
        <Prose>
          <p>
            Wil je weten wat we van jou hebben, of wil je dat we het wissen? Stuur een mail naar{' '}
            <a href="mailto:luk@runtime.training?subject=Privacy">luk@runtime.training</a> en we
            regelen het. Eén mens leest die mailbox. Dat blijft zo zolang het kan.
          </p>
          <p>
            <em>Laatst bijgewerkt: 1 juni 2026.</em>
          </p>
        </Prose>
      </Section>
    </Page>
  )
}
