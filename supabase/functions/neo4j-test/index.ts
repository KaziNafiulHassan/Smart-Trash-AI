
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Neo4j driver for Deno
import { Driver, Session } from "https://deno.land/x/neo4j_lite_client@4.4.11/mod.ts"

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

    // Create Neo4j driver instance
    const driver = new Driver({
      hostname: neo4jUri.replace('neo4j+s://', '').replace('neo4j://', ''),
      port: 7687,
      username: neo4jUsername,
      password: neo4jPassword,
      encrypted: neo4jUri.startsWith('neo4j+s://'), // Use encryption for AuraDB
    });

    // Create a session
    const session = driver.session();
    
    console.log('Session created, running test query...');

    // Run a simple test query
    const result = await session.run('RETURN "Hello from Neo4j AuraDB!" as message, datetime() as timestamp');
    
    console.log('Query executed successfully');

    // Extract the result
    const record = result.records[0];
    const message = record.get('message');
    const timestamp = record.get('timestamp');

    // Close session and driver
    await session.close();
    await driver.close();

    console.log('Connection test completed successfully');

    const response = {
      success: true,
      message: 'Neo4j AuraDB connection successful!',
      data: {
        testMessage: message,
        timestamp: timestamp.toString(),
        connectionDetails: {
          uri: neo4jUri,
          username: neo4jUsername,
          encrypted: neo4jUri.startsWith('neo4j+s://')
        }
      }
    };

    return new Response(
      JSON.stringify(response),
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
      details: 'Failed to connect to Neo4j AuraDB. Please check your credentials and network connectivity.'
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
