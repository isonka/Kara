
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Supplier = require('../models/Supplier');
const suppliersRouter = require('../routes/suppliers');

const app = express();
app.use(express.json());
app.use('/api/suppliers', suppliersRouter);

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Supplier.deleteMany();
});

describe('Supplier API', () => {
  let supplierId;

  it('should create a new supplier', async () => {
    const res = await request(app)
      .post('/api/suppliers')
      .send({
        name: 'Test Supplier',
        email: 'test@supplier.com',
        phone: '1234567890',
        address: '123 Test St',
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Test Supplier');
    supplierId = res.body._id;
  });

  it('should get all suppliers', async () => {
    await Supplier.create({ name: 'Test Supplier' });
    const res = await request(app).get('/api/suppliers');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should get a supplier by ID', async () => {
    const supplier = await Supplier.create({ name: 'Test Supplier' });
    const res = await request(app).get(`/api/suppliers/${supplier._id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(supplier._id.toString());
  });

  it('should update a supplier by ID', async () => {
    const supplier = await Supplier.create({ name: 'Test Supplier' });
    const res = await request(app)
      .put(`/api/suppliers/${supplier._id}`)
      .send({ name: 'Updated Supplier' });
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Updated Supplier');
  });

  it('should delete a supplier by ID', async () => {
    const supplier = await Supplier.create({ name: 'Test Supplier' });
    const res = await request(app).delete(`/api/suppliers/${supplier._id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Supplier deleted');
  });
});
