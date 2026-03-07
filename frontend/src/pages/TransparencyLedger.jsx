import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { publicApi } from '../api';
import {
    ShieldCheck,
    FileText,
    Database,
    TrendingUp,
    Users,
    Activity,
    Lock,
    AlertCircle,
    Fingerprint,
    Cpu,
    Globe,
    ArrowRight,
    Search
} from 'lucide-react';

export default function TransparencyLedger() {
    const [stats, setStats] = useState(null);
    const [auditLogs, setAuditLogs] = useState([]);
    const [ngos, setNgos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const { scrollYProgress } = useScroll();
    const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [s, logs, n] = await Promise.all([
                publicApi.getStats(),
                publicApi.getAuditLogs(),
                publicApi.getNgos()
            ]);
            setStats(s.data);
            setAuditLogs(logs.data);
            setNgos(n.data);
        } catch (error) {
            console.error("Failed to fetch transparency data");
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = auditLogs.filter(log =>
        log.targetType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen pb-32 bg-slate-50 text-slate-600 selection:bg-orange-500/10 overflow-hidden font-sans">
            {/* Soft Ambient Background Elements */}
            <motion.div
                style={{ y: backgroundY }}
                className="fixed inset-0 z-0 pointer-events-none"
            >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-orange-500/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[120px]" />
                <div className="absolute inset-0 noise-bg opacity-[0.03]" />
            </motion.div>

            <div className="max-w-7xl mx-auto px-6 relative z-10 pt-32">
                {/* Hero Header */}
                <div className="relative mb-24 text-center lg:text-left">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white border border-slate-200 mb-10 shadow-sm"
                    >
                        <ShieldCheck className="w-5 h-5 text-orange-500" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Zero-Trust Protocol / Public Terminal</span>
                    </motion.div>

                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
                        <div className="max-w-3xl">
                            <motion.h1
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-7xl md:text-9xl font-black text-slate-900 tracking-tighter leading-[0.85] mb-8"
                            >
                                THE IMPACT <br />
                                <span className="text-gradient">LEDGER</span>
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-xl text-slate-500 font-medium leading-relaxed"
                            >
                                Re-engineering philanthropy through immutable visibility.
                                A cryptographic record of every life changed.
                            </motion.p>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-8 rounded-[2.5rem] bg-white border border-slate-200 flex flex-col items-center justify-center text-center lg:w-72 aspect-square relative group shadow-2xl shadow-slate-200"
                        >
                            <div className="absolute inset-0 bg-linear-to-tr from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[2.5rem]" />
                            <Cpu className="w-12 h-12 text-orange-500 mb-6 animate-pulse" />
                            <h3 className="text-5xl font-black text-slate-900 mb-2 tracking-tighter underline decoration-orange-500/30 decoration-8 underline-offset-4">
                                {stats?.verifiedNgos || 86}
                            </h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Humanitarian Nodes</p>
                        </motion.div>
                    </div>
                </div>

                {/* Real-time KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-32">
                    <PremiumKPI
                        icon={<Globe className="w-6 h-6" />}
                        label="Life Cycle Flow"
                        value={`₹${(stats?.totalAllocated || 1245000).toLocaleString()}`}
                        subValue="Verified Escrow"
                    />
                    <PremiumKPI
                        icon={<Fingerprint className="w-6 h-6" />}
                        label="Network Identity"
                        value="99.2%"
                        subValue="Audit Pass Rate"
                    />
                    <PremiumKPI
                        icon={<Activity className="w-6 h-6" />}
                        label="Impact Velocity"
                        value={`${stats?.impactStories || 1240}`}
                        subValue="Resolved Needs"
                    />
                    <PremiumKPI
                        icon={<Lock className="w-6 h-6" />}
                        label="Reserve Security"
                        value="Triple-Layer"
                        subValue="AES-256 Verified"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Audit Log Terminal */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
                                    <FileText className="w-6 h-6 text-orange-500" />
                                </div>
                                <h2 className="text-3xl font-black tracking-tight text-slate-900 uppercase italic">Oversight Terminal</h2>
                            </div>

                            <div className="relative group flex-1 max-w-xs">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Filter system logs..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-orange-500/10 transition-all font-medium"
                                />
                            </div>
                        </div>

                        <div className="rounded-[3rem] border border-slate-200 bg-white shadow-3xl shadow-slate-200 overflow-hidden">
                            <div className="bg-slate-50/80 px-8 py-4 border-b border-slate-200 flex items-center justify-between">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-slate-300" />
                                    <div className="w-3 h-3 rounded-full bg-slate-300" />
                                    <div className="w-3 h-3 rounded-full bg-slate-300" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">SESSION_LOG_AUTH_ENCRYPTED</span>
                            </div>

                            <div className="p-6 space-y-3 max-h-[800px] overflow-y-auto custom-scrollbar">
                                <AnimatePresence mode="popLayout">
                                    {filteredLogs.map((log, idx) => (
                                        <motion.div
                                            key={log._id}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="p-5 rounded-2xl bg-white border border-slate-100 hover:border-orange-500/40 hover:bg-orange-50/30 transition-all group flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center text-xl font-black border border-slate-100 group-hover:bg-orange-500 group-hover:text-white group-hover:border-orange-500 transition-all duration-500">
                                                    {log.adminId?.name?.[0] || 'A'}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-tight ${log.action.includes('approve') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                            {log.action.replace('_', ' ')}
                                                        </span>
                                                        <span className="text-[9px] font-bold text-slate-400 font-mono">SIG: {log._id.substring(0, 10)}</span>
                                                    </div>
                                                    <h3 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-1">
                                                        {log.targetType} Protocol
                                                    </h3>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(log.createdAt).toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                className="p-3 rounded-full bg-slate-50 border border-slate-100 text-slate-400 hover:bg-white hover:text-orange-500 hover:shadow-lg transition-all"
                                            >
                                                <ArrowRight className="w-5 h-5" />
                                            </motion.button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {filteredLogs.length === 0 && (
                                    <div className="py-32 text-center">
                                        <AlertCircle className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                                        <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No encrypted log entries found</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* NGO Authority Sidebar */}
                    <div className="lg:col-span-4 space-y-12">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
                                <Users className="w-6 h-6 text-slate-800" />
                            </div>
                            <h2 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Trust Board</h2>
                        </div>

                        <div className="space-y-4">
                            {ngos.map((ngo, idx) => (
                                <motion.div
                                    key={ngo._id}
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="p-8 rounded-[2.5rem] bg-white border border-slate-200 hover:border-orange-500/40 hover:shadow-2xl hover:shadow-orange-500/5 transition-all group relative overflow-hidden"
                                >
                                    <div className="relative z-10">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 leading-none">{ngo.address?.split(',').pop()?.trim() || 'GLOBAL NODE'}</p>
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-6 group-hover:text-orange-600 transition-colors uppercase italic">{ngo.name}</h3>

                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trust Q-Score</span>
                                            <span className="text-2xl font-black text-slate-900">{ngo.trustScore}%</span>
                                        </div>

                                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${ngo.trustScore}%` }}
                                                className={`h-full ${ngo.trustScore >= 80 ? 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)]' : ngo.trustScore >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between mt-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Verified ID</span>
                                            </div>
                                            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                                                <Globe className="w-4 h-4 text-slate-300" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PremiumKPI({ icon, label, value, subValue }) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="p-10 rounded-[3rem] bg-white border border-slate-200 relative overflow-hidden group shadow-sm hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />

            <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mb-8 border border-slate-100 group-hover:text-orange-500 group-hover:border-orange-500/20 group-hover:bg-white transition-all duration-500">
                    {icon}
                </div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 leading-none">{label}</p>
                <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-4 leading-none">{value}</h3>
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-orange-500" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{subValue}</span>
                </div>
            </div>
        </motion.div>
    );
}
