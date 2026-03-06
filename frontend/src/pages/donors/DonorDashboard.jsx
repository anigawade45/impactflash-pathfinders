import React, { useState, useEffect } from 'react';
import { donationApi } from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, ShieldCheck, TrendingUp, Download, PieChart, Heart, Award, ArrowRight, Activity, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function DonorDashboard() {
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, impactScore: 0 });
    const [suggestions, setSuggestions] = useState([]);
    const [affinity, setAffinity] = useState([]);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    const fetchDashboardData = async () => {
        setLoading(true);
        await Promise.all([
            fetchHistory(),
            fetchSuggestions()
        ]);
        setLoading(false);
    };

    const fetchHistory = async () => {
        try {
            const res = await donationApi.getHistory();
            if (res.success) {
                const completedDonations = res.data.filter(d => d.paymentStatus === 'completed');
                setDonations(completedDonations);

                const total = completedDonations.reduce((acc, curr) => acc + curr.totalAmount, 0);
                setStats({
                    total,
                    impactScore: Math.floor(total / 1000) * 15 + completedDonations.length * 25
                });

                calculateAffinity(completedDonations);
            }
        } catch (error) {
            console.error("Failed to fetch donation history");
        }
    };

    const fetchSuggestions = async () => {
        try {
            const res = await donationApi.getSuggestion();
            if (res.success) {
                setSuggestions(res.data || res.suggestion || []);
            }
        } catch (error) {
            console.error("Failed to fetch suggestions");
        }
    };

    const calculateAffinity = (history) => {
        // Default from profile causes
        const baseCauses = user?.causes || ['Health', 'Education'];
        const categories = {};

        // Count from history
        history.forEach(d => {
            d.items.forEach(item => {
                // If item has a category, use it, otherwise default to a known one if possible
                // For now, let's assume we might need to fetch project details or use a fixed map 
                // but let's try to infer or use base if empty
                const cat = item.category || (baseCauses[0]);
                categories[cat] = (categories[cat] || 0) + item.amount;
            });
        });

        const totalSpent = Object.values(categories).reduce((a, b) => a + b, 0);

        const dynamicAffinity = Object.entries(categories).map(([label, amount]) => ({
            label,
            percentage: totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0,
            icon: getIconForCategory(label)
        })).sort((a, b) => b.percentage - a.percentage);

        // If no donations, show 0% for profile causes
        if (dynamicAffinity.length === 0) {
            setAffinity(baseCauses.map(c => ({ label: c, percentage: 0, icon: getIconForCategory(c) })));
        } else {
            setAffinity(dynamicAffinity);
        }
    };

    const getIconForCategory = (cat) => {
        const map = {
            'Health': '🏥',
            'Education': '📚',
            'Environment': '🌍',
            'Food': '🍲',
            'Disaster': '🚨',
            'Animal': '🐾'
        };
        return map[cat] || '✨';
    };

    const getTrustTier = () => {
        if (stats.total >= 50000) return { name: 'Tier 3 / Sovereign', color: 'bg-indigo-500', progress: 100, icon: '👑' };
        if (stats.total >= 10000) return { name: 'Tier 2 / Vanguard', color: 'bg-orange-500', progress: 75, icon: '🛡️' };
        return { name: 'Tier 1 / Guardian', color: 'bg-slate-500', progress: 30, icon: '🌱' };
    };

    const tier = getTrustTier();

    const handleDownloadReceipt = async (id) => {
        try {
            const res = await donationApi.getReceipt(id);
            if (res.success) {
                alert(`Receipt Generated: ${res.data.receiptNumber}\nTotal: ₹${res.data.totalAmount}`);
            }
        } catch (error) {
            alert("Could not generate receipt at this time.");
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-32 px-4 bg-slate-50 relative overflow-hidden">
            {/* Ambient Lighting */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[100px] -mr-48 -mt-48 transition-transform duration-1000 hover:scale-110 pointer-events-none"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="flex flex-col lg:flex-row justify-between items-end gap-12 mb-20">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="max-w-2xl"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-orange-100 mb-6 shadow-xl shadow-orange-500/5">
                            <Zap className="w-3.5 h-3.5 text-orange-500" />
                            <span className="text-[10px] font-black text-orange-600 uppercase tracking-[0.3em]">Personal Intelligence Hub</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.9] mb-8">
                            Hello, <br />
                            <span className="text-gradient">{user?.name?.split(' ')[0] || 'Donor'}</span>
                        </h1>
                        <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-xl">
                            Real-time tracking of your humanitarian portfolio. Every rupee is accounted for in our zero-trust system.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-2 gap-6 w-full lg:w-auto">
                        <MetricCard
                            icon={<Wallet className="w-6 h-6" />}
                            label="Portfolio Size"
                            value={`₹${stats.total.toLocaleString()}`}
                            color="text-slate-900"
                        />
                        <MetricCard
                            icon={<Activity className="w-6 h-6" />}
                            label="Impact Velocity"
                            value={stats.impactScore}
                            color="text-orange-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Contribution Ledger */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center justify-between px-4">
                            <h2 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Contribution Ledger</h2>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secure Sync</span>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {donations.length > 0 ? donations.map((donation, idx) => (
                                <motion.div
                                    key={donation._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="modern-card p-1 group bg-white border border-slate-200 hover:border-orange-200 transition-all cursor-default"
                                >
                                    <div className="p-8 flex flex-col md:flex-row justify-between md:items-center gap-8">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-900 border border-slate-100 group-hover:bg-white group-hover:shadow-xl transition-all">
                                                <Heart className="w-8 h-8 group-hover:text-orange-500 transition-colors" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">REF: #{donation._id.substring(0, 8)}</span>
                                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-tight ${donation.paymentStatus === 'completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                                        {donation.paymentStatus}
                                                    </span>
                                                </div>
                                                <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-2">
                                                    Assisted {donation.items.length} Critical Node{donation.items.length > 1 ? 's' : ''}
                                                </h3>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(donation.createdAt).toLocaleDateString()} / SECURE RELEASE</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-row md:flex-col justify-between items-center md:items-end gap-2 md:pl-8 md:border-l md:border-slate-50">
                                            <p className="text-3xl font-black text-slate-900 tracking-tighter">₹{donation.totalAmount.toLocaleString()}</p>
                                            {donation.receiptGenerated && (
                                                <button
                                                    onClick={() => handleDownloadReceipt(donation._id)}
                                                    className="flex items-center gap-2 text-orange-600 font-black text-[10px] uppercase tracking-widest hover:underline active:scale-95 transition-all"
                                                >
                                                    <Download className="w-3.5 h-3.5" /> 80G Receipt
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-slate-50/50 px-8 py-4 flex flex-wrap gap-2 group-hover:bg-orange-50 transition-colors border-t border-slate-50">
                                        {donation.items.map((item, i) => (
                                            <span key={i} className="px-3 py-1 bg-white border border-slate-100 rounded-full text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                                                {item.title}
                                            </span>
                                        ))}
                                    </div>
                                </motion.div>
                            )) : (
                                <div className="text-center py-32 modern-card border-dashed border-2 border-slate-200">
                                    <PieChart className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                                    <h3 className="text-2xl font-black text-slate-400 uppercase tracking-tighter">No Active Assets</h3>
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Begin your humanitarian legacy today</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-10">
                        {/* Trust Tier Card */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="modern-card p-10 bg-slate-900 text-white relative overflow-hidden group border-none"
                        >
                            <div className="absolute inset-0 noise-bg opacity-10"></div>
                            <div className={`absolute top-0 right-0 w-48 h-48 ${tier.color}/20 rounded-full blur-[80px] -mr-24 -mt-24 group-hover:scale-125 transition-transform duration-1000`}></div>

                            <div className="text-4xl mb-8">{tier.icon}</div>
                            <h3 className="text-2xl font-black tracking-tight mb-4 uppercase">Trust Profile</h3>
                            <p className="text-sm text-slate-400 font-medium mb-10 leading-relaxed">
                                Your account is currently at <span className="text-white">{tier.name}</span>.
                                {stats.total < 10000 ? " Contribute ₹" + (10000 - stats.total).toLocaleString() + " more to reach Tier 2." : " 80G tax benefits are now priority processed."}
                            </p>

                            <div className="space-y-6">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-slate-400">Progress to Next Tier</span>
                                    <span className="text-orange-500">{tier.progress}% Complete</span>
                                </div>
                                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden p-0.5 border border-white/5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${tier.progress}%` }}
                                        transition={{ duration: 1.5, delay: 0.5 }}
                                        className={`${tier.color} h-full rounded-full shadow-[0_0_20px_rgba(249,115,22,0.4)]`}
                                    ></motion.div>
                                </div>
                            </div>
                        </motion.div>

                        {/* AI Recommendations */}
                        {suggestions.length > 0 && (
                            <div className="modern-card p-10 bg-white border border-slate-200">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="p-3 bg-orange-50 rounded-2xl">
                                        <Zap className="w-6 h-6 text-orange-500" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">AI MATCHES</h3>
                                </div>
                                <div className="space-y-4">
                                    {suggestions.map((item, i) => (
                                        <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-orange-200 transition-all cursor-pointer group" onClick={() => navigate(`/projects/${item.targetId}`)}>
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[8px] font-black px-2 py-0.5 bg-white rounded border border-slate-200 text-slate-400 uppercase tracking-widest">Recommended</span>
                                                <span className="text-[10px] font-black text-orange-600">{item.percentage}% Fit</span>
                                            </div>
                                            <h4 className="text-sm font-black text-slate-800 leading-tight mb-1 group-hover:text-orange-600 transition-colors">{item.title}</h4>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">by {item.ngoName}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Cause Affinity */}
                        <div className="modern-card p-10 bg-white border border-slate-100">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="p-3 bg-slate-50 rounded-2xl">
                                    <TrendingUp className="w-6 h-6 text-slate-900" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Cause Affinity</h3>
                            </div>

                            <div className="space-y-8">
                                {affinity.map((item, i) => (
                                    <AffinityBar key={i} icon={item.icon} label={item.label} percentage={item.percentage} color={i === 0 ? "bg-orange-500" : "bg-slate-900"} />
                                ))}
                                {affinity.length === 0 && (
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center py-4">No data mapped yet</p>
                                )}
                            </div>

                            <button
                                onClick={() => window.location.href = '/explore'}
                                className="w-full mt-10 py-5 rounded-3xl bg-slate-50 text-slate-900 text-xs font-black uppercase tracking-widest hover:bg-slate-100 active:scale-95 transition-all text-center flex items-center justify-center gap-3"
                            >
                                Distribute More <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ icon, label, value, color }) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="modern-card p-8 bg-white border border-slate-100 min-w-[220px] group"
        >
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mb-6 group-hover:text-orange-500 group-hover:bg-orange-50 transition-all duration-500">
                {icon}
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <p className={`text-4xl font-black ${color} tracking-tighter`}>{value}</p>
        </motion.div>
    );
}

function AffinityBar({ icon, label, percentage, color }) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-xl">{icon}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
                </div>
                <span className="text-xs font-black text-slate-900">{percentage}%</span>
            </div>
            <div className="w-full bg-slate-50 h-1.5 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${percentage}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className={`${color} h-full rounded-full`}
                ></motion.div>
            </div>
        </div>
    );
}
