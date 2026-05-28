import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { api } from '../services/api.js';
import ProductCard from '../components/ProductCard.jsx';
import ProductModal from '../components/ProductModal.jsx';

export default function Home() {
  const [searchParams] = useSearchParams();

  const selectedCategoryId = searchParams.get('category');

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [openedProduct, setOpenedProduct] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api('/products').then(setProducts).catch(console.error);
    api('/categories').then(setCategories).catch(console.error);
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory = selectedCategoryId
        ? Number(product.category_id) === Number(selectedCategoryId)
        : true;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, selectedCategoryId]);

  const visibleCategories = selectedCategoryId
    ? categories.filter(
        (category) => Number(category.id) === Number(selectedCategoryId)
      )
    : categories;

  return (
    <>
      <section className="hero">
        <h1>Свежая выпечка с доставкой</h1>
        <p>
          Торты, пирожные, печенье, капкейки, круассаны, макаруны и чизкейки.
        </p>

        <div className="search">
          <Search size={18} />
          <input
            placeholder="Поиск товара"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </section>

      <main id="catalog">
        {visibleCategories.map((category) => {
          const categoryProducts = filteredProducts.filter(
            (product) => Number(product.category_id) === Number(category.id)
          );

          if (!categoryProducts.length) return null;

          return (
            <section className="cat" key={category.id}>
              <h2>{category.name}</h2>

              <div className="grid">
                {categoryProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onOpen={setOpenedProduct}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </main>

      {openedProduct && (
        <ProductModal
          product={openedProduct}
          onClose={() => setOpenedProduct(null)}
        />
      )}
    </>
  );
}