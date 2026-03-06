import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { publicApi, activityApi } from '../api';

export default function NgoDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ngo, setNgo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState({ text: '', type: '' });

    useEffect(() => {
        fetchNgo();
    }, [id]);

    const fetchNgo = async () => {
        setLoading(true);
        try {
            const res = await publicApi.getNgoById(id);
            if (res.success) {
                setNgo(res.data);
            }
        } catch (error) {
            setMsg({ text: 'Failed to fetch NGO details.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async (action) => {
        setMsg({ text: '', type: '' });
        try {
            const res = await activityApi.reviewItem(ngo._id, 'ngo', action);
            if (res.success) {
                setMsg({ text: res.message || 'Action completed.', type: 'success' });
                setTimeout(() => navigate('/admin'), 1500);
            }
        } catch (error) {
            setMsg({ text: error.response?.data?.message || 'Error updating status', type: 'error' });
        }
    };

    if (loading) return <div className="text-center mt-20 text-slate-500 font-bold animate-pulse">Loading Verification Report...</div>;
    if (!ngo) return <div className="text-center mt-20 text-red-500 font-bold">NGO Not Found</div>;

    return (
        <div className="max-w-4xl mx-auto mt-10 px-4 pb-20 animate-fade-in">
            <button
                onClick={() => navigate('/admin')}
                className="mb-8 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-800 transition-all flex items-center gap-2"
            >
                ← Back to Queue
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
                <div className={`p-8 flex justify-between items-center ${ngo.aiVerdict?.includes('APPROVED') ? 'bg-green-500' :
                    ngo.aiVerdict?.includes('FLAGGED') ? 'bg-red-500' : 'bg-slate-800'
                    }`}>
                    <div className="flex items-center gap-4">
                        <span className="text-4xl">🤖</span>
                        <div>
                            <p className="text-[10px] font-black text-white/60 uppercase tracking-widest leading-none mb-1">AI Trust Vetting Analysis</p>
                            <h4 className="text-2xl font-black text-white uppercase tracking-tight">{ngo.aiVerdict || 'IN REVIEW'}</h4>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-white/60 uppercase tracking-widest leading-none mb-1">Final Auth Score</p>
                        <p className="text-5xl font-black text-white leading-none tracking-tighter">{ngo.trustScore}<span className="text-xl opacity-40">/100</span></p>
                    </div>
                </div>

                <div className="p-10 space-y-10">
                    <div className="flex justify-between items-end border-b border-slate-100 pb-8">
                        <div>
                            <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter leading-tight mb-1">{ngo.name}</h3>
                            <p className="text-sm text-slate-400 font-bold tracking-widest">{ngo.email}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Registration ID</p>
                            <p className="text-xs font-bold text-slate-500">{ngo.fcraNumber}</p>
                        </div>
                    </div>

                    {/* Step-by-Step Report */}
                    <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Automated 5-Check Security Report</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {[
                                { label: 'FCRA Search', status: ngo.automatedChecks?.fcraVerified, sub: 'MHA Database' },
                                { label: 'PAN Identity', status: ngo.automatedChecks?.panVerified, sub: 'Income Tax API' },
                                { label: 'Bank Penny Drop', status: ngo.automatedChecks?.pennyDropSuccessful, sub: 'NPCI Network' },
                                { label: 'Vision AI Scan', status: ngo.automatedChecks?.visionAuthentic, sub: 'Tamper Detection' },
                                { label: 'Geo Address', status: ngo.automatedChecks?.addressMatched, sub: 'FCRA Cross-check' },
                            ].map((check, i) => (
                                <div key={i} className={`p-4 rounded-2xl border flex items-center justify-between ${check.status ? 'bg-green-50/50 border-green-100' : 'bg-red-50/50 border-red-100'
                                    }`}>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-800 uppercase leading-none mb-1">{check.label}</p>
                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{check.sub}</p>
                                    </div>
                                    <span className="text-lg">{check.status ? '✅' : '🚨'}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* AI Diagnostics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-green-500 uppercase tracking-widest border-b border-green-100 pb-2">Institutional Trust Boosts</p>
                            {ngo.aiWhyHigh ? (
                                ngo.aiWhyHigh.split(',').map((reason, idx) => (
                                    <p key={idx} className="text-sm font-bold text-slate-700 flex items-start gap-2">
                                        <span className="text-green-500">⚡</span> {reason.trim()}
                                    </p>
                                ))
                            ) : <p className="text-sm text-slate-400 italic">No significant trust signals detected.</p>}
                        </div>
                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest border-b border-red-100 pb-2">Detected Integrity Risks</p>
                            {ngo.aiWhyNotHigher ? (
                                ngo.aiWhyNotHigher.split(',').map((reason, idx) => (
                                    <p key={idx} className="text-sm font-bold text-slate-700 flex items-start gap-2">
                                        <span className="text-red-500">🚨</span> {reason.trim()}
                                    </p>
                                ))
                            ) : <p className="text-sm text-slate-400 italic">No historical or digital flags found.</p>}
                        </div>
                    </div>

                    {/* AI Decision Matrix (SHAP Simulation) */}
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">AI Decision Matrix / SHAP Breakdown</h4>
                            <span className="text-[8px] font-black text-indigo-500 uppercase px-2 py-1 bg-indigo-50 rounded-md border border-indigo-100 italic">Gradient Boosting Feature Importance</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100">
                            {[
                                { label: 'FCRA Database Integrity', weight: 35, impact: 'high', val: ngo.automatedChecks?.fcraVerified ? '+35' : '-35' },
                                { label: 'PAN Identity Consistency', weight: 25, impact: 'high', val: ngo.automatedChecks?.panVerified ? '+25' : '-25' },
                                { label: 'Vision AI Authenticity', weight: 20, impact: 'med', val: ngo.automatedChecks?.visionAuthentic ? '+20' : '-40' },
                                { label: 'Financial Footprint (Penny Drop)', weight: 15, impact: 'med', val: ngo.automatedChecks?.pennyDropSuccessful ? '+15' : '-15' },
                                { label: 'Address Geo-Validation', weight: 5, impact: 'low', val: ngo.automatedChecks?.addressMatched ? '+5' : '-10' },
                                { label: 'Fraud Heuristics (Isolation Forest)', weight: 0, impact: 'risk', val: ngo.aiFraudStatus === 'HIGH RISK' ? '-60' : '+0' },
                            ].map((feature, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">{feature.label}</p>
                                        <p className={`text-[10px] font-black ${feature.val.includes('-') ? 'text-red-500' : 'text-green-500'}`}>{feature.val} pts</p>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${feature.val.includes('-') ? 'bg-red-400' : 'bg-indigo-500'}`}
                                            style={{ width: `${Math.abs(feature.val.split(' ')[0])}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Fraud Detection Box */}
                    <div className={`p-6 rounded-3xl border-2 border-dashed ${ngo.aiFraudStatus === 'HIGH RISK' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">{ngo.aiFraudStatus === 'HIGH RISK' ? '⚠️' : '🛡️'}</span>
                                <p className={`text-xs font-black uppercase tracking-widest ${ngo.aiFraudStatus === 'HIGH RISK' ? 'text-red-500' : 'text-green-600'}`}>Fraud Pattern Analysis: {ngo.aiFraudStatus}</p>
                            </div>
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest bg-white px-2 py-1 rounded-md border border-slate-100 shadow-sm transition-all hover:scale-105 cursor-help">Isolation Forest Model v2.4</span>
                        </div>
                        <p className="text-base font-bold text-slate-800 leading-snug">
                            {ngo.aiOneFlag || 'Heuristic engine confirms normal metadata and network signature.'}
                        </p>
                        {ngo.aiSuggestion && (
                            <div className="mt-4 flex flex-col gap-2">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Internal Recommendation</p>
                                <p className="text-xs font-black text-indigo-500 uppercase tracking-tighter bg-white p-3 rounded-xl border border-indigo-100 shadow-sm inline-block">
                                    {ngo.aiSuggestion}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Document Preview */}
                    <div className="pt-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 text-center">Physical Document Evidence</p>
                        <div className="relative group overflow-hidden rounded-3xl border-4 border-slate-50 shadow-inner bg-slate-100 aspect-video flex items-center justify-center">
                            <div className="text-center">
                                <p className="text-4xl mb-2">📄</p>
                                <a
                                    href={ngo.registrationCertificate}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-8 py-3 bg-white text-slate-800 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-slate-900 hover:text-white shadow-xl transition-all inline-block"
                                >
                                    Open Full Document Resolution
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sticky Action Bar */}
                <div className="p-10 bg-slate-50/50 border-t border-slate-100 space-y-6">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Reviewer's Final Assessment (Required for Audit Trail)</p>
                        <textarea
                            placeholder="State the reason for approval or rejection here..."
                            id="reviewReason"
                            className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all shadow-sm"
                            rows="2"
                        ></textarea>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => {
                                const reason = document.getElementById('reviewReason').value;
                                if (!reason) return alert('Please provide an assessment reason.');
                                handleReview('approve');
                            }}
                            className="flex-2 py-5 bg-slate-900 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-black shadow-2xl shadow-slate-900/40 active:scale-95 transition-all text-center"
                        >
                            Verify Institutional Trust
                        </button>
                        <button
                            onClick={() => {
                                const reason = document.getElementById('reviewReason').value;
                                if (!reason) return alert('Please provide an assessment reason.');
                                handleReview('reject');
                            }}
                            className="flex-1 py-5 bg-white border-2 border-slate-200 text-slate-400 text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-red-50 hover:text-red-500 hover:border-red-200 active:scale-95 transition-all text-center"
                        >
                            Reject Application
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
