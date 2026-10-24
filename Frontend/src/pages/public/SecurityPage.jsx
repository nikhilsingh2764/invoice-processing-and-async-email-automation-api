import { PageShell } from '../../components/public/PageShell.jsx'
import { SITE } from '../../config/site.js'

// Lists only controls that exist in this codebase. No certification claims.
const CONTROLS = [
  ['Sessions', 'Sign-in uses HttpOnly, Secure cookies. Tokens are never placed in browser storage, so page scripts cannot read them.'],
  ['Request protection', 'Requests to the API are same-origin and carry a custom header. Credentials only go to our API.'],
  ['Content Security Policy', 'A strict policy blocks inline scripts and unknown origins. Fonts are self-hosted.'],
  ['Open redirects', 'After sign-in we only return you to paths on this site.'],
  ['Links and images', 'Only https links are followed or shown. External links open with noopener and noreferrer.'],
  ['Downloads', 'PDFs are checked for the PDF signature before they are saved. File names are sanitised.'],
  ['Idle timeout', 'You are signed out after 30 minutes of inactivity, with a warning first. Signing out in one tab signs out all tabs.'],
  ['Account safety', 'Passwords are checked against common choices. Codes lock after repeated wrong tries. Password reset never reveals whether an email has an account.'],
  ['Minimal storage', 'Only a few preferences are kept in your browser. See the storage policy for the exact list.'],
  ['Errors', 'Error reports are scrubbed of emails, long numbers and tokens.'],
]

export default function SecurityPage() {
  return (
    <PageShell title="Security" description="The security controls InvoicePilot uses, listed plainly." path="/security" intro="What we do today. We make no certification claims.">
      <dl className="stack">{CONTROLS.map(([t, d]) => (<div key={t}><dt style={{ fontWeight: 600 }}>{t}</dt><dd style={{ margin: 0 }} className="muted">{d}</dd></div>))}</dl>
      <section className="stack" aria-labelledby="rep-h">
        <h2 id="rep-h">Report a problem</h2>
        <p>Email <a href={`mailto:${SITE.securityEmail}`}>{SITE.securityEmail}</a>. Please give us reasonable time to fix an issue before sharing it. See also <a href="/.well-known/security.txt">security.txt</a>.</p>
      </section>
    </PageShell>
  )
}
