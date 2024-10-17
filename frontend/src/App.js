import "./App.css";
import EditorPage from "./components/EditorPage";
import Home from "./components/Home";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/editor/:RoomId" element={<EditorPage />} />
        
      </Routes>
    </>
  );
}

export default App;
