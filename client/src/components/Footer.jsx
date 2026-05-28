import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer>
      <div>
        <h3>Bakery Street</h3>
        <p>
          Создаем сладкие воспоминания с 2023 года со страстью, качеством и
          любовь к ремеслу выпечки.
        </p>
      </div>

      <div>
        <h4>Explore</h4>
        <a href="/#catalog">Каталог</a>
        <Link to="/cart">Корзина</Link>
        <Link to="/profile">Профиль</Link>
      </div>

      <div>
        <h4>Visit us</h4>
        <p>Островского 10, Г. Кызыл, РТ, 667000</p>
        <p>
          ПН-СБ 10:00-19:00
          <br />
          Вс выходной
        </p>
      </div>

      <small>© 2026 Bakery Street</small>
    </footer>
  );
}