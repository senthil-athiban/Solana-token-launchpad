import  { useState } from "react";
import { toast } from "react-toastify";
import {
  createAssociatedTokenAccountInstruction,
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  ExtensionType,
  getAssociatedTokenAddressSync,
  getMintLen,
  LENGTH_SIZE,
  TOKEN_2022_PROGRAM_ID,
  TYPE_SIZE,
} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import {
  createInitializeInstruction,
  pack,
} from "@solana/spl-token-metadata";

const TokenLaunchPad = () => {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [initialSupply, setInitialSupply] = useState(0);

  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();


  const mintToken = async (mintKeyPair) => {

    if(!mintKeyPair?.publicKey) {
      toast.error("No mint account has been created");
      return;
    }
    if (!publicKey) {
      toast.error("Wallet not connected");
      return;
    }
    
    try {

      // get the ata token address
      const ataToken = getAssociatedTokenAddressSync(
        mintKeyPair?.publicKey,
        publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      );

      // create an instruction for ata account 
      const tx1 = new Transaction().add(
        createAssociatedTokenAccountInstruction(
          publicKey,
          ataToken,
          publicKey,
          mintKeyPair.publicKey,
          TOKEN_2022_PROGRAM_ID
        )
      );
  
      // confirm on the user's wallet
      const response = await sendTransaction(tx1, connection);
  
      if(!response?.length) return;
      toast.success('Associated token account created successfully');

      // minting tokens
      const tx2 = new Transaction().add(
        createMintToInstruction(
          mintKeyPair.publicKey,
          ataToken,
          publicKey,
          100 * initialSupply,
          [],
          TOKEN_2022_PROGRAM_ID
        )
      );
  
      // confirm on the user's wallet
      await sendTransaction(tx2, connection);
      toast.success('Tokens minted successfully');
    } catch (error) {
      console.log('Transaction failed : ', error);
      toast.error('Transaction failed');
    }
  }

  const handleCreateToken = async () => {
    if (!publicKey) {
      toast.error("Wallet not connected");
      return;
    }

    // create a new keypair
    const mintKeyPair = Keypair.generate();
    const decimals = 9;

    // create token meatadata
    const metadata = {
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

    // create a transaction to create token along with meta data
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
    await sendTransaction(transaction, connection);

    // mint some tokens
    await mintToken(mintKeyPair);
  };

  return (
    <div className="border p-4 py-8 flex flex-col gap-y-6 rounded-lg w-full max-w-md">
      <h2 className="text-lg p-2 bg-gradient-to-r from-purple-400 via-blue-400 to-green-400 text-white font-mono text-center">CREATE TOKEN</h2>
      <input
        type="text"
        className="bg-white bg-opacity-20 p-2 placeholder-gray-300 rounded-lg"
        placeholder="Name"
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="text"
        className="bg-white bg-opacity-20 p-2 placeholder-gray-300 rounded-lg"
        placeholder="Symbol"
        onChange={(e) => setSymbol(e.target.value)}
      />
      <input
        type="text"
        className="bg-white bg-opacity-20 p-2 placeholder-gray-300 rounded-lg"
        placeholder="Image url"
        onChange={(e) => setImageUrl(e.target.value)}
      />
      <input
        type="text"
        className="bg-white bg-opacity-20 p-2 placeholder-gray-300 rounded-lg"
        placeholder="Initial supply"
        onChange={(e) => setInitialSupply(parseInt(e.target.value, 10))}
      />
      <button
        className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg hover:pink-300 p-2 text-white"
        onClick={handleCreateToken}
      >
        Create Token
      </button>
    </div>
  );
};

export default TokenLaunchPad;
