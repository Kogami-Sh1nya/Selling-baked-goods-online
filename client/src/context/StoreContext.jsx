import { createContext, useContext, useEffect, useState } from 'react';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user') || 'null')
  );

  const [cart, setCart] = useState(
    JSON.parse(localStorage.getItem('cart') || '{}')
  );

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  function addToCart(product, delta = 1) {
  setCart((currentCart) => {
    const currentQuantity = currentCart[product.id]?.qty || 0;
    const maxQuantity = Number(product.stock_quantity) || 0;
    const nextQuantity = Math.max(
      0,
      Math.min(currentQuantity + delta, maxQuantity)
    );

    if (delta > 0 && currentQuantity >= maxQuantity) {
      alert(`В наличии только ${maxQuantity} шт.`);
      return currentCart;
    }

    const nextCart = { ...currentCart };

    if (nextQuantity > 0) {
      nextCart[product.id] = {
        product,
        qty: nextQuantity
      };
    } else {
      delete nextCart[product.id];
    }

    return nextCart;
  });
}

  function getQuantity(productId) {
    return cart[productId]?.qty || 0;
  }

  const items = Object.values(cart);

  return (
    <StoreContext.Provider
      value={{
        user,
        setUser,
        cart,
        items,
        addToCart,
        getQuantity
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}