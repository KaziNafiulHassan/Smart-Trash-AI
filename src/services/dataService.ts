
import { supabase } from '@/integrations/supabase/client';

export const dataService = {
  async getGameData(language: 'EN' | 'DE') {
    // Get waste items with categories - specify the relationship hint
    const { data: wasteItems, error: wasteError } = await supabase
      .from('waste_items')
      .select(`
        id,
        item_name_en,
        item_name_de,
        description_en,
        description_de,
        categories!fk_waste_items_category_id (
          id,
          name_en,
          name_de,
          bin_type
        )
      `);

    if (wasteError) {
      console.error('Error fetching waste items:', wasteError);
      return { wasteItems: [], binCategories: {} };
    }

    // Transform data and get image URLs from storage
    const transformedItems = wasteItems?.map((item) => {
      // Get image URL from storage using the item ID
      const { data: imageData } = supabase.storage
        .from('waste-images')
        .getPublicUrl(`${item.id}.jpg`);

      return {
        id: item.id,
        item_name: language === 'EN' ? item.item_name_en : item.item_name_de,
        description: language === 'EN' ? item.description_en : item.description_de,
        image_url: imageData.publicUrl,
        category_id: item.categories?.id || '',
        bin_type: item.categories?.bin_type || ''
      };
    }) || [];

    // Updated bin categories mapping for all 7 bin types
    const binCategories = {
      residual: ['Residual Plastics', 'Residual Electronics', 'Residual Papers', 'Hygene Items', 'Inorganic Items', 'Residual Organics'],
      paper: ['Paper', 'Paper Packaging', 'Cardboard'],
      bio: ['Food Waste', 'Organic Waste'],
      plastic: ['Lightweight Packaging Bin', 'Plastic', 'Metal Packaging'],
      glass: ['Recyclable Glass'],
      hazardous: ['Hazardous Waste'],
      bulky: ['Bulky Waste']
    };

    return {
      wasteItems: transformedItems,
      binCategories
    };
  }
};
