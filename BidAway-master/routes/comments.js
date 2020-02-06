const express= require("express")
const router = express.Router();
const data = require("../data");
const commentdata=data.comments


router.post("/", async function(req,res){
 
    const comment=req.body.description
    const userid=req.session.userdata
    const itemid= req.session.itemid

    const commentinfo = await commentdata.createcomment(userid,itemid,comment,"0")

    console.log(commentinfo)
    res.render("partials/comment_data",{ layout: null, ...commentinfo })

});

router.delete("/:id", async function(req,res){
    if (!req.session.isUserAdmin) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    const id = req.params.id;

    let deletedComment;
    try {
        deletedComment = await commentdata.deletecomment(id);
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
    }

    if (deletedComment == null) {
        res.status(400).json({ error: 'Comment Not Found' });
        return;
    }

    res.status(200).json({
        success: true,
        deletedComment
    });
});

module.exports = router;
