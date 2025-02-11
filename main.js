const balanceAmount = document.getElementById("balance-amount");
const form = document.getElementById("form");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const transactionTypeInput = document.getElementById("transaction-type");
const transactionList = document.getElementById("transaction-list");
const totalIncome = document.getElementById("total-income");
const totalExpense = document.getElementById("total-expense");

// Initialize transactions array from localStorage or empty array
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// Initial load
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
  form.addEventListener('submit', addNewTransaction);
  transactionList.addEventListener('click', handleTransactionActions);
  updateAllValues();
  renderTransactions();
}

function addNewTransaction(e) {
  e.preventDefault();
  
  const newTransaction = {
    id: Date.now(),
    description: descriptionInput.value.trim(),
    amount: parseFloat(amountInput.value),
    type: transactionTypeInput.value
  };
  
  if (!validateTransaction(newTransaction)) return;
  
  transactions = [...transactions, newTransaction];
  updateAllValues();
  saveToLocalStorage();
  renderTransactions();
  form.reset();
}

function validateTransaction(transaction) {
  return transaction.description && 
         !isNaN(transaction.amount) && 
         transaction.amount > 0 && 
         transaction.type !== 'none' || 
         (alert('Please enter valid transaction details'), false);
}

function renderTransactions() {
  const transactionHTML = transactions
    .map(({ id, type, description, amount }) => `
      <div class="list-with-delete" data-id="${id}">
        <li class="${type}">
          <span>${description}</span>
          <span>$${amount.toFixed(2)}</span>
        </li>
        <div class="delete"><i class="fa-solid fa-trash"></i></div>
      </div>
    `)
    .join('');
    
  transactionList.innerHTML = transactionHTML;
}

function handleTransactionActions(e) {
  const deleteBtn = e.target.closest('.delete');
  if (!deleteBtn) return;
  
  const transactionId = parseInt(deleteBtn.closest('.list-with-delete').dataset.id);
  transactions = transactions.filter(({ id }) => id !== transactionId);
  
  updateAllValues();
  saveToLocalStorage();
  renderTransactions();
}

function updateAllValues() {
  const { balance, incomeTotal, expenseTotal } = transactions.reduce((acc, { type, amount }) => {
    if (type === 'income') {
      acc.incomeTotal += amount;
      acc.balance += amount;
    } else {
      acc.expenseTotal += amount;
      acc.balance -= amount;
    }
    return acc;
  }, { balance: 0, incomeTotal: 0, expenseTotal: 0 });

  // Update DOM
  balanceAmount.textContent = `$${balance.toFixed(2)}`;
  totalIncome.textContent = `$${incomeTotal.toFixed(2)}`;
  totalExpense.textContent = `$${expenseTotal.toFixed(2)}`;
}

function saveToLocalStorage() {
  const storageData = {
    transactions,
    balance: balanceAmount.textContent.replace('$', ''),
    totalIncome: totalIncome.textContent.replace('$', ''),
    totalExpense: totalExpense.textContent.replace('$', '')
  };

  Object.entries(storageData).forEach(([key, value]) => {
    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  }); 
}