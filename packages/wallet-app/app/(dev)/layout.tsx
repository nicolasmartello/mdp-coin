import { Footer } from "~~/components/Footer";
import { Header } from "~~/components/Header";

/**
 * Desktop layout for developer tools (Debug Contracts, Block Explorer).
 */
const DevLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-screen flex-col bg-base-200">
    <Header />
    <main className="relative flex flex-1 flex-col">{children}</main>
    <Footer />
  </div>
);

export default DevLayout;
