import { Navigate, Route, Routes } from "react-router-dom";
import { ReminderWatcher } from "./components/ReminderWatcher";
import { Shell } from "./components/Shell";
import { StoreProvider } from "./hooks/useStore";
import { AlertsPage } from "./pages/AlertsPage";
import { CollectionPage } from "./pages/CollectionPage";
import { EquipmentPage } from "./pages/EquipmentPage";
import { EventsPage } from "./pages/EventsPage";
import { LearnPage } from "./pages/LearnPage";
import { ListenPage } from "./pages/ListenPage";
import { MyEquipmentPage } from "./pages/MyEquipmentPage";
import { SatellitePage } from "./pages/SatellitePage";
import { SatellitesPage } from "./pages/SatellitesPage";
import { SetsPage } from "./pages/SetsPage";
import { SignalsPage } from "./pages/SignalsPage";

export function App() {
  return (
    <StoreProvider>
      <ReminderWatcher />
      <Routes>
        <Route element={<Shell />}>
          <Route path="/" element={<Navigate to="/listen" replace />} />
          <Route path="/listen" element={<ListenPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/satellites" element={<SatellitesPage />} />
          <Route path="/satellite/:id" element={<SatellitePage />} />
          <Route path="/signals" element={<SignalsPage />} />
          <Route path="/collection" element={<CollectionPage />} />
          <Route path="/collection/sets" element={<SetsPage />} />
          <Route path="/equipment" element={<EquipmentPage />} />
          <Route path="/my-equipment" element={<MyEquipmentPage />} />
          <Route path="/settings/alerts" element={<AlertsPage />} />
          <Route path="/learn" element={<LearnPage />} />
        </Route>
      </Routes>
    </StoreProvider>
  );
}
