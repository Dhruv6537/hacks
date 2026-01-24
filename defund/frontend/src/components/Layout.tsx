import { type ReactNode, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wallet, Menu, X } from 'lucide-react';

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
        { path: '/explore', label: 'Explore' },
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/verification', label: 'How it works' },
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
    useEffect(() => {
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
    }, []);

    const formatAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
            {/* Navigation */}
            <nav style={{
                position: 'sticky',
                top: 0,
                zIndex: 50,
                backgroundColor: 'var(--bg-primary)',
                borderBottom: '1px solid var(--border)'
            }}>
                <div style={{
                    maxWidth: '1120px',
                    margin: '0 auto',
                    padding: '0 16px',
                    height: '64px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    {/* Logo */}
                    <Link to="/" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        textDecoration: 'none',
                        color: 'var(--text-primary)',
                        fontWeight: 700,
                        fontSize: '20px'
                    }}>
                        <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                            <rect width="32" height="32" rx="8" fill="#2563EB" />
                            <path d="M10 16L14 20L22 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        DeFund
                    </Link>

                    {/* Desktop Nav */}
                    <div className="desktop-nav" style={{
                        display: 'none',
                        alignItems: 'center',
                        gap: '32px'
                    }}>
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path ||
                                (item.path === '/explore' && location.pathname.startsWith('/campaign'));
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    style={{
                                        textDecoration: 'none',
                                        color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                                        fontWeight: isActive ? 500 : 400,
                                        fontSize: '14px',
                                        transition: 'color 0.15s'
                                    }}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Right side */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {walletConnected ? (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 12px',
                                background: 'var(--bg-secondary)',
                                borderRadius: 'var(--radius)',
                                fontSize: '13px',
                                color: 'var(--text-secondary)'
                            }}>
                                <Wallet style={{ width: '16px', height: '16px' }} />
                                <span>{formatAddress(walletAddress)}</span>
                            </div>
                        ) : (
                            <button
                                onClick={connectWallet}
                                className="btn btn-ghost"
                                style={{ padding: '8px 12px', fontSize: '13px' }}
                            >
                                <Wallet style={{ width: '16px', height: '16px' }} />
                                <span>Connect</span>
                            </button>
                        )}

                        <Link to="/create" className="btn btn-primary desktop-nav" style={{ display: 'none', padding: '8px 16px', fontSize: '13px' }}>
                            Launch a campaign
                        </Link>

                        <button
                            className="mobile-menu"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            style={{
                                padding: '8px',
                                background: 'transparent',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius)',
                                cursor: 'pointer',
                                color: 'var(--text-primary)',
                                display: 'flex'
                            }}
                        >
                            {mobileMenuOpen ? <X style={{ width: '20px', height: '20px' }} /> : <Menu style={{ width: '20px', height: '20px' }} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div style={{
                        padding: '16px',
                        borderTop: '1px solid var(--border)',
                        background: 'var(--bg-primary)'
                    }}>
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    style={{
                                        display: 'block',
                                        padding: '12px 16px',
                                        borderRadius: 'var(--radius)',
                                        textDecoration: 'none',
                                        color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                                        background: isActive ? 'var(--bg-secondary)' : 'transparent',
                                        marginBottom: '4px',
                                        fontSize: '15px'
                                    }}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                        <Link
                            to="/create"
                            onClick={() => setMobileMenuOpen(false)}
                            className="btn btn-primary"
                            style={{ width: '100%', marginTop: '12px', justifyContent: 'center' }}
                        >
                            Launch a campaign
                        </Link>
                    </div>
                )}
            </nav>

            {/* Main Content */}
            <main style={{ padding: '32px 16px 80px' }}>
                <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
                    {children}
                </div>
            </main>

            {/* Footer */}
            <footer style={{
                borderTop: '1px solid var(--border)',
                padding: '32px 16px',
                backgroundColor: 'var(--bg-secondary)'
            }}>
                <div style={{
                    maxWidth: '1120px',
                    margin: '0 auto',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px'
                }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                        © 2026 DeFund. AI-verified Web3 crowdfunding.
                    </div>
                    <div style={{ display: 'flex', gap: '24px', fontSize: '14px' }}>
                        <a href="https://github.com/Namanbansal9414/hackthon" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>GitHub</a>
                        <a href="https://testnet.monadexplorer.com/address/0x11C88CdD5DcF83913cEe5d4a933d633a415E2437" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Contract</a>
                    </div>
                </div>
            </footer>

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
