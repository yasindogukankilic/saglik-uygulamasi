import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import QuizEntryScreen from './screens/QuizEntryScreen';
import QuizScreen      from './screens/QuizScreen';

export default function App() {
  return (
    <Routes>
      <Route path="/join/:sessionId" element={<QuizEntryScreen />} />
      <Route path="/quiz/:sessionId" element={<QuizScreen />} />
      {/* kök → basit yönlendirme (opsiyonel landing) */}
      <Route path="*" element={<Navigate to="/join/demo" />} />
    </Routes>
  );
}
