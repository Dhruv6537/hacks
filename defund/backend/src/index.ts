import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import verifyRoutes from './routes/verify';
import campaignRoutes from './routes/campaigns';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/verify', verifyRoutes);
app.use('/api/campaigns', campaignRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'DeFund Backend',
        timestamp: new Date().toISOString()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'DeFund API',
        version: '1.0.0',
        description: 'AI-Verified Crowdfunding Backend on Monad',
        endpoints: {
            health: '/health',
            verify: '/api/verify/milestone',
            campaigns: '/api/campaigns'
        }
    });
});

// Initialize database then start server
import { initDatabase } from './database';

initDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 DeFund Backend running on port ${PORT}`);
        console.log(`📍 Health check: http://localhost:${PORT}/health`);
    });
});

export default app;
