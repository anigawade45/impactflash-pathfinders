import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
    Shield, Zap, Target, ArrowRight, CheckCircle2,
    Cpu, BarChart3, Lock, Activity, Globe, Heart,
    FileCheck, Wallet, Eye
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
    const heroRef = useRef(null);
    const titleRef = useRef(null);
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll();
    const yRange = useTransform(scrollYProgress, [0, 1], [0, -100]);

    useEffect(() => {
        // Magnetic Button Logic
        const magneticButtons = document.querySelectorAll('.magnetic-btn');
        magneticButtons.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = (e.clientX - rect.left - rect.width / 2) * 0.4;
                const y = (e.clientY - rect.top - rect.height / 2) * 0.4;
                btn.style.setProperty('--mx', `${x}px`);
                btn.style.setProperty('--my', `${y}px`);
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.setProperty('--mx', '0px');
                btn.style.setProperty('--my', '0px');
            });
        });

        // GSAP Hero Reveal
        const ctx = gsap.context(() => {
            gsap.from(".hero-title-line", {
                y: 100,
                opacity: 0,
                duration: 1.2,
                stagger: 0.2,
                ease: "expo.out",
                delay: 0.5
            });

            gsap.from(".hero-visual", {
                scale: 0.9,
                opacity: 0,
                duration: 1.5,
                ease: "power2.out",
                delay: 1
            });
        }, heroRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="bg-white min-h-screen selection:bg-orange-500/10">
            {/* Grid Background Overlay */}
            <div className="fixed inset-0 grid-pattern opacity-[0.03] pointer-events-none z-0"></div>

            {/* Hero Section */}
            <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-40 text-center overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-[80vh] bg-linear-to-b from-orange-50/50 via-transparent to-white pointer-events-none"></div>

                <div className="relative z-10 max-w-7xl mx-auto">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white border border-slate-100 shadow-premium mb-12"
                    >
                        <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Institutional Grade Charity Intelligence</span>
                    </motion.div>

                    {/* Headline */}
                    <h1 ref={titleRef} className="text-6xl md:text-[6.5rem] font-black tracking-tighter leading-[0.85] text-slate-900 mb-10 perspective-1000">
                        <div className="overflow-hidden h-max py-2">
                            <span className="hero-title-line inline-block">The New</span>
                        </div>
                        <div className="overflow-hidden h-max py-2">
                            <span className="hero-title-line inline-block text-gradient">Foundation</span>
                        </div>
                        <div className="overflow-hidden h-max py-2">
                            <span className="hero-title-line inline-block">of Impact.</span>
                        </div>
                    </h1>

                    {/* Subheadline */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 1.5 }}
                        className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto mb-16 font-medium leading-relaxed italic"
                    >
                        "We don't fund stories; we fund signals. Real-time urgency scoring, trust-verified NGOs, and milestone-locked capital."
                    </motion.p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
                        <Link to="/donor-onboarding" className="magnetic-btn">
                            <button className="px-10 py-6 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-orange-600 transition-all shadow-premium group">
                                Start Smart Giving
                                <ArrowRight className="inline-block ml-3 w-4 h-4 group-hover:translate-x-2 transition-transform" />
                            </button>
                        </Link>
                        <Link to="/explore" className="magnetic-btn">
                            <button className="px-10 py-6 bg-white border border-slate-200 text-slate-900 text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:border-orange-500 transition-all">
                                Audit Pending Needs
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Floating Visual Elements */}
                <div className="absolute top-[20%] left-[5%] w-64 h-64 bg-orange-100 rounded-full blur-[120px] opacity-40 floating pointer-events-none"></div>
                <div className="absolute bottom-[20%] right-[5%] w-96 h-96 bg-slate-100 rounded-full blur-[150px] opacity-40 floating pointer-events-none" style={{ animationDelay: '2s' }}></div>
            </section>

            {/* Live Stats Ticker */}
            <div className="border-t border-b border-slate-50 py-10 overflow-hidden bg-white/50 backdrop-blur-sm relative z-10">
                <div className="flex whitespace-nowrap animate-marquee">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex gap-20 items-center mx-10">
                            <StatItem label="AI Trust Processing" value="86.4ms" />
                            <StatItem label="Verified NGOs" value="1,240+" />
                            <StatItem label="Impact Allocation" value="₹12.4 Cr" />
                            <StatItem label="Fraud Prevention" value="99.8%" />
                        </div>
                    ))}
                </div>
            </div>

            {/* The 6 Pillars (Grid) */}
            <section className="py-40 px-6 max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 mb-32 items-end">
                    <div className="lg:col-span-12">
                        <h2 className="text-[8vw] font-black tracking-tighter leading-[0.75] text-slate-900 uppercase">
                            Engineered <br />
                            <span className="text-orange-500 font-black">Transparence.</span>
                        </h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <PillarCard
                        icon={<Shield className="w-5 h-5" />}
                        title="Vision-Guard KYC"
                        desc="Advanced Gemini Vision verification across registration documents and field proofs."
                        num="01"
                    />
                    <PillarCard
                        icon={<Zap className="w-5 h-5" />}
                        title="Xavier Urgency"
                        desc="Probabilistic scoring of human need using XGBoost to bypass popularity bias."
                        num="02"
                    />
                    <PillarCard
                        icon={<Lock className="w-5 h-5" />}
                        title="40-40-20 Escrow"
                        desc="Funds released only on Initiation, Mid-way, and Verified Outcome milestones."
                        num="03"
                    />
                    <PillarCard
                        icon={<Eye className="w-5 h-5" />}
                        title="Public Ledger"
                        desc="Audit trails for every admin decision and fund release made available to the public."
                        num="04"
                    />
                    <PillarCard
                        icon={<Target className="w-5 h-5" />}
                        title="Anti-Circular AI"
                        desc="Detection of connected-party fraud loops between NGOs and donors."
                        num="05"
                    />
                    <PillarCard
                        icon={<Activity className="w-5 h-5" />}
                        title="Outcome Proof-of-Life"
                        desc="Video and location-stamped evidence required for final payment release."
                        num="06"
                    />
                </div>
            </section>

            {/* AI Visualization Highlight */}
            <section className="py-40 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center mix-blend-overlay"></div>
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 mb-8">
                            <Cpu className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Model Inference v4.2</span>
                        </div>
                        <h2 className="text-5xl md:text-8xl font-black tracking-tighter mb-12 leading-tight">
                            The Math of <br />
                            <span className="text-orange-500">Altruism.</span>
                        </h2>
                        <p className="text-2xl text-slate-400 mb-16 font-medium leading-relaxed italic">
                            "Human emotion is a variable. Impact is a constant."
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <InferenceBox title="XGBoost Score" value="94.2/100" desc="Urgency Confidence" />
                        <InferenceBox title="SHAP Value" value="+12.4" desc="Education Feature Weight" />
                        <InferenceBox title="Vision Audit" value="AUTHENTIC" desc="Proof Validation" />
                        <InferenceBox title="Fraud Logic" value="NO LOOPS" desc="Network Safety" />
                    </div>
                </div>
            </section>

            {/* The Process Flow */}
            <section className="py-40 px-6 max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-32">
                    <p className="text-orange-500 font-black text-[10px] uppercase tracking-[0.4em] mb-4">The Protocol</p>
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 uppercase italic">Capital Velocity.</h2>
                </div>

                <div className="space-y-4">
                    <FlowRow step="01" action="Registration & KYC" result="Trust Score Assigned" detail="FCRA Cross-match + Gemini Doc Scan" />
                    <FlowRow step="02" action="Need Submission" result="Priority Inference" detail="XGBoost Scoring + Fraud Ring Check" />
                    <FlowRow step="03" action="Smart Donation" result="Impact Optimized" detail="Linear Programming Split via HiGHS" />
                    <FlowRow step="04" action="Escrow Release" result="Milestone Evidence" detail="40% | 40% | 20% Release Gates" />
                    <FlowRow step="05" action="Final Audit" result="Story Publication" detail="Proof-of-Life + Pro-Rata Reporting" />
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-40 px-6 text-center bg-white border-t border-slate-50 relative z-10">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="max-w-4xl mx-auto"
                >
                    <h2 className="text-[6vw] font-black tracking-tighter leading-none text-slate-900 mb-16 uppercase italic">
                        No More <br />
                        <span className="text-orange-500">Black Boxes.</span>
                    </h2>
                    <Link to="/donor-onboarding" className="magnetic-btn inline-block">
                        <button className="px-12 py-6 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-2xl hover:bg-orange-600 transition-all shadow-3xl hover:scale-105 active:scale-95">
                            Secure Your Impact Now
                        </button>
                    </Link>
                </motion.div>
            </section>
        </div>
    );
}

function StatItem({ label, value }) {
    return (
        <div className="flex items-center gap-4">
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{label}</span>
            <span className="text-orange-600 text-xl font-black">{value}</span>
        </div>
    );
}

function PillarCard({ icon, title, desc, num }) {
    return (
        <motion.div
            whileHover={{ y: -10 }}
            className="p-10 bg-slate-50/50 border border-slate-100 rounded-[2.5rem] group hover:bg-white hover:border-orange-500/20 hover:shadow-premium transition-all duration-700"
        >
            <div className="flex justify-between items-start mb-10">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-100 text-slate-900 group-hover:bg-orange-500 group-hover:text-white transition-all duration-500 group-hover:scale-110">
                    {icon}
                </div>
                <span className="text-slate-200 text-4xl font-black group-hover:text-orange-100 transition-colors uppercase italic">{num}</span>
            </div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tighter mb-4 group-hover:text-orange-600 transition-colors uppercase">{title}</h3>
            <p className="text-slate-400 font-bold text-sm leading-relaxed">{desc}</p>
        </motion.div>
    );
}

function InferenceBox({ title, value, desc }) {
    return (
        <div className="modern-card p-8 bg-white/5 backdrop-blur-md border border-white/10 group hover:border-orange-500/30 transition-all">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4">{title}</p>
            <p className="text-3xl font-black text-white mb-2 tracking-tighter group-hover:text-orange-500 transition-colors">{value}</p>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">{desc}</p>
        </div>
    );
}

function FlowRow({ step, action, result, detail }) {
    return (
        <motion.div
            whileHover={{ x: 20 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-8 py-10 border-b border-slate-50 items-center group cursor-default"
        >
            <div className="flex items-center gap-6">
                <span className="text-slate-200 text-2xl font-black italic">{step}</span>
                <span className="text-slate-900 text-xl font-black uppercase tracking-tighter group-hover:text-orange-500 transition-colors">{action}</span>
            </div>
            <div className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{detail}</div>
            <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <span className="text-slate-800 font-black text-sm uppercase tracking-widest">{result}</span>
            </div>
            <div className="flex justify-end pr-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <CheckCircle2 className="w-6 h-6 text-orange-500" />
            </div>
        </motion.div>
    );
}
