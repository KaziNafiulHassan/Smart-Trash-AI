
// Mock data based on the CSV files from the images
export const wasteItems = [
  { id: 'felt_tip_pen', item_name: 'Felt Tip Pen', category_id: 'Residual Plastics', emoji: '🖊️' },
  { id: 'video_cassette', item_name: 'Video Cassette', category_id: 'Residual Electronics', emoji: '📼' },
  { id: 'rubber_residue', item_name: 'Rubber Residue', category_id: 'Unrecyclable Textile', emoji: '🔌' },
  { id: 'light_bulb', item_name: 'Light Bulb', category_id: 'Residual Electronics', emoji: '💡' },
  { id: 'hygiene_items', item_name: 'Hygiene Items', category_id: 'Hygene Items', emoji: '🧻' },
  { id: 'paper_tissues', item_name: 'Paper Tissues', category_id: 'Residual Papers', emoji: '🧻' },
  { id: 'ceramics', item_name: 'Ceramics', category_id: 'Inorganic Items', emoji: '🏺' },
  { id: 'porcelain', item_name: 'Porcelain', category_id: 'Inorganic Items', emoji: '🍽️' },
  { id: 'leather_scraps', item_name: 'Leather Scraps', category_id: 'Unrecyclable Textile', emoji: '👜' },
  { id: 'bandages', item_name: 'Bandages', category_id: 'Hygene Items', emoji: '🩹' },
  { id: 'disposable_diapers', item_name: 'Disposable Diapers', category_id: 'Hygene Items', emoji: '👶' },
  { id: 'animal_litter', item_name: 'Animal Litter', category_id: 'Residual Organics', emoji: '🐱' },
  { id: 'photos', item_name: 'Photos', category_id: 'Residual Plastics', emoji: '📸' },
  { id: 'laminated_paper', item_name: 'Laminated Paper', category_id: 'Residual Plastics', emoji: '📄' },
  { id: 'thermal_paper', item_name: 'Thermal Paper', category_id: 'Residual Papers', emoji: '🧾' },
  { id: 'dirty_paper', item_name: 'Dirty Paper', category_id: 'Residual Papers', emoji: '📰' },
  { id: 'wallpaper', item_name: 'Wallpaper', category_id: 'Residual Plastics', emoji: '🖼️' },
  { id: 'vacuum_cleaner_bag', item_name: 'Vacuum Cleaner Bag', category_id: 'Inorganic Items', emoji: '🛍️' },
  { id: 'toiletries', item_name: 'Toiletries', category_id: 'Residual Plastics', emoji: '🧴' },
  { id: 'medicines', item_name: 'Medicines', category_id: 'Inorganic Items', emoji: '💊' },
  { id: 'ashes', item_name: 'Ashes', category_id: 'Inorganic Items', emoji: '🔥' },
  { id: 'crockery', item_name: 'Crockery', category_id: 'Residual Plastics', emoji: '🍽️' },
  { id: 'cigarette_butts', item_name: 'Cigarette Butts', category_id: 'Residual Plastics', emoji: '🚬' },
  { id: 'cigarette_ash', item_name: 'Cigarette Ash', category_id: 'Inorganic Items', emoji: '🚬' },
  { id: 'mirrors', item_name: 'Mirrors', category_id: 'Unrecyclable Glass', emoji: '🪞' },
  { id: 'kitchen_scraps', item_name: 'Kitchen Scraps', category_id: 'Food Waste', emoji: '🥬' },
  { id: 'bread_scraps', item_name: 'Bread Scraps', category_id: 'Food Waste', emoji: '🍞' },
  { id: 'coffee_grounds', item_name: 'Coffee Grounds', category_id: 'Food Waste', emoji: '☕' },
  { id: 'coffee_filter', item_name: 'Coffee Filter', category_id: 'Food Waste', emoji: '☕' },
  { id: 'tea', item_name: 'Tea', category_id: 'Food Waste', emoji: '🍵' },
  { id: 'tea_bags', item_name: 'Tea Bags', category_id: 'Food Waste', emoji: '🫖' },
  { id: 'kitchen_paper', item_name: 'Kitchen Paper', category_id: 'Organic Waste', emoji: '🧻' },
  { id: 'eggshells', item_name: 'Eggshells', category_id: 'Food Waste', emoji: '🥚' },
  { id: 'fruit_waste', item_name: 'Fruit Waste', category_id: 'Food Waste', emoji: '🍌' },
  { id: 'fruit_peels', item_name: 'Fruit Peels', category_id: 'Food Waste', emoji: '🍊' },
  { id: 'newspaper', item_name: 'Newspaper', category_id: 'Paper', emoji: '📰' },
  { id: 'cardboard', item_name: 'Cardboard', category_id: 'Cardboard', emoji: '📦' },
  { id: 'plastic_bottles', item_name: 'Plastic Bottles', category_id: 'Lightweight Packaging Bin', emoji: '🍼' },
  { id: 'glass_bottles', item_name: 'Glass Bottles', category_id: 'Recyclable Glass', emoji: '🍾' },
  { id: 'aluminum_cans', item_name: 'Aluminum Cans', category_id: 'Metal Packaging', emoji: '🥤' },
  { id: 'yogurt_containers', item_name: 'Yogurt Containers', category_id: 'Plastic', emoji: '🥛' }
];

export const binCategories = [
  {
    bin_name: 'Bio Bin',
    category_id: 'Food Waste',
    rule: 'Peels and leftovers from vegetables and fruit, leftover food without liquid, bread scraps, eggshells, and old food (without packaging) all belong in the bio bin.'
  },
  {
    bin_name: 'Bio Bin',
    category_id: 'Organic Waste',
    rule: 'This category includes organic garden waste such as grass cuttings, leaves, and flowers. Tree and shrub prunings can also be disposed of in organic waste.'
  },
  {
    bin_name: 'Paper Bin',
    category_id: 'Paper',
    rule: 'These items belong in the Blue Bin in Germany as recyclable paper waste due to their high cellulose content and low contamination.'
  },
  {
    bin_name: 'Paper Bin',
    category_id: 'Paper Packaging',
    rule: 'These items belong in the Blue Bin in Germany as paper packaging, thanks to their predominantly cellulose-based fibers with minimal contamination.'
  },
  {
    bin_name: 'Paper Bin',
    category_id: 'Cardboard',
    rule: 'These items belong in the Blue Bin in Germany as paper packaging, thanks to their high cellulose content and easy recyclability.'
  },
  {
    bin_name: 'Lightweight Packaging Bin',
    category_id: 'Plastic',
    rule: 'These items are primarily considered plastic waste in Germany, and generally collected via the "Yellow Bin" (Gelbe Tonne) or "Yellow Bag" (Gelber Sack) system for lightweight packaging.'
  },
  {
    bin_name: 'Lightweight Packaging Bin',
    category_id: 'Metal Packaging',
    rule: 'These items are primarily considered metal packaging waste in Germany and are generally collected via the "Yellow Bin" (Gelbe Tonne) or "Yellow Bag" (Gelber Sack) system for lightweight packaging.'
  },
  {
    bin_name: 'Residual Waste Bin',
    category_id: 'Residual Electronics',
    rule: 'These items belong in the Residual Bin (Restmüll) in Germany as mixed-material electronic waste, due to inseparable components and contamination risks.'
  },
  {
    bin_name: 'Residual Waste Bin',
    category_id: 'Residual Plastics',
    rule: 'These items belong in the Residual Bin (Restmüll) in Germany because they contain mixed materials, contamination or coating that can\'t be separated for recycling.'
  },
  {
    bin_name: 'Residual Waste Bin',
    category_id: 'Residual Papers',
    rule: 'These items belong in the Residual Bin (Restmüll) in Germany because they are contaminated, coated or composite paper products that can\'t be processed in the paper-recycling stream.'
  },
  {
    bin_name: 'Residual Waste Bin',
    category_id: 'Hygene Items',
    rule: 'These items belong in the Residual Bin (Restmüll) in Germany because they\'re mixed-material hygiene waste, often contaminated and not recyclable.'
  },
  {
    bin_name: 'Residual Waste Bin',
    category_id: 'Inorganic Items',
    rule: 'These items belong in the Residual Bin (Restmüll) in Germany because they\'re inorganic or mixed-material wastes that can\'t be processed in any recycling stream.'
  }
];

// Mock API functions
export const classifyWaste = async (itemName: string): Promise<string> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const item = wasteItems.find(i => i.item_name.toLowerCase() === itemName.toLowerCase());
  return item?.category_id || 'Unknown';
};

export const getFeedback = async (itemId: string, binId: string): Promise<string> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const item = wasteItems.find(i => i.id === itemId);
  const category = binCategories.find(c => c.category_id === item?.category_id);
  
  return category?.rule || 'Classification information not available.';
};
