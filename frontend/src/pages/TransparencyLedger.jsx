import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { publicApi } from '../api';
import { ShieldCheck, FileText, Database, TrendingUp, Users, Activity, Lock, AlertCircle } from 'lucide-react';

export default function TransparencyLedger() {
    const [stats, setStats] = useState(null);
    const [auditLogs, setAuditLogs] = useState([]);
    const [ngos, setNgos] = useState([]);
    const [loading, setLoading] = useState(true);

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

    return (
        <div className="min-h-screen pt-24 pb-32 px-4 bg-slate-50 relative overflow-hidden">
            {/* Background Architecture */}
            <div className="absolute inset-0 noise-bg opacity-5"></div>
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-orange-500/5 rounded-full blur-[120px] -mr-96 -mt-96"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-24">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass-morphism border border-orange-200/40 mb-8 shadow-2xl shadow-orange-500/5"
                    >
                        <ShieldCheck className="w-5 h-5 text-orange-500" />
                        <span className="text-[10px] font-black text-orange-600 uppercase tracking-[0.4em]">Public Oversight Terminal / Ver. 5.1.0</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.9] mb-8"
                    >
                        The Impact <br />
                        <span className="text-gradient">Ledger</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-slate-500 font-medium max-w-2xl mx-auto"
                    >
                        Total visibility of every rupee allocated and every administrative decision. A tamper-proof record for absolute donor confidence.
                    </motion.p>
                </div>

                {/* KPI Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
                    <KPI
                        icon={<Database className="w-6 h-6" />}
                        label="Life Cycle Allocation"
                        value={`₹${(stats?.totalAllocated || 0).toLocaleString()}`}
                        trend="+12.4%"
                    />
                    <KPI
                        icon={<Activity className="w-6 h-6" />}
                        label="Humanitarian Needs Met"
                        value={stats?.impactStories || "1,240"}
                        trend="Active"
                    />
                    <KPI
                        icon={<Users className="w-6 h-6" />}
                        label="Verified NGO Node"
                        value={stats?.verifiedNgos || "86"}
                        trend="99% Uptime"
                    />
                    <KPI
                        icon={<Lock className="w-6 h-6" />}
                        label="Network Trust Score"
                        value="9.8/10"
                        trend="Stable"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Official Audit Logs */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-10 px-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-slate-900 rounded-2xl">
                                    <FileText className="w-6 h-6 text-white" />
                                </div>
                                <h2 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Audit Decision Live-Feed</h2>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Sync</span>
                            </div>
                        </div>

                        <div className="modern-card overflow-hidden bg-white/70 backdrop-blur-xl border border-slate-200/60 shadow-3xl">
                            <div className="p-8 space-y-4">
                                {auditLogs.length > 0 ? auditLogs.map((log, idx) => (
                                    <motion.div
                                        key={log._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="p-6 rounded-3xl border border-slate-100 hover:border-orange-500/20 hover:bg-orange-50/20 transition-all flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-800 font-black text-lg group-hover:bg-white group-hover:shadow-lg transition-all">
                                                {log.adminId?.name?.[0] || 'A'}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Decision:</span>
                                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-tight ${log.action.includes('approve') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {log.action.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <p className="text-lg font-black text-slate-800 tracking-tight leading-tight mb-1">
                                                    {log.targetType} <span className="text-slate-400 font-bold ml-2">#{log._id?.substring(0, 8)}</span>
                                                </p>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(log.createdAt).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-orange-500/40 transition-colors">
                                                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-orange-500 transition-colors" />
                                            </div>
                                        </div>
                                    </motion.div>
                                )) : (
                                    <div className="py-20 text-center">
                                        <AlertCircle className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Waiting for new administrative events...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* NGO Authority Board */}
                    <div>
                        <div className="flex items-center gap-4 mb-10 px-6">
                            <div className="p-3 bg-orange-500 rounded-2xl shadow-xl shadow-orange-500/20">
                                <ShieldCheck className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Trust Board</h2>
                        </div>

                        <div className="space-y-6">
                            {ngos.map((ngo, idx) => (
                                <motion.div
                                    key={ngo._id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="modern-card p-1 relative overflow-hidden group cursor-default"
                                >
                                    <div className="p-8 flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1 leading-none">{ngo.address?.split(',').pop() || 'INDIA'}</p>
                                            <h3 className="text-xl font-black text-slate-800 tracking-tight group-hover:text-orange-600 transition-colors">{ngo.name}</h3>
                                            <div className="flex items-center gap-2 mt-3">
                                                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Identity Verified</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="relative inline-block">
                                                <svg className="w-16 h-16 transform -rotate-90">
                                                    <circle className="text-slate-100" strokeWidth="6" stroke="currentColor" fill="transparent" r="28" cx="32" cy="32" />
                                                    <motion.circle
                                                        className={ngo.trustScore >= 80 ? 'text-green-500' : ngo.trustScore >= 50 ? 'text-orange-500' : 'text-rose-500'}
                                                        strokeWidth="6"
                                                        strokeDasharray={28 * 2 * Math.PI}
                                                        initial={{ strokeDashoffset: 28 * 2 * Math.PI }}
                                                        whileInView={{ strokeDashoffset: 28 * 2 * Math.PI * (1 - ngo.trustScore / 100) }}
                                                        transition={{ duration: 1, delay: 0.5 }}
                                                        strokeLinecap="round"
                                                        stroke="currentColor"
                                                        fill="transparent"
                                                        r="28"
                                                        cx="32"
                                                        cy="32"
                                                    />
                                                </svg>
                                                <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-slate-900">{ngo.trustScore}</span>
                                            </div>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Trust Q</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function KPI({ icon, label, value, trend }) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="modern-card p-10 bg-white border border-slate-200 relative overflow-hidden group"
        >
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mb-8 border border-slate-100 group-hover:text-orange-500 group-hover:border-orange-500/30 transition-all duration-500">
                {icon}
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{label}</p>
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-4">{value}</h3>
            <div className="flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">{trend}</span>
            </div>
        </motion.div>
    );
}

function ArrowRight(props) {
    return (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
        </svg>
    )
}
