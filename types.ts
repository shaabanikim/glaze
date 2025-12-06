export interface Product {
  id: string;
  name: string;
  price: number;
  shade: string;
  description: string;
  image: string;
  hex: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export enum ConsultantState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  RECOMMENDING = 'RECOMMENDING',
  ERROR = 'ERROR'
}

export interface Recommendation {
  productId: string;
  reasoning: string;
}

export interface User {
  name: string;
  email: string;
  avatar: string;
  isAdmin?: boolean;
  isVerified?: boolean;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
}