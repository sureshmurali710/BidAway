const userdata=require("./user")
const commments=require("./comments")
const items= require("./items")
const ratings=require("./ratings")
const bids=require("./bids")

// async function main(){
//     try{
      
        
       
//         const comment= await items.markItemRemove("5df52683b3d8211804971da3")
       
//        console.log(comment)
        
        

//     }
//     catch(e){
//         console.log(e)
//     }
    
// }

// main()

module.exports={
    users:userdata,
    comments:commments,
    items:items,
    ratings:ratings
}