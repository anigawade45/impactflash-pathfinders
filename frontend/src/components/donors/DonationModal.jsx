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
                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: 10 }}
                        className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.2)] overflow-hidden relative z-10 border border-slate-100"
                    >
                        {success ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="p-12 text-center"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                                    className="w-20 h-20 bg-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-orange-500/40"
                                >
                                    <CheckCircle2 className="w-10 h-10 text-white" />
                                </motion.div>
                                <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tighter">Impact Authorized</h2>
                                <p className="text-sm text-slate-500 mb-10 leading-relaxed font-medium px-4">Your contribution has been released to the Escrow cluster. 80G receipt is available in your dashboard.</p>
                                <button
                                    onClick={onClose}
                                    className="w-full bg-slate-900 py-4 rounded-2xl text-lg font-black text-white hover:bg-black transition-all active:scale-95"
                                >
                                    Continue Discovery
                                </button>
                            </motion.div>
                        ) : (
                            <>
                                <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/20 backdrop-blur-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-slate-900 rounded-xl">
                                            <Lock className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Secure Release</h2>
                                            <div className="flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ACTIVE_ESCROW_NODE</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                                        <X className="w-5 h-5 text-slate-400" />
                                    </button>
                                </div>

                                <div className="p-8 space-y-6">
                                    {/* Summary Section */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between px-1">
                                            <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Allocation Queue</h3>
                                            <span className="text-[8px] font-black text-orange-500 uppercase px-2 py-0.5 bg-orange-50 rounded-md border border-orange-100">Verified Marketplace</span>
                                        </div>

                                        <div className="max-h-[160px] overflow-y-auto pr-2 custom-scrollbar space-y-2">
                                            {items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center p-4 bg-slate-50/80 rounded-2xl border border-slate-100/50 group transition-all">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500/40"></div>
                                                        <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight line-clamp-1">{item.title}</span>
                                                    </div>
                                                    <span className="text-sm font-black text-slate-900">₹{item.amount.toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex justify-between items-center px-6 py-5 bg-slate-900 rounded-3xl shadow-xl relative overflow-hidden">
                                            <div className="relative z-10 flex items-center gap-3">
                                                <CreditCard className="w-5 h-5 text-white/60" />
                                                <span className="text-white/40 font-black text-[9px] uppercase tracking-widest">Total Release</span>
                                            </div>
                                            <span className="relative z-10 text-3xl font-black text-white tracking-tighter">₹{totalAmount.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {/* Form Section */}
                                    <div className="space-y-6 pt-2">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 px-1">
                                                <Fingerprint className="w-3.5 h-3.5 text-orange-500" />
                                                <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Identity & Compliance</h3>
                                            </div>
                                            <div className="relative">
                                                <input
                                                    required
                                                    type="text"
                                                    placeholder="ENTER PAN (ABCDE1234F)"
                                                    value={panCard}
                                                    onChange={(e) => setPanCard(e.target.value.toUpperCase())}
                                                    className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-orange-500/30 text-xl font-black placeholder-slate-200 uppercase tracking-widest transition-all shadow-sm"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Visibility Access</h3>
                                            <div className="grid grid-cols-3 gap-2">
                                                {['anonymous', 'public', 'ngo_only'].map(opt => (
                                                    <button
                                                        key={opt}
                                                        onClick={() => setVisibility(opt)}
                                                        className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 transition-all active:scale-95 ${visibility === opt
                                                            ? 'border-slate-900 bg-slate-900 text-white shadow-lg'
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
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-[10px] font-black uppercase flex items-center gap-3"
                                            >
                                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                                {error}
                                            </motion.div>
                                        )}

                                        <div className="space-y-4 pt-2">
                                            <button
                                                onClick={handleConfirm}
                                                disabled={loading}
                                                className="w-full bg-orange-500 hover:bg-orange-600 py-5 rounded-2xl text-lg font-black text-white shadow-xl shadow-orange-500/20 disabled:opacity-50 flex items-center justify-center gap-3 group active:scale-[0.98] transition-all"
                                            >
                                                {loading ? (
                                                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                ) : (
                                                    <>
                                                        <span>Authorize Release</span>
                                                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                                    </>
                                                )}
                                            </button>

                                            <div className="flex items-center justify-center gap-1.5 text-slate-300">
                                                <ShieldCheck className="w-3 h-3 text-slate-400" />
                                                <span className="text-[8px] font-black uppercase tracking-[0.3em]">Network Intelligence Encrypted</span>
                                            </div>
                                        </div>
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
