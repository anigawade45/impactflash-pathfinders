import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Zap, Target, ArrowRight, CheckCircle2, Cpu, BarChart3, Lock } from 'lucide-react';

const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
};

const stagger = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

export default function Home() {
    return (
        <main className="flex-1 overflow-x-hidden">
            {/* Hero Section */}
            <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-32 text-center overflow-hidden">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="file:///C:/Users/Admin/.gemini/antigravity/brain/27040fa9-6ec5-479b-910a-9d23558ed91f/impactflash_hero_bg_1772693194514.png"
                        alt="Hero background"
                        className="w-full h-full object-cover scale-105"
                    />
                    <div className="absolute inset-0 bg-linear-to-b from-slate-50/10 via-slate-50/80 to-slate-50"></div>
                    <div className="noise-bg absolute inset-0"></div>
                </div>

                <motion.div
                    initial="initial"
                    animate="animate"
                    variants={stagger}
                    className="relative z-10 max-w-5xl mx-auto"
                >
                    <motion.div
                        variants={fadeInUp}
                        className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/40 backdrop-blur-md border border-orange-200/50 mb-10 shadow-xl shadow-orange-500/5"
                    >
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                        </span>
                        <span className="text-sm font-black text-orange-600 uppercase tracking-widest">AI Trust Protocol v2.0 Active</span>
                    </motion.div>

                    <motion.h1
                        variants={fadeInUp}
                        className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9] text-slate-900 drop-shadow-sm"
                    >
                        The Intelligence <br />
                        <span className="text-gradient">Behind Giving</span>
                    </motion.h1>

                    <motion.p
                        variants={fadeInUp}
                        className="text-lg md:text-2xl text-slate-500 max-w-2xl mx-auto mb-12 font-medium leading-relaxed"
                    >
                        We score every need by actual urgency using machine learning, release funds via milestone escrow, and verify results with automated proof chains.
                    </motion.p>

                    <motion.div
                        variants={fadeInUp}
                        className="flex flex-col sm:flex-row gap-6 w-full justify-center max-w-lg mx-auto"
                    >
                        <Link to="/donor-onboarding" className="flex-1 group">
                            <button className="w-full btn-primary py-5 text-xl flex items-center justify-center gap-3 group-hover:gap-5 transition-all">
                                Smart Donate <ArrowRight className="w-6 h-6" />
                            </button>
                        </Link>
                        <Link to="/explore" className="flex-1">
                            <button className="w-full btn-secondary py-5 text-xl">
                                Explore Needs
                            </button>
                        </Link>
                    </motion.div>
                </motion.div>

                {/* Floating Elements (Visual Polish) */}
                <div className="absolute left-10 top-1/4 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl floating"></div>
                <div className="absolute right-10 bottom-1/4 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl floating" style={{ animationDelay: '2s' }}></div>
            </section>

            {/* Core Pillars Section */}
            <section className="py-32 px-4 bg-slate-50 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-6 uppercase">The Five Layers <span className="text-orange-500">of Trust</span></h2>
                        <p className="text-slate-500 text-lg max-w-2xl mx-auto font-bold uppercase tracking-widest">Ensuring your donation reaches its destination without compromise.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        <PillarCard
                            icon={<Shield className="w-8 h-8" />}
                            title="Multi-Point Identity"
                            desc="Registration checked against FCRA, PAN, and Aadhaar databases with AI document scanning."
                            layer="01"
                        />
                        <PillarCard
                            icon={<Zap className="w-8 h-8" />}
                            title="Urgency Scoring"
                            desc="XGBoost & Isolation Forest models analyze need criticality, preventing popularity bias."
                            layer="02"
                        />
                        <PillarCard
                            icon={<Target className="w-8 h-8" />}
                            title="Self-Dealing Block"
                            desc="Automated KYC cross-checks prevent funds from returning to connected donors or NGOs."
                            layer="03"
                        />
                        <PillarCard
                            icon={<Lock className="w-8 h-8" />}
                            title="Milestone Escrow"
                            desc="Funds sit in Razorpay Escrow. Released 40-40-20 only when NGO provides verified proof."
                            layer="04"
                        />
                        <PillarCard
                            icon={<BarChart3 className="w-8 h-8" />}
                            title="Public Auditor"
                            desc="Every admin decision and release of funds is logged on a tamper-proof public ledger."
                            layer="05"
                        />
                        <PillarCard
                            icon={<CheckCircle2 className="w-8 h-8" />}
                            title="Impact Validation"
                            desc="Final 20% release requires beneficiary count and proof-of-life media verification."
                            layer="06"
                        />
                    </div>
                </div>
            </section>

            {/* AI Engine Highlight Section */}
            <section className="py-40 bg-slate-900 text-white overflow-hidden relative">
                <div className="absolute inset-0 opacity-20 overflow-hidden">
                    <img
                        src="file:///C:/Users/Admin/.gemini/antigravity/brain/27040fa9-6ec5-479b-910a-9d23558ed91f/ai_engine_logic_1772693227778.png"
                        alt="AI Logic background"
                        className="w-full h-full object-cover mix-blend-overlay scale-110"
                    />
                </div>

                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-4 bg-orange-500 rounded-2xl shadow-2xl shadow-orange-500/40">
                                    <Cpu className="w-10 h-10 text-white" />
                                </div>
                                <span className="text-sm font-black uppercase tracking-[0.3em] text-orange-400">Powered by Xavier-V Intelligence</span>
                            </div>
                            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight mb-8">
                                AI Decisions, <br />
                                <span className="text-orange-500">Zero Biases.</span>
                            </h2>
                            <p className="text-xl text-slate-400 mb-12 leading-relaxed">
                                Our XGBoost models look at 40+ attributes for every single need. We don't fund who is most popular; we fund what is most critical.
                            </p>

                            <div className="space-y-6">
                                <MetricRow label="Fraud Detection Accuracy" value="99.8%" />
                                <MetricRow label="Urgency Prioritization" value="Automated" />
                                <MetricRow label="Decision Explanability" value="SHAP Native" />
                            </div>
                        </div>

                        <div className="relative">
                            <div className="glass-dark p-10 rounded-[3rem] border border-white/10 relative z-20 overflow-hidden group hover:border-orange-500/30 transition-all duration-700">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                                <h3 className="text-3xl font-bold mb-8 flex items-center gap-3">
                                    Live Scoring Protocol
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                </h3>
                                <div className="space-y-8">
                                    <AIStat title="Registration Vetting" status="VERIFIED" color="text-green-400" />
                                    <AIStat title="Amount-to-Need Analysis" status="OPTIMIZED" color="text-orange-400" />
                                    <AIStat title="Network Fraud Analysis" status="SAFE" color="text-sky-400" />
                                    <div className="pt-8 border-t border-white/5">
                                        <div className="flex justify-between items-center text-sm font-black mb-2 uppercase text-slate-500 tracking-widest">
                                            <span>Current Trust Processing</span>
                                            <span>86.4ms</span>
                                        </div>
                                        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                            <motion.div
                                                className="bg-orange-500 h-full"
                                                initial={{ width: "0%" }}
                                                whileInView={{ width: "86%" }}
                                                transition={{ duration: 1.5, delay: 0.5 }}
                                            ></motion.div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

function PillarCard({ icon, title, desc, layer }) {
    return (
        <motion.div
            whileHover={{ y: -10 }}
            className="modern-card p-10 bg-white relative overflow-hidden group cursor-default"
        >
            <div className="absolute -right-4 -top-4 text-8xl font-black text-slate-50 opacity-0 group-hover:opacity-100 transition-opacity">
                {layer}
            </div>
            <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 mb-8 group-hover:scale-110 transition-transform duration-500 relative z-10">
                {icon}
            </div>
            <h3 className="text-2xl font-black mb-4 text-slate-800 relative z-10 group-hover:text-orange-600 transition-colors uppercase tracking-tight">{title}</h3>
            <p className="text-slate-500 text-base leading-relaxed relative z-10 font-bold">{desc}</p>
        </motion.div>
    );
}

function AIStat({ title, status, color }) {
    return (
        <div className="flex justify-between items-center group/stat">
            <span className="text-slate-400 font-bold group-hover/stat:text-white transition-colors">{title}</span>
            <span className={`font-black text-sm tracking-widest px-3 py-1 bg-white/5 rounded-lg ${color}`}>{status}</span>
        </div>
    );
}

function MetricRow({ label, value }) {
    return (
        <div className="flex items-center gap-6">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
            <div className="flex-1 border-b border-white/5 pb-2">
                <span className="text-slate-400 font-bold text-sm tracking-widest mr-4">{label}</span>
                <span className="text-white font-black text-lg">{value}</span>
            </div>
        </div>
    );
}
