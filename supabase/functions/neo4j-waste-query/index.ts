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
    
    // Robust URL construction
    let baseHttpUri = neo4jUriFromEnv.replace('neo4j+s://', 'https://').replace('neo4j://', 'http://');
    // Remove potential trailing slash from baseHttpUri before appending port
    if (baseHttpUri.endsWith('/')) {
      baseHttpUri = baseHttpUri.slice(0, -1);
      console.log('[neo4j-waste-query] Removed trailing slash from baseHttpUri:', baseHttpUri);
    }
    const apiUrl = `${baseHttpUri}:7474/db/neo4j/tx/commit`;
    
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
        'User-Agent': 'SupabaseEdgeFunction/1.0' // Added a user agent
      },
      body: JSON.stringify(cypherQuery)
    });

    const responseText = await response.text();
    console.log(`[neo4j-waste-query] Neo4j HTTP API response status: ${response.status}`);
    if (!response.ok) {
      console.error(`[neo4j-waste-query] Neo4j HTTP API error response text: ${responseText}`);
      throw new Error(`Neo4j HTTP API error: ${response.status} - ${responseText}`);
    }
    console.log(`[neo4j-waste-query] Neo4j HTTP API response text: ${responseText.substring(0, 500)}...`); // Log snippet

    const result = JSON.parse(responseText);
    // console.log('[neo4j-waste-query] Neo4j query result (parsed):', JSON.stringify(result, null, 2)); // Can be very verbose

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
