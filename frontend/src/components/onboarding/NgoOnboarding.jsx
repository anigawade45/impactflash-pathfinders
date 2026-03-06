import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function NgoOnboarding() {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        fcraNumber: '',
        panCard: '',
        address: '',
        registrationCertificate: '',
        bankAccount: {
            accountNumber: '',
            ifscCode: '',
            bankName: ''
        },
        representative: {
            name: '',
            aadhaar: '',
            pan: ''
        }
    });

    const handleChange = (e, section = null) => {
        const { name, value } = e.target;
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
            data.append('name', formData.name);
            data.append('email', formData.email);
            data.append('fcraNumber', formData.fcraNumber);
            data.append('panCard', formData.panCard);
            data.append('address', formData.address);

            // Append file
            if (formData.registrationCertificate) {
                data.append('registrationCertificate', formData.registrationCertificate);
            }

            // Append nested objects as strings (Backend will parse them)
            data.append('bankAccount', JSON.stringify(formData.bankAccount));
            data.append('representative', JSON.stringify(formData.representative));

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
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Organization Name</label>
                            <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all shadow-sm text-slate-900 placeholder-slate-400" placeholder="Charity Trust India" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Official Email</label>
                            <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all shadow-sm text-slate-900 placeholder-slate-400" placeholder="contact@charity.org" />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">FCRA Registration</label>
                                <input required type="text" name="fcraNumber" value={formData.fcraNumber} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all shadow-sm text-slate-900 placeholder-slate-400" placeholder="FCRA Number" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Organization PAN</label>
                                <input required type="text" name="panCard" value={formData.panCard} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all shadow-sm text-slate-900 placeholder-slate-400" placeholder="PAN Number" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Registered Address (Used for Geo-Validation)</label>
                            <input required type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all shadow-sm text-slate-900 placeholder-slate-400" placeholder="Full Registered Address" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Registration Certificate (PDF/Image)</label>
                            <input
                                required
                                type="file"
                                accept=".pdf,image/*"
                                onChange={(e) => setFormData({ ...formData, registrationCertificate: e.target.files[0] })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all shadow-sm text-slate-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer"
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
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Representative Name</label>
                            <input required type="text" name="name" value={formData.representative.name} onChange={(e) => handleChange(e, 'representative')} className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all shadow-sm text-slate-900 placeholder-slate-400" placeholder="Full Legal Name" />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Aadhaar Number</label>
                                <input required type="text" name="aadhaar" value={formData.representative.aadhaar} onChange={(e) => handleChange(e, 'representative')} className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all shadow-sm text-slate-900 placeholder-slate-400" placeholder="12-digit Aadhaar" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Personal PAN</label>
                                <input required type="text" name="pan" value={formData.representative.pan} onChange={(e) => handleChange(e, 'representative')} className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all shadow-sm text-slate-900 placeholder-slate-400" placeholder="PAN Number" />
                            </div>
                        </div>

                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-600">
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

                    <button type="submit" disabled={loading} className="btn-primary py-3 px-8">
                        {loading ? 'Processing...' : step === 3 ? 'Submit Application' : 'Continue'}
                    </button>
                </div>
            </form>
        </div>
    );
}
