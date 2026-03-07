import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import Lottie from 'lottie-react';
import {
    Heart, Book, TreePine, Utensils, PawPrint, CloudLightning,
    ArrowRight, ArrowLeft, Send, Sparkles, User, Shield, Check, Lock, Mail
} from 'lucide-react';

const CAUSES = [
    { id: 'Health', icon: <Heart className="w-8 h-8" />, label: 'Healthcare', color: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' },
    { id: 'Education', icon: <Book className="w-8 h-8" />, label: 'Education', color: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
    { id: 'Environment', icon: <TreePine className="w-8 h-8" />, label: 'Climate', color: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
    { id: 'Hunger', icon: <Utensils className="w-8 h-8" />, label: 'Food Security', color: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
    { id: 'Animal', icon: <PawPrint className="w-8 h-8" />, label: 'Animal Care', color: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' },
    { id: 'Disaster', icon: <CloudLightning className="w-8 h-8" />, label: 'Emergency', color: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100' }
];

const stepContent = {
    1: {
        title: "Account Initialization",
        desc: "Secure your identity on the Zero-Trust network.",
        animation: 'https://lottie.host/904c0dac-0ff7-495c-9ae8-561ddc2d62bd/GpzM1EHaHw.json',
        pill: "Step 01 / Identity"
    },
    2: {
        title: "Impact Alignment",
        desc: "Select the causes that drive your philanthropic mission.",
        animation: 'https://lottie.host/7f536d07-a88c-45bc-a3f0-b3798c518ea2/cwTYEW3wyt.json',
        pill: "Step 02 / Purpose"
    },
    3: {
        title: "Privacy Protocol",
        desc: "Define your visibility on the public ledger.",
        animation: 'https://lottie.host/f2513ce0-1cbb-4c9c-a483-f212585b4c5c/Zq6aOO7tMK.json',
        pill: "Step 03 / Security"
    }
};

export default function DonorOnboarding() {
    const [step, setStep] = useState(1);
    const [selectedCauses, setSelectedCauses] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        defaultVisibility: 'anonymous'
    });
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [animationData, setAnimationData] = useState(null);
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        setAnimationData(null);
        fetch(stepContent[step].animation)
            .then(res => res.json())
            .then(data => setAnimationData(data))
            .catch(err => console.error("Lottie Load Error", err));
    }, [step]);

    const toggleCause = (id) => {
        setSelectedCauses(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleNext = async () => {
        if (step === 1) {
            if (!formData.name || !formData.email || !formData.password) return;
            return setStep(2);
        }
        if (step === 2) {
            if (selectedCauses.length === 0) return;
            return setStep(3);
        }

        setLoading(true);
        setErrorMsg('');
        try {
            const res = await authApi.registerDonor({
                ...formData,
                causes: selectedCauses
            });
            if (res.success) {
                await login(formData.email, formData.password, 'donor');
                navigate('/explore');
            }
        } catch (err) {
            console.error(err);
            setErrorMsg(err.message || 'Registration failed. This identity might already be registered.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
            <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[3rem] shadow-2xl shadow-slate-200 overflow-hidden border border-slate-100">

                {/* Left Side: Dynamic Animation & Progress */}
                <div className="relative hidden lg:flex flex-col items-center justify-center p-16 bg-orange-50 transition-colors duration-700">
                    <div className="relative z-10 w-full max-w-sm text-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                                className="mb-12"
                            >
                                {animationData ? (
                                    <Lottie
                                        animationData={animationData}
                                        loop={true}
                                        className="w-full aspect-square"
                                    />
                                ) : (
                                    <div className="w-full aspect-square flex items-center justify-center">
                                        <div className="w-12 h-12 border-4 border-orange-200 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        <motion.div
                            key={`text-${step}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-4"
                        >
                            <h2 className="text-4xl font-black text-orange-900 tracking-tighter capitalize italic">
                                {stepContent[step].title}
                            </h2>
                            <p className="text-slate-500 font-medium leading-relaxed italic">
                                {stepContent[step].desc}
                            </p>
                        </motion.div>

                        {/* Progress Indicators */}
                        <div className="flex gap-3 justify-center mt-12">
                            {[1, 2, 3].map(s => (
                                <div
                                    key={s}
                                    className={`h-1.5 rounded-full transition-all duration-500 ${step === s ? 'w-12 bg-orange-500' : 'w-4 bg-orange-200'}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Branding */}
                    <div className="absolute top-12 left-12 flex items-center gap-2">
                        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-black text-orange-900 tracking-tighter uppercase text-sm">ImpactFlash</span>
                    </div>

                    {/* Decorative Blobs */}
                    <div className="absolute top-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -ml-32 -mt-32 animate-pulse" />
                    <div className="absolute bottom-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl -mr-40 -mb-40 animate-pulse" />
                </div>

                {/* Right Side: Step-based Form */}
                <div className="p-10 lg:p-20 bg-white overflow-y-auto max-h-[90vh]">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-10"
                            >
                                <div>
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-100 mb-6">
                                        <User className="w-4 h-4 text-orange-600" />
                                        <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">{stepContent[1].pill}</span>
                                    </div>
                                    <h2 className="text-4xl font-black text-slate-800 tracking-tight italic uppercase">Join the Loop</h2>
                                    <p className="text-slate-500 font-medium">Initialize your donor workspace to begin tracking impact.</p>
                                </div>

                                {errorMsg && (
                                    <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-[11px] font-black uppercase tracking-wider flex items-center gap-3 shadow-sm">
                                        <Info className="w-4 h-4" />
                                        {errorMsg}
                                    </div>
                                )}

                                <div className="space-y-6">
                                    <RegisterInput
                                        label="Full Legal Name"
                                        icon={<User />}
                                        placeholder="Rajesh Kumar"
                                        value={formData.name}
                                        onChange={(v) => setFormData({ ...formData, name: v })}
                                    />
                                    <RegisterInput
                                        label="Email Workspace"
                                        icon={<Mail />}
                                        type="email"
                                        placeholder="rj@growth.co"
                                        value={formData.email}
                                        onChange={(v) => setFormData({ ...formData, email: v })}
                                    />
                                    <RegisterInput
                                        label="Access Key (Password)"
                                        icon={<Lock />}
                                        type="password"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(v) => setFormData({ ...formData, password: v })}
                                    />
                                </div>

                                <button
                                    onClick={handleNext}
                                    disabled={!formData.name || !formData.email || !formData.password}
                                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-5 rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-orange-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
                                >
                                    Define Identity <ArrowRight className="w-5 h-5" />
                                </button>

                                <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                    Already have an account? <Link to="/login" className="text-orange-500 hover:underline">Verify Identity</Link>
                                </p>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-10"
                            >
                                <div>
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-100 mb-6">
                                        <Heart className="w-4 h-4 text-orange-600" />
                                        <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">{stepContent[2].pill}</span>
                                    </div>
                                    <h2 className="text-4xl font-black text-slate-800 tracking-tight italic uppercase">Select Purpose</h2>
                                    <p className="text-slate-500 font-medium">Select causes for mathematical impact optimization.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {CAUSES.map((cause) => (
                                        <button
                                            key={cause.id}
                                            onClick={() => toggleCause(cause.id)}
                                            className={`relative p-8 rounded-[2rem] border-2 transition-all duration-300 text-left ${selectedCauses.includes(cause.id)
                                                ? 'border-orange-500 bg-orange-50/50 shadow-lg'
                                                : 'border-slate-50 bg-white hover:border-slate-200'
                                                }`}
                                        >
                                            <div className={`w-14 h-14 rounded-2xl ${cause.color} ${cause.text} flex items-center justify-center mb-4`}>
                                                {cause.icon}
                                            </div>
                                            <h3 className={`text-sm font-black uppercase tracking-tight ${selectedCauses.includes(cause.id) ? 'text-orange-900' : 'text-slate-500'}`}>
                                                {cause.label}
                                            </h3>
                                            {selectedCauses.includes(cause.id) && (
                                                <div className="absolute top-4 right-4 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                                                    <Check className="w-4 h-4 text-white" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex gap-4">
                                    <button onClick={() => setStep(1)} className="flex-1 py-5 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 border border-slate-100 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                                        <ArrowLeft className="w-4 h-4" /> Identity
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        disabled={selectedCauses.length === 0}
                                        className="flex-[2] bg-orange-600 hover:bg-orange-700 text-white py-5 rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-orange-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
                                    >
                                        Align Purpose <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-10"
                            >
                                <div>
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-100 mb-6">
                                        <Shield className="w-4 h-4 text-orange-600" />
                                        <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">{stepContent[3].pill}</span>
                                    </div>
                                    <h2 className="text-4xl font-black text-slate-800 tracking-tight italic uppercase">Security Filter</h2>
                                    <p className="text-slate-500 font-medium">Establish your visibility protocol for the public ledger.</p>
                                </div>

                                <div className="space-y-4">
                                    {[
                                        { id: 'public', label: 'Public Leader', icon: <Sparkles className="w-5 h-5" />, desc: 'Visible on premium leaderboard & impact feed' },
                                        { id: 'anonymous', label: 'Ghost Protocol', icon: <Send className="w-5 h-5" />, desc: 'Fully hidden from all public tracking' },
                                        { id: 'ngo_only', label: 'NGO Targeted', icon: <User className="w-5 h-5" />, desc: 'Visible only to the organization receiving funds' }
                                    ].map((opt) => (
                                        <button
                                            key={opt.id}
                                            onClick={() => setFormData({ ...formData, defaultVisibility: opt.id })}
                                            className={`w-full p-8 rounded-[2rem] border-2 transition-all flex items-center gap-6 text-left ${formData.defaultVisibility === opt.id ? 'border-orange-500 bg-orange-50/50 shadow-lg' : 'border-slate-50 bg-white hover:border-slate-200'}`}
                                        >
                                            <div className={`w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm ${formData.defaultVisibility === opt.id ? 'text-orange-500' : 'text-slate-300'}`}>
                                                {opt.icon}
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-black uppercase tracking-tight text-slate-900">{opt.label}</h3>
                                                <p className="text-[11px] font-medium text-slate-400">{opt.desc}</p>
                                            </div>
                                            {formData.defaultVisibility === opt.id && (
                                                <div className="ml-auto w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                                                    <Check className="w-4 h-4 text-white" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex gap-4">
                                    <button onClick={() => setStep(2)} className="flex-1 py-5 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 border border-slate-100 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                                        <ArrowLeft className="w-4 h-4" /> Purpose
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        disabled={loading}
                                        className="flex-[2] bg-orange-600 hover:bg-orange-700 text-white py-5 rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-orange-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
                                    >
                                        {loading ? (
                                            <div className="w-6 h-6 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>Encrypt & Register <Send className="w-5 h-5" /></>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

function RegisterInput({ label, placeholder, type = "text", value, onChange, icon }) {
    return (
        <div className="text-left group/input relative">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2.5 ml-1 transition-colors group-focus-within/input:text-orange-500">
                {label}
            </label>
            <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/input:text-orange-500 transition-colors">
                    {React.cloneElement(icon, { size: 18 })}
                </div>
                <input
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50/50 border border-slate-100 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:bg-white transition-all font-bold text-slate-800 placeholder:text-slate-300"
                />
            </div>
        </div>
    );
}
