// DashboardUserLayout.tsx
import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/auth-context";
import { SideBar } from "./dashboard_user/sideBar/sideBar";
import TopNavbar from "./dashboard_user/TopNavbar";

export default function DashboardUserLayout() {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  );
}

function DashboardContent() {
  const { entreprise, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("entreprise in dashboard user layout: ",entreprise)
    if (!loading && !entreprise) {
      console.log("No entreprise authenticated, redirecting to /");
      navigate("/");
    }
  }, [entreprise, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-orvanta flex items-center justify-center">
        <div className="text-white text-lg">Chargement...</div>
      </div>
    );
  }

  if (!entreprise) {
    return null;
  }

  return (
    <div className="min-h-screen bg-orvanta">
      <div className="flex h-full">
        <SideBar />
        <div className="flex-1 flex flex-col relative">
          <TopNavbar />
          <main className="flex-1 p-6 pb-24 relative mx-auto w-full max-w-8xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 p-6">
              {/* React Router will inject the current page here */}
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
