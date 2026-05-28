import { pool } from '../config/db.js';

export const categories = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, description
      FROM categories
      ORDER BY id
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка получения категорий' });
  }
};

export const listProducts = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM products p
      ORDER BY p.id
    `);

    console.log(result.rows);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Ошибка получения товаров',
      error: error.message
    });
  }
};

export const productById = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        p.*,
        c.name AS category_name,
        COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS avg_rating,
        COUNT(r.id) AS review_count
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN reviews r ON r.product_id = p.id
      WHERE p.id = $1
      GROUP BY p.id, c.name
      `,
      [req.params.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Товар не найден' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка получения товара' });
  }
};

export const saveProduct = async (req, res) => {
  try {
    const {
      category_id,
      name,
      description,
      price,
      weight_grams,
      image_url,
      stock_quantity,
      is_available,
      ingredients
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO products
      (category_id, name, description, price, weight_grams, image_url, stock_quantity, is_available, ingredients, created_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())
      RETURNING *
      `,
      [
        category_id,
        name,
        description,
        price,
        weight_grams,
        image_url,
        stock_quantity,
        is_available,
        ingredients
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка добавления товара' });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const {
      category_id,
      name,
      description,
      price,
      weight_grams,
      image_url,
      stock_quantity,
      is_available,
      ingredients
    } = req.body;

    const result = await pool.query(
      `
      UPDATE products
      SET
        category_id = COALESCE($1, category_id),
        name = COALESCE($2, name),
        description = COALESCE($3, description),
        price = COALESCE($4, price),
        weight_grams = COALESCE($5, weight_grams),
        image_url = COALESCE($6, image_url),
        stock_quantity = CASE
          WHEN $8::boolean = false THEN 0
          ELSE COALESCE($7, stock_quantity)
        END,
        is_available = COALESCE($8, is_available),
        ingredients = COALESCE($9, ingredients)
      WHERE id = $10
      RETURNING *
      `,
      [
        category_id,
        name,
        description,
        price,
        weight_grams,
        image_url,
        stock_quantity,
        is_available,
        ingredients,
        req.params.id
      ]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Товар не найден' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка обновления товара' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
    res.json({ message: 'Товар удалён' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка удаления товара' });
  }
};