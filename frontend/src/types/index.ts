export interface Category {
  id: number;
  name: string;
  icon: string;
  slug: string;
}

export interface ListingImage {
  id: number;
  path: string;
  order: number;
}

export interface ListingListItem {
  id: number;
  title: string;
  price: number | null;
  is_negotiable: boolean;
  status: "active" | "sold" | "archived";
  category: Category;
  cover: string | null;
  user_id: number;
  created_at: string;
}

export interface ListingDetail extends ListingListItem {
  description: string;
  images: ListingImage[];
  updated_at: string;
}

export interface PaginatedListings {
  items: ListingListItem[];
  total: number;
  page: number;
  pages: number;
}

export interface User {
  id: number;
  username: string | null;
  first_name: string;
  last_name: string | null;
  created_at: string;
}
