import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useTelegram } from "@/hooks/useTelegram";
import { BottomNav } from "@/components/BottomNav";
import { HomePage } from "@/pages/HomePage";
import { ListingPage } from "@/pages/ListingPage";
import { CreateListingPage } from "@/pages/CreateListingPage";
import { MyListingsPage } from "@/pages/MyListingsPage";

export default function App() {
  useTelegram();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/listings/:id" element={<ListingPage />} />
        <Route path="/create" element={<CreateListingPage />} />
        <Route path="/my" element={<MyListingsPage />} />
      </Routes>
      <BottomNav />
    </BrowserRouter>
  );
}
