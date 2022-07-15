import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import {Form, useNotification, Button} from "web3uikit"
import nftMarketplaceAbi from "../constants/NftMarketplace.json";
import nftAbi from "../constants/BasicNft.json";
import {ethers} from "ethers";
import { useMoralis, useWeb3Contract } from 'react-moralis';
import networkMapping from "../constants/networkMapping.json";
import { useState, useEffect } from 'react';



export default function Home() {
const dispatch = useNotification();
const {chainId, account, isWeb3Enabled} = useMoralis();
const chainIdStr = chainId ? parseInt(chainId).toString() : "31337";
const {runContractFunction} = useWeb3Contract();
const [proceeds, setProceeds] = useState("0");

useEffect(() => {
  if(isWeb3Enabled){
      setupUI()
  }
}, [proceeds, account, isWeb3Enabled, chainId])

async function setupUI() {
  const returnedProceeds = await runContractFunction({
      params: {
          abi: nftMarketplaceAbi,
          contractAddress: marketplaceAddress,
          functionName: "getProceeds",
          params: {
              seller: account,
          },
      },
      onError: (error) => console.log(error),
  })
  if (returnedProceeds) {
      setProceeds(returnedProceeds.toString())
  }
}

  const marketplaceAddress = networkMapping[chainIdStr].NftMarketplace[0];
  console.log(marketplaceAddress);

  async function approveAndList(data){
    console.log("Approving...");
    const nftAddress = data.data[0].inputResult;
    const tokenId = data.data[1].inputResult;
    const price = ethers.utils.parseUnits(data.data[2].inputResult, "ether").toString();
    const approveOptions = {
      abi: nftAbi,
      contractAddress: nftAddress,
      functionName: "approve",
      params: {
        to: marketplaceAddress,
        tokenId: tokenId
      }
    }

    await runContractFunction({
      params: approveOptions,
      onSuccess:() => {handleApproveSuccess(nftAddress,tokenId,price)},
      onError: (error) => {console.log("error")}

    })

  }

  async function handleApproveSuccess(nftAddress, tokenId, price){
    console.log("NFT Approved! Listing...");
    const listOptions = {
      abi: nftMarketplaceAbi,
      contractAddress: marketplaceAddress,
      functionName: "listItem",
      params: {
        nftAddress: nftAddress,
        tokenId:tokenId,
        price:price
      }
    }

  async function handleListSuccess(tx){
    await tx.wait(1);
        dispatch({
            type:"success",
            message:"Successfully listed an NFT!",
            title: "Listing successful - please refresh(and move blocks)",
            position: "topR"
        })
  }

    await runContractFunction({
      params:listOptions,
      onSuccess: handleListSuccess,
      onError: (error) => {console.log(error)}
    })
  }

  const handleWithdrawSuccess = async (tx) => {
    await tx.wait(1)
    dispatch({
        type: "success",
        message: "Withdrawing proceeds",
        position: "topR",
    })
}

  return (
    <div className="items-start">
    <Form
      onSubmit={approveAndList}
      data = {[
        {
        name: "NFT Address",
        type: "text",
        inputWidth: "50%",
        value:"",
        key:"nftAddress"
        },

        {
          name:"Token Id",
          type: "number",
          value:"",
          inputWidth: "50%",
          key: "tokenId"
        },
        {
          name:"Price (in ETH)",
          type: "number",
          value:"",
          inputWidth: "50%",
          key: "price"
        }
      ]}
      title = "List your NFT!"
      id = "Main Form"
      />
      <div className='px-4'>
       <h2 style={{color: "#68738D"}} className='text-2xl font-bold text-Gray-100 mb-3'>Withdraw {ethers.utils.formatEther(proceeds)} ETH proceeds</h2>
            {proceeds != "0" ? (
                <Button
                    onClick={() => {
                        runContractFunction({
                            params: {
                                abi: nftMarketplaceAbi,
                                contractAddress: marketplaceAddress,
                                functionName: "withdrawProceeds",
                                params: {},
                            },
                            onError: (error) => console.log(error),
                            onSuccess: handleWithdrawSuccess,
                        })
                    }}
                    text="Withdraw"
                    type="button"
                />
            ) : (
                <div>No proceeds detected</div>
            )}
        </div>
        </div>
  )
}



