import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:4000/api', // Asegúrate que el puerto coincida con tu backend
    headers: {
        'Content-Type': 'application/json'
    }
});

// Añadimos el token a las peticiones si ya existe en el localStorage
const token = localStorage.getItem('token');
if (token) {
    apiClient.defaults.headers.common['x-access-token'] = token;
}

export default apiClient;