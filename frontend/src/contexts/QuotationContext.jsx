import React, { createContext, useState } from 'react';

export const QuotationContext = createContext(null);

export const QuotationProvider = ({ children }) => {
  const [activeQuotation, setActiveQuotation] = useState(null);
  const [cartItems, setCartItems] = useState([]);

  // TODO: Implement quote builder actions (addItem, removeItem, updateDiscount)

  const addItem = (product) => {
    setCartItems((prev) => [...prev, product]);
  };

  const removeItem = (productId) => {
    setCartItems((prev) => prev.filter((p) => p.id !== productId));
  };

  const updateDiscount = (discount) => {
    // TODO: Update discount settings
  };

  return (
    <QuotationContext.Provider
      value={{
        activeQuotation,
        setActiveQuotation,
        cartItems,
        addItem,
        removeItem,
        updateDiscount
      }}
    >
      {children}
    </QuotationContext.Provider>
  );
};
