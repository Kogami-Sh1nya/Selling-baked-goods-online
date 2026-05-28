import QuantityControl from './QuantityControl.jsx';
import { getImageUrl } from '../services/api.js';

export default function ProductCard({ product, onOpen }) {
  return (
    <article className="card clickable-card" onClick={() => onOpen(product)}>
      <img src={getImageUrl(product.image_url)} alt={product.name} />

      <h3>{product.name}</h3>

      <p>
        Срок годности: сутки. В наличии: {product.stock_quantity} шт.
      </p>

      <small>Вид товара и картинки могут отличаться.</small>

      <b>{Number(product.price).toFixed(0)} ₽</b>

      <div onClick={(event) => event.stopPropagation()}>
        <QuantityControl product={product} />
      </div>
    </article>
  );
}