
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { imageBase64, userId, language = 'EN' } = await req.json();

    if (!imageBase64 || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing imageBase64 or userId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing image classification for user:', userId);

    // Convert base64 to blob for Hugging Face API
    const imageData = Uint8Array.from(atob(imageBase64.split(',')[1]), c => c.charCodeAt(0));

    // Get the Hugging Face token
    const hfToken = Deno.env.get('HUGGING_FACE_TOKEN') || 
                    Deno.env.get('HUGGINGFACE_TOKEN') || 
                    Deno.env.get('HF_TOKEN');
    
    console.log('Environment variables check:');
    console.log('HUGGING_FACE_TOKEN exists:', !!Deno.env.get('HUGGING_FACE_TOKEN'));
    console.log('Token found:', !!hfToken);
    
    if (!hfToken) {
      console.error('No Hugging Face token found in environment variables');
      return new Response(
        JSON.stringify({ 
          error: 'Hugging Face token not configured', 
          debug: 'HUGGING_FACE_TOKEN environment variable is missing from Edge Function secrets'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clean the token
    const cleanToken = hfToken.trim().replace(/[\r\n\t]/g, '');
    console.log('Token cleaned, length:', cleanToken.length);

    // Use your custom fine-tuned model
    const modelName = 'Nafi007/EfficientNetB0';
    console.log('Using custom model:', modelName);

    const hfResponse = await fetch(
      `https://api-inference.huggingface.co/models/${modelName}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cleanToken}`,
          'Content-Type': 'application/octet-stream',
        },
        body: imageData,
      }
    );

    console.log('HF Response status:', hfResponse.status);

    if (!hfResponse.ok) {
      const errorText = await hfResponse.text();
      console.error('Hugging Face API error:', hfResponse.status, errorText);
      
      // If the model is loading, return a temporary response
      if (hfResponse.status === 503) {
        return new Response(
          JSON.stringify({ error: 'AI model is loading, please try again in a moment' }),
          { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          error: 'Classification service unavailable', 
          details: `${hfResponse.status}: ${errorText}`,
          model: modelName,
          tokenProvided: !!cleanToken,
          tokenLength: cleanToken?.length || 0
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const predictions = await hfResponse.json();
    console.log('HF predictions:', predictions);

    if (!Array.isArray(predictions) || predictions.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No classification results' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the top prediction
    const topPrediction = predictions[0];
    const predictedCategory = topPrediction.label;
    const confidence = topPrediction.score || 0.8;

    console.log('Predicted category:', predictedCategory, 'with confidence:', confidence);

    // Map your model's predictions to waste categories
    // You'll need to update this mapping based on your model's output classes
    const wasteMapping = {
      // Add mappings based on your training labels
      // Example mappings - update these to match your model's actual class names
      'plastic_bottle': { bin: 'plastic', category: 'plastic bottle' },
      'glass_bottle': { bin: 'glass', category: 'glass bottle' },
      'paper': { bin: 'paper', category: 'paper item' },
      'cardboard': { bin: 'paper', category: 'cardboard' },
      'metal_can': { bin: 'residual', category: 'metal can' },
      'organic_waste': { bin: 'bio', category: 'organic waste' },
      'general_waste': { bin: 'residual', category: 'general waste' },
      // Add more mappings based on your training data
    };

    // Find best match for waste category
    let binType = 'residual'; // default fallback
    let mappedCategory = predictedCategory; // Use the model's prediction as default
    
    // Direct mapping if available
    if (wasteMapping[predictedCategory]) {
      binType = wasteMapping[predictedCategory].bin;
      mappedCategory = wasteMapping[predictedCategory].category;
    } else {
      // Fallback: try partial matching
      const lowerPredicted = predictedCategory.toLowerCase();
      for (const [key, value] of Object.entries(wasteMapping)) {
        if (lowerPredicted.includes(key.toLowerCase().replace('_', ' ')) || 
            key.toLowerCase().replace('_', ' ').includes(lowerPredicted)) {
          binType = value.bin;
          mappedCategory = value.category;
          break;
        }
      }
    }

    // Query the categories table to get proper rules
    const { data: categoryData, error: categoryError } = await supabaseClient
      .from('categories')
      .select('*')
      .eq('bin_type', binType)
      .limit(1);

    let rule = '';
    if (!categoryError && categoryData && categoryData.length > 0) {
      rule = language === 'DE' ? categoryData[0].rule_de : categoryData[0].rule_en;
    }

    // Store image in Supabase Storage
    const fileName = `${userId}_${Date.now()}.jpg`;
    const { error: uploadError } = await supabaseClient.storage
      .from('realtime-sorting-images')
      .upload(fileName, imageData, {
        contentType: 'image/jpeg',
        upsert: false
      });

    let imageUrl = null;
    if (!uploadError) {
      const { data } = supabaseClient.storage
        .from('realtime-sorting-images')
        .getPublicUrl(fileName);
      imageUrl = data.publicUrl;
    } else {
      console.error('Image upload error:', uploadError);
    }

    // Save classification result to database
    const { error: dbError } = await supabaseClient
      .from('image_classifications')
      .insert({
        user_id: userId,
        image_url: imageUrl,
        predicted_category: mappedCategory,
        predicted_bin: binType,
        confidence: confidence,
        user_feedback_correct: null,
        user_selected_bin: null
      });

    if (dbError) {
      console.error('Database error:', dbError);
    }

    // Generate feedback
    let feedback = rule;
    if (!feedback) {
      // Fallback feedback
      const fallbackTexts = {
        EN: {
          paper: "This item belongs to paper waste. Please dispose of it in the paper bin.",
          plastic: "This item belongs to plastic waste. Please dispose of it in the plastic bin.",
          glass: "This item belongs to glass waste. Please dispose of it in the glass bin.",
          bio: "This item belongs to organic waste. Please dispose of it in the bio bin.",
          residual: "This item belongs to residual waste. Please dispose of it in the residual waste bin.",
          hazardous: "This item requires special hazardous waste disposal.",
          bulky: "This item is bulky waste that requires special collection."
        },
        DE: {
          paper: "Dieser Artikel gehört zu Papiermüll. Bitte entsorgen Sie ihn in der Papiertonne.",
          plastic: "Dieser Artikel gehört zu Plastikmüll. Bitte entsorgen Sie ihn in der Plastiktonne.",
          glass: "Dieser Artikel gehört zu Glasmüll. Bitte entsorgen Sie ihn in der Glastonne.",
          bio: "Dieser Artikel gehört zu Biomüll. Bitte entsorgen Sie ihn in der Biotonne.",
          residual: "Dieser Artikel gehört zu Restmüll. Bitte entsorgen Sie ihn in der Restmülltonne.",
          hazardous: "Dieser Artikel erfordert spezielle Sondermüllentsorgung.",
          bulky: "Dieser Artikel ist Sperrmüll, der spezielle Abholung erfordert."
        }
      };
      feedback = fallbackTexts[language][binType] || fallbackTexts[language].residual;
    }

    const result = {
      predictedCategory: mappedCategory,
      predictedBin: binType,
      confidence: Math.round(confidence * 100),
      feedback,
      rule,
      imageUrl,
      timestamp: new Date().toISOString(),
      modelUsed: modelName,
      originalPrediction: predictedCategory
    };

    console.log('Classification result:', result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in classify-waste-image function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
