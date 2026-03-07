import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { activityApi, donationApi } from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, LayoutGrid, BrainCircuit, ArrowRight, ShieldCheck, Timer, Filter, TrendingUp, Info } from 'lucide-react';
import DonationModal from '../../components/donors/DonationModal';

export default function DonorExplore() {
    const [mode, setMode] = useState('browse');
    const [activeTab, setActiveTab] = useState('needs');
    const [data, setData] = useState({ needs: [], campaigns: [] });
    const [loading, setLoading] = useState(true);
    const [suggestedSplit, setSuggestedSplit] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [checkoutItems, setCheckoutItems] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [smartAmount, setSmartAmount] = useState(1000);
    const navigate = useNavigate();

    const [customAmounts, setCustomAmounts] = useState({});
    const [exploreError, setExploreError] = useState('');

    const handleSmartDonate = () => {
        if (smartAmount < 100) {
            setExploreError("Minimum donation is ₹100");
            setTimeout(() => setExploreError(''), 3000);
            return;
        }
        setExploreError('');
        setCheckoutItems(suggestedSplit);
        setTotalAmount(smartAmount);
        setShowModal(true);
    };

    const handleSingleDonate = (item) => {
        const amount = customAmounts[item._id] || 5000;
        if (amount < 100) {
            setExploreError("Minimum donation is ₹100 for any node.");
            setTimeout(() => setExploreError(''), 3000);
            return;
        }
        setExploreError('');
        setCheckoutItems([{
            targetId: item._id,
            targetType: activeTab === 'needs' ? 'Need' : 'Campaign',
            amount: amount,
            title: item.title,
            ngoId: item.ngoId._id || item.ngoId,
            category: item.category
        }]);
        setTotalAmount(amount);
        setShowModal(true);
    };

    const handleAmountChange = (id, val) => {
        setCustomAmounts(prev => ({ ...prev, [id]: Number(val) }));
    };

    useEffect(() => {
        fetchMarketplace();
    }, []);

    const fetchMarketplace = async () => {
        setLoading(true);
        try {
            const [needsRes, campRes] = await Promise.all([
                activityApi.getLiveNeeds(),
                activityApi.getLiveCampaigns()
            ]);
            setData({
                needs: needsRes.data,
                campaigns: campRes.data
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSmartSuggestion = async () => {
        if (smartAmount < 100) {
            setExploreError("Minimum donation is ₹100");
            setTimeout(() => setExploreError(''), 3000);
            return;
        }
        setExploreError('');
        setLoading(true);
        try {
            const res = await donationApi.getSuggestion(smartAmount);
            if (res.success) {
                setSuggestedSplit(res.suggestion);
                setMode('smart');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-32 px-4 bg-slate-50 overflow-hidden relative">
            <AnimatePresence>
                {exploreError && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: -20, x: '-50%' }}
                        className="fixed top-28 left-1/2 z-[100] px-8 py-4 bg-red-600 text-white font-black text-xs uppercase tracking-widest rounded-3xl shadow-[0_20px_40px_-10px_rgba(220,38,38,0.4)] flex items-center gap-3 border border-red-500"
                    >
                        <ShieldCheck className="w-5 h-5 text-red-200" />
                        {exploreError}
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Header Content */}
            <div className="max-w-7xl mx-auto mb-20">
                <div className="flex flex-col lg:flex-row justify-between items-end gap-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="max-w-3xl"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-100 mb-6 font-black text-[10px] text-orange-600 uppercase tracking-widest shadow-sm">
                            <TrendingUp className="w-3.5 h-3.5" /> Live Marketplace
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.9] mb-6">
                            Discovery <span className="text-orange-500">Board</span>
                        </h1>
                        <p className="text-xl text-slate-500 font-medium max-w-xl">
                            Real-time transparent causes, verified by cross-layer AI. Choose how you want to contribute today.
                        </p>
                    </motion.div>

                    <div className="flex p-2 bg-slate-200/50 backdrop-blur-md rounded-[2.5rem] shadow-inner lg:min-w-[440px]">
                        <button
                            onClick={() => setMode('browse')}
                            className={`flex-1 py-4 px-8 rounded-4xl font-black text-sm flex items-center justify-center gap-2 uppercase tracking-widest transition-all ${mode === 'browse' ? 'bg-white shadow-xl text-slate-900 scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <LayoutGrid className="w-4 h-4" /> Browse All
                        </button>
                        <button
                            onClick={fetchSmartSuggestion}
                            className={`flex-1 py-4 px-8 rounded-4xl font-black text-sm flex items-center justify-center gap-2 uppercase tracking-widest transition-all ${mode === 'smart' ? 'bg-slate-900 shadow-xl text-white scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <BrainCircuit className="w-4 h-4" /> Smart Donate
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {mode === 'smart' ? (
                    <motion.div
                        key="smart"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        className="max-w-7xl mx-auto"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                            <div className="lg:col-span-2 space-y-8">
                                <div className="p-12 glass-dark rounded-[3.5rem] text-white relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -mr-48 -mt-48 transition-transform group-hover:scale-125 duration-1000"></div>
                                    <div className="flex items-center gap-4 mb-10">
                                        <div className="p-4 bg-orange-500 rounded-3xl shadow-2xl shadow-orange-500/40">
                                            <Sparkles className="w-8 h-8 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black tracking-tight">AI Multi-Allocation Loop</h2>
                                            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest italic">Linear Programming Optimization</p>
                                        </div>
                                    </div>

                                    <div className="mb-12 bg-white/5 p-8 rounded-4xl border border-white/10">
                                        <label className="block text-[10px] font-black text-orange-400 uppercase tracking-widest mb-4">Total Intent (Amount)</label>
                                        <div className="flex items-center gap-6">
                                            <div className="flex-1 relative">
                                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-black text-white/30">₹</span>
                                                <input
                                                    type="number"
                                                    value={smartAmount}
                                                    onChange={(e) => setSmartAmount(Number(e.target.value))}
                                                    className="w-full bg-white/5 border-2 border-white/10 rounded-3xl py-6 pl-12 pr-6 text-3xl font-black text-white focus:outline-none focus:border-orange-500 transition-all"
                                                />
                                            </div>
                                            <button
                                                onClick={fetchSmartSuggestion}
                                                className="px-10 py-6 bg-orange-500 hover:bg-orange-600 text-white rounded-3xl font-black uppercase tracking-widest text-sm transition-all active:scale-95 shadow-2xl shadow-orange-500/20"
                                            >
                                                Recalculate
                                            </button>
                                        </div>
                                        <p className="text-[9px] font-bold text-slate-500 mt-4 uppercase tracking-[0.2em]">Note: AI splits are recalculated using real-time urgency weights.</p>
                                    </div>

                                    <div className="space-y-6">
                                        {suggestedSplit?.map((item, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 hover:border-orange-500/30 transition-all group/item"
                                            >
                                                <div className="flex justify-between items-start mb-6">
                                                    <div>
                                                        <span className="px-3 py-1 bg-orange-500 text-white text-[10px] font-black uppercase rounded-lg mb-3 inline-block tracking-[0.2em]">
                                                            {item.percentage}% Allocation
                                                        </span>
                                                        <h3 className="text-3xl font-black text-white mb-2">{item.title}</h3>
                                                        <p className="text-slate-400 font-bold uppercase tracking-wider text-xs">{item.ngoName}</p>
                                                    </div>
                                                    <div className="text-right p-4 bg-white/5 rounded-2xl border border-white/5 group-hover/item:border-orange-500/20 transition-all max-w-[200px]">
                                                        <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">AI Reasoning</p>
                                                        <p className="text-[10px] text-slate-300 font-medium leading-relaxed italic">"{item.reason}"</p>
                                                    </div>
                                                </div>
                                                <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden p-0.5 border border-white/5">
                                                    <motion.div
                                                        className="bg-orange-500 h-full rounded-full"
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${item.percentage}%` }}
                                                        transition={{ duration: 1, delay: 0.5 }}
                                                    ></motion.div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="modern-card p-10 bg-white border-2 border-slate-100 flex flex-col items-center text-center"
                                >
                                    <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-900 mb-8 border border-slate-100">
                                        <TrendingUp className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight">Impact Projected</h3>

                                    <div className="w-full space-y-6 mb-10">
                                        <ExecutionStat label="Optimized Items" value={suggestedSplit?.length} />
                                        <ExecutionStat label="Trust Precision" value="99.8%" color="text-green-500" />
                                        <ExecutionStat label="Audit Status" value="TAMPER-PROOF" color="text-sky-500" />
                                    </div>

                                    <button
                                        onClick={handleSmartDonate}
                                        className="w-full btn-primary py-6 rounded-3xl text-2xl shadow-3xl shadow-orange-500/20 active:scale-95 transition-all"
                                    >
                                        Authorize & Pay
                                    </button>
                                    <button
                                        onClick={() => setMode('browse')}
                                        className="mt-6 text-slate-400 font-black uppercase text-xs tracking-widest hover:text-slate-600 transition-colors underline decoration-slate-200 underline-offset-4"
                                    >
                                        Manual Review Mode
                                    </button>
                                </motion.div>

                                <div className="modern-card p-8 bg-linear-to-br from-orange-500 to-amber-600 text-white relative overflow-hidden group">
                                    <div className="absolute inset-0 noise-bg opacity-10"></div>
                                    <ShieldCheck className="w-12 h-12 mb-6" />
                                    <h4 className="text-xl font-black uppercase mb-3">Layer 3 Active</h4>
                                    <p className="text-sm font-medium opacity-80 leading-relaxed">Identity cross-checks and network fraud detection are running in real-time for this allocation.</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="browse"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="max-w-7xl mx-auto"
                    >
                        {/* Tabs & Filters */}
                        <div className="flex flex-col md:flex-row gap-8 items-center justify-between mb-12 border-b border-slate-200">
                            <div className="flex gap-4">
                                {['needs', 'campaigns'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-10 py-5 font-black text-sm uppercase tracking-[0.2em] transition-all relative ${activeTab === tab ? 'text-slate-900 border-b-4 border-orange-500' : 'text-slate-400 hover:text-slate-500'}`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-4 py-4">
                                <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-2xl border border-slate-200 shadow-sm group hover:border-orange-500/30 transition-all">
                                    <Filter className="w-4 h-4 text-slate-400 group-hover:text-orange-500" />
                                    <select className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-slate-500 focus:ring-0 cursor-pointer">
                                        <option>Sort: AI Trust Score</option>
                                        <option>Sort: Urgency Level</option>
                                        <option>Sort: Budget Size</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Marketplace Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {data[activeTab]?.map((item, idx) => (
                                <motion.div
                                    key={item._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="modern-card group bg-white border border-slate-200 hover:border-orange-200 overflow-hidden flex flex-col"
                                >
                                    <div
                                        onClick={() => navigate(`/project/${activeTab === 'needs' ? 'need' : 'campaign'}/${item._id}`)}
                                        className="h-56 bg-slate-100 relative overflow-hidden shrink-0 cursor-pointer"
                                    >
                                        {item.photos?.[0] ? (
                                            <img src={item.photos[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-5xl opacity-10 bg-slate-200">📊</div>
                                        )}

                                        {/* Status & Scores Overlays */}
                                        <div className="absolute top-4 left-4 flex gap-2">
                                            <div className="px-3 py-1.5 glass-morphism rounded-xl flex items-center gap-2 border border-white/30 shadow-sm">
                                                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                                                <span className="text-[10px] font-black text-slate-900 tracking-tight">TRUST {item.ngoId?.trustScore || 0}</span>
                                            </div>
                                            <div className="px-3 py-1.5 glass-morphism rounded-xl flex items-center gap-2 border border-white/30 shadow-sm">
                                                <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                                                <span className="text-[10px] font-black text-slate-900 tracking-tight">AI {item.aiScore}</span>
                                            </div>
                                        </div>

                                        <div className="absolute bottom-4 right-4">
                                            <div className="px-3 py-1 bg-slate-900/80 backdrop-blur-md rounded-lg border border-white/10 shadow-xl flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                                <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">LIVE</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-8 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em]">{item.category || 'Humanitarian'}</span>
                                            {item.urgency === 'high' && (
                                                <span className="flex items-center gap-1.5 px-2 py-0.5 bg-red-50 text-red-600 text-[9px] font-black uppercase rounded-md border border-red-100">
                                                    <Timer className="w-3 h-3" /> Urgent
                                                </span>
                                            )}
                                        </div>

                                        <h3
                                            onClick={() => navigate(`/project/${activeTab === 'needs' ? 'need' : 'campaign'}/${item._id}`)}
                                            className="text-xl font-black text-slate-900 mb-3 tracking-tight group-hover:text-orange-600 transition-colors line-clamp-1 cursor-pointer"
                                        >
                                            {item.title}
                                        </h3>
                                        <p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-2 mb-8 flex-1">{item.description || item.story}</p>

                                        {/* Action Button */}
                                        <div className="mt-auto">
                                            <button
                                                onClick={() => navigate(`/project/${activeTab === 'needs' ? 'need' : 'campaign'}/${item._id}`)}
                                                className="w-full py-4 bg-slate-900 group-hover:bg-orange-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98]"
                                            >
                                                <span>View Impact Details</span>
                                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <DonationModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                items={checkoutItems}
                totalAmount={totalAmount}
            />
        </div>
    );
}

function ExecutionStat({ label, value, color = "text-slate-900" }) {
    return (
        <div className="w-full flex justify-between items-center group/stat">
            <div className="flex items-center gap-3">
                <Info className="w-4 h-4 text-slate-300 group-hover/stat:text-orange-500 transition-colors" />
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</span>
            </div>
            <span className={`text-lg font-black ${color}`}>{value}</span>
        </div>
    );
}
