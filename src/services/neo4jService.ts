
import neo4j, { Driver, Session } from 'neo4j-driver';

interface GraphData {
  correctBin: string;
  category: string;
  material: string;
  rule: string;
  recyclingCenter: string;
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
      console.warn('Neo4j driver not available, falling back to mock data');
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
      // Query to get comprehensive waste item information
      const query = `
        MATCH (item:\`Waste Item\`)
        WHERE toLower(item.item_name_en) CONTAINS toLower($itemName)
           OR toLower(item.item_name_de) CONTAINS toLower($itemName)

        OPTIONAL MATCH (item)-[:BELONGS_TO]->(category:Category)
        OPTIONAL MATCH (category)-[:SORTED_INTO]->(bin:Bin)
        OPTIONAL MATCH (category)-[:DROPPED_AT]->(center:\`Recycling Center\`)
        OPTIONAL MATCH (item)-[:MADE_OF]->(material:Material)
        OPTIONAL MATCH (item)-[:FOLLOW]->(instruction:Instruction)

        RETURN
          item.item_name_en as itemName,
          category.name_en as categoryName,
          category.bin_type as binType,
          bin.bin_color as binColor,
          material.material as material,
          instruction.instruction_en as instruction,
          center.recyclingCenter as recyclingCenter
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
          recyclingCenter: record.get('recyclingCenter') || 'Contact local waste management'
        };
        console.log('Neo4j Service: Successfully retrieved data:', graphData);
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
}

// Export a singleton instance
export const neo4jService = new Neo4jService();
