import '@testing-library/cypress/add-commands';

Cypress.Commands.add('login', (email = 'test@example.com', password = 'password123') => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/auth/login`,
    body: { email, password }
  }).then((response) => {
    window.localStorage.setItem('token', response.body.token);
    window.localStorage.setItem('user', JSON.stringify(response.body.user));
  });
});

Cypress.Commands.add('createProduct', (product = {}) => {
  const defaultProduct = {
    name: 'Test Product',
    purchasePrice: 10.99,
    sellingPrice: 20.99,
    purchaseLocation: 'Test Store',
    sellingLocation: 'Online Store',
    dimensions: [10, 20, 30],
    purchaseDate: '2024-01-01',
    hashtags: ['test']
  };

  const finalProduct = { ...defaultProduct, ...product };

  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/products`,
    headers: {
      Authorization: `Bearer ${window.localStorage.getItem('token')}`
    },
    body: finalProduct
  });
});

Cypress.Commands.add('deleteProduct', (productId) => {
  cy.request({
    method: 'DELETE',
    url: `${Cypress.env('apiUrl')}/products/${productId}`,
    headers: {
      Authorization: `Bearer ${window.localStorage.getItem('token')}`
    }
  });
});
