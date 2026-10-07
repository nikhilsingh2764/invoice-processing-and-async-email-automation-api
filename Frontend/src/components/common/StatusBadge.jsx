import Badge from './Badge';
import { STATUS_TONE } from './status';

export default function StatusBadge({ status }) {
  return <Badge tone={STATUS_TONE[status] ?? 'neutral'}>{status || 'Unknown'}</Badge>;
}
