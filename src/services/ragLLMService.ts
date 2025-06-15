
import { Language } from '@/types/common';

interface RAGResponse {
  message: string;
}

// Mock LLM responses
const mockRAGResponses: Record<string, { EN: string; DE: string }> = {
  'paper': {
    EN: "Great job! This item is made of fiber-based Paper, so it belongs in the Paper Bin. Just make sure to keep it dry and peel off any plastic coating before recycling. You can also drop off large volumes at City Paper Center (45 Eco St).",
    DE: "Toll gemacht! Dieser Gegenstand besteht aus faserbasiertem Papier und gehört daher in die Papiertonne. Achten Sie darauf, dass es trocken bleibt und entfernen Sie alle Plastikbeschichtungen vor dem Recycling. Große Mengen können Sie auch im Papier-Center (45 Eco St) abgeben."
  },
  'plastic': {
    EN: "Excellent choice! This plastic item belongs in the Lightweight Packaging Bin. Remember to rinse out any containers and remove bottle caps. For larger plastic items, visit Metro Plastic Facility (123 Green Ave).",
    DE: "Ausgezeichnete Wahl! Dieser Plastikgegenstand gehört in die Gelbe Tonne. Denken Sie daran, Behälter auszuspülen und Verschlüsse zu entfernen. Für größere Plastikgegenstände besuchen Sie die Metro Plastik-Anlage (123 Green Ave)."
  },
  'glass': {
    EN: "Perfect! Glass items go in the Waste Glass Container. Separate by color if possible and remove any metal caps or lids. The Glass Recycling Hub (89 Clear St) accepts larger glass items.",
    DE: "Perfekt! Glasgegenstände gehören in den Altglascontainer. Trennen Sie nach Farben und entfernen Sie Metallverschlüsse. Das Glas-Recycling-Center (89 Clear St) nimmt größere Glasgegenstände an."
  },
  'bio': {
    EN: "Well done! This organic waste belongs in the Bio Bin. Remember, no meat, bones, or dairy products should go here. The Composting Center (56 Nature Way) can handle larger organic waste.",
    DE: "Gut gemacht! Dieser organische Abfall gehört in die Biotonne. Denken Sie daran: Fleisch, Knochen oder Milchprodukte gehören nicht hinein. Das Kompostierzentrum (56 Nature Way) kann größere organische Abfälle verarbeiten."
  },
  'residual': {
    EN: "Correct! This item goes in the Residual Waste Bin for items that cannot be recycled elsewhere. The Municipal Waste Center (12 Main St) handles general waste disposal.",
    DE: "Richtig! Dieser Gegenstand gehört in die Restmülltonne für Gegenstände, die nicht anderweitig recycelt werden können. Das Städtische Abfallzentrum (12 Main St) kümmert sich um die allgemeine Abfallentsorgung."
  },
  'hazardous': {
    EN: "Important! This hazardous material requires special handling. Please use protective equipment and take it to the Hazmat Disposal Unit (78 Safety Blvd) for safe disposal.",
    DE: "Wichtig! Dieses Gefahrgut erfordert eine besondere Behandlung. Bitte verwenden Sie Schutzausrüstung und bringen Sie es zur Giftmüll-Entsorgung (78 Safety Blvd) für eine sichere Entsorgung."
  },
  'bulky': {
    EN: "That's right! Bulky items need special collection. Schedule a pickup or bring large items to the Bulk Item Center (34 Storage Lane) for proper disposal.",
    DE: "Das ist richtig! Sperrmüll benötigt eine spezielle Abholung. Vereinbaren Sie einen Termin oder bringen Sie große Gegenstände zum Sperrmüll-Center (34 Storage Lane) für eine ordnungsgemäße Entsorgung."
  }
};

export const ragLLMService = {
  async generateFeedback(binType: string, itemName: string, language: Language): Promise<RAGResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const response = mockRAGResponses[binType] || mockRAGResponses['residual'];
    
    return {
      message: response[language]
    };
  }
};
