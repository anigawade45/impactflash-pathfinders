import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('donor'); // 'donor', 'ngo', or 'admin'
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');
        try {
            const res = await login(email, password, role);
            if (res.success) {
                const userRole = res.data.role;
                if (userRole === 'admin') {
                    navigate('/admin');
                } else if (userRole === 'donor') {
                    navigate('/explore');
                } else {
                    navigate('/dashboard'); // NGO Dashboard
                }
            }
        } catch (error) {
            setErrorMsg(error.message || 'Authentication failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 p-8 modern-card animate-fade-in mb-32">
            <div className="mb-8 text-center">
                <h2 className="text-3xl font-black text-slate-800 mb-2">Platform Secure Login</h2>
                <p className="text-slate-500 font-medium">Enter your credentials to manage your humanitarian impact.</p>
            </div>

            <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl mb-8 modern-card-inset">
                {['donor', 'ngo', 'admin'].map(opt => (
                    <button
                        key={opt}
                        onClick={() => setRole(opt)}
                        className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${role === opt ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        {opt}
                    </button>
                ))}
            </div>

            {errorMsg && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold flex items-center gap-3 shadow-sm shadow-red-100/50">
                    <span className="text-xl">⚠️</span>
                    {errorMsg}
                </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
                <div>
                    <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest">Email Identity</label>
                    <input
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:outline-none focus:ring-4 focus:ring-orange-100 focus:bg-white transition-all font-bold text-slate-800"
                        placeholder="identity@server.com"
                    />
                </div>

                <div>
                    <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest">Secure Password</label>
                    <input
                        required
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:outline-none focus:ring-4 focus:ring-orange-100 focus:bg-white transition-all font-bold text-slate-800"
                        placeholder="••••••••"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary py-4 text-sm font-bold uppercase tracking-widest shadow-xl shadow-orange-500/20 active:scale-95 transition-all"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-[3px] border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                    ) : `Login as ${role}`}
                </button>
            </form>

            <div className="mt-12 pt-8 border-t border-slate-100 text-center">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-6">First time joining?</p>
                <div className="grid grid-cols-2 gap-4">
                    <Link to="/donor-onboarding" className="text-[10px] font-black uppercase text-slate-500 hover:text-orange-600 transition-all border border-slate-100 py-3 rounded-xl hover:bg-slate-50">Register Donor</Link>
                    <Link to="/onboarding" className="text-[10px] font-black uppercase text-slate-500 hover:text-orange-600 transition-all border border-slate-100 py-3 rounded-xl hover:bg-slate-50">Register NGO</Link>
                </div>
            </div>
        </div>
    );
}
