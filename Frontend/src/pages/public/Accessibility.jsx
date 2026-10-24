import { PageShell } from '../../components/public/PageShell.jsx'
import { SITE } from '../../config/site.js'

export default function Accessibility() {
  return (
    <PageShell title="Accessibility statement" description="How InvoicePilot approaches accessibility and how to report a barrier." path="/accessibility" intro="We aim to meet WCAG 2.2 level AA.">
      <section className="stack"><h2>What we do</h2><ul>
        <li>Full keyboard use, visible focus, a skip link and logical heading order.</li>
        <li>Colour is never the only signal: statuses carry text, and charts have a table or text summary.</li>
        <li>Light and dark themes, a high-contrast mode and support for reduced motion and forced colours.</li>
        <li>Single-key shortcuts only work when you are not typing, and are listed in the shortcuts dialog.</li>
        <li>Large touch targets and layouts that work at 320 px wide and 200% zoom.</li>
      </ul></section>
      <section className="stack"><h2>Known gaps</h2><p>We have not yet had an independent audit. REPLACE_ME: record the results of manual screen-reader testing here.</p></section>
      <section className="stack"><h2>Tell us about a barrier</h2><p>Email <a href={`mailto:${SITE.supportEmail}?subject=Accessibility%20feedback`}>{SITE.supportEmail}</a>. We reply within {SITE.grievanceOfficer.acknowledgeHours} hours.</p></section>
    </PageShell>
  )
}
