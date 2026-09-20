export type WasteCategory = 'organic' | 'recyclable' | 'hazardous' | 'residual';

export interface BinInfo {
  id: WasteCategory;
  name: string;
  shortName: string;
  color: string;
  bgGrad: string;
  borderColor: string;
  textColor: string;
  iconName: string;
  description: string;
  examples: string;
}

export interface WasteItem {
  id: string;
  name: string;
  category: WasteCategory;
  icon: string;
  emoji: string;
  description: string;
  funFact: string;
  color: string;
  craftableInto?: string[]; // IDs of RecycledProducts this can turn into
  imageUrl?: string;
}

export interface RecycledProduct {
  id: string;
  name: string;
  icon: string;
  emoji: string;
  category: 'Đồ chơi' | 'Gia dụng' | 'Vườn tược' | 'Thời trang';
  requiredWastes: {
    wasteId: string;
    count: number;
    name: string;
    emoji: string;
  }[];
  description: string;
  ecoBenefit: string;
  craftingSteps: string[];
  color: string;
  imageUrl?: string;
}

export interface PlayerScore {
  id: string;
  playerName: string;
  avatar: string;
  score: number;
  roundsCleared: number;
  accuracy: number;
  timestamp: number;
}

export interface RoundConfig {
  round: number;
  title: string;
  description: string;
  timeSeconds: number;
  totalItems: number;
  minScoreToPass: number;
  speedMultiplier: number;
}
