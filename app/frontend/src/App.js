import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './index.css';

const API_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

function App() {
  const [token, setToken] = useState(
    () => localStorage.getItem('token') || ''
  );

  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(Boolean(token));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchProducts = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await api.get('/products', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        setProducts(response.data);
      } catch (requestError) {
        if (requestError.code === 'ERR_CANCELED') {
          return;
        }

        if (requestError.response?.status === 401) {
          localStorage.removeItem('token');
          setToken('');
          setError('Tu sesión expiró. Inicia sesión nuevamente.');
          return;
        }

        setError(
          requestError.response?.data?.error ||
            'No se pudieron cargar los productos'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    return () => controller.abort();
  }, [token]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      if (mode === 'register') {
        await api.post('/register', form);

        setMessage(
          'Registro completado. Ahora puedes iniciar sesión.'
        );

        setMode('login');
        setForm((currentForm) => ({
          ...currentForm,
          password: '',
        }));

        return;
      }

      const response = await api.post('/login', form);

      localStorage.setItem('token', response.data.token);
      setToken(response.data.token);
      setForm({
        email: '',
        password: '',
      });
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          'No fue posible completar la solicitud'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setProducts([]);
    setError('');
    setMessage('');
  };

  if (!token) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <h1>🍾 Licorería Chulla Vida</h1>

          <p className="auth-description">
            {mode === 'login'
              ? 'Inicia sesión para ingresar a la tienda.'
              : 'Crea una cuenta para acceder al catálogo.'}
          </p>

          {error && <div className="alert alert-error">{error}</div>}

          {message && (
            <div className="alert alert-success">{message}</div>
          )}

          <form onSubmit={handleSubmit}>
            <label htmlFor="email">Correo electrónico</label>

            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleInputChange}
              placeholder="usuario@correo.com"
              autoComplete="email"
              required
            />

            <label htmlFor="password">Contraseña</label>

            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleInputChange}
              placeholder="Mínimo 8 caracteres"
              autoComplete={
                mode === 'login'
                  ? 'current-password'
                  : 'new-password'
              }
              minLength={8}
              required
            />

            <button
              type="submit"
              className="primary-button"
              disabled={submitting}
            >
              {submitting
                ? 'Procesando...'
                : mode === 'login'
                  ? 'Iniciar sesión'
                  : 'Registrarme'}
            </button>
          </form>

          <button
            type="button"
            className="link-button"
            onClick={() => {
              setMode((currentMode) =>
                currentMode === 'login' ? 'register' : 'login'
              );
              setError('');
              setMessage('');
            }}
          >
            {mode === 'login'
              ? '¿No tienes cuenta? Regístrate'
              : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="store-page">
      <header className="store-header">
        <div>
          <h1>🍾 Licorería Chulla Vida</h1>
          <p>Catálogo de productos disponibles</p>
        </div>

        <button type="button" onClick={logout}>
          Cerrar sesión
        </button>
      </header>

      {loading && (
        <div className="status-message">Cargando productos...</div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {!loading && !error && products.length === 0 && (
        <div className="status-message">
          No existen productos registrados.
        </div>
      )}

      {!loading && products.length > 0 && (
        <section className="product-grid">
          {products.map((product) => {
            const price = Number(product.price);

            return (
              <article className="product-card" key={product.id}>
                <img
                  src={
                    product.image_url ||
                    'https://placehold.co/400x300?text=Sin+imagen'
                  }
                  alt={product.name}
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.src =
                      'https://placehold.co/400x300?text=Sin+imagen';
                  }}
                />

                <div className="product-content">
                  <h2>{product.name}</h2>

                  <p className="description">
                    {product.description || 'Sin descripción'}
                  </p>

                  <p className="price">
                    $
                    {Number.isFinite(price)
                      ? price.toFixed(2)
                      : '0.00'}
                  </p>

                  <p
                    className={
                      product.stock > 0
                        ? 'stock available'
                        : 'stock unavailable'
                    }
                  >
                    {product.stock > 0
                      ? `Stock disponible: ${product.stock}`
                      : 'Producto agotado'}
                  </p>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}

export default App;