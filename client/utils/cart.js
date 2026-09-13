const CART_KEY = 'loom-cart-v1';

export function getCart() {
  if (typeof window === 'undefined') return [];

  try {
    const stored = window.localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to read cart:', error);
    return [];
  }
}

export function persistCart(items) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function addToCart(product, quantity = 1) {
  const cart = getCart();
  const existing = cart.find((item) => item._id === product._id);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      ...product,
      _id: product._id || product.id,
      quantity,
    });
  }

  persistCart(cart);
  return cart;
}

export function updateQuantity(itemId, quantity) {
  const cart = getCart();
  const next = cart
    .map((item) => (item._id === itemId ? { ...item, quantity: Math.max(1, Number(quantity) || 1) } : item))
    .filter((item) => item.quantity > 0);

  persistCart(next);
  return next;
}

export function removeFromCart(itemId) {
  const next = getCart().filter((item) => item._id !== itemId);
  persistCart(next);
  return next;
}

export function getCartCount() {
  return getCart().reduce((sum, item) => sum + Number(item.quantity || 0), 0);
}

export function getCartSubtotal() {
  return getCart().reduce((sum, item) => {
    const price = Number(item.finalPrice ?? item.price ?? 0);
    return sum + price * Number(item.quantity || 0);
  }, 0);
}
