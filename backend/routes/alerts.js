const express = require('express');
const { authenticateToken, requireAgronomist } = require('../middleware/auth');
const { query, run } = require('../models/database');

const router = express.Router();

// GET /api/alerts/:plant_id
router.get('/:plant_id', authenticateToken, async (req, res) => {
  try {
    const { plant_id } = req.params;
    const { status } = req.query; // Optional: filter by status

    let sql = 'SELECT * FROM alerts WHERE plant_id = ?';
    const params = [plant_id];

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC';

    const alerts = await query(sql, params);
    res.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/alerts (agronomist only)
router.post('/', authenticateToken, requireAgronomist, async (req, res) => {
  try {
    const { plant_id, message, status } = req.body;

    if (!plant_id || !message) {
      return res.status(400).json({ error: 'Plant ID and message required' });
    }

    // Check if plant exists
    const existingPlants = await query('SELECT * FROM plants WHERE plant_id = ?', [plant_id]);
    if (existingPlants.length === 0) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    const alertStatus = status || 'active';

    const result = await run(
      `INSERT INTO alerts (plant_id, message, status)
       VALUES (?, ?, ?)`,
      [plant_id, message, alertStatus]
    );

    const alerts = await query('SELECT * FROM alerts WHERE alert_id = ?', [result.lastID]);
    res.status(201).json(alerts[0]);
  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

