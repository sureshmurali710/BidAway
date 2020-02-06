const mongocollection = require('../database/mongoCollection');
const userdata=mongocollection.users
const itemdata=mongocollection.items
const ObjectID= require("mongodb").ObjectID
const ratingsdata=mongocollection.ratings
const userfunctions= require("./user")

async function createrating(userid,itemid,ratings){
    if(!userid || typeof userid!=="string") throw "No from userid defined"
    if(!itemid || typeof itemid!=="string") throw "No Item id defined"
    if(!ratings || typeof ratings!=="string") throw "No ratings defined"


    ratingsnumber=Number.parseInt(ratings)

    if(ratingsnumber>5 || isNaN(ratingsnumber)) throw "Ratings should be a number out of 5"

    

    const itemcollection=await itemdata();
    const item= await itemcollection.findOne({_id:ObjectID(itemid)})

    const usercollection=await userdata();
    const user= await usercollection.findOne({_id:ObjectID(userid)})
    
    


    if(!item) throw "No Item with that id"
    if(!user) throw "No user with that id"
    const existratingid =await this.getratingbyuseranditem(userid,itemid)
    if( existratingid !==undefined){
        const ratingscollection= await ratingsdata()
        const insertedratings= await ratingscollection.updateOne({_id:ObjectID(existratingid)},{$set:{ratings:parseInt(ratings)}})
        return await this.getrating(existratingid)




    }
    else{
        const newratings={
            userid:userid,
            itemid:itemid,
            ownerid:item.userid,
            ratings:ratingsnumber,
            hasrated:true
        }
    
        const ratingscollection= await ratingsdata()
        const insertedratings= await ratingscollection.insertOne(newratings)
        const newid= insertedratings.insertedId;
        if(insertedratings.insertedCount==0) throw new Error("The ratings could not be added")
    
        const itemadd=await itemcollection.update({_id:ObjectID(itemid)},{$addToSet:{rating:String(newid)}})
        return await this.getrating(newid)

    }
    
    


    



}

async function getrating(id){
    if(!id) {
        throw "Please enter an id"
    }
    const ratingscollection= await ratingsdata()
    const ratings= await ratingscollection.findOne({_id:ObjectID(id)})
    if(ratings===undefined) throw "no item with that id"

    
    
    return ratings


}

async function getratingbyuseranditem(userid,itemid){
    if(!userid) {
        throw "Please enter an user id"
    }
    if(!itemid) {
        throw "Please enter an item id"
    }
    const ratingscollection= await ratingsdata()
    const ratings= await ratingscollection.find({userid:String(userid)}).toArray()
    if(ratings.length!=0){
        for(let i=0;i<ratings.length;i++){
           
            if(ratings[i].itemid==itemid){
                return ratings[i]._id
            }
        }
    }
    

    

}

const getratingsforuser= async(userid)=>{
    if(!userid) throw "No userid defined"
    const user = await userfunctions.getuser(userid)
   
  

    
  

    const ratingcollection= await ratingsdata()


    const averagrating=await ratingcollection.aggregate(
        [
          {
            $group:
              {
                _id: "$ownerid",
              
                averagerating: { $avg: "$ratings" }
              }
          }
        ]
        
     )
     let userrating=0
     await averagrating.forEach(function(myDoc) { 
       
       if(String(user._id)==myDoc._id){
         userrating=myDoc.averagerating
       }
      

       
     })
     
     await userfunctions.editratings(String(user._id),userrating)

     return userrating
     

    
}


module.exports={
    createrating,
    getrating,
    getratingbyuseranditem,
    getratingsforuser
}