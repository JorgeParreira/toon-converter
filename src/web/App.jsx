import MainConverter from "./MainConverter";
import ApiPlayground from "./ApiPlayground";
import Header from "./Header";
import Footer from "./Footer";
import { BrowserRouter, Routes, Route } from "react-router-dom";


export default function App() {
  return (
    <BrowserRouter>
      <Header />

      <Routes>
        <Route path="/" element={<MainConverter />} />
        <Route path="/api" element={<ApiPlayground />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}


