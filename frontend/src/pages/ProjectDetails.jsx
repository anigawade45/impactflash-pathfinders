import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { publicApi, activityApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { ShieldCheck, Sparkles, Timer, ArrowRight, Heart, Info, BadgeCheck, AlertCircle } from 'lucide-react';
import DonationModal from '../components/donors/DonationModal';

export default function ProjectDetails() {
    const { type, id } = useParams(); // type is 'need' or 'campaign'
    const navigate = useNavigate();
    const { user } = useAuth();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState({ text: '', type: '' });

    // Donation State
    const [donorAmount, setDonorAmount] = useState(5000);
    const [showDonationModal, setShowDonationModal] = useState(false);

    const isAdmin = user?.role === 'admin';
    const isDonor = user?.role === 'donor';

    useEffect(() => {
        fetchProject();
    }, [id, type]);

    const fetchProject = async () => {
        setLoading(true);
        try {
            const res = type === 'need'
                ? await publicApi.getNeedById(id)
                : await publicApi.getCampaignById(id);

            if (res.success) {
                setProject(res.data);
            }
        } catch (error) {
            setMsg({ text: 'Failed to fetch project details.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async (action) => {
        setMsg({ text: '', type: '' });
        try {
            const res = await activityApi.reviewItem(project._id, type, action);
            if (res.success) {
                setMsg({ text: res.message || 'Action completed.', type: 'success' });
                setTimeout(() => navigate('/admin'), 1500);
            }
        } catch (error) {
            setMsg({ text: error.response?.data?.message || 'Error updating status', type: 'error' });
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center group">
                <div className="w-16 h-16 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-6 shadow-2xl shadow-orange-500/10"></div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Running Multi-Layer AI Analysis...</p>
            </div>
        </div>
    );

    if (!project) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h1 className="text-xl font-black text-slate-900 uppercase tracking-widest">Project Not Found</h1>
                <button onClick={() => navigate(-1)} className="mt-8 text-xs font-black text-orange-500 uppercase tracking-widest hover:underline">Return to safety</button>
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto pt-10 px-4 pb-32">
            {/* Context Navigation */}
            <div className="flex justify-between items-center mb-10">
                <button
                    onClick={() => navigate(-1)}
                    className="group flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-slate-900 transition-all bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm"
                >
                    <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                    Back to {isAdmin ? 'Review Queue' : 'Discovery Board'}
                </button>

                <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Protocol Status</span>
                    <div className="px-4 py-2 bg-green-50 text-green-600 rounded-xl border border-green-100 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest">Verified Marketplace Node</span>
                    </div>
                </div>
            </div>

            {msg.text && (
                <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 font-bold text-xs shadow-sm ${msg.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'
                    }`}>
                    <span className="text-lg">{msg.type === 'error' ? '🚫' : '⚡'}</span>
                    {msg.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
                {/* Main Report Column */}
                <div className="lg:col-span-2 space-y-10">
                    <div className="modern-card p-0 bg-white overflow-hidden shadow-premium border border-slate-100 flex flex-col">
                        {/* Verdict Header */}
                        <div className={`p-10 flex justify-between items-center relative overflow-hidden ${project.aiVerdict?.includes('APPROVED') ? 'bg-green-600' :
                            project.aiVerdict?.includes('FLAGGED') ? 'bg-red-600' : 'bg-slate-900'
                            }`}>
                            <div className="absolute inset-0 noise-bg opacity-10"></div>
                            <div className="flex items-center gap-6 relative z-10">
                                <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                                    <Sparkles className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em] leading-none mb-2">Multi-Layer AI Verdict</p>
                                    <h4 className="text-3xl font-black text-white uppercase tracking-tighter leading-tight">{project.aiVerdict || 'ANALYSIS_PENDING'}</h4>
                                </div>
                            </div>
                            <div className="text-right relative z-10">
                                <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em] leading-none mb-2">Protocol Consensus</p>
                                <p className="text-6xl font-black text-white leading-none tracking-tighter">{project.aiScore}<span className="text-xl opacity-30">/100</span></p>
                            </div>
                        </div>

                        <div className="p-12 space-y-12">
                            <div className="flex justify-between items-start border-b border-slate-100 pb-10">
                                <div className="space-y-4">
                                    <h3 className="text-4xl font-black text-slate-900 tracking-tighter leading-[0.9]">{project.title}</h3>
                                    <div className="flex items-center gap-4">
                                        <span className="px-3 py-1 bg-orange-50 text-orange-600 text-[10px] font-black uppercase rounded-lg border border-orange-100 tracking-widest">{type}</span>
                                        <span className="text-sm text-slate-400 font-bold uppercase tracking-[0.2em]">{project.category}</span>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2 italic">Origin Entity</p>
                                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{project.ngoId?.name}</p>
                                    <div className="mt-2 flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
                                        <ShieldCheck className={`w-3.5 h-3.5 ${project.ngoId?.trustScore >= 70 ? 'text-green-500' : 'text-orange-500'}`} />
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-tight">Trust Weight: {project.ngoId?.trustScore}/100</p>
                                    </div>
                                </div>
                            </div>

                            {/* Story/Description */}
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                                    <Info className="w-3.5 h-3.5" /> Cause Narrative
                                </p>
                                <p className="text-slate-600 text-lg font-medium leading-relaxed">
                                    {project.story || project.description}
                                </p>
                            </div>

                            {/* Financial Summary */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <FinStat label="Target Capital" value={`₹${(project.amount || project.targetAmount).toLocaleString()}`} />
                                <FinStat label="Beneficiaries" value={project.beneficiaries || 'N/A'} />
                                <FinStat
                                    label="Urgency Level"
                                    value={project.urgency || 'MEDIUM'}
                                    highlight={project.urgency === 'high'}
                                />
                                <FinStat
                                    label="Node Expiry"
                                    value={`${project.deadline ? Math.ceil((new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : '30'} DAYS`}
                                />
                            </div>

                            {/* AI Decision Logic */}
                            <div className="space-y-8 pt-6">
                                <div className="flex items-center justify-between mb-4 px-2">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">AI Rationale Matrix</h4>
                                    <span className="text-[8px] font-black text-indigo-500 uppercase px-3 py-1 bg-indigo-50 rounded-lg border border-indigo-100 italic">Gradient Boosting Feature Weights</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-slate-50 p-10 rounded-[3rem] border border-slate-100 relative overflow-hidden">
                                    <div className="space-y-6">
                                        <p className="text-[10px] font-black text-green-500 uppercase tracking-widest border-b border-green-100 pb-3 flex items-center gap-2">
                                            <Sparkles className="w-3.5 h-3.5" /> Multipliers
                                        </p>
                                        <div className="space-y-4">
                                            {project.aiWhyHigh ? (
                                                project.aiWhyHigh.split(',').map((reason, idx) => (
                                                    <div key={idx} className="flex gap-3 items-start">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 shrink-0"></div>
                                                        <p className="text-sm font-bold text-slate-700 leading-tight">{reason.trim()}</p>
                                                    </div>
                                                ))
                                            ) : <p className="text-sm text-slate-400 italic">No significant urgency detected.</p>}
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <p className="text-[10px] font-black text-red-400 uppercase tracking-widest border-b border-red-100 pb-3 flex items-center gap-2">
                                            <AlertCircle className="w-3.5 h-3.5" /> Inhibitors
                                        </p>
                                        <div className="space-y-4">
                                            {project.aiWhyNotHigher ? (
                                                project.aiWhyNotHigher.split(',').map((reason, idx) => (
                                                    <div key={idx} className="flex gap-3 items-start">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0"></div>
                                                        <p className="text-sm font-bold text-slate-700 leading-tight">{reason.trim()}</p>
                                                    </div>
                                                ))
                                            ) : <p className="text-sm text-slate-400 italic">No technical inhibitors found.</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Document Preview */}
                            {project.documents?.length > 0 && (
                                <div className="pt-8 border-t border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 text-center">On-Chain verification Evidence</p>
                                    <div className="relative group overflow-hidden rounded-[3rem] border-8 border-slate-50 shadow-inner bg-slate-50/50 aspect-video flex flex-col items-center justify-center p-10 hover:border-slate-100 transition-all">
                                        <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                            <BadgeCheck className="w-10 h-10 text-orange-500" />
                                        </div>
                                        <h5 className="text-lg font-black text-slate-800 uppercase tracking-widest mb-2">Legal Verification Proof</h5>
                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-8 italic">Verified by Network Nodes</p>
                                        <a
                                            href={project.documents[0]}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-12 py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-black shadow-2xl transition-all"
                                        >
                                            Inspect Document 🔗
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sticky Action Sidebar */}
                <div className="lg:col-span-1 sticky top-32 space-y-8">
                    {/* Role-Specific Action Card */}
                    {isDonor ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="modern-card p-10 bg-white border-2 border-orange-500/20 shadow-premium"
                        >
                            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-8">
                                <Heart className="w-8 h-8 text-orange-500" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase mb-2">Engage with Cause</h3>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-8 leading-relaxed italic">Your capital is released to the NGO via secure smart escrow system only upon audit triggers.</p>

                            <div className="space-y-6 mb-10">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 italic">Personal Allocation Intent</label>
                                    <div className="relative group">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300 transition-colors group-focus-within:text-orange-500">₹</span>
                                        <input
                                            type="number"
                                            value={donorAmount}
                                            onChange={(e) => setDonorAmount(Number(e.target.value))}
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-6 pl-12 pr-6 text-3xl font-black text-slate-900 focus:outline-none focus:border-orange-500/30 transition-all focus:bg-white shadow-sm"
                                        />
                                    </div>
                                    <p className="text-[8px] font-black text-slate-300 mt-3 text-right uppercase tracking-[0.2em]">Live Valuation of Allocation</p>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowDonationModal(true)}
                                className="w-full bg-orange-500 hover:bg-orange-600 py-6 rounded-2xl text-lg font-black text-white shadow-2xl shadow-orange-500/30 flex items-center justify-center gap-3 active:scale-95 transition-all group"
                            >
                                <span>Authorize Release</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>

                            <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-center gap-2">
                                <ShieldCheck className="w-3.5 h-3.5 text-slate-300" />
                                <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.4em]">Military Grade Encryption Active</span>
                            </div>
                        </motion.div>
                    ) : isAdmin && (
                        <div className="modern-card p-10 bg-slate-900 text-white shadow-premium">
                            <h3 className="text-xl font-black uppercase tracking-widest mb-8 border-b border-white/10 pb-6">Final Review Action</h3>
                            <div className="space-y-4 mb-4">
                                <button
                                    onClick={() => handleReview('approve')}
                                    className="w-full py-5 bg-green-500 hover:bg-green-600 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-2xl shadow-green-500/20"
                                >
                                    Push to Live Marketplace
                                </button>
                                <button
                                    onClick={() => handleReview('reject')}
                                    className="w-full py-5 bg-white/5 hover:bg-red-500/20 border-2 border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                                >
                                    Flag for Clarification
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Fraud Detection Sidebar Component (Always shown for detail reference) */}
                    <div className={`p-8 rounded-[2.5rem] border-2 border-dashed ${project.aiFraudStatus === 'HIGH RISK' ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-100/50 shadow-sm'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <p className={`text-[10px] font-black uppercase tracking-widest ${project.aiFraudStatus === 'HIGH RISK' ? 'text-red-400' : 'text-slate-400'}`}>Pattern Status</p>
                            <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${project.aiFraudStatus === 'HIGH RISK' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                <span className="text-[9px] font-black text-slate-900 uppercase">{project.aiFraudStatus || 'CLEAR'}</span>
                            </div>
                        </div>
                        <p className="text-sm font-bold text-slate-600 leading-relaxed italic border-t border-slate-200/50 pt-4">
                            "{project.aiOneFlag || 'Normal funding pattern and request frequency confirmed by audit machine.'}"
                        </p>
                    </div>
                </div>
            </div>

            <DonationModal
                isOpen={showDonationModal}
                onClose={() => setShowDonationModal(false)}
                totalAmount={donorAmount}
                items={[{
                    targetId: project._id,
                    targetType: type === 'need' ? 'Need' : 'Campaign',
                    amount: donorAmount,
                    title: project.title,
                    ngoId: project.ngoId?._id || project.ngoId,
                    category: project.category
                }]}
            />
        </div>
    );
}

function FinStat({ label, value, highlight = false }) {
    return (
        <div className={`p-5 rounded-2.5xl border border-slate-100 ${highlight ? 'bg-orange-50 border-orange-100/50 shadow-sm shadow-orange-500/5' : 'bg-slate-50/50'}`}>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">{label}</p>
            <p className={`text-xl font-black tracking-tighter ${highlight ? 'text-orange-600' : 'text-slate-900'}`}>{value}</p>
        </div>
    );
}
