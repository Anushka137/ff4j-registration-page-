import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import FeatureFlagPage from './pages/featureFlagPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/feature-flags" element={<FeatureFlagPage />} />
        {/* You can add more routes here for other pages */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
