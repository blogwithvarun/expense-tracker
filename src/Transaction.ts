export type TransactionType = "income" | "expense";

export class Transaction {
    id: number;
    title: string;
    type: TransactionType;
    category: string;
    amount: number;
    date: string;

    constructor(title: string, type: TransactionType, category: string, amount: number) {
        this.id = Date.now();
        this.title = title;
        this.type = type;
        this.category = category;
        this.amount = amount;
        this.date = new Date().toLocaleDateString("en-IN");
    }

}