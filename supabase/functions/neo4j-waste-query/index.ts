
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    const { wasteCategory } = await req.json();
    
    if (!wasteCategory) {
      throw new Error('Waste category name is required');
    }

    console.log('Querying Neo4j for waste category:', wasteCategory);
    
    // Get Neo4j credentials from environment
    const neo4jUri = Deno.env.get('NEO4J_URI');
    const neo4jUsername = Deno.env.get('NEO4J_USERNAME');
    const neo4jPassword = Deno.env.get('NEO4J_PASSWORD');

    if (!neo4jUri || !neo4jUsername || !neo4jPassword) {
      throw new Error('Missing Neo4j credentials in environment variables');
    }

    // Create basic auth header
    const auth = btoa(`${neo4jUsername}:${neo4jPassword}`);
    
    // Use Neo4j HTTP API
    const httpUri = neo4jUri.replace('neo4j+s://', 'https://').replace('neo4j://', 'http://');
    const apiUrl = `${httpUri}:7474/db/neo4j/tx/commit`;
    
    console.log('Executing Cypher query for waste category:', wasteCategory);

    const cypherQuery = {
      statements: [
        {
          statement: `
            MATCH (w:WasteCategory {name: $name})-[:DISPOSED_IN]->(b:Bin)
            OPTIONAL MATCH (w)-[:ACCEPTED_AT]->(c:RecyclingCenter)
            RETURN w, b, collect(c.name) AS centers
          `,
          parameters: {
            name: wasteCategory
          }
        }
      ]
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(cypherQuery)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Neo4j HTTP API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Neo4j query result:', JSON.stringify(result, null, 2));

    // Check for errors in the response
    if (result.errors && result.errors.length > 0) {
      throw new Error(`Neo4j query error: ${result.errors[0].message}`);
    }

    // Parse the results
    const queryResults = result.results[0];
    
    if (!queryResults.data || queryResults.data.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'No data found for this waste category',
          data: null
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    const data = queryResults.data[0];
    const wasteNode = data.row[0];
    const binNode = data.row[1];
    const centers = data.row[2];

    const enrichedData = {
      bin_type: binNode.type,
      bin_color: binNode.color,
      allowed_in_bin: wasteNode.allowed_in_bin,
      recyclable: wasteNode.recyclable,
      rule_en: wasteNode.rule_en,
      rule_de: wasteNode.rule_de,
      recycling_centers: centers
    };

    return new Response(
      JSON.stringify({
        success: true,
        data: enrichedData
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Neo4j waste query failed:', error);
    
    const errorResponse = {
      success: false,
      error: error.message,
      details: 'Failed to query Neo4j for waste category information.'
    };

    return new Response(
      JSON.stringify(errorResponse),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
