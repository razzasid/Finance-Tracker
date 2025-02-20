// Constants
const MAX_AMOUNT = 999999999.99;
const STORAGE_KEYS = {
  BALANCE: "balance",
  TRANSACTIONS: "transactions",
  TOTAL_INCOME: "totalIncome",
  TOTAL_EXPENSE: "totalExpense",
};

// State management
class TransactionState {
  constructor() {
    this.balance = 0;
    this.totalIncome = 0;
    this.totalExpense = 0;
    this.transactions = [];
  }

  addTransaction(transaction) {
    this.transactions.push(transaction);

    if (transaction.type === "income") {
      this.totalIncome += transaction.amount;
      this.balance += transaction.amount;
    } else {
      this.totalExpense += transaction.amount;
      this.balance -= transaction.amount;
    }

    this.saveToStorage();
    return transaction;
  }

  removeTransaction(id) {
    const index = this.transactions.findIndex((t) => t.id === id);
    if (index === -1) return false;

    const transaction = this.transactions[index];
    if (transaction.type === "income") {
      this.totalIncome -= transaction.amount;
      this.balance -= transaction.amount;
    } else {
      this.totalExpense -= transaction.amount;
      this.balance += transaction.amount;
    }

    this.transactions.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.BALANCE, this.balance.toString());
      localStorage.setItem(
        STORAGE_KEYS.TOTAL_INCOME,
        this.totalIncome.toString()
      );
      localStorage.setItem(
        STORAGE_KEYS.TOTAL_EXPENSE,
        this.totalExpense.toString()
      );
      localStorage.setItem(
        STORAGE_KEYS.TRANSACTIONS,
        JSON.stringify(this.transactions)
      );
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
  }

  loadFromStorage() {
    try {
      this.balance =
        parseFloat(localStorage.getItem(STORAGE_KEYS.BALANCE)) || 0;
      this.totalIncome =
        parseFloat(localStorage.getItem(STORAGE_KEYS.TOTAL_INCOME)) || 0;
      this.totalExpense =
        parseFloat(localStorage.getItem(STORAGE_KEYS.TOTAL_EXPENSE)) || 0;
      this.transactions =
        JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) || [];
    } catch (error) {
      console.error("Failed to load from localStorage:", error);
      this.reset();
    }
  }

  reset() {
    this.balance = 0;
    this.totalIncome = 0;
    this.totalExpense = 0;
    this.transactions = [];
  }
}

// UI Management
class TransactionUI {
  constructor(state) {
    this.state = state;
    this.initializeElements();
    this.attachEventListeners();
    this.render();
  }

  initializeElements() {
    this.elements = {
      form: document.getElementById("form"),
      description: document.getElementById("description"),
      amount: document.getElementById("amount"),
      type: document.getElementById("transaction-type"),
      list: document.getElementById("transaction-list"),
      balance: document.getElementById("balance-amount"),
      totalIncome: document.getElementById("total-income"),
      totalExpense: document.getElementById("total-expense"),
    };
  }

  attachEventListeners() {
    this.elements.form.addEventListener("submit", this.handleSubmit.bind(this));
    this.elements.list.addEventListener("click", this.handleDelete.bind(this));
  }

  validateInput(description, amount, type) {
    if (description.trim() === "") {
      throw new Error("Please enter a description");
    }
    if (isNaN(amount) || amount <= 0) {
      throw new Error("Please enter a valid amount");
    }
    if (amount > MAX_AMOUNT) {
      throw new Error(`Amount cannot exceed ${MAX_AMOUNT}`);
    }
    if (type === "none") {
      throw new Error("Please select a transaction type");
    }
  }

  handleSubmit(e) {
    e.preventDefault();

    try {
      const description = this.elements.description.value;
      const amount = parseFloat(this.elements.amount.value);
      const type = this.elements.type.value;

      this.validateInput(description, amount, type);

      const transaction = {
        id: Date.now(),
        description,
        amount,
        type,
      };

      this.state.addTransaction(transaction);
      this.render();
      this.resetForm();
    } catch (error) {
      alert(error.message);
    }
  }

  handleDelete(e) {
    const deleteButton = e.target.closest(".delete");
    if (!deleteButton) return;

    const transactionElement = deleteButton.closest(".list-with-delete");
    const transactionId = parseInt(transactionElement.dataset.id);

    if (this.state.removeTransaction(transactionId)) {
      this.render();
    }
  }

  resetForm() {
    this.elements.description.value = "";
    this.elements.amount.value = "";
    this.elements.type.value = "none";
  }

  formatCurrency(amount) {
    return `$${amount.toFixed(2)}`;
  }

  render() {
    // Update summary values
    this.elements.balance.textContent = this.formatCurrency(this.state.balance);
    this.elements.totalIncome.textContent = this.formatCurrency(
      this.state.totalIncome
    );
    this.elements.totalExpense.textContent = this.formatCurrency(
      this.state.totalExpense
    );

    // Update transaction list
    this.elements.list.innerHTML = this.state.transactions
      .map(
        (transaction) => `
        <div class="list-with-delete" data-id="${transaction.id}">
          <li class="${transaction.type}">
            <span>${transaction.description}</span>
            <span>${this.formatCurrency(transaction.amount)}</span>
          </li>
          <div class="delete"><i class="fa-solid fa-trash"></i></div>
        </div>
      `
      )
      .join("");
  }
}

// Initialize application
const state = new TransactionState();
state.loadFromStorage();
const ui = new TransactionUI(state);
