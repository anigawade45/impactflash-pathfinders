import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { activityApi, publicApi, escrowApi } from '../api';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('reviews'); // 'reviews' or 'audit'
    const [pending, setPending] = useState({ needs: [], campaigns: [], ngos: [], milestoneNeeds: [], milestoneCampaigns: [] });
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState({ text: '', type: '' });

    useEffect(() => {
        if (activeTab === 'reviews') fetchPending();
        else fetchAuditLogs();
    }, [activeTab]);

    const fetchPending = async () => {
        setLoading(true);
        try {
            const res = await activityApi.getPending();
            if (res.success) {
                setPending({
                    needs: res.needs || [],
                    campaigns: res.campaigns || [],
                    ngos: res.ngos || [],
                    milestoneNeeds: res.milestoneNeeds || [],
                    milestoneCampaigns: res.milestoneCampaigns || []
                });
            }
        } catch (error) {
            setMsg({ text: 'Failed to fetch pending reviews.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const fetchAuditLogs = async () => {
        setLoading(true);
        try {
            const res = await publicApi.getAuditLogs();
            if (res.success) setAuditLogs(res.data);
        } catch (error) {
            setMsg({ text: 'Failed to fetch audit logs.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async (id, type, action) => {
        setMsg({ text: '', type: '' });
        try {
            const res = await activityApi.reviewItem(id, type, action);
            if (res.success) {
                setMsg({ text: res.message || 'Action completed successfully.', type: 'success' });
                fetchPending();
            }
        } catch (error) {
            setMsg({ text: error.response?.data?.message || 'Error updating status', type: 'error' });
        }
    };

    const handleMilestoneReview = async (itemId, itemType, level, action) => {
        const feedback = prompt(`Enter ${action}al feedback for this milestone:`);
        if (!feedback) return;

        setMsg({ text: '', type: '' });
        try {
            const res = await escrowApi.verifyMilestone({ itemId, itemType, level, action, feedback });
            if (res.success) {
                setMsg({ text: res.message, type: 'success' });
                fetchPending();
            }
        } catch (error) {
            setMsg({ text: error.response?.data?.message || 'Verification failed', type: 'error' });
        }
    };

    if (loading) return <div className="text-center mt-20 text-slate-500 font-bold animate-pulse">Loading Admin Panel...</div>;

    const allMilestoneProjects = [...pending.milestoneNeeds.map(n => ({ ...n, itemType: 'Need' })), ...pending.milestoneCampaigns.map(c => ({ ...c, itemType: 'Campaign' }))];

    return (
        <div className="max-w-7xl mx-auto mt-20 px-4 pb-20 animate-fade-in">
            <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-2">Escrow & Project Control</h1>
                    <p className="text-slate-500">Human-in-the-loop verification pipeline for Tier 1 trust releases.</p>
                </div>

                <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl modern-card-inset">
                    <button
                        onClick={() => setActiveTab('reviews')}
                        className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'reviews' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>
                        Review Queue ({(pending.ngos.length + pending.needs.length + pending.campaigns.length + allMilestoneProjects.length)})
                    </button>
                    <button
                        onClick={() => setActiveTab('audit')}
                        className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'audit' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>
                        Audit Logs
                    </button>
                </div>
            </div>

            {msg.text && (
                <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 font-bold text-xs shadow-sm ${msg.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'
                    }`}>
                    <span className="text-lg">{msg.type === 'error' ? '🚫' : '⚡'}</span>
                    {msg.text}
                </div>
            )}

            {activeTab === 'reviews' ? (
                <div className="grid grid-cols-1 gap-16">
                    {/* NGOs Section */}
                    <section>
                        <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-4">
                            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">NGO KYC Queue</h2>
                            <span className="bg-orange-600 text-white text-[10px] font-black px-2 py-1 rounded-md">{pending.ngos.length}</span>
                        </div>
                        {pending.ngos.length === 0 ? <p className="text-slate-400 font-bold uppercase text-[10px]">Registry Clear</p> : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {pending.ngos.map(ngo => (
                                    <div key={ngo._id} className="modern-card p-0 bg-white border border-slate-100 flex flex-col group hover:shadow-xl transition-all duration-300 overflow-hidden">
                                        <div className="p-6 flex items-center gap-4 flex-1">
                                            <div className="w-12 h-12 shrink-0 rounded-2xl bg-slate-50 flex items-center justify-center text-xl shadow-inner group-hover:bg-indigo-50 transition-colors">
                                                🏢
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter leading-tight truncate">{ngo.name}</h3>
                                                <p className="text-[10px] text-slate-400 font-bold tracking-widest truncate">{ngo.email}</p>
                                            </div>
                                        </div>

                                        <div className="px-6 pb-6">
                                            <Link
                                                to={`/admin/ngo/${ngo._id}`}
                                                className="block w-full py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-black shadow-lg shadow-slate-900/10 active:scale-95 transition-all text-center"
                                            >
                                                View details
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Milestone Proofs Section (Tier 1 releases) */}
                    <section>
                        <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-4">
                            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Fund Release Queue</h2>
                            <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-1 rounded-md">{allMilestoneProjects.length}</span>
                        </div>
                        {allMilestoneProjects.length === 0 ? <p className="text-slate-400 font-bold uppercase text-[10px]">No pending releases</p> : (
                            <div className="grid grid-cols-1 gap-6">
                                {allMilestoneProjects.map(project => {
                                    const m = project.milestones.find(milestone => milestone.status === 'submitted');
                                    return (
                                        <div key={project._id} className="modern-card p-8 bg-white border-r-4 border-blue-500 flex flex-col md:flex-row gap-8">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[8px] font-black uppercase rounded-md">{project.itemType}</span>
                                                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">{project.title}</h3>
                                                </div>
                                                <p className="text-xs font-bold text-orange-500 uppercase mb-4">NGO: {project.ngoId?.name}</p>

                                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Milestone {m?.level} Evidence</p>
                                                    <a href={m?.proof} target="_blank" className="text-blue-600 font-bold text-sm block mb-2 hover:underline">View Proof Document 🔗</a>
                                                    {m?.level === 3 && (
                                                        <div className="mt-4 p-3 bg-white rounded-xl border border-blue-100 text-xs text-slate-600 italic">
                                                            "{m?.outcomeReport}"
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="w-full md:w-64 flex flex-col justify-center gap-3 border-l border-slate-50 pl-8">
                                                <p className="text-[10px] font-black text-slate-400 uppercase text-center mb-2">Escrow Decision</p>
                                                <button onClick={() => handleMilestoneReview(project._id, project.itemType, m.level, 'approve')} className="w-full py-4 bg-green-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-green-600 shadow-xl shadow-green-500/20">Release Funds</button>
                                                <button onClick={() => handleMilestoneReview(project._id, project.itemType, m.level, 'reject')} className="w-full py-4 bg-white border border-red-500 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-50">Block Release</button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    {/* Projects Section */}
                    <section>
                        <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-4">
                            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">AI-Flagged Projects</h2>
                            <span className="bg-slate-800 text-white text-[10px] font-black px-2 py-1 rounded-md">{pending.needs.length + pending.campaigns.length}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[...pending.needs.map(n => ({ ...n, type: 'need' })), ...pending.campaigns.map(c => ({ ...c, type: 'campaign' }))].map(item => (
                                <div key={item._id} className="modern-card p-0 bg-white overflow-hidden group border border-slate-100 flex flex-col">
                                    {/* Verdict Header */}
                                    <div className={`p-5 flex justify-between items-center ${item.aiVerdict?.includes('APPROVED') ? 'bg-green-500' :
                                        item.aiVerdict?.includes('FLAGGED') ? 'bg-red-500' : 'bg-slate-800'
                                        }`}>
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">🤖</span>
                                            <div>
                                                <p className="text-[8px] font-black text-white/60 uppercase tracking-widest leading-none mb-1">AI Decision</p>
                                                <h4 className="text-xs font-black text-white uppercase tracking-tight">{item.aiVerdict || 'ANALYZING...'}</h4>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[8px] font-black text-white/60 uppercase tracking-widest leading-none mb-1">Dynamic Score</p>
                                            <p className="text-xl font-black text-white leading-none">{item.aiScore}/100</p>
                                        </div>
                                    </div>

                                    {/* Breakdown Panel */}
                                    <div className="p-6 space-y-5 flex-1">
                                        <div>
                                            <h3 className="text-base font-black text-slate-800 uppercase tracking-tighter mb-1 leading-tight">{item.title}</h3>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.category} • {item.type}</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <p className="text-[9px] font-black text-green-500 uppercase tracking-widest">Why High</p>
                                                {item.aiWhyHigh ? (
                                                    item.aiWhyHigh.split(',').map((reason, idx) => (
                                                        <p key={idx} className="text-[10px] font-bold text-slate-600 flex items-start gap-1">
                                                            <span className="text-green-500">↑</span> {reason.trim()}
                                                        </p>
                                                    ))
                                                ) : <p className="text-[10px] text-slate-400 italic">No major boosts</p>}
                                            </div>
                                            <div className="space-y-2 border-l border-slate-100 pl-4">
                                                <p className="text-[9px] font-black text-red-400 uppercase tracking-widest">Why Not Higher</p>
                                                {item.aiWhyNotHigher ? (
                                                    item.aiWhyNotHigher.split(',').map((reason, idx) => (
                                                        <p key={idx} className="text-[10px] font-bold text-slate-600 flex items-start gap-1">
                                                            <span className="text-red-400">↓</span> {reason.trim()}
                                                        </p>
                                                    ))
                                                ) : <p className="text-[10px] text-slate-400 italic">Profile optimized</p>}
                                            </div>
                                        </div>

                                        <div className={`p-4 rounded-2xl border ${item.aiFraudStatus === 'HIGH RISK' ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                                            <div className="flex justify-between items-center mb-2">
                                                <p className={`text-[9px] font-black uppercase ${item.aiFraudStatus === 'HIGH RISK' ? 'text-red-400' : 'text-green-500'}`}>Fraud: {item.aiFraudStatus}</p>
                                                <p className="text-[8px] font-bold text-slate-400 italic">Isolation Forest Matrix</p>
                                            </div>
                                            <p className="text-[11px] font-bold text-slate-700 leading-tight">
                                                {item.aiOneFlag || 'No anomalies detected across 22 features.'}
                                            </p>
                                        </div>

                                        {item.aiSuggestion && (
                                            <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 border-dashed">
                                                <p className="text-[9px] font-black text-indigo-400 uppercase mb-1">AI Recommendation</p>
                                                <p className="text-[10px] font-bold text-indigo-700">{item.aiSuggestion}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Footer */}
                                    <div className="p-6 pt-0 flex gap-3">
                                        <button onClick={() => handleReview(item._id, item.type, 'approve')} className="flex-2 py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-black shadow-xl shadow-slate-900/10 active:scale-95 transition-all">Manual Override Approve</button>
                                        <button onClick={() => handleReview(item._id, item.type, 'reject')} className="flex-1 py-4 bg-white border border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 active:scale-95 transition-all">Decline</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            ) : (
                <div className="modern-card overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Admin</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Action</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Target</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {auditLogs.map(log => (
                                <tr key={log._id}>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-700">{log.adminId?.name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase ${log.action.includes('approve') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>{log.action.replace('_', ' ')}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{log.targetType}</td>
                                    <td className="px-6 py-4 text-xs text-slate-400">{new Date(log.createdAt).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
