import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthModal from './AuthModal.jsx';
import { useStore } from '../context/StoreContext.jsx';

const categories = [
  { id: 1, name: 'Торты' },
  { id: 2, name: 'Пирожные' },
  { id: 3, name: 'Печенье' },
  { id: 4, name: 'Капкейки' },
  { id: 5, name: 'Круассаны' },
  { id: 6, name: 'Макаруны' },
  { id: 7, name: 'Чизкейки' }
];

export default function Header() {
  const navigate = useNavigate();
  const { user, setUser, items } = useStore();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const cartCount = items.reduce((sum, item) => sum + item.qty, 0);

  function goHome() {
    navigate('/');
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0);
  }

  function goCategory(categoryId) {
    navigate(`/?category=${categoryId}`);
    setTimeout(() => {
      document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
    }, 0);
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }

  return (
    <>
      <header>
        <button className="brand brand-button" onClick={goHome}>
          Bakery Street
        </button>

        <nav>
          <div className="dropdown">
            <button type="button" onClick={() => navigate('/')}>
              Каталог
            </button>

            <div className="dropdown-menu">
              {categories.map((category) => (
                <button
                  type="button"
                  key={category.id}
                  onClick={() => goCategory(category.id)}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

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