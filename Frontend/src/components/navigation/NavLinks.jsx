import { NavLink } from "react-router-dom";
import { ROUTES } from "../../constants/routes";

const links = [
  {
    name: "Home",
    path: ROUTES.HOME,
  },
  {
    name: "Features",
    path: "#features",
  },
  {
    name: "How It Works",
    path: "#how-it-works",
  },
  {
    name: "FAQ",
    path: "#faq",
  },
];

const NavLinks = ({ mobile = false }) => {
  return (
    <>
      {links.map((link) => (
        <NavLink
          key={link.name}
          to={link.path}
          className={`font-medium transition-colors duration-200 hover:text-blue-600 ${
            mobile ? "text-lg py-2" : ""
          }`}
        >
          {link.name}
        </NavLink>
      ))}
    </>
  );
};

export default NavLinks;