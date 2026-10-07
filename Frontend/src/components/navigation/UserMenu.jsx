import { useNavigate } from 'react-router-dom';
import { Building2, ChevronDown, LogOut, UserCircle } from 'lucide-react';
import Dropdown from '../common/Dropdown';
import { useAuth } from '../auth/auth-context';
import { useToast } from '../feedback/toast-context';

export default function UserMenu() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const name = user?.username || 'Account';

  const handleSignOut = async () => {
    await signOut();
    toast.info('You have been signed out.');
    navigate('/login', { replace: true });
  };

  return (
    <Dropdown
      items={[
        { label: 'Account settings', icon: UserCircle, onClick: () => navigate('/profile') },
        { label: 'Business profile', icon: Building2, onClick: () => navigate('/business') },
        { divider: true },
        { label: 'Sign out', icon: LogOut, onClick: handleSignOut, danger: true },
      ]}
      trigger={(props) => (
        <button
          type="button"
          {...props}
          aria-label="Open account menu"
          className="flex h-10 items-center gap-2 rounded-lg px-1.5 transition-colors hover:bg-surface-2 sm:pr-2"
        >
          <span className="grid size-8 place-items-center rounded-full bg-brand text-sm font-semibold uppercase text-brand-fg">
            {name.charAt(0)}
          </span>
          <span className="hidden max-w-32 truncate text-sm font-medium text-fg sm:block">{name}</span>
          <ChevronDown className="hidden size-4 text-fg-subtle sm:block" aria-hidden />
        </button>
      )}
    />
  );
}
