import express from 'express'
import { db } from '../db.js'

const router = express.Router()

// 查询用户
router.get('/users', (req, res) => {
  db.query('SELECT * FROM users', (err, result) => {
    if (err) return res.status(500).json(err)
    res.json(result)
  })
})


router.get('/users/:id', (req, res) => {
  const id = req.params.id
  db.query('SELECT * FROM users WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json(err)
    res.json(result)
  })
})
// 新增用户
router.post('/users', (req, res) => {
  const { name, phone, email, address } = req.body
  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone are required' })
  }

  const sql = 'INSERT INTO users (name,phone,email,address) VALUES (?,?,?,?)'
  db.query(sql, [name, phone, email || null, address || null], (err, result) => {
    if (err) return res.status(500).json({ error: err.message })
    res.status(201).json({ id: result.insertId, message: '创建成功' })
  })
})

// ========== 更新用户 ==========
router.put('/users/:id', (req, res) => {
  const { id } = req.params
  const { name, phone, email, address } = req.body
  
  if (!name || !phone) {
    return res.status(400).json({ error: '姓名和手机号必填' })
  }
  
  const sql = 'UPDATE users SET name = ?, phone = ?, email = ?, address = ? WHERE id = ?'
  db.query(sql, [name, phone, email, address, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message })
    if (result.affectedRows === 0) return res.status(404).json({ error: '用户不存在' })
    res.json({ message: '更新成功' })
  })
})

// ========== 删除用户 ==========
router.delete('/users/:id', (req, res) => {
  const { id } = req.params
  db.query('DELETE FROM users WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message })
    if (result.affectedRows === 0) return res.status(404).json({ error: '用户不存在' })
    res.json({ message: '删除成功' })
  })
})




router.get("/user/info", (req, res) => {
  const { id } = req.query
  db.query('SELECT u.id,u.name,up.points FROM users u LEFT JOIN user_points up ON u.id = up.user_id WHERE u.id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(result[0])
  })
})

// 查询今天是否签到
router.get("/sign/today", (req, res) => {
  const { id } = req.query
  db.query('SELECT * FROM sign_logs WHERE user_id = ? AND sign_date = ?', [id, new Date().toISOString().split('T')[0]], (err, result) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(result[0])
  })
})
router.post("/sign", async (req, res) => {
  console.log("hit /sign")

  const { id } = req.query
  const conn = await db.getConnection()

  try {
    await conn.beginTransaction()

    // 1. 查是否已签到
    const [rows] = await conn.query(
      `SELECT * FROM sign_logs WHERE user_id = ? AND sign_date = CURDATE()`,
      [id]
    )

    if (rows.length > 0) {
      await conn.rollback()
      return res.status(400).json({ message: "今天已签到" })
    }

    // 2. 写签到记录
    await conn.query(
      `INSERT INTO sign_logs (user_id, sign_date, points) VALUES (?, CURDATE(), 10)`,
      [id]
    )

    // 3. 写积分流水
    await conn.query(
      `INSERT INTO points_logs (user_id, change_amount, type) VALUES (?, 10, 'sign')`,
      [id]
    )

    // 4. 更新积分（不存在则插入，存在则累加）
    await conn.query(
      `INSERT INTO user_points (user_id, points) VALUES (?, 10)
       ON DUPLICATE KEY UPDATE points = points + 10`,
      [id]
    )

    await conn.commit()

    res.json({ message: "签到成功 +10积分" })
  } catch (err) {
    await conn.rollback()
    res.status(500).json({ error: err.message })
  } finally {
    conn.release()
  }
})




export default router