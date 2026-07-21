import { useNavigate, useLocation } from "react-router-dom";
import styles from "./BottomNav.module.css";

const TABS = [
  { path: "/", icon: "🏠", label: "Лента" },
  { path: "/create", icon: "➕", label: "Подать" },
  { path: "/my", icon: "👤", label: "Мои" },
];

export function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className={styles.nav}>
      {TABS.map((tab) => (
        <button
          key={tab.path}
          className={`${styles.tab} ${pathname === tab.path ? styles.active : ""}`}
          onClick={() => navigate(tab.path)}
        >
          <span className={styles.icon}>{tab.icon}</span>
          <span className={styles.label}>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
