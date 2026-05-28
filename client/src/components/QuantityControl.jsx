import { useStore } from '../context/StoreContext.jsx';

export default function QuantityControl({ product }) {
  const { getQuantity, addToCart } = useStore();
  const quantity = getQuantity(product.id);

  if (quantity > 0) {
    return (
      <div className="qty">
        <button type="button" onClick={() => addToCart(product, -1)}>
          -
        </button>

        <b>{quantity}</b>

        <button type="button" onClick={() => addToCart(product, 1)}>
          +
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => addToCart(product, 1)}
      disabled={!product.is_available || product.stock_quantity < 1}
    >
      Добавить в корзину
    </button>
  );
}