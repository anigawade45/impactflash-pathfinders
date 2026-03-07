import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { publicApi } from '../api';
import { motion } from 'framer-motion';
import { CheckCircle2, Globe, Heart, ShieldCheck, ArrowLeft, ExternalLink, Calendar, Users, IndianRupee } from 'lucide-react';

export default function ImpactStoryDetails() {
    const { id } = useParams();
    const [story, setStory] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStory = async () => {
            try {
                const res = await publicApi.getStoryById(id);
                if (res.success) setStory(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStory();
    }, [id]);

    if (loading) return <div className="text-center mt-32 text-slate-500 font-bold animate-pulse uppercase tracking-[0.2em]">Authenticating Impact Data...</div>;
    if (!story) return <div className="text-center mt-32 text-red-500 font-bold uppercase tracking-[0.2em]">Story and Audit Trail not found.</div>;

    const { ngoId: ngo, aiValidation: ai, originalProject: project } = story;

    return (
        <div className="min-h-screen pt-24 pb-32 px-4 bg-slate-50 relative overflow-hidden text-slate-900">
            <div className="max-w-5xl mx-auto relative z-10">
                <Link to="/impact-stories" className="inline-flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-orange-600 transition-colors mb-12 group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Evidence Feed
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left content: Story & Details */}
                    <div className="lg:col-span-2 space-y-12">
                        <section>
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-tight mb-8"
                            >
                                {story.title}
                            </motion.h1>

                            <div className="flex flex-wrap gap-4 mb-10">
                                <div className="px-4 py-2 rounded-2xl bg-white border border-slate-100 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Publicly Verified</span>
                                </div>
                                <div className="px-4 py-2 rounded-2xl bg-orange-50 border border-orange-100 flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-orange-500" />
                                    <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Global Transparency Loop</span>
                                </div>
                            </div>

                            <p className="text-xl text-slate-600 font-medium leading-relaxed mb-12">
                                {story.summary}
                            </p>

                            <div className="modern-card p-0 bg-white overflow-hidden mb-12 border-2 border-slate-100">
                                <div className="grid grid-cols-1 md:grid-cols-2">
                                    {story.photos?.map((photo, i) => (
                                        <img key={i} src={photo} alt="" className="w-full h-80 object-cover border-r border-slate-50" />
                                    ))}
                                </div>
                            </div>

                            <div className="prose prose-slate max-w-none">
                                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-4">Detailed Narrative</h3>
                                <p className="text-slate-600 leading-loose text-lg whitespace-pre-line">
                                    {story.content}
                                </p>
                            </div>
                        </section>

                        {/* Financial Ledger Section */}
                        <section className="pt-12 border-t border-slate-100">
                            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-8 italic">Financial Audit Trail</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="modern-card-inset p-6 bg-slate-50 rounded-[2rem]">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Raised</p>
                                    <p className="text-3xl font-black text-slate-900 tracking-tighter">₹{story.financialBreakdown?.totalRaised?.toLocaleString()}</p>
                                </div>
                                <div className="modern-card-inset p-6 bg-green-50 rounded-[2rem]">
                                    <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">Impact Expenditure</p>
                                    <p className="text-3xl font-black text-green-600 tracking-tighter">₹{story.financialBreakdown?.totalSpent?.toLocaleString()}</p>
                                </div>
                                <div className="modern-card-inset p-6 bg-slate-50 rounded-[2rem]">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Impact Efficiency</p>
                                    <p className="text-3xl font-black text-slate-900 tracking-tighter">{Math.round((story.financialBreakdown?.totalSpent / story.financialBreakdown?.totalRaised) * 100)}%</p>
                                </div>
                            </div>
                        </section>

                        <section className="pt-12 border-t border-slate-100">
                            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-8">Verified Proofs</h3>
                            <div className="flex gap-4">
                                <a
                                    href={story.proofOfWork}
                                    target="_blank"
                                    className="px-8 py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-black transition-all flex items-center gap-2"
                                >
                                    View Full Completion Report <ExternalLink className="w-4 h-4" />
                                </a>
                            </div>
                        </section>
                    </div>

                    {/* Right content: AI Audit & NGO Card */}
                    <div className="space-y-8">
                        {/* AI Audit Section */}
                        <div className={`modern-card p-8 border-2 ${ai?.status === 'VERIFIED' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-200'} relative overflow-hidden`}>
                            <div className="absolute -top-4 -right-4 text-9xl text-slate-900/5 font-black pointer-events-none tracking-tighter">AI</div>
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-slate-900" />
                                    <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Independent AI Audit</span>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${ai?.status === 'VERIFIED' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                    {ai?.status}
                                </span>
                            </div>

                            <p className="text-4xl font-black text-slate-900 tracking-tighter mb-2">{ai?.score}/100</p>
                            <p className="text-xs font-bold text-slate-600 mb-6 italic leading-relaxed">
                                "{ai?.analysis}"
                            </p>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tighter">
                                    <span className="text-slate-400">Beneficiary Fidelity</span>
                                    <span className="text-slate-900">{story.beneficiaryCount?.toLocaleString()} People</span>
                                </div>
                                <div className="w-full h-1.5 bg-white/50 rounded-full overflow-hidden">
                                    <div className="h-full bg-slate-900 rounded-full" style={{ width: `${ai?.score}%` }}></div>
                                </div>
                            </div>
                        </div>

                        {/* NGO Info */}
                        <div className="modern-card p-8 bg-white border border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Verified Partner</p>
                            <h4 className="text-2xl font-black text-slate-800 tracking-tighter mb-2">{ngo?.name}</h4>
                            <p className="text-xs text-slate-400 font-bold mb-6">{ngo?.address}</p>

                            <div className="flex items-center gap-6 pb-6 border-b border-slate-50 mb-6">
                                <div>
                                    <p className="text-[8px] font-black text-slate-400 uppercase">Trust</p>
                                    <p className="text-lg font-black text-slate-800">{ngo?.trustScore}/100</p>
                                </div>
                                <div>
                                    <p className="text-[8px] font-black text-slate-400 uppercase">Impact</p>
                                    <p className="text-lg font-black text-slate-800">{ngo?.impactScore}/100</p>
                                </div>
                            </div>

                            <Link
                                to={`/ngo/${ngo?._id}`}
                                className="w-full py-3 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-100 text-center block"
                            >
                                View Organization Profile
                            </Link>
                        </div>

                        {/* Donors Ledger */}
                        <div className="modern-card p-8 bg-white border border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 underline decoration-orange-500 decoration-2 underline-offset-4">Transparency Ledger (Donors)</p>
                            <div className="space-y-4 max-h-64 overflow-y-auto pr-4 custom-scrollbar">
                                {story.donors?.map((donor, idx) => (
                                    <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                                            <span className="text-xs font-bold text-slate-700">{donor.name}</span>
                                        </div>
                                        <span className="text-[9px] font-black text-slate-400 uppercase">PRO-RATA PROOF</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
