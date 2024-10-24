import React from 'react';
import "./App.css";
import EditorPage from "./components/EditorPage";
import Home from "./components/Home";
import { Routes, Route } from "react-router-dom";
import {Toaster} from 'react-hot-toast';

function App() {
  return (
    <>
    <Toaster position='top-center'></Toaster>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/editor/:RoomId" element={<EditorPage />} />
        
      </Routes>
    </>
  );
}

export default App;
