export interface Recommendation {
  productName: string;
  productImageURL: string;
  price: string;
  buyLink: string;
}

export interface StyleSuggestion {
  itemName: string;
  description: string;
}

export interface AnalysisResult {
  description: string;
  accessories: string[];
  footwear: string;
  hairstyle: string;
  caption: string;
  occasion: string;
  styleSuggestions: StyleSuggestion[];
  recommendations: Recommendation[];
}