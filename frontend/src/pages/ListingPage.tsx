import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { ListingDetail } from "@/types";
import { Spinner } from "@/components/Spinner";
import { useTelegram } from "@/hooks/useTelegram";
import styles from "./ListingPage.module.css";

const BASE_URL = import.meta.env.VITE_API_URL ?? "";

export function ListingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, tg } = useTelegram();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    tg?.BackButton.show();
    tg?.BackButton.onClick(() => navigate(-1));
    return () => tg?.BackButton.hide();
  }, [tg, navigate]);

  useEffect(() => {
    if (!id) return;
    api.getListing(Number(id)).then(setListing).finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!listing) return;
    tg?.showConfirm("Удалить объявление?", async (ok) => {
      if (!ok) return;
      await api.deleteListing(listing.id);
      navigate("/my");
    });
  };

  const handleMarkSold = async () => {
    if (!listing) return;
    await api.updateListing(listing.id, { status: "sold" });
    setListing({ ...listing, status: "sold" });
  };

  const contactSeller = () => {
    if (!listing) return;
    // Open Telegram chat with seller if username is available
    tg?.openTelegramLink(`https://t.me/${listing.user_id}`);
  };

  if (loading) return <Spinner />;
  if (!listing) return <div className={styles.empty}>Объявление не найдено</div>;

  const isOwner = user?.id === listing.user_id;
  const images = listing.images.sort((a, b) => a.order - b.order);
  const priceLabel = listing.price
    ? `${Number(listing.price).toLocaleString("ru-RU")} ₽`
    : listing.is_negotiable
    ? "Договорная"
    : "Бесплатно";

  return (
    <div className={styles.page}>
      {images.length > 0 ? (
        <div className={styles.gallery}>
          <img
            src={`${BASE_URL}${images[imgIdx].path}`}
            alt={listing.title}
            className={styles.mainImg}
          />
          {images.length > 1 && (
            <div className={styles.dots}>
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`${styles.dot} ${i === imgIdx ? styles.dotActive : ""}`}
                  onClick={() => setImgIdx(i)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className={styles.noImg}>{listing.category.icon}</div>
      )}

      <div className={styles.content}>
        <div className={styles.price}>{priceLabel}</div>
        {listing.status === "sold" && <div className={styles.soldTag}>Продано</div>}
        <h1 className={styles.title}>{listing.title}</h1>

        <div className={styles.meta}>
          <span>{listing.category.icon} {listing.category.name}</span>
          <span>{new Date(listing.created_at).toLocaleDateString("ru-RU")}</span>
        </div>

        <p className={styles.description}>{listing.description}</p>

        {isOwner ? (
          <div className={styles.actions}>
            {listing.status === "active" && (
              <button className={styles.soldBtn} onClick={handleMarkSold}>
                Отметить как продано
              </button>
            )}
            <button className={styles.deleteBtn} onClick={handleDelete}>
              Удалить
            </button>
          </div>
        ) : (
          listing.status === "active" && (
            <button onClick={contactSeller}>Написать продавцу</button>
          )
        )}
      </div>
    </div>
  );
}
