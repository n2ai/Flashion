const express = require('express');
const router = express.Router();
const multer = require('multer');
const aiService = require('../services/aiService');
const cloudinaryService = require('../services/cloudinaryService');


// Multer config - store in memory
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024},
    fileFilter: (req,file,cb)=>{
        if (file.mimetype.startsWith('image/')){
            cb(null, true);
        }else{
            cb(new Error('Only images allowed'), false);
        }
    }
})
module.exports = router;

// POST /api/quick-scan
// Upload image -> Cloudinary -> Gemini AI Analyze -> Return suggested Data
router.post('/', upload.single('image'), async (req,res)=>{
    try{
        if(!req.file){
            return res.status(400).json({error: 'No Image Provide'});
        }

        //1. Upload to cloudinary
        const uploadResult = await cloudinaryService.uploadImage(req.file.buffer);

        //2. Analyze with Gemini AI (using original buffer not the upload result);
        const analysis = await aiService.analyzeImage(req.file.buffer, req.file.mimetype);

        //3. Return suggested data fro user to confirm
        res.json({
            imageUrl: uploadResult.secure_url,
            cloudinaryId: uploadResult.public_id,
            suggestedData: analysis
        })
    }catch(error){
        console.error(`Quick Scan Error: ${error}`);
        res.status(500).json({error:'Failed to process image'});
    }
})