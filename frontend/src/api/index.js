import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true
});

export const authApi = {
    login: async (email, password, role) => {
        const response = await api.post('/auth/login', { email, password, role });
        return response.data;
    },
    logout: async () => {
        const response = await api.post('/auth/logout');
        return response.data;
    },
    getMe: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },
    registerNgo: async (data) => {
        const response = await api.post('/ngos/register', data);
        return response.data;
    },
    verifyPan: async (panCard, name) => {
        const response = await api.post('/ngos/verify-pan', { panCard, name });
        return response.data;
    },
    registerDonor: async (data) => {
        const response = await api.post('/donors/register', data);
        return response.data;
    }
};

export const activityApi = {
    submitNeed: async (needData) => {
        const response = await api.post('/activity/need', needData);
        return response.data;
    },
    createCampaign: async (campaignData) => {
        const response = await api.post('/activity/campaign', campaignData);
        return response.data;
    },
    getMyActivities: async () => {
        const response = await api.get('/activity/my-activities');
        return response.data;
    },
    getPending: async () => {
        const response = await api.get('/activity/pending');
        return response.data;
    },
    reviewItem: async (id, type, action) => {
        const response = await api.patch(`/activity/review/${id}`, { type, action });
        return response.data;
    },
    getLiveNeeds: async () => {
        const response = await api.get('/activity/needs/live');
        return response.data;
    },
    getLiveCampaigns: async () => {
        const response = await api.get('/activity/campaigns/live');
        return response.data;
    },
    getImpactStories: async () => {
        const response = await api.get('/public/impact-stories');
        return response.data;
    }
};

export const escrowApi = {
    submitProof: async (data) => {
        const response = await api.post('/escrow/submit-proof', data);
        return response.data;
    },
    verifyMilestone: async (data) => {
        const response = await api.post('/escrow/verify', data);
        return response.data;
    },
    freezeFund: async (data) => {
        const response = await api.post('/escrow/freeze', data);
        return response.data;
    },
    processRefund: async (data) => {
        const response = await api.post('/escrow/refund', data);
        return response.data;
    }
};

export const publicApi = {
    getStats: async () => (await api.get('/public/stats')).data,
    getNgos: async () => (await api.get('/public/ngos')).data,
    getNgoById: async (id) => (await api.get(`/ngos/${id}`)).data,
    getNeeds: async () => (await api.get('/public/needs')).data,
    getAuditLogs: async () => (await api.get('/public/audit-logs')).data,
    getStories: async () => (await api.get('/public/impact-stories')).data
};

export const donationApi = {
    getSuggestion: async () => (await api.get('/donations/suggest')).data,
    initiate: async (data) => (await api.post('/donations/initiate', data)).data,
    verify: async (data) => (await api.post('/donations/verify', data)).data,
    getHistory: async () => (await api.get('/donations/my-donations')).data,
    getReceipt: async (id) => (await api.get(`/donations/receipt/${id}`)).data
};

export default api;
