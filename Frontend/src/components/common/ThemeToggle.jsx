import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../theme/theme-context';

const ORDER = ['light', 'dark', 'system'];
const META = {
  light: { icon: Sun, label: 'Light' },
  dark: { icon: Moon, label: 'Dark' },
  system: { icon: Monitor, label: 'System' },
};

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];
  const { icon: Icon, label } = META[theme];
  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      title={`Theme: ${label}. Click for ${META[next].label}`}
      aria-label={`Theme: ${label}. Switch to ${META[next].label}`}
      className="grid size-9 place-items-center rounded-lg text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
    >
      <Icon className="size-[18px]" aria-hidden />
    </button>
  );
}
