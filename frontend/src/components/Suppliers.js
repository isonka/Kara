import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getSuppliers } from '../services/supplierService';
import styles from '../kara-theme.module.css';

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
    <div className={styles.container}>
      <div style={{ marginBottom: 24 }}>
        <h1 className={styles.heading}>Suppliers</h1>
      </div>

      {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}

      {loading ? (
        <div style={{ padding: 20, textAlign: 'center', color: '#6c757d' }}>Loading...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Array.isArray(suppliers) && suppliers.length > 0 ? (
            suppliers.map((supplier) => (
              <div key={supplier._id} style={{
                backgroundColor: 'white',
                borderRadius: 12,
                padding: 16,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: '1px solid #e5e7eb'
              }}>
                {/* Header with name and edit button */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  marginBottom: 12
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      margin: 0, 
                      fontSize: 18, 
                      fontWeight: 600, 
                      color: '#1f2937',
                      marginBottom: 4
                    }}>
                      {supplier.name}
                    </h3>
                    {supplier.address && (
                      <div style={{ 
                        fontSize: 14, 
                        color: '#6b7280',
                        marginBottom: 8
                      }}>
                        📍 {supplier.address}
                      </div>
                    )}
                  </div>
                  <button 
                    className={styles.button} 
                    style={{ 
                      padding: '8px 16px', 
                      fontSize: '14px',
                      fontWeight: 500,
                      marginLeft: 12
                    }}
                    onClick={() => openEditModal(supplier)}
                  >
                    Edit
                  </button>
                </div>

                {/* Order type badge */}
                <div style={{ marginBottom: 12 }}>
                  <span style={{ 
                    display: 'inline-block',
                    padding: '6px 12px', 
                    backgroundColor: '#dbeafe', 
                    color: '#1e40af', 
                    borderRadius: 20, 
                    fontSize: 12, 
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {supplier.order_type || 'N/A'}
                  </span>
                </div>

                {/* Contact info */}
                {(supplier.email || supplier.phone || supplier.website) && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ 
                      fontSize: 14, 
                      fontWeight: 600, 
                      color: '#374151',
                      marginBottom: 6
                    }}>
                      Contact
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {supplier.email && (
                        <div>
                          <a href={`mailto:${supplier.email}`} style={{ 
                            color: '#2563eb', 
                            textDecoration: 'none',
                            fontSize: 14
                          }}>
                            ✉️ {supplier.email}
                          </a>
                        </div>
                      )}
                      {supplier.phone && (
                        <div>
                          <a href={`tel:${supplier.phone}`} style={{ 
                            color: '#059669', 
                            textDecoration: 'none',
                            fontSize: 14
                          }}>
                            📞 {supplier.phone}
                          </a>
                        </div>
                      )}
                      {supplier.website && (
                        <div>
                          <a href={supplier.website} target="_blank" rel="noopener noreferrer" style={{ 
                            color: '#7c3aed', 
                            textDecoration: 'none',
                            fontSize: 14
                          }}>
                            🌐 Website
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Categories */}
                {supplier.categories && supplier.categories.length > 0 && (
                  <div>
                    <div style={{ 
                      fontSize: 14, 
                      fontWeight: 600, 
                      color: '#374151',
                      marginBottom: 6
                    }}>
                      Categories
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {supplier.categories.slice(0, 4).map((category, idx) => (
                        <span key={idx} style={{
                          padding: '4px 10px',
                          backgroundColor: '#f3f4f6',
                          color: '#374151',
                          borderRadius: 16,
                          fontSize: 12,
                          fontWeight: 500,
                          border: '1px solid #e5e7eb'
                        }}>
                          {category}
                        </span>
                      ))}
                      {supplier.categories.length > 4 && (
                        <span style={{ 
                          fontSize: 12, 
                          color: '#6b7280',
                          padding: '4px 0'
                        }}>
                          +{supplier.categories.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
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

      {/* Add New Supplier Button */}
      <div style={{ marginTop: 32, textAlign: 'center' }}>
        <button 
          className={styles.button} 
          onClick={openAddModal}
          style={{ padding: '16px 32px', fontSize: '16px', fontWeight: 600 }}
        >
          + Add New Supplier
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', 
          alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white', padding: 32, borderRadius: 12,
            maxWidth: 600, width: '90%', maxHeight: '85vh', overflow: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ 
              marginBottom: 24, 
              paddingBottom: 16, 
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ margin: 0, color: '#1f2937', fontSize: 24 }}>
                {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 24,
                  color: '#6b7280',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 4
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              {/* Basic Information Section */}
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#374151', fontSize: 16, fontWeight: 600 }}>
                  Basic Information
                </h3>
                
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, color: '#374151' }}>
                    Supplier Name *
                  </label>
                  <input 
                    name="name" 
                    value={form.name} 
                    onChange={handleChange} 
                    required 
                    style={{ 
                      width: '100%', 
                      padding: '14px 16px', 
                      border: '1px solid #d1d5db', 
                      borderRadius: 8,
                      fontSize: 16,
                      boxSizing: 'border-box'
                    }} 
                    placeholder="Enter supplier name"
                  />
                </div>
                
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, color: '#374151' }}>
                    Order Type *
                  </label>
                  <select 
                    name="order_type" 
                    value={form.order_type} 
                    onChange={handleChange} 
                    required 
                    style={{ 
                      width: '100%', 
                      padding: '14px 16px', 
                      border: '1px solid #d1d5db', 
                      borderRadius: 8,
                      fontSize: 16,
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="">Select Order Type</option>
                    {ORDER_TYPES.map((type) => (
                      <option key={type} value={type}>{type.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, color: '#374151' }}>
                    Address
                  </label>
                  <input 
                    name="address" 
                    value={form.address} 
                    onChange={handleChange} 
                    style={{ 
                      width: '100%', 
                      padding: '14px 16px', 
                      border: '1px solid #d1d5db', 
                      borderRadius: 8,
                      fontSize: 16,
                      boxSizing: 'border-box'
                    }} 
                    placeholder="Full address"
                  />
                </div>
              </div>

              {/* Contact Information Section */}
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#374151', fontSize: 16, fontWeight: 600 }}>
                  Contact Information
                </h3>
                
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, color: '#374151' }}>
                    Email
                  </label>
                  <input 
                    name="email" 
                    type="email" 
                    value={form.email} 
                    onChange={handleChange} 
                    style={{ 
                      width: '100%', 
                      padding: '14px 16px', 
                      border: '1px solid #d1d5db', 
                      borderRadius: 8,
                      fontSize: 16,
                      boxSizing: 'border-box'
                    }} 
                    placeholder="contact@supplier.com"
                  />
                </div>
                
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, color: '#374151' }}>
                    Phone
                  </label>
                  <input 
                    name="phone" 
                    value={form.phone} 
                    onChange={handleChange} 
                    style={{ 
                      width: '100%', 
                      padding: '14px 16px', 
                      border: '1px solid #d1d5db', 
                      borderRadius: 8,
                      fontSize: 16,
                      boxSizing: 'border-box'
                    }} 
                    placeholder="+1 555-123-4567"
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, color: '#374151' }}>
                    Website
                  </label>
                  <input 
                    name="website" 
                    type="url"
                    value={form.website} 
                    onChange={handleChange} 
                    style={{ 
                      width: '100%', 
                      padding: '14px 16px', 
                      border: '1px solid #d1d5db', 
                      borderRadius: 8,
                      fontSize: 16,
                      boxSizing: 'border-box'
                    }} 
                    placeholder="https://supplier.com"
                  />
                </div>
                
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, color: '#374151' }}>
                    Products URL
                  </label>
                  <input 
                    name="products_url" 
                    type="url"
                    value={form.products_url} 
                    onChange={handleChange} 
                    style={{ 
                      width: '100%', 
                      padding: '14px 16px', 
                      border: '1px solid #d1d5db', 
                      borderRadius: 8,
                      fontSize: 16,
                      boxSizing: 'border-box'
                    }} 
                    placeholder="https://supplier.com/products"
                  />
                </div>
              </div>

              {/* Business Details Section */}
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#374151', fontSize: 16, fontWeight: 600 }}>
                  Business Details
                </h3>
                
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, color: '#374151' }}>
                    Currency
                  </label>
                  <input 
                    name="currency" 
                    value={form.currency} 
                    onChange={handleChange} 
                    style={{ 
                      width: '100%', 
                      padding: '14px 16px', 
                      border: '1px solid #d1d5db', 
                      borderRadius: 8,
                      fontSize: 16,
                      boxSizing: 'border-box'
                    }} 
                    placeholder="USD"
                  />
                </div>
                
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, color: '#374151' }}>
                    Timezone
                  </label>
                  <input 
                    name="timezone" 
                    value={form.timezone} 
                    onChange={handleChange} 
                    style={{ 
                      width: '100%', 
                      padding: '14px 16px', 
                      border: '1px solid #d1d5db', 
                      borderRadius: 8,
                      fontSize: 16,
                      boxSizing: 'border-box'
                    }} 
                    placeholder="EST"
                  />
                </div>
                
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, color: '#374151' }}>
                    Language
                  </label>
                  <input 
                    name="language" 
                    value={form.language} 
                    onChange={handleChange} 
                    style={{ 
                      width: '100%', 
                      padding: '14px 16px', 
                      border: '1px solid #d1d5db', 
                      borderRadius: 8,
                      fontSize: 16,
                      boxSizing: 'border-box'
                    }} 
                    placeholder="English"
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, color: '#374151' }}>
                    Categories (comma separated)
                  </label>
                  <input 
                    name="categories" 
                    value={form.categories} 
                    onChange={handleChange} 
                    style={{ 
                      width: '100%', 
                      padding: '14px 16px', 
                      border: '1px solid #d1d5db', 
                      borderRadius: 8,
                      fontSize: 16,
                      boxSizing: 'border-box'
                    }} 
                    placeholder="Vegetables, Fruits, Dairy"
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, color: '#374151' }}>
                    Logo URL
                  </label>
                  <input 
                    name="logo" 
                    type="url"
                    value={form.logo} 
                    onChange={handleChange} 
                    style={{ 
                      width: '100%', 
                      padding: '14px 16px', 
                      border: '1px solid #d1d5db', 
                      borderRadius: 8,
                      fontSize: 16,
                      boxSizing: 'border-box'
                    }} 
                    placeholder="https://supplier.com/logo.png"
                  />
                </div>
                
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, color: '#374151' }}>
                    Order Example URL
                  </label>
                  <input 
                    name="order_example" 
                    type="url"
                    value={form.order_example} 
                    onChange={handleChange} 
                    style={{ 
                      width: '100%', 
                      padding: '14px 16px', 
                      border: '1px solid #d1d5db', 
                      borderRadius: 8,
                      fontSize: 16,
                      boxSizing: 'border-box'
                    }} 
                    placeholder="https://supplier.com/order-template"
                  />
                </div>
              </div>

              {/* Additional Notes Section */}
              <div style={{ marginBottom: 32 }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#374151', fontSize: 16, fontWeight: 600 }}>
                  Additional Notes
                </h3>
                <textarea 
                  name="comment" 
                  value={form.comment} 
                  onChange={handleChange} 
                  rows={4}
                  style={{ 
                    width: '100%', 
                    padding: '14px 16px', 
                    border: '1px solid #d1d5db', 
                    borderRadius: 8,
                    fontSize: 16,
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box'
                  }} 
                  placeholder="Any special notes or instructions..."
                />
              </div>

              {/* Action Buttons */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center',
                paddingTop: 16,
                borderTop: '1px solid #e5e7eb'
              }}>
                <button 
                  type="submit" 
                  disabled={loading} 
                  className={styles.button}
                  style={{ 
                    padding: '16px 32px',
                    fontSize: 16,
                    fontWeight: 600,
                    minWidth: 160
                  }}
                >
                  {loading ? 'Saving...' : (editingSupplier ? 'Update Supplier' : 'Add Supplier')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
