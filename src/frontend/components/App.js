import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import React, { Component } from 'react';
import './App.css';
import { ethers } from "ethers";
import { useState } from "react";
import Navigation from "../components/Navbar";
import Home from "../components/Home";
import Create from "../components/Create";
import MyListedItems from "../components/MyListedItem";
import MyPurchases from "../components/MyPurchases";
import MarketplaceAbi from "../contractsData/Marketplace.json";
import MarketplaceAddress from "../contractsData/Marketplace-address.json";
import NFTAbi from "../contractsData/NFT.json";
import NFTAddress from "../contractsData/NFT-address.json";
import  { Spinner }  from "reactstrap"

function App() {

  // useState hook use to store values on the front end
  const [loading, setLoading] = useState(true)
  const [account, setAccount] = useState(null)
  const [nft, setNFT] = useState({})
  const [marketplace, setMarketplace] = useState({})

  //  Wallet login/connect  
  const web3Handler = async () => {

    // Query list of wallet addrs
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });

    // Set the wallet account to the 1st addrs
    setAccount(accounts[0])

    // Get provider from wallet address eg haspack/MM
    const provider = new ethers.providers.Web3Provider(window.ethereum)

    // Set signer
    const signer = provider.getSigner()

    // Load contract from the blockchain and sign
    loadContracts(signer)
  }

  const loadContracts = async (signer) => {
    // Get deployed copies of contract
    
    const marketplace = new ethers.Contract(MarketplaceAddress.address, MarketplaceAbi.abi, signer)
    setMarketplace(marketplace)
    const nft = new ethers.Contract(NFTAddress.address, NFTAbi.abi, signer)
    setNFT(nft)
    setLoading(false)
  }
  return (
    <BrowserRouter>
      <div className= "App">     
        <Navigation web3Handler={web3Handler} account={account} />   
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignitems: 'center', minHeight: '80vh' }}>
            <Spinner animation="border" style={{ display: 'flex' }} />
            <p className='mx-3 my-0'> Awaiting Metamask Connection...</p>
          </div>
        ) : (
          <Routes>
            <Route path="/" element={<Home marketplace={marketplace} nft={nft}/>} />
            <Route path="/create" element={<Create marketplace={marketplace} nft={nft}/>} />
            <Route path="/my-listed-items" element={''} />
            <Route path="/my-purchases" element={''} />
          </Routes>
        )}

      </div>

    </BrowserRouter>
  );
}

export default App;
