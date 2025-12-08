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
    koncernstruktur: string;
  };
}

export type SortColumn = 'varumärke' | 'kategori' | 'tillverkadISverige' | null;
export type SortDirection = 'asc' | 'desc';
