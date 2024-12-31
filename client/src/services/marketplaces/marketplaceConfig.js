export const marketplaces = {
  MERCARI: {
    name: 'Mercari',
    logo: '/mercari-logo.png',
    requiredFields: ['title', 'description', 'price', 'condition', 'shipping'],
    categories: ['Clothing', 'Electronics', 'Home & Garden', 'Other'],
  },
  POSHMARK: {
    name: 'Poshmark',
    logo: '/poshmark-logo.png',
    requiredFields: ['title', 'description', 'price', 'size', 'brand', 'category'],
    categories: ['Women', 'Men', 'Kids', 'Home'],
  },
  EBAY: {
    name: 'eBay',
    logo: '/ebay-logo.png',
    requiredFields: ['title', 'description', 'price', 'condition', 'shipping', 'category'],
    categories: ['Fashion', 'Electronics', 'Home & Garden', 'Sporting Goods'],
  },
};
