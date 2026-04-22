import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../../home/Home";
import DiagramPage from "../../diagram/DiagramPage";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/diagram" element={<DiagramPage />} />
      </Routes>
    </BrowserRouter>
  );
}
