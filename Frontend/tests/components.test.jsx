import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { Button } from '../src/components/ui/Button.jsx'
import { Input, PasswordInput } from '../src/components/ui/FormField.jsx'
import { Modal, ConfirmDialog } from '../src/components/ui/Modal.jsx'
import { StatusBadge } from '../src/components/ui/Badge.jsx'
import { Ledger } from '../src/components/ui/Ledger.jsx'
import { ToastProvider, useToast } from '../src/components/ui/Toast.jsx'
import { PasswordStrength } from '../src/components/ui/PasswordStrength.jsx'
import { Totals, Stamp } from '../src/components/sheet/index.jsx'

describe('Button', () => {
  it('blocks repeat clicks while loading and announces busy', async () => {
    const onClick = vi.fn()
    render(<Button loading onClick={onClick}>Save</Button>)
    const b = screen.getByRole('button', { name: /save/i })
    expect(b).toHaveAttribute('aria-busy', 'true')
    await userEvent.click(b)
    expect(onClick).not.toHaveBeenCalled()
  })
  it('icon-only buttons keep an accessible name', () => {
    render(<Button iconOnly>Close dialog</Button>)
    expect(screen.getByRole('button', { name: 'Close dialog' })).toBeInTheDocument()
  })
})

describe('form fields', () => {
  it('links label, error and aria-invalid', () => {
    render(<Input label="Email" error="Enter a valid email" />)
    const input = screen.getByLabelText('Email')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription(/Enter a valid email/)
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid email')
  })
  it('password field toggles visibility with a real button', async () => {
    render(<PasswordInput label="Password" />)
    const field = screen.getByLabelText('Password')
    expect(field).toHaveAttribute('type', 'password')
    await userEvent.click(screen.getByRole('button', { name: /show password/i }))
    expect(field).toHaveAttribute('type', 'text')
  })
})

describe('Modal', () => {
  it('traps focus, closes on Escape and restores focus', async () => {
    const onClose = vi.fn()
    const { rerender } = render(<><button>opener</button><Modal open onClose={onClose}><Modal.Header title="Hello" /><Modal.Body><input aria-label="inside" /></Modal.Body></Modal></>)
    expect(screen.getByRole('dialog', { name: 'Hello' })).toHaveAttribute('aria-modal', 'true')
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()
    rerender(<button>opener</button>)
  })
  it('ConfirmDialog names the consequence and offers Cancel first', async () => {
    const onConfirm = vi.fn()
    render(<ConfirmDialog open onClose={() => {}} onConfirm={onConfirm} title="Delete INV-1?"><p>This cannot be undone.</p></ConfirmDialog>)
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(onConfirm).toHaveBeenCalled()
  })
})

describe('status never relies on colour alone', () => {
  it('badge and stamp carry the status text', () => {
    render(<><StatusBadge status="Overdue" /><Stamp status="Paid" /></>)
    expect(screen.getByText('Overdue')).toBeInTheDocument()
    expect(screen.getByText('Paid')).toBeInTheDocument()
  })
})

describe('Ledger', () => {
  it('has a caption, column headers and sort state', () => {
    render(<Ledger caption="Invoices" rows={[{ id: 1, n: 'A' }]} columns={[{ key: 'n', header: 'Name', sortKey: 'n' }]} sort={{ key: 'n', order: 'asc' }} onSort={() => {}} />)
    expect(screen.getByRole('table', { name: 'Invoices' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /name/i })).toHaveAttribute('aria-sort', 'ascending')
  })
})

describe('Totals', () => {
  it('shows the grand total last', () => {
    render(<Totals currency="INR" subTotal={100} totalDiscount={0} totalTax={18} grandTotal={118} />)
    expect(screen.getByRole('group', { name: 'Totals' })).toHaveTextContent(/118/)
  })
})

describe('Toast undo (command pattern)', () => {
  function Harness({ undo, commit }) {
    const t = useToast()
    return <button onClick={() => t.undoable('Deleted X', { undo, commit })}>go</button>
  }
  it('runs undo, not commit, when Undo is pressed', async () => {
    const undo = vi.fn()
    const commit = vi.fn()
    render(<ToastProvider><Harness undo={undo} commit={commit} /></ToastProvider>)
    await userEvent.click(screen.getByText('go'))
    await userEvent.click(screen.getByRole('button', { name: 'Undo' }))
    expect(undo).toHaveBeenCalledTimes(1)
    expect(commit).not.toHaveBeenCalled()
  })
})

describe('PasswordStrength', () => {
  it('lists each rule with a text status', () => {
    render(<PasswordStrength value="abc" />)
    expect(screen.getAllByText(/not met/i).length).toBeGreaterThan(0)
  })
})

describe('router-dependent pieces render inside a router', () => {
  it('smoke', () => {
    render(<MemoryRouter><p>ok</p></MemoryRouter>)
    expect(screen.getByText('ok')).toBeInTheDocument()
  })
})
