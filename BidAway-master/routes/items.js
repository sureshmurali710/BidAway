const express = require("express");
const ObjectID = require('mongodb').ObjectID;
const router = express.Router();
const items = require("../data/items");
const userData = require("../data/user");
const itemsForBid = require("../data/bids");
const ratings=require("../data/ratings");

const isValidString = (str) => {
    return typeof str === 'string' && str.length > 0;
};

const parseDate = (dtstr) => {
    return new Date();
};

router.get("/", async (req, res) => {
    const categories = ["Electronics", "Furniture"];

    const allItems = {};
    try {
        for (let i = 0; i < categories.length; ++i) {
            const cat = categories[i];
            allItems[cat] = await items.getItemsByCategory(cat);

            allItems[cat] = allItems[cat].map(i => {
                i.startTime = i.startTime.toLocaleString();
                return i;
            });
        }
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
    }
    let user={}
    if(req.session.userdata!==undefined){
        user= await userData.getuser(req.session.userdata)
    }
    console.log(req.session);
    res.redirect("/bids")
    return;
});

router.get('/additem', async (req, res) => {
    let user={}
    if(req.session.userdata!==undefined){
        user= await userData.getuser(req.session.userdata)
    }
    
    res.render("additem",{isloggedin: req.session.isloggedin,user:user,category:"Electronics"});
});

router.get("/:id", async (req, res) => {
    const id = req.params.id;
    req.session.itemid=req.params.id;
    
    try {
        ObjectID(id);
    } catch (e) {
        res.status(400).json({ error: 'Invalid Item Id' });
        return;
    }

    let item;
    let ownerrating
    let userrating=0
    let userhasrated=false
    
    
    try {
       
        item = await items.getItemById(id);
        ownerrating= await ratings.getratingsforuser(item.userid.id)

        if(req.session.isloggedin!==undefined && req.session.isloggedin===true){
            rating_id= await ratings.getratingbyuseranditem(req.session.userdata,id);
            

            if(rating_id!==undefined){
                rating= await ratings.getrating(rating_id)
                userrating=rating.ratings
                userhasrated=rating.hasrated
               

            }
            

        }
        userrating=userrating+""
        userrating=userrating.substring(0,userrating.indexOf('.')+2)
        console.log(userrating)
        
        item.userid.ratings=ownerrating


    } catch (e) {
        console.error(e);
        res.status(404).json({ error: 'Page not Found' });
        return;
    }

    if (!item) {
        res.status(404).json({ error: 'Item Not Found' });
        return;
    }
    let user={}

    if(req.session.userdata!==undefined){
        
        user= await userData.getuser(req.session.userdata)
       
    }

    const itemForBid = await itemsForBid.getItemForBidByItemID(id);
    if(!itemForBid){
        console.log(Invalid);
    }
    
    isowner=(String(item.userid.id)===req.session.userdata)

    itemForBid.bids = itemForBid.bids.slice(0,10);
    
    const isUserAdmin = req.session.isUserAdmin || false;
    res.render('itemfullview', {
        isloggedin: req.session.isloggedin,
        item: item,
        itemid: id,
        user: user,
        userrating:userrating,
        userhasrated:userhasrated,
        showItem: !item.removed,
        isUserAdmin: isUserAdmin,
        user_id:user._id,
        itemForBid:itemForBid,
        isowner: isowner,
        showRemove: isUserAdmin || isowner
    });
});

router.get('/edititem/:id',async(req,res)=>{
    id=req.params.id
    const item= await items.getItemById(id)
    if(req.session.userdata!==undefined){
        
        user= await userData.getuser(req.session.userdata)
       
    }
    isowner=(String(item.userid.id)===req.session.userdata)
    if(isowner){
        res.status(200).render("edititem",{itemForBid:item,isloggedin: req.session.isloggedin,user:user,itemid:id})

    }
    else{
        res.sendStatus(403)
    }

})

router.put('/edititem/:id',async (req,res)=>{
    if(req.session.isloggedin===undefined || req.session.isloggedin===false){
           
        res.redirect("/bids");
    }
    let id=req.params.id
    let errors=[]
    const item= await items.getItemById(id)
    if(req.session.userdata!==undefined){
        
        user= await userData.getuser(req.session.userdata)
       
    }
    try{

        
        updatediteminfo=req.body
        if(updatediteminfo.item_title===''){
        errors.push("No Item name mentioned")
      }
     
      if(updatediteminfo.description===''){
        errors.push("No Item description mentioned")
      }
      if(errors.length>0){
          throw "Error"
      }
      updateInfo={}
      updateInfo.name=updatediteminfo.item_title
      updateInfo.description=updatediteminfo.description
      console.log(1)
      const itemInfo= await items.updateitem(id,updateInfo)
    

      res.redirect("/item/"+id)

    }
    catch(e){
        
        res.status(400).render("edititem",{hasErrors:true,errors:errors,itemForBid:item,isloggedin: req.session.isloggedin,user:user,itemid:id})

    }
    






})

router.get("/cat/:cat", async (req, res) => {
    const cat = req.params.cat;

    let catItems;
    try {
        catItems = await items.getItemsByCategory(cat);
    } catch (e) {
        res.status(500).json({ error: 'Internal Server Error' });
        return;
    }

    res.json(catItems);
});

router.post("/", async (req, res) => {
    const item = xss(req.body);

    const err = [];
    if (!isValidString(item.name))
        err.push('Invalid Item Name');

    if (!isValidString(item.description))
        err.push('Invalid Item Description');

    if (!isValidString(item.image))
        err.push('Invalid Item image');

    if (err.length !== 0) {
        res.status(400).json({ error: err });
        return;
    }

    let itemObj;
    try {
        itemObj = await items.addItem(item.name,
                                item.description,
                                item.image,
                                req.session.userdata);
    } catch (e) {}

    if (!itemObj) {
        res.status(500).json({ error: 'Internal Server Error' });
        return;
    }

    res.json(itemObj);
});

router.delete('/:id', async (req, res) => {
    const id = req.params.id;

    let item;
    try {
        item = await items.getItemById(id);
    } catch (e) {
        console.log(e);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
        return;
    }

    if (item == null) {
        res.status(404).json({ success: false, error: 'Item Not Found' });
        return;
    }

    console.log(req.session.userdata, item.userid.id.toString());
    if (req.session.userdata !== item.userid.id.toString() && !req.session.isUserAdmin) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    let removedItem;
    try {
        removedItem = await items.markItemRemove(id);
    } catch (e) {
        console.log(e);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
        return;
    }

    res.status(200).json({ success: true,
        removedItem
    });

});

module.exports = router;
