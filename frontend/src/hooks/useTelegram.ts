import { useEffect } from "react";

export function useTelegram() {
  const tg = window.Telegram?.WebApp;

  useEffect(() => {
    tg?.ready();
    tg?.expand();
  }, [tg]);

  return {
    tg,
    user: tg?.initDataUnsafe?.user,
    initData: tg?.initData ?? "",
    colorScheme: tg?.colorScheme ?? "light",
  };
}
