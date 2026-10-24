import { Monitor, Moon, Rows3, Sun } from 'lucide-react'
import { Menu } from '../ui/Menu.jsx'
import { useTheme } from '../../hooks/useTheme.jsx'

export function ThemeMenu({ showDensity = false }) {
  const { theme, setTheme, density, setDensity } = useTheme()
  const items = [
    { heading: 'Theme' },
    { label: 'Light', icon: Sun, checked: theme === 'light', onSelect: () => setTheme('light') },
    { label: 'Dark', icon: Moon, checked: theme === 'dark', onSelect: () => setTheme('dark') },
    { label: 'System', icon: Monitor, checked: theme === 'system', onSelect: () => setTheme('system') },
  ]
  if (showDensity) {
    items.push({ separator: true }, { heading: 'Table density' }, { label: 'Comfortable', icon: Rows3, checked: density === 'comfortable', onSelect: () => setDensity('comfortable') }, { label: 'Compact', icon: Rows3, checked: density === 'compact', onSelect: () => setDensity('compact') })
  }
  return <Menu label="Appearance" icon={theme === 'dark' ? Moon : Sun} iconOnly caret={false} variant="ghost" items={items} />
}
