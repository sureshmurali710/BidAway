const express= require("express")
const router = express.Router();
const data = require("../data");
const ratings=data.ratings


router.post("/", async function(req,res){
 try{
    const rating=req.body
    const userid=req.session.userdata
    const itemid= req.session.itemid
    console.log(rating)
    console.log(userid)
    console.log(itemid)
    const ratinginfo = await ratings.createrating(String(userid),String(itemid),String(rating.description))
    console.log(ratinginfo)
    res.sendStatus(200)
    return;

 }
 catch(e){
     console.log(e)
     res.status(500).json({error:e})

 }

    

    
    

});

module.exports=router;