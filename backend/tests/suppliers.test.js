
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Supplier = require('../models/Supplier');
const User = require('../models/User');
const Membership = require('../models/Membership');
const suppliersRouter = require('../routes/suppliers');

const app = express();
app.use(express.json());
app.use('/api/suppliers', suppliersRouter);

let mongoServer;
let testUser;
let testMembership;
let authToken;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Supplier.deleteMany({});
  await User.deleteMany({});
  await Membership.deleteMany({});
  
  // Create a test membership
  testMembership = new Membership({
    business_name: 'Test Business',
    business_type: 'restaurant',
    contact_name: 'Test Contact',
    email: 'business@test.com',
    subscription_plan: 'premium'
  });
  await testMembership.save();
  
  // Create a test user
  testUser = new User({
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    password: 'password123',
    role: 'root-admin',
    membershipId: testMembership._id
  });
  await testUser.save();
  
  // Generate auth token with correct structure
  authToken = jwt.sign(
    { 
      userId: testUser._id, 
      id: testUser._id, 
      email: testUser.email, 
      role: testUser.role 
    },
    process.env.JWT_SECRET || 'changeme_secret',
    { expiresIn: '24h' }
  );
});

describe('Supplier API', () => {
  let supplierId;

  it('should create a new supplier', async () => {
    const newSupplier = {
      name: 'New Supplier',
      user: testUser._id,
      email: 'new@supplier.com',
      phone: '987-654-3210',
      categories: ['New Product']
    };

    const response = await request(app)
      .post('/api/suppliers')
      .send(newSupplier)
      .expect(201);

    expect(response.body.name).toBe('New Supplier');
    expect(response.body.email).toBe('new@supplier.com');
  });

  it('should get all suppliers', async () => {
    const testSupplier = new Supplier({
      name: 'Test Supplier',
      user: testUser._id,
      email: 'test@supplier.com',
      phone: '123-456-7890',
      categories: ['Product 1', 'Product 2']
    });
    await testSupplier.save();

    const response = await request(app)
      .get('/api/suppliers')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.length).toBe(1);
    expect(response.body[0].name).toBe('Test Supplier');
  });

  it('should get a supplier by id', async () => {
    const testSupplier = new Supplier({
      name: 'Test Supplier',
      user: testUser._id,
      email: 'test@supplier.com',
      phone: '123-456-7890',
      categories: ['Product 1']
    });
    await testSupplier.save();

    const response = await request(app)
      .get(`/api/suppliers/${testSupplier._id}`)
      .expect(200);

    expect(response.body.name).toBe('Test Supplier');
  });

  it('should update a supplier', async () => {
    const testSupplier = new Supplier({
      name: 'Test Supplier',
      user: testUser._id,
      email: 'test@supplier.com',
      phone: '123-456-7890',
      categories: ['Product 1']
    });
    await testSupplier.save();

    const updatedData = { name: 'Updated Supplier' };

    const response = await request(app)
      .put(`/api/suppliers/${testSupplier._id}`)
      .send(updatedData)
      .expect(200);

    expect(response.body.name).toBe('Updated Supplier');
  });

  it('should delete a supplier', async () => {
    const testSupplier = new Supplier({
      name: 'Test Supplier',
      user: testUser._id,
      email: 'test@supplier.com',
      phone: '123-456-7890',
      categories: ['Product 1']
    });
    await testSupplier.save();

    await request(app)
      .delete(`/api/suppliers/${testSupplier._id}`)
      .expect(200);

    const deletedSupplier = await Supplier.findById(testSupplier._id);
    expect(deletedSupplier).toBeNull();
  });
});
