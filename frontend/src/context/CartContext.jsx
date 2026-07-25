import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../api/axios";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [count, setCount] = useState(0);

  const refreshCart = useCallback(async () => {
    try {
      const res = await api.get("/cart");
      const totalItems = res.data.items.reduce((sum, i) => sum + i.quantity, 0);
      setCount(totalItems);
    } catch {
      setCount(0);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  return (
    <CartContext.Provider value={{ count, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);

