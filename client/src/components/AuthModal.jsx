import { useState } from 'react';
import { api } from '../services/api.js';
import { useStore } from '../context/StoreContext.jsx';

export default function AuthModal({ onClose }) {
  const { setUser } = useStore();

  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });

  async function submitHandler(event) {
    event.preventDefault();
    setError('');

    if (!/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) {
      setError('Введите корректный Email с @');
      return;
    }

    if (form.password.length < 6) {
      setError('Пароль минимум 6 символов');
      return;
    }

    try {
      const data = await api(`/auth/${mode === 'login' ? 'login' : 'register'}`, {
        method: 'POST',
        body: JSON.stringify(form)
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setUser(data.user);
      onClose();
    } catch (error) {
      setError(error.message || 'Ошибка авторизации');
    }
  }

  return (
    <div className="overlay">
      <form className="modal" onSubmit={submitHandler}>
        <button type="button" className="x" onClick={onClose}>
          ×
        </button>

        <h2>{mode === 'login' ? 'Авторизация' : 'Регистрация'}</h2>

        {error && <p className="form-error">{error}</p>}

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
          onClick={() => {
            setError('');
            setMode(mode === 'login' ? 'register' : 'login');
          }}
        >
          {mode === 'login' ? 'Создать аккаунт' : 'Уже есть аккаунт'}
        </button>
      </form>
    </div>
  );
}