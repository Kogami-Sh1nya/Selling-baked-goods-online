import { pool } from '../config/db.js';

export const listUsers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, email, role, created_at
      FROM users
      ORDER BY id
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка получения пользователей' });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!['user', 'seller', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Некорректная роль' });
    }

    const result = await pool.query(
      `
      UPDATE users
      SET role = $1
      WHERE id = $2
      RETURNING id, name, email, role, created_at
      `,
      [role, req.params.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка изменения роли' });
  }
};

export const deleteUser = async (req, res) => {
  const client = await pool.connect();

  try {
    const userId = Number(req.params.id);

    if (req.user?.id === userId) {
      return res.status(400).json({
        message: 'Нельзя удалить собственный аккаунт'
      });
    }

    await client.query('BEGIN');

    const paymentsResult = await client.query(
      `
      SELECT payment_id
      FROM orders
      WHERE user_id = $1 AND payment_id IS NOT NULL
      `,
      [userId]
    );

    const paymentIds = paymentsResult.rows.map((row) => row.payment_id);

    await client.query('DELETE FROM reviews WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM orders WHERE user_id = $1', [userId]);

    if (paymentIds.length > 0) {
      await client.query(
        'DELETE FROM payments WHERE id = ANY($1::int[])',
        [paymentIds]
      );
    }

    const result = await client.query(
      `
      DELETE FROM users
      WHERE id = $1
      RETURNING id, name, email, role
      `,
      [userId]
    );

    if (!result.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    await client.query('COMMIT');

    res.json({
      message: 'Пользователь удалён',
      user: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ message: 'Ошибка удаления пользователя' });
  } finally {
    client.release();
  }
};