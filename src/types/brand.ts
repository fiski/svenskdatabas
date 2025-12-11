export interface BrandInHierarchy {
  namn: string;                  // Brand name
  land: string;                  // ISO 3166-1 alpha-2 code
  ärHuvudvarumärke: boolean;    // true for the current brand
  status?: 'Ja' | 'Nej' | 'Delvis';  // Manufacturing status (optional, for Swedish brands)
}

export interface KoncernNode {
  moderbolag?: string;           // e.g., "Fenix Outdoor International AG"
  moderbolagLand?: string;       // ISO country code (e.g., "CH")
  ägare?: string;                // e.g., "Fenix Outdoor AB"
  ägareLand?: string;            // ISO country code (e.g., "SE")
  varumärken: BrandInHierarchy[];
}

export interface Brand {
  id: number;
  varumärke: string;
  kategori: string;
  tillverkadISverige: 'Ja' | 'Nej' | 'Delvis';
  merInfo: {
    moderbolag: string;
    ägare: string;
    börsnoterat: string;
    tillverkningsländer: string[];
    koncernstruktur: KoncernNode | string;  // Union type for migration
    intro?: string;  // Optional brand description (2-3 sentences)
  };
}

export type SortColumn = 'varumärke' | 'kategori' | 'tillverkadISverige' | null;
export type SortDirection = 'asc' | 'desc';
