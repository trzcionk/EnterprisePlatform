import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, X, PackageOpen, Tag, DollarSign, Box } from 'lucide-react';

const API_URL = '/api/products';

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        setProducts(products.filter(p => p.id !== id));
      } catch (err) {
        console.error('Failed to delete', err);
      }
    }
  };

  const handleEdit = (product) => {
    setCurrentProduct(product);
    setModalOpen(true);
  };

  const handleAddNew = () => {
    setCurrentProduct(null);
    setModalOpen(true);
  };

  return (
    <div className="container animate-fade-in">
      <header className="page-header glass-panel" style={{ padding: '1.5rem 2rem' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Product Inventory</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your enterprise products</p>
        </div>
        <button className="btn-primary" onClick={handleAddNew}>
          <Plus size={20} />
          Add Product
        </button>
      </header>

      {loading ? (
        <div style={{ padding: '4rem 0' }}>
          <div className="spinner"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="glass-panel empty-state">
          <PackageOpen size={64} />
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#fff' }}>No products found</h2>
          <p style={{ marginBottom: '2rem' }}>Get started by adding your first product to the inventory.</p>
          <button className="btn-primary" onClick={handleAddNew}>
            <Plus size={20} />
            Add First Product
          </button>
        </div>
      ) : (
        <div className="product-grid">
          {products.map(product => (
            <div key={product.id} className="glass-panel product-card">
              <div className="product-category">
                <Tag size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                {product.category || 'Uncategorized'}
              </div>
              <h3 className="product-title">{product.name}</h3>
              <p className="product-desc">{product.description}</p>
              
              <div className="product-meta">
                <div className="product-price">
                  <DollarSign size={18} style={{ display: 'inline', verticalAlign: 'sub', opacity: 0.7 }}/>
                  {product.price}
                </div>
                <div className="product-stock">
                  <Box size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }}/>
                  {product.stock} in stock
                </div>
              </div>
              
              <div className="card-actions">
                <button className="btn-outline" onClick={() => handleEdit(product)}>
                  <Edit2 size={16} />
                  Edit
                </button>
                <button className="btn-danger" onClick={() => handleDelete(product.id)}>
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <ProductModal 
          product={currentProduct} 
          onClose={() => setModalOpen(false)} 
          onSave={() => {
            setModalOpen(false);
            fetchProducts();
          }}
        />
      )}
    </div>
  );
}

function ProductModal({ product, onClose, onSave }) {
  const [formData, setFormData] = useState(
    product || { name: '', description: '', price: '', stock: '', category: '' }
  );
  const [saving, setSaving] = useState(false);
  
  const isEditing = !!product;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'price' || name === 'stock' ? Number(value) : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      if (isEditing) {
        await axios.put(`${API_URL}/${product.id}`, formData);
      } else {
        await axios.post(API_URL, formData);
      }
      onSave();
    } catch (err) {
      console.error('Failed to save product', err);
      alert('Failed to save product. Check console.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-content animate-fade-in" style={{ animationDuration: '0.2s' }}>
        <div className="modal-header">
          <h2 style={{ fontSize: '1.5rem', color: '#fff' }}>
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button style={{ background: 'transparent', padding: '0.5rem' }} onClick={onClose} type="button">
            <X size={20} color="var(--text-muted)"/>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Product Name</label>
            <input 
              required
              type="text" 
              id="name" 
              name="name" 
              value={formData.name} 
              onChange={handleChange}
              placeholder="e.g. Wireless Headphones"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea 
              required
              id="description" 
              name="description" 
              value={formData.description} 
              onChange={handleChange}
              rows={3}
              placeholder="Detailed product description..."
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">Price ($)</label>
              <input 
                required
                type="number" 
                id="price" 
                name="price" 
                min="0"
                step="0.01"
                value={formData.price} 
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="stock">Stock Quantity</label>
              <input 
                required
                type="number" 
                id="stock" 
                name="stock" 
                min="0"
                value={formData.stock} 
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <input 
              required
              type="text" 
              id="category" 
              name="category" 
              value={formData.category} 
              onChange={handleChange}
              placeholder="e.g. Electronics"
            />
          </div>
          
          <div className="modal-actions">
            <button type="button" className="btn-outline" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
