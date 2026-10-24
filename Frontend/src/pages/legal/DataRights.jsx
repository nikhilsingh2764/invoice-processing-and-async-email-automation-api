import { Link } from 'react-router'
import { LegalPage } from '../../components/public/LegalPage.jsx'
import { SITE } from '../../config/site.js'

const sections = [
  { id: 'rights', title: 'Your rights', body: <ul><li><strong>Access:</strong> see what we hold about you.</li><li><strong>Correction:</strong> fix inaccurate data. Edit your profile, business, customers and invoices in the app.</li><li><strong>Erasure:</strong> delete your account and data.</li><li><strong>Withdraw consent</strong> at any time.</li><li><strong>Nominate</strong> a person to exercise rights on your behalf.</li><li><strong>Grievance:</strong> complain to us, then to the Data Protection Board of India.</li></ul> },
  { id: 'delete', title: 'Delete your account', body: <p>Sign in, open <Link to="/account">Account</Link> and use “Delete account”. You confirm with your password. If you signed in with Google, email <a href={`mailto:${SITE.privacyEmail}?subject=Delete%20my%20account`}>{SITE.privacyEmail}</a> from your Google address and we will do it for you.</p> },
  { id: 'export', title: 'Get a copy', body: <p>You can download each invoice as a PDF. For a full copy of your data, email <a href={`mailto:${SITE.privacyEmail}`}>{SITE.privacyEmail}</a>. REPLACE_ME: state turnaround time.</p> },
  { id: 'how', title: 'How to ask', body: <p>Email {SITE.privacyEmail} or write to the <Link to="/grievance">Grievance Officer</Link>. We may ask you to prove you own the account.</p> },
]

export default function DataRights() {
  return <LegalPage title="Data rights and deletion" description="How to access, correct or delete your data on InvoicePilot." path="/data-rights" sections={sections} />
}
