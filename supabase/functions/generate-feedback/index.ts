
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { itemName, itemDescription, selectedBin, correctBin, isCorrect, language } = await req.json();

    const systemPrompt = language === 'EN' 
      ? `You are a helpful waste sorting tutor. Provide educational feedback about waste sorting decisions. Keep responses concise (2-3 sentences) and encouraging. Use the item description to provide context about why items belong in specific bins.`
      : `Du bist ein hilfsreicher Mülltrennungs-Tutor. Gib lehrreiches Feedback zu Mülltrennungsentscheidungen. Halte Antworten knapp (2-3 Sätze) und ermutigend. Nutze die Gegenstandsbeschreibung, um zu erklären, warum Gegenstände in bestimmte Tonnen gehören.`;

    const userPrompt = isCorrect 
      ? (language === 'EN' 
          ? `The user correctly sorted "${itemName}" into the "${correctBin}". Item description: "${itemDescription}". Provide encouraging feedback explaining why this is correct.`
          : `Der Benutzer hat "${itemName}" korrekt in die "${correctBin}" sortiert. Gegenstandsbeschreibung: "${itemDescription}". Gib ermutigendes Feedback und erkläre, warum dies richtig ist.`)
      : (language === 'EN'
          ? `The user incorrectly sorted "${itemName}" into the "${selectedBin}" but it should go in the "${correctBin}". Item description: "${itemDescription}". Explain why it belongs in the correct bin.`
          : `Der Benutzer hat "${itemName}" fälschlicherweise in die "${selectedBin}" sortiert, aber es gehört in die "${correctBin}". Gegenstandsbeschreibung: "${itemDescription}". Erkläre, warum es in die richtige Tonne gehört.`);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const feedback = data.choices[0].message.content;

    return new Response(JSON.stringify({ feedback }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating feedback:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
