import { body } from 'express-validator';
import { q } from '../config/db.js';

export const reviewRules = [
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').trim().isLength({ min: 3, max: 1000 })
];

export async function productReviews(req, res) {
  try {
    const { rows } = await q(
      `
      SELECT
        r.id,
        r.product_id,
        r.user_id,
        r.rating,
        r.comment,
        r.created_at,
        u.name AS user_name
      FROM reviews r
      LEFT JOIN users u ON u.id = r.user_id
      WHERE r.product_id = $1
      ORDER BY r.created_at DESC
      `,
      [req.params.productId]
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка получения отзывов' });
  }
}

export async function allReviews(req, res) {
  try {
    const { rows } = await q(`
      SELECT
        r.id,
        r.product_id,
        r.user_id,
        r.rating,
        r.comment,
        r.created_at,
        u.name AS user_name,
        p.name AS product_name
      FROM reviews r
      LEFT JOIN users u ON u.id = r.user_id
      LEFT JOIN products p ON p.id = r.product_id
      ORDER BY r.created_at DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка получения отзывов' });
  }
}

export async function addReview(req, res) {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.productId;

    const product = await q('SELECT id FROM products WHERE id = $1', [productId]);

    if (!product.rows.length) {
      return res.status(404).json({ message: 'Товар не найден' });
    }

    const { rows } = await q(
      `
      INSERT INTO reviews(product_id, user_id, rating, comment, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *
      `,
      [productId, req.user.id, rating, comment]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка добавления отзыва' });
  }
}

export async function deleteReview(req, res) {
  try {
    await q('DELETE FROM reviews WHERE id = $1', [req.params.id]);
    res.json({ message: 'Отзыв удалён' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка удаления отзыва' });
  }
}