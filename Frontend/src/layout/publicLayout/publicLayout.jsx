import { Outlet } from "react-router-dom";
import Header from "../../components/navigation/Header"
import Footer from "../../components/navigation/Footer";


const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
      <Header />

      <main className="pt-20">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default PublicLayout;