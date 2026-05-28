import { useEffect, useState } from 'react';
import QuantityControl from './QuantityControl.jsx';
import { api, getImageUrl } from '../services/api.js';
import { useStore } from '../context/StoreContext.jsx';

export default function ProductModal({ product, onClose }) {
  const { user } = useStore();

  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: ''
  });

  useEffect(() => {
    loadReviews();
  }, [product.id]);

  async function loadReviews() {
    const data = await api(`/products/${product.id}/reviews`);
    setReviews(data);
  }

  async function submitReview(event) {
    event.preventDefault();

    if (!user) {
      alert('Авторизуйтесь, чтобы оставить отзыв');
      return;
    }

    await api(`/products/${product.id}/reviews`, {
      method: 'POST',
      body: JSON.stringify(reviewForm)
    });

    setReviewForm({
      rating: 5,
      comment: ''
    });

    await loadReviews();
  }

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, review) => sum + Number(review.rating), 0) /
          reviews.length
        ).toFixed(1)
      : product.avg_rating || 0;

  return (
    <div className="overlay">
      <div className="modal wide">
        <button className="x" onClick={onClose}>×</button>

        <img
          className="detailImg"
          src={getImageUrl(product.image_url)}
          alt={product.name}
        />

        <h2>{product.name}</h2>

        <p>{product.description}</p>

        <p>
          <b>Состав:</b> {product.ingredients}
        </p>

        <p>
          <b>Наличие:</b> {product.stock_quantity} шт.{' '}
          <b>Срок годности:</b> сутки с момента заказа.
        </p>

        <p>Вид товара и картинки могут отличаться.</p>

        <p>
          <b>Оценка:</b> {averageRating}/5 ({reviews.length} отзывов)
        </p>

        <QuantityControl product={product} />

        <div className="reviews">
          <h3>Отзывы</h3>

          {user ? (
            <form className="review-form" onSubmit={submitReview}>
              <select
                value={reviewForm.rating}
                onChange={(event) =>
                  setReviewForm({
                    ...reviewForm,
                    rating: Number(event.target.value)
                  })
                }
              >
                <option value={5}>5 — отлично</option>
                <option value={4}>4 — хорошо</option>
                <option value={3}>3 — нормально</option>
                <option value={2}>2 — плохо</option>
                <option value={1}>1 — ужасно</option>
              </select>

              <textarea
                required
                minLength="3"
                placeholder="Напишите отзыв"
                value={reviewForm.comment}
                onChange={(event) =>
                  setReviewForm({
                    ...reviewForm,
                    comment: event.target.value
                  })
                }
              />

              <button type="submit">Оставить отзыв</button>
            </form>
          ) : (
            <p>Авторизуйтесь, чтобы оставить отзыв.</p>
          )}

          {reviews.length === 0 && <p>Отзывов пока нет.</p>}

          {reviews.map((review) => (
            <div className="review-item" key={review.id}>
              <b>{review.user_name || 'Покупатель'}</b>
              <span>{review.rating}/5</span>
              <p>{review.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}