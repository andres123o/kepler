export interface InstagramComment {
  id: string;
  text: string;
  ownerUsername: string;
  timestamp: string;
}

export interface InstagramPost {
  id: string; // shortcode
  url: string;
  caption: string;
  timestamp: string;
  commentsCount: number;
  latestComments: InstagramComment[]; // Aquí guardaremos los últimos 5
}

