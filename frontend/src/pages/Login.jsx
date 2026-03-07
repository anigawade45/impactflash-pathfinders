import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Lottie from 'lottie-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Users, Heart, ArrowRight, Mail, Lock, Info } from 'lucide-react';

const roleAnimations = {
    donor: 'https://lottie.host/730f8f5f-c099-4dc0-82e3-296e00f6126e/FikoNEIrRa.json',
    ngo: 'https://lottie.host/16474e80-dbdb-4dc7-ad09-2ec8f16bba6b/hLXft6jrEb.json',
    admin: 'https://lottie.host/f2513ce0-1cbb-4c9c-a483-f212585b4c5c/Zq6aOO7tMK.json'
};

// Fallback logic if fetch fails
const fallbackAnimations = {
    donor: 'https://assets9.lottiefiles.com/packages/lf20_96bov6it.json',
    ngo: 'https://assets2.lottiefiles.com/packages/lf20_q77idscu.json',
    admin: 'https://assets3.lottiefiles.com/packages/lf20_pkvf6jbh.json'
};

const roleStyles = {
    donor: {
        bg: 'bg-orange-50',
        text: 'text-orange-900',
        accentText: 'text-orange-600',
        accentBg: 'bg-orange-100',
        accentBorder: 'border-orange-200',
        button: 'bg-orange-600 hover:bg-orange-700 shadow-orange-500/30',
        blob: 'bg-orange-500/10'
    },
    ngo: {
        bg: 'bg-blue-50',
        text: 'text-blue-900',
        accentText: 'text-blue-600',
        accentBg: 'bg-blue-100',
        accentBorder: 'border-blue-200',
        button: 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30',
        blob: 'bg-blue-500/10'
    },
    admin: {
        bg: 'bg-slate-50',
        text: 'text-slate-900',
        accentText: 'text-slate-600',
        accentBg: 'bg-slate-100',
        accentBorder: 'border-slate-200',
        button: 'bg-slate-800 hover:bg-slate-900 shadow-slate-500/30',
        blob: 'bg-slate-500/10'
    }
};

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('donor');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [animationData, setAnimationData] = useState(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const currentStyle = roleStyles[role];

    useEffect(() => {
        setAnimationData(null);
        const fetchAnimation = async () => {
            try {
                const res = await fetch(roleAnimations[role]);
                const data = await res.json();
                setAnimationData(data);
            } catch (err) {
                // Try fallback
                fetch(fallbackAnimations[role])
                    .then(r => r.json())
                    .then(d => setAnimationData(d))
                    .catch(e => console.error("All Lottie loads failed", e));
            }
        };
        fetchAnimation();
    }, [role]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');
        try {
            const res = await login(email, password, role);
            if (res.success) {
                const userRole = res.role;
                if (userRole === 'admin') navigate('/admin');
                else if (userRole === 'donor') navigate('/explore');
                else navigate('/dashboard');
            }
        } catch (error) {
            setErrorMsg(error.message || 'Authentication failed. Please check your credentials and role.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
            <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white rounded-[3rem] shadow-2xl shadow-slate-200 overflow-hidden border border-slate-100">

                {/* Left Side: Animation & Branding */}
                <div className={`relative hidden lg:flex flex-col items-center justify-center p-12 ${currentStyle.bg} transition-colors duration-700`}>
                    <div className="relative z-10 w-full max-w-sm text-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={role}
                                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                                className="mb-12"
                            >
                                {animationData ? (
                                    <Lottie
                                        animationData={animationData}
                                        loop={true}
                                        className="w-full aspect-square"
                                    />
                                ) : (
                                    <div className="w-full aspect-square flex items-center justify-center">
                                        <div className={`w-12 h-12 border-4 ${currentStyle.accentBorder} border-t-transparent rounded-full animate-spin`} />
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        <h2 className={`text-4xl font-black ${currentStyle.text} tracking-tighter mb-4 capitalize italic`}>
                            {role} Portal
                        </h2>
                        <p className="text-slate-500 font-medium leading-relaxed">
                            {role === 'donor' && "Your contributions fuel global change. Track every rupee in real-time."}
                            {role === 'ngo' && "Manage your impact campaigns and verify project milestones with ease."}
                            {role === 'admin' && "Secure administration and protocol verification for the Zero-Trust network."}
                        </p>
                    </div>

                    {/* Decorative Blobs */}
                    <div className={`absolute top-0 left-0 w-64 h-64 ${currentStyle.blob} rounded-full blur-3xl -ml-32 -mt-32 animate-pulse`} />
                    <div className={`absolute bottom-0 right-0 w-80 h-80 ${currentStyle.blob} rounded-full blur-3xl -mr-40 -mb-40 animate-pulse`} />
                </div>

                {/* Right Side: Login Form */}
                <div className="p-10 lg:p-20 bg-white">
                    <div className="mb-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`w-12 h-12 rounded-2xl ${currentStyle.accentBg} flex items-center justify-center ${currentStyle.accentText} border ${currentStyle.accentBorder} shadow-sm transition-colors duration-500`}>
                                {role === 'donor' && <Heart className="w-6 h-6" />}
                                {role === 'ngo' && <Users className="w-6 h-6" />}
                                {role === 'admin' && <Shield className="w-6 h-6" />}
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase italic">Access Terminal</h3>
                        </div>
                        <p className="text-slate-500 font-medium">Verify your credentials to initialize session.</p>
                    </div>

                    {/* Role Toggles */}
                    <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl mb-10 border border-slate-200 shadow-sm transition-all">
                        {['donor', 'ngo', 'admin'].map(opt => (
                            <button
                                key={opt}
                                onClick={() => setRole(opt)}
                                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${role === opt ? `bg-white ${roleStyles[opt].accentText} shadow-lg border ${roleStyles[opt].accentBorder}` : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'}`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="relative group">
                            <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest ml-1">Email Identity</label>
                            <div className="relative">
                                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:${currentStyle.accentText} transition-colors`} />
                                <input
                                    required
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`w-full pl-12 pr-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100 focus:bg-white transition-all font-bold text-slate-800`}
                                    placeholder="identity@server.com"
                                />
                            </div>
                        </div>

                        <div className="relative group">
                            <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest ml-1">Secure Password</label>
                            <div className="relative">
                                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:${currentStyle.accentText} transition-colors`} />
                                <input
                                    required
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`w-full pl-12 pr-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100 focus:bg-white transition-all font-bold text-slate-800`}
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <AnimatePresence>
                            {errorMsg && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-[11px] font-black uppercase tracking-wider flex items-center gap-3 shadow-sm"
                                >
                                    <Info className="w-4 h-4" />
                                    {errorMsg}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full ${currentStyle.button} text-white py-5 rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-3`}
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    Verify & Access <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-12 pt-8 border-t border-slate-100">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest text-center mb-6">New to ImpactFlash?</p>
                        <div className="grid grid-cols-2 gap-4">
                            <Link to="/donor-onboarding" className="flex flex-col items-center justify-center py-4 rounded-2xl border border-slate-100 hover:border-orange-500/30 hover:bg-orange-50/30 transition-all group">
                                <span className="text-[10px] font-black text-slate-500 group-hover:text-orange-600 uppercase tracking-widest">Register Donor</span>
                            </Link>
                            <Link to="/onboarding" className="flex flex-col items-center justify-center py-4 rounded-2xl border border-slate-100 hover:border-blue-500/30 hover:bg-blue-50/30 transition-all group">
                                <span className="text-[10px] font-black text-slate-500 group-hover:text-blue-600 uppercase tracking-widest">Register NGO</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
