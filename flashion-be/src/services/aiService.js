const { GoogleGenAI } = require('@google/genai');
const { supabase } = require('../config/supabase');
// Removed unused import: const { get } = require('../routes/outfits');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const PROMPT = `Analyze this fashion/clothing item and return ONLY valid JSON (no markdown, no backticks, no explanation):
{
    "category": "Tops|Bottoms|Dresses|Outerwear|Shoes|Accessories",
    "brand": "detected brand name or Unknown",
    "season": "Spring|Summer|Fall|Winter|All Season",
    "style": "detected style or Unknown",
    "tags": "generate a list of tags that this item might belongs to should be an array of item if not then empty array",
    "color": "return the main color name but in hex format like #FFFFFF or Unknown if not detected"
}
`;

async function getClothingItems(authUserId) {
    const { data, error } = await supabase
        .from('clothing_items')
        .select('*')
        .eq('user_id', authUserId);

    if (error) throw new Error('Failed to fetch clothing items');
    return data;
}

async function getSeasonIdMap() {
    const { data, error } = await supabase
        .from('seasons')
        .select('id, name'); // Fix: single string with comma, not two args

    if (error) throw new Error('Failed to fetch seasons');

    const seasonMap = {};
    data.forEach(season => {
        seasonMap[season.name] = season.id;
    });
    return seasonMap;
}

async function getOccasionIdMap() {
    const { data, error } = await supabase
        .from('occasions')
        .select('id, name'); // Fix: single string with comma, not two args

    if (error) throw new Error('Failed to fetch occasions');

    const occasionMap = {};
    data.forEach(occasion => {
        occasionMap[occasion.name] = occasion.id;
    });

    console.log('Occasion Map:', occasionMap); // Debug log
    return occasionMap;
}

async function getTemplate() {
    const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('id', 1)

    console.log('Template data:', data);
    console.log('Template error:', JSON.stringify(error)); // Log full error
    
    if (error) throw new Error(`Failed to fetch template: ${error.message} | code: ${error.code}`);
    return data;
}

async function generateOutfitPrompt(authUserId) {
    // Run all queries in parallel for better performance
    const [items, template, seasonMap, occasionMap] = await Promise.all([
        getClothingItems(authUserId),
        getTemplate(),
        getSeasonIdMap(),
        getOccasionIdMap(),
    ]);

    const prompt = `Generate a complete outfit based on the following criteria:
        - Available items: ${JSON.stringify(items)}
        - Template: ${JSON.stringify(template)}
        - Season Mapping: ${JSON.stringify(seasonMap)}
        - Occasion Mapping: ${JSON.stringify(occasionMap)}

        The output should be ONLY valid JSON (no markdown, no backticks):
        {
            "name": "A name for this outfit combination",
            "template_id": "the outfit template ID",
            "occasion_id": "one of the occasion IDs from the occasion mapping",
            "season_id": "one of the season IDs from the season mapping",
            "item_id_list": [list of clothing item IDs chosen from available items]
        }
    `;
    return prompt;
}

class AIService {
    async analyzeImage(imageBuffer, mimeType = 'image/jpeg') {
        try {
            const base64 = imageBuffer.toString('base64');

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: [
                    { inlineData: { data: base64, mimeType: mimeType } },
                    { text: PROMPT }
                ]
            });

            const text = response.text;
            const cleaned = text
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .trim();

            const analysis = JSON.parse(cleaned);
            return this.validateAnalysis(analysis);
        } catch (error) {
            console.error('AI Analysis Error', error);
            throw new Error('Failed to analyze image');
        }
    }

    async generateOutfit(authUserId) {
        try {
            // Now all helpers are async - await the prompt builder
            const prompt = await generateOutfitPrompt(authUserId);

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: [{ text: prompt }]
            });

            const text = response.text;
            const cleaned = text
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .trim();

            const outfit = JSON.parse(cleaned);
            const validOccasionIds = Object.values(await getOccasionIdMap());
            const validSeasonIds = Object.values(await getSeasonIdMap());
            const validTemplateIds = (await getTemplate()).map(t => t.id);
            if (!validOccasionIds.includes(outfit.occasion_id)) {
                throw new Error(`Invalid occasion_id: ${outfit.occasion_id}`);
            }

            if (!validSeasonIds.includes(outfit.season_id)) {
                throw new Error(`Invalid season_id: ${outfit.season_id}`);
            }
            
            if (!validTemplateIds.includes(outfit.template_id)) {
                throw new Error(`Invalid template_id: ${outfit.template_id}`);
            }

            const itemIds = outfit.item_id_list;
            if (!Array.isArray(itemIds) || itemIds.length === 0) {
                throw new Error('item_id_list must be a non-empty array');
            }

            //start to save to database
            const {data, error} = await supabase.from('outfits').insert({
                user_id: authUserId,
                name: outfit.name,
                template_id: outfit.template_id,
                occasion_id: outfit.occasion_id,
                season_id: outfit.season_id,
                item_id_list: itemIds
            }).select().single();

            if(error) {
                console.error('Supabase Insert Error', error);
                throw new Error('Failed to save generated outfit');
            }

            return outfit;
        } catch (error) {
            console.error('Outfit Generation Error', error);
            throw new Error('Failed to generate outfit');
        }
    }

    validateAnalysis(data) {
        const validCategories = ["Tops", "Bottoms", "Dresses", "Outerwear", "Shoes", "Accessories"];
        return {
            category: validCategories.includes(data.category) ? data.category : 'other',
            brand: data.brand || 'Unknown',
            season: data.season || 'Unknown',
            style: data.style || 'Unknown',
            tags: data.tags || [],
            color: data.color || 'Unknown',
        };
    }
}

module.exports = new AIService();