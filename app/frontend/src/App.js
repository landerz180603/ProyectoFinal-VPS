import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState([]);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/register`, { email, password });
      setMessage(`Usuario registrado con ID: ${res.data.id}`);
      // Actualizar lista de usuarios
      const usersRes = await axios.get(`${process.env.REACT_APP_API_URL}/users`);
      setUsers(usersRes.data);
    } catch (err) {
      setMessage(`Error: ${err.response?.data?.error || err.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Registro de Usuario</h1>
      <form onSubmit={handleRegister}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ marginRight: '10px' }}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{ marginRight: '10px' }}
        />
        <button type="submit">Registrar</button>
      </form>
      <p>{message}</p>
      <h2>Usuarios registrados</h2>
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.email} - {user.created_at}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;