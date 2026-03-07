import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import {
    Users, Shield, Landmark, Check, ArrowRight, ArrowLeft,
    Mail, Lock, Info, Building, FileText, Globe, MapPin, Sparkles, User
} from 'lucide-react';

const stepContent = {
    1: {
        title: "Organization Profile",
        desc: "Initialize your NGO workspace on the Zero-Trust network.",
        animation: 'https://lottie.host/7f536d07-a88c-45bc-a3f0-b3798c518ea2/cwTYEW3wyt.json',
        pill: "Step 01 / Organization"
    },
    2: {
        title: "Finance & Protocol",
        desc: "Configure bank escrow and verify tax identities.",
        animation: 'https://lottie.host/f2513ce0-1cbb-4c9c-a483-f212585b4c5c/Zq6aOO7tMK.json',
        pill: "Step 02 / Banking"
    },
    3: {
        title: "Representative Identity",
        desc: "Secure biometric-linked identity verification via UIDAI.",
        animation: 'https://lottie.host/904c0dac-0ff7-495c-9ae8-561ddc2d62bd/GpzM1EHaHw.json',
        pill: "Step 03 / Identity"
    },
    4: {
        title: "Final Authorization",
        desc: "Submit your credentials for AI-driven fraud verification.",
        animation: 'https://lottie.host/7f536d07-a88c-45bc-a3f0-b3798c518ea2/cwTYEW3wyt.json',
        pill: "Step 04 / Verify"
    }
};

export default function NgoOnboarding() {
    const navigate = useNavigate();
    const { register, verifyPan, verifyAadhaar } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [verifyingPan, setVerifyingPan] = useState(false);
    const [isPanVerified, setIsPanVerified] = useState(false);
    const [verifyingAadhaar, setVerifyingAadhaar] = useState(false);
    const [isAadhaarVerified, setIsAadhaarVerified] = useState(false);
    const [success, setSuccess] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [animationData, setAnimationData] = useState(null);

    const [formData, setFormData] = useState({
        ngoId: '',
        name: '',
        email: '',
        password: '',
        registrationNumber: '',
        isFcraRegistered: false,
        fcraNumber: '',
        panCard: '',
        aadhaarNumber: '',
        address: '',
        website: '',
        workingAreas: '',
        registrationCertificate: '',
        representativeName: '',
        bankAccount: {
            accountNumber: '',
            ifscCode: '',
            bankName: ''
        }
    });

    useEffect(() => {
        setAnimationData(null);
        fetch(stepContent[step].animation)
            .then(res => res.json())
            .then(data => setAnimationData(data))
            .catch(err => console.error("Lottie Load Error", err));
    }, [step]);

    const handleVerifyPan = async () => {
        if (!formData.panCard) return;
        setVerifyingPan(true);
        setErrorMsg('');
        try {
            const res = await verifyPan(formData.panCard, formData.name);
            if (res.success) {
                setIsPanVerified(true);
            }
        } catch (error) {
            setErrorMsg(error.message);
        } finally {
            setVerifyingPan(false);
        }
    };

    const handleVerifyAadhaar = async () => {
        if (!formData.aadhaarNumber) return;
        setVerifyingAadhaar(true);
        setErrorMsg('');
        try {
            const res = await verifyAadhaar(formData.aadhaarNumber, formData.representativeName);
            if (res.success) {
                setIsAadhaarVerified(true);
            }
        } catch (error) {
            setErrorMsg(error.message);
        } finally {
            setVerifyingAadhaar(false);
        }
    };

    const handleChange = (e, section = null) => {
        const { name, value } = e.target;
        if (name === 'panCard') setIsPanVerified(false);
        if (section) {
            setFormData({
                ...formData,
                [section]: {
                    ...formData[section],
                    [name]: value
                }
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    const nextStep = () => {
        setStep(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const prevStep = () => {
        setStep(prev => prev - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        try {
            const data = new FormData();
            data.append('ngoId', formData.ngoId);
            data.append('name', formData.name);
            data.append('email', formData.email);
            data.append('password', formData.password);
            data.append('registrationNumber', formData.registrationNumber);
            data.append('isFcraRegistered', formData.isFcraRegistered);
            if (formData.isFcraRegistered) {
                data.append('fcraNumber', formData.fcraNumber);
            }
            data.append('panCard', formData.panCard);
            data.append('aadhaarNumber', formData.aadhaarNumber);
            data.append('address', formData.address);
            data.append('website', formData.website);
            data.append('workingAreas', JSON.stringify(formData.workingAreas.split(',').map(s => s.trim()).filter(Boolean)));

            if (formData.registrationCertificate) {
                data.append('registrationCertificate', formData.registrationCertificate);
            }

            data.append('bankAccount', JSON.stringify(formData.bankAccount));
            data.append('representative', JSON.stringify({ name: formData.representativeName }));

            const res = await register(data);
            if (res.success) {
                setSuccess(res.data);
            }
        } catch (error) {
            setErrorMsg(error.message || 'Failed to connect to the server.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-2xl w-full bg-white rounded-[3rem] shadow-2xl p-16 text-center border border-slate-100"
                >
                    <div className="w-24 h-24 mx-auto bg-green-50 rounded-3xl flex items-center justify-center mb-8 border border-green-100 shadow-sm">
                        <Check className="w-12 h-12 text-green-500" />
                    </div>
                    <h2 className="text-4xl font-black text-slate-800 tracking-tight italic uppercase mb-4">Application Submitted</h2>
                    <p className="text-slate-500 font-medium mb-10 leading-relaxed">
                        Your NGO has passed automated checks. It is now in the queue for final manual review by our audit team.
                    </p>

                    <div className="inline-block p-8 bg-blue-50 rounded-[2.5rem] border border-blue-100 mb-12 w-full max-w-sm shadow-sm">
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2">Preliminary Trust Score</p>
                        <p className="text-6xl font-black text-slate-900 tracking-tighter italic">{success.trustScore}</p>
                    </div>

                    <button
                        onClick={() => navigate('/login')}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                    >
                        Go to Access Terminal <ArrowRight className="w-5 h-5" />
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
            <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[3rem] shadow-2xl shadow-slate-200 overflow-hidden border border-slate-100">

                {/* Left Side: Dynamic Animation & Progress */}
                <div className="relative hidden lg:flex flex-col items-center justify-center p-16 bg-blue-50 transition-colors duration-700">
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
                                        <div className="w-12 h-12 border-4 border-blue-200 border-t-transparent rounded-full animate-spin" />
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
                            <h2 className="text-4xl font-black text-blue-900 tracking-tighter capitalize italic">
                                {stepContent[step].title}
                            </h2>
                            <p className="text-slate-500 font-medium leading-relaxed italic">
                                {stepContent[step].desc}
                            </p>
                        </motion.div>

                        {/* Progress Indicators */}
                        <div className="flex gap-3 justify-center mt-12">
                            {[1, 2, 3, 4].map(s => (
                                <div
                                    key={s}
                                    className={`h-1.5 rounded-full transition-all duration-500 ${step === s ? 'w-12 bg-blue-500' : 'w-4 bg-blue-200'}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Branding */}
                    <div className="absolute top-12 left-12 flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-black text-blue-900 tracking-tighter uppercase text-sm">ImpactFlash</span>
                    </div>

                    {/* Decorative Blobs */}
                    <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-32 -mt-32 animate-pulse" />
                    <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -mr-40 -mb-40 animate-pulse" />
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
                                className="space-y-8"
                                onKeyPress={(e) => e.key === 'Enter' && nextStep()}
                            >
                                <div>
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-6">
                                        <Building className="w-4 h-4 text-blue-600" />
                                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{stepContent[1].pill}</span>
                                    </div>
                                    <h2 className="text-4xl font-black text-slate-800 tracking-tight italic uppercase">NGO Registration</h2>
                                    <p className="text-slate-500 font-medium">Verify your organization's legal identity.</p>
                                </div>

                                {errorMsg && (
                                    <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-[11px] font-black uppercase tracking-wider flex items-center gap-3 shadow-sm">
                                        <Info className="w-4 h-4" />
                                        {errorMsg}
                                    </div>
                                )}

                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <OnboardingInput label="NGO ID" name="ngoId" icon={<User />} placeholder="NGO12345" value={formData.ngoId} onChange={handleChange} />
                                        <OnboardingInput label="Rep. Name" name="representativeName" icon={<Shield />} placeholder="Full Name" value={formData.representativeName} onChange={handleChange} />
                                    </div>
                                    <OnboardingInput label="Org Name" name="name" icon={<Building />} placeholder="Charity Trust India" value={formData.name} onChange={handleChange} />
                                    <OnboardingInput label="Reg. Number" name="registrationNumber" icon={<FileText />} placeholder="REG/2024/001" value={formData.registrationNumber} onChange={handleChange} />
                                    <OnboardingInput label="Official Email" name="email" type="email" icon={<Mail />} placeholder="contact@charity.org" value={formData.email} onChange={handleChange} />
                                    <OnboardingInput label="Secure Password" name="password" type="password" icon={<Lock />} placeholder="••••••••" value={formData.password} onChange={handleChange} />

                                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">FCRA Registration?</label>
                                            <div className="flex gap-4">
                                                {['Yes', 'No'].map((opt) => (
                                                    <button
                                                        key={opt}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, isFcraRegistered: opt === 'Yes' })}
                                                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.isFcraRegistered === (opt === 'Yes') ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white text-slate-400 border border-slate-100'}`}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        {formData.isFcraRegistered && (
                                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                                                <OnboardingInput label="FCRA Number" name="fcraNumber" icon={<Sparkles />} placeholder="Enter FCRA Number" value={formData.fcraNumber} onChange={handleChange} />
                                            </motion.div>
                                        )}
                                    </div>

                                    <OnboardingInput label="Address" name="address" icon={<MapPin />} placeholder="Full Address" value={formData.address} onChange={handleChange} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <OnboardingInput label="Website" name="website" type="url" icon={<Globe />} placeholder="charity.org" value={formData.website} onChange={handleChange} />
                                        <OnboardingInput label="Working Areas" name="workingAreas" icon={<Sparkles />} placeholder="Healthcare, etc." value={formData.workingAreas} onChange={handleChange} />
                                    </div>

                                    <div className="relative group/file">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1 transition-colors group-focus-within/file:text-blue-500">Reg. Certificate</label>
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept=".pdf,image/*"
                                                onChange={(e) => setFormData({ ...formData, registrationCertificate: e.target.files[0] })}
                                                className="w-full px-6 py-4 rounded-2xl bg-slate-50/50 border border-slate-100 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all font-bold text-slate-800 file:hidden cursor-pointer"
                                            />
                                            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold pointer-events-none italic">
                                                {formData.registrationCertificate ? formData.registrationCertificate.name : 'Upload PDF/Image'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={nextStep}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                                >
                                    Continue to Finance <ArrowRight className="w-5 h-5" />
                                </button>

                                <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                    Already registered? <Link to="/login" className="text-blue-500 hover:underline">Access Terminal</Link>
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
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-6">
                                        <Landmark className="w-4 h-4 text-blue-600" />
                                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{stepContent[2].pill}</span>
                                    </div>
                                    <h2 className="text-4xl font-black text-slate-800 tracking-tight italic uppercase">Finance Hub</h2>
                                    <p className="text-slate-500 font-medium">Configure protocol-compliant banking.</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="relative group/pan">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Org PAN Verification</label>
                                        <div className="flex gap-3">
                                            <div className="relative flex-1">
                                                <Shield className={`absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 ${isPanVerified ? 'text-green-500' : 'text-slate-300'}`} />
                                                <input
                                                    required
                                                    type="text"
                                                    name="panCard"
                                                    value={formData.panCard}
                                                    onChange={handleChange}
                                                    className={`w-full pl-14 pr-6 py-4 rounded-2xl border ${isPanVerified ? 'border-green-500 bg-green-50' : 'border-slate-100 bg-slate-50/50'} focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all font-bold text-slate-800 uppercase`}
                                                    placeholder="PAN NUMBER"
                                                />
                                            </div>
                                            <button
                                                onClick={handleVerifyPan}
                                                disabled={verifyingPan || isPanVerified || !formData.panCard}
                                                className={`px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${isPanVerified ? 'bg-green-500 text-white' : 'bg-slate-900 text-white hover:bg-black disabled:bg-slate-100 disabled:text-slate-400'}`}
                                            >
                                                {verifyingPan ? 'Verifying...' : isPanVerified ? 'Verified ✓' : 'Verify'}
                                            </button>
                                        </div>
                                        {isPanVerified && (
                                            <motion.p initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-3 text-[9px] font-black text-green-600 uppercase tracking-widest flex items-center gap-2 ml-1">
                                                <Check className="w-3 h-3" strokeWidth={4} /> Identity Authenticated via ITD Infrastructure
                                            </motion.p>
                                        )}
                                    </div>

                                    <OnboardingInput label="Bank Name" name="bankName" icon={<Landmark />} placeholder="HDFC Bank" value={formData.bankAccount.bankName} onChange={(e) => handleChange(e, 'bankAccount')} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <OnboardingInput label="Account Number" name="accountNumber" icon={<FileText />} placeholder="000000000" value={formData.bankAccount.accountNumber} onChange={(e) => handleChange(e, 'bankAccount')} />
                                        <OnboardingInput label="IFSC Code" name="ifscCode" icon={<Sparkles />} placeholder="HDFC0001234" value={formData.bankAccount.ifscCode} onChange={(e) => handleChange(e, 'bankAccount')} />
                                    </div>

                                    <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-6 text-[11px] font-medium text-blue-800 flex gap-4 leading-relaxed">
                                        <Info className="w-5 h-5 shrink-0 text-blue-500" />
                                        <p>Protocol performs a ₹1 micro-transaction verify to this account to initialize escrow relay nodes.</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button onClick={prevStep} className="flex-1 py-5 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 border border-slate-100 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                                        <ArrowLeft className="w-4 h-4" /> Profile
                                    </button>
                                    <button
                                        onClick={nextStep}
                                        disabled={!isPanVerified}
                                        className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
                                    >
                                        Confirm Verification <ArrowRight className="w-5 h-5" />
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
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-6">
                                        <Shield className="w-4 h-4 text-blue-600" />
                                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{stepContent[3].pill}</span>
                                    </div>
                                    <h2 className="text-4xl font-black text-slate-800 tracking-tight italic uppercase">Identity Node</h2>
                                    <p className="text-slate-500 font-medium">Representative UIDAI authentication.</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="relative group/aadhaar">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">UIDAI Aadhaar Verification</label>
                                        <div className="flex gap-3">
                                            <div className="relative flex-1">
                                                <User className={`absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 ${isAadhaarVerified ? 'text-green-500' : 'text-slate-300'}`} />
                                                <input
                                                    required
                                                    type="text"
                                                    name="aadhaarNumber"
                                                    value={formData.aadhaarNumber}
                                                    onChange={handleChange}
                                                    className={`w-full pl-14 pr-6 py-4 rounded-2xl border ${isAadhaarVerified ? 'border-green-500 bg-green-50' : 'border-slate-100 bg-slate-50/50'} focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all font-bold text-slate-800`}
                                                    placeholder="12-DIGIT AADHAAR"
                                                />
                                            </div>
                                            <button
                                                onClick={handleVerifyAadhaar}
                                                disabled={verifyingAadhaar || isAadhaarVerified || !formData.aadhaarNumber}
                                                className={`px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${isAadhaarVerified ? 'bg-green-500 text-white' : 'bg-slate-900 text-white hover:bg-black disabled:bg-slate-100 disabled:text-slate-400'}`}
                                            >
                                                {verifyingAadhaar ? 'Calling UIDAI...' : isAadhaarVerified ? 'Authenticated ✓' : 'Verify'}
                                            </button>
                                        </div>
                                        {isAadhaarVerified && (
                                            <motion.p initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-3 text-[9px] font-black text-green-600 uppercase tracking-widest flex items-center gap-2 ml-1">
                                                <Check className="w-3 h-3" strokeWidth={4} /> Representative Identity Confirmed via Biometric Link
                                            </motion.p>
                                        )}
                                    </div>

                                    <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 text-[11px] font-medium text-slate-600 flex gap-4 leading-relaxed">
                                        <Shield className="w-5 h-5 shrink-0 text-blue-500" />
                                        <p>ImpactFlash uses zero-knowledge proofs to verify identity without storing sensitive biometric data on permanent ledger nodes.</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button onClick={prevStep} className="flex-1 py-5 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 border border-slate-100 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                                        <ArrowLeft className="w-4 h-4" /> Finance
                                    </button>
                                    <button
                                        onClick={nextStep}
                                        disabled={!isAadhaarVerified}
                                        className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
                                    >
                                        Authorization Consent <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-10"
                            >
                                <div>
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-6">
                                        <Sparkles className="w-4 h-4 text-blue-600" />
                                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{stepContent[4].pill}</span>
                                    </div>
                                    <h2 className="text-4xl font-black text-slate-800 tracking-tight italic uppercase">Final Protocol</h2>
                                    <p className="text-slate-500 font-medium">Initialize automated audit sequence.</p>
                                </div>

                                <div className="space-y-8 text-center py-8">
                                    <div className="w-24 h-24 mx-auto bg-blue-100 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-sm">
                                        <Shield className="w-12 h-12 text-blue-600" />
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-2xl font-black text-slate-800 tracking-tight italic uppercase">Ready for Audit</h3>
                                        <p className="text-slate-500 font-medium leading-relaxed max-w-sm mx-auto">
                                            All organization nodes are configured. Automated AI verification will scan FCRA and Income Tax databases.
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-loose max-w-md mx-auto">
                                        <p className="text-slate-800 mb-2 font-black italic">Authorization Consent</p>
                                        <p>By initializing, you permit ImpactFlash to perform audit scans across cross-border regulation registries.</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button onClick={prevStep} className="flex-1 py-5 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 border border-slate-100 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                                        <ArrowLeft className="w-4 h-4" /> Finance
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
                                    >
                                        {loading ? (
                                            <div className="w-6 h-6 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>Initialize Verification <ArrowRight className="w-5 h-5" /></>
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

function OnboardingInput({ label, name, placeholder, type = "text", value, onChange, icon }) {
    return (
        <div className="text-left group/input relative">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2.5 ml-1 transition-colors group-focus-within/input:text-blue-500">
                {label}
            </label>
            <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/input:text-blue-500 transition-colors">
                    {React.cloneElement(icon, { size: 18 })}
                </div>
                <input
                    required
                    name={name}
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50/50 border border-slate-100 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all font-bold text-slate-800 placeholder:text-slate-300"
                />
            </div>
        </div>
    );
}
