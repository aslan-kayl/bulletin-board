import { Category, ListingDetail, ListingListItem, PaginatedListings, User } from "@/types";

const BASE_URL = import.meta.env.VITE_API_URL ?? "";

function getInitData(): string {
  return window.Telegram?.WebApp?.initData ?? "";
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "X-Init-Data": getInitData(),
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  getMe: () => request<User>("/api/auth/me"),

  getCategories: () => request<Category[]>("/api/categories/"),

  getListings: (params: { page?: number; category_id?: number; search?: string }) => {
    const q = new URLSearchParams();
    if (params.page) q.set("page", String(params.page));
    if (params.category_id) q.set("category_id", String(params.category_id));
    if (params.search) q.set("search", params.search);
    return request<PaginatedListings>(`/api/listings/?${q}`);
  },

  getListing: (id: number) => request<ListingDetail>(`/api/listings/${id}`),

  getMyListings: () => request<ListingListItem[]>("/api/listings/my"),

  createListing: (form: FormData) =>
    request<ListingDetail>("/api/listings/", { method: "POST", body: form }),

  updateListing: (id: number, data: Record<string, unknown>) =>
    request<ListingDetail>(`/api/listings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  deleteListing: (id: number) =>
    request<void>(`/api/listings/${id}`, { method: "DELETE" }),
};
