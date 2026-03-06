import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { activityApi, escrowApi } from '../api';
import { useAuth } from '../context/AuthContext';

export default function NgoDashboard() {
    const { user: ngo } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('need'); // 'need', 'campaign', or 'active'
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [activeProjects, setActiveProjects] = useState({ needs: [], campaigns: [] });

    const [needData, setNeedData] = useState({ title: '', description: '', urgency: 'medium', amount: '', beneficiaries: '', deadline: '', documents: '' });
    const [campaignData, setCampaignData] = useState({ title: '', story: '', targetAmount: '', photos: '', emotionalAppeal: 'Logical/Factual' });

    useEffect(() => {
        if (!ngo) navigate('/login');
        if (activeTab === 'active') fetchMyProjects();
    }, [ngo, navigate, activeTab]);

    const fetchMyProjects = async () => {
        setLoading(true);
        try {
            const res = await activityApi.getMyActivities();
            if (res.success) {
                setActiveProjects({
                    needs: res.needs,
                    campaigns: res.campaigns
                });
            }
        } catch (error) {
            setErrorMsg('Failed to fetch projects.');
        } finally {
            setLoading(false);
        }
    };

    const handleMilestoneProof = async (itemId, level, itemType) => {
        const proofUrl = prompt('Enter proof image/document URL:');
        if (!proofUrl) return;

        let report = '';
        if (level === 3) {
            report = prompt('Enter final impact report text:');
            if (!report) return;
        }

        try {
            const res = await escrowApi.submitProof({ itemId, level, itemType, proofUrl, report });
            if (res.success) {
                alert('Proof submitted for admin verification.');
                fetchMyProjects();
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Submission failed.');
        }
    };

    if (!ngo) return null;

    return (
        <div className="max-w-5xl mx-auto mt-20 px-4 animate-fade-in pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">NGO Command Center</h1>
                    <p className="text-slate-500 mt-2">Manage your humanitarian activities and registration status.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="modern-card p-4 bg-white flex flex-col items-center min-w-[120px]">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Trust Score</p>
                        <p className={`text-2xl font-black ${ngo.trustScore >= 70 ? 'text-green-500' : 'text-orange-500'}`}>{ngo.trustScore}/100</p>
                    </div>

                    <div className="modern-card p-4 bg-white flex flex-col min-w-[200px]">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Onboarding Decision</p>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${ngo.status === 'verified' ? 'bg-green-500' : ngo.status === 'rejected' ? 'bg-red-500' : 'bg-orange-500 animate-pulse'}`}></div>
                            <p className="text-sm font-black uppercase tracking-widest text-slate-800">{ngo.status === 'verified' ? 'Approved' : ngo.status === 'rejected' ? 'Rejected' : 'Under Review'}</p>
                        </div>
                        {ngo.status === 'rejected' && (
                            <p className="text-[9px] font-bold text-red-400 mt-2 uppercase tracking-tighter leading-none">
                                Reason: {ngo.suspensionReason || 'Insufficient details / Verification failed'}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl modern-card-inset mb-12 w-fit mx-auto">
                {['need', 'campaign', 'active'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${activeTab === tab ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}>
                        {tab === 'active' ? 'Active Projects' : `New ${tab}`}
                    </button>
                ))}
            </div>

            {activeTab === 'active' ? (
                <div className="grid grid-cols-1 gap-8">
                    {activeProjects.needs.concat(activeProjects.campaigns).length === 0 ? (
                        <div className="modern-card p-20 text-center text-slate-400 font-bold">No active projects found. Launch one now!</div>
                    ) : (
                        activeProjects.needs.concat(activeProjects.campaigns).map(project => (
                            <div key={project._id} className="modern-card p-6 bg-white">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800">{project.title}</h3>
                                        <p className="text-sm text-slate-400 mt-1 uppercase font-bold">Progress: ₹{project.fundsRaised.toLocaleString()} / ₹{(project.amount || project.targetAmount).toLocaleString()}</p>
                                    </div>
                                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${project.status === 'live' ? 'bg-green-100 text-green-700' :
                                        project.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                                            project.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                'bg-blue-100 text-blue-700'
                                        }`}>{project.status}</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[1, 2, 3].map(level => {
                                        const milestone = project.milestones?.find(m => m.level === level);
                                        return (
                                            <div key={level} className={`p-4 rounded-2xl border-2 transition-all ${milestone?.status === 'verified' ? 'bg-green-50/50 border-green-100' : milestone?.status === 'submitted' ? 'bg-blue-50/50 border-blue-100' : 'bg-slate-50 border-slate-100'}`}>
                                                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Milestone {level}</p>
                                                <p className="text-xs font-bold text-slate-700 mb-4">{level === 1 ? '40% - Initiation' : level === 2 ? '40% - Midpoint' : '20% - Completion'}</p>

                                                {milestone?.status === 'verified' ? (
                                                    <div className="text-green-600 font-black text-[10px] flex items-center gap-2">✅ FUNDS RELEASED</div>
                                                ) : milestone?.status === 'submitted' ? (
                                                    <div className="text-blue-600 font-black text-[10px] flex items-center gap-2">⏳ UNDER REVIEW</div>
                                                ) : (
                                                    <button onClick={() => handleMilestoneProof(project._id, level, project.amount ? 'Need' : 'Campaign')} className="w-full py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 hover:bg-slate-50 shadow-sm transition-all">SUBMIT PROOF</button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className="modern-card p-10 bg-white">
                    {/* ... Existing forms (summarized for briefness in this thought but I'll write the full code) ... */}
                    {activeTab === 'need' ? (
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            setLoading(true); setResult(null); setErrorMsg('');
                            try {
                                const res = await activityApi.submitNeed({ ngoId: ngo._id, ...needData });
                                if (res.success) { setResult(res.data); setNeedData({ title: '', description: '', urgency: 'medium', amount: '', beneficiaries: '', deadline: '', documents: '' }); }
                                else setErrorMsg(res.message);
                            } catch (err) { setErrorMsg(err.response?.data?.message || 'Submission failed.'); }
                            finally { setLoading(false); }
                        }} className="space-y-6">
                            <div className="mb-6 border-b border-slate-100 pb-4">
                                <h2 className="text-2xl font-bold text-slate-800">Immediate Need</h2>
                                <p className="text-sm text-slate-500 mt-1">For urgent, specific requirements (e.g. 50 blankets for winter).</p>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Title</label>
                                <input required type="text" value={needData.title} onChange={(e) => setNeedData({ ...needData, title: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-400" />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div><label className="block text-sm font-semibold text-slate-700 mb-2">Amount (₹)</label><input required type="number" value={needData.amount} onChange={(e) => setNeedData({ ...needData, amount: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl" /></div>
                                <div><label className="block text-sm font-semibold text-slate-700 mb-2">Beneficiaries</label><input required type="number" value={needData.beneficiaries} onChange={(e) => setNeedData({ ...needData, beneficiaries: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl" /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div><label className="block text-sm font-semibold text-slate-700 mb-2">Urgency</label><select value={needData.urgency} onChange={(e) => setNeedData({ ...needData, urgency: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
                                <div><label className="block text-sm font-semibold text-slate-700 mb-2">Deadline</label><input type="date" value={needData.deadline} onChange={(e) => setNeedData({ ...needData, deadline: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl" /></div>
                            </div>
                            <div><label className="block text-sm font-semibold text-slate-700 mb-2">Description</label><textarea required value={needData.description} onChange={(e) => setNeedData({ ...needData, description: e.target.value })} rows="4" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl resize-none"></textarea></div>
                            <button type="submit" disabled={loading} className="w-full btn-primary py-4 text-sm font-bold uppercase tracking-widest">{loading ? 'AI Reviewing...' : 'Submit to AI Engine'}</button>
                        </form>
                    ) : (
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            setLoading(true); setResult(null); setErrorMsg('');
                            try {
                                const res = await activityApi.createCampaign({ ngoId: ngo._id, ...campaignData });
                                if (res.success) { setResult(res.data); setCampaignData({ title: '', story: '', targetAmount: '', photos: '', emotionalAppeal: 'Logical/Factual' }); }
                                else setErrorMsg(res.message);
                            } catch (err) { setErrorMsg(err.response?.data?.message || 'Creation failed.'); }
                            finally { setLoading(false); }
                        }} className="space-y-6">
                            <div className="mb-6 border-b border-slate-100 pb-4">
                                <h2 className="text-2xl font-bold text-slate-800">Long-Term Campaign</h2>
                                <p className="text-sm text-slate-500 mt-1">For ongoing humanitarian projects with larger goals.</p>
                            </div>
                            <div><label className="block text-sm font-semibold text-slate-700 mb-2">Title</label><input required type="text" value={campaignData.title} onChange={(e) => setCampaignData({ ...campaignData, title: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl" /></div>
                            <div className="grid grid-cols-2 gap-6">
                                <div><label className="block text-sm font-semibold text-slate-700 mb-2">Target Amount (₹)</label><input required type="number" value={campaignData.targetAmount} onChange={(e) => setCampaignData({ ...campaignData, targetAmount: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl" /></div>
                                <div><label className="block text-sm font-semibold text-slate-700 mb-2">Style</label><select value={campaignData.emotionalAppeal} onChange={(e) => setCampaignData({ ...campaignData, emotionalAppeal: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl"><option value="Logical/Factual">Logical</option><option value="Empathetic">Empathetic</option><option value="Urgent">Urgent</option></select></div>
                            </div>
                            <div><label className="block text-sm font-semibold text-slate-700 mb-2">Campaign Story</label><textarea required value={campaignData.story} onChange={(e) => setCampaignData({ ...campaignData, story: e.target.value })} rows="6" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl resize-none"></textarea></div>
                            <button type="submit" disabled={loading} className="w-full btn-primary py-4 text-sm font-bold uppercase tracking-widest">{loading ? 'AI Processing...' : 'Launch Impact Campaign'}</button>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
}
