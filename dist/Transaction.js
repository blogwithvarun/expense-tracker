export class Transaction {
    constructor(title, type, category, amount) {
        this.id = Date.now();
        this.title = title;
        this.type = type;
        this.category = category;
        this.amount = amount;
        this.date = new Date().toLocaleDateString("en-IN");
    }
}
