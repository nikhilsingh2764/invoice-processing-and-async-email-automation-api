// Dev/mock-only living style guide. Not routed in production builds.
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Sheet, Letterhead, MetaStrip, MetaCell, Stamp, Totals, KeyValue } from '../../components/sheet/index.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input, PasswordInput, Select, Checkbox, Switch, Textarea } from '../../components/ui/FormField.jsx'
import { Alert } from '../../components/ui/Alert.jsx'
import { Badge, StatusBadge } from '../../components/ui/Badge.jsx'
import { Ledger } from '../../components/ui/Ledger.jsx'
import { EmptyState, ErrorState } from '../../components/ui/EmptyState.jsx'
import { LedgerSkeleton } from '../../components/ui/Skeleton.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { ThemeMenu } from '../../components/layout/ThemeMenu.jsx'
import { PasswordStrength } from '../../components/ui/PasswordStrength.jsx'
import { useToast } from '../../components/ui/Toast.jsx'
import { INVOICE_STATUSES } from '../../config/enums.js'

const TOKENS = ['brand', 'brand-deep', 'brand-tint', 'desk', 'surface', 'sunken', 'ink', 'muted', 'hairline', 'border-strong', 'danger', 'success', 'info', 'warning', 'chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5']

export default function Styleguide() {
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [pw, setPw] = useState('')
  return (
    <div className="container-page stack-lg" style={{ paddingBlock: 32 }}>
      <Letterhead title="Style guide" description="Every token, component and state. Toggle the theme to check both." actions={<ThemeMenu showDensity />} />
      <Sheet><h2>Colour tokens</h2>
        <div className="grid-cards" style={{ marginBlockStart: 12 }}>{TOKENS.map((t) => <div key={t} className="card"><div style={{ blockSize: 40, background: `var(--${t})`, border: '1px solid var(--hairline)', borderRadius: 6 }} /><code>--{t}</code></div>)}</div>
      </Sheet>
      <Sheet><h2>Buttons</h2><div className="cluster" style={{ marginBlockStart: 12 }}>
        <Button variant="primary" icon={Plus}>Primary</Button><Button>Secondary</Button><Button variant="ghost">Ghost</Button><Button variant="danger">Danger</Button><Button variant="primary" loading>Loading</Button><Button disabled>Disabled</Button><Button size="sm">Small</Button><Button size="lg">Large</Button>
      </div></Sheet>
      <Sheet><h2>Form fields</h2><div className="form-grid" style={{ marginBlockStart: 12 }}>
        <Input label="Text" hint="Helper text" /><Input label="With error" error="Something is wrong" defaultValue="oops" /><PasswordInput label="Password" value={pw} onChange={(e) => setPw(e.target.value)} />
        <Select label="Select"><option>One</option><option>Two</option></Select><Textarea wrapperClassName="span-2" label="Textarea" optional /><Checkbox label="Checkbox" /><Switch label="Switch" />
      </div><PasswordStrength value={pw} /></Sheet>
      <Sheet><h2>Status</h2><div className="cluster" style={{ marginBlockStart: 12 }}>{INVOICE_STATUSES.map((s) => <StatusBadge key={s} status={s} />)}{INVOICE_STATUSES.map((s) => <Stamp key={s} status={s} />)}<Badge tone="info">Info</Badge></div></Sheet>
      <Sheet><h2>Alerts</h2><div className="stack" style={{ marginBlockStart: 12 }}>{['info', 'success', 'warning', 'danger'].map((t) => <Alert key={t} tone={t} title={t}>Message text</Alert>)}</div></Sheet>
      <Sheet fold><h2>Sheet pieces</h2><div className="stack" style={{ marginBlockStart: 12 }}>
        <MetaStrip><MetaCell label="Paid" value="₹1,20,000" /><MetaCell label="Pending" value="₹40,000" hint="hint" /></MetaStrip>
        <KeyValue rows={[{ label: 'Email', value: 'a@b.co' }, { label: 'Phone', value: '9876543210' }]} />
        <Ledger caption="Sample ledger" rows={[{ id: 1, n: 'Design', a: 24000 }, { id: 2, n: 'Build', a: 36000 }]} gutter columns={[{ key: 'n', header: 'Item', primary: true }, { key: 'a', header: 'Amount', num: true }]} />
        <Totals subTotal={60000} totalDiscount={0} totalTax={10800} grandTotal={70800} />
      </div></Sheet>
      <Sheet><h2>States</h2><LedgerSkeleton rows={2} /><EmptyState title="Empty">Nothing here yet.</EmptyState><ErrorState message="Network error" onRetry={() => {}} /></Sheet>
      <div className="cluster"><Button onClick={() => setOpen(true)}>Open modal</Button><Button onClick={() => toast.success('Saved')}>Success toast</Button><Button onClick={() => toast.error('Failed', 'Details here')}>Error toast</Button><Button onClick={() => toast.undoable('Deleted item', { undo: () => toast.info('Restored'), commit: () => {} })}>Undo toast</Button></div>
      <Modal open={open} onClose={() => setOpen(false)}><Modal.Header title="Modal" description="Focus is trapped here." /><Modal.Body>Body</Modal.Body><Modal.Footer><Button onClick={() => setOpen(false)}>Close</Button></Modal.Footer></Modal>
    </div>
  )
}
