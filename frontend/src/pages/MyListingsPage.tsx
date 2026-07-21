import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { ListingListItem } from "@/types";
import { ListingCard } from "@/components/ListingCard";
import { Spinner } from "@/components/Spinner";
import { useTelegram } from "@/hooks/useTelegram";
import styles from "./MyListingsPage.module.css";

export function MyListingsPage() {
  const { user } = useTelegram();
  const [listings, setListings] = useState<ListingListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMyListings().then(setListings).finally(() => setLoading(false));
  }, []);

  const displayName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(" ")
    : "Мои объявления";

  if (loading) return <Spinner />;

  return (
    <div className={styles.page}>
      <h2 className={styles.heading}>{displayName}</h2>

      {listings.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📋</div>
          <p>У вас нет объявлений</p>
          <p className={styles.hint}>Нажмите «Подать», чтобы добавить первое</p>
        </div>
      ) : (
        <>
          <div className={styles.stats}>
            Активных: {listings.filter((l) => l.status === "active").length} ·{" "}
            Продано: {listings.filter((l) => l.status === "sold").length}
          </div>
          <div className={styles.grid}>
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
