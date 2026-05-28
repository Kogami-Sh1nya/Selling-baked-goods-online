import { useEffect, useState } from 'react';
import { api } from '../services/api.js';

const ORDER_STATUSES = [
  { value: 'новый', label: 'Новый' },
  { value: 'готовится', label: 'Готовится' },
  { value: 'в доставке', label: 'В доставке' },
  { value: 'доставлен', label: 'Доставлен' },
  { value: 'отменён', label: 'Отменён' }
];

const USER_ROLES = [
  { value: 'user', label: 'Пользователь' },
  { value: 'seller', label: 'Продавец' },
  { value: 'admin', label: 'Администратор' }
];

export default function AdminPanel({ products = [] }) {
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');

  const [activeTab, setActiveTab] = useState('products');
  const [localProducts, setLocalProducts] = useState(products);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);

  const [newProduct, setNewProduct] = useState({
    category_id: 1,
    name: '',
    description: '',
    price: '',
    weight_grams: 120,
    image_url: '/products/default.jpg',
    stock_quantity: 1,
    is_available: true,
    ingredients: ''
  });

  useEffect(() => {
    setLocalProducts(products);
  }, [products]);

  useEffect(() => {
    loadOrders();

    if (currentUser?.role === 'admin') {
      loadUsers();
    }
  }, []);

  async function loadProducts() {
    const data = await api('/products');
    setLocalProducts(data);
  }

  async function loadOrders() {
    const data = await api('/orders');
    setOrders(data);
  }

  async function loadUsers() {
    const data = await api('/users');
    setUsers(data);
  }

  async function updateProduct(productId, patch) {
    await api(`/products/${productId}`, {
      method: 'PATCH',
      body: JSON.stringify(patch)
    });

    await loadProducts();
  }

  async function deleteProduct(productId) {
    if (!confirm('Удалить товар?')) return;

    await api(`/products/${productId}`, {
      method: 'DELETE'
    });

    await loadProducts();
  }

  async function createProduct(event) {
    event.preventDefault();

    await api('/products', {
      method: 'POST',
      body: JSON.stringify(newProduct)
    });

    setNewProduct({
      category_id: 1,
      name: '',
      description: '',
      price: '',
      weight_grams: 120,
      image_url: '/products/default.jpg',
      stock_quantity: 1,
      is_available: true,
      ingredients: ''
    });

    await loadProducts();
  }

  async function updateOrderStatus(orderId, status) {
    await api(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });

    await loadOrders();
  }

  async function updateUserRole(userId, role) {
    await api(`/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role })
    });

    await loadUsers();
  }

  async function deleteUser(userId) {
    if (!confirm('Удалить пользователя?')) return;

    await api(`/users/${userId}`, {
      method: 'DELETE'
    });

    await loadUsers();
  }

  return (
    <section className="admin-panel">
      <h2>Панель управления</h2>

      <div className="admin-tabs">
        <button onClick={() => setActiveTab('products')}>Товары</button>
        <button onClick={() => setActiveTab('orders')}>Заказы</button>

        {currentUser?.role === 'admin' && (
          <button onClick={() => setActiveTab('users')}>Пользователи</button>
        )}
      </div>

      {activeTab === 'products' && (
        <div className="admin-section">
          <h3>Добавить товар</h3>

          <form className="admin-form" onSubmit={createProduct}>
            <input
              required
              placeholder="Название"
              value={newProduct.name}
              onChange={(e) =>
                setNewProduct({ ...newProduct, name: e.target.value })
              }
            />

            <input
              required
              type="number"
              placeholder="Цена"
              value={newProduct.price}
              onChange={(e) =>
                setNewProduct({ ...newProduct, price: Number(e.target.value) })
              }
            />

            <input
              required
              type="number"
              placeholder="Количество"
              value={newProduct.stock_quantity}
              onChange={(e) =>
                setNewProduct({
                  ...newProduct,
                  stock_quantity: Number(e.target.value)
                })
              }
            />

            <select
              value={newProduct.category_id}
              onChange={(e) =>
                setNewProduct({
                  ...newProduct,
                  category_id: Number(e.target.value)
                })
              }
            >
              <option value={1}>Торты</option>
              <option value={2}>Пирожные</option>
              <option value={3}>Печенье</option>
              <option value={4}>Капкейки</option>
              <option value={5}>Круассаны</option>
              <option value={6}>Макаруны</option>
              <option value={7}>Чизкейки</option>
            </select>

            <input
              placeholder="URL изображения"
              value={newProduct.image_url}
              onChange={(e) =>
                setNewProduct({ ...newProduct, image_url: e.target.value })
              }
            />

            <textarea
              placeholder="Описание"
              value={newProduct.description}
              onChange={(e) =>
                setNewProduct({ ...newProduct, description: e.target.value })
              }
            />

            <textarea
              placeholder="Состав"
              value={newProduct.ingredients}
              onChange={(e) =>
                setNewProduct({
                  ...newProduct,
                  ingredients: e.target.value
                })
              }
            />

            <button type="submit">Добавить товар</button>
          </form>

          <h3>Управление товарами</h3>

          {localProducts.map((product) => (
            <div className="admin-row" key={product.id}>
              <strong>{product.name}</strong>

              <input
                type="number"
                defaultValue={product.price}
                onBlur={(e) =>
                  updateProduct(product.id, { price: Number(e.target.value) })
                }
              />

              <input
                type="number"
                defaultValue={product.stock_quantity}
                onBlur={(e) =>
                  updateProduct(product.id, {
                    stock_quantity: Number(e.target.value)
                  })
                }
              />

              <select
                defaultValue={String(product.is_available)}
                onChange={(e) =>
                  updateProduct(product.id, {
                    is_available: e.target.value === 'true'
                  })
                }
              >
                <option value="true">В наличии</option>
                <option value="false">Нет в наличии</option>
              </select>

              {currentUser?.role === 'admin' && (
                <button onClick={() => deleteProduct(product.id)}>
                  Удалить
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="admin-section">
          <h3>Заказы</h3>

          {orders.map((order) => (
            <div className="admin-row" key={order.id}>
              <div>
                <strong>Заказ №{order.id}</strong>
                <p>{order.customer_name}</p>
                <p>{order.phone}</p>
                <p>{order.delivery_address}</p>
                <p>{order.total_price} ₽</p>
              </div>

              <select
                value={order.status}
                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
              >
                {ORDER_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'users' && currentUser?.role === 'admin' && (
        <div className="admin-section">
          <h3>Пользователи</h3>

          {users.map((user) => (
            <div className="admin-row" key={user.id}>
              <div>
                <strong>{user.name}</strong>
                <p>{user.email}</p>
              </div>

              <select
                value={user.role}
                onChange={(e) => updateUserRole(user.id, e.target.value)}
              >
                {USER_ROLES.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>

              <button onClick={() => deleteUser(user.id)}>Удалить</button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}