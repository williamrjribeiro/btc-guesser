const userLocale = navigator.language || 'en-US';
const priceFormatter = new Intl.NumberFormat(userLocale, {
  style: 'currency',
  currency: 'USD',
});

export default priceFormatter;