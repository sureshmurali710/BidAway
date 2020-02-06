const userdata = require("../data/user")
const itemdata= require("../data/items")
const mongoCollection= require("../database/mongoCollection")
const ratings=mongoCollection.ratings

const ObjectId = require('mongodb').ObjectId; 



const getratingsforuser= async(userid)=>{
    const user= await userdata.getuser(userid)
   
  

    
  

    const ratingcollection= await ratings()


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
     
     await userdata.editratings(String(user._id),userrating)

     return userrating
     

    
}

module.exports=getratingsforuser

