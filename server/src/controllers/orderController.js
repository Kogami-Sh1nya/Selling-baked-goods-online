import { q, pool } from '../config/db.js';

const ALLOWED_STATUSES = [
  'новый',
  'готовится',
  'в доставке',
  'доставлен',
  'отменён'
];

export async function createOrder(req, res) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const {
      items,
      delivery_address,
      comment,
      customer_name,
      phone,
      email,
      payment
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Корзина пуста' });
    }

    if (!delivery_address || !customer_name || !phone || !email) {
      return res.status(400).json({ message: 'Заполните данные доставки' });
    }

    if (!payment?.cardNumber || String(payment.cardNumber).length !== 16) {
      return res.status(400).json({ message: 'Некорректные данные карты' });
    }

    const ids = items.map((item) => item.product_id);

    const products = (
      await client.query(
        `
        SELECT id, price, stock_quantity
        FROM products
        WHERE id = ANY($1::int[])
        `,
        [ids]
      )
    ).rows;

    let total = 0;

    for (const item of items) {
      const product = products.find((p) => p.id === item.product_id);

      if (!product) {
        throw new Error('Товар не найден');
      }

      if (product.stock_quantity < item.quantity) {
        throw new Error('Недостаточно товара на складе');
      }

      total += Number(product.price) * item.quantity;
    }

    const deliveryPrice = 150;
    const finalPrice = total + deliveryPrice;

    const paymentResult = await client.query(
      `
      INSERT INTO payments(amount, status, card_last4)
      VALUES ($1, 'новый', $2)
      RETURNING id
      `,
      [finalPrice, String(payment.cardNumber).slice(-4)]
    );

    const orderResult = await client.query(
      `
      INSERT INTO orders
      (
        user_id,
        total_price,
        delivery_address,
        comment,
        customer_name,
        phone,
        email,
        payment_id,
        status,
        estimated_delivery_at
      )
      VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,'новый',NOW() + INTERVAL '1 hour')
      RETURNING *
      `,
      [
        req.user.id,
        finalPrice,
        delivery_address,
        comment,
        customer_name,
        phone,
        email,
        paymentResult.rows[0].id
      ]
    );

    const order = orderResult.rows[0];

    for (const item of items) {
      const product = products.find((p) => p.id === item.product_id);

      await client.query(
        `
        INSERT INTO order_items
        (
          order_id,
          product_id,
          quantity,
          price_per_unit,
          total_item_price
        )
        VALUES ($1,$2,$3,$4,$5)
        `,
        [
          order.id,
          item.product_id,
          item.quantity,
          product.price,
          Number(product.price) * item.quantity
        ]
      );

      await client.query(
        `
        UPDATE products
        SET stock_quantity = stock_quantity - $1
        WHERE id = $2
        `,
        [item.quantity, item.product_id]
      );
    }

    await client.query('COMMIT');

    res.status(201).json(order);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(400).json({ message: error.message });
  } finally {
    client.release();
  }
}

export async function myOrders(req, res) {
  try {
    const { rows } = await q(
      `
      SELECT *
      FROM orders
      WHERE user_id = $1
      ORDER BY order_date DESC
      `,
      [req.user.id]
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка получения заказов' });
  }
}

export async function allOrders(req, res) {
  try {
    const { rows } = await q(`
      SELECT
        o.*,
        u.name AS user_name,
        u.email AS user_email
      FROM orders o
      LEFT JOIN users u ON u.id = o.user_id
      ORDER BY o.order_date DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка получения заказов' });
  }
}

export async function setStatus(req, res) {
  try {
    const { status } = req.body;

    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Некорректный статус заказа' });
    }

    const { rows } = await q(
      `
      UPDATE orders
      SET status = $1
      WHERE id = $2
      RETURNING *
      `,
      [status, req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'Заказ не найден' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка изменения статуса' });
  }
}