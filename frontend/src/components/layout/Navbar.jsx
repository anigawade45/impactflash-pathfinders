import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity,
    LayoutGrid,
    TrendingUp,
    ShieldCheck,
    User,
    LogOut,
    Zap,
    ChevronDown,
    Home as HomeIcon,
    Flame
} from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const navLinks = {
        guest: [
            { name: 'Discover', path: '/explore', icon: <LayoutGrid className="w-4 h-4" /> },
            { name: 'Impact Feed', path: '/impact-stories', icon: <Activity className="w-4 h-4" /> },
            { name: 'Transparency', path: '/ledger', icon: <ShieldCheck className="w-4 h-4" /> },
        ],
        donor: [
            { name: 'Explore', path: '/explore', icon: <LayoutGrid className="w-4 h-4" /> },
            { name: 'My Impact', path: '/donor-dashboard', icon: <TrendingUp className="w-4 h-4" /> },
            { name: 'Transparency', path: '/ledger', icon: <ShieldCheck className="w-4 h-4" /> },
        ],
        ngo: [
            { name: 'Dashboard', path: '/dashboard', icon: <LayoutGrid className="w-4 h-4" /> },
            { name: 'Impact Stories', path: '/impact-stories', icon: <Activity className="w-4 h-4" /> },
            { name: 'Transparency', path: '/ledger', icon: <ShieldCheck className="w-4 h-4" /> },
        ],
        admin: [
            { name: 'Admin Hub', path: '/admin', icon: <ShieldCheck className="w-4 h-4" /> },
            { name: 'Live Ledger', path: '/ledger', icon: <TrendingUp className="w-4 h-4" /> },
        ]
    };

    const currentLinks = user ? navLinks[user.role] : navLinks.guest;

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'py-4' : 'py-6'}`}>
            <div className="max-w-7xl mx-auto px-6">
                <nav className={`relative flex items-center justify-between px-8 py-3 rounded-4xl transition-all duration-500 backdrop-blur-2xl border ${scrolled ? 'bg-white/80 border-slate-200/50 shadow-2xl shadow-slate-200/50' : 'bg-white/40 border-white/40 shadow-sm'}`}>

                    {/* Logo Section */}
                    <Link to="/" className="flex items-center gap-3 group relative overflow-hidden">
                        <motion.div
                            whileHover={{ rotate: 12, scale: 1.1 }}
                            className="w-10 h-10 rounded-2xl bg-linear-to-tr from-orange-500 to-amber-400 flex items-center justify-center shadow-lg shadow-orange-500/20"
                        >
                            <Zap className="w-6 h-6 text-white fill-white" />
                        </motion.div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black tracking-tighter text-slate-900 leading-none">
                                Impact<span className="text-orange-500">Flash</span>
                            </span>
                            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400 mt-1">Zero-Trust Protocol</span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-2">
                        {currentLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`relative px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all overflow-hidden group ${location.pathname === link.path ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
                            >
                                <div className="relative z-10 flex items-center gap-2">
                                    {link.icon}
                                    {link.name}
                                </div>
                                {location.pathname === link.path && (
                                    <motion.div
                                        layoutId="nav-bg"
                                        className="absolute inset-0 bg-slate-100 rounded-2xl z-0"
                                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <div className="absolute inset-0 bg-orange-50 scale-x-0 group-hover:scale-x-100 transition-transform origin-left -z-10" />
                            </Link>
                        ))}
                    </div>

                    {/* CTA Section */}
                    <div className="flex items-center gap-4">
                        {!user ? (
                            <div className="flex items-center gap-3">
                                <Link
                                    to="/login"
                                    className="hidden sm:block text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-800 px-4 transition-all"
                                >
                                    Log In
                                </Link>
                                <Link
                                    to="/donor-onboarding"
                                    className="px-6 py-3 rounded-2xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest hover:bg-orange-600 hover:shadow-2xl hover:shadow-orange-500/30 transition-all active:scale-95 flex items-center gap-2"
                                >
                                    <Flame className="w-4 h-4 text-orange-400" /> Start Giving
                                </Link>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4 pl-4 border-l border-slate-200">
                                <div className="hidden sm:flex flex-col items-end">
                                    <span className="text-[8px] font-black text-orange-500 uppercase tracking-widest">Active {user.role}</span>
                                    <span className="text-sm font-black text-slate-900 truncate max-w-[120px]">{user.name || 'Personal Account'}</span>
                                </div>
                                <div className="relative group">
                                    <button
                                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                                        className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center hover:bg-slate-100 transition-all text-slate-600"
                                    >
                                        <User className="w-5 h-5" />
                                    </button>

                                    <AnimatePresence>
                                        {isMenuOpen && (
                                            <>
                                                <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)} />
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    className="absolute right-0 mt-4 w-60 bg-white rounded-3xl border border-slate-200 shadow-2xl p-3 z-20 overflow-hidden"
                                                >
                                                    <div className="p-4 bg-slate-50 rounded-2xl mb-2">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Verification Signature</p>
                                                        <p className="text-xs font-black text-slate-800 truncate">ID: {user._id.substring(0, 16)}...</p>
                                                    </div>

                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full flex items-center gap-3 p-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all text-[11px] font-black uppercase tracking-widest"
                                                    >
                                                        <LogOut className="w-4 h-4" />
                                                        Sign Out Node
                                                    </button>
                                                </motion.div>
                                            </>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    );
}
