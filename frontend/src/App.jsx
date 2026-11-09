import { BrowserRouter, Routes, Route } from "react-router-dom";
import ShieldHerLoader from "./pages/ShieldHerLoader";
import AuthPages from "./pages/AuthPages";
import { Home } from "./pages/Home";
import PersonalDetailsPage from "./pages/PersonalDetailsPage";
import SOSConfirmation from "./pages/sosConfirmation";
import HomePage from "./pages/HomePage";
import ShieldHerFlipbook from "./pages/ShieldHerFlipbook";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ShieldHerLoader />} />

        <Route path="/auth" element={<AuthPages />} />

        <Route path="/home" element={<HomePage  />} />

        <Route path="/details" element={<PersonalDetailsPage />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/sos-confirmation" element={<SOSConfirmation />} />
      
      </Routes>
    </BrowserRouter>
  );
}

export default App;
