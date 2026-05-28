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
  const [reviews, setReviews] = useState([]);

  const [selectedProductId, setSelectedProductId] = useState('');
  const [productDraft, setProductDraft] = useState(null);

  const selectedProduct = localProducts.find(
    (product) => Number(product.id) === Number(selectedProductId)
  );

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
      loadReviews();
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

  async function loadReviews() {
    const data = await api('/reviews');
    setReviews(data);
  }

  async function deleteReview(reviewId) {
    if (!confirm('Удалить отзыв?')) return;

    await api(`/reviews/${reviewId}`, {
      method: 'DELETE'
    });

    await loadReviews();
  }

  function selectProduct(productId) {
    setSelectedProductId(productId);

    const product = localProducts.find(
      (item) => Number(item.id) === Number(productId)
    );

    if (!product) {
      setProductDraft(null);
      return;
    }

    setProductDraft({
      price: product.price,
      stock_quantity: product.stock_quantity,
      is_available: product.is_available
    });
  }

  async function uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    const token = localStorage.getItem('token');

    const response = await fetch('https://localhost:5000/api/uploads/products', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Ошибка загрузки изображения');
    }

    return data.image_url;
  }

  async function updateProduct(productId, patch) {
    await api(`/products/${productId}`, {
      method: 'PATCH',
      body: JSON.stringify(patch)
    });

    await loadProducts();
  }

  async function saveSelectedProduct() {
    if (!selectedProduct || !productDraft) return;

    await updateProduct(selectedProduct.id, {
      price: Number(productDraft.price),
      stock_quantity: productDraft.is_available
        ? Number(productDraft.stock_quantity)
        : 0,
      is_available: productDraft.is_available
    });

    alert('Товар обновлён');
  }

  async function deleteProduct(productId) {
    if (!confirm('Удалить товар?')) return;

    await api(`/products/${productId}`, {
      method: 'DELETE'
    });

    setSelectedProductId('');
    setProductDraft(null);

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
    await loadProducts();
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
          <button onClick={() => setActiveTab('reviews')}>Отзывы</button>
        )}

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
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={async (e) => {
                const file = e.target.files[0];

                if (!file) return;

                try {
                  const imageUrl = await uploadImage(file);

                  setNewProduct({
                    ...newProduct,
                    image_url: imageUrl
                  });
                } catch (error) {
                  alert(error.message);
                }
              }}
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
                  stock_quantity: Number(e.target.value),
                  is_available: Number(e.target.value) > 0
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

          <select
            className="product-select"
            value={selectedProductId}
            onChange={(e) => selectProduct(e.target.value)}
          >
            <option value="">Выберите товар</option>

            {localProducts
              .slice()
              .sort((a, b) => a.id - b.id)
              .map((product) => (
                <option key={product.id} value={product.id}>
                  #{product.id} — {product.name}
                </option>
              ))}
          </select>

          {selectedProduct && productDraft && (
            <div className="admin-product-editor">
              <h4>{selectedProduct.name}</h4>

              <label>
                Цена
                <input
                  type="number"
                  value={productDraft.price}
                  onChange={(e) =>
                    setProductDraft({
                      ...productDraft,
                      price: e.target.value
                    })
                  }
                />
              </label>

              <label>
                Количество в наличии
                <input
                  type="number"
                  min="0"
                  value={productDraft.stock_quantity}
                  onChange={(e) =>
                    setProductDraft({
                      ...productDraft,
                      stock_quantity: e.target.value,
                      is_available: Number(e.target.value) > 0
                    })
                  }
                />
              </label>

              <label>
                Наличие
                <select
                  value={String(productDraft.is_available)}
                  onChange={(e) =>
                    setProductDraft({
                      ...productDraft,
                      is_available: e.target.value === 'true',
                      stock_quantity:
                        e.target.value === 'false'
                          ? 0
                          : productDraft.stock_quantity
                    })
                  }
                >
                  <option value="true">В наличии</option>
                  <option value="false">Нет в наличии</option>
                </select>
              </label>

              <button type="button" onClick={saveSelectedProduct}>
                Сохранить изменения
              </button>

              {currentUser?.role === 'admin' && (
                <button
                  type="button"
                  onClick={() => deleteProduct(selectedProduct.id)}
                >
                  Удалить товар
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="admin-section">
          <h3>Заказы</h3>

          {orders.map((order) => (
            <div className="admin-order-card" key={order.id}>
              <div>
                <h4>Заказ №{order.id}</h4>
                <p>{order.customer_name}</p>
                <p>{order.phone}</p>
                <p>{order.delivery_address}</p>
                <p>{order.total_price} ₽</p>

                <h5>Состав заказа</h5>

                <ul className="order-items">
                  {order.items?.map((item) => (
                    <li key={`${order.id}-${item.product_id}`}>
                      {item.name} — {item.quantity} шт. ×{' '}
                      {item.price_per_unit} ₽
                    </li>
                  ))}
                </ul>
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

      {activeTab === 'reviews' && currentUser?.role === 'admin' && (
        <div className="admin-section">
          <h3>Отзывы</h3>

          {reviews.length === 0 && <p>Отзывов пока нет.</p>}

          {reviews.map((review) => (
            <div className="admin-review-card" key={review.id}>
              <div>
                <h4>{review.product_name}</h4>
                <p>
                  {review.user_name || 'Пользователь'} — {review.rating}/5
                </p>
                <p>{review.comment}</p>
                <small>{new Date(review.created_at).toLocaleString()}</small>
              </div>

              <button onClick={() => deleteReview(review.id)}>Удалить</button>
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