import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { useStore } from '../context/StoreContext.jsx';
import AdminPanel from './AdminPanel.jsx';

export default function Profile() {
  const { user } = useStore();

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!user) return;

    api('/orders/my').then(setOrders).catch(console.error);

    if (['seller', 'admin'].includes(user.role)) {
      api('/products').then(setProducts).catch(console.error);
    }
  }, [user]);

  if (!user) {
    return (
      <main>
        <h1>Профиль</h1>
        <p>Войдите или зарегистрируйтесь.</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Профиль</h1>

      <p>
        {user.name} — {user.email}
      </p>

      <h2>История заказов</h2>

      {orders.length === 0 && <p>Заказов пока нет.</p>}

      {orders.map((order) => (
        <div className="panel" key={order.id}>
          Заказ №{order.id}: {order.status}, {order.total_price} ₽, доставка{' '}
          {new Date(order.estimated_delivery_at).toLocaleString()}
        </div>
      ))}

      {['seller', 'admin'].includes(user.role) && (
        <AdminPanel products={products} />
      )}
    </main>
  );
}