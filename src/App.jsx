
import { ToastContainer } from "react-toastify";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
} from "@solana/wallet-adapter-react-ui";
import Appbar from "./components/Appbar";
import TokenLaunchPad from "./components/TokenLaunchPad";
import "react-toastify/dist/ReactToastify.css";
import "@solana/wallet-adapter-react-ui/styles.css";
import "./App.css";


function App() {
  return (
    <div>
      <ConnectionProvider endpoint="https://api.devnet.solana.com">
        <WalletProvider wallets={[]} autoConnect>
          <WalletModalProvider>
            <div className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 w-full">
              <Appbar />
              <div className="w-full h-screen flex justify-center items-center">
                <TokenLaunchPad />
              </div>
            </div>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
      <ToastContainer />
    </div>
  );
}

export default App;
