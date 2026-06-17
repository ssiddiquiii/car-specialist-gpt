import { Outlet } from "react-router-dom";
import Logo from "../components/Logo/logo";
import Footer from "../components/Footer/Footer";

function MainLayout() {
  return (
    <>
      <Logo />

      <Outlet />

      <Footer />
    </> 
  );
}

export default MainLayout;
