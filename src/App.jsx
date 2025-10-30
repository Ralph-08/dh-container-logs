import "./partials/App.scss";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LogsPage from "./pages/LogsPage/LogsPage";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LogsPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
