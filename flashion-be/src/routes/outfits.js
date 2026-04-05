const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

async function getClothingItems(itemIdList, authUserId) {
    const { data, error } = await supabase
        .from('clothing_items')
        .select('*')
        .in('id', itemIdList)          // fetch all at once
        .eq('user_id', authUserId);

    if (error) throw new Error('Failed to fetch clothing items');
    return data;
}

router.post('/', async (req, res) => {
    try {
        const { userId } = req.body;

        // 1. Fetch outfits
        const { data: outfits, error } = await supabase
            .from('outfits')
            .select('*')
            .eq('user_id', userId);

        if (error) return res.status(500).json({ error: 'Failed to fetch outfits' });
        if (!outfits || outfits.length === 0) return res.json({ data: [] });

        // 2. Collect all unique IDs để batch fetch
        const seasonIds    = [...new Set(outfits.map(o => o.season_id))];
        const occasionIds  = [...new Set(outfits.map(o => o.occasion_id))];
        const templateIds  = [...new Set(outfits.map(o => o.template_id))];
        const allItemIds   = [...new Set(outfits.flatMap(o => o.item_id_list))];

        // 3. Batch fetch tất cả cùng lúc
        const [
            { data: seasons },
            { data: occasions },
            { data: templates },
            { data: allItems }
        ] = await Promise.all([
            supabase.from('seasons').select('id, name').in('id', seasonIds),
            supabase.from('occasions').select('id, name').in('id', occasionIds),
            supabase.from('templates').select('id, name').in('id', templateIds),
            supabase.from('clothing_items').select('id, category, color, style, brand, tags, image_url, name, season, favorite').in('id', allItemIds).eq('user_id', userId),
        ]);

        // 4. Build lookup maps để access O(1)
        const seasonMap   = Object.fromEntries(seasons.map(s => [s.id, s.name]));
        const occasionMap = Object.fromEntries(occasions.map(o => [o.id, o.name]));
        const templateMap = Object.fromEntries(templates.map(t => [t.id, t.name]));
        const itemMap     = Object.fromEntries(allItems.map(i => [i.id, i]));

        // 5. Build return data
        // const returnData = outfits.map(outfit => ({
        //     id:       outfit.id,
        //     name:     outfit.name,
        //     season:   seasonMap[outfit.season_id],
        //     occasion: occasionMap[outfit.occasion_id],
        //     template: templateMap[outfit.template_id],
        //     items:    outfit.item_id_list.map(id => itemMap[id]).filter(Boolean),
        // }));

        const returnData = outfits.map(outfit=>({
            id: outfit.id,
            name: outfit.name,
            category: occasionMap[outfit.occasion_id],
            itemCount: outfit.item_id_list.length,
            items: outfit.item_id_list.map(id=>itemMap[id]).filter(Boolean)
        }));

        console.log('Return Data:', JSON.stringify(returnData[0], null, 2));
        res.json({ data: returnData });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;