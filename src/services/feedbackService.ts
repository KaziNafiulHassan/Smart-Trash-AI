
export interface FeedbackRequest {
  itemName: string;
  itemDescription: string;
  selectedBin: string;
  correctBin: string;
  isCorrect: boolean;
  language: 'EN' | 'DE';
}

export const feedbackService = {
  async generateFeedback(request: FeedbackRequest): Promise<string> {
    console.log('Generating feedback with request:', request);
    
    try {
      const { itemName, itemDescription, selectedBin, correctBin, isCorrect, language } = request;
      
      const wasCorrectString = isCorrect ? "Yes" : "No";
      
      const systemPrompt = language === 'EN' 
        ? `You are EcoSort AI, a friendly and helpful waste sorting assistant for Magdeburg, Germany. Your goal is to provide clear, concise, and encouraging educational feedback to users. Always refer to the bin by its name. Keep explanations to 1-3 sentences. Use the information from the 'description' of the waste item.`
        : `Du bist EcoSort AI, ein freundlicher und hilfsreicher Mülltrennungsassistent für Magdeburg, Deutschland. Dein Ziel ist es, den Benutzern klares, prägnantes und ermutigendes Bildungsfeedback zu geben. Beziehe dich immer auf die Tonne mit ihrem Namen. Halte Erklärungen bei 1-3 Sätzen. Nutze die Informationen aus der 'Beschreibung' des Müllgegenstandes.`;

      const userPrompt = language === 'EN'
        ? `A user has just interacted with a waste item. Here's the information:
- Item Name: ${itemName}
- Item's Own Description: ${itemDescription}
- Correct Bin: '${correctBin}'
- description of the item: ${itemDescription}
Scenario: Game Sorting
- User attempted to sort this item into the '${selectedBin}' bin.
- Was the user's sort correct? ${wasCorrectString} ("Yes" or "No")
Please provide feedback for the user based on this game sorting scenario. If the sort was correct, praise the user and briefly reiterate why it's correct, possibly adding a small relevant tip from the item's description. If the sort was incorrect, gently correct the user. Explain why their choice was not right for this item and clearly state why it belongs in the correct bin, referencing the item's description or the general rule.`
        : `Ein Benutzer hat gerade mit einem Müllgegenstand interagiert. Hier sind die Informationen:
- Gegenstand Name: ${itemName}
- Eigene Beschreibung des Gegenstandes: ${itemDescription}
- Richtige Tonne: '${correctBin}'
- Beschreibung des Gegenstandes: ${itemDescription}
Szenario: Spiel-Sortierung
- Benutzer hat versucht, diesen Gegenstand in die '${selectedBin}' Tonne zu sortieren.
- War die Sortierung des Benutzers korrekt? ${wasCorrectString} ("Ja" oder "Nein")
Bitte gib Feedback für den Benutzer basierend auf diesem Spiel-Sortierungsszenario. Wenn die Sortierung korrekt war, lobe den Benutzer und wiederhole kurz, warum es richtig ist, möglicherweise mit einem kleinen relevanten Tipp aus der Beschreibung des Gegenstandes. Wenn die Sortierung falsch war, korrigiere den Benutzer sanft. Erkläre, warum ihre Wahl für diesen Gegenstand nicht richtig war und erkläre klar, warum er in die richtige Tonne gehört, unter Bezugnahme auf die Beschreibung des Gegenstandes oder die allgemeine Regel.`;

      console.log('Making LLM API request to:', 'https://ai.h2.de/llm');
      console.log('Request payload:', {
        model: 'Llama-3.3',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 200,
        temperature: 0.7,
      });

      const response = await fetch('https://ai.h2.de/llm', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer sk-1234`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'Llama-3.3',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 200,
          temperature: 0.7,
        }),
      });

      console.log('LLM API response status:', response.status);
      console.log('LLM API response headers:', response.headers);

      if (!response.ok) {
        console.error('LLM API error:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('LLM API error body:', errorText);
        return this.getFallbackFeedback(request);
      }

      const data = await response.json();
      console.log('LLM API response data:', data);
      
      const feedback = data.choices?.[0]?.message?.content || data.response || data.text;
      
      if (!feedback) {
        console.error('No feedback content in LLM response');
        return this.getFallbackFeedback(request);
      }
      
      console.log('Generated feedback:', feedback);
      return feedback;
    } catch (error) {
      console.error('Error calling LLM API:', error);
      return this.getFallbackFeedback(request);
    }
  },

  getFallbackFeedback(request: FeedbackRequest): string {
    const { itemName, itemDescription, selectedBin, correctBin, isCorrect, language } = request;
    
    console.log('Using fallback feedback with description:', itemDescription);
    
    if (isCorrect) {
      return language === 'EN' 
        ? `Excellent! ${itemName} belongs in the ${correctBin}. ${itemDescription ? `Tip: ${itemDescription}` : 'Great job with waste sorting!'}`
        : `Ausgezeichnet! ${itemName} gehört in die ${correctBin}. ${itemDescription ? `Tipp: ${itemDescription}` : 'Großartige Arbeit beim Mülltrennen!'}`;
    } else {
      return language === 'EN'
        ? `Not quite right. ${itemName} doesn't belong in the ${selectedBin}. It should go in the ${correctBin}. ${itemDescription ? `Remember: ${itemDescription}` : 'Keep learning!'}`
        : `Nicht ganz richtig. ${itemName} gehört nicht in die ${selectedBin}. Es sollte in die ${correctBin}. ${itemDescription ? `Denk daran: ${itemDescription}` : 'Weiter lernen!'}`;
    }
  }
};
