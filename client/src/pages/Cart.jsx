import { useState } from 'react';
import { api } from '../services/api.js';
import { useStore } from '../context/StoreContext.jsx';
import QuantityControl from '../components/QuantityControl.jsx';

export default function Cart() {
  const { items, user } = useStore();

  const total = items.reduce(
    (sum, item) => sum + item.qty * Number(item.product.price),
    0
  );

  const [form, setForm] = useState({
    customer_name: user?.name || '',
    phone: '',
    email: user?.email || '',
    delivery_address: '',
    comment: '',
    cardNumber: '4111111111111111',
    cardHolder: 'TEST USER',
    expiry: '12/26',
    cvv: '123'
  });

  async function orderHandler(event) {
    event.preventDefault();

    if (!user) {
      alert('Авторизуйтесь для оформления заказа');
      return;
    }

    if (!/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) {
      alert('Некорректная почта');
      return;
    }
    const phoneRegex = /^\+7\d{10}$/;
    const addressRegex = /(ул\.|улица|проспект|пр-т|пер\.|переулок|бульвар|шоссе)\s+[А-Яа-яA-Za-z0-9ёЁ\s.-]+,\s*\d+[А-Яа-яA-Za-z/-]*$/i;

    if (!phoneRegex.test(form.phone)) {
    alert('Телефон должен быть в формате +7XXXXXXXXXX');
    return;
    }

    if (!addressRegex.test(form.delivery_address)) {
    alert('Адрес должен содержать улицу и номер дома. Например: улица Островского, 10');
    return;
    }
    await api('/orders', {
      method: 'POST',
      body: JSON.stringify({
        items: items.map((item) => ({
          product_id: item.product.id,
          quantity: item.qty
        })),
        customer_name: form.customer_name,
        phone: form.phone,
        email: form.email,
        delivery_address: form.delivery_address,
        comment: form.comment,
        payment: form
      })
    });

    localStorage.removeItem('cart');
    alert('Заказ оформлен и оплачен тестовой платежной системой');

    window.location.href = '/profile';
  }

  return (
    <main className="cart">
      <form onSubmit={orderHandler} className="panel">
        <h1>Корзина</h1>

        {items.length === 0 && <p>Корзина пуста.</p>}

        {items.map((item) => (
          <div className="row" key={item.product.id}>
            <span>{item.product.name}</span>
            <QuantityControl product={item.product} />
          </div>
        ))}

        <h2>Персональная информация</h2>

        <input
          required
          placeholder="Имя"
          value={form.customer_name}
          onChange={(event) =>
            setForm({ ...form, customer_name: event.target.value })
          }
        />

        <input
          required
          placeholder="Телефон: +7XXXXXXXXXX"
          value={form.phone}
          onChange={(event) => setForm({ ...form, phone: event.target.value })}
        />

        <input
          required
          type="email"
          placeholder="Почта"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
        />

        <input
          required
          placeholder="Адрес доставки"
          value={form.delivery_address}
          onChange={(event) =>
            setForm({ ...form, delivery_address: event.target.value })
          }
        />

        <textarea
          placeholder="Комментарий к заказу"
          value={form.comment}
          onChange={(event) =>
            setForm({ ...form, comment: event.target.value })
          }
        />

        <p>Примерное время доставки: 1 час после оформления заказа.</p>

        <h2>Тестовая оплата</h2>

        <input
          required
          pattern="[0-9]{16}"
          placeholder="Номер карты"
          value={form.cardNumber}
          onChange={(event) =>
            setForm({ ...form, cardNumber: event.target.value })
          }
        />

        <input
          required
          placeholder="Имя на карте"
          value={form.cardHolder}
          onChange={(event) =>
            setForm({ ...form, cardHolder: event.target.value })
          }
        />

        <button disabled={!items.length}>Оформить заказ</button>
      </form>

      <aside className="panel total">
        <h2>Итого</h2>
        <p>Товары: {total} ₽</p>
        <p>Доставка: 150 ₽</p>
        <h3>К оплате: {total + 150} ₽</h3>
      </aside>
    </main>
  );
}