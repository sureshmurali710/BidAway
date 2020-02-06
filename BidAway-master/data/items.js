const { items } = require("../database/mongoCollection");
const mongocollection = require('../database/mongoCollection');
const users=mongocollection.users;
const itemsforbid= mongocollection.itemsForBid;
const commentdata= require("../data/comments")
const ratingdata = require("../data/ratings")
const ObjectID = require('mongodb').ObjectID;

const  ensureValidString = (str, name) => {
    if (typeof str !== 'string' || str.length === 0)
        throw new Error('Invalid ' + name);
}

const getAllItems = async () => {
    const itemsCollection = await items();
    const allItems = await itemsCollection.find().toArray();

    return allItems;
};

const getItemById = async (id) => {
    
    id = ObjectID(id);
    comments=[]

    const itemsCollection = await items();
    const item = await itemsCollection.findOne({ _id: id });
    
    if(item.comments.length>0){
        for(let i=0;i<item.comments.length;i++){
        
            let comment =await commentdata.getcomment(item.comments[i])
            
            comments.push({id:comment._id,comment:comment.comment,userid:comment.userid})
        }
    }

    item.comments=comments
    const usercollections= await users();
    const user = await usercollections.findOne({ _id: ObjectID(item.userid) });

    item.userid={id:user._id,name:user.username,ratings:user.ratings}


    return item;
};

const getItemsByCategory = async (category) => {
    ensureValidString(category, 'Category');

    const itemsCollection = await items();
    const allItems = await itemsCollection.find({ category }).toArray();

    return allItems;
};

const addItem = async (name, description, image, userid) => {
    ensureValidString(name, 'Item Name');
    ensureValidString(description, 'Item Description');
    ensureValidString(userid,"Userid");

    const itemObj = {
        name,
        description,
        image,

        comments: [],
        rating: [],
        userid:userid
    };
    const usercollections= await users();
    const user= await usercollections.findOne({_id:ObjectID(userid)})
    if(user===null){
        throw `No user with that id ${userid}`
    }

    const itemsCollection = await items();
    const insertInfo = await itemsCollection.insertOne(itemObj);

    if (insertInfo.insertedCount === 0)
        throw new Error('Could not create a new Item');

    const id = insertInfo.insertedId;
    itemObj._id = id;
    
    const itemadd=await usercollections.update({_id:ObjectID(userid)},{$addToSet:{items_sold:String(id)}})

    return itemObj;
};

const markItemRemove = async (id) => {
    id = ObjectID(id);

    const toBeDeleted = await getItemById(id)

    if (!toBeDeleted)
        return null;

    if (toBeDeleted.removed) {
        return toBeDeleted;
    }

    const itemsCollection = await items();
    const itemsforbidcollection=await itemsforbid();
    let updateInfo;
    try {
         updateInfo = await itemsCollection.updateOne({
             _id: id
         }, {
             $set: {
                removed: true
            }
        });
        
    const deletediteminfo= await itemsforbidcollection.updateOne({item_id:id}, {
        $set: {
           removed: true
       }
   });
    } catch(e) {
        console.log(e);
        throw new Error('Could not mark item removed');
    }

    if (updateInfo.modifiedCount === 0)
        throw new Error('Could not mark item removed');

    return toBeDeleted;
};

const removeItem = async (id) => {
    id = ObjectID(id);

    const toBeDeleted = await getItemById(id)
    console.log(toBeDeleted)

    if (!toBeDeleted)
        return null;
    
    if(toBeDeleted.comments.length>0){
            for(let i=0;i<toBeDeleted.comments.length;i++){
                await commentdata.deletecomment(toBeDeleted.comments[i].id)
            }
    }
    const usercollections=await users()
    const deleteitem= await usercollections.update({_id:ObjectID(toBeDeleted.userid.id)},{$pull:{items_sold:String(toBeDeleted._id)}})

    

    const itemsCollection = await items();
    const deleteInfo = itemsCollection.deleteOne({ _id: id });

    

    if (deleteInfo.deletedCount === 0)
        throw new Error('Could not delete item');

    return toBeDeleted;
};

const updateitem = async(id,updateInfo)=>{ 
    id = ObjectID(id);
    await getItemById(id)
    ensureValidString(updateInfo.name, 'Item Name');
    ensureValidString(updateInfo.description, 'Item Description');
    const itemObj ={
        name:updateInfo.name,
        description:updateInfo.description,
    }
    const itemsCollection = await items();
    const itemupdateInfo = await itemsCollection.updateOne({_id:ObjectID(id)},{$set:itemObj})
    return await getItemById(id)


}

module.exports = {
    getAllItems,
    getItemById,
    getItemsByCategory,
    addItem,
    removeItem,
    markItemRemove,
    updateitem
};
