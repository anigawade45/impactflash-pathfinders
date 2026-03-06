import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <nav className="fixed top-0 w-full z-50 px-8 py-4 flex justify-between items-center bg-white border-b border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 cursor-pointer">
                <Link to="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-orange-500 to-amber-500 shadow-lg shadow-orange-500/20 flex items-center justify-center">
                        <span className="text-white font-bold text-xl leading-none">⚡</span>
                    </div>
                    <span className="text-xl font-bold tracking-tight text-slate-800">
                        Impact<span className="text-orange-500">Flash</span>
                    </span>
                </Link>
            </div>

            <div className="hidden md:flex gap-8 text-sm font-medium text-slate-500">
                <Link to="/" className="hover:text-orange-600 transition-colors">Home</Link>
                <Link to="/ledger" className="hover:text-orange-600 transition-colors font-bold text-slate-700">📜 Ledger</Link>
                <Link to="/impact-stories" className="hover:text-orange-600 transition-colors font-bold text-slate-700">🌟 Stories</Link>
                {user?.role === 'admin' ? (
                    <Link to="/admin" className="hover:text-orange-600 transition-colors font-bold text-slate-700 underline decoration-orange-300">Internal Review</Link>
                ) : user?.role === 'ngo' ? (
                    <>
                        <Link to="/dashboard" className="hover:text-orange-600 transition-colors">My Submissions</Link>
                        <Link to="#" className="hover:text-orange-600 transition-colors">Guidelines</Link>
                    </>
                ) : user?.role === 'donor' ? (
                    <>
                        <Link to="/explore" className="hover:text-orange-600 transition-colors font-bold text-slate-700 underline decoration-orange-300">✨ Explore Impact</Link>
                        <Link to="/donor-dashboard" className="hover:text-orange-600 transition-colors font-bold text-slate-700">📊 My Impact</Link>
                    </>
                ) : (
                    <>
                        <Link to="/explore" className="hover:text-orange-600 transition-colors">Needs</Link>
                        <Link to="/explore" className="hover:text-orange-600 transition-colors">Campaigns</Link>
                    </>
                )}
            </div>

            <div className="flex gap-3">
                {!user ? (
                    <>
                        <Link
                            to="/donor-onboarding"
                            className="px-4 py-2 rounded-full border border-orange-200 text-orange-600 font-semibold text-sm hover:bg-orange-50 transition-all">
                            Donate Now
                        </Link>
                        <Link
                            to="/login"
                            className="px-6 py-2.5 rounded-full bg-slate-900 text-white font-semibold text-sm hover:shadow-[0_8px_20px_rgba(0,0,0,0.1)] transition-all transform hover:-translate-y-0.5">
                            Login
                        </Link>
                    </>
                ) : (
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter leading-none">{user.role}</p>
                            <p className="text-sm font-bold text-slate-700 max-w-[120px] truncate">{user.name || user.email}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="px-5 py-2.5 rounded-full border border-red-200 text-red-600 font-semibold text-sm hover:bg-red-50 transition-all">
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}
