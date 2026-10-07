import Modal from './Modal';
import Button from '../common/Button';

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', tone = 'danger', loading = false, onConfirm, onCancel, children }) {
  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onCancel}
      dismissible={!loading}
      title={title}
      size="sm"
      footer={(
        <>
          <Button variant="secondary" onClick={onCancel} disabled={loading}>Cancel</Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} loading={loading} data-autofocus>
            {confirmLabel}
          </Button>
        </>
      )}
    >
      {message && <p className="break-words text-sm text-fg-muted">{message}</p>}
      {children}
    </Modal>
  );
}
