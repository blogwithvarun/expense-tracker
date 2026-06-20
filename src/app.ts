import { Transaction, TransactionType } from "./Transaction.js";

let transactions: Transaction[] = [];
let currentTypeFilter: string = "all";
let currentCategoryFilter: string = "all";

let txType: TransactionType | undefined;

function fetchAllTransaction() {
    let txList = localStorage.getItem("transactions");
    transactions = txList ? JSON.parse(txList) : [];
    console.log(transactions);
}
function saveAllTransactions() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}
function saveTransaction(tx: Transaction) {
    transactions.push(tx);
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

//Toggle on type

document.querySelectorAll(".type")!.forEach((option) => {
    option.addEventListener("click", (e) => {

        const targetType = e.currentTarget as HTMLDivElement;
        txType = targetType.dataset.value as TransactionType;

        document.querySelectorAll(".type").forEach((t) => {
            t.classList.remove("income-active", "expense-active");
        });

        const targetClassList = e.currentTarget as HTMLDivElement;
        if (txType === "income") {
            targetClassList.classList.add("income-active");
        } else {
            targetClassList.classList.add("expense-active");
        }
    });
});
//Save Transaction
document.querySelector(".save-btn")!.addEventListener("click", () => {

    const title = document.querySelector("#tx-title-input") as HTMLInputElement
    const titleValue = title.value;
    const amount = document.querySelector("#tx-amount-input") as HTMLInputElement
    const amountValue = Number(amount.value);
    const category = document.querySelector("#tx-category-select") as HTMLSelectElement;
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
    const overlayClasslist = document.querySelector(".modal-overlay") as HTMLDivElement;
    overlayClasslist.classList.add("hidden");
});
//Open Modal on Add button
document.querySelector(".addNewBtn")!.addEventListener("click", () => {
    const overlayClasslist = document.querySelector(".modal-overlay") as HTMLDivElement;
    overlayClasslist.classList.remove("hidden");
});

function closeModal() {

    const overlayClasslist = document.querySelector(".modal-overlay") as HTMLDivElement;
    const incomeTypeClassList = document.querySelector("#incomeType") as HTMLDivElement;
    const expenseTypeClassList = document.querySelector("#expenseType") as HTMLDivElement;

    const titleInput = document.querySelector("#tx-title-input") as HTMLInputElement;
    const amountInput = document.querySelector("#tx-amount-input") as HTMLInputElement;
    const categorySelect = document.querySelector("#tx-category-select") as HTMLSelectElement;


    overlayClasslist.classList.add("hidden");
    incomeTypeClassList.classList.remove("income-active");
    expenseTypeClassList.classList.remove("expense-active");


    titleInput.value = "";
    amountInput.value = "";
    categorySelect.value = "";
    txType = undefined;
}
//Close- modal
document.querySelector(".close-modal")!.addEventListener("click", () => {
    closeModal();
});

document.querySelector(".modal-overlay")!.addEventListener("click", (e) => {
    if (e.target === document.querySelector(".modal-overlay")) {
        closeModal();
    }
});

function renderAllTransaction() {
    const parentTxDiv = document.querySelector(".tx-list") as HTMLDivElement;
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
        let formattedDate: string = tx.date;
        if (tx.date.includes("/")) {
            const [day, month, year] = tx.date.split("/");
            formattedDate = new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString(
                "en-GB",
                {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                },
            );
        }
        const formattedAmount = tx.amount.toLocaleString("en-IN");
        let amountClass = "";
        if (tx.type.toLowerCase() === "expense") {
            amountClass = "expense-amount";
        } else {
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

function deleteTransaction(id: number) {
    transactions = transactions.filter((t) => t.id != id);
    saveAllTransactions();
    renderAllTransaction();
    renderSummary();
}

document.querySelector(".tx-list")!.addEventListener("click", (e) => {
    const listDiv = e.target as HTMLDivElement;
    const deleteBtn = listDiv.closest(".delete-btn") as HTMLButtonElement;
    if (!deleteBtn) return;

    const idToDelete = Number(deleteBtn.dataset.id);
    deleteTransaction(idToDelete);
});

function getFilteredTransactionData(): Transaction[] {
    const filtered = transactions.filter((tx) => {
        const matchesType =
            currentTypeFilter === "all" ||
            tx.type.toLowerCase() === currentTypeFilter;

        const matchesCategory =
            currentCategoryFilter === "all" ||
            tx.category.toLowerCase() === currentCategoryFilter.toLowerCase();

        return matchesType && matchesCategory;
    });
    return filtered;
}

document.querySelector(".filter")!.addEventListener("click", (e) => {
    const filterDiv = e.target as HTMLDivElement;
    const clickedBtn = filterDiv.closest(".filter-btn") as HTMLButtonElement;
    if (!clickedBtn) return;
    const currentActiveBtn = document.querySelector(".filter-btn.active") as HTMLDivElement;
    if (currentActiveBtn) {
        currentActiveBtn.classList.remove("active");
    }
    currentTypeFilter = clickedBtn.innerText.toLowerCase();
    clickedBtn.classList.add("active");
    renderAllTransaction();
});

document.querySelector("#cat-select")!.addEventListener("change", (e) => {
    const catSelect = e.target as HTMLSelectElement;
    currentCategoryFilter = catSelect.value.toLowerCase();

    renderAllTransaction();
});

function calculateSummary(): { balance: number, income: number, expense: number } {
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
    const balanceValueDiv = document.querySelector("#balanceValue") as HTMLDivElement;
    const incomeValueDiv = document.querySelector("#incomeValue") as HTMLDivElement;
    const expenseValueDiv = document.querySelector("#expenseValue") as HTMLDivElement;

    balanceValueDiv.innerText = `${balanceSign}₹${formattedBalance}`;
    incomeValueDiv.innerText = `+₹${formattedIncome}`;
    incomeValueDiv.classList.add("income-amount");
    expenseValueDiv.innerText = `-₹${formattedExpense}`;
    expenseValueDiv.classList.add("expense-amount");
}
fetchAllTransaction();
renderAllTransaction();
renderSummary();