import axios from 'axios';

// This connects to the Port 5000 we set up in the backend
const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export default {
  getTransactions() {
    return apiClient.get('/transactions');
  },
  addTransaction(transaction) {
    return apiClient.post('/transactions', transaction);
  }
};