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
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ message: 'Пользователь удалён' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка удаления пользователя' });
  }
};