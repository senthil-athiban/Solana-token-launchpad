import React from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";

const Appbar = () => {
  const { connected } = useWallet();
  return (
    <nav className="flex justify-between shadow-md w-full px-2 py-4">
      <div className="">
        <p>Token launchpad</p>
      </div>
      <div>
        {connected ? <WalletDisconnectButton /> : <WalletMultiButton />}
      </div>
    </nav>
  );
};

export default Appbar;
