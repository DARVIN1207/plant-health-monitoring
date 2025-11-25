const express = require('express');
const { authenticateToken, requireAgronomist } = require('../middleware/auth');
const { query, run } = require('../models/database');

const router = express.Router();

// GET /api/recommendations/:plant_id
router.get('/:plant_id', authenticateToken, async (req, res) => {
  try {
    const { plant_id } = req.params;

    const recommendations = await query(
      `SELECT r.*, a.full_name as agronomist_name, a.specialization
       FROM recommendations r
       JOIN agronomists a ON r.agronomist_id = a.agronomist_id
       WHERE r.plant_id = ?
       ORDER BY r.created_at DESC`,
      [plant_id]
    );

    res.json(recommendations);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/recommendations (agronomist only)
router.post('/', authenticateToken, requireAgronomist, async (req, res) => {
  try {
    const { plant_id, advice_text } = req.body;
    const agronomist_id = req.user.id;

    if (!plant_id || !advice_text) {
      return res.status(400).json({ error: 'Plant ID and advice text required' });
    }

    // Check if plant exists
    const existingPlants = await query('SELECT * FROM plants WHERE plant_id = ?', [plant_id]);
    if (existingPlants.length === 0) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    const result = await run(
      `INSERT INTO recommendations (plant_id, agronomist_id, advice_text)
       VALUES (?, ?, ?)`,
      [plant_id, agronomist_id, advice_text]
    );

    const recommendations = await query(
      `SELECT r.*, a.full_name as agronomist_name, a.specialization
       FROM recommendations r
       JOIN agronomists a ON r.agronomist_id = a.agronomist_id
       WHERE r.rec_id = ?`,
      [result.lastID]
    );

    res.status(201).json(recommendations[0]);
  } catch (error) {
    console.error('Error creating recommendation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

