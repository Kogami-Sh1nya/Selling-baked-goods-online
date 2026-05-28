import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthModal from './AuthModal.jsx';
import { useStore } from '../context/StoreContext.jsx';

export default function Header() {
  const { user, setUser, items } = useStore();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const cartCount = items.reduce((sum, item) => sum + item.qty, 0);

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }

  return (
    <>
      <header>
        <Link className="brand" to="/">
          Bakery Street
        </Link>

        <nav>
          <a href="/#catalog">Каталог</a>
          <Link to="/cart">Корзина ({cartCount})</Link>
          <Link to="/profile">Профиль</Link>

          {user ? (
            <>
              <b>
                {user.name} · {user.role}
              </b>
              <button onClick={logout}>Выйти</button>
            </>
          ) : (
            <button onClick={() => setIsAuthOpen(true)}>
              Регистрация / вход
            </button>
          )}
        </nav>
      </header>

      {isAuthOpen && <AuthModal onClose={() => setIsAuthOpen(false)} />}
    </>
  );
}