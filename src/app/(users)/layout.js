
import { CartProviderContext } from "@/lib/CartProvider";
import Header from "./landPageComps/Header";
import Footer from "./landPageComps/Footer";
import Chat from "@/components/custom/chat";
import { AuthContextProvider } from "@/lib/Authcontext";

export default function UserLayout({ children }) {
  return (
    <>
      <AuthContextProvider>
        <CartProviderContext>
          <Chat />
          <div className="min-h-screen  flex flex-col">
            <div className="flex-grow">
              <Header />
              {children}
            </div>
            <Footer />
          </div>
        </CartProviderContext>
      </AuthContextProvider>
    </>
  );
}
