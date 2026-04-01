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

export default router