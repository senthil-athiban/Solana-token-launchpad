import React, { useState } from "react";
import { toast } from "react-toastify";
import {
  createInitializeMint2Instruction,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";

const TokenLaunchPad = () => {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [initialSupply, setInitialSupply] = useState("");

  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const handleCreateToken = async () => {
    if (!publicKey) {
      toast.error("Wallet not connected");
      return;
    }
    const mintKeyPair = Keypair.generate();

    const lamports = await getMinimumBalanceForRentExemptMint(connection);

    const transaction = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: publicKey,
        newAccountPubkey: mintKeyPair.publicKey,
        space: MINT_SIZE,
        lamports,
        programId: TOKEN_PROGRAM_ID,
      }),
      createInitializeMint2Instruction(
        mintKeyPair.publicKey,
        6,
        publicKey,
        publicKey,
        TOKEN_PROGRAM_ID
      )
    );

    transaction.feePayer = publicKey;
    const recentBlockHash = await connection.getLatestBlockhash();
    transaction.recentBlockhash = recentBlockHash.blockhash;

    // partially sign the transaction
    transaction.partialSign(mintKeyPair);

    // get confirmation from the payer in the launchpad and send the transaction onto sol blockchain
    await sendTransaction(transaction, connection);
  };
  return (
    <div className="border px-2 py-4 flex flex-col gap-y-6 rounded-lg w-full max-w-md">
      <input
        type="text"
        className="bg-white bg-opacity-20 p-2"
        placeholder="Name"
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="text"
        className="bg-white bg-opacity-20 p-2"
        placeholder="Symbol"
        onChange={(e) => setSymbol(e.target.value)}
      />
      <input
        type="text"
        className="bg-white bg-opacity-20 p-2"
        placeholder="Image url"
        onChange={(e) => setImageUrl(e.target.value)}
      />
      <input
        type="text"
        className="bg-white bg-opacity-20 p-2"
        placeholder="Initial supply"
        onChange={(e) => setInitialSupply(e.target.value)}
      />
      <button
        className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg hover:pink-300 p-2"
        onClick={handleCreateToken}
      >
        Create Token
      </button>
    </div>
  );
};

export default TokenLaunchPad;
