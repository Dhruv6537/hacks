import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
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
          <Route path="/" element={<Dashboard />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/campaigns/:id" element={<CampaignDetail />} />
          <Route path="/create" element={<CreateCampaign />} />
          <Route path="/verification" element={<Verification />} />
          <Route path="/refunds" element={<Refunds />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
