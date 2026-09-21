import { useState, useRef, useEffect } from "react";
import { User, LogOut, Settings, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

import useAuthStore from "../../store/auth.store";

function ProfileDropdown() {
  const navigate = useNavigate();

  const dropdownRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);

  const { user, logout } = useAuthStore();

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const handleLogout = async () => {
    await logout();

    navigate("/login");
  };

  return (
    <div
      className="relative"
      ref={dropdownRef}
    >
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-xl p-2 transition hover:bg-slate-100"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
          {user?.username?.charAt(0)?.toUpperCase() || "U"}
        </div>

        <ChevronDown
          size={18}
          className={`transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="border-b p-5">
            <h3 className="font-semibold text-slate-900">
              {user?.username || "User"}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {user?.email}
            </p>
          </div>

          <button
            onClick={() => {
              navigate("/profile");
              setIsOpen(false);
            }}
            className="flex w-full items-center gap-3 px-5 py-3 text-left transition hover:bg-slate-50"
          >
            <User size={18} />
            My Profile
          </button>

          <button
            className="flex w-full items-center gap-3 px-5 py-3 text-left transition hover:bg-slate-50"
          >
            <Settings size={18} />
            Settings
          </button>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-5 py-3 text-left text-red-600 transition hover:bg-red-50"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default ProfileDropdown;