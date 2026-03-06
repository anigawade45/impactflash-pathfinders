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

    const [needData, setNeedData] = useState({ title: '', category: '', description: '', urgency: 'medium', amount: '', beneficiaries: '', deadline: '', documents: null });
    const [campaignData, setCampaignData] = useState({ title: '', story: '', targetAmount: '', category: '', documents: null, photos: [] });

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

                    <div className="modern-card p-4 bg-white flex flex-col items-center min-w-[120px]">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Impact Score</p>
                        <p className="text-2xl font-black text-indigo-500">{ngo.impactScore}/100</p>
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

            {/* Verification Status Banner */}
            {ngo.status !== 'verified' && (
                <div className={`mb-10 p-6 rounded-[2.5rem] border-2 border-dashed flex items-center justify-between transition-all ${ngo.status === 'rejected' ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200 animate-pulse-subtle'}`}>
                    <div className="flex items-center gap-4">
                        <span className="text-3xl">{ngo.status === 'rejected' ? '🚫' : '⏳'}</span>
                        <div>
                            <h4 className={`text-sm font-black uppercase tracking-widest ${ngo.status === 'rejected' ? 'text-red-600' : 'text-orange-600'}`}>
                                {ngo.status === 'rejected' ? 'Application Rejected' : 'Account Verification Pending'}
                            </h4>
                            <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-tighter">
                                {ngo.status === 'rejected'
                                    ? `Your registration was declined: ${ngo.suspensionReason || 'Data mismatch detected'}.`
                                    : 'You are in restricted mode. Once verified, you can launch fundraising activities.'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl modern-card-inset mb-12 w-fit mx-auto">
                <button onClick={() => setActiveTab('need')}
                    className={`px-8 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${activeTab === 'need' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}>
                    New Need
                </button>
                <button onClick={() => setActiveTab('campaign')}
                    className={`px-8 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${activeTab === 'campaign' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}>
                    Immediate Fundraising
                </button>
                <button onClick={() => setActiveTab('active')}
                    className={`px-8 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${activeTab === 'active' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}>
                    Active Projects
                </button>
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
                <div className="modern-card p-10 bg-white relative overflow-hidden">
                    {ngo.status !== 'verified' && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-10 text-center">
                            <div className="w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center text-2xl mb-4 shadow-xl">🔒</div>
                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter mb-2">Feature Restricted</h3>
                            <p className="text-sm font-bold text-slate-400 max-w-xs leading-relaxed uppercase tracking-tighter">
                                You cannot create {activeTab}s until your organization is fully verified by our administration.
                            </p>
                        </div>
                    )}
                    {activeTab === 'need' ? (
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            setLoading(true); setResult(null); setErrorMsg('');
                            try {
                                const data = new FormData();
                                Object.keys(needData).forEach(key => {
                                    if (key === 'documents' && needData[key]) {
                                        data.append('documents', needData[key]);
                                    } else if (needData[key] !== null) {
                                        data.append(key, needData[key]);
                                    }
                                });
                                data.append('ngoId', ngo._id);

                                const res = await activityApi.submitNeed(data);
                                if (res.success) {
                                    setResult(res.data);
                                    setNeedData({ title: '', category: '', description: '', urgency: 'medium', amount: '', beneficiaries: '', deadline: '', documents: null });
                                }
                                else setErrorMsg(res.message);
                            } catch (err) { setErrorMsg(err.response?.data?.message || 'Submission failed.'); }
                            finally { setLoading(false); }
                        }} className="space-y-6">
                            <div className="mb-6 border-b border-slate-100 pb-4">
                                <h2 className="text-2xl font-bold text-slate-800">Your Need</h2>
                                <p className="text-sm text-slate-500 mt-1">For urgent, specific requirements (e.g. 50 blankets for winter).</p>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Title</label>
                                <input required type="text" value={needData.title} onChange={(e) => setNeedData({ ...needData, title: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-400" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                                <select required value={needData.category} onChange={(e) => setNeedData({ ...needData, category: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-400">
                                    <option value="">Select Category</option>
                                    {ngo.workingAreas?.map((area, index) => (
                                        <option key={index} value={area}>{area}</option>
                                    ))}
                                </select>
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
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Verification Document (PDF/Image)</label>
                                <input
                                    type="file"
                                    accept=".pdf,image/*"
                                    onChange={(e) => setNeedData({ ...needData, documents: e.target.files[0] })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer"
                                />
                                {needData.documents && (
                                    <p className="mt-2 text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1">
                                        📄 {needData.documents.name} selected
                                    </p>
                                )}
                                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase italic tracking-tighter">AI Processing: Verified documents boost Impact Score by 1.5x and speed up manual review.</p>
                            </div>
                            <button type="submit" disabled={loading || ngo.status !== 'verified'} className="w-full btn-primary py-4 text-sm font-bold uppercase tracking-widest">{loading ? 'AI Reviewing...' : 'Submit to AI Engine'}</button>
                        </form>
                    ) : (
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            setLoading(true); setResult(null); setErrorMsg('');
                            try {
                                const data = new FormData();
                                data.append('ngoId', ngo._id);
                                data.append('title', campaignData.title);
                                data.append('category', campaignData.category);
                                data.append('targetAmount', campaignData.targetAmount);
                                data.append('story', campaignData.story);

                                if (campaignData.documents) data.append('documents', campaignData.documents);
                                if (campaignData.photos && campaignData.photos.length > 0) {
                                    Array.from(campaignData.photos).forEach(file => data.append('photos', file));
                                }

                                const res = await activityApi.createCampaign(data);
                                if (res.success) {
                                    setResult(res.data);
                                    setCampaignData({ title: '', story: '', targetAmount: '', category: '', documents: null, photos: [] });
                                }
                                else setErrorMsg(res.message);
                            } catch (err) { setErrorMsg(err.response?.data?.message || 'Creation failed.'); }
                            finally { setLoading(false); }
                        }} className="space-y-6">
                            <div className="mb-6 border-b border-slate-100 pb-4">
                                <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-tighter italic">Immediate Fundraising</h2>
                                <p className="text-sm text-slate-500 mt-1">Raise funds for emergencies like accidents, medical crises, or disaster relief.</p>
                            </div>
                            <div><label className="block text-sm font-semibold text-slate-700 mb-2">Fundraising Title</label><input required type="text" value={campaignData.title} onChange={(e) => setCampaignData({ ...campaignData, title: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl" placeholder="e.g., Emergency Liver Transplant for Kumar" /></div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                                    <select required value={campaignData.category} onChange={(e) => setCampaignData({ ...campaignData, category: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl">
                                        <option value="">Select Category</option>
                                        {ngo.workingAreas?.map((area, index) => (
                                            <option key={index} value={area}>{area}</option>
                                        ))}
                                    </select>
                                </div>
                                <div><label className="block text-sm font-semibold text-slate-700 mb-2">Goal Amount (₹)</label><input required type="number" value={campaignData.targetAmount} onChange={(e) => setCampaignData({ ...campaignData, targetAmount: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl" /></div>
                            </div>

                            <div><label className="block text-sm font-semibold text-slate-700 mb-2">Description / Case Study</label><textarea required value={campaignData.story} onChange={(e) => setCampaignData({ ...campaignData, story: e.target.value })} rows="6" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl resize-none" placeholder="Provide details about the emergency..."></textarea></div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Case Documents (PDF/Doc)</label>
                                    <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setCampaignData({ ...campaignData, documents: e.target.files[0] })} className="w-full text-xs file:bg-slate-100 file:border-0 file:rounded-xl file:px-4 file:py-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Case Photos (Multiple Images)</label>
                                    <input type="file" multiple accept="image/*" onChange={(e) => setCampaignData({ ...campaignData, photos: e.target.files })} className="w-full text-xs file:bg-slate-100 file:border-0 file:rounded-xl file:px-4 file:py-2" />
                                </div>
                            </div>

                            <p className="text-[10px] font-black text-slate-400 uppercase italic tracking-widest text-center">Note: Immediate fundraising expires in 15 days.</p>

                            <button type="submit" disabled={loading || ngo.status !== 'verified'} className="w-full py-4 bg-slate-900 text-white rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-black transition-all">
                                {loading ? 'AI Launching Campaign...' : 'Launch Immediate Fundraising'}
                            </button>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
}
