import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function NgoOnboarding() {
    const navigate = useNavigate();
    const { register, verifyPan } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [verifyingPan, setVerifyingPan] = useState(false);
    const [isPanVerified, setIsPanVerified] = useState(false);
    const [success, setSuccess] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');

    const [formData, setFormData] = useState({
        ngoId: '',
        name: '',
        email: '',
        password: '',
        registrationNumber: '',
        isFcraRegistered: false,
        fcraNumber: '',
        panCard: '',
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

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        try {
            const data = new FormData();
            // Append top level fields
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
            data.append('address', formData.address);
            data.append('website', formData.website);
            data.append('workingAreas', JSON.stringify(formData.workingAreas.split(',').map(s => s.trim()).filter(Boolean)));

            // Append file
            if (formData.registrationCertificate) {
                data.append('registrationCertificate', formData.registrationCertificate);
            }

            // Append nested objects as strings (Backend will parse them)
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
            <div className="max-w-2xl mx-auto mt-20 p-8 modern-card text-center animate-fade-in">
                <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
                <h2 className="text-3xl font-bold text-slate-800 mb-4">Application Submitted</h2>
                <p className="text-slate-600 mb-6">
                    Your NGO has passed automated checks with a score of {success.trustScore}. It is now in queue for final manual review by our admin team.
                </p>
                <div className="inline-block p-4 bg-orange-50 rounded-xl border border-orange-100 mb-8 w-full max-w-sm">
                    <p className="text-sm font-semibold text-orange-600 uppercase tracking-widest mb-1">Pending Trust Score</p>
                    <p className="text-5xl font-black text-slate-900">{success.trustScore}</p>
                </div>
                <div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-8 py-3 btn-primary">
                        Go to Submissions
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto mt-20 p-8 modern-card animate-fade-in">
            <div className="mb-8 border-b border-slate-200 pb-6 flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 mb-2">NGO Onboarding</h2>
                    <p className="text-slate-500">Step {step} of 3: {['Organization Details', 'Bank Configuration', 'Representative KYC'][step - 1]}</p>
                </div>
                <div className="flex gap-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`h-2 w-12 rounded-full ${i <= step ? 'bg-orange-500' : 'bg-slate-200'}`} />
                    ))}
                </div>
            </div>

            {errorMsg && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-semibold flex items-center gap-3 animate-fade-in shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]">
                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    {errorMsg}
                </div>
            )}

            <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
                {step === 1 && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">NGO ID</label>
                                <input required type="text" name="ngoId" value={formData.ngoId} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm text-slate-900 placeholder-slate-400" placeholder="NGO12345" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Representative Name</label>
                                <input required type="text" name="representativeName" value={formData.representativeName} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm text-slate-900 placeholder-slate-400" placeholder="Full Legal Name" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Organization Name</label>
                                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm text-slate-900 placeholder-slate-400" placeholder="Charity Trust India" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">NGO Registration Number</label>
                                <input required type="text" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm text-slate-900 placeholder-slate-400" placeholder="REG/2024/001" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Official Email</label>
                            <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm text-slate-900 placeholder-slate-400" placeholder="contact@charity.org" />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Secure Password</label>
                            <input required type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm text-slate-900 placeholder-slate-400" placeholder="••••••••" />
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-sm font-semibold text-slate-700">Is FCRA Registered?</label>
                                <div className="flex items-center gap-4">
                                    <label className="inline-flex items-center">
                                        <input type="radio" className="form-radio text-orange-500" name="isFcraRegistered" checked={formData.isFcraRegistered === true} onChange={() => setFormData({ ...formData, isFcraRegistered: true })} />
                                        <span className="ml-2 text-sm text-slate-600">Yes</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <input type="radio" className="form-radio text-orange-500" name="isFcraRegistered" checked={formData.isFcraRegistered === false} onChange={() => setFormData({ ...formData, isFcraRegistered: false })} />
                                        <span className="ml-2 text-sm text-slate-600">No</span>
                                    </label>
                                </div>
                            </div>
                            {formData.isFcraRegistered && (
                                <div className="animate-fade-in">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">FCRA Registration Number</label>
                                    <input required type="text" name="fcraNumber" value={formData.fcraNumber} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all" placeholder="Enter FCRA Number" />
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Registered Address</label>
                            <input required type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm text-slate-900 placeholder-slate-400" placeholder="Full Registered Address" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Website URL</label>
                                <input type="url" name="website" value={formData.website} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm text-slate-900 placeholder-slate-400" placeholder="https://www.charity.org" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Working Areas</label>
                                <input required type="text" name="workingAreas" value={formData.workingAreas} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm text-slate-900 placeholder-slate-400" placeholder="Healthcare, Agriculture" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Registration Certificate (PDF/Image)</label>
                            <input
                                required
                                type="file"
                                accept=".pdf,image/*"
                                onChange={(e) => setFormData({ ...formData, registrationCertificate: e.target.files[0] })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm text-slate-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer"
                            />
                            {formData.registrationCertificate && (
                                <p className="mt-2 text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1">
                                    📎 {formData.registrationCertificate.name} selected
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Organization PAN Card</label>
                            <div className="flex gap-3">
                                <input
                                    required
                                    type="text"
                                    name="panCard"
                                    value={formData.panCard}
                                    onChange={handleChange}
                                    className={`flex-1 px-4 py-3 rounded-xl border ${isPanVerified ? 'border-green-500 bg-green-50' : 'border-slate-300 bg-white'} focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm text-slate-900 placeholder-slate-400`}
                                    placeholder="PAN Number"
                                    disabled={loading || verifyingPan}
                                />
                                <button
                                    type="button"
                                    onClick={handleVerifyPan}
                                    disabled={verifyingPan || isPanVerified || !formData.panCard}
                                    className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isPanVerified
                                        ? 'bg-green-600 text-white cursor-default'
                                        : 'bg-slate-900 text-white hover:bg-black disabled:bg-slate-200 disabled:text-slate-400'
                                        }`}
                                >
                                    {verifyingPan ? 'Verifying...' : isPanVerified ? 'Verified ✓' : 'Verify PAN'}
                                </button>
                            </div>
                            {isPanVerified && (
                                <p className="mt-2 text-[10px] font-black text-green-600 uppercase tracking-widest flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                    Identity Authenticated via ITD
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Bank Name</label>
                            <input required type="text" name="bankName" value={formData.bankAccount.bankName} onChange={(e) => handleChange(e, 'bankAccount')} className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all shadow-sm text-slate-900 placeholder-slate-400" placeholder="HDFC Bank" />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Account Number</label>
                                <input required type="text" name="accountNumber" value={formData.bankAccount.accountNumber} onChange={(e) => handleChange(e, 'bankAccount')} className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all shadow-sm text-slate-900 placeholder-slate-400" placeholder="Account Number" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">IFSC Code</label>
                                <input required type="text" name="ifscCode" value={formData.bankAccount.ifscCode} onChange={(e) => handleChange(e, 'bankAccount')} className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all shadow-sm text-slate-900 placeholder-slate-400" placeholder="HDFC0001234" />
                            </div>
                        </div>
                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-800 flex gap-3">
                            <svg className="w-5 h-5 shrink-0 text-orange-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            <p>We will perform a ₹1 penny drop verification on this account to ensure successful escrow releases.</p>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-8 text-center py-6">
                        <div className="w-20 h-20 mx-auto bg-orange-100 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-2">Ready for Verification</h3>
                            <p className="text-slate-600 max-w-sm mx-auto">
                                All your details are collected. Click the button below to send your data for automated AI verification.
                            </p>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-600 max-w-md mx-auto">
                            <p className="font-semibold text-slate-800 mb-1">Final Authorization</p>
                            <p>By submitting this form, you consent to our automated AI verification process across FCRA and Income Tax databases.</p>
                        </div>
                    </div>
                )}

                <div className="mt-8 flex justify-between pt-6 border-t border-slate-100">
                    {step > 1 ? (
                        <button type="button" onClick={prevStep} className="btn-secondary py-3 px-6">
                            Back
                        </button>
                    ) : <div></div>}

                    <button type="submit" disabled={loading || (step === 2 && !isPanVerified)} className="btn-primary py-3 px-8">
                        {loading ? 'Processing...' : step === 3 ? 'Send data for verification' : 'Continue'}
                    </button>
                </div>
            </form>
        </div>
    );
}
