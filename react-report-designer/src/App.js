import React from 'react';

import { BrowserRouter as Router, Routes, Route, useMatch } from 'react-router-dom';

import MainPage from './pages/MainPage';
import ReportPage from './pages/ReportPage';

import 'devexpress-reporting/dx-reportdesigner';
import './App.css';

function App() {
    return (
        <Router>
            <Routes>
                <Route path='/' element={<MainPage />} />
                <Route path='/report' element={<ReportPage />} />
            </Routes>
        </Router>
    );
}

export default App;
