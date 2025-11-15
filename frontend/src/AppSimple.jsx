import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HeaderSimple from './components/HeaderSimple';
import HomePageSimple from './pages/HomePageSimple';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black text-green-400">
        <HeaderSimple />
        <main>
          <Routes>
            <Route path="/" element={<HomePageSimple />} />
            <Route path="/products" element={
              <div className="pt-16 p-8 text-center">
                <h1 className="text-4xl font-bold mb-4">Products</h1>
                <p className="text-gray-400">Coming soon...</p>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;