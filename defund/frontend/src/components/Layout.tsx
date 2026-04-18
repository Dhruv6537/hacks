import { type ReactNode, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wallet, Menu, X, Sun, Moon } from 'lucide-react';

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
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('defund-theme');
            if (stored === 'dark' || stored === 'light') return stored;
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'light';
    });

    const navItems = [
        { path: '/explore', label: 'Explore' },
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/verification', label: 'How it works' },
    ];

    // Apply theme to document
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('defund-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

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
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', transition: 'background-color 0.35s' }}>
            {/* Navigation */}
            <nav className="navbar-glass" style={{
                position: 'sticky',
                top: 0,
                zIndex: 50,
            }}>
                <div style={{
                    maxWidth: '1160px',
                    margin: '0 auto',
                    padding: '0 20px',
                    height: '64px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    {/* Logo */}
                    <Link to="/" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        textDecoration: 'none',
                        color: 'var(--text-primary)',
                        fontWeight: 800,
                        fontSize: '20px',
                        letterSpacing: '-0.02em'
                    }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '10px',
                            background: 'var(--gradient-accent)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 8px var(--accent-glow)'
                        }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M8 14L12 18L20 10" />
                            </svg>
                        </div>
                        DeFund
                    </Link>

                    {/* Desktop Nav */}
                    <div className="desktop-nav" style={{
                        display: 'none',
                        alignItems: 'center',
                        gap: '8px'
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
                                        color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                                        fontWeight: isActive ? 600 : 500,
                                        fontSize: '14px',
                                        padding: '8px 16px',
                                        borderRadius: 'var(--radius)',
                                        background: isActive ? 'var(--accent-light)' : 'transparent',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Right side */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="theme-toggle"
                            aria-label="Toggle theme"
                        >
                            {theme === 'light' ? (
                                <Moon style={{ width: '16px', height: '16px' }} />
                            ) : (
                                <Sun style={{ width: '16px', height: '16px' }} />
                            )}
                        </button>

                        {walletConnected ? (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 14px',
                                background: 'var(--accent-light)',
                                borderRadius: 'var(--radius)',
                                fontSize: '13px',
                                color: 'var(--accent)',
                                fontWeight: 600,
                                border: '1px solid transparent'
                            }}>
                                <div style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: 'var(--success)',
                                    boxShadow: '0 0 8px var(--success-glow)'
                                }} />
                                <span>{formatAddress(walletAddress)}</span>
                            </div>
                        ) : (
                            <button
                                onClick={connectWallet}
                                className="btn btn-ghost"
                                style={{ padding: '8px 14px', fontSize: '13px' }}
                            >
                                <Wallet style={{ width: '16px', height: '16px' }} />
                                <span>Connect</span>
                            </button>
                        )}

                        <Link to="/create" className="btn btn-primary desktop-nav" style={{ display: 'none', padding: '8px 18px', fontSize: '13px' }}>
                            Launch campaign
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
                        padding: '16px 20px',
                        borderTop: '1px solid var(--border)',
                        background: 'var(--bg-primary)',
                        animation: 'fadeIn 0.2s ease'
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
                                        color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                                        background: isActive ? 'var(--accent-light)' : 'transparent',
                                        marginBottom: '4px',
                                        fontSize: '15px',
                                        fontWeight: isActive ? 600 : 500,
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
                            Launch campaign
                        </Link>
                    </div>
                )}
            </nav>

            {/* Main Content */}
            <main style={{ padding: '32px 20px 80px' }}>
                <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
                    {children}
                </div>
            </main>

            {/* Footer */}
            <footer style={{
                borderTop: '1px solid var(--border)',
                padding: '40px 20px',
                backgroundColor: 'var(--bg-secondary)',
                transition: 'background-color 0.35s'
            }}>
                <div style={{
                    maxWidth: '1160px',
                    margin: '0 auto',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '7px',
                            background: 'var(--gradient-accent)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M8 14L12 18L20 10" />
                            </svg>
                        </div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                            © 2026 DeFund · AI-verified crowdfunding
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: '24px', fontSize: '14px' }}>
                        <a href="https://github.com/Namanbansal9414/hackthon" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}>GitHub</a>
                        <a href="https://testnet.monadexplorer.com/address/0x11C88CdD5DcF83913cEe5d4a933d633a415E2437" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}>Contract</a>
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
