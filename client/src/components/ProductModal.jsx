import QuantityControl from './QuantityControl.jsx';
import { getImageUrl } from '../services/api.js';

export default function ProductModal({ product, onClose }) {
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
          <b>Оценка:</b> {product.avg_rating || 0}/5 (
          {product.review_count || 0} отзывов)
        </p>

        <div className="reviews">
          <h3>Отзывы</h3>
          <p>Покупатели отмечают свежесть, нежный вкус и аккуратную упаковку.</p>
        </div>

        <QuantityControl product={product} />
      </div>
    </div>
  );
}