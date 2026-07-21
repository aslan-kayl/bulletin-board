interface TelegramWebAppUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

interface TelegramWebApp {
  ready(): void;
  expand(): void;
  close(): void;
  initData: string;
  initDataUnsafe: {
    user?: TelegramWebAppUser;
  };
  colorScheme: "light" | "dark";
  BackButton: {
    show(): void;
    hide(): void;
    onClick(cb: () => void): void;
    offClick(cb: () => void): void;
  };
  showAlert(message: string, callback?: () => void): void;
  showConfirm(message: string, callback: (confirmed: boolean) => void): void;
  showPopup(params: { title?: string; message: string; buttons?: unknown[] }, callback?: () => void): void;
  openTelegramLink(url: string): void;
}

interface Window {
  Telegram?: {
    WebApp: TelegramWebApp;
  };
}
