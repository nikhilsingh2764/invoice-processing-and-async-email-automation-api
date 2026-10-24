import { LegalPage } from '../../components/public/LegalPage.jsx'
import { SITE } from '../../config/site.js'
import { Link } from 'react-router'

const sections = [
  { id: 'accept', title: 'Agreement', body: <p>By creating an account you agree to these terms and the <Link to="/privacy">Privacy Policy</Link>. If you use the service for a business, you confirm you can bind that business.</p> },
  { id: 'service', title: 'The service', body: <p>{SITE.name} lets you create invoices, download them as PDFs and email them to your customers. It is free to use. Features may change.</p> },
  { id: 'account', title: 'Your account', body: <p>Keep your password private and your details accurate. You are responsible for activity on your account. Tell us promptly if you suspect misuse.</p> },
  { id: 'content', title: 'Your content', body: <p>You own the data you enter. You give us permission to store and process it to run the service. You are responsible for the accuracy of your invoices, for tax compliance (including GST), and for having the right to email your customers.</p> },
  { id: 'use', title: 'Acceptable use', body: <ul><li>No unlawful, fraudulent or misleading invoices.</li><li>No attempts to break, overload or scrape the service.</li><li>No sending unsolicited bulk email through the invoice email feature.</li></ul> },
  { id: 'email', title: 'Invoice emails and PDFs', body: <p>Emails and PDFs are prepared in the background and delivery is not guaranteed. Check the customer’s address before sending. Usage limits apply.</p> },
  { id: 'warranty', title: 'No warranty', body: <p>The service is provided “as is”. We do not give tax, legal or accounting advice. Review every invoice before you send it.</p> },
  { id: 'liability', title: 'Liability', body: <p>To the extent the law allows, our liability is limited to the amount you paid us, which for a free service is nil. Nothing here limits liability that cannot be limited by law. REPLACE_ME: lawyer to confirm.</p> },
  { id: 'end', title: 'Ending the agreement', body: <p>You can deactivate or delete your account at any time from the Account page. We may suspend accounts that break these terms.</p> },
  { id: 'law', title: 'Governing law', body: <p>These terms are governed by the laws of India. Courts at REPLACE_ME city have jurisdiction. REPLACE_ME: confirm.</p> },
]

export default function Terms() {
  return <LegalPage title="Terms of Service" description="The rules for using InvoicePilot." path="/terms" sections={sections} />
}
