class Cart {
  constructor(items = []) {
    this.items = items;
    this.totalPrice = 0;
  }

  add(item) {
    this.items.push(item);
  }

  remove(item) {
    this.items = this.items.filter((i) => i !== item);
  }

  total() {
    return this.items.reduce((total, item) => total + item.price, 0);
  }
}

module.exports = Cart;
