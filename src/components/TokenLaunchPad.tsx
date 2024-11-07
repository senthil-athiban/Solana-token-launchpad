import React, { useState } from 'react'

const TokenLaunchPad = () => {
    const [name, setName] = useState("");
    const [symbol, setSymbol] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [initialSupply, setInitialSupply] = useState("");

    const handleCreateToken = async () => {
      
    }
  return (
    <div className='border px-2 py-4 flex flex-col gap-y-6 rounded-lg w-full max-w-md'>
        <input type="text" className='bg-white bg-opacity-20 p-2' placeholder='Name' onChange={(e) => setName(e.target.value)}/>
        <input type="text" className='bg-white bg-opacity-20 p-2' placeholder='Symbol' onChange={(e) => setSymbol(e.target.value)}/>
        <input type="text" className='bg-white bg-opacity-20 p-2' placeholder='Image url' onChange={(e) => setImageUrl(e.target.value)}/>
        <input type="text" className='bg-white bg-opacity-20 p-2' placeholder='Initial supply' onChange={(e) => setInitialSupply(e.target.value)}/>
        <button className='bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg hover:pink-300 p-2'>Create Token</button>
    </div>
  )
}

export default TokenLaunchPad