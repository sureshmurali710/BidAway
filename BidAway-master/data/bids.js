  
const mongoCollections = require("../database/mongoCollection");
const itemForBidCollectionObj = mongoCollections.itemsForBid;
var ObjectId = require('mongodb').ObjectId; 
const itemDataApi = require("./items");

/**
 * Adds a bid to the DB
 * @param {object} bidInput 
 */
const addItemForBid = async function addItemForBid(itemForBid){
    

    if(!itemForBid.user_id || !typeof itemForBid.user_id === "string") throw "Invalid User Id";
    console.log(itemForBid)
    if( !itemForBid.starting_price || !typeof itemForBid.starting_price === "number") throw "Invalid Starting Price";
    if( !itemForBid.category ||!Array.isArray(itemForBid.category) || itemForBid.category.length === 0) throw "Error in category";
    if(!itemForBid.time_period || !typeof itemForBid.time_period === "object") throw "Error ending time";

    const date = new Date();
    const time = parseInt(itemForBid.time_period);
    date.setMinutes(date.getMinutes() + time);
    var item = {};
    var now = new Date();

    try{
      item = await itemDataApi.addItem(itemForBid.item_title,
        itemForBid.description,itemForBid.image,itemForBid.user_id);
    } catch(err){
        throw err;
    }
    const newItemForBid = {
        "starting_price" : itemForBid.starting_price,
        "current_price": itemForBid.starting_price,
        "category" : itemForBid.category,
        "starting_time" : now,
        "ending_time":date,
        "item_id":item._id,
        "winner": null,
        "bids":[]

    }

    const itemforBidCollection = await itemForBidCollectionObj();
    const insertInfo = await itemforBidCollection.insertOne(newItemForBid);
    if (insertInfo.insertedCount === 0) throw "Could not create Bid";
  
    const newId = insertInfo.insertedId;

    const addedBid = await getItemForBidByID(newId);
    return addedBid;
}

/**
 * This function searches by id and returns a single Bid
 * 
 * @param {string} id 
 */
const getItemForBidByID = async function getItemForBidByID(id) {

    if (!id) throw "You must provide an id to search for";
    if(! typeof id in ['string','object']) throw "You must provide a string or objectId";
    if(typeof id === "string")
        id = ObjectId(id);

    const itemForBidCollection = await itemForBidCollectionObj();
    ItemForBid = await itemForBidCollection.findOne({ _id: ObjectId(id) });
    if (!ItemForBid) throw "No Items with that id";
    return ItemForBid;
  }

/**
 * This function searches by id and returns a single Bid
 * 
 * @param {string} id 
 */
const getItemForBidByItemID = async function getItemForBidByItemID(id) {

    if (!id) throw "You must provide an id to search for";
    if(! typeof id in ['string','object']) throw "You must provide a string or objectId";
    if(typeof id === "string")
       id = ObjectId(id);

    const itemForBidCollection = await itemForBidCollectionObj();
    ItemForBid = await itemForBidCollection.findOne({ item_id: id});
    if (!ItemForBid) throw "No Items with that id";
    return ItemForBid;
  }  

/**
 * This function returns all the bids
 */
const getAllItemsForBid = async function getAllItemsForBid() {

    const bidsCollection = await itemForBidCollectionObj();
    const allbids = await bidsCollection.find({}).toArray();
    return buildItemForBidDisplayData(allbids,false,true);
  }

  /**
 * This function returns all the active bids
 */
const getAllActiveItemsForBid = async function getAllActiveItemsForBid() {

    const bidsCollection = await itemForBidCollectionObj();
    const allbids = await bidsCollection.find({}).toArray();
    return buildItemForBidDisplayData(allbids,true,true);
  }

async function buildItemForBidDisplayData(allbids,shouldBeActive,remDeletedItems){
    let allbidsObj = [];
    const itemsDataApi = require("./items");
    const userDataApi = require("./user");

    for(let bid of allbids){
        
        const now = new Date();
        const et = new Date(bid.ending_time);
        if(shouldBeActive && et < now)
        continue;

        const item = await itemsDataApi.getItemById(bid.item_id);
        if(!item || (remDeletedItems && item.removed))
            continue;

        const user = await userDataApi.getuser(item.userid.id);

        var img = item.image;
        if(!img)
            img = "../public/images/placeholder.png";
                        
            

        const bidObj = {
            "_id" : bid._id,
            "username" : user.username,
            "user_id":user._id,
            "starting_price": bid.starting_price,
            "starting_time": bid.starting_time,
            "ending_time": bid.ending_time,
            "category":bid.category,
            "current_price":bid.current_price,
            "show_img":img,
            "item_title":item.name,
            "item_id":bid.item_id
        }

        allbidsObj.push(bidObj);
    }

    
    allbidsObj.sort((a, b) => {
        return new Date(a.ending_time) - new Date(b.ending_time) });
    return allbidsObj;
}

/**
 * Finds active bids by category
 * @param {string} category 
 */
const getItemsForBidByCategory = async function getItemsForBidByCategory(categoryInput){
    
    if(!categoryInput || typeof categoryInput !== 'string') 
        throw "You must provide a proper category";
    
    if(categoryInput == "All") 
        return getAllActiveItemsForBid();
    
    const bidsCollection = await itemForBidCollectionObj();
    let allbids = await bidsCollection.find({category:categoryInput}).toArray();

    return buildItemForBidDisplayData(allbids,true,true);
  }


const addNewBid = async function addNewBid(id,price,user_id){
    try {
    
    if (!id) throw "You must provide an id to search for";
    if(! typeof id in ['string','object']) throw "You must provide a string or objectId";
    if(typeof id === 'string')
        id = ObjectId(id);
    if(!price || isNaN(price))
        throw "price is Not a number";
    if (!user_id) throw "You must provide an user id";
    if(! typeof user_id in ['string','object']) throw "You must provide a string or objectId";
    if(typeof user_id === 'string')
        user_id = ObjectId(user_id);

    const user = await require("./user").getuser(user_id);
    if(!user) throw "No user with that Id"

    const bidCollection = await itemForBidCollectionObj();
    const itemForBid = await getItemForBidByID(id);

    if(!itemForBid) "Bid not found";

    var et = itemForBid.ending_time;
    var now = new Date();

    if(et.valueOf() < now.valueOf())
        throw "Bid Over";
    
    if(et.valueOf() - now.valueOf() < 10000){
        var c = 10000 - (et.valueOf() - now.valueOf());
        c = c/1000;
        et.setSeconds(et.getSeconds() + Math.ceil(c)); 
    }

    if(price < itemForBid.current_price) throw "Invalid price";
    const bidTime = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
    const bid = {
        user_id: user_id,
        user : user.username,
        price : price,
        time : bidTime
    }

    const bids = itemForBid.bids;
    bids.unshift(bid);

    let updatedPost = { $set:{
            current_price : price,
            ending_time : et,
            bids : bids
    }};

    await bidCollection.updateOne({ _id: id }, updatedPost);

    const resjson = {
        "id":id,
        "price":price,
        "et":et,
        "bid":bid
    }

    return resjson;
    

    } catch (error) {
        throw error;
    }
}

const bidWinnerUpdate = async function updateWinners(){
    
    const bidsCollection = await itemForBidCollectionObj();
    let allbids = await bidsCollection.find({winner:null}).toArray();
    const userDataApi = require("./user");
    for(let bid of allbids){
        const now = new Date();
        const et = new Date(bid.ending_time);
        if(et > now)
        continue;

        console.log("1 winner updated")
        const bidArray = bid.bids;
        const winningBid = bidArray[0];
        var updatedPost ={
            $set:{winner:"no winner"}
        };

        if(!winningBid){
            bidsCollection.updateOne({ _id: bid._id }, updatedPost);
        } else {
            updatedPost = {
                $set:{winner:winningBid.user_id}
            }
            bidsCollection.updateOne({ _id: bid._id },updatedPost);
            userDataApi.additem_winner(winningBid.user_id,bid.item_id);
        }

    }
}

const updateBidPrice =  async function updateBidPrice(id, price) {
    try {
        
    if (!id) throw "You must provide an id to search for";
    if(! typeof id in ['string','object']) throw "You must provide a string or objectId";
    if(typeof id === 'string')
        id = ObjectId(id);
    console.log(price);
    if(!price || isNaN(price))
        throw "price is Not a number";

    const bidCollection = await itemForBidCollectionObj();
    const bid = await getItemForBidByID(id);

    var et = bid.ending_time;
    var now = new Date();
    
    if(et.valueOf() - now.valueOf() < 3600000)
        et.setMinutes(et.getMinutes() + 10); 

    

    if(!bid) throw "No bid found";
    if(price < bid.current_price) throw "Invalid price";
         let updatedPost = { $set:{
            current_price : price,
            ending_time : et,
            bids : bids
    }};

    await bidCollection.updateOne({ _id: id }, updatedPost);

    const resjson = {
        "id":id,
        "price":price,
        "et":et
    }

    return resjson;
    } catch (error) {
        console.log("error in update time" + error);
    }
}


module.exports = {
    addItemForBid,
    getItemForBidByID, 
    getAllItemsForBid,
    updateBidPrice,
    getItemsForBidByCategory,
    getAllActiveItemsForBid,
    addNewBid,
    bidWinnerUpdate,
    getItemForBidByItemID

}
