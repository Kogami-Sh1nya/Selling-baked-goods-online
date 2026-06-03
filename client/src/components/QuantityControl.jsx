import { useStore } from '../context/StoreContext.jsx';

export default function QuantityControl({ product }) {
  const { getQuantity, addToCart } = useStore();
  const quantity = getQuantity(product.id);
  const maxQuantity = Number(product.stock_quantity) || 0;

  function increase() {
    if (quantity >= maxQuantity) {
      alert(`В наличии только ${maxQuantity} шт.`);
      return;
    }

    addToCart(product, 1);
  }

  if (quantity > 0) {
    return (
      <div className="qty">
        <button type="button" onClick={() => addToCart(product, -1)}>
          -
        </button>

        <b>{quantity}</b>

        <button type="button" onClick={increase}>
          +
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={increase}
      disabled={!product.is_available || maxQuantity < 1}
    >
      Добавить в корзину
    </button>
  );
}