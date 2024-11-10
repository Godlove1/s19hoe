import { AuthContextProvider } from "@/lib/Authcontext";


export const metadata = {
  title: "Admin Dashboard | Health Over Everything",
  description: "HOE administration.",
};

export default function DashboardLayout({ children }) {

  
  return (
    <>
      <AuthContextProvider>
        <div className="min-h-screen  flex flex-col">
          <div className="flex-grow">
            {children}
          </div>
        </div>
      </AuthContextProvider>
    </>
  );
}
