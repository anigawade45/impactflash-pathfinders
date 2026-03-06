import React, { useState, useEffect } from 'react';
import { donationApi } from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Lock, Activity, X, CreditCard, ChevronRight, CheckCircle2, AlertCircle, Fingerprint } from 'lucide-react';

export default function DonationModal({ isOpen, onClose, items, totalAmount }) {
    const [visibility, setVisibility] = useState('anonymous');
    const [panCard, setPanCard] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // if (!isOpen) return null; // Removed as AnimatePresence handles unmounting

    const handleConfirm = async () => {
        if (!panCard) return setError('PAN card is mandatory for tax compliance & fraud prevention.');
        setLoading(true);
        setError('');
        try {
            const res = await donationApi.initiate({
                items,
                totalAmount,
                visibility,
                panCard
            });

            if (res.success && res.url) {
                // Redirect to Stripe Checkout
                window.location.href = res.url;
            } else {
                throw new Error('Failed to initialize payment session');
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Transaction failed. Self-dealing detected?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl"
                    ></motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="w-full max-w-xl bg-white rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden relative z-10 border border-white/20"
                    >
                        {success ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="p-16 text-center"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                                    className="w-32 h-32 bg-orange-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-3xl shadow-orange-500/40"
                                >
                                    <CheckCircle2 className="w-16 h-16 text-white" />
                                </motion.div>
                                <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tighter">Impact Authorized</h2>
                                <p className="text-xl text-slate-500 mb-12 leading-relaxed font-medium">Your contribution has been successfully released to the Escrow cluster. 80G receipt is available in your dashboard.</p>
                                <button
                                    onClick={onClose}
                                    className="w-full btn-primary py-6 rounded-3xl text-2xl shadow-3xl shadow-orange-500/20 active:scale-95 transition-all"
                                >
                                    Continue Discovery
                                </button>
                            </motion.div>
                        ) : (
                            <>
                                <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-slate-900 rounded-2xl shadow-xl">
                                            <Lock className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Secure Release</h2>
                                            <div className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">RAZORPAY_ESCROW_ACTIVE</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl transition-all active:scale-90">
                                        <X className="w-6 h-6 text-slate-400" />
                                    </button>
                                </div>

                                <div className="p-10 space-y-10">
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between px-2">
                                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Allocation Queue</h3>
                                            <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Live Valuation</span>
                                        </div>
                                        <div className="space-y-3">
                                            {items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-orange-500/20 transition-all">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-2 h-2 rounded-full bg-orange-500/50"></div>
                                                        <span className="text-sm font-black text-slate-800 uppercase tracking-tight">{item.title}</span>
                                                    </div>
                                                    <span className="text-xl font-black text-slate-900">₹{item.amount.toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex justify-between items-center px-6 py-8 bg-slate-900 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                                            <div className="absolute inset-0 noise-bg opacity-10"></div>
                                            <div className="relative z-10 flex items-center gap-4">
                                                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md">
                                                    <CreditCard className="w-6 h-6 text-white" />
                                                </div>
                                                <span className="text-white/60 font-black text-[11px] uppercase tracking-widest">Total Authorized Release</span>
                                            </div>
                                            <span className="relative z-10 text-4xl font-black text-white tracking-tighter">₹{totalAmount.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 px-2">
                                            <Fingerprint className="w-4 h-4 text-orange-500" />
                                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Identity & Compliance</h3>
                                        </div>
                                        <div className="relative">
                                            <input
                                                required
                                                type="text"
                                                placeholder="Enter PAN Number (ABCDE1234F)"
                                                value={panCard}
                                                onChange={(e) => setPanCard(e.target.value.toUpperCase())}
                                                className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-3xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 text-2xl font-black placeholder-slate-200 uppercase tracking-widest transition-all"
                                            />
                                            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-orange-500 uppercase tracking-widest bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100">
                                                SECURE_INPUT
                                            </div>
                                        </div>
                                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest text-center">Mandatory for Layer 3 anti-fraud & tax auditing</p>
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] px-2 text-center">Visibility Protocol</h3>
                                        <div className="grid grid-cols-3 gap-4">
                                            {['anonymous', 'public', 'ngo_only'].map(opt => (
                                                <button
                                                    key={opt}
                                                    onClick={() => setVisibility(opt)}
                                                    className={`py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border-2 transition-all active:scale-95 ${visibility === opt
                                                        ? 'border-slate-900 bg-slate-900 text-white shadow-2xl scale-[1.02]'
                                                        : 'border-slate-50 bg-slate-50/50 text-slate-400 hover:border-slate-200'
                                                        }`}
                                                >
                                                    {opt.replace('_', ' ')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-6 bg-rose-50 border border-rose-100 text-rose-600 rounded-3xl text-sm font-black flex items-center gap-4 shadow-xl shadow-rose-500/5"
                                        >
                                            <AlertCircle className="w-6 h-6 flex-shrink-0" />
                                            {error}
                                        </motion.div>
                                    )}

                                    <button
                                        onClick={handleConfirm}
                                        disabled={loading}
                                        className="w-full btn-primary py-7 rounded-[2rem] text-2xl shadow-3xl shadow-orange-500/30 disabled:opacity-50 flex items-center justify-center gap-4 group active:scale-[0.98] transition-all overflow-hidden relative"
                                    >
                                        {loading ? (
                                            <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                <span className="relative z-10">Authorize & Pay</span>
                                                <ChevronRight className="w-6 h-6 relative z-10 group-hover:translate-x-2 transition-transform duration-500" />
                                            </>
                                        )}
                                    </button>
                                    <div className="flex items-center justify-center gap-2 text-slate-300">
                                        <Activity className="w-3 h-3" />
                                        <span className="text-[8px] font-black uppercase tracking-[0.5em]">Network Intelligence Encrypted</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
