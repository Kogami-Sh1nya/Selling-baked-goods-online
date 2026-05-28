import { useState } from 'react';
import { api } from '../services/api.js';
import { useStore } from '../context/StoreContext.jsx';

export default function AuthModal({ onClose }) {
  const { setUser } = useStore();

  const [mode, setMode] = useState('login');

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });

  async function submitHandler(event) {
    event.preventDefault();

    if (!/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) {
      alert('Введите корректный Email с @');
      return;
    }

    if (form.password.length < 6) {
      alert('Пароль минимум 6 символов');
      return;
    }

    const data = await api(`/auth/${mode === 'login' ? 'login' : 'register'}`, {
      method: 'POST',
      body: JSON.stringify(form)
    });

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    setUser(data.user);
    onClose();
  }

  return (
    <div className="overlay">
      <form className="modal" onSubmit={submitHandler}>
        <button type="button" className="x" onClick={onClose}>
          ×
        </button>

        <h2>{mode === 'login' ? 'Авторизация' : 'Регистрация'}</h2>

        {mode === 'register' && (
          <input
            required
            minLength="2"
            placeholder="Имя"
            value={form.name}
            onChange={(event) =>
              setForm({ ...form, name: event.target.value })
            }
          />
        )}

        <input
          required
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(event) =>
            setForm({ ...form, email: event.target.value })
          }
        />

        <input
          required
          minLength="6"
          type="password"
          placeholder="Пароль"
          value={form.password}
          onChange={(event) =>
            setForm({ ...form, password: event.target.value })
          }
        />

        <button>{mode === 'login' ? 'Войти' : 'Зарегистрироваться'}</button>

        <button
          type="button"
          className="link-button"
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
        >
          {mode === 'login' ? 'Создать аккаунт' : 'Уже есть аккаунт'}
        </button>
      </form>
    </div>
  );
}