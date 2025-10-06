import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Recipes.css';

const Recipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    search: ''
  });



  const categories = ['Appetizer', 'Main Course', 'Side Dish', 'Dessert', 'Beverage', 'Sauce', 'Other'];

  useEffect(() => {
    fetchRecipes();
    fetchIngredients();
  }, []);

  const fetchRecipes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/recipes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecipes(response.data);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      alert('Failed to load recipes');
    } finally {
      setLoading(false);
    }
  };

  const fetchIngredients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/ingredients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIngredients(response.data);
    } catch (error) {
      console.error('Error fetching ingredients:', error);
    }
  };

  const calculateRecipeCost = async (recipeId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/recipes/${recipeId}/calculate-cost`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update the recipe in the local state
      setRecipes(prev => prev.map(recipe => 
        recipe._id === recipeId ? { ...recipe, ...response.data } : recipe
      ));
      
      alert(`Cost calculated! Total: $${response.data.total_cost.toFixed(2)}, Per serving: $${response.data.cost_per_serving.toFixed(2)}`);
    } catch (error) {
      console.error('Error calculating cost:', error);
      alert('Failed to calculate recipe cost');
    }
  };

  const handleDeleteRecipe = async (recipeId, recipeName) => {
    if (!window.confirm(`Are you sure you want to delete "${recipeName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/recipes/${recipeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Remove the recipe from local state
      setRecipes(prev => prev.filter(recipe => recipe._id !== recipeId));
      alert('Recipe deleted successfully!');
    } catch (error) {
      console.error('Error deleting recipe:', error);
      alert('Failed to delete recipe');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Filter recipes based on search and filters
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = !filters.search || 
      recipe.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      recipe.description?.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesCategory = !filters.category || recipe.category === filters.category;
    
    return matchesSearch && matchesCategory;
  });



  if (loading) {
    return <div className="recipes-loading">Loading recipes...</div>;
  }

  return (
    <div className="recipes-container">
      <div className="recipes-header">
        <h1>👨‍🍳 Recipe Management</h1>
        <a 
          href="/recipes/create"
          className="add-recipe-btn"
          style={{ textDecoration: 'none', display: 'inline-block' }}
        >
          + Add Recipe
        </a>
      </div>

      {/* Filters */}
      <div className="recipes-filters">
        <input
          type="text"
          name="search"
          placeholder="🔍 Search recipes..."
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
      </div>

      {/* Recipes Grid */}
      <div className="recipes-grid">
        {filteredRecipes.length === 0 ? (
          <div className="no-recipes">
            <p>No recipes found. Add your first recipe to get started!</p>
          </div>
        ) : (
          filteredRecipes.map(recipe => (
            <div key={recipe._id} className="recipe-card">
              <div className="recipe-header">
                <h3>{recipe.name}</h3>
                <div className="recipe-badges">
                  <span className="badge category">{recipe.category}</span>
                  <span className="badge difficulty">{recipe.difficulty}</span>
                </div>
              </div>
              
              <p className="recipe-description">{recipe.description}</p>
              
              <div className="recipe-details">
                <div className="detail-row">
                  <span className="label">Ingredients:</span>
                  <span className="value">{recipe.ingredients?.length || 0} items</span>
                </div>
                <div className="detail-row">
                  <span className="label">Instructions:</span>
                  <span className="value">{recipe.instructions?.length || 0} steps</span>
                </div>
                {recipe.tags && recipe.tags.length > 0 && (
                  <div className="detail-row">
                    <span className="label">Tags:</span>
                    <span className="value">{recipe.tags.join(', ')}</span>
                  </div>
                )}
              </div>

              {recipe.ingredients && recipe.ingredients.length > 0 && (
                <div className="ingredients-summary">
                  <strong>Ingredients ({recipe.ingredients.length}):</strong>
                  <div className="ingredients-list">
                    {recipe.ingredients.slice(0, 3).map((ing, index) => (
                      <span key={index} className="ingredient-item">
                        {ing.ingredient?.name} ({ing.quantity} {ing.unit})
                      </span>
                    ))}
                    {recipe.ingredients.length > 3 && (
                      <span className="more-ingredients">+{recipe.ingredients.length - 3} more</span>
                    )}
                  </div>
                </div>
              )}

              {recipe.cost_calculated && (
                <div className="cost-info">
                  <div className="cost-row">
                    <span>Total Cost: <strong>${recipe.total_cost?.toFixed(2)}</strong></span>
                    <span>Per Serving: <strong>${recipe.cost_per_serving?.toFixed(2)}</strong></span>
                  </div>
                </div>
              )}

              <div className="recipe-actions">
                <button 
                  className="calculate-btn"
                  onClick={() => calculateRecipeCost(recipe._id)}
                >
                  💰 Calculate Cost
                </button>
                <a 
                  href={`/recipes/edit/${recipe._id}`}
                  className="edit-btn"
                  style={{ textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}
                >
                  ✏️ Edit
                </a>
                <button 
                  className="delete-btn"
                  onClick={() => handleDeleteRecipe(recipe._id, recipe.name)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>


    </div>
  );
};

export default Recipes;