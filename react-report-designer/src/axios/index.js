import axios from 'axios';

const api = axios.create({
    baseURL: 'https://localhost:44322/api',
});

api.interceptors.request.use(req => {
    return req;
});

api.interceptors.response.use(
    ({ data }) => {
        return data;
    },
    ({ response: { data } }) => {
        return Promise.reject({ data });
    }
);

export default api;
