const request = require('supertest');
const app = require('../server'); // Import the server file

describe('Transactions API', () => {
  let transactionId;

  // Test GET /transactions to fetch all transactions
  it('should fetch all transactions', async () => {
    const response = await request(app).get('/transactions');
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThan(0);
  });

  // Test POST /transactions to add a new transaction
  it('should add a new transaction', async () => {
    const newTransaction = {
      amount: 200,
      type: 'income',
      description: 'Freelance work',
    };
    const response = await request(app)
      .post('/transactions')
      .send(newTransaction);
    transactionId = response.body.id; // Save the ID for further testing
    expect(response.status).toBe(201);
    expect(response.body.amount).toBe(newTransaction.amount);
    expect(response.body.type).toBe(newTransaction.type);
    expect(response.body.description).toBe(newTransaction.description);
  });

  // Test GET /transactions to verify the new transaction is added
  it('should verify the newly added transaction', async () => {
    const response = await request(app).get('/transactions');
    const transaction = response.body.find((t) => t.id === transactionId);
    expect(transaction).toBeDefined();
    expect(transaction.id).toBe(transactionId);
    expect(transaction.amount).toBe(200);
  });
});
