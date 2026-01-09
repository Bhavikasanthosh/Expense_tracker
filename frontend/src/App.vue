<template>
  <div class="expense-app">
    <header>
      <h1>💰 My Expense Tracker</h1>
      <div class="salary-section">
        <label>Monthly Salary: </label>
        <input type="number" v-model="salary" placeholder="Enter amount">
      </div>
    </header>

    <main class="dashboard">
      <section class="card add-transaction">
        <h2>Add New Item</h2>
        <input type="text" v-model="newItem.title" placeholder="Title (e.g., Rent, Groceries)">
        <input type="number" v-model="newItem.amount" placeholder="Amount">
        
        <div class="type-selector">
          <label>
            <input type="radio" value="variable" v-model="newItem.category"> Daily
          </label>
          <label>
            <input type="radio" value="fixed" v-model="newItem.category"> Fixed Bill
          </label>
        </div>
        
        <button class="btn-save" @click="submitExpense">Save Transaction</button>
      </section>

      <section class="card summary">
        <h2>Summary</h2>
        <div class="stat">
          <span>Remaining Balance:</span> 
          <strong :class="{ 'text-danger': balance < 0 }">€{{ balance.toFixed(2) }}</strong>
        </div>
        <div class="stat"><span>Total Fixed Costs:</span> €{{ totalFixed.toFixed(2) }}</div>
      </section>
    </main>

    <section class="card history">
      <h2>Transaction History</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Title</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in transactions" :key="t._id">
            <td>{{ new Date(t.date).toLocaleDateString() }}</td>
            <td>{{ t.title }}</td>
            <td><span :class="['badge', t.category]">{{ t.category }}</span></td>
            <td>€{{ t.amount.toFixed(2) }}</td>
            <td>
              <button class="btn-delete" @click="deleteTransaction(t._id)">🗑️</button>
            </td>
          </tr>
          <tr v-if="transactions.length === 0">
            <td colspan="5" style="text-align: center;">No transactions found.</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import axios from 'axios';

// API Base URL
const API_URL = 'http://localhost:5000/api/transactions';

const salary = ref(parseFloat(localStorage.getItem('userSalary')) || 0);
const transactions = ref([]);
const newItem = ref({ title: '', amount: 0, category: 'variable' });

watch(salary, (newVal) => localStorage.setItem('userSalary', newVal));

const fetchTransactions = async () => {
  try {
    const response = await axios.get(API_URL);
    transactions.value = response.data;
  } catch (error) {
    console.error("Fetch Error:", error.response || error);
  }
};

onMounted(fetchTransactions);

const submitExpense = async () => {
  if (!newItem.value.title || newItem.value.amount <= 0) return;
  
  try {
    const response = await axios.post(API_URL, {
      title: newItem.value.title,
      amount: newItem.value.amount,
      category: newItem.value.category
    });
    transactions.value.unshift(response.data);
    newItem.value = { title: '', amount: 0, category: 'variable' };
  } catch (error) {
    console.error("Post Error:", error.response || error);
    alert("Connection failed! Check the browser console for details.");
  }
};

const deleteTransaction = async (id) => {
  if (!confirm("Delete this?")) return;
  try {
    await axios.delete(`${API_URL}/${id}`);
    transactions.value = transactions.value.filter(t => t._id !== id);
  } catch (error) {
    console.error("Delete Error:", error);
  }
};

const totalFixed = computed(() => transactions.value.filter(t => t.category === 'fixed').reduce((acc, t) => acc + t.amount, 0));
const balance = computed(() => salary.value - transactions.value.reduce((acc, t) => acc + t.amount, 0));
</script>

<style scoped>
.expense-app { font-family: 'Inter', sans-serif; max-width: 900px; margin: 0 auto; padding: 20px; color: #2c3e50; }
header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #eee; padding-bottom: 20px; }
.salary-section input { width: 120px; padding: 8px; font-weight: bold; border-radius: 4px; border: 1px solid #ccc; }
.dashboard { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 30px; }
.card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #eee; margin-bottom: 20px; }
input { width: 90%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 6px; }
button { cursor: pointer; border: none; border-radius: 6px; font-weight: bold; transition: 0.3s; }
.btn-save { width: 100%; padding: 12px; background: #42b983; color: white; }
.btn-save:hover { background: #3aa876; }
.btn-delete { background: none; font-size: 1.2rem; padding: 5px; }
.btn-delete:hover { transform: scale(1.2); }
.stat { display: flex; justify-content: space-between; margin: 15px 0; font-size: 1.1rem; }
.text-danger { color: #e74c3c; }

table { width: 100%; border-collapse: collapse; margin-top: 10px; }
th, td { text-align: left; padding: 12px; border-bottom: 1px solid #eee; }
.badge { padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; text-transform: uppercase; }
.fixed { background: #d1ecf1; color: #0c5460; }
.variable { background: #fff3cd; color: #856404; }
</style>