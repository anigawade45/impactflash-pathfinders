import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { activityApi, escrowApi, impactApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Shield, Activity, Lock, Eye, CheckCircle2, Globe, Heart, FileCheck, ArrowRight } from 'lucide-react';

export default function NgoDashboard() {
    const { user: ngo } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('need'); // 'need', 'campaign', 'active', or 'impact'
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [activeProjects, setActiveProjects] = useState({ needs: [], campaigns: [] });
    const [impactStories, setImpactStories] = useState([]);

    const [needData, setNeedData] = useState({ title: '', category: '', description: '', urgency: 'medium', amount: '', beneficiaries: '', deadline: '', documents: null });
    const [campaignData, setCampaignData] = useState({ title: '', story: '', targetAmount: '', category: '', documents: null, photos: [] });

    useEffect(() => {
        if (!ngo) navigate('/login');
        if (activeTab === 'active') fetchMyProjects();
        if (activeTab === 'impact') fetchImpactStories();
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

    const fetchImpactStories = async () => {
        setLoading(true);
        try {
            const res = await impactApi.getNgoStories();
            if (res.success) setImpactStories(res.data);
        } catch (error) {
            console.error("Failed to fetch impact stories");
        } finally {
            setLoading(false);
        }
    };

    const handleMilestoneProof = async (itemId, level, itemType) => {
        const proofUrl = prompt('Enter proof image/document URL:');
        if (!proofUrl) return;

        let report = '';
        let deliveredBeneficiaries = null;
        let actualSpent = null;

        if (level === 3) {
            report = prompt('Enter final impact report text:');
            if (!report) return;
            deliveredBeneficiaries = prompt('Delivered Beneficiaries Count:');
            actualSpent = prompt('Actual Total Expenditure (₹):');
        }

        try {
            const res = await escrowApi.submitProof({
                itemId,
                level,
                itemType,
                proofUrl,
                report,
                deliveredBeneficiaries: deliveredBeneficiaries ? Number(deliveredBeneficiaries) : undefined,
                actualSpent: actualSpent ? Number(actualSpent) : undefined
            });
            if (res.success) {
                alert('Outcome details submitted. AI Analysis triggered.');
                fetchMyProjects();
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Submission failed.');
        }
    };

    if (!ngo) return null;

    return (
        <div className="max-w-7xl mx-auto mt-20 px-6 animate-fade-in pb-20">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 mb-16">
                <div>
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 text-white mb-6">
                        <Lock className="w-4 h-4 text-orange-400" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Zero-Trust NGO Command Center</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none mb-4 uppercase italic">Project <br />Management</h1>
                    <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-xl">Every project you launch is scored for urgency and audited for outcome fidelity by the Xavier AI engine.</p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 w-full lg:w-auto">
                    <div className="modern-card p-6 bg-white flex flex-col justify-between min-w-[180px] border-slate-200 shadow-xl shadow-slate-200/50">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Trust Score</p>
                        <p className={`text-4xl font-black ${ngo.trustScore >= 70 ? 'text-green-500' : 'text-orange-500'} tracking-tighter`}>{ngo.trustScore}/100</p>
                    </div>

                    <div className="modern-card p-6 bg-white flex flex-col justify-between min-w-[180px] border-slate-200 shadow-xl shadow-slate-200/50">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Impact Hub</p>
                        <p className="text-4xl font-black text-indigo-500 tracking-tighter">{ngo.impactScore}/100</p>
                    </div>

                    <div className="modern-card p-6 bg-slate-900 text-white flex flex-col justify-between min-w-[220px] col-span-2 lg:col-span-1 border-none shadow-2xl">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Verification State</p>
                        <div className="flex items-center gap-3 mb-2">
                            <span className={`w-3 h-3 rounded-full ${ngo.status === 'verified' ? 'bg-green-500' : ngo.status === 'rejected' ? 'bg-red-500' : 'bg-orange-500 animate-pulse'}`}></span>
                            <span className="text-xl font-black uppercase tracking-widest">{ngo.status === 'verified' ? 'ACTIVE' : ngo.status === 'rejected' ? 'REJECTED' : 'PENDING'}</span>
                        </div>
                        {ngo.status === 'rejected' && (
                            <p className="text-[9px] font-bold text-red-400 uppercase tracking-tighter leading-tight italic">Reason: {ngo.suspensionReason}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-4 bg-slate-100 p-2 rounded-3xl mb-16 w-fit mx-auto lg:mx-0 shadow-inner">
                {[
                    { id: 'need', label: 'Launch Need', icon: <Activity className="w-4 h-4" /> },
                    { id: 'campaign', label: 'New Campaign', icon: <Heart className="w-4 h-4" /> },
                    { id: 'active', label: 'Active Projects', icon: <Globe className="w-4 h-4" /> },
                    { id: 'impact', label: 'Impact Proofs', icon: <Shield className="w-4 h-4" /> }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-8 py-3.5 rounded-2xl text-[10px] font-black transition-all uppercase tracking-widest flex items-center gap-3 ${activeTab === tab.id ? 'bg-white shadow-xl shadow-slate-200/80 text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            <div className="min-h-[400px]">
                {activeTab === 'active' && (
                    <div className="grid grid-cols-1 gap-8">
                        {activeProjects.needs.concat(activeProjects.campaigns).length === 0 ? (
                            <div className="modern-card p-20 text-center text-slate-400 font-bold uppercase tracking-widest border-dashed border-2">No active projects found. Launch one now!</div>
                        ) : (
                            activeProjects.needs.concat(activeProjects.campaigns).map(project => (
                                <div key={project._id} className="modern-card p-8 bg-white border border-slate-200 hover:border-orange-200 transition-all group">
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${project.status === 'live' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{project.status}</span>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Project ID: #{project._id.substring(0, 8)}</span>
                                            </div>
                                            <h3 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">{project.title}</h3>
                                            <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest">Progress: <span className="text-orange-500">₹{project.fundsRaised.toLocaleString()}</span> / ₹{(project.amount || project.targetAmount).toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {[1, 2, 3].map(level => {
                                            const milestone = project.milestones?.find(m => m.level === level);
                                            return (
                                                <div key={level} className={`p-6 rounded-[2rem] border-2 transition-all ${milestone?.status === 'verified' ? 'bg-green-50/50 border-green-100' : milestone?.status === 'submitted' ? 'bg-orange-50/50 border-orange-100 animate-pulse' : 'bg-slate-50 border-slate-100'}`}>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Milestone {level}</p>
                                                    <p className="text-sm font-black text-slate-700 mb-6 uppercase leading-tight">{level === 1 ? '40% - Initiation' : level === 2 ? '40% - Midpoint' : '20% - Completion'}</p>

                                                    {milestone?.status === 'verified' ? (
                                                        <div className="inline-flex items-center gap-2 text-green-600 font-black text-[10px] uppercase tracking-widest">
                                                            <CheckCircle2 className="w-4 h-4" /> FUNDS RELEASED
                                                        </div>
                                                    ) : milestone?.status === 'submitted' ? (
                                                        <div className="inline-flex items-center gap-2 text-orange-600 font-black text-[10px] uppercase tracking-widest">
                                                            <Activity className="w-4 h-4" /> AI AUDITING...
                                                        </div>
                                                    ) : (
                                                        <button onClick={() => handleMilestoneProof(project._id, level, project.amount ? 'Need' : 'Campaign')} className="w-full py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black text-slate-600 hover:bg-slate-900 hover:text-white shadow-sm transition-all uppercase tracking-widest">SUBMIT PROOF</button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'impact' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {impactStories.length === 0 ? (
                            <div className="col-span-full modern-card p-20 text-center text-slate-400 font-bold uppercase tracking-widest border-dashed border-2">No impact stories generated yet. Complete milestones to trigger AI storytelling.</div>
                        ) : (
                            impactStories.map(story => (
                                <Link to={`/impact/${story._id}`} key={story._id}>
                                    <div className="modern-card p-1 group bg-white border border-slate-200 hover:border-orange-200 transition-all overflow-hidden h-full">
                                        <div className="aspect-video relative overflow-hidden rounded-[2.2rem]">
                                            <img src={story.photos?.[0]} alt={story.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                            <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 to-transparent"></div>
                                            <div className="absolute bottom-6 left-6 right-6">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="px-3 py-1 bg-orange-500 rounded-lg text-[9px] font-black text-white uppercase tracking-widest">Story Published</div>
                                                    <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[9px] font-black text-white uppercase tracking-widest">Score: {story.aiValidation?.score}%</div>
                                                </div>
                                                <h4 className="text-xl font-black text-white leading-tight uppercase tracking-tight">{story.title}</h4>
                                            </div>
                                        </div>
                                        <div className="p-8">
                                            <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6 line-clamp-2 italic">"{story.summary}"</p>
                                            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                                <div className="flex items-center gap-4">
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Beneficiaries</p>
                                                        <p className="text-lg font-black text-slate-900 tracking-tighter">{story.beneficiaryCount}</p>
                                                    </div>
                                                </div>
                                                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-orange-500 group-hover:text-white transition-all">
                                                    <ArrowRight className="w-5 h-5" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                )}

                {(activeTab === 'need' || activeTab === 'campaign') && (
                    <div className="modern-card p-12 bg-white relative overflow-hidden border-slate-200 shadow-2xl shadow-slate-200/50">
                        {ngo.status !== 'verified' && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-10 text-center">
                                <div className="w-20 h-20 bg-slate-900 text-white rounded-3xl flex items-center justify-center text-3xl mb-6 shadow-2xl rotate-12">🔒</div>
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-4 italic">Command Locked</h3>
                                <p className="text-sm font-bold text-slate-400 max-w-sm leading-relaxed uppercase tracking-tighter">
                                    Launch sequences are disabled until AI Verification of your FCRA & PAN records is finalized.
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
                            }} className="space-y-8">
                                <div className="mb-10 border-b border-slate-50 pb-6">
                                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Node Submission</h2>
                                    <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                                        Critical Asset Acquisition Form
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fulfillment Title</label>
                                        <input required type="text" value={needData.title} onChange={(e) => setNeedData({ ...needData, title: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-400 transition-all font-bold" placeholder="e.g. 100 Oxygen Cylinders" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Classification</label>
                                        <select required value={needData.category} onChange={(e) => setNeedData({ ...needData, category: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-400 transition-all font-bold">
                                            <option value="">Select Domain</option>
                                            {ngo.workingAreas?.map((area, index) => (
                                                <option key={index} value={area}>{area}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount (₹)</label>
                                        <input required type="number" value={needData.amount} onChange={(e) => setNeedData({ ...needData, amount: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Impact Reach</label>
                                        <input required type="number" value={needData.beneficiaries} onChange={(e) => setNeedData({ ...needData, beneficiaries: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Urgency Lvl</label>
                                        <select value={needData.urgency} onChange={(e) => setNeedData({ ...needData, urgency: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold">
                                            <option value="low">Standard</option>
                                            <option value="medium">Priority</option>
                                            <option value="high">Critical</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Window End</label>
                                        <input type="date" value={needData.deadline} onChange={(e) => setNeedData({ ...needData, deadline: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Context / Narrative</label>
                                    <textarea required value={needData.description} onChange={(e) => setNeedData({ ...needData, description: e.target.value })} rows="4" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl resize-none font-medium text-slate-600 italic" placeholder="Provide raw context for the NLP urgency analyzer..."></textarea>
                                </div>

                                <div className="p-8 bg-slate-50 rounded-3xl border border-slate-200 border-dashed">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Evidence Bundle (PDF/Image)</label>
                                    <input type="file" accept=".pdf,image/*" onChange={(e) => setNeedData({ ...needData, documents: e.target.files[0] })} className="w-full cursor-pointer file:mr-6 file:py-3 file:px-8 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:bg-slate-900 file:text-white file:uppercase file:tracking-widest hover:file:bg-orange-600 transition-all" />
                                    {needData.documents && <p className="mt-4 text-[9px] font-black text-indigo-600 uppercase tracking-[0.2em] animate-pulse">Linked: {needData.documents.name}</p>}
                                </div>

                                <button type="submit" disabled={loading || ngo.status !== 'verified'} className="w-full py-6 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-[0.4em] hover:bg-orange-600 hover:shadow-2xl hover:shadow-orange-500/30 transition-all active:scale-95 disabled:grayscale">
                                    {loading ? 'AI Inference in Progress...' : 'Initialize Launch Sequence'}
                                </button>
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
                            }} className="space-y-8">
                                <div className="mb-10 border-b border-slate-50 pb-6">
                                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Immediate Fundraising</h2>
                                    <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                                        Fast-Response Capital Injection
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Campaign Identity</label>
                                        <input required type="text" value={campaignData.title} onChange={(e) => setCampaignData({ ...campaignData, title: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" placeholder="Critical Surgery Relief / Disaster Kit" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Domain</label>
                                            <select required value={campaignData.category} onChange={(e) => setCampaignData({ ...campaignData, category: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold">
                                                <option value="">Select Category</option>
                                                {ngo.workingAreas?.map((area, index) => (
                                                    <option key={index} value={area}>{area}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Goal (₹)</label>
                                            <input required type="number" value={campaignData.targetAmount} onChange={(e) => setCampaignData({ ...campaignData, targetAmount: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">The Narrative Engine</label>
                                    <textarea required value={campaignData.story} onChange={(e) => setCampaignData({ ...campaignData, story: e.target.value })} rows="6" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl resize-none font-medium text-slate-600 italic" placeholder="Enter the story for public outreach..."></textarea>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="p-8 bg-slate-50 rounded-3xl border border-slate-200 border-dashed hover:border-indigo-400 transition-colors">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><FileCheck className="w-4 h-4" /> Case Evidence (PDF)</label>
                                        <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setCampaignData({ ...campaignData, documents: e.target.files[0] })} className="w-full text-[10px] font-black uppercase tracking-widest file:bg-slate-900 file:text-white file:border-0 file:rounded-xl file:px-6 file:py-3 file:mr-4 cursor-pointer" />
                                    </div>
                                    <div className="p-8 bg-slate-50 rounded-3xl border border-slate-200 border-dashed hover:border-orange-400 transition-colors">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Globe className="w-4 h-4" /> Media Assets (Images)</label>
                                        <input type="file" multiple accept="image/*" onChange={(e) => setCampaignData({ ...campaignData, photos: e.target.files })} className="w-full text-[10px] font-black uppercase tracking-widest file:bg-slate-900 file:text-white file:border-0 file:rounded-xl file:px-6 file:py-3 file:mr-4 cursor-pointer" />
                                    </div>
                                </div>

                                <button type="submit" disabled={loading || ngo.status !== 'verified'} className="w-full py-6 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-[0.4em] hover:bg-indigo-600 hover:shadow-2xl hover:shadow-indigo-500/30 transition-all active:scale-95 disabled:grayscale">
                                    {loading ? 'AI Campaign Genesis...' : 'Broadcasting Immediate Need'}
                                </button>
                            </form>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
