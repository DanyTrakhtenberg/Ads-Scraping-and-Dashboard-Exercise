/**
 * Main App Component
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { AdDetail } from "./components/ads/AdDetail";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/ads/:id" element={<AdDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
