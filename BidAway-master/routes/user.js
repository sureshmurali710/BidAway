const express= require("express")
const router = express.Router();
const data = require("../data");
const userData = data.users
const itemdata = data.items



router.get("/" ,async function(req,res){
    console.log(1)
    if(req.session.isloggedin!==undefined && req.session.isloggedin==true){
        res.redirect("/users/userdetails");
        return;
    }
    res.status(200).render("newuser",{title:"Create New User"})
    return;

})

function isValidDate(dateString) {
  var regEx = /^\d{4}-\d{2}-\d{2}$/;
  if(!dateString.match(regEx)) return false;  // Invalid format
  var d = new Date(dateString);
  var dNum = d.getTime();
  if(!dNum && dNum !== 0) return false; // NaN value, Invalid date
  return d.toISOString().slice(0,10) === dateString;
}

router.post("/",async function(req,res){
    const userinfo=req.body;
    const error=[]
    if(!userinfo){
        error.push("No Data Entered")
    }
    if(!userinfo.username){
        error.push("No User Name Entered")
    }
    if(!userinfo.emailid){
        error.push("No Email ID Entered")
    }
    if(!userinfo.phone_num){
        error.push("No Phone Number Entered")
    }
    if(!userinfo.password){
        error.push("No Password Entered")
    }
    if(!userinfo.DOB){
        error.push("No Date of Birth Entered")
    }

    console.log("DOB: " + userinfo.DOB);
    if (!isValidDate(userinfo.DOB)) {
        error.push("Invalid date format. Please use yyyy-mm-dd");
    }

    const ageDifMs = Date.now() - new Date(userinfo.DOB).getTime();
    const ageDate = new Date(ageDifMs); // miliseconds from epoch
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    if (age < 18) {
        error.push("You should be 18+")
    }

    if(error.length>0){
        res.status(400).render('newuser',{title:"Create New User",hasErrors:true,errors:error,userinfo:userinfo})
        return;
    }
    try{
        const newuser= await userData.createuser(userinfo.username,userinfo.emailid,userinfo.password,userinfo.phone_num,userinfo.DOB,userinfo.category)
        
       
        res.status(200).render('Usercreation',{user: newuser})
        return;
    }
    catch(e){
        error.push(e)
        res.status(400).render('newuser',{title:"Create New User",errors:error,hasErrors:true,userinfo:userinfo})
        return;
    }
})

router.get("/edituser",async function(req,res){
    try{

        const userdata=await userData.getuser(req.session.userdata)
        console.log(req.session)
        res.render('edituser',{userinfo:userdata,isloggedin:req.session.isloggedin,user:userdata})
    }
    catch{
        res.sendStatus(403)
    }
})

router.put("/edituser",async function(req,res){
    
    updateduserinfo1=req.body
    console.log(1)
    console.log(updateduserinfo1)
  
    errors=[]
    const olduserdata= await userData.getuser(req.session.userdata)
    
    
    updateuser={}
    if(!updateduserinfo1){
        res.sendStatus(404)
    }
    if(updateduserinfo1.username){
        updateuser.newUserName=updateduserinfo1.username
    }
    if(updateduserinfo1.emailid){
        updateuser.newEmailId=updateduserinfo1.emailid
    }
    if(updateduserinfo1.phone_num){
        updateuser.newPhoneNum=updateduserinfo1.phone_num
    }
    if(updateduserinfo1.DOB){
        updateuser.newDOB=updateduserinfo1.DOB
    }
    
    
  
   
    try{
        if (!isValidDate(updateuser.newDOB)) {
            throw "Invalid date format. Please use yyyy-mm-dd";
        }
    
        const ageDifMs = Date.now() - new Date(updateuser.newDOB).getTime();
        const ageDate = new Date(ageDifMs); // miliseconds from epoch
        const age = Math.abs(ageDate.getUTCFullYear() - 1970);
        if (age < 18) {
            throw "You should be 18+"
        }
        console.log(updateuser)
        
        const user=await userData.updateuser(req.session.userdata,updateuser)
        
        res.redirect("userdetails")
    }
    catch(e){
        console.log(e)
        console.log(updateduserinfo1)
        errors.push(e)
        res.status(400).render('edituser',{userinfo:updateduserinfo1,isloggedin:req.session.isloggedin,user:olduserdata,errors:errors,hasErrors:true})
    }
    return;
})

router.get("/passwordchange/:id", async function(req,res){
    try{
        const user=await userData.getuser(req.params.id)
        res.status(200).render("passwordchange",{title:"Password Change", userinfo:user})

    }
    catch(e){
        error.push(e)
        res.status(404).json({userinfo:userdata,isloggedin:req.session.isloggedin,user:userdata,errors:e,hasErrors:true})
    }
    
})

router.put("/:id/passwordchange", async function(req,res){
    const passwords=req.body

    if(!passwords){
        res.sendStatus(404)
        return;
    }
    if(passwords.oldpassword===undefined || passwords.newpassword===undefined){
        res.sendStatus(404)
        return;
    }
    try{
        await userData.getuser(req.params.id)
    }
    catch(e){
        res.status(404).json({error:e})
        return;
    }
    try{
        const passwordchange= await userData.changepassword(req.params.id,passwords.oldpassword,passwords.newpassword)
        res.status(200).json(passwordchange)
        return;
    }
    catch(e){
        res.sendStatus(505)
        return;
    }

})

router.get("/userdetails", async function(req,res){
    try{
       
            const user= await userData.getuser(req.session.userdata)
            items_sold=[]
            if(user.items_sold.length!=0){
                for(i=0;i<user.items_sold.length;i++){
                    let item=await itemdata.getItemById(user.items_sold[i])
                    if(item.removed===undefined || item.removed!==true ){
                        items_sold.push({id:item._id,name:item.name})

                    }
                    
                }
            }
            user.items_sold=items_sold
            items_won=[]
            if(user.items_won.length!=0){
                for(i=0;i<user.items_won.length;i++){
                    let item=await itemdata.getItemById(user.items_won[i])
                    if(item.removed===undefined || item.removed!==true ){
                    items_won.push({id:item._id,name:item.name})
                    }
                }
            }
            user.items_won=items_won
            console.log(user)
            
            res.status(200).render("profile",{user:user,isloggedin:req.session.isloggedin})
            return;

    }
    catch(e){
        res.sendStatus(500)
        return;
    }
})

router.get("/userlogin",async function(req,res){
    if(req.session.isloggedin===true){
        res.redirect("/bids")
        return;
        
    }
    
    res.status(200).render("index")
    return;
})

router.post("/userlogin",async function(req,res){
    
    const userdetail=req.body
    console.log(1)
    error=[]
    if(!userdetail.username){
        error.push("no username entered")
        res.status(404).render("index",{hasErrors:true,errors:error})
        return;
    } 
    if(!userdetail.password){
        error.push("no passsword entered")
        res.status(404).render("index",{hasErrors:true,errors:error})
        return;
        
    }
    try{
        
        const userlogin=  await userData.verifyuser(userdetail.username,userdetail.password)
        console.log(userlogin);
        req.session.userdata=userlogin._id
        req.session.isloggedin=true
        req.session.isUserAdmin = userlogin.isUserAdmin || false;
        const user= await userData.getuser(req.session.userdata)
        res.redirect("/bids")
    }
    catch(e){
        error.push(e)
        res.status(401).render("index",{hasErrors:true,errors:error})
        return;
    }
})

router.get("/logout",async function(req,res){
   
      req.session.isLoggedIn=false
      req.session.destroy();
      
      
      res.redirect("/bids")
    
      
})

module.exports=router
