const mongocollection = require('../database/mongoCollection');
const userdata=mongocollection.users
const ObjectID= require("mongodb").ObjectID
const passwordhash=require('password-hash')



async function createuser(username,emailid,password,phonenum, DOB,category,isUserAdmin){

    if(!username) throw "username is undefined"
    if(typeof username!="string") throw "username is not of type string"
    if(username.length<6) throw "username should be of length 6 or more"

    if(!emailid) throw "no email id id given"
    const mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if(typeof emailid!= "string") throw "Email id is not type string"

    if(!emailid.match(mailformat)){
        throw "Email id is not correct format"
    }
    if(phonenum===undefined) throw "No phone number is defined"
    if(phonenum.length !=10  || isNaN(Number(phonenum))) throw "Incorrect Phone number format written"

    if(!password) throw "password is undefined"
    if(typeof password!="string") throw "password is not of type string"
    if(password.length<8) throw "password should be of length 10"

    if(!DOB) throw "No DOB entered"
    if(typeof DOB!="string") throw "DOB is not of type string"

    if(!category) throw "No Category mentioned"

    let hashpassword=passwordhash.generate(password);
    if(!isUserAdmin) isUserAdmin = false;
    
    const newuser={
        username:username,
        emailid:emailid,
        password:hashpassword,
        phone_num:phonenum,
        DOB:DOB,
        categoryinterest:category,
        items_sold:[],
        items_won:[],
        email_verfication:false,
        reports:0,
        isactive:true,
        lowerusername:username.toLowerCase(),
        comments:[],
        ratings:0,
        isUserAdmin:isUserAdmin

    }
    const usercollection= await userdata()
    const user= await usercollection.findOne({lowerusername:username.toLowerCase()})
    const user1= await usercollection.findOne({emailid:emailid})
    const user2= await usercollection.findOne({phone_num:phonenum})
    if(user){
        throw "User with that username already exists"
    }
    if(user1){
        throw "User with that email ID already exists"
    }
    if(user2){
        throw "User with that Phone Number already exists"
    }
    const inserteduser= await usercollection.insertOne(newuser)
    if(inserteduser.insertedCount==0) throw new Error("The user could not be added")
    return newuser
    


}

async function getuser(id){

    if(!id) throw "No Id is defined"
    const usercollection= await userdata()
    const user= await usercollection.findOne({_id:ObjectID(id)})
    if(!user){
        throw `No user with that id ${id}`
    }
    
    return user
}
// try{
//     console.log(createuser("abinmj007","abinmartin.jones@gmail.con","jones1995","2013886964"))
// }
// catch(e){
//     console.log(e)
// }

async function updateuser(id, updatedinfo){
    if(!id) throw "no Id is not defined"
    
    updateduserinfo={}
    if(updatedinfo.newUserName){
        if(typeof updatedinfo.newUserName!="string") throw "username is not of type string"
        if(updatedinfo.newUserName.length<6) throw "username should be of length 6 or more"
        updateduserinfo.username=updatedinfo.newUserName
    }
    if(updatedinfo.newEmailId){
        const mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if(typeof updatedinfo.newEmailId!= "string") throw "Email id is not type string"
        if(!updatedinfo.newEmailId.match(mailformat)){
            throw "Email id is not correct format"
        }
        updateduserinfo.emailid=updatedinfo.newEmailId
    }
    if(updatedinfo.newPhoneNum){
        if(updatedinfo.newPhoneNum.length !=10  || isNaN(Number(updatedinfo.newPhoneNum))) throw "Incorrect Phone number format written"
        updateduserinfo.phone_num=updatedinfo.newPhoneNum
    }

    if(updatedinfo.newDOB){
        updateduserinfo.DOB=updatedinfo.newDOB
    }


    if(updatedinfo.category){
        updateduserinfo.categoryinterest=updatedinfo.category 
    }
    const usercollection=await userdata()
    const userupdated= await usercollection.updateOne({_id:ObjectID(id)},{$set:updateduserinfo})
    return await this.getuser(id)

}

async function changepassword(id, oldpassword, newpassword){
    if(!id) throw "no Id is defined"
    if(oldpassword=== undefined) throw "No old password is defined"
    if(typeof oldpassword!="string") throw "Old password is not of type string"
    if(newpassword=== undefined) throw "No new password is defined"
    if(typeof newpassword!="string") throw "New password is not of type string"

    const user= await this.getuser(id)
   

    if( passwordhash.verify(oldpassword,user.password)){
        const usercollection= await userdata()
        const newhaspassword=passwordhash.generate(newpassword)
        const userupdated={password:newhaspassword}
        await usercollection.updateOne({_id:ObjectID(id)},{$set:userupdated})
        return true

    }
    return false

    

    
}

async function verifyuser(UserName, password){
    if(!UserName || typeof UserName !=="string"){
        throw "username is not defined properly"
    }
    if(!password || typeof password !=="string"){
        throw "password not defined properly"
    }
    const usercollection= await userdata()
    const user= await usercollection.findOne({username:UserName})
    if(!user){
        throw "Incorrect Username/password entered"
    }
    if(passwordhash.verify(password,user.password)){
        return user
    }
    else{
        throw "Incorrect Username/password entered"
    }
     
}

const editratings= async(userid, ratings)=>{
    if(!userid || typeof userid !=="string"){
        throw "username is not defined properly"
    }
    if(ratings===undefined || typeof ratings !=="number"){
        throw "ratings not defined properly"
    }
    const usercollection= await userdata()
    const user= await usercollection.updateOne({_id:ObjectID(userid)},{$set:{ratings:ratings}})
    


}

const additem_winner=async(userid,itemid)=>{
    if(!userid || typeof userid !=="object"){
        throw "username is not defined properly"
    }
    if(itemid===undefined || typeof itemid !=="object"){
        throw "ratings not defined properly"
    }
    const usercollection= await userdata()
    const user= await usercollection.updateOne({_id:userid},{$addToSet:{items_won:itemid}})
    return;

}

   



module.exports={
    createuser,
    getuser,
    updateuser,
    changepassword,
    verifyuser,
    editratings,
    additem_winner
}
