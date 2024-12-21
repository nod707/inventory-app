describe('Inventory Management', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/');
  });

  it('should complete full product lifecycle', () => {
    // Add new product
    cy.findByRole('button', { name: /add product/i }).click();
    
    cy.findByLabelText(/product name/i).type('Cypress Test Product');
    cy.findByLabelText(/purchase price/i).type('15.99');
    cy.findByLabelText(/selling price/i).type('25.99');
    cy.findByLabelText(/purchase location/i).type('Test Store');
    cy.findByLabelText(/selling location/i).type('Online Store');
    
    // Upload image
    cy.findByLabelText(/upload image/i).attachFile('test-image.jpg');
    
    // Add hashtags
    cy.findByLabelText(/add hashtag/i).type('cypress');
    cy.findByRole('button', { name: /add/i }).click();
    
    cy.findByRole('button', { name: /submit/i }).click();
    
    // Verify product was added
    cy.findByText('Cypress Test Product').should('exist');
    
    // Edit product
    cy.findByLabelText(/edit/i).click();
    cy.findByLabelText(/product name/i).clear().type('Updated Cypress Product');
    cy.findByRole('button', { name: /submit/i }).click();
    
    // Verify product was updated
    cy.findByText('Updated Cypress Product').should('exist');
    
    // Delete product
    cy.findByLabelText(/delete/i).click();
    
    // Verify product was deleted
    cy.findByText('Updated Cypress Product').should('not.exist');
  });

  it('should filter and search products', () => {
    // Create test products
    cy.createProduct({ name: 'Product A', purchaseDate: '2024-01-01' });
    cy.createProduct({ name: 'Product B', purchaseDate: '2024-01-02' });
    cy.reload();

    // Test search
    cy.findByPlaceholderText(/search products/i).type('Product A');
    cy.findByText('Product A').should('exist');
    cy.findByText('Product B').should('not.exist');

    // Clear search
    cy.findByPlaceholderText(/search products/i).clear();

    // Test date filter
    cy.findByLabelText(/start date/i).type('2024-01-01');
    cy.findByLabelText(/end date/i).type('2024-01-01');
    cy.findByText('Product A').should('exist');
    cy.findByText('Product B').should('not.exist');
  });

  it('should calculate profits correctly', () => {
    // Create products with known profit margins
    cy.createProduct({
      name: 'Profit Test A',
      purchasePrice: 10,
      sellingPrice: 20
    });
    cy.createProduct({
      name: 'Profit Test B',
      purchasePrice: 15,
      sellingPrice: 30
    });
    cy.reload();

    // Verify individual profit calculations
    cy.findByText('Profit Margin: 100% ($10)').should('exist');
    cy.findByText('Profit Margin: 100% ($15)').should('exist');

    // Verify total profit
    cy.findByText('Total Profit: $25.00').should('exist');
  });

  it('should handle errors gracefully', () => {
    // Test form validation
    cy.findByRole('button', { name: /add product/i }).click();
    cy.findByRole('button', { name: /submit/i }).click();
    
    // Verify validation errors
    cy.findByText(/product name is required/i).should('exist');
    cy.findByText(/purchase price is required/i).should('exist');
    
    // Test API error handling
    cy.intercept('POST', '/api/products', {
      statusCode: 500,
      body: { message: 'Server error' }
    });
    
    cy.findByLabelText(/product name/i).type('Error Test');
    cy.findByLabelText(/purchase price/i).type('10.99');
    cy.findByLabelText(/selling price/i).type('20.99');
    cy.findByRole('button', { name: /submit/i }).click();
    
    cy.findByText('Server error').should('exist');
  });
});
