import { Outlet } from 'react-router'
import { SiteHeader, SiteFooter } from '../components/layout/SiteChrome.jsx'
import { PolicyNotice } from '../components/layout/Banners.jsx'

export default function PublicLayout() {
  return (
    <>
      <PolicyNotice />
      <SiteHeader />
      <main id="main" className="marketing">
        <Outlet />
      </main>
      <SiteFooter />
    </>
  )
}
