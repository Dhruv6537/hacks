import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Campaigns from './pages/Campaigns';
import CampaignDetail from './pages/CampaignDetail';
import CreateCampaign from './pages/CreateCampaign';
import Verification from './pages/Verification';
import Refunds from './pages/Refunds';
import './index.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/explore" element={<Campaigns />} />
          <Route path="/campaigns" element={<Campaigns />} /> {/* Legacy support */}
          <Route path="/campaign/:id" element={<CampaignDetail />} />
          <Route path="/campaigns/:id" element={<CampaignDetail />} /> {/* Legacy support */}
          <Route path="/create" element={<CreateCampaign />} />
          <Route path="/verification" element={<Verification />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/refunds" element={<Refunds />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
