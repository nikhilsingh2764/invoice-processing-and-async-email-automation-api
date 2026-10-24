import { LegalPage } from '../../components/public/LegalPage.jsx'
import { Ledger } from '../../components/ui/Ledger.jsx'
import { STORAGE_REGISTRY } from '../../lib/storage.js'

// The table is generated from the storage registry, so the policy cannot drift from the code.
const sections = [
  { id: 'cookies', title: 'Cookies', body: (
    <>
      <p>Two cookies keep you signed in. Both are <strong>HttpOnly</strong> (page scripts cannot read them), <strong>Secure</strong> and sent only to our API.</p>
      <Ledger caption="Cookies" rows={[
        { id: 'a', name: 'accessToken', purpose: 'Proves who you are on each request.', lifetime: '15 minutes' },
        { id: 'r', name: 'refreshToken', purpose: 'Gets you a new access token without signing in again.', lifetime: '15 days' },
      ]} columns={[{ key: 'name', header: 'Name', primary: true, render: (r) => <code>{r.name}</code> }, { key: 'purpose', header: 'Purpose' }, { key: 'lifetime', header: 'Lifetime' }]} />
    </>
  ) },
  { id: 'storage', title: 'Browser storage', body: (
    <>
      <p>We store a few preferences in your browser. We never store passwords, tokens or invoice data there.</p>
      <Ledger caption="Browser storage" rows={STORAGE_REGISTRY.map((e) => ({ id: e.key, ...e }))} columns={[
        { key: 'key', header: 'Key', primary: true, render: (r) => <code>{r.key}</code> },
        { key: 'store', header: 'Where', render: (r) => (r.store === 'session' ? 'sessionStorage' : 'localStorage') },
        { key: 'category', header: 'Type' },
        { key: 'purpose', header: 'Purpose' },
        { key: 'lifetime', header: 'Lifetime', hideSm: true },
      ]} />
    </>
  ) },
  { id: 'none', title: 'What we do not use', body: <p>No advertising cookies, no analytics trackers and no third-party fonts. If you choose Google sign-in, Google’s own script and cookies apply on that button.</p> },
  { id: 'control', title: 'Your control', body: <p>Clear site data in your browser to remove everything above. You will be signed out and preferences reset.</p> },
]

export default function Cookies() {
  return <LegalPage title="Cookie and Storage Policy" description="Exactly which cookies and browser storage keys InvoicePilot uses, and why." path="/cookies" sections={sections} />
}
