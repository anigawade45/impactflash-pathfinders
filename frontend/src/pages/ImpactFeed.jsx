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

                    <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden text-[10px] font-black text-slate-400">
                                🏢
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">NGO PARTNER</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <p className="text-xs font-bold text-slate-700 uppercase tracking-tighter line-clamp-1">{story.ngoId?.name || 'Verified NGO'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="text-right text-slate-900">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Spent</p>
                            <p className="text-lg font-black text-slate-900 tracking-tighter">₹{story.financialBreakdown?.totalSpent?.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="mt-8 flex gap-2">
                        <div className="flex-1 h-1.5 bg-slate-50 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: '100%' }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className="h-full bg-orange-500 rounded-full"
                            ></motion.div>
                        </div>
                    </div>
                    <div className="mt-3 flex justify-between items-center text-[8px] font-black text-slate-400 uppercase tracking-widest">
                        <span>Milestone 01</span>
                        <span>Milestone 02</span>
                        <span className="text-orange-500">Completion</span>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}
