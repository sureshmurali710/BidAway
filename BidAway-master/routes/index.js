const userroutes = require("./user");
const path = require("path");
const bidRoutes = require("../routes/bids");
const itemRoutes = require("../routes/items");
const commentRoutes= require("./comments")
const ratingroutes= require("./ratings")


const constructorMethod = app => {
    app.get("/",(req,res,next)=>{
        if(req.session.isloggedin!==undefined || req.session.isloggedin===true){
            res.redirect("/bids");
        }
        else{
            next();
        }
    })
    app.get("/", (req, res) => {
        res.redirect("/bids")
    })
    app.get("/users/userdetails",(req,res,next)=>{
        
        if(req.session.isloggedin===undefined || req.session.isloggedin===false){
           
            res.redirect("/bids");
        }
        else{
            next();
        }
    })
    app.get("/users/edituser",(req,res,next)=>{
        
        if(req.session.isloggedin===undefined || req.session.isloggedin===false){
           
            res.redirect("/bids");
        }
        else{
            next();
        }
    })

    app.get("/users/logout",(req,res,next)=>{
        if(req.session.isloggedin===undefined || req.session.isloggedin===false){
           
            res.redirect("/bids");
        }
        else{
            next();
        }
    })

    app.get("/item/additem",(req,res,next)=>{
        if(req.session.isloggedin===undefined || req.session.isloggedin===false){
           
            res.redirect("/bids");
        }
        else{
            next();
        }

    })
    app.post("/bids",(req,res,next)=>{
        if(req.session.isloggedin===undefined || req.session.isloggedin===false){
           
            res.redirect("/bids");
        }
        else{
            next();
        }

    })


    app.use("/users", userroutes);
    app.use("/bids" ,bidRoutes);
    app.use("/item", itemRoutes);
    app.use("/comments",commentRoutes);
    app.use("/ratings",ratingroutes);
    app.use("*", (req,res) => {
        res.status(404).json({error:"Not Found"});
    });
  };
    
  
  module.exports = constructorMethod;
