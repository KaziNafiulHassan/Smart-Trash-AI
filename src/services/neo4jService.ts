
import neo4j, { Driver, Session } from 'neo4j-driver';

interface GraphData {
  correctBin: string;
  category: string;
  material: string;
  rule: string;
  recyclingCenter: string;
  binIcon?: string;
  binColor?: string;
  recyclingTip?: string;
  environmentalImpact?: string;
}

class Neo4jService {
  private driver: Driver | null = null;
  private isConnected = false;

  constructor() {
    console.log('Neo4j Service: Constructor called');
    this.initializeDriver();
  }

  private initializeDriver() {
    try {
      // Get credentials from environment variables
      const uri = import.meta.env.VITE_NEO4J_URI || 'neo4j+s://44e41fa5.databases.neo4j.io';
      const username = import.meta.env.VITE_NEO4J_USERNAME || 'neo4j';
      const password = import.meta.env.VITE_NEO4J_PASSWORD || 'YQDQ2bhd_kK2IEWZZY0HIrOwBGML3NTo_SMFI_Fa3fk';

      console.log('Neo4j Service: Initializing with URI:', uri);
      console.log('Neo4j Service: Username:', username);
      console.log('Neo4j Service: Password length:', password ? password.length : 0);

      this.driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
      this.isConnected = true;
      console.log('Neo4j driver initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Neo4j driver:', error);
      this.isConnected = false;
    }
  }

  private async getSession(): Promise<Session | null> {
    if (!this.driver || !this.isConnected) {
      console.error('Neo4j driver not available - connection failed');
      return null;
    }
    return this.driver.session();
  }

  async getWasteItemInfo(binType: string, itemName: string): Promise<GraphData> {
    console.log(`Neo4j Service: Searching for item "${itemName}" with bin type "${binType}"`);

    const session = await this.getSession();

    if (!session) {
      console.error('Neo4j Service: No session available - connection failed');
      throw new Error('Neo4j connection failed - cannot retrieve waste information');
    }

    try {
      // Query to get comprehensive waste item information including enhanced data for structured feedback
      const query = `
        MATCH (item:\`Waste Item\`)
        WHERE toLower(item.item_name_en) CONTAINS toLower($itemName)
           OR toLower(item.item_name_de) CONTAINS toLower($itemName)

        OPTIONAL MATCH (item)-[:BELONGS_TO]->(category:Category)
        OPTIONAL MATCH (category)-[:SORTED_INTO]->(bin:Bin)
        OPTIONAL MATCH (category)-[:DROPPED_AT]->(center:\`Recycling Center\`)
        OPTIONAL MATCH (item)-[:MADE_OF]->(material:Material)
        OPTIONAL MATCH (item)-[:FOLLOW]->(instruction:Instruction)

        // Get additional data for enhanced feedback
        OPTIONAL MATCH (bin)-[:HAS_ICON]->(icon:Icon)
        OPTIONAL MATCH (center)-[:PROVIDES_TIP]->(tip:RecyclingTip)
        OPTIONAL MATCH (material)-[:HAS_IMPACT]->(impact:EnvironmentalImpact)

        RETURN
          item.item_name_en as itemName,
          category.name_en as categoryName,
          category.bin_type as binType,
          bin.bin_color as binColor,
          bin.icon_emoji as binIcon,
          material.material as material,
          instruction.instruction_en as instruction,
          center.recyclingCenter as recyclingCenter,
          tip.tip_text_en as recyclingTip,
          impact.impact_description_en as environmentalImpact,
          center.address as centerAddress,
          center.hours as centerHours
        LIMIT 1
      `;

      console.log('Neo4j Service: Executing query with parameter:', { itemName });
      const result = await session.run(query, { itemName });
      console.log(`Neo4j Service: Query returned ${result.records.length} records`);

      if (result.records.length > 0) {
        const record = result.records[0];
        const graphData = {
          correctBin: record.get('binType') || 'Unknown Bin',
          category: record.get('categoryName') || 'Unknown Category',
          material: record.get('material') || 'Unknown Material',
          rule: record.get('instruction') || 'No specific instructions available',
          recyclingCenter: record.get('recyclingCenter') || 'Contact local waste management',
          binIcon: record.get('binIcon') || this.getBinIconFallback(record.get('binType')),
          binColor: record.get('binColor') || 'gray',
          recyclingTip: record.get('recyclingTip') || this.generateRecyclingTip(record.get('recyclingCenter'), record.get('centerAddress'), record.get('centerHours')),
          environmentalImpact: record.get('environmentalImpact') || this.generateEnvironmentalImpact(record.get('material'))
        };
        console.log('Neo4j Service: Successfully retrieved enhanced data:', graphData);
        return graphData;
      } else {
        console.warn(`Neo4j Service: No data found for item: ${itemName}`);
        throw new Error(`No waste information found for item: ${itemName}`);
      }
    } catch (error) {
      console.error('Neo4j Service: Error querying database:', error);
      throw error;
    } finally {
      await session.close();
    }
  }



  async testConnection(): Promise<boolean> {
    const session = await this.getSession();
    if (!session) return false;

    try {
      const result = await session.run('RETURN 1 as test');
      console.log('Neo4j Service: Connection test successful');
      return result.records.length > 0;
    } catch (error) {
      console.error('Neo4j Service: Connection test failed:', error);
      return false;
    } finally {
      await session.close();
    }
  }

  async close() {
    if (this.driver) {
      await this.driver.close();
      this.isConnected = false;
    }
  }

  private getBinIconFallback(binType: string): string {
    if (!binType) return '🗑️';

    const binTypeLower = binType.toLowerCase();
    if (binTypeLower.includes('residual') || binTypeLower.includes('rest')) return '🗑️';
    if (binTypeLower.includes('paper') || binTypeLower.includes('papier')) return '📄';
    if (binTypeLower.includes('bio') || binTypeLower.includes('organic')) return '🍎';
    if (binTypeLower.includes('plastic') || binTypeLower.includes('yellow')) return '♻️';
    if (binTypeLower.includes('glass') || binTypeLower.includes('glas')) return '🍶';
    if (binTypeLower.includes('hazardous') || binTypeLower.includes('sonder')) return '☢️';
    if (binTypeLower.includes('bulky') || binTypeLower.includes('sperr')) return '📦';
    return '🗑️';
  }

  private generateRecyclingTip(centerName?: string, address?: string, hours?: string): string {
    if (centerName && address) {
      return `You can drop off larger quantities at ${centerName} located at ${address}${hours ? ` (Hours: ${hours})` : ''}.`;
    } else if (centerName) {
      return `For larger quantities, visit ${centerName} for proper disposal.`;
    }
    return 'Contact your local waste management facility for disposal of larger quantities.';
  }

  private generateEnvironmentalImpact(material?: string): string {
    if (!material) return 'Proper sorting helps protect our environment.';

    const materialLower = material.toLowerCase();
    if (materialLower.includes('plastic')) {
      return 'Recycling plastic saves energy and reduces ocean pollution.';
    } else if (materialLower.includes('paper')) {
      return 'Recycling paper saves trees and reduces landfill waste.';
    } else if (materialLower.includes('glass')) {
      return 'Glass can be recycled infinitely without losing quality.';
    } else if (materialLower.includes('metal') || materialLower.includes('aluminum')) {
      return 'Recycling metals saves significant energy compared to mining new materials.';
    } else if (materialLower.includes('organic') || materialLower.includes('bio')) {
      return 'Composting organic waste creates nutrient-rich soil and reduces methane emissions.';
    }
    return 'Proper waste sorting helps create a circular economy and protects our planet.';
  }
}

// Export a singleton instance
export const neo4jService = new Neo4jService();
