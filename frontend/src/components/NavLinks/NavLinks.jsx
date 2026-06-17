import { Link } from "react-router-dom";

function NavLinks() {
  return (
    <nav className="flex items-center gap-6">
      <Link
        to="/login"
        className="text-sm font-medium hover:text-blue-600 transition-colors"
      >
        Sign In
      </Link>

      <Link
        to="/register"
        className="text-sm font-medium hover:text-blue-600 transition-colors"
      >
        Register
      </Link>
    </nav>
  );
}

export default NavLinks;
