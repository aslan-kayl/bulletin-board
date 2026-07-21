import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { Category } from "@/types";
import { useTelegram } from "@/hooks/useTelegram";
import { Spinner } from "@/components/Spinner";
import styles from "./CreateListingPage.module.css";

const MAX_IMAGES = 5;

export function CreateListingPage() {
  const navigate = useNavigate();
  const { tg } = useTelegram();
  const fileRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    is_negotiable: false,
    category_id: "",
  });

  useEffect(() => {
    api.getCategories().then((cats) => {
      setCategories(cats);
      if (cats.length) setForm((f) => ({ ...f, category_id: String(cats[0].id) }));
    });
  }, []);

  useEffect(() => {
    tg?.BackButton.show();
    tg?.BackButton.onClick(() => navigate(-1));
    return () => tg?.BackButton.hide();
  }, [tg, navigate]);

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []).slice(0, MAX_IMAGES - files.length);
    const newFiles = [...files, ...selected].slice(0, MAX_IMAGES);
    setFiles(newFiles);
    setPreviews(newFiles.map((f) => URL.createObjectURL(f)));
  };

  const removeImage = (i: number) => {
    const newFiles = files.filter((_, idx) => idx !== i);
    setFiles(newFiles);
    setPreviews(newFiles.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.category_id) return;

    const fd = new FormData();
    fd.append("title", form.title.trim());
    fd.append("description", form.description.trim());
    if (form.price) fd.append("price", form.price);
    fd.append("is_negotiable", String(form.is_negotiable));
    fd.append("category_id", form.category_id);
    files.forEach((f) => fd.append("images", f));

    setLoading(true);
    try {
      const listing = await api.createListing(fd);
      tg?.showPopup({ title: "Готово!", message: "Объявление опубликовано." });
      navigate(`/listings/${listing.id}`);
    } catch (err) {
      tg?.showAlert("Ошибка при создании объявления");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <h2 className={styles.heading}>Новое объявление</h2>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label>Категория</label>
          <select
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label>Заголовок *</label>
          <input
            type="text"
            placeholder="Например: iPhone 14 Pro 256GB"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            maxLength={256}
            required
          />
        </div>

        <div className={styles.field}>
          <label>Описание</label>
          <textarea
            placeholder="Расскажите подробнее о товаре..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
          />
        </div>

        <div className={styles.priceRow}>
          <div className={styles.field}>
            <label>Цена (₽)</label>
            <input
              type="number"
              placeholder="0"
              min="0"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              disabled={form.is_negotiable}
            />
          </div>
          <label className={styles.checkLabel}>
            <input
              type="checkbox"
              checked={form.is_negotiable}
              onChange={(e) => setForm({ ...form, is_negotiable: e.target.checked, price: "" })}
            />
            Договорная
          </label>
        </div>

        <div className={styles.field}>
          <label>Фото (до {MAX_IMAGES})</label>
          <div className={styles.photos}>
            {previews.map((src, i) => (
              <div key={i} className={styles.photoItem}>
                <img src={src} alt="" />
                <button type="button" className={styles.removeBtn} onClick={() => removeImage(i)}>✕</button>
              </div>
            ))}
            {files.length < MAX_IMAGES && (
              <button
                type="button"
                className={styles.addPhoto}
                onClick={() => fileRef.current?.click()}
              >
                📷
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: "none" }}
            onChange={handleImages}
          />
        </div>

        <button type="submit" disabled={loading || !form.title.trim()}>
          {loading ? "Публикуем..." : "Опубликовать"}
        </button>
      </form>
    </div>
  );
}
