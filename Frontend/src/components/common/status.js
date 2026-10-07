export const STATUS_TONE = {
  Draft: 'neutral',
  Pending: 'warning',
  Paid: 'success',
  'Partially Paid': 'info',
  Overdue: 'danger',
  Cancelled: 'purple',
};

// CSS variable per status, for charts.
export const STATUS_COLOR = {
  Draft: 'var(--neutral)',
  Pending: 'var(--warning)',
  Paid: 'var(--success)',
  'Partially Paid': 'var(--info)',
  Overdue: 'var(--danger)',
  Cancelled: 'var(--purple)',
};
