const express = require("express");
const uuidv1 = require('uuid/v1');
const router = express.Router();
const itemForBidDataApi = require("../data/bids");
const userData = require("../data/user");
const xss= require("xss")

router.get("/:id", async (req, res) => {
  try {
    const bid = await itemForBidDataApi.getItemForBidByID(req.params.id);
    res.status(200).json(bid);
  } catch (e) {
    res.status(404).json();
  }
});

router.get("/", async (req, res) => {
  try {
    var bidList = {};
    let user={}
    if(req.session.userdata!==undefined){
        user= await userData.getuser(req.session.userdata)
    }
    var category;
    if(!user || !user.categoryinterest){
    bidList = await itemForBidDataApi.getAllActiveItemsForBid();
    category = "All"
    } else {
    bidList = await itemForBidDataApi.getItemsForBidByCategory(user.categoryinterest);
    category = user.categoryinterest;
    }


    res.render("searchMain",{
      activeBidList:bidList,
      user_id:req.session.userdata,
      isloggedin:req.session.isloggedin,
      user:user,
      category:category,
      isMainPage:true});

  } catch (e) {
    console.log("Error in bids/ route get(\"/\") method");
    console.log(e);
    res.status(500).send();
  }
});

router.post("/search", async (req, res) => {
    try {

      let user={}
      if(req.session.userdata!==undefined){
        user= await userData.getuser(req.session.userdata)
      }
      
      const activeBidList = await itemForBidDataApi.getItemsForBidByCategory(xss(req.body.category));

      res.render("searchMain",{
        activeBidList:activeBidList,
        category:req.body.category,
        user_id:req.session.userdata,
        isloggedin:req.session.isloggedin,
        user:user,
        isSearch:true});
      
    } catch (e) {
      console.log("Error in bids /search route post(\"/\") method");
      console.log(e);
      res.sendStatus(500);
    }
  });

router.post("/", async (req, res) => {
  let errors=[]
  let ItemInput
  let user={}
    if(req.session.userdata!==undefined){
        user= await userData.getuser(req.session.userdata)
    }
  try {

    ItemInput = req.body;
    console.log(ItemInput)

    if (!req.files || Object.keys(req.files).length === 0 || !req.files.itemImage) {
      errors.push("No image was uploaded")
    }
    
    if(ItemInput.item_title===''){
      errors.push("No Item name mentioned")
    }
   
    if(ItemInput.description===''){
      errors.push("No Item description mentioned")
    }
    if(ItemInput.time_period===''){
      errors.push("No Item time period mentioned")
    }
    if(ItemInput.starting_price===''){
      errors.push("No Item time Starting price mentioned")

    }
    if(ItemInput.category===''){
      errors.push("No Item Category period mentioned")
    }


        const itemImage = req.files.itemImage;
        const indexOfDot = itemImage.name.lastIndexOf('.');
        if (indexOfDot === -1) {
            error.push('Invalid image filename');
        }
    
      if(errors.length>0){
        throw "item input incomplete"
      }

        const itemImageExt = itemImage.name.substring(indexOfDot + 1);
        const imageFilename = uuidv1() + '.' + itemImageExt;
        console.log(imageFilename);
        ItemInput.image = 'public/images/' + imageFilename; 

        ItemInput.starting_price=parseFloat(ItemInput.starting_price)
     
        ItemInput.user_id=req.session.userdata;
        console.log(ItemInput)
        const catArr = [];
        catArr.push(ItemInput.category);
        ItemInput.category = catArr;
        const newItems = await itemForBidDataApi.addItemForBid(ItemInput);
        
        itemImage.mv(ItemInput.image, function (err) {
            if (err) {
                console.log('Failed to upload image: ', err);
            }
        });

        res.redirect("/item/"+newItems.item_id);
      } catch (e) {
          console.log('Bad Req: ' + e);
        res.status(400).render("additem",{hasErrors:true,errors:errors,itemForBid:ItemInput,isloggedin: req.session.isloggedin,user:user,category:ItemInput.category})
      }
});

router.post("/:id",async (req,res) => {
  try {

    if(!req.body.price || !req.body.user_id){
      res.sendStatus(400);
      return;
    }

    await itemForBidDataApi.addNewBid(req.params.id,req.body.price,req.body.user_id);
    res.sendStatus(200);
  } catch (e) {
    res.sendStatus(500);
  }

});



module.exports = router;
