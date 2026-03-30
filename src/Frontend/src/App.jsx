import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Plus, Edit2, Trash2, X, PackageOpen, Tag, DollarSign, Box, Activity, CheckCircle2, AlertCircle } from 'lucide-react';

const API_URL = '/api/products';

function App() {
  const { t, i18n } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [statuses, setStatuses] = useState({
    auth: { status: 'loading', label: t('auth') },
    processor: { status: 'loading', label: t('processor') },
    gateway: { status: 'loading', label: t('gateway') },
    product: { status: 'loading', label: t('product') }
  });

  const fetchStatuses = async () => {
    const services = [
      { key: 'auth', url: '/api/auth/status' },
      { key: 'processor', url: '/api/processor/status' },
      { key: 'gateway', url: '/api/gateway/status' },
      { key: 'product', url: '/api/products/status' }
    ];

    for (const service of services) {
      try {
        const res = await axios.get(service.url);
        setStatuses(prev => ({ ...prev, [service.key]: { ...prev[service.key], status: res.data } }));
      } catch (err) {
        setStatuses(prev => ({ ...prev, [service.key]: { ...prev[service.key], status: err.message } }));
      }
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      setProducts(res.data);
    } catch (err) {
      console.error(t('failed_fetch'), err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchStatuses();
    const interval = setInterval(fetchStatuses, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    document.title = t('title');
  }, [t]);

  const handleDelete = async (id) => {
    if (confirm(t('confirm_delete'))) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        setProducts(products.filter(p => p.id !== id));
      } catch (err) {
        console.error(t('failed_delete'), err);
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
          <h1 className="page-title" style={{ margin: 0 }}>{t('title')}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '0.5rem' }}>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>{t('subtitle')}</p>
            <div className="status-indicators">
              {Object.entries(statuses).map(([key, info]) => (
                <div key={key} className={`status-tag ${info.status === 'Running' ? 'status-online' : 'status-offline'}`}>
                  {info.status === 'Running' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                  <span>{info.label}: {info.status === 'loading' ? t('status_checking') : (info.status === 'Running' ? t('status_running') : info.status)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select 
            onChange={(e) => i18n.changeLanguage(e.target.value)} 
            value={i18n.language}
            className="btn-outline"
            style={{ padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}
          >
            <option value="en">English</option>
            <option value="pl">Polski</option>
          </select>
          <button className="btn-primary" onClick={handleAddNew}>
            <Plus size={20} />
            {t('add_product')}
          </button>
        </div>
      </header>

      {loading ? (
        <div style={{ padding: '4rem 0' }}>
          <div className="spinner"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="glass-panel empty-state">
          <PackageOpen size={64} />
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#fff' }}>{t('no_products')}</h2>
          <p style={{ marginBottom: '2rem' }}>{t('no_products_desc')}</p>
          <button className="btn-primary" onClick={handleAddNew}>
            <Plus size={20} />
            {t('add_first_product')}
          </button>
        </div>
      ) : (
        <div className="product-grid">
          {products.map(product => (
            <div key={product.id} className="glass-panel product-card">
              <div className="product-category">
                <Tag size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                {product.category || t('uncategorized')}
              </div>
              <h3 className="product-title">{product.name}</h3>
              <p className="product-desc">{product.description}</p>

              <div className="product-meta">
                <div className="product-price">
                  <DollarSign size={18} style={{ display: 'inline', verticalAlign: 'sub', opacity: 0.7 }} />
                  {product.price}
                </div>
                <div className="product-stock">
                  <Box size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
                  {product.stock} {t('in_stock')}
                </div>
              </div>

              <div className="card-actions">
                <button className="btn-outline" onClick={() => handleEdit(product)}>
                  <Edit2 size={16} />
                  {t('edit')}
                </button>
                <button className="btn-danger" onClick={() => handleDelete(product.id)}>
                  <Trash2 size={16} />
                  {t('delete')}
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
      console.error(t('failed_save'), err);
      alert(t('failed_save'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-content animate-fade-in" style={{ animationDuration: '0.2s' }}>
        <div className="modal-header">
          <h2 style={{ fontSize: '1.5rem', color: '#fff' }}>
            {isEditing ? t('edit_product') : t('add_new_product')}
          </h2>
          <button style={{ background: 'transparent', padding: '0.5rem' }} onClick={onClose} type="button">
            <X size={20} color="var(--text-muted)" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">{t('product_name')}</label>
            <input
              required
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={t('name_placeholder')}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">{t('description')}</label>
            <textarea
              required
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder={t('desc_placeholder')}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">{t('price')}</label>
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
              <label htmlFor="stock">{t('stock_quantity')}</label>
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
            <label htmlFor="category">{t('category')}</label>
            <input
              required
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder={t('cat_placeholder')}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-outline" onClick={onClose} disabled={saving}>
              {t('cancel')}
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? t('saving') : t('save_product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
