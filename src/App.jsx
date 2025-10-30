import "./partials/App.scss";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LogsPage from "./pages/LogsPage/LogsPage";
import LiveTrack from "./pages/LiveTrack/LiveTrack";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LogsPage />} />
          <Route path="/track" element={<LiveTrack />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
