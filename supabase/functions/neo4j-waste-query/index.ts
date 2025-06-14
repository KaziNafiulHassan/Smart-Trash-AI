
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log(`[neo4j-waste-query] Function invoked. Method: ${req.method}, URL: ${req.url}`);

  if (req.method === 'OPTIONS') {
    console.log('[neo4j-waste-query] Handling OPTIONS request.');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[neo4j-waste-query] Processing POST request.');
    if (req.method !== 'POST') {
      console.warn('[neo4j-waste-query] Method not allowed:', req.method);
      throw new Error('Method not allowed');
    }

    const requestBody = await req.json();
    console.log('[neo4j-waste-query] Request body parsed:', JSON.stringify(requestBody));
    const { wasteCategory } = requestBody;
    
    if (!wasteCategory) {
      console.error('[neo4j-waste-query] Waste category name is required in body.');
      throw new Error('Waste category name is required');
    }

    console.log('[neo4j-waste-query] Querying Neo4j for waste category:', wasteCategory);
    
    const neo4jUriFromEnv = Deno.env.get('NEO4J_URI');
    const neo4jUsername = Deno.env.get('NEO4J_USERNAME');
    const neo4jPassword = Deno.env.get('NEO4J_PASSWORD');

    console.log('[neo4j-waste-query] Raw NEO4J_URI from env:', neo4jUriFromEnv);

    if (!neo4jUriFromEnv || !neo4jUsername || !neo4jPassword) {
      console.error('[neo4j-waste-query] Missing Neo4j credentials in environment variables.');
      throw new Error('Missing Neo4j credentials in environment variables');
    }

    const auth = btoa(`${neo4jUsername}:${neo4jPassword}`);
    
    // For Neo4j AuraDB, we need to use the REST API endpoint
    // Convert neo4j+s://xxx to https://xxx and use the correct REST API path
    let baseHttpUri = neo4jUriFromEnv.replace('neo4j+s://', 'https://').replace('neo4j://', 'http://');
    if (baseHttpUri.endsWith('/')) {
      baseHttpUri = baseHttpUri.slice(0, -1);
      console.log('[neo4j-waste-query] Removed trailing slash from baseHttpUri:', baseHttpUri);
    }
    
    // Use the correct REST API endpoint for AuraDB
    const apiUrl = `${baseHttpUri}/db/data/transaction/commit`;
    
    console.log('[neo4j-waste-query] Executing Cypher query at API URL:', apiUrl);

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

    console.log('[neo4j-waste-query] Sending Cypher query:', JSON.stringify(cypherQuery, null, 2));

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'SupabaseEdgeFunction/1.0'
      },
      body: JSON.stringify(cypherQuery)
    });

    const responseText = await response.text();
    console.log(`[neo4j-waste-query] Neo4j REST API response status: ${response.status}`);
    if (!response.ok) {
      console.error(`[neo4j-waste-query] Neo4j REST API error response text: ${responseText}`);
      
      // If the REST API fails, try the legacy HTTP API as fallback
      console.log('[neo4j-waste-query] Trying legacy HTTP API as fallback...');
      const legacyApiUrl = `${baseHttpUri}:7474/db/neo4j/tx/commit`;
      console.log('[neo4j-waste-query] Fallback API URL:', legacyApiUrl);
      
      const fallbackResponse = await fetch(legacyApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'SupabaseEdgeFunction/1.0'
        },
        body: JSON.stringify(cypherQuery)
      });

      const fallbackResponseText = await fallbackResponse.text();
      console.log(`[neo4j-waste-query] Fallback response status: ${fallbackResponse.status}`);
      
      if (!fallbackResponse.ok) {
        console.error(`[neo4j-waste-query] Both APIs failed. Fallback response: ${fallbackResponseText}`);
        throw new Error(`Neo4j API error: ${response.status} - ${responseText}. Fallback also failed: ${fallbackResponse.status} - ${fallbackResponseText}`);
      }
      
      // Use fallback response if successful
      const fallbackResult = JSON.parse(fallbackResponseText);
      console.log('[neo4j-waste-query] Fallback API succeeded');
      return processNeo4jResponse(fallbackResult, wasteCategory);
    }
    
    console.log(`[neo4j-waste-query] Neo4j REST API response text: ${responseText.substring(0, 500)}...`);

    const result = JSON.parse(responseText);
    return processNeo4jResponse(result, wasteCategory);

  } catch (error) {
    console.error('[neo4j-waste-query] Critical error in function execution:', error.message, error.stack ? error.stack : '(no stacktrace)');
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: 'Failed to query Neo4j for waste category information.'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function processNeo4jResponse(result: any, wasteCategory: string) {
  console.log('[neo4j-waste-query] Processing Neo4j response...');

  if (result.errors && result.errors.length > 0) {
    console.error('[neo4j-waste-query] Neo4j query execution error in response body:', JSON.stringify(result.errors));
    throw new Error(`Neo4j query error: ${result.errors[0].message}`);
  }

  const queryResults = result.results && result.results[0];
  
  if (!queryResults || !queryResults.data || queryResults.data.length === 0) {
    console.warn('[neo4j-waste-query] No data found in Neo4j for waste category:', wasteCategory);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'No data found for this waste category in Neo4j.',
        data: null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const dataRow = queryResults.data[0];
  const wasteNode = dataRow.row[0];
  const binNode = dataRow.row[1];
  const centers = dataRow.row[2];

  if (!wasteNode || !binNode) {
    console.error('[neo4j-waste-query] Expected wasteNode or binNode not found in Neo4j response row:', JSON.stringify(dataRow.row));
    throw new Error('Malformed data structure from Neo4j: missing waste or bin node.');
  }

  const enrichedData = {
    bin_type: binNode.type,
    bin_color: binNode.color,
    allowed_in_bin: wasteNode.allowed_in_bin,
    recyclable: wasteNode.recyclable,
    rule_en: wasteNode.rule_en,
    rule_de: wasteNode.rule_de,
    recycling_centers: centers
  };

  console.log('[neo4j-waste-query] Successfully enriched data:', JSON.stringify(enrichedData));

  return new Response(
    JSON.stringify({ success: true, data: enrichedData }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
