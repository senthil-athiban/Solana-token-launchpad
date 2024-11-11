import { useWallet } from "@solana/wallet-adapter-react";
import {
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import solana from "../assets/sol3d.png";

const Appbar = () => {
  const { connected } = useWallet();
  return (
    <nav className="flex justify-between shadow-md w-full px-2 py-4">
      <div className="flex justify-center items-center">
        <img src={solana} width={"50px"} height={"50px"} className="mr-2"/>
        <h2 className="bg-gradient-to-r from-purple-800 to-blue-800 bg-clip-text text-transparent text-xl">TOKEN LAUNCHPAD</h2>
      </div>
      <div>
        {connected ? <WalletDisconnectButton /> : <WalletMultiButton />}
      </div>
    </nav>
  );
};

export default Appbar;
