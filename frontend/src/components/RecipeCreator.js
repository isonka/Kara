import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './RecipeCreator.css';

const RecipeCreator = () => {
  const { id: recipeId } = useParams();
  const navigate = useNavigate();
  const isEditing = !!recipeId;
  
  const [ingredients, setIngredients] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [showIngredientModal, setShowIngredientModal] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [instructions, setInstructions] = useState([]);
  const [loading, setLoading] = useState(isEditing);

  const [recipeData, setRecipeData] = useState({
    name: '',
    description: '',
    category: '',
    difficulty: '',
    tags: '',
    allergens: ''
  });

  const [newIngredientData, setNewIngredientData] = useState({
    name: '',
    description: '',
    category: '',
    supplier: '',
    unit: '',
    price_per_unit: '',
    minimum_order_quantity: '1',
    organic: false,
    seasonal: false,
    product_code: '',
    shelf_life_days: '',
    storage_instructions: '',
    notes: ''
  });

  const [currentStep, setCurrentStep] = useState('basic'); // basic, ingredients, instructions, review
  const [saving, setSaving] = useState(false);

  const categories = ['Appetizer', 'Main Course', 'Side Dish', 'Dessert', 'Beverage', 'Sauce', 'Other'];
  const difficulties = ['Easy', 'Medium', 'Hard'];

  const ingredientCategories = [
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
    if (isEditing) {
      fetchRecipe();
    }
  }, [isEditing]);

  const fetchRecipe = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/recipes/${recipeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const recipe = response.data;
      
      // Populate recipe data
      setRecipeData({
        name: recipe.name || '',
        description: recipe.description || '',
        category: recipe.category || '',
        difficulty: recipe.difficulty || '',
        tags: recipe.tags ? recipe.tags.join(', ') : '',
        allergens: recipe.allergens ? recipe.allergens.join(', ') : ''
      });
      
      // Populate ingredients
      if (recipe.ingredients && recipe.ingredients.length > 0) {
        const recipeIngredients = recipe.ingredients.map(ing => ({
          ingredient: ing.ingredient._id,
          ingredientData: ing.ingredient,
          quantity: ing.quantity,
          unit: ing.unit,
          notes: ing.notes || ''
        }));
        setSelectedIngredients(recipeIngredients);
      }
      
      // Populate instructions
      if (recipe.instructions && recipe.instructions.length > 0) {
        setInstructions(recipe.instructions);
      }
      
    } catch (error) {
      console.error('Error fetching recipe:', error);
      alert('Failed to load recipe for editing');
      navigate('/recipes');
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

  const handleRecipeInputChange = (e) => {
    const { name, value } = e.target;
    setRecipeData(prev => ({ ...prev, [name]: value }));
  };

  const handleIngredientInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewIngredientData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addIngredientToRecipe = (ingredient, quantity = '', unit = '', notes = '') => {
    if (!quantity || !unit) {
      alert('Please specify quantity and unit');
      return;
    }

    const recipeIngredient = {
      ingredient: ingredient._id,
      ingredientData: ingredient, // Store for display
      quantity: parseFloat(quantity),
      unit: unit,
      notes: notes
    };

    setSelectedIngredients(prev => [...prev, recipeIngredient]);
  };

  const removeIngredientFromRecipe = (index) => {
    setSelectedIngredients(prev => prev.filter((_, i) => i !== index));
  };

  const createNewIngredient = async () => {
    if (!newIngredientData.name || !newIngredientData.category || !newIngredientData.supplier || 
        !newIngredientData.unit || !newIngredientData.price_per_unit) {
      alert('Please fill in all required fields for the new ingredient');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const ingredientData = {
        ...newIngredientData,
        price_per_unit: parseFloat(newIngredientData.price_per_unit),
        minimum_order_quantity: parseInt(newIngredientData.minimum_order_quantity) || 1,
        shelf_life_days: parseInt(newIngredientData.shelf_life_days) || null,
        availability: true
      };

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/ingredients`,
        ingredientData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Add to local ingredients list
      const newIngredient = response.data;
      setIngredients(prev => [...prev, newIngredient]);
      
      // Reset form
      setNewIngredientData({
        name: '', description: '', category: '', supplier: '', unit: '',
        price_per_unit: '', minimum_order_quantity: '1', organic: false,
        seasonal: false, product_code: '', shelf_life_days: '',
        storage_instructions: '', notes: ''
      });
      
      setShowIngredientModal(false);
      alert('New ingredient created successfully!');
      
      return newIngredient;
    } catch (error) {
      console.error('Error creating ingredient:', error);
      alert(error.response?.data?.message || 'Failed to create ingredient');
      return null;
    }
  };

  const addInstruction = () => {
    const newStep = {
      step: instructions.length + 1,
      description: '',
      time_minutes: ''
    };
    setInstructions(prev => [...prev, newStep]);
  };

  const updateInstruction = (index, field, value) => {
    setInstructions(prev => prev.map((inst, i) => 
      i === index ? { ...inst, [field]: value } : inst
    ));
  };

  const removeInstruction = (index) => {
    setInstructions(prev => {
      const updated = prev.filter((_, i) => i !== index);
      // Renumber steps
      return updated.map((inst, i) => ({ ...inst, step: i + 1 }));
    });
  };

  const moveInstruction = (index, direction) => {
    if ((direction === 'up' && index === 0) || 
        (direction === 'down' && index === instructions.length - 1)) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newInstructions = [...instructions];
    [newInstructions[index], newInstructions[newIndex]] = [newInstructions[newIndex], newInstructions[index]];
    
    // Renumber steps
    const renumbered = newInstructions.map((inst, i) => ({ ...inst, step: i + 1 }));
    setInstructions(renumbered);
  };

  const validateStep = (step) => {
    switch (step) {
      case 'basic':
        return recipeData.name && recipeData.category && recipeData.difficulty;
      case 'ingredients':
        return selectedIngredients.length > 0;
      case 'instructions':
        return instructions.length > 0 && instructions.every(inst => inst.description.trim());
      default:
        return true;
    }
  };

  const saveRecipe = async () => {
    if (!validateStep('basic') || !validateStep('ingredients') || !validateStep('instructions')) {
      alert('Please complete all required fields in all steps');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      
      const recipePayload = {
        ...recipeData,
        ingredients: selectedIngredients.map(ing => ({
          ingredient: ing.ingredient,
          quantity: ing.quantity,
          unit: ing.unit,
          notes: ing.notes
        })),
        instructions: instructions,
        tags: recipeData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        allergens: recipeData.allergens.split(',').map(allergen => allergen.trim()).filter(allergen => allergen)
      };

      if (isEditing) {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/recipes/${recipeId}`,
          recipePayload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Recipe updated successfully!');
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/recipes`,
          recipePayload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Recipe created successfully!');
      }
      
      // Navigate back to recipes
      navigate('/recipes');
      
    } catch (error) {
      console.error('Error saving recipe:', error);
      alert(error.response?.data?.message || 'Failed to save recipe');
    } finally {
      setSaving(false);
    }
  };

  const renderBasicInfo = () => (
    <div className="step-content">
      <h2>📝 Recipe Basic Information</h2>
      
      <div className="form-group">
        <label>Recipe Name *</label>
        <input
          type="text"
          name="name"
          value={recipeData.name}
          onChange={handleRecipeInputChange}
          placeholder="Enter recipe name"
          required
        />
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          name="description"
          value={recipeData.description}
          onChange={handleRecipeInputChange}
          placeholder="Brief description of the recipe"
          rows="3"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Category *</label>
          <select
            name="category"
            value={recipeData.category}
            onChange={handleRecipeInputChange}
            required
          >
            <option value="">Select category</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Difficulty *</label>
          <select
            name="difficulty"
            value={recipeData.difficulty}
            onChange={handleRecipeInputChange}
            required
          >
            <option value="">Select difficulty</option>
            {difficulties.map(difficulty => (
              <option key={difficulty} value={difficulty}>{difficulty}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Tags (comma separated)</label>
        <input
          type="text"
          name="tags"
          value={recipeData.tags}
          onChange={handleRecipeInputChange}
          placeholder="e.g., vegetarian, quick, popular"
        />
      </div>

      <div className="form-group">
        <label>Allergens (comma separated)</label>
        <input
          type="text"
          name="allergens"
          value={recipeData.allergens}
          onChange={handleRecipeInputChange}
          placeholder="e.g., gluten, dairy, nuts"
        />
      </div>
    </div>
  );

  const renderIngredients = () => (
    <div className="step-content">
      <div className="ingredients-header">
        <h2>🥕 Recipe Ingredients</h2>
        <button 
          className="add-ingredient-btn"
          onClick={() => setShowIngredientModal(true)}
        >
          + Create New Ingredient
        </button>
      </div>

      {/* Selected Ingredients */}
      <div className="selected-ingredients">
        <h3>Selected Ingredients ({selectedIngredients.length})</h3>
        {selectedIngredients.length === 0 ? (
          <p className="no-ingredients">No ingredients added yet. Select ingredients below.</p>
        ) : (
          <div className="selected-ingredients-list">
            {selectedIngredients.map((ingredient, index) => (
              <div key={index} className="selected-ingredient-item">
                <div className="ingredient-info">
                  <strong>{ingredient.ingredientData.name}</strong>
                  <span className="quantity">{ingredient.quantity} {ingredient.unit}</span>
                  {ingredient.notes && <span className="notes">Note: {ingredient.notes}</span>}
                </div>
                <button 
                  className="remove-btn"
                  onClick={() => removeIngredientFromRecipe(index)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Ingredients */}
      <div className="available-ingredients">
        <h3>Available Ingredients</h3>
        <div className="ingredients-grid">
          {ingredients.map(ingredient => (
            <IngredientSelector 
              key={ingredient._id} 
              ingredient={ingredient}
              onAdd={addIngredientToRecipe}
            />
          ))}
        </div>
      </div>

      {/* New Ingredient Modal */}
      {showIngredientModal && (
        <div className="modal-overlay" onClick={() => setShowIngredientModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Ingredient</h2>
              <button className="close-btn" onClick={() => setShowIngredientModal(false)}>×</button>
            </div>

            <div className="ingredient-form">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  name="name"
                  value={newIngredientData.name}
                  onChange={handleIngredientInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={newIngredientData.description}
                  onChange={handleIngredientInputChange}
                  rows="2"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    name="category"
                    value={newIngredientData.category}
                    onChange={handleIngredientInputChange}
                    required
                  >
                    <option value="">Select category</option>
                    {ingredientCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Supplier *</label>
                  <select
                    name="supplier"
                    value={newIngredientData.supplier}
                    onChange={handleIngredientInputChange}
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
                    value={newIngredientData.unit}
                    onChange={handleIngredientInputChange}
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
                    value={newIngredientData.price_per_unit}
                    onChange={handleIngredientInputChange}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="organic"
                    checked={newIngredientData.organic}
                    onChange={handleIngredientInputChange}
                  />
                  🌱 Organic
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="seasonal"
                    checked={newIngredientData.seasonal}
                    onChange={handleIngredientInputChange}
                  />
                  🍂 Seasonal
                </label>
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowIngredientModal(false)}>
                  Cancel
                </button>
                <button type="button" onClick={createNewIngredient}>
                  Create Ingredient
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderInstructions = () => (
    <div className="step-content">
      <div className="instructions-header">
        <h2>📋 Cooking Instructions</h2>
        <button className="add-step-btn" onClick={addInstruction}>
          + Add Step
        </button>
      </div>

      <div className="instructions-list">
        {instructions.map((instruction, index) => (
          <div key={index} className="instruction-item">
            <div className="instruction-header">
              <span className="step-number">Step {instruction.step}</span>
              <div className="instruction-controls">
                <button 
                  className="move-btn"
                  onClick={() => moveInstruction(index, 'up')}
                  disabled={index === 0}
                >
                  ↑
                </button>
                <button 
                  className="move-btn"
                  onClick={() => moveInstruction(index, 'down')}
                  disabled={index === instructions.length - 1}
                >
                  ↓
                </button>
                <button 
                  className="remove-btn"
                  onClick={() => removeInstruction(index)}
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="instruction-content">
              <textarea
                value={instruction.description}
                onChange={(e) => updateInstruction(index, 'description', e.target.value)}
                placeholder="Describe this cooking step..."
                rows="3"
                required
              />
              
              <div className="instruction-meta">
                <label>
                  Time (minutes):
                  <input
                    type="number"
                    value={instruction.time_minutes}
                    onChange={(e) => updateInstruction(index, 'time_minutes', e.target.value)}
                    min="0"
                    placeholder="Optional"
                  />
                </label>
              </div>
            </div>
          </div>
        ))}
        
        {instructions.length === 0 && (
          <div className="no-instructions">
            <p>No cooking steps added yet. Click "Add Step" to start.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderReview = () => (
    <div className="step-content">
      <h2>👀 Review Recipe</h2>
      
      <div className="review-section">
        <h3>Basic Information</h3>
        <div className="review-item">
          <strong>Name:</strong> {recipeData.name}
        </div>
        <div className="review-item">
          <strong>Category:</strong> {recipeData.category}
        </div>
        <div className="review-item">
          <strong>Difficulty:</strong> {recipeData.difficulty}
        </div>
        {recipeData.description && (
          <div className="review-item">
            <strong>Description:</strong> {recipeData.description}
          </div>
        )}
      </div>

      <div className="review-section">
        <h3>Ingredients ({selectedIngredients.length})</h3>
        {selectedIngredients.map((ingredient, index) => (
          <div key={index} className="review-ingredient">
            {ingredient.quantity} {ingredient.unit} {ingredient.ingredientData.name}
            {ingredient.notes && <em> - {ingredient.notes}</em>}
          </div>
        ))}
      </div>

      <div className="review-section">
        <h3>Instructions ({instructions.length} steps)</h3>
        {instructions.map((instruction, index) => (
          <div key={index} className="review-instruction">
            <strong>Step {instruction.step}:</strong> {instruction.description}
            {instruction.time_minutes && <em> ({instruction.time_minutes} minutes)</em>}
          </div>
        ))}
      </div>

      <div className="save-section">
        <button 
          className="save-recipe-btn"
          onClick={saveRecipe}
          disabled={saving}
        >
          {saving ? (isEditing ? 'Updating Recipe...' : 'Saving Recipe...') : (isEditing ? '💾 Update Recipe' : '💾 Save Recipe')}
        </button>
      </div>
    </div>
  );

  if (loading) {
    return <div className="recipe-creator-loading">Loading recipe...</div>;
  }

  return (
    <div className="recipe-creator-container">
      <div className="creator-header">
        <h1>{isEditing ? '✏️ Edit Recipe' : '🍳 Create New Recipe'}</h1>
        <a href="/recipes" className="back-link">← Back to Recipes</a>
      </div>

      {/* Step Navigation */}
      <div className="step-navigation">
        <div 
          className={`step-tab ${currentStep === 'basic' ? 'active' : ''} ${validateStep('basic') ? 'completed' : ''}`}
          onClick={() => setCurrentStep('basic')}
        >
          <span className="step-number">1</span>
          <span className="step-label">Basic Info</span>
        </div>
        <div 
          className={`step-tab ${currentStep === 'ingredients' ? 'active' : ''} ${validateStep('ingredients') ? 'completed' : ''}`}
          onClick={() => setCurrentStep('ingredients')}
        >
          <span className="step-number">2</span>
          <span className="step-label">Ingredients</span>
        </div>
        <div 
          className={`step-tab ${currentStep === 'instructions' ? 'active' : ''} ${validateStep('instructions') ? 'completed' : ''}`}
          onClick={() => setCurrentStep('instructions')}
        >
          <span className="step-number">3</span>
          <span className="step-label">Instructions</span>
        </div>
        <div 
          className={`step-tab ${currentStep === 'review' ? 'active' : ''}`}
          onClick={() => setCurrentStep('review')}
        >
          <span className="step-number">4</span>
          <span className="step-label">Review</span>
        </div>
      </div>

      {/* Step Content */}
      <div className="step-container">
        {currentStep === 'basic' && renderBasicInfo()}
        {currentStep === 'ingredients' && renderIngredients()}
        {currentStep === 'instructions' && renderInstructions()}
        {currentStep === 'review' && renderReview()}
      </div>

      {/* Navigation Buttons */}
      <div className="navigation-buttons">
        {currentStep !== 'basic' && (
          <button 
            className="nav-btn prev-btn"
            onClick={() => {
              const steps = ['basic', 'ingredients', 'instructions', 'review'];
              const currentIndex = steps.indexOf(currentStep);
              setCurrentStep(steps[currentIndex - 1]);
            }}
          >
            ← Previous
          </button>
        )}
        
        {currentStep !== 'review' && (
          <button 
            className="nav-btn next-btn"
            onClick={() => {
              if (!validateStep(currentStep)) {
                alert('Please complete all required fields before proceeding');
                return;
              }
              const steps = ['basic', 'ingredients', 'instructions', 'review'];
              const currentIndex = steps.indexOf(currentStep);
              setCurrentStep(steps[currentIndex + 1]);
            }}
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
};

// Ingredient Selector Component
const IngredientSelector = ({ ingredient, onAdd }) => {
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [notes, setNotes] = useState('');
  const [expanded, setExpanded] = useState(false);

  const handleAdd = () => {
    onAdd(ingredient, quantity, unit, notes);
    setQuantity('');
    setUnit('');
    setNotes('');
    setExpanded(false);
  };

  return (
    <div className="ingredient-selector">
      <div className="ingredient-info" onClick={() => setExpanded(!expanded)}>
        <h4>{ingredient.name}</h4>
        <p>{ingredient.category}</p>
        <span className="supplier">{ingredient.supplier?.name}</span>
        <span className="price">${ingredient.price_per_unit?.toFixed(2)}/{ingredient.unit}</span>
      </div>
      
      {expanded && (
        <div className="ingredient-form">
          <input
            type="number"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            step="0.1"
            min="0"
          />
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
          >
            <option value="">Unit</option>
            <option value={ingredient.unit}>{ingredient.unit}</option>
            <option value="cup">cup</option>
            <option value="tbsp">tbsp</option>
            <option value="tsp">tsp</option>
            <option value="piece">piece</option>
            <option value="g">g</option>
            <option value="kg">kg</option>
            <option value="ml">ml</option>
            <option value="liter">liter</option>
          </select>
          <input
            type="text"
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <button onClick={handleAdd} disabled={!quantity || !unit}>
            Add to Recipe
          </button>
        </div>
      )}
    </div>
  );
};

export default RecipeCreator;