
Moralis.Cloud.afterSave("ItemListed", async (request)=>{
    const confirmed = request.object.get("confirmed");
    const logger = Moralis.Cloud.getLogger();
    logger.info("looking for confirmed Tx...");
    if(confirmed){
        const ActiveItem = Moralis.Object.extend("ActiveItem");

        const query = new Moralis.Query(ActiveItem);
        query.equalTo("nftAddress", request.object.get("nftAddress"));
        query.equalTo("tokenId", request.object.get("tokenId"));
        query.equalTo("marketplaceAddress", request.object.get("address"));
        query.equalTo("seller", request.object.get("seller"));
        const AlreadyListedItem = await query.first();

        if (AlreadyListedItem){
                logger.info(`Deleting already listed Item with tokenId: ${request.object.get("tokenId")}, at address ${request.object.get("address")}...`);
                await AlreadyListedItem.destroy();
                logger.info("Regenerating the listing...");
        }
        const activeItem = new ActiveItem();
        activeItem.set("marketplaceAddress", request.object.get("address"));
        activeItem.set("nftAddress",request.object.get("nftAddress"));
        activeItem.set("price", request.object.get("price"));
        activeItem.set("tokenId",request.object.get("tokenId"));
        activeItem.set("seller", request.object.get("seller"));
        logger.info(`Adding address: ${request.object.get("address")}. TokenId: ${request.object.get("tokenId")}`);
        logger.info("Saving...");
        await activeItem.save();
    }
})

Moralis.Cloud.afterSave("ItemCancelled", async (request)=>{
    const confirmed = request.object.get("confirmed");
    const logger = Moralis.Cloud.getLogger();
    logger.info(`Marketplace | Object: ${request.object}`);
    if (confirmed){
        const ActiveItem = Moralis.Object.extend("ActiveItem");
        const query = new Moralis.Query(ActiveItem);
        query.equalTo("marketplaceAddress", request.object.get("address"));
        query.equalTo("nftAddress", request.object.get("nftAddress"));
        query.equalTo("tokenId", request.object.get("tokenId"));
        logger.info(`Marketplace | Query: ${query}`);
        const cancelledItem = await query.first();
        logger.info(`Marketplace | Cancelled Item: ${cancelledItem}`);
        if (cancelledItem){
            logger.info(`Deleting ${request.object.get("tokenId")} at address ${request.object.get("address")} since it was cancelled`);
            await cancelledItem.destroy();
        }
        else {
            logger.info(`No item found with address: ${request.object.get("address")} and tokenId: ${request.object.get("tokenId")}`);
        }
    }
})

Moralis.Cloud.afterSave("ItemBought", async (request)=>{
    const confirmed = request.object.get("confirmed");
    const logger = Moralis.Cloud.getLogger();
    logger.info(`Marketplace | Object: ${request.object}`);
    if (confirmed){
        const ActiveItem = Moralis.Object.extend("ActiveItem");
        const query = new Moralis.Query(ActiveItem);
        query.equalTo("marketplaceAddress", request.object.get("address"));
        query.equalTo("nftAddress", request.object.get("nftAddress"));
        query.equalTo("tokenId", request.object.get("tokenId"));
        logger.info(`Marketplace | Query: ${query}`);
        const boughtItem = await query.first();
        logger.info(`Marketplace | Bought Item ${boughtItem}`);
        if (boughtItem){
            logger.info(`Item Bought with tokenId: ${request.object.get("tokenId")} at address ${request.object.get("address")}, deleting...`);
            await boughtItem.destroy();
        }
        else {
            logger.info(`No item found with address: ${request.object.get("address")} and tokenId: ${request.object.get("tokenId")}`);
        }
    }

});