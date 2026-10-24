import { LegalPage } from '../../components/public/LegalPage.jsx'
import { SITE } from '../../config/site.js'

const g = SITE.grievanceOfficer
const sections = [
  { id: 'officer', title: 'Grievance Officer', body: <><p>As required by the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021 and the DPDP Act, 2023:</p><dl><dt>Name</dt><dd>{g.name}</dd><dt>Email</dt><dd><a href={`mailto:${g.email}`}>{g.email}</a></dd><dt>Postal address</dt><dd>{g.address}</dd></dl></> },
  { id: 'time', title: 'What to expect', body: <p>We acknowledge every complaint within <strong>{g.acknowledgeHours} hours</strong> and resolve it within <strong>{g.resolveDays} days</strong> of receiving it.</p> },
  { id: 'include', title: 'What to include', body: <ul><li>The email address on your account.</li><li>What happened and what you would like us to do.</li><li>Links or screenshots, if useful. Never send your password.</li></ul> },
  { id: 'escalate', title: 'If you are not satisfied', body: <p>You may complain to the Data Protection Board of India once it is operational, or to the relevant authority under applicable law.</p> },
]

export default function Grievance() {
  return <LegalPage title="Grievance Officer" description="How to raise a complaint with InvoicePilot and what response times to expect." path="/grievance" sections={sections} />
}
