const express = require("express");
const router = express.Router();

let relayState = {
    drain: 0,
    fill: 0
};

router.post("/drain", (req,res)=>{

    relayState.drain = 1;

    res.json({
        success:true
    });

});

router.post("/fill", (req,res)=>{

    relayState.fill = 1;

    res.json({
        success:true
    });

});

router.get("/status",(req,res)=>{

    res.json(relayState);

});

router.post("/reset-drain",(req,res)=>{

    relayState.drain = 0;

    res.json({
        success:true
    });

});

router.post("/reset-fill",(req,res)=>{

    relayState.fill = 0;

    res.json({
        success:true
    });

});

module.exports = router;