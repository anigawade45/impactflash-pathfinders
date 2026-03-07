import React, { useState, useEffect } from 'react';
import { donationApi, impactApi } from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, ShieldCheck, TrendingUp, Download, PieChart, Heart, Award, ArrowRight, Activity, Zap, Lock, Unlock, Eye, CheckCircle2, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function DonorDashboard() {
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, impactScore: 0 });
    const [suggestions, setSuggestions] = useState([]);
    const [affinity, setAffinity] = useState([]);
    const [impactStories, setImpactStories] = useState([]);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('success') === 'true' && urlParams.get('session_id')) {
                handleVerifyStripe(urlParams.get('session_id'));
            }
            fetchDashboardData();
        }
    }, [user]);

    const handleVerifyStripe = async (sessionId) => {
        try {
            const res = await donationApi.verify({ session_id: sessionId });
            if (res.success) {
                // Clear URL params
                window.history.replaceState({}, document.title, window.location.pathname);
                // alert("Donation successful! Your Impact Receipt is ready.");
                fetchDashboardData();
            }
        } catch (error) {
            console.error("Stripe verification failed");
        }
    };

    const fetchDashboardData = async () => {
        setLoading(true);
        await Promise.all([
            fetchHistory(),
            fetchSuggestions(),
            fetchImpactStories()
        ]);
        setLoading(false);
    };

    const fetchImpactStories = async () => {
        try {
            const res = await impactApi.getMyStories();
            if (res.success) setImpactStories(res.data);
        } catch (error) {
            console.error("Failed to fetch impact stories");
        }
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
            const response = await donationApi.getReceipt(id);
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Impact_Receipt_${id.substring(0, 8)}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download Error:", error);
            alert("Could not generate receipt at this time. Our AI is updating the audit records.");
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-32 px-6 bg-slate-50 relative overflow-hidden">
            {/* Ambient Lighting */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-orange-500/5 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[100px] -ml-48 -mb-48 pointer-events-none"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12 mb-16">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 mb-6 shadow-2xl">
                            <Zap className="w-3.5 h-3.5 text-orange-400" />
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">Personal Intelligence Hub</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none mb-4 uppercase italic">
                            Humanitarian <br />Portfolio
                        </h1>
                        <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-lg">
                            Track your capital allocation across critical impact nodes in real-time.
                        </p>
                    </motion.div>

                    <div className="flex flex-wrap gap-4 w-full lg:w-auto">
                        <MetricCard
                            icon={<Wallet className="w-5 h-5" />}
                            label="Portfolio"
                            value={`₹${stats.total.toLocaleString()}`}
                            color="text-slate-900"
                        />
                        <MetricCard
                            icon={<Activity className="w-5 h-5" />}
                            label="Impact Score"
                            value={stats.impactScore}
                            color="text-indigo-500"
                        />
                        <div className="modern-card p-6 bg-slate-900 text-white flex flex-col justify-between min-w-[200px] border-none shadow-2xl">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Active Streak</p>
                            <div className="flex items-center gap-3">
                                <Zap className="w-6 h-6 text-orange-400" />
                                <span className="text-3xl font-black tracking-tighter">{user?.streak || 1} Months</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Main Content Area (8 Columns) */}
                    <div className="lg:col-span-8 space-y-16">

                        {/* Alerts Area */}
                        {(user?.notifications && user.notifications.filter(n => !n.read).length > 0) || (user?.lastDonationDate && (new Date().getMonth() !== new Date(user.lastDonationDate).getMonth())) ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 px-4">
                                    <Activity className="w-4 h-4 text-orange-500" />
                                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Active Alerts</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {user?.lastDonationDate && (new Date().getMonth() !== new Date(user.lastDonationDate).getMonth()) && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-6 bg-red-50 border border-red-100 rounded-[2rem] flex items-center gap-6"
                                        >
                                            <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20">
                                                <Zap className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-black text-red-700 uppercase tracking-tight">Streak at Risk!</h4>
                                                <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mt-1">Maintenance required this month.</p>
                                            </div>
                                        </motion.div>
                                    )}
                                    {user?.notifications?.filter(n => !n.read).slice(0, 1).map((notif, idx) => (
                                        <motion.div
                                            key={idx}
                                            className="p-6 bg-indigo-50 border border-indigo-100 rounded-[2rem] flex items-center gap-6 cursor-pointer group"
                                            onClick={() => navigate(notif.link)}
                                        >
                                            <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                                <Activity className="w-6 h-6 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-xs font-black text-indigo-700 uppercase tracking-tight">Node Update</h4>
                                                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-1 line-clamp-1">{notif.message}</p>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-2 transition-transform" />
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        ) : null}

                        {/* Impact Evidence Section */}
                        <section>
                            <div className="flex items-center justify-between mb-8 px-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
                                        <Eye className="w-5 h-5 text-orange-500" />
                                    </div>
                                    <h2 className="text-3xl font-black tracking-tighter text-slate-900 uppercase italic">Impact Evidence</h2>
                                </div>
                                <Link to="/impact-stories" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-orange-500 transition-colors">View All Stories</Link>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {impactStories.length > 0 ? impactStories.slice(0, 4).map((story, idx) => (
                                    <Link to={`/impact/${story._id}`} key={story._id} className="group">
                                        <div className="premium-gradient-card h-full flex flex-col">
                                            <div className="aspect-video relative overflow-hidden rounded-t-[2.4rem]">
                                                <img src={story.photos?.[0]} alt={story.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                                <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>
                                                <div className="absolute top-6 right-6 flex flex-col items-end gap-2">
                                                    {story.supportedByUser && (
                                                        <div className="px-4 py-2 bg-orange-500 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest shadow-lg shadow-orange-500/30 flex items-center gap-2">
                                                            <Heart className="w-3.5 h-3.5 fill-white" /> Your Impact
                                                        </div>
                                                    )}
                                                    <div className="px-4 py-2 bg-white/10 backdrop-blur-xl rounded-2xl text-[10px] font-black text-white uppercase tracking-widest border border-white/20 flex items-center gap-2">
                                                        <ShieldCheck className="w-4 h-4 text-green-400" /> AI: {story.aiValidation?.score}%
                                                    </div>
                                                </div>
                                                <div className="absolute bottom-6 left-6 right-6">
                                                    <h4 className="text-xl font-black text-white leading-tight uppercase tracking-tight">{story.title}</h4>
                                                </div>
                                            </div>
                                            <div className="p-8 bg-white flex-1">
                                                <div className="flex items-center justify-between mb-6">
                                                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg">
                                                        <MapPin className="w-3 h-3 text-slate-400" />
                                                        <span className="text-[9px] font-black text-slate-500 uppercase">{story.ngoId?.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                                                        <span className="text-[10px] font-black text-slate-900 uppercase">{story.beneficiaryCount} Beneficiaries</span>
                                                    </div>
                                                </div>
                                                <p className="text-[13px] text-slate-500 font-medium leading-relaxed italic line-clamp-2">"{story.summary}"</p>
                                            </div>
                                        </div>
                                    </Link>
                                )) : (
                                    <div className="col-span-full py-20 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center bg-white/50">
                                        <PieChart className="w-12 h-12 text-slate-200 mb-4" />
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pending AI outcome generation...</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Contribution Ledger Section */}
                        <section>
                            <div className="flex items-center justify-between mb-8 px-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
                                        <TrendingUp className="w-5 h-5 text-indigo-500" />
                                    </div>
                                    <h2 className="text-3xl font-black tracking-tighter text-slate-900 uppercase italic">Active Nodes</h2>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ledger-sync-active</span>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {donations.length > 0 ? donations.map((donation, idx) => (
                                    <motion.div
                                        key={donation._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="modern-card p-1 group bg-white border border-slate-200 hover:border-orange-200 transition-all duration-500"
                                    >
                                        <div className="p-8 flex flex-col md:flex-row justify-between gap-10">
                                            <div className="flex items-center gap-8">
                                                <div className="w-20 h-20 rounded-[2rem] bg-slate-50 flex items-center justify-center text-slate-900 border border-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-all duration-700 shadow-inner">
                                                    <Heart className="w-10 h-10" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TXN: #{donation._id.substring(16)}</span>
                                                        <span className="text-[10px] font-black px-3 py-1 bg-green-50 text-green-600 rounded-full uppercase italic">Verified</span>
                                                    </div>
                                                    <h3 className="text-3xl font-black text-slate-800 tracking-tighter leading-none mb-3">
                                                        Assisted {donation.items.length} Outcome Node{donation.items.length > 1 ? 's' : ''}
                                                    </h3>
                                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{new Date(donation.createdAt).toLocaleDateString()} · ESCROW DEPLOYED</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-row md:flex-col justify-between items-center md:items-end gap-4 min-w-[150px]">
                                                <p className="text-4xl font-black text-slate-900 tracking-tighter">₹{donation.totalAmount.toLocaleString()}</p>
                                                {donation.receiptGenerated && (
                                                    <button
                                                        onClick={() => handleDownloadReceipt(donation._id)}
                                                        className="px-6 py-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3 text-slate-600 font-black text-[9px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all active:scale-95"
                                                    >
                                                        <Download className="w-4 h-4" /> Receipt
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-slate-50/50 px-8 py-8 border-t border-slate-50 rounded-b-3xl">
                                            <div className="grid grid-cols-1 gap-8">
                                                {donation.items.map((item, i) => (
                                                    <div key={i} className="space-y-6">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-2 h-2 rounded-full bg-orange-500 group-hover:animate-ping"></div>
                                                                <span className="text-sm font-black text-slate-700 uppercase tracking-tight">{item.title}</span>
                                                                <span className="text-[10px] font-bold text-slate-400">/ via {item.ngoId.name}</span>
                                                            </div>
                                                            <button
                                                                onClick={() => navigate(`/project/${(item.targetType || 'need').toLowerCase()}/${item.targetId}`)}
                                                                className="px-4 py-1.5 bg-white border border-slate-200 rounded-xl flex items-center gap-2 shadow-sm hover:border-orange-500/30 transition-all group/escrow"
                                                            >
                                                                <Eye className="w-3.5 h-3.5 text-orange-500 group-hover/escrow:scale-110 transition-transform" />
                                                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Inspect Node</span>
                                                            </button>
                                                        </div>

                                                        {/* Advanced Escrow Visualizer */}
                                                        <div className="grid grid-cols-3 gap-6">
                                                            {[
                                                                { level: 1, label: 'Capitalization', ratio: '40%', desc: 'Start Proof' },
                                                                { level: 2, label: 'Optimization', ratio: '40%', desc: 'Mid-Point' },
                                                                { level: 3, label: 'Fulfillment', ratio: '20%', desc: 'Completion' }
                                                            ].map((stage) => {
                                                                const milestone = item.targetDetails?.milestones?.find(m => m.level === stage.level);
                                                                const isReleased = milestone?.status === 'verified';
                                                                const isSubmitted = milestone?.status === 'submitted';

                                                                return (
                                                                    <div key={stage.level} className="space-y-3">
                                                                        <div className="flex justify-between items-end">
                                                                            <span className={`text-[9px] font-black uppercase tracking-widest ${isReleased ? 'text-green-600' : 'text-slate-400'}`}>{stage.label}</span>
                                                                            <span className="text-[8px] font-bold text-slate-300">{stage.ratio}</span>
                                                                        </div>
                                                                        <div className={`h-2 rounded-full transition-all duration-1000 ${isReleased ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]' : isSubmitted ? 'bg-orange-400 animate-pulse' : 'bg-slate-200'}`}></div>
                                                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter leading-none italic">{stage.desc}</p>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )) : (
                                    <div className="text-center py-32 modern-card border-dashed border-2 border-slate-200 bg-white/50 rounded-[3rem]">
                                        <TrendingUp className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                                        <h3 className="text-2xl font-black text-slate-400 uppercase tracking-tighter italic">Ledger Empty</h3>
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">No capital deployment detected in this cycle.</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar Column (4 Columns) */}
                    <aside className="lg:col-span-4 space-y-12">

                        {/* Trust Profile Card */}
                        <motion.div
                            whileHover={{ y: -8 }}
                            className="p-10 bg-slate-900 rounded-[3rem] text-white relative overflow-hidden group border border-slate-800 shadow-3xl"
                        >
                            <div className="absolute inset-0 noise-bg opacity-10"></div>
                            <div className={`absolute top-0 right-0 w-64 h-64 ${tier.color}/20 rounded-full blur-[100px] -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-150`}></div>

                            <div className="flex justify-between items-start mb-10">
                                <div className="text-5xl">{tier.icon}</div>
                                <div className="p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                                    <ShieldCheck className="w-6 h-6 text-indigo-400" />
                                </div>
                            </div>

                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Portfolio Tier</p>
                            <h3 className="text-3xl font-black tracking-tighter mb-6 uppercase italic leading-none">{tier.name}</h3>

                            <p className="text-sm text-slate-400 font-medium mb-12 leading-relaxed">
                                {stats.total < 10000
                                    ? `Acquire Tier 2 status by deploying ₹${(10000 - stats.total).toLocaleString()} additional capital.`
                                    : "Priority AI verification and premium outcome reports are active for your node."
                                }
                            </p>

                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Progress</span>
                                    <span className="text-xl font-black text-orange-400 tracking-tighter">{tier.progress}%</span>
                                </div>
                                <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden p-1 border border-white/10">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${tier.progress}%` }}
                                        transition={{ duration: 2, delay: 0.5 }}
                                        className={`${tier.color} h-full rounded-full shadow-[0_0_20px_rgba(249,115,22,0.5)]`}
                                    ></motion.div>
                                </div>
                            </div>
                        </motion.div>

                        {/* AI Recommendations */}
                        {suggestions.length > 0 && (
                            <div className="p-10 bg-white rounded-[3rem] border border-slate-200 shadow-xl shadow-slate-200/50">
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="p-3 bg-orange-50 rounded-2xl">
                                        <Zap className="w-6 h-6 text-orange-500" />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">AI Matching</h3>
                                </div>
                                <div className="space-y-6">
                                    {suggestions.map((item, i) => (
                                        <motion.div
                                            key={i}
                                            whileHover={{ x: 10 }}
                                            className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 hover:border-orange-200 transition-all cursor-pointer group"
                                            onClick={() => navigate(`/project/${(item.targetType || 'need').toLowerCase()}/${item.targetId}`)}
                                        >
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="text-[9px] font-black px-3 py-1 bg-white rounded-lg border border-slate-200 text-slate-400 uppercase tracking-widest">Target Node</span>
                                                <span className="text-xs font-black text-orange-600">{item.percentage}% Fit</span>
                                            </div>
                                            <h4 className="text-base font-black text-slate-800 leading-tight mb-2 group-hover:text-orange-600 transition-colors uppercase italic">{item.title}</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">/ {item.ngoName}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Cause Affinity Visualization */}
                        <div className="p-10 bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/30">
                            <div className="flex items-center gap-4 mb-12">
                                <div className="p-3 bg-indigo-50 rounded-2xl">
                                    <PieChart className="w-6 h-6 text-indigo-500" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Cause Affinity</h3>
                            </div>

                            <div className="space-y-10">
                                {affinity.length > 0 ? affinity.map((item, i) => (
                                    <AffinityBar
                                        key={i}
                                        icon={item.icon}
                                        label={item.label}
                                        percentage={item.percentage}
                                        color={i === 0 ? "bg-orange-500" : "bg-slate-900"}
                                    />
                                )) : (
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center py-10 italic">Analysis in progress...</p>
                                )}
                            </div>

                            <button
                                onClick={() => navigate('/explore')}
                                className="w-full mt-12 py-6 rounded-[2rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-orange-500 hover:shadow-2xl hover:shadow-orange-500/30 transition-all active:scale-95 flex items-center justify-center gap-4 group"
                            >
                                Optimize Portfolio <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                            </button>
                        </div>

                        {/* Annual Report Access */}
                        <div className="p-10 bg-indigo-900 rounded-[3rem] text-white relative overflow-hidden group border-none shadow-3xl">
                            <div className="absolute inset-0 noise-bg opacity-10"></div>
                            <Award className="w-16 h-16 mb-10 text-indigo-300" />
                            <h3 className="text-3xl font-black tracking-tighter mb-6 uppercase italic">Impact Summary</h3>
                            <p className="text-sm text-indigo-200/80 font-medium mb-12 leading-relaxed">
                                Deploy your personalized 2026 humanitarian audit. Deep analysis of your social capital ROI.
                            </p>
                            <button className="w-full py-6 rounded-3xl bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all text-white text-[10px] font-black uppercase tracking-[0.2em] border border-white/10 flex items-center justify-center gap-3 group">
                                Generate Audit <Download className="w-4 h-4 group-hover:animate-bounce" />
                            </button>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ icon, label, value, color }) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="modern-card p-6 bg-white border border-slate-100 min-w-[180px] group flex flex-col justify-between"
        >
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 mb-6 group-hover:text-orange-500 group-hover:bg-orange-50 transition-all duration-500 shadow-inner">
                {icon}
            </div>
            <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                <p className={`text-3xl font-black ${color} tracking-tighter whitespace-nowrap`}>{value}</p>
            </div>
        </motion.div>
    );
}

function AffinityBar({ icon, label, percentage, color }) {
    return (
        <div className="space-y-4 group">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <span className="text-2xl group-hover:scale-125 transition-transform">{icon}</span>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
                </div>
                <span className="text-lg font-black text-slate-900 tracking-tighter">{percentage}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden p-0.5 border border-slate-200">
                <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${percentage}%` }}
                    transition={{ duration: 1.5, delay: 0.2 }}
                    className={`${color} h-full rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)]`}
                ></motion.div>
            </div>
        </div>
    );
}
