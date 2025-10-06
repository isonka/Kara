import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Ingredients.css';

const Ingredients = () => {
  const [ingredients, setIngredients] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    supplier: '',
    search: ''
  });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    supplier: '',
    unit: '',
    price_per_unit: '',
    minimum_order_quantity: '',
    organic: false,
    seasonal: false,
    product_code: '',
    shelf_life_days: '',
    storage_instructions: '',
    notes: ''
  });

  const categories = [
    'Vegetables', 'Fruits', 'Meat', 'Poultry', 'Seafood', 
    'Dairy', 'Grains', 'Spices', 'Herbs', 'Bakery', 'Beverages', 'Other'
  ];

  const units = [
    'kg', 'g', 'lbs', 'oz', 'piece', 'bunch', 'pack', 
    'bottle', 'can', 'liter', 'ml', 'cup', 'tbsp', 'tsp'
  ];

  useEffect(() => {
    fetchIngredients();
    fetchSuppliers();
  }, []);

  const fetchIngredients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/ingredients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIngredients(response.data);
    } catch (error) {
      console.error('Error fetching ingredients:', error);
      alert('Failed to load ingredients');
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/suppliers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuppliers(response.data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      supplier: '',
      unit: '',
      price_per_unit: '',
      minimum_order_quantity: '',
      organic: false,
      seasonal: false,
      product_code: '',
      shelf_life_days: '',
      storage_instructions: '',
      notes: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.category || !formData.supplier || !formData.unit || !formData.price_per_unit) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const ingredientData = {
        ...formData,
        price_per_unit: parseFloat(formData.price_per_unit),
        minimum_order_quantity: parseInt(formData.minimum_order_quantity) || 1,
        shelf_life_days: parseInt(formData.shelf_life_days) || null
      };

      if (editingIngredient) {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/ingredients/${editingIngredient._id}`,
          ingredientData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Ingredient updated successfully!');
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/ingredients`,
          ingredientData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Ingredient added successfully!');
      }

      setShowAddModal(false);
      setEditingIngredient(null);
      resetForm();
      fetchIngredients();
    } catch (error) {
      console.error('Error saving ingredient:', error);
      alert(error.response?.data?.message || 'Failed to save ingredient');
    }
  };

  const handleEdit = (ingredient) => {
    setEditingIngredient(ingredient);
    setFormData({
      name: ingredient.name || '',
      description: ingredient.description || '',
      category: ingredient.category || '',
      supplier: ingredient.supplier?._id || '',
      unit: ingredient.unit || '',
      price_per_unit: ingredient.price_per_unit?.toString() || '',
      minimum_order_quantity: ingredient.minimum_order_quantity?.toString() || '',
      organic: ingredient.organic || false,
      seasonal: ingredient.seasonal || false,
      product_code: ingredient.product_code || '',
      shelf_life_days: ingredient.shelf_life_days?.toString() || '',
      storage_instructions: ingredient.storage_instructions || '',
      notes: ingredient.notes || ''
    });
    setShowAddModal(true);
  };

  const handleDelete = async (ingredientId) => {
    if (!window.confirm('Are you sure you want to delete this ingredient?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/ingredients/${ingredientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Ingredient deleted successfully!');
      fetchIngredients();
    } catch (error) {
      console.error('Error deleting ingredient:', error);
      alert('Failed to delete ingredient');
    }
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingIngredient(null);
    resetForm();
  };

  // Filter ingredients based on search and filters
  const filteredIngredients = ingredients.filter(ingredient => {
    const matchesSearch = !filters.search || 
      ingredient.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      ingredient.description?.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesCategory = !filters.category || ingredient.category === filters.category;
    const matchesSupplier = !filters.supplier || ingredient.supplier?._id === filters.supplier;
    
    return matchesSearch && matchesCategory && matchesSupplier;
  });

  const getSupplierName = (supplierId) => {
    const supplier = suppliers.find(s => s._id === supplierId);
    return supplier ? supplier.name : 'Unknown Supplier';
  };

  if (loading) {
    return <div className="ingredients-loading">Loading ingredients...</div>;
  }

  return (
    <div className="ingredients-container">
      <div className="ingredients-header">
        <h1>🥕 Ingredients Management</h1>
        <button 
          className="add-ingredient-btn"
          onClick={() => setShowAddModal(true)}
        >
          + Add Ingredient
        </button>
      </div>

      {/* Filters */}
      <div className="ingredients-filters">
        <input
          type="text"
          name="search"
          placeholder="🔍 Search ingredients..."
          value={filters.search}
          onChange={handleFilterChange}
          className="search-input"
        />
        
        <select
          name="category"
          value={filters.category}
          onChange={handleFilterChange}
          className="filter-select"
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        <select
          name="supplier"
          value={filters.supplier}
          onChange={handleFilterChange}
          className="filter-select"
        >
          <option value="">All Suppliers</option>
          {suppliers.map(supplier => (
            <option key={supplier._id} value={supplier._id}>{supplier.name}</option>
          ))}
        </select>
      </div>

      {/* Ingredients Grid */}
      <div className="ingredients-grid">
        {filteredIngredients.length === 0 ? (
          <div className="no-ingredients">
            <p>No ingredients found. Add your first ingredient to get started!</p>
          </div>
        ) : (
          filteredIngredients.map(ingredient => (
            <div key={ingredient._id} className="ingredient-card">
              <div className="ingredient-header">
                <h3>{ingredient.name}</h3>
                <div className="ingredient-badges">
                  {ingredient.organic && <span className="badge organic">🌱 Organic</span>}
                  {ingredient.seasonal && <span className="badge seasonal">🍂 Seasonal</span>}
                  {!ingredient.availability && <span className="badge unavailable">❌ Unavailable</span>}
                </div>
              </div>
              
              <p className="ingredient-description">{ingredient.description}</p>
              
              <div className="ingredient-details">
                <div className="detail-row">
                  <span className="label">Category:</span>
                  <span className="value">{ingredient.category}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Supplier:</span>
                  <span className="value supplier-name">
                    {ingredient.supplier?.name || 'No Supplier'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Price:</span>
                  <span className="value price">
                    ${ingredient.price_per_unit?.toFixed(2)} per {ingredient.unit}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Min Order:</span>
                  <span className="value">{ingredient.minimum_order_quantity} {ingredient.unit}</span>
                </div>
                {ingredient.shelf_life_days && (
                  <div className="detail-row">
                    <span className="label">Shelf Life:</span>
                    <span className="value">{ingredient.shelf_life_days} days</span>
                  </div>
                )}
                {ingredient.product_code && (
                  <div className="detail-row">
                    <span className="label">Product Code:</span>
                    <span className="value code">{ingredient.product_code}</span>
                  </div>
                )}
              </div>

              {ingredient.storage_instructions && (
                <div className="storage-info">
                  <strong>Storage:</strong> {ingredient.storage_instructions}
                </div>
              )}

              <div className="ingredient-actions">
                <button 
                  className="edit-btn"
                  onClick={() => handleEdit(ingredient)}
                >
                  ✏️ Edit
                </button>
                <button 
                  className="delete-btn"
                  onClick={() => handleDelete(ingredient._id)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingIngredient ? 'Edit Ingredient' : 'Add New Ingredient'}</h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="ingredient-form">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter ingredient name"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief description of the ingredient"
                  rows="2"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Supplier *</label>
                  <select
                    name="supplier"
                    value={formData.supplier}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select supplier</option>
                    {suppliers.map(supplier => (
                      <option key={supplier._id} value={supplier._id}>{supplier.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Unit *</label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select unit</option>
                    {units.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Price per Unit *</label>
                  <input
                    type="number"
                    name="price_per_unit"
                    value={formData.price_per_unit}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    required
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Minimum Order Quantity</label>
                  <input
                    type="number"
                    name="minimum_order_quantity"
                    value={formData.minimum_order_quantity}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="1"
                  />
                </div>

                <div className="form-group">
                  <label>Shelf Life (days)</label>
                  <input
                    type="number"
                    name="shelf_life_days"
                    value={formData.shelf_life_days}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Product Code</label>
                <input
                  type="text"
                  name="product_code"
                  value={formData.product_code}
                  onChange={handleInputChange}
                  placeholder="Optional supplier product code"
                />
              </div>

              <div className="form-group">
                <label>Storage Instructions</label>
                <textarea
                  name="storage_instructions"
                  value={formData.storage_instructions}
                  onChange={handleInputChange}
                  placeholder="How should this ingredient be stored?"
                  rows="2"
                />
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Additional notes or comments"
                  rows="2"
                />
              </div>

              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="organic"
                    checked={formData.organic}
                    onChange={handleInputChange}
                  />
                  <span>🌱 Organic</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="seasonal"
                    checked={formData.seasonal}
                    onChange={handleInputChange}
                  />
                  <span>🍂 Seasonal</span>
                </label>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingIngredient ? 'Update Ingredient' : 'Add Ingredient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ingredients;