// TODO: Quotation context for active quote builder state
import React, { createContext, useState } from 'react';

const QuotationContext = createContext();

export const QuotationProvider = ({ children }) => {
  // TODO: Manage quote items, discounts, customer selection
  const [quote, setQuote] = useState({
    items: [],
    customer: null,
    discount: 0,
    notes: '',
  });

  return (
    <QuotationContext.Provider value={{ quote, setQuote }}>
      {children}
    </QuotationContext.Provider>
  );
};

export default QuotationContext;
