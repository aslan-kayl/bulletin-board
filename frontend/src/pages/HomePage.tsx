import { useEffect, useState, useCallback } from "react";
import { api } from "@/services/api";
import { Category, ListingListItem } from "@/types";
import { ListingCard } from "@/components/ListingCard";
import { Spinner } from "@/components/Spinner";
import styles from "./HomePage.module.css";

export function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [listings, setListings] = useState<ListingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    api.getCategories().then(setCategories);
  }, []);

  const load = useCallback(
    async (p: number) => {
      setLoading(true);
      try {
        const data = await api.getListings({ page: p, category_id: categoryId, search });
        if (p === 1) {
          setListings(data.items);
        } else {
          setListings((prev) => [...prev, ...data.items]);
        }
        setPages(data.pages);
        setPage(p);
      } finally {
        setLoading(false);
      }
    },
    [categoryId, search]
  );

  useEffect(() => {
    load(1);
  }, [load]);

  return (
    <div className={styles.page}>
      <div className={styles.searchBar}>
        <input
          type="search"
          placeholder="Поиск..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load(1)}
        />
      </div>

      <div className={styles.categories}>
        <button
          className={`${styles.catBtn} ${!categoryId ? styles.catActive : ""}`}
          onClick={() => setCategoryId(undefined)}
        >
          Все
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            className={`${styles.catBtn} ${categoryId === c.id ? styles.catActive : ""}`}
            onClick={() => setCategoryId(c.id)}
          >
            {c.icon} {c.name}
          </button>
        ))}
      </div>

      {loading && page === 1 ? (
        <Spinner />
      ) : listings.length === 0 ? (
        <div className={styles.empty}>Объявлений не найдено</div>
      ) : (
        <>
          <div className={styles.grid}>
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
          {page < pages && (
            <button
              className={styles.loadMore}
              onClick={() => load(page + 1)}
              disabled={loading}
            >
              {loading ? "Загрузка..." : "Показать ещё"}
            </button>
          )}
        </>
      )}
    </div>
  );
}
