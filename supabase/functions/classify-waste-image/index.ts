
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

    // Call Hugging Face API for waste classification
    const hfResponse = await fetch(
      'https://api-inference.huggingface.co/models/Nafi007/EfficientNetB0',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('HUGGING_FACE_TOKEN')}`,
          'Content-Type': 'application/octet-stream',
        },
        body: imageData,
      }
    );

    if (!hfResponse.ok) {
      console.error('Hugging Face API error:', await hfResponse.text());
      return new Response(
        JSON.stringify({ error: 'Classification service unavailable' }),
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
    const confidence = topPrediction.score;
    const predictedCategory = topPrediction.label;

    // Map predicted category to bin type
    const categoryToBin = {
      'cardboard': 'paper',
      'glass': 'glass', 
      'metal': 'metal',
      'paper': 'paper',
      'plastic': 'plastic',
      'trash': 'general'
    };

    const predictedBin = categoryToBin[predictedCategory.toLowerCase()] || 'general';

    // Store image in Supabase Storage (temporary)
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
    }

    // Save classification result to database
    const { error: dbError } = await supabaseClient
      .from('image_classifications')
      .insert({
        user_id: userId,
        image_url: imageUrl,
        predicted_category: predictedCategory,
        predicted_bin: predictedBin,
        confidence: confidence,
        user_feedback_correct: null,
        user_selected_bin: null
      });

    if (dbError) {
      console.error('Database error:', dbError);
    }

    // Generate educational feedback
    const feedbackTexts = {
      EN: {
        paper: "Great! Paper items like cardboard, newspapers, and magazines should go in the paper bin. 💡 Tip: Remove any plastic coatings or tape before recycling.",
        plastic: "Correct! Plastic items like bottles, containers, and bags belong in the plastic bin. 💡 Tip: Clean containers and check the recycling number for proper sorting.",
        glass: "Perfect! Glass bottles and jars should go in the glass bin. 💡 Tip: Remove caps and lids, and avoid broken glass in regular recycling.",
        metal: "Excellent! Metal cans, foil, and containers belong in the metal bin. 💡 Tip: Rinse food containers and crush cans to save space.",
        general: "This item goes in the general waste bin. 💡 Tip: Some items can't be recycled and need special disposal methods."
      },
      DE: {
        paper: "Toll! Papierartikel wie Karton, Zeitungen und Magazine gehören in die Papiertonne. 💡 Tipp: Entfernen Sie Plastikbeschichtungen oder Klebeband vor dem Recycling.",
        plastic: "Richtig! Plastikartikel wie Flaschen, Behälter und Beutel gehören in die Plastiktonne. 💡 Tipp: Reinigen Sie Behälter und prüfen Sie die Recycling-Nummer.",
        glass: "Perfekt! Glasflaschen und -gläser gehören in die Glastonne. 💡 Tipp: Entfernen Sie Verschlüsse und Deckel, zerbrochenes Glas nicht ins normale Recycling.",
        metal: "Ausgezeichnet! Metalldosen, Folie und Behälter gehören in die Metalltonne. 💡 Tipp: Spülen Sie Lebensmittelbehälter aus und zerdrücken Sie Dosen.",
        general: "Dieser Artikel gehört in den Restmüll. 💡 Tipp: Manche Artikel können nicht recycelt werden und brauchen spezielle Entsorgung."
      }
    };

    const feedback = feedbackTexts[language][predictedBin] || feedbackTexts[language].general;

    const result = {
      predictedCategory,
      predictedBin,
      confidence: Math.round(confidence * 100),
      feedback,
      imageUrl,
      timestamp: new Date().toISOString()
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
