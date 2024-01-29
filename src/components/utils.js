export const formatPrice = (price) => {
    return price ? `$${price.toFixed(2)}` : ''; // Assuming prices are in the format 0.00
  };
  