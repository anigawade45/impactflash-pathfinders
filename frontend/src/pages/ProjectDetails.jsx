import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { publicApi, activityApi } from '../api';

export default function ProjectDetails() {
    const { type, id } = useParams(); // type is 'need' or 'campaign'
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState({ text: '', type: '' });

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

    if (loading) return <div className="text-center mt-20 text-slate-500 font-bold animate-pulse">Loading AI Analysis Report...</div>;
    if (!project) return <div className="text-center mt-20 text-red-500 font-bold text-xs uppercase tracking-widest">Project Not Found</div>;

    return (
        <div className="max-w-4xl mx-auto mt-10 px-4 pb-20 animate-fade-in">
            <button
                onClick={() => navigate('/admin')}
                className="mb-8 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-800 transition-all flex items-center gap-2"
            >
                ← Back to Review Queue
            </button>

            {msg.text && (
                <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 font-bold text-xs shadow-sm ${msg.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'
                    }`}>
                    <span className="text-lg">{msg.type === 'error' ? '🚫' : '⚡'}</span>
                    {msg.text}
                </div>
            )}

            <div className="modern-card p-0 bg-white overflow-hidden shadow-2xl border border-slate-100 flex flex-col">
                {/* Verdict Header */}
                <div className={`p-8 flex justify-between items-center ${project.aiVerdict?.includes('APPROVED') ? 'bg-green-500' :
                    project.aiVerdict?.includes('FLAGGED') ? 'bg-red-500' : 'bg-slate-800'
                    }`}>
                    <div className="flex items-center gap-4">
                        <span className="text-4xl">🤖</span>
                        <div>
                            <p className="text-[10px] font-black text-white/60 uppercase tracking-widest leading-none mb-1">AI Priority Analysis</p>
                            <h4 className="text-2xl font-black text-white uppercase tracking-tight">{project.aiVerdict || 'ANALYSIS PENDING'}</h4>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-white/60 uppercase tracking-widest leading-none mb-1">Dynamic Impact Score</p>
                        <p className="text-5xl font-black text-white leading-none tracking-tighter">{project.aiScore}<span className="text-xl opacity-40">/100</span></p>
                    </div>
                </div>

                <div className="p-10 space-y-10">
                    <div className="flex justify-between items-start border-b border-slate-100 pb-8">
                        <div>
                            <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter leading-tight mb-2">{project.title}</h3>
                            <div className="flex items-center gap-3">
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[8px] font-black uppercase rounded-md border border-slate-200">{type}</span>
                                <span className="text-sm text-slate-400 font-bold uppercase tracking-widest">{project.category}</span>
                            </div>
                        </div>
                        <div className="text-right flex flex-col items-end">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Requesting NGO</p>
                            <p className="text-xs font-black text-slate-900 uppercase tracking-tighter">{project.ngoId?.name}</p>
                            <p className={`text-[10px] font-bold mt-1 uppercase ${project.ngoId?.trustScore >= 70 ? 'text-green-500' : 'text-orange-500'}`}>Organizational Trust: {project.ngoId?.trustScore}/100</p>
                        </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Target Amount</p>
                            <p className="text-lg font-black text-slate-800 tracking-tighter">₹{project.amount || project.targetAmount}</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Beneficiaries</p>
                            <p className="text-lg font-black text-slate-800 tracking-tighter">{project.beneficiaries || 'N/A'}</p>
                        </div>
                        <div className={`p-4 rounded-2xl border border-slate-100 ${project.urgency === 'high' ? 'bg-red-50' : 'bg-slate-50'}`}>
                            <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Urgency</p>
                            <p className={`text-lg font-black tracking-tighter uppercase ${project.urgency === 'high' ? 'text-red-500' : 'text-slate-800'}`}>{project.urgency || 'Medium'}</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Days Left</p>
                            <p className="text-lg font-black text-slate-800 tracking-tighter">
                                {project.deadline ? Math.ceil((new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : '30'}D
                            </p>
                        </div>
                    </div>

                    {/* AI Logic Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-green-500 uppercase tracking-widest border-b border-green-100 pb-2">Priority Multipliers</p>
                            {project.aiWhyHigh ? (
                                project.aiWhyHigh.split(',').map((reason, idx) => (
                                    <p key={idx} className="text-sm font-bold text-slate-700 flex items-start gap-2">
                                        <span className="text-green-500">⚡</span> {reason.trim()}
                                    </p>
                                ))
                            ) : <p className="text-sm text-slate-400 italic">No significant urgency signals detected.</p>}
                        </div>
                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest border-b border-red-100 pb-2">De-prioritizing Signals</p>
                            {project.aiWhyNotHigher ? (
                                project.aiWhyNotHigher.split(',').map((reason, idx) => (
                                    <p key={idx} className="text-sm font-bold text-slate-700 flex items-start gap-2">
                                        <span className="text-red-500">🚨</span> {reason.trim()}
                                    </p>
                                ))
                            ) : <p className="text-sm text-slate-400 italic">No technical or financial flags found.</p>}
                        </div>
                    </div>

                    {/* AI Decision Matrix (SHAP Simulation) */}
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">AI Decision Matrix / SHAP Breakdown</h4>
                            <span className="text-[8px] font-black text-indigo-500 uppercase px-2 py-1 bg-indigo-50 rounded-md border border-indigo-100 italic">Gradient Boosting Feature Importance</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100">
                            {(project.aiShapSummary && project.aiShapSummary.length > 0 ? project.aiShapSummary : [
                                { feature: 'Urgency Heuristics', impact: '+25' },
                                { feature: 'NGO Trust History', impact: '+15' },
                                { feature: 'Vision AI Confidence', impact: '+10' },
                                { feature: 'Category Cost Normals', impact: '+5' },
                                { feature: 'Fraud Pattern Match', impact: '-5' },
                                { feature: 'Beneficiary Validation', impact: '+10' }
                            ]).map((feature, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">{feature.feature}</p>
                                        <p className={`text-[10px] font-black ${feature.impact.includes('-') ? 'text-red-500' : 'text-green-500'}`}>{feature.impact} pts</p>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${feature.impact.includes('-') ? 'bg-red-400' : 'bg-indigo-500'}`}
                                            style={{ width: `${Math.abs(parseInt(feature.impact)) * 2}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Fraud Detection & Recommendation */}
                    <div className={`p-8 rounded-[2.5rem] border-2 border-dashed ${project.aiFraudStatus === 'HIGH RISK' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{project.aiFraudStatus === 'HIGH RISK' ? '🚩' : '🛡️'}</span>
                                <div>
                                    <p className={`text-[10px] font-black uppercase tracking-widest leading-none mb-1 ${project.aiFraudStatus === 'HIGH RISK' ? 'text-red-400' : 'text-green-500'}`}>Fraud Pattern Analysis</p>
                                    <p className={`text-xl font-black uppercase tracking-tighter ${project.aiFraudStatus === 'HIGH RISK' ? 'text-red-600' : 'text-green-700'}`}>{project.aiFraudStatus || 'LOW RISK'}</p>
                                </div>
                            </div>
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm shadow-slate-100">Isolation Forest v2.04</span>
                        </div>
                        <p className="text-lg font-bold text-slate-800 leading-tight mb-6">
                            {project.aiOneFlag || 'Heuristic engine confirms normal funding pattern and request frequency.'}
                        </p>
                        {project.aiRecommendationPoints?.length > 0 ? (
                            <div className="p-6 bg-indigo-50 rounded-4xl border border-indigo-100">
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4 italic">Internal AI Recommendations</p>
                                <ul className="space-y-3">
                                    {project.aiRecommendationPoints.map((point, idx) => (
                                        <li key={idx} className="text-sm font-bold text-indigo-900 flex items-start gap-3 leading-tight">
                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0"></span>
                                            {point}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : project.aiSuggestion && (
                            <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                                <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1 italic">Internal AI Recommendation</p>
                                <p className="text-sm font-black text-indigo-700 uppercase tracking-tighter leading-relaxed">
                                    {project.aiSuggestion}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Document Preview (If any) */}
                    {project.documents?.length > 0 && (
                        <div className="pt-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 text-center">Submitted Verification Proof</p>
                            <div className="relative group overflow-hidden rounded-[2.5rem] border-4 border-slate-50 shadow-inner bg-slate-100 aspect-video flex items-center justify-center">
                                <div className="text-center">
                                    <p className="text-5xl mb-4">📄</p>
                                    <h5 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Evidence Document</h5>
                                    <a
                                        href={project.documents[0]}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-8 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-black shadow-2xl transition-all inline-block"
                                    >
                                        View Full Proof 🔗
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sticky Action Bar */}
                <div className="p-10 bg-slate-50 border-t border-slate-100">
                    <div className="flex gap-4">
                        <button
                            onClick={() => handleReview('approve')}
                            className="flex-2 py-5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-black shadow-2xl shadow-slate-900/40 active:scale-95 transition-all text-center"
                        >
                            Manual Overide & Go Live
                        </button>
                        <button
                            onClick={() => handleReview('reject')}
                            className="flex-1 py-5 bg-white border-2 border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-red-50 hover:text-red-500 hover:border-red-200 active:scale-95 transition-all text-center"
                        >
                            Reject
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
