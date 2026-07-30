// Database row shapes (snake_case) matching the Supabase schema.
// These mirror supabase/migrations/001_schema.sql.

import type { Tone } from "./types";

export type ProductStatus = "active" | "draft" | "archived";
export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";
export type UserRole = "customer" | "admin";

export interface DBCategory {
  id: string;
  slug: string;
  name: string;
  tone: Tone | null;
  icon: string | null;
  blurb: string | null;
  sort_order: number;
  created_at: string;
}

export interface DBProductSize {
  id: string;
  product_id: string;
  label: string;
  stock: number;
  sku: string | null;
}

export interface DBProductImage {
  id: string;
  product_id: string;
  url: string;
  alt: string | null;
  sort_order: number;
  created_at: string;
}

export interface DBProduct {
  id: string;
  slug: string;
  name: string;
  subtitle: string | null;
  category_id: string;
  price: number;
  rating: number;
  reviews_count: number;
  tone: Tone | null;
  best_seller: boolean;
  short: string | null;
  benefits: string[];
  features: string[];
  mascot: string | null;
  ingredients: string | null;
  howto: string | null;
  status: ProductStatus;
  created_at: string;
  // joined
  category?: DBCategory;
  sizes?: DBProductSize[];
  images?: DBProductImage[];
}

export interface DBAddress {
  id: string;
  user_id: string;
  label: string;
  full_name: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  postal_code: string;
  is_default: boolean;
  created_at: string;
}

export interface DBCartItem {
  id: string;
  user_id: string;
  product_id: string;
  size_id: string;
  qty: number;
  updated_at: string;
  // joined
  product?: DBProduct;
  size?: DBProductSize;
}

export interface DBOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  size_label: string;
  qty: number;
  unit_price: number;
}

export interface DBOrder {
  id: string;
  user_id: string;
  status: OrderStatus;
  subtotal: number;
  shipping_fee: number;
  total: number;
  shipping_address: {
    full_name: string;
    phone: string;
    street: string;
    city: string;
    province: string;
    postal_code: string;
  };
  payment_method: string | null;
  payment_ref: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // joined
  items?: DBOrderItem[];
}
