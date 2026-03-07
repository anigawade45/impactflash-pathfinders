import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { activityApi } from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayCircle, CheckCircle2, Globe, Heart, Quote, ArrowRight, ShieldCheck, Camera } from 'lucide-react';

export default function ImpactFeed() {
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStories();
    }, []);

    const fetchStories = async () => {
        try {
            const res = await activityApi.getImpactStories();
            setStories(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-32 px-4 bg-slate-50 relative overflow-hidden text-slate-900">
            {/* Ambient Background Lights */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-linear-to-b from-orange-500/5 to-transparent pointer-events-none"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-24">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white border border-orange-100 mb-8 shadow-xl shadow-orange-500/5"
                    >
                        <Globe className="w-4 h-4 text-orange-500" />
                        <span className="text-[10px] font-black text-orange-600 uppercase tracking-[0.3em]">Evidence of Change / Global Loop</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.9] mb-8"
                    >
                        The Story <br />
                        <span className="text-gradient">of Impact</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-slate-500 font-medium max-w-2xl mx-auto"
                    >
                        Where your money went, who it helped, and the proof-of-life media that confirms every transaction was executed as promised.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {stories.map((story, idx) => (
                        <StoryCard key={story._id} story={story} idx={idx} />
                    ))}
                </div>

                {stories.length === 0 && !loading && (
                    <div className="text-center py-32 modern-card bg-white/40 backdrop-blur-sm border-dashed border-2 border-slate-200">
                        <Camera className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                        <h3 className="text-2xl font-black text-slate-400 uppercase tracking-tighter">Initial Proofs Pending</h3>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-2">Projects are currently in Phase 02 Milestone execution</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function StoryCard({ story, idx }) {
    return (
        <Link to={`/impact/${story._id}`} className="block">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="modern-card group bg-white border-2 border-slate-100 hover:border-orange-200 overflow-hidden cursor-pointer transition-all duration-700 hover:shadow-3xl hover:shadow-orange-500/10 h-full"
            >
                <div className="h-80 bg-slate-100 relative overflow-hidden">
                    <img
                        src={story.photos?.[0] || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=1000'}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    <div className="absolute top-6 left-6">
                        <div className="glass-morphism px-4 py-2 rounded-2xl border border-white/40 shadow-2xl flex items-center gap-2 text-slate-900">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{story.aiValidation?.status === 'VERIFIED' ? 'AI Audited' : 'Human Verified'}</span>
                        </div>
                    </div>
                </div>

                <div className="p-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                        <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em]">{story.summary}</span>
                    </div>

                    <h3 className="text-3xl font-black text-slate-800 mb-6 leading-tight tracking-tight group-hover:text-orange-600 transition-colors">
                        {story.title}
                    </h3>

                    <div className="relative mb-8">
                        <Quote className="absolute -top-4 -left-4 w-10 h-10 text-slate-50 group-hover:text-orange-50" />
                        <p className="text-slate-500 font-medium leading-relaxed italic relative z-10">
                            "{story.content?.substring(0, 150)}..."
                        </p>
                    </div>

                    <div className="pt-8 border-t border-slate-50 flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center border border-slate-800 shadow-xl overflow-hidden text-lg">
                                    🏢
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Project Lead</p>
                                    <p className="text-xs font-black text-slate-900 uppercase tracking-tight line-clamp-1">{story.ngoId?.name || 'Verified NGO'}</p>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Beneficiaries</p>
                                <p className="text-sm font-black text-orange-600 tracking-tighter italic">{story.beneficiaryCount || 0} Lives</p>
                            </div>
                        </div>

                        {/* Donor Attribution Section */}
                        <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                            <div className="flex items-center gap-2 mb-3">
                                <Heart className="w-3 h-3 text-red-400" />
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Catalyzed By</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {story.donors?.map((d, i) => (
                                    <div key={i} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[9px] font-black text-slate-700 uppercase tracking-tight flex items-center gap-2 shadow-sm">
                                        <div className={`w-1.5 h-1.5 rounded-full ${d.isAnonymous ? 'bg-slate-300' : 'bg-orange-500'}`}></div>
                                        {d.name}
                                    </div>
                                ))}
                                {(!story.donors || story.donors.length === 0) && (
                                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest italic">Verifying contributors...</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex gap-2">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: '100%' }}
                                transition={{ duration: 1.5, delay: 0.5 }}
                                className="h-full bg-slate-900 rounded-full"
                            ></motion.div>
                        </div>
                    </div>
                    <div className="mt-3 flex justify-between items-center text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] italic">
                        <span>Genesis</span>
                        <div className="flex items-center gap-1.5">
                            <ShieldCheck className="w-2.5 h-2.5 text-indigo-500" />
                            <span>Verified Cycle</span>
                        </div>
                        <span className="text-indigo-600">Archived</span>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}
