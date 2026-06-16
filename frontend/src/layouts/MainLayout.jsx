import { Outlet } from "react-router-dom";

function MainLayout() {
  return (
    <>
      <h2>LOGO</h2>

      <Outlet />

      <footer>FOOTER</footer>
    </>
  );
}

export default MainLayout;
