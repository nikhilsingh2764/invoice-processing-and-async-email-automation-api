import { Outlet } from 'react-router-dom';
import Logo from '../components/common/Logo';
import ThemeToggle from '../components/common/ThemeToggle';

export default function AuthLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <header className="flex items-center justify-between px-4 py-4 sm:px-8">
        <Logo />
        <ThemeToggle />
      </header>
      <main className="grid flex-1 place-items-center px-4 pb-12">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
