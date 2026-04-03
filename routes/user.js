import express from 'express'
import { db } from '../db.js'

const router = express.Router()

// 查询所有用户
router.get('/users', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM users')
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 查询单个用户
router.get('/users/:id', async (req, res) => {
  try {
    const [result] = await db.query('SELECT * FROM users WHERE id = ?', [req.params.id])
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 新增用户
router.post('/users', async (req, res) => {
  const { name, phone, email, address } = req.body
  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone are required' })
  }
  try {
    const result = await db.query(
      'INSERT INTO users (name, phone, email, address) VALUES (?,?,?,?)',
      [name, phone, email || null, address || null]
    )
    res.status(201).json({ id: result.insertId, message: '创建成功' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 更新用户
router.put('/users/:id', async (req, res) => {
  const { name, phone, email, address } = req.body
  if (!name || !phone) {
    return res.status(400).json({ error: '姓名和手机号必填' })
  }
  try {
    const result = await db.query(
      'UPDATE users SET name = ?, phone = ?, email = ?, address = ? WHERE id = ?',
      [name, phone, email, address, req.params.id]
    )
    if (result.affectedRows === 0) return res.status(404).json({ error: '用户不存在' })
    res.json({ message: '更新成功' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 删除用户
router.delete('/users/:id', async (req, res) => {
  try {
    const result = await db.query('DELETE FROM users WHERE id = ?', [req.params.id])
    if (result.affectedRows === 0) return res.status(404).json({ error: '用户不存在' })
    res.json({ message: '删除成功' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 查询用户信息（含积分）
router.get('/user/info', async (req, res) => {
  try {
    const [result] = await db.query(
      'SELECT u.id, u.name, up.points FROM users u LEFT JOIN user_points up ON u.id = up.user_id WHERE u.id = ?',
      [req.query.id]
    )
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 查询今日是否签到
router.get('/sign/today', async (req, res) => {
  try {
    const [result] = await db.query(
      'SELECT * FROM sign_logs WHERE user_id = ? AND sign_date = CURDATE()',
      [req.query.id]
    )
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 签到
router.post('/sign', async (req, res) => {
  console.log('hit /sign')
  const { id } = req.query
  const conn = await db.getConnection()

  try {
    await conn.beginTransaction()

    const [rows] = await conn.query(
      'SELECT * FROM sign_logs WHERE user_id = ? AND sign_date = CURDATE()',
      [id]
    )
    if (rows.length > 0) {
      await conn.rollback()
      return res.status(400).json({ message: '今天已签到' })
    }

    await conn.query(
      'INSERT INTO sign_logs (user_id, sign_date, points) VALUES (?, CURDATE(), 10)',
      [id]
    )

    await conn.query(
      'INSERT INTO points_logs (user_id, change_amount, type) VALUES (?, 10, ?)',
      [id, 'sign']
    )

    await conn.query(
      'INSERT INTO user_points (user_id, points) VALUES (?, 10) ON DUPLICATE KEY UPDATE points = points + 10',
      [id]
    )

    await conn.commit()
    res.json({ message: '签到成功 +10积分' })
  } catch (err) {
    await conn.rollback()
    res.status(500).json({ error: err.message })
  } finally {
    conn.release()
  }
})

export default router
