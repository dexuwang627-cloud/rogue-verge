import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Manifesto from './pages/Manifesto';
import Relics from './pages/Relics';
import RelicDetail from './pages/RelicDetail';

function App() {
  const [lang, setLang] = useState('zh-TW');

  return (
    <Router>
      <Routes>
        <Route element={<Layout lang={lang} setLang={setLang} />}>
          <Route path="/" element={<Home lang={lang} />} />
          <Route path="/manifesto" element={<Manifesto lang={lang} />} />
          <Route path="/relics" element={<Relics lang={lang} />} />
          <Route path="/relics/:id" element={<RelicDetail lang={lang} />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
