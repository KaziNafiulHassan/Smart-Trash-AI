
interface GraphData {
  correctBin: string;
  category: string;
  material: string;
  rule: string;
  recyclingCenter: string;
}

// Mock data simulating Neo4j responses
const mockGraphData: Record<string, GraphData> = {
  'paper': {
    correctBin: 'Paper Bin',
    category: 'Paper',
    material: 'fiber-based',
    rule: 'keep it dry and peel off plastic coating',
    recyclingCenter: 'City Paper Center (45 Eco St)'
  },
  'plastic': {
    correctBin: 'Lightweight Packaging Bin',
    category: 'Plastic',
    material: 'polymer-based',
    rule: 'rinse containers and remove caps',
    recyclingCenter: 'Metro Plastic Facility (123 Green Ave)'
  },
  'glass': {
    correctBin: 'Waste Glass Container',
    category: 'Glass',
    material: 'silicate-based',
    rule: 'separate by color and remove metal caps',
    recyclingCenter: 'Glass Recycling Hub (89 Clear St)'
  },
  'bio': {
    correctBin: 'Bio Bin',
    category: 'Organic',
    material: 'biodegradable',
    rule: 'no meat, bones or dairy products',
    recyclingCenter: 'Composting Center (56 Nature Way)'
  },
  'residual': {
    correctBin: 'Residual Waste Bin',
    category: 'General Waste',
    material: 'mixed materials',
    rule: 'items that cannot be recycled elsewhere',
    recyclingCenter: 'Municipal Waste Center (12 Main St)'
  },
  'hazardous': {
    correctBin: 'Hazardous Waste Collection',
    category: 'Hazardous',
    material: 'toxic materials',
    rule: 'handle with care and use protective equipment',
    recyclingCenter: 'Hazmat Disposal Unit (78 Safety Blvd)'
  },
  'bulky': {
    correctBin: 'Bulky Waste Container',
    category: 'Bulky Items',
    material: 'large household items',
    rule: 'schedule pickup or bring to designated area',
    recyclingCenter: 'Bulk Item Center (34 Storage Lane)'
  }
};

export const neo4jService = {
  async getWasteItemInfo(binType: string, itemName: string): Promise<GraphData> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Return mock data based on bin type
    return mockGraphData[binType] || mockGraphData['residual'];
  }
};
