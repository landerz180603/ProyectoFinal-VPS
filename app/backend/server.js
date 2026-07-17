require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();

const PORT = Number(process.env.PORT) || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('La variable JWT_SECRET es obligatoria');
}


app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10kb' }));

const pool = new Pool({
  user: process.env.DB_USER || 'appuser',
  host: process.env.DB_HOST || 'postgres',
  database: process.env.DB_NAME || 'appdb',
  password: process.env.DB_PASS || 'apppass',
  port: Number(process.env.DB_PORT) || 5432,
});

pool.on('error', (error) => {
  console.error('Error inesperado en PostgreSQL:', error);
});

const initDB = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
      image_url VARCHAR(500),
      stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  const productCount = await pool.query(
    'SELECT COUNT(*)::INTEGER AS total FROM products'
  );

  if (productCount.rows[0].total === 0) {
    await pool.query(`
      INSERT INTO products (
        name,
        description,
        price,
        image_url,
        stock
      )
      VALUES
        (
          'Whisky Jack Daniel''s',
          'Whisky americano con notas de caramelo',
          45.99,
          'https://placehold.co/400x300?text=Jack+Daniels',
          10
        ),
        (
          'Ron Havana Club 7 años',
          'Ron cubano añejo, ideal para cócteles',
          38.50,
          'https://placehold.co/400x300?text=Havana+Club',
          8
        ),
        (
          'Vodka Absolut',
          'Vodka sueco de alta calidad',
          29.90,
          'https://placehold.co/400x300?text=Absolut',
          15
        ),
        (
          'Ginebra Bombay Sapphire',
          'Ginebra premium de sabor equilibrado',
          34.20,
          'https://placehold.co/400x300?text=Bombay',
          12
        ),
        (
          'Tequila José Cuervo',
          'Tequila reposado mexicano',
          42.00,
          'https://placehold.co/400x300?text=Jose+Cuervo',
          6
        )
    `);
  }

  console.log('Base de datos inicializada correctamente');
};

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const authenticateToken = (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Debes iniciar sesión',
    });
  }

  const token = authorization.split(' ')[1];

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({
      error: 'Token inválido o expirado',
    });
  }
};

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');

    res.json({
      status: 'ok',
      database: 'connected',
    });
  } catch {
    res.status(503).json({
      status: 'error',
      database: 'disconnected',
    });
  }
});

app.post('/register', async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).json({
      error: 'El correo y la contraseña son obligatorios',
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      error: 'El correo electrónico no es válido',
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      error: 'La contraseña debe tener al menos 8 caracteres',
    });
  }

  try {
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        error: 'El correo ya está registrado',
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `
        INSERT INTO users (email, password_hash)
        VALUES ($1, $2)
        RETURNING id, email, created_at
      `,
      [email, passwordHash]
    );

    res.status(201).json({
      message: 'Usuario registrado correctamente',
      user: result.rows[0],
    });
  } catch (error) {
    console.error('Error registrando usuario:', error);

    res.status(500).json({
      error: 'No se pudo registrar el usuario',
    });
  }
});

app.post('/login', async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).json({
      error: 'El correo y la contraseña son obligatorios',
    });
  }

  try {
    const result = await pool.query(
      `
        SELECT id, email, password_hash
        FROM users
        WHERE email = $1
      `,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Credenciales incorrectas',
      });
    }

    const user = result.rows[0];

    const passwordIsValid = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordIsValid) {
      return res.status(401).json({
        error: 'Credenciales incorrectas',
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      JWT_SECRET,
      {
        expiresIn: '2h',
      }
    );

    res.json({
      message: 'Inicio de sesión correcto',
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Error iniciando sesión:', error);

    res.status(500).json({
      error: 'No se pudo iniciar sesión',
    });
  }
});

app.get('/profile', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT id, email, created_at
        FROM users
        WHERE id = $1
      `,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error consultando perfil:', error);

    res.status(500).json({
      error: 'No se pudo obtener el perfil',
    });
  }
});

app.get('/products', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        description,
        price::FLOAT AS price,
        image_url,
        stock
      FROM products
      ORDER BY id
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error consultando productos:', error);

    res.status(500).json({
      error: 'No se pudieron cargar los productos',
    });
  }
});

app.get('/products/:id', authenticateToken, async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      error: 'Identificador de producto inválido',
    });
  }

  try {
    const result = await pool.query(
      `
        SELECT
          id,
          name,
          description,
          price::FLOAT AS price,
          image_url,
          stock
        FROM products
        WHERE id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Producto no encontrado',
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error consultando producto:', error);

    res.status(500).json({
      error: 'No se pudo cargar el producto',
    });
  }
});

app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
  });
});

const startServer = async () => {
  try {
    await initDB();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Backend ejecutándose en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error('No se pudo iniciar el backend:', error);
    process.exit(1);
  }
};

startServer();