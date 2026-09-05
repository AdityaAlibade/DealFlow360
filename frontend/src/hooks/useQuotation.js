import { useContext } from 'react';
import { QuotationContext } from '../contexts/QuotationContext';

export const useQuotation = () => {
  // TODO: Return quotation context state and methods
  const context = useContext(QuotationContext);
  if (!context) {
    throw new Error('useQuotation must be used within a QuotationProvider');
  }
  return context;
};

export default useQuotation;
