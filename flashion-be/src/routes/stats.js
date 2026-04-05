const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

router.get('/', async (req, res) => {
    const { userId } = req.query; 

    if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
    }

    try {
        // 1. Total items
        const { count: totalItems, error: totalItemsError } = await supabase
            .from('clothing_items')
            .select('*', { count: 'exact', head: true }) 
            .eq('user_id', userId);

        if (totalItemsError) throw new Error('Failed to fetch total items');

        // 2. Total outfits
        const { count: totalOutfits, error: totalOutfitsError } = await supabase
            .from('outfits')
            .select('*', { count: 'exact', head: true }) 
            .eq('user_id', userId);

        if (totalOutfitsError) throw new Error('Failed to fetch total outfits');

        // 3. Items added in current month
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();

        const { count: itemsAddedThisMonth, error: itemsPerMonthError } = await supabase
            .from('clothing_items')
            .select('*', { count: 'exact', head: true }) 
            .gte('created_at', firstDayOfMonth)
            .lte('created_at', lastDayOfMonth)
            .eq('user_id', userId);

        if (itemsPerMonthError) throw new Error('Failed to fetch items added in current month');
        
        console.log('Total Items', totalItems)

        res.json({
            totalItems,           
            totalOutfits,         
            itemsAddedThisMonth   
        });

    } catch (error) {
        console.error('Stats Error', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

module.exports = router;