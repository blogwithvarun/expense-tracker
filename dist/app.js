import { Transaction } from "./Transaction.js";
let transactions = [];
let currentTypeFilter = "all";
let currentCategoryFilter = "all";
let txType;
function fetchAllTransaction() {
    let txList = localStorage.getItem("transactions");
    transactions = txList ? JSON.parse(txList) : [];
    console.log(transactions);
}
function saveAllTransactions() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}
function saveTransaction(tx) {
    transactions.push(tx);
    localStorage.setItem("transactions", JSON.stringify(transactions));
}
//Toggle on type
document.querySelectorAll(".type").forEach((option) => {
    option.addEventListener("click", (e) => {
        const targetType = e.currentTarget;
        txType = targetType.dataset.value;
        document.querySelectorAll(".type").forEach((t) => {
            t.classList.remove("income-active", "expense-active");
        });
        const targetClassList = e.currentTarget;
        if (txType === "income") {
            targetClassList.classList.add("income-active");
        }
        else {
            targetClassList.classList.add("expense-active");
        }
    });
});
//Save Transaction
document.querySelector(".save-btn").addEventListener("click", () => {
    const title = document.querySelector("#tx-title-input");
    const titleValue = title.value;
    const amount = document.querySelector("#tx-amount-input");
    const amountValue = Number(amount.value);
    const category = document.querySelector("#tx-category-select");
    const categoryValue = category.value;
    if (!titleValue || !amountValue || !categoryValue || !txType) {
        alert("Please provide valid inputs!!");
        return;
    }
    if (amountValue <= 0) {
        alert("Please enter a valid positive amount!!");
        return;
    }
    const tx = new Transaction(titleValue, txType, categoryValue, amountValue);
    console.log("Transaction", tx);
    saveTransaction(tx);
    closeModal();
    renderAllTransaction();
    renderSummary();
});
//On load, close the modal
window.addEventListener("load", () => {
    const overlayClasslist = document.querySelector(".modal-overlay");
    overlayClasslist.classList.add("hidden");
});
//Open Modal on Add button
document.querySelector(".addNewBtn").addEventListener("click", () => {
    const overlayClasslist = document.querySelector(".modal-overlay");
    overlayClasslist.classList.remove("hidden");
});
function closeModal() {
    const overlayClasslist = document.querySelector(".modal-overlay");
    const incomeTypeClassList = document.querySelector("#incomeType");
    const expenseTypeClassList = document.querySelector("#expenseType");
    const titleInput = document.querySelector("#tx-title-input");
    const amountInput = document.querySelector("#tx-amount-input");
    const categorySelect = document.querySelector("#tx-category-select");
    overlayClasslist.classList.add("hidden");
    incomeTypeClassList.classList.remove("income-active");
    expenseTypeClassList.classList.remove("expense-active");
    titleInput.value = "";
    amountInput.value = "";
    categorySelect.value = "";
    txType = undefined;
}
//Close- modal
document.querySelector(".close-modal").addEventListener("click", () => {
    closeModal();
});
document.querySelector(".modal-overlay").addEventListener("click", (e) => {
    if (e.target === document.querySelector(".modal-overlay")) {
        closeModal();
    }
});
function renderAllTransaction() {
    const parentTxDiv = document.querySelector(".tx-list");
    parentTxDiv.innerHTML = "";
    const filteredTransactions = getFilteredTransactionData();
    if (!filteredTransactions || filteredTransactions.length === 0) {
        const txDetails = document.createElement("div");
        txDetails.className = "tx no-data"; // Added no-data class for CSS styling
        let innerDiv = `
        <div class="metadata">
          <p>NO DATA FOUND</p>
        </div>
    `;
        txDetails.innerHTML = innerDiv;
        parentTxDiv.append(txDetails);
        return; // FIX 2: Stop execution early
    }
    filteredTransactions.sort((a, b) => b.id - a.id);
    filteredTransactions.forEach((tx) => {
        const txDetails = document.createElement("div");
        txDetails.className = "tx";
        const sign = tx.type === "expense" ? "-" : "+";
        let formattedDate = tx.date;
        if (tx.date.includes("/")) {
            const [day, month, year] = tx.date.split("/");
            formattedDate = new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
            });
        }
        const formattedAmount = tx.amount.toLocaleString("en-IN");
        let amountClass = "";
        if (tx.type.toLowerCase() === "expense") {
            amountClass = "expense-amount";
        }
        else {
            amountClass = "income-amount";
        }
        let innerDiv = `
                <div class="metadata">
                  <p class="tx-title">${tx.title}</p>
                  <p>${tx.category} &#183; ${formattedDate}</p>
                </div>
                <div class="tx-details">
                  <p class="${amountClass}">${sign}₹${formattedAmount}</p>
                  <button class="delete-btn" data-id="${tx.id}">
                    <img src="recycle-bin.png" class="trash-image" alt="delete" />
                  </button>
                </div>
              
            `;
        txDetails.innerHTML = innerDiv;
        parentTxDiv.append(txDetails);
    });
}
function deleteTransaction(id) {
    transactions = transactions.filter((t) => t.id != id);
    saveAllTransactions();
    renderAllTransaction();
    renderSummary();
}
document.querySelector(".tx-list").addEventListener("click", (e) => {
    const listDiv = e.target;
    const deleteBtn = listDiv.closest(".delete-btn");
    if (!deleteBtn)
        return;
    const idToDelete = Number(deleteBtn.dataset.id);
    deleteTransaction(idToDelete);
});
function getFilteredTransactionData() {
    const filtered = transactions.filter((tx) => {
        const matchesType = currentTypeFilter === "all" ||
            tx.type.toLowerCase() === currentTypeFilter;
        const matchesCategory = currentCategoryFilter === "all" ||
            tx.category.toLowerCase() === currentCategoryFilter.toLowerCase();
        return matchesType && matchesCategory;
    });
    return filtered;
}
document.querySelector(".filter").addEventListener("click", (e) => {
    const filterDiv = e.target;
    const clickedBtn = filterDiv.closest(".filter-btn");
    if (!clickedBtn)
        return;
    const currentActiveBtn = document.querySelector(".filter-btn.active");
    if (currentActiveBtn) {
        currentActiveBtn.classList.remove("active");
    }
    currentTypeFilter = clickedBtn.innerText.toLowerCase();
    clickedBtn.classList.add("active");
    renderAllTransaction();
});
document.querySelector("#cat-select").addEventListener("change", (e) => {
    const catSelect = e.target;
    currentCategoryFilter = catSelect.value.toLowerCase();
    renderAllTransaction();
});
function calculateSummary() {
    const filteredTransaction = getFilteredTransactionData();
    const income = filteredTransaction
        .filter((tx) => tx.type.toLowerCase() === "income")
        .reduce((sum, t) => sum + t.amount, 0);
    const expense = filteredTransaction
        .filter((tx) => tx.type.toLowerCase() === "expense")
        .reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expense;
    return { balance, income, expense };
}
function renderSummary() {
    const { balance, income, expense } = calculateSummary();
    const balanceSign = balance < 0 ? "-" : "+";
    const formattedBalance = Math.abs(balance).toLocaleString("en-IN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
    // 2. Format income and expenses with commas
    const formattedIncome = income.toLocaleString("en-IN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
    const formattedExpense = expense.toLocaleString("en-IN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
    const balanceValueDiv = document.querySelector("#balanceValue");
    const incomeValueDiv = document.querySelector("#incomeValue");
    const expenseValueDiv = document.querySelector("#expenseValue");
    balanceValueDiv.innerText = `${balanceSign}₹${formattedBalance}`;
    incomeValueDiv.innerText = `+₹${formattedIncome}`;
    incomeValueDiv.classList.add("income-amount");
    expenseValueDiv.innerText = `-₹${formattedExpense}`;
    expenseValueDiv.classList.add("expense-amount");
}
fetchAllTransaction();
renderAllTransaction();
renderSummary();
