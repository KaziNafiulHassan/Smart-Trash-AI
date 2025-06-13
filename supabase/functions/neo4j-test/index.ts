
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
    console.log('Starting Neo4j connection test...');
    
    // Get Neo4j credentials from environment
    const neo4jUri = Deno.env.get('NEO4J_URI');
    const neo4jUsername = Deno.env.get('NEO4J_USERNAME');
    const neo4jPassword = Deno.env.get('NEO4J_PASSWORD');

    if (!neo4jUri || !neo4jUsername || !neo4jPassword) {
      throw new Error('Missing Neo4j credentials in environment variables');
    }

    console.log('Neo4j URI:', neo4jUri);
    console.log('Neo4j Username:', neo4jUsername);
    console.log('Attempting to connect to Neo4j...');

    // Parse the Neo4j URI to extract hostname and port
    const url = new URL(neo4jUri.replace('neo4j+s://', 'https://').replace('neo4j://', 'http://'));
    const hostname = url.hostname;
    const port = 7687; // Standard Neo4j port
    const useEncryption = neo4jUri.startsWith('neo4j+s://');

    console.log('Parsed hostname:', hostname);
    console.log('Using encryption:', useEncryption);

    // Create basic auth header
    const auth = btoa(`${neo4jUsername}:${neo4jPassword}`);
    
    // For now, let's test the connection using Neo4j HTTP API
    const httpUri = neo4jUri.replace('neo4j+s://', 'https://').replace('neo4j://', 'http://');
    const testUrl = `${httpUri}:7474/db/data/`;
    
    console.log('Testing HTTP connection to:', testUrl);

    // Test basic connectivity first
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      // Try the newer Neo4j HTTP API endpoint
      const newApiUrl = `${httpUri}:7474/db/neo4j/tx/commit`;
      console.log('Trying newer API endpoint:', newApiUrl);
      
      const cypherResponse = await fetch(newApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          statements: [
            {
              statement: 'RETURN "Hello from Neo4j AuraDB!" as message, datetime() as timestamp'
            }
          ]
        })
      });

      if (!cypherResponse.ok) {
        const errorText = await cypherResponse.text();
        throw new Error(`Neo4j HTTP API error: ${cypherResponse.status} - ${errorText}`);
      }

      const cypherResult = await cypherResponse.json();
      console.log('Cypher query executed successfully');

      const data = cypherResult.results[0].data[0];
      const message = data.row[0];
      const timestamp = data.row[1];

      const successResponse = {
        success: true,
        message: 'Neo4j AuraDB connection successful!',
        data: {
          testMessage: message,
          timestamp: timestamp,
          connectionDetails: {
            uri: neo4jUri,
            username: neo4jUsername,
            encrypted: useEncryption,
            method: 'HTTP API'
          }
        }
      };

      return new Response(
        JSON.stringify(successResponse),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // If basic connection works, try to get server info
    const serverInfo = await response.json();
    console.log('Neo4j server info retrieved');

    const basicResponse = {
      success: true,
      message: 'Neo4j AuraDB connection successful!',
      data: {
        testMessage: 'Basic connection test passed',
        serverInfo: serverInfo,
        connectionDetails: {
          uri: neo4jUri,
          username: neo4jUsername,
          encrypted: useEncryption,
          method: 'HTTP Basic'
        }
      }
    };

    return new Response(
      JSON.stringify(basicResponse),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Neo4j connection test failed:', error);
    
    const errorResponse = {
      success: false,
      error: error.message,
      details: 'Failed to connect to Neo4j AuraDB. Please check your credentials and network connectivity.',
      debug: {
        errorType: error.constructor.name,
        stack: error.stack
      }
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
