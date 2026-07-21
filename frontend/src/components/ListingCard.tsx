import { ListingListItem } from "@/types";
import { useNavigate } from "react-router-dom";
import styles from "./ListingCard.module.css";

const BASE_URL = import.meta.env.VITE_API_URL ?? "";

interface Props {
  listing: ListingListItem;
}

export function ListingCard({ listing }: Props) {
  const navigate = useNavigate();
  const imgSrc = listing.cover ? `${BASE_URL}${listing.cover}` : null;

  const priceLabel = listing.price
    ? `${Number(listing.price).toLocaleString("ru-RU")} ₽`
    : listing.is_negotiable
    ? "Договорная"
    : "Бесплатно";

  return (
    <div className={styles.card} onClick={() => navigate(`/listings/${listing.id}`)}>
      <div className={styles.img}>
        {imgSrc ? (
          <img src={imgSrc} alt={listing.title} loading="lazy" />
        ) : (
          <span className={styles.noImg}>{listing.category.icon}</span>
        )}
        {listing.status === "sold" && <div className={styles.soldBadge}>Продано</div>}
      </div>
      <div className={styles.body}>
        <div className={styles.price}>{priceLabel}</div>
        <div className={styles.title}>{listing.title}</div>
        <div className={styles.meta}>
          {listing.category.icon} {listing.category.name}
        </div>
      </div>
    </div>
  );
}
