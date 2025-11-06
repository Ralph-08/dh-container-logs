import "./partials/App.scss";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LogsPage from "./pages/LogsPage/LogsPage";
import LiveTrack from "./pages/LiveTrack/LiveTrack";
import ContainerDetails from "./pages/ContainerDetails/ContainerDetails";
import ReviewPage from "./pages/ReviewPage/ReviewPage";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LogsPage />} />
          <Route path="/track" element={<LiveTrack />} />
          <Route path="/review" element={<ReviewPage />} />
          <Route
            path="/container/:containerNumber"
            element={<ContainerDetails />}
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
