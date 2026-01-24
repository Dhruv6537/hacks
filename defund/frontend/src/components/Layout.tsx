import { type ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    FolderOpen,
    PlusCircle,
    Shield,
    Wallet,
    Menu,
    X,
    Zap
} from 'lucide-react';

interface LayoutProps {
    children: ReactNode;
}

declare global {
    interface Window {
        ethereum?: any;
    }
}

export default function Layout({ children }: LayoutProps) {
    const location = useLocation();
    const [walletConnected, setWalletConnected] = useState(false);
    const [walletAddress, setWalletAddress] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navItems = [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/campaigns', label: 'Campaigns', icon: FolderOpen },
        { path: '/create', label: 'Create', icon: PlusCircle },
        { path: '/verification', label: 'Verification', icon: Shield },
    ];

    const connectWallet = async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts',
                });
                setWalletAddress(accounts[0]);
                setWalletConnected(true);

                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: '0x279F',
                            chainName: 'Monad Testnet',
                            nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
                            rpcUrls: ['https://testnet-rpc.monad.xyz'],
                            blockExplorerUrls: ['https://testnet.monadexplorer.com'],
                        }],
                    });
                } catch {
                    console.log('Network might already be added');
                }
            } catch (error) {
                console.error('Failed to connect wallet:', error);
            }
        } else {
            alert('Please install MetaMask to use this app!');
        }
    };

    // Auto-connect on mount
    useState(() => {
        const checkConnection = async () => {
            if (typeof window.ethereum !== 'undefined') {
                try {
                    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                    if (accounts.length > 0) {
                        setWalletAddress(accounts[0]);
                        setWalletConnected(true);
                    }
                } catch (err) {
                    console.error("Auto-connect failed", err);
                }
            }
        };
        checkConnection();
    });

    const formatAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0B0F0C' }}>
            {/* Top Navigation */}
            <nav style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 50,
                padding: '16px 24px'
            }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    <div className="glass-card" style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px 28px'
                    }}>
                        {/* Logo */}
                        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                            <div style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '14px',
                                background: 'linear-gradient(135deg, #B6F35C 0%, #4ADE80 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Zap style={{ width: '24px', height: '24px', color: '#0B0F0C' }} />
                            </div>
                            <span style={{ fontSize: '22px', fontWeight: 700, color: 'white' }}>DeFund</span>
                        </Link>

                        {/* Desktop Nav */}
                        <div className="desktop-nav" style={{ display: 'none' }}>
                            <div className="glass" style={{ borderRadius: '9999px', padding: '6px', display: 'flex' }}>
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = location.pathname === item.path;
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                padding: '10px 20px',
                                                borderRadius: '9999px',
                                                textDecoration: 'none',
                                                transition: 'all 0.2s',
                                                background: isActive ? '#B6F35C' : 'transparent',
                                                color: isActive ? '#0B0F0C' : '#9CA3AF',
                                                fontWeight: isActive ? 600 : 400,
                                                fontSize: '14px'
                                            }}
                                        >
                                            <Icon style={{ width: '18px', height: '18px' }} />
                                            <span>{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Wallet & Mobile Menu */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div className="glass desktop-nav" style={{
                                display: 'none',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 16px',
                                borderRadius: '9999px',
                                fontSize: '12px',
                                color: '#B6F35C'
                            }}>
                                <div style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    backgroundColor: '#B6F35C'
                                }}></div>
                                Live Testnet
                            </div>

                            {walletConnected ? (
                                <div className="btn-neon" style={{ padding: '10px 20px', fontSize: '14px' }}>
                                    <Wallet style={{ width: '18px', height: '18px' }} />
                                    <span>{formatAddress(walletAddress)}</span>
                                </div>
                            ) : (
                                <button onClick={connectWallet} className="btn-neon" style={{ padding: '10px 20px', fontSize: '14px' }}>
                                    <Wallet style={{ width: '18px', height: '18px' }} />
                                    <span>Connect</span>
                                </button>
                            )}

                            <button
                                className="glass mobile-menu"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                style={{
                                    padding: '10px',
                                    borderRadius: '12px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'white',
                                    display: 'flex'
                                }}
                            >
                                {mobileMenuOpen ? <X style={{ width: '24px', height: '24px' }} /> : <Menu style={{ width: '24px', height: '24px' }} />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div className="glass-card" style={{ marginTop: '12px', padding: '16px' }}>
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setMobileMenuOpen(false)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '14px',
                                            padding: '14px 16px',
                                            borderRadius: '12px',
                                            textDecoration: 'none',
                                            color: isActive ? '#B6F35C' : '#9CA3AF',
                                            background: isActive ? 'rgba(182,243,92,0.1)' : 'transparent',
                                            marginBottom: '4px'
                                        }}
                                    >
                                        <Icon style={{ width: '20px', height: '20px' }} />
                                        <span style={{ fontSize: '16px' }}>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </nav>

            {/* Main Content */}
            <main style={{ paddingTop: '120px', paddingBottom: '80px', paddingLeft: '32px', paddingRight: '32px' }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    {children}
                </div>
            </main>

            <style>{`
                @media (min-width: 768px) {
                    .desktop-nav {
                        display: flex !important;
                    }
                    .mobile-menu {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
}
