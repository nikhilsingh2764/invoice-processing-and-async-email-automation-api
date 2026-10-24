import { LegalPage } from '../../components/public/LegalPage.jsx'
import { SITE } from '../../config/site.js'
import { Link } from 'react-router'

const sections = [
  { id: 'who', title: 'Who we are', body: <p>{SITE.name} is operated by {SITE.companyName}, {SITE.address}. For this policy we are the data fiduciary under the Digital Personal Data Protection Act, 2023 (DPDP Act) and the controller of the information described below.</p> },
  { id: 'collect', title: 'What we collect', body: (
    <>
      <p>We collect only what the service needs to work:</p>
      <ul>
        <li><strong>Account data:</strong> username, email address and a salted hash of your password. If you sign in with Google, we receive your Google account email and name.</li>
        <li><strong>Business data you enter:</strong> business profile, customers, products and invoices, including the names, emails, phone numbers, addresses and GST numbers you type in.</li>
        <li><strong>Technical data:</strong> request logs needed to keep the service secure and working. REPLACE_ME: confirm retention period and whether IP addresses are logged.</li>
      </ul>
      <p>We do not use advertising or analytics trackers.</p>
    </>
  ) },
  { id: 'use', title: 'Why we use it', body: <p>To create your account, verify your email, let you create and send invoices and PDFs, keep your account secure, and answer your requests. We do not sell personal data.</p> },
  { id: 'customers', title: 'Your customers’ data', body: <p>When you add customers and invoices you decide what to enter. You are responsible for having a lawful basis to store and email that information. We process it only to provide the service to you.</p> },
  { id: 'cookies', title: 'Cookies and browser storage', body: <p>We use secure, HttpOnly cookies to keep you signed in and a few preferences in your browser. The full list is on the <Link to="/cookies">storage policy</Link>.</p> },
  { id: 'share', title: 'Who we share it with', body: <p>Service providers that run the product for us (hosting, database, email delivery) and Google, if you choose Google sign-in. REPLACE_ME: list your actual providers and their countries. We disclose information if the law requires it.</p> },
  { id: 'retention', title: 'How long we keep it', body: <p>Until you delete your account, after which we delete your data from active systems. REPLACE_ME: state backup retention.</p> },
  { id: 'rights', title: 'Your rights', body: <p>You can access, correct and erase your data, withdraw consent, nominate someone to act for you, and complain. See <Link to="/data-rights">your data rights</Link> and the <Link to="/grievance">Grievance Officer</Link>.</p> },
  { id: 'security', title: 'Security', body: <p>See the <Link to="/security">security page</Link> for the controls in place. No system is perfectly secure; tell us at <a href={`mailto:${SITE.securityEmail}`}>{SITE.securityEmail}</a> if you find a problem.</p> },
  { id: 'children', title: 'Children', body: <p>The service is for businesses and adults. It is not directed at children under 18.</p> },
  { id: 'changes', title: 'Changes', body: <p>If we change this policy we update the date above and show a notice in the app.</p> },
]

export default function Privacy() {
  return <LegalPage title="Privacy Policy" description="What InvoicePilot collects, why, who sees it and how you can control it." path="/privacy" sections={sections} />
}
