const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');

// POST /api/generate-outfits
// Generate new outfits based on user's closet and selected filter (e.g., season, occasion)

router.post('/', (req, res)=>{
    const {userId} = req.body; // Get user ID and filter from request body

    const generateOutfits = async ()=>{
        try{
            const generatedOutfits = await aiService.generateOutfit(userId);
            res.json({outfits: generatedOutfits})
        }catch(error){
            console.error('Generate Outfits Error', error);
            res.status(500).json({error: 'Failed to generate outfits'});
        }
    }

    generateOutfits();
})

module.exports = router;