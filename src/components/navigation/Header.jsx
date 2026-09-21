import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

import Logo from "../common/Logo";
import Container from "../common/Container";
import NavLinks from "./NavLinks";
import { ROUTES } from "../../constants/routes";

const Header = () => {

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);

  }, []);

  useEffect(() => {

    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };

  }, [mobileMenuOpen]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border-b border-slate-200/70 bg-white/80 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80"
            : "bg-transparent"
        }`}
      >
        <Container>
          <div className="flex h-20 items-center justify-between">
            <Logo />

            <nav className="hidden items-center gap-10 lg:flex">
              <NavLinks />
            </nav>

            <div className="hidden items-center gap-4 lg:flex">
              <Link
                to={ROUTES.LOGIN}
                className="rounded-lg px-5 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Login
              </Link>

              <Link
                to={ROUTES.SIGNUP}
                className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                Get Started
              </Link>
            </div>

            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-lg p-2 lg:hidden"
            >
              <Menu size={28} />
            </button>
          </div>
        </Container>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm lg:hidden">
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-2xl dark:bg-slate-950">
            <div className="flex items-center justify-between border-b p-5">
              <Logo />

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg p-2"
              >
                <X size={26} />
              </button>
            </div>

            <div className="flex flex-col gap-6 p-6">
              <NavLinks mobile />

              <hr />

              <Link
                to={ROUTES.LOGIN}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl border border-slate-300 px-4 py-3 text-center font-semibold transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                Login
              </Link>

              <Link
                to={ROUTES.SIGNUP}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl bg-blue-600 px-4 py-3 text-center font-semibold text-white transition hover:bg-blue-700"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;