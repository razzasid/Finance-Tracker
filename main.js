const balanceAmount = document.getElementById("balance-amount");
const form = document.getElementById("form");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const transactionTypeInput = document.getElementById("transaction-type");
const transactionList = document.getElementById("transaction-list");
const totalIncome = document.getElementById("total-income");
const totalExpense = document.getElementById("total-expense");

let balance = 0;
let totalIncomeValue = 0;
let totalExpenseValue = 0;

// Update balance display
function updateBalance() {
  balanceAmount.textContent = `$${balance.toFixed(2)}`;
}

// Update totals (income or expense)
function updateTotals(amount, type, isAddition = true) {
  localStorage.setItem("balance", balance.toString());
  if (type === "income") {
    totalIncomeValue += isAddition ? amount : -amount;
    totalIncome.textContent = `$${totalIncomeValue.toFixed(2)}`;
    localStorage.setItem("total income", totalIncomeValue.toString());
  } else {
    totalExpenseValue += isAddition ? amount : -amount;
    totalExpense.textContent = `$${totalExpenseValue.toFixed(2)}`;
    localStorage.setItem("total expense", totalExpenseValue.toString());
  }
}

// Add a transaction to the list and update totals
function addTransaction(description, amount, type) {
  const transactionHTML = `
    <div class="list-with-delete">
      <li class=${type}>
        <span>${description}</span><span>$${amount.toFixed(2)}</span>
      </li>
      <div class="delete"><i class="fa-solid fa-trash"></i></div>
    </div>
  `;
  transactionList.insertAdjacentHTML("beforeend", transactionHTML);

  balance += type === "income" ? amount : -amount;
  localStorage.setItem("balance", balance.toString());
  updateTotals(amount, type, true);
  updateBalance();
}

// Save transaction list to localStorage
function saveData() {
  try {
    localStorage.setItem("listData", transactionList.innerHTML);
  } catch (error) {
    console.error("Failed to save data:", error);
    alert("Unable to save transaction. Storage may be full or disabled.");
  }
}

// Load data from localStorage
function loadData() {
  try {
    const listData = localStorage.getItem("listData");
    const balanceData = parseFloat(localStorage.getItem("balance")) || 0;
    const incomeData = parseFloat(localStorage.getItem("total income")) || 0;
    const expenseData = parseFloat(localStorage.getItem("total expense")) || 0;

    balance = balanceData;
    totalIncomeValue = incomeData;
    totalExpenseValue = expenseData;

    if (listData) {
      transactionList.innerHTML = listData;
      updateBalance();
      totalIncome.textContent = `$${incomeData.toFixed(2)}`;
      totalExpense.textContent = `$${expenseData.toFixed(2)}`;
    }
  } catch (error) {
    console.error("Failed to load data:", error);
    alert("Unable to load saved transactions.");
  }
}

// Handle form submission
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const description = descriptionInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const type = transactionTypeInput.value;

  if (!description || isNaN(amount) || amount <= 0 || type === "none") {
    alert("Please enter a valid description and amount.");
    return;
  }

  addTransaction(description, amount, type);
  saveData();
  form.reset();
});

// Handle transaction deletion
transactionList.addEventListener("click", (event) => {
  if (event.target.closest(".delete")) {
    const transactionDiv = event.target.closest(".list-with-delete");
    const transactionAmount = parseFloat(
      transactionDiv
        .querySelector("li span:nth-child(2)")
        .textContent.replace("$", "")
    );
    const transactionType = transactionDiv.querySelector("li").className;

    balance -=
      transactionType === "income" ? transactionAmount : -transactionAmount;
    updateTotals(transactionAmount, transactionType, false);
    updateBalance();

    transactionDiv.remove();
    saveData();
  }
});

// Load saved data on page load
loadData();
