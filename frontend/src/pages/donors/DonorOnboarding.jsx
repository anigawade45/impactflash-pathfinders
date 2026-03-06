import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Heart, Book, TreePine, Utensils, PawPrint, CloudLightning, ArrowRight, ArrowLeft, Send, Sparkles } from 'lucide-react';

const CAUSES = [
    { id: 'Health', icon: <Heart className="w-10 h-10" />, label: 'Healthcare', color: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' },
    { id: 'Education', icon: <Book className="w-10 h-10" />, label: 'Education', color: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
    { id: 'Environment', icon: <TreePine className="w-10 h-10" />, label: 'Climate', color: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
    { id: 'Hunger', icon: <Utensils className="w-10 h-10" />, label: 'Food Security', color: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
    { id: 'Animal', icon: <PawPrint className="w-10 h-10" />, label: 'Animal Care', color: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' },
    { id: 'Disaster', icon: <CloudLightning className="w-10 h-10" />, label: 'Emergency', color: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100' }
];

export default function DonorOnboarding() {
    const [step, setStep] = useState(1);
    const [selectedCauses, setSelectedCauses] = useState([]);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const toggleCause = (id) => {
        setSelectedCauses(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleNext = async () => {
        if (step === 1 && selectedCauses.length === 0) return;
        if (step === 1) return setStep(2);

        if (!formData.name || !formData.email || !formData.password) return;

        setLoading(true);
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
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-32 px-4 relative overflow-hidden bg-slate-50">
            {/* Background Accents */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl -mr-48 -mt-24"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl -ml-48 -mb-24"></div>

            <div className="max-w-5xl mx-auto relative z-10">
                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="text-center"
                        >
                            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white border border-slate-200 mb-8 shadow-sm">
                                <Sparkles className="w-4 h-4 text-orange-500" />
                                <span className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Step 01 / Personalize</span>
                            </div>

                            <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter mb-6">
                                What <span className="text-orange-500">Drives</span> You?
                            </h1>
                            <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-16 font-medium">
                                Select the causes you care most about. Our AI Engine uses this to mathematically optimize your donation impact.
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-16 px-4">
                                {CAUSES.map((cause, idx) => (
                                    <motion.button
                                        key={cause.id}
                                        onClick={() => toggleCause(cause.id)}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className={`relative group p-10 rounded-[3rem] border-2 transition-all duration-500 ${selectedCauses.includes(cause.id)
                                            ? `border-orange-500 bg-white shadow-2xl shadow-orange-500/10 scale-105`
                                            : `border-white bg-white/40 backdrop-blur-sm grayscale opacity-70 hover:grayscale-0 hover:opacity-100 hover:border-slate-200`
                                            }`}
                                    >
                                        <div className={`w-20 h-20 rounded-3xl ${cause.color} ${cause.text} flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500`}>
                                            {cause.icon}
                                        </div>
                                        <h3 className={`text-xl font-black uppercase tracking-tight ${selectedCauses.includes(cause.id) ? 'text-slate-900' : 'text-slate-500'}`}>
                                            {cause.label}
                                        </h3>
                                        {selectedCauses.includes(cause.id) && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="absolute -top-3 -right-3 w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center shadow-lg"
                                            >
                                                <Sparkles className="w-5 h-5" />
                                            </motion.div>
                                        )}
                                    </motion.button>
                                ))}
                            </div>

                            <button
                                onClick={handleNext}
                                disabled={selectedCauses.length === 0}
                                className={`group px-12 py-5 rounded-3xl font-black text-xl transition-all flex items-center gap-4 mx-auto ${selectedCauses.length > 0 ? 'bg-slate-900 text-white shadow-2xl shadow-slate-900/40 hover:scale-105 active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                    }`}
                            >
                                Continue To Discovery <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="text-center"
                        >
                            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white border border-slate-200 mb-8 shadow-sm">
                                <Sparkles className="w-4 h-4 text-orange-500" />
                                <span className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Step 02 / Identity</span>
                            </div>

                            <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter mb-6">
                                Impact <span className="text-orange-500">Awaits</span>
                            </h1>
                            <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-16 font-medium">
                                Create your account to enable Layer 3 fraud prevention and receive 80G tax benefit certificates.
                            </p>

                            <div className="max-w-xl mx-auto space-y-8 mb-16 px-4">
                                <div className="grid grid-cols-1 gap-6">
                                    <OnboardingInput
                                        label="Full Legal Name"
                                        placeholder="Rajesh Kumar"
                                        value={formData.name}
                                        onChange={(v) => setFormData({ ...formData, name: v })}
                                    />
                                    <OnboardingInput
                                        label="Email Workspace"
                                        type="email"
                                        placeholder="rj@growth.co"
                                        value={formData.email}
                                        onChange={(v) => setFormData({ ...formData, email: v })}
                                    />
                                    <OnboardingInput
                                        label="Access Key (Password)"
                                        type="password"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(v) => setFormData({ ...formData, password: v })}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                                <button
                                    onClick={() => setStep(1)}
                                    className="px-10 py-5 rounded-3xl font-black text-lg text-slate-500 border-2 border-slate-100 hover:bg-white hover:border-slate-300 transition-all flex items-center gap-3"
                                >
                                    <ArrowLeft className="w-6 h-6" /> Back
                                </button>
                                <button
                                    onClick={handleNext}
                                    disabled={loading || !formData.name || !formData.email || !formData.password}
                                    className="group px-12 py-5 bg-orange-500 text-white rounded-3xl font-black text-xl shadow-2xl shadow-orange-500/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-4 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Initializing Interface...' : 'Start My Impact Loop'} <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function OnboardingInput({ label, placeholder, type = "text", value, onChange }) {
    return (
        <div className="text-left group/input">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 ml-4 group-focus-within/input:text-orange-500 transition-colors">
                {label}
            </label>
            <div className="relative">
                <input
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full px-10 py-6 rounded-[2.5rem] bg-white border-2 border-white shadow-xl shadow-slate-200/50 focus:outline-none focus:border-orange-500/30 focus:shadow-orange-500/10 transition-all text-xl font-bold text-slate-800 placeholder:text-slate-300"
                />
            </div>
        </div>
    );
}
