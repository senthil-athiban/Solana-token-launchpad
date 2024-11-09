import React, { useState } from "react";
import { toast } from "react-toastify";
import {
  createInitializeMetadataPointerInstruction,
  createInitializeMint2Instruction,
  createInitializeMintInstruction,
  ExtensionType,
  getMinimumBalanceForRentExemptMint,
  getMintLen,
  LENGTH_SIZE,
  MINT_SIZE,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  TYPE_SIZE,
} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import {
  createInitializeInstruction,
  pack,
  TokenMetadata,
} from "@solana/spl-token-metadata";

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
    const decimals = 9;
    const metadata: TokenMetadata = {
      mint: mintKeyPair.publicKey,
      name: name,
      symbol: symbol,
      uri: imageUrl,
      additionalMetadata: [["new-field", "new-value"]],
    };

    const mintLen = getMintLen([ExtensionType.MetadataPointer]);
    const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;
    const lamports = await connection.getMinimumBalanceForRentExemption(
      mintLen + metadataLen
    );

    const transaction = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: publicKey,
        newAccountPubkey: mintKeyPair.publicKey,
        space: mintLen,
        lamports,
        programId: TOKEN_2022_PROGRAM_ID,
      }),
      createInitializeMetadataPointerInstruction(
        mintKeyPair.publicKey,
        publicKey,
        mintKeyPair.publicKey,
        TOKEN_2022_PROGRAM_ID
      ),
      createInitializeMintInstruction(
        mintKeyPair.publicKey,
        decimals,
        publicKey,
        null,
        TOKEN_2022_PROGRAM_ID
      ),
      createInitializeInstruction({
        programId: TOKEN_2022_PROGRAM_ID,
        mint: mintKeyPair.publicKey,
        metadata: mintKeyPair.publicKey,
        name: metadata.name,
        symbol: metadata.symbol,
        uri: metadata.uri,
        mintAuthority: publicKey,
        updateAuthority: publicKey,
      })
    );

    transaction.feePayer = publicKey;
    const recentBlockHash = await connection.getLatestBlockhash();
    transaction.recentBlockhash = recentBlockHash.blockhash;

    // partially sign the transaction
    transaction.partialSign(mintKeyPair);

    // get confirmation from the payer in the launchpad and send the transaction onto sol blockchain
    const res = await sendTransaction(transaction, connection);
    console.log(" res : ", res);
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
