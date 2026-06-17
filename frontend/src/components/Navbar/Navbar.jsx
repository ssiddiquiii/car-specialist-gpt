import NavLinks from "../NavLinks/NavLinks";
import Logo from "../Logo/Logo";

function Navbar() {
  return (
    <header className="border-b border-gray-200">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
        <Logo />

        <NavLinks />
      </div>
    </header>
  );
}

export default Navbar;
