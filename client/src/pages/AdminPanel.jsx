import { useEffect, useState } from 'react';
import { api } from '../services/api.js';

export default function AdminPanel({ products }) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api('/orders').then(setOrders).catch(console.error);
  }, []);

  return (
    <section>
      <h2>Панель управления</h2>

      <p>
        Продавец может менять статусы заказов, управлять товарами, ценой и
        наличием. Администратор имеет полный доступ, включая отзывы, категории и
        интеграции.
      </p>

      <h3>Заказы</h3>

      {orders.length === 0 && <p>Заказов пока нет.</p>}

      {orders.map((order) => (
        <div className="panel" key={order.id}>
          №{order.id} — {order.status} — {order.total_price} ₽
        </div>
      ))}

      <h3>Товары</h3>

      {products.map((product) => (
        <div className="row" key={product.id}>
          {product.name}
          <span>
            {product.price} ₽ · {product.stock_quantity} шт.
          </span>
        </div>
      ))}
    </section>
  );
}