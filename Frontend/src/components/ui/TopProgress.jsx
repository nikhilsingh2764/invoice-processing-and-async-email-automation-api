import { useNavigation } from 'react-router'

export function TopProgress() {
  const nav = useNavigation()
  const active = nav.state !== 'idle'
  return (
    <div className="top-progress" data-active={active ? 'true' : undefined} role="progressbar" aria-hidden={!active} aria-label="Loading page">
      <span />
    </div>
  )
}
