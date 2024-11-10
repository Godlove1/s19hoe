import { AuthContextProvider } from "@/lib/Authcontext";


export const metadata = {
  title: "Admin | Health Over Everything",
  description: "Discover our natural remedies for a healthier life.",
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
