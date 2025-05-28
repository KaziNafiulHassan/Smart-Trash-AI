
import { supabase } from '@/integrations/supabase/client';

export const dataService = {
  async getGameData(language: 'EN' | 'DE') {
    // Get waste items with categories
    const { data: wasteItems, error: wasteError } = await supabase
      .from('waste_items')
      .select(`
        id,
        item_name_en,
        item_name_de,
        emoji,
        confidence_threshold,
        categories (
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

    // Transform data for frontend compatibility
    const transformedItems = wasteItems?.map(item => ({
      id: item.id,
      item_name: language === 'EN' ? item.item_name_en : item.item_name_de,
      emoji: item.emoji,
      category_id: item.categories?.id || '',
      confidence_threshold: item.confidence_threshold
    })) || [];

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
