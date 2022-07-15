import { useState } from "react";
import {Modal, Input, useNotification, Button} from "web3uikit";
import { useWeb3Contract } from "react-moralis";
import nftMarketplaceAbi from "../constants/NftMarketplace.json";
import {ethers} from "ethers";


export default function UpdateListingModal({nftAddress, tokenId, isVisible, marketplaceAddress, onClose}){

    const dispatch = useNotification();

    const [PriceToUpdateListingWith, setPriceToUpdateListingWith] = useState(0);
    
    const handleUpdateListingSuccess = async (tx) => {
        await tx.wait(1);
        dispatch({
            type:"success",
            message:"Listing Updated!",
            title: "Listing updated - please refresh(and move blocks)",
            position: "topR"
        })
        onClose && onClose()
        setPriceToUpdateListingWith("0")
    }

    const handleCancelSuccess = async (tx) => {
        await tx.wait(1);
        onClose();
        dispatch({
            type:"success",
            message:"Listing Cancelled!",
            title: "Listing cancelled - please refresh(and move blocks)",
            position: "topR"
        })
    }

    const {runContractFunction: updateListing} = useWeb3Contract({
        abi: nftMarketplaceAbi,
        contractAddress: marketplaceAddress,
        functionName: "updateListing",
        params: {
            nftAddress: nftAddress,
            tokenId: tokenId,
            newPrice: ethers.utils.parseEther(PriceToUpdateListingWith || "0")
        }
    })

    const {runContractFunction: cancelListing} = useWeb3Contract({
        abi: nftMarketplaceAbi,
        contractAddress: marketplaceAddress,
        functionName: "cancelListing",
        params: {
            nftAddress: nftAddress,
            tokenId: tokenId,
        }
    })

    return (
        <Modal 
        isVisible = {isVisible}
        onCancel = {onClose}
        onCloseButtonPressed = {onClose}
        onOk = {() => {
            updateListing({onError: (error) => {console.log(error)},
            onSuccess: handleUpdateListingSuccess
            });
        }}
        >
              <div className="flex justify-start"
        >
            <Input className = "mr-4"
            label="Update Listing Price in L1 currency (ETH)"
            name = "New listing price"
            type = "number"
            onChange={(event) =>{
                setPriceToUpdateListingWith(event.target.value);
            }}
            />
              
      
          <Button text="Cancel listing" theme="colored" color="red" onClick={
            ()=>{cancelListing({
                onError: (error) => {console.log(error)},
            onSuccess: handleCancelSuccess
            })
        }
            }/>
        </div>
       
        
        </Modal>
    )

}