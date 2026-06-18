export class Transaction {
  constructor(title, amount, type, category) {
    this.id = Date.now();
    this.title = title;
    this.type = type;
    this.category = category;
    this.amount = Number(amount);
    this.date = new Date().toLocaleDateString("en-IN");
  }
}
