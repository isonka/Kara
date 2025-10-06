import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getSuppliers } from '../services/supplierService';
import './Suppliers.css';

const API_URL = process.env.REACT_APP_API_URL || 'https://kara-agcc.onrender.com/api/suppliers';
const ORDER_TYPES = ['csv', 'pdf', 'xls', 'email', 'phone', 'custom'];

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [form, setForm] = useState({
    order_type: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    products_url: '',
    currency: '',
    timezone: '',
    language: '',
    comment: '',
    logo: '',
    categories: '',
    order_example: ''
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }
      
      const data = await getSuppliers(token);
      setSuppliers(Array.isArray(data) ? data : []);
      setError('');
      
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      setError('Failed to fetch suppliers');
      setSuppliers([]);
    }
    setLoading(false);
  };

  const openAddModal = () => {
    setEditingSupplier(null);
    setForm({
      order_type: '', name: '', email: '', phone: '', address: '', website: '', 
      products_url: '', currency: '', timezone: '', language: '', comment: '', 
      logo: '', categories: '', order_example: ''
    });
    setShowModal(true);
  };

  const openEditModal = (supplier) => {
    setEditingSupplier(supplier);
    setForm({
      order_type: supplier.order_type || '',
      name: supplier.name || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      website: supplier.website || '',
      products_url: supplier.products_url || '',
      currency: supplier.currency || '',
      timezone: supplier.timezone || '',
      language: supplier.language || '',
      comment: supplier.comment || '',
      logo: supplier.logo || '',
      categories: supplier.categories ? supplier.categories.join(', ') : '',
      order_example: supplier.order_example || ''
    });
    setShowModal(true);
  };

  const handleDeleteSupplier = async (supplierId, supplierName) => {
    if (!window.confirm(`Are you sure you want to delete "${supplierName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/suppliers/${supplierId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Remove the supplier from local state
      setSuppliers(prev => prev.filter(supplier => supplier._id !== supplierId));
      alert('Supplier deleted successfully!');
    } catch (error) {
      console.error('Error deleting supplier:', error);
      alert('Failed to delete supplier');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSupplier(null);
    setError('');
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      let dataToSend = { ...form };
      
      // Convert categories from comma-separated string to array
      if (form.categories) {
        dataToSend.categories = form.categories.split(',').map((c) => c.trim());
      }

      if (editingSupplier) {
        // Update existing supplier
        await axios.put(`${API_URL}/${editingSupplier._id}`, dataToSend, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Add new supplier
        await axios.post(API_URL, dataToSend, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      await fetchSuppliers();
      closeModal();
    } catch (err) {
      setError(editingSupplier ? 'Failed to update supplier' : 'Failed to add supplier');
    }
    setLoading(false);
  };

  return (
    <div className="suppliers-container">
      <div className="suppliers-header">
        <h1>🏪 Suppliers Management</h1>
        <button 
          className="add-supplier-btn"
          onClick={openAddModal}
        >
          + Add Supplier
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="suppliers-loading">Loading suppliers...</div>
      ) : (
        <div className="suppliers-grid">
          {Array.isArray(suppliers) && suppliers.length > 0 ? (
            suppliers.map((supplier) => (
              <div key={supplier._id} className="supplier-card">
                <div className="supplier-header">
                  <h3>{supplier.name}</h3>
                  <div className="supplier-badges">
                    {supplier.order_type && (
                      <span className="badge order-type">{supplier.order_type}</span>
                    )}
                  </div>
                </div>
                
                {supplier.address && (
                  <p className="supplier-address">📍 {supplier.address}</p>
                )}
                
                <div className="supplier-details">
                  {supplier.currency && (
                    <div className="detail-row">
                      <span className="label">Currency:</span>
                      <span className="value">{supplier.currency}</span>
                    </div>
                  )}
                  {supplier.timezone && (
                    <div className="detail-row">
                      <span className="label">Timezone:</span>
                      <span className="value">{supplier.timezone}</span>
                    </div>
                  )}
                  {supplier.language && (
                    <div className="detail-row">
                      <span className="label">Language:</span>
                      <span className="value">{supplier.language}</span>
                    </div>
                  )}
                </div>

                {(supplier.email || supplier.phone || supplier.website) && (
                  <div className="contact-info">
                    <h4>Contact Information</h4>
                    <div className="contact-links">
                      {supplier.email && (
                        <a href={`mailto:${supplier.email}`} className="contact-link email">
                          ✉️ {supplier.email}
                        </a>
                      )}
                      {supplier.phone && (
                        <a href={`tel:${supplier.phone}`} className="contact-link phone">
                          📞 {supplier.phone}
                        </a>
                      )}
                      {supplier.website && (
                        <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="contact-link website">
                          🌐 Website
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Categories */}
                {supplier.categories && supplier.categories.length > 0 && (
                  <div>
                    <div className="categories-label">
                      Categories
                    </div>
                    <div className="categories-list">
                      {supplier.categories.slice(0, 4).map((category, idx) => (
                        <span key={idx} className="category-tag">
                          {category}
                        </span>
                      ))}
                      {supplier.categories.length > 4 && (
                        <span className="category-more">
                          +{supplier.categories.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="supplier-actions">
                  <button 
                    className="edit-btn"
                    onClick={() => openEditModal(supplier)}
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDeleteSupplier(supplier._id, supplier.name)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ 
              padding: 48, 
              textAlign: 'center', 
              color: '#6b7280',
              backgroundColor: 'white',
              borderRadius: 12,
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ fontSize: 18, marginBottom: 8, fontWeight: 500 }}>No suppliers found</div>
              <div style={{ fontSize: 14 }}>Click "Add New Supplier" below to get started</div>
            </div>
          )}
        </div>
      )}     

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">
                {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="modal-close"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              {/* Basic Information Section */}
              <div className="form-section">
                <h3>Basic Information</h3>
                
                <div className="form-field">
                  <label className="form-label">
                    Supplier Name *
                  </label>
                  <input 
                    name="name" 
                    value={form.name} 
                    onChange={handleChange} 
                    required 
                    className="form-input"
                    placeholder="Enter supplier name"
                  />
                </div>
                
                <div className="form-field">
                  <label className="form-label">
                    Order Type *
                  </label>
                  <select 
                    name="order_type" 
                    value={form.order_type} 
                    onChange={handleChange} 
                    required 
                    className="form-select"
                  >
                    <option value="">Select Order Type</option>
                    {ORDER_TYPES.map((type) => (
                      <option key={type} value={type}>{type.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label className="form-label">
                    Address
                  </label>
                  <input 
                    name="address" 
                    value={form.address} 
                    onChange={handleChange} 
                    className="form-input"
                    placeholder="Full address"
                  />
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="form-section">
                <h3>Contact Information</h3>
                
                <div className="form-field">
                  <label className="form-label">
                    Email
                  </label>
                  <input 
                    name="email" 
                    type="email" 
                    value={form.email} 
                    onChange={handleChange} 
                    className="form-input"
                    placeholder="contact@supplier.com"
                  />
                </div>
                
                <div className="form-field">
                  <label className="form-label">
                    Phone
                  </label>
                  <input 
                    name="phone" 
                    value={form.phone} 
                    onChange={handleChange} 
                    className="form-input"
                    placeholder="+1 555-123-4567"
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">
                    Website
                  </label>
                  <input 
                    name="website" 
                    type="url"
                    value={form.website} 
                    onChange={handleChange} 
                    className="form-input"
                    placeholder="https://supplier.com"
                  />
                </div>
                
                <div className="form-field">
                  <label className="form-label">
                    Products URL
                  </label>
                  <input 
                    name="products_url" 
                    type="url"
                    value={form.products_url} 
                    onChange={handleChange} 
                    className="form-input"
                    placeholder="https://supplier.com/products"
                  />
                </div>
              </div>

              {/* Business Details Section */}
              <div className="form-section">
                <h3>Business Details</h3>
                
                <div className="form-field">
                  <label className="form-label">
                    Currency
                  </label>
                  <input 
                    name="currency" 
                    value={form.currency} 
                    onChange={handleChange} 
                    className="form-input"
                    placeholder="USD"
                  />
                </div>
                
                <div className="form-field">
                  <label className="form-label">
                    Timezone
                  </label>
                  <input 
                    name="timezone" 
                    value={form.timezone} 
                    onChange={handleChange} 
                    className="form-input"
                    placeholder="EST"
                  />
                </div>
                
                <div className="form-field">
                  <label className="form-label">
                    Language
                  </label>
                  <input 
                    name="language" 
                    value={form.language} 
                    onChange={handleChange} 
                    className="form-input"
                    placeholder="English"
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">
                    Categories (comma separated)
                  </label>
                  <input 
                    name="categories" 
                    value={form.categories} 
                    onChange={handleChange} 
                    className="form-input"
                    placeholder="Vegetables, Fruits, Dairy"
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">
                    Logo URL
                  </label>
                  <input 
                    name="logo" 
                    type="url"
                    value={form.logo} 
                    onChange={handleChange} 
                    className="form-input"
                    placeholder="https://supplier.com/logo.png"
                  />
                </div>
                
                <div className="form-field">
                  <label className="form-label">
                    Order Example URL
                  </label>
                  <input 
                    name="order_example" 
                    type="url"
                    value={form.order_example} 
                    onChange={handleChange} 
                    className="form-input"
                    placeholder="https://supplier.com/order-template"
                  />
                </div>
              </div>

              {/* Additional Notes Section */}
              <div className="form-section">
                <h3>Additional Notes</h3>
                <div className="form-field">
                  <textarea 
                    name="comment" 
                    value={form.comment} 
                    onChange={handleChange} 
                    rows={4}
                    className="form-textarea"
                    placeholder="Any special notes or instructions..."
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="form-actions">
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="form-button primary"
                >
                  {loading ? 'Saving...' : (editingSupplier ? 'Update Supplier' : 'Add Supplier')}
                </button>
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="form-button secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
