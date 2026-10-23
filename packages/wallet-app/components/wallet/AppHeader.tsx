import { MdpLogo } from "~~/components/wallet/MdpLogo";
import { NetworkChip } from "~~/components/wallet/NetworkChip";

export const AppHeader = () => (
  <header className="flex items-center gap-2.5 px-4 pt-4 pb-2">
    <MdpLogo className="size-7" decorative />
    <span className="flex-1 font-semibold">MdpCoin</span>
    <NetworkChip />
  </header>
);
