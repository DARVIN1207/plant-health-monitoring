const express = require('express');
const { authenticateToken, requireAgronomist } = require('../middleware/auth');
const { query, run } = require('../models/database');

const router = express.Router();

// GET /api/plants (both roles)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search, species, location } = req.query;
    let sql = 'SELECT * FROM plants WHERE 1=1';
    const params = [];

    if (search) {
      sql += ' AND (plant_name LIKE ? OR farmer_name LIKE ? OR notes LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (species) {
      sql += ' AND species = ?';
      params.push(species);
    }

    if (location) {
      sql += ' AND location = ?';
      params.push(location);
    }

    sql += ' ORDER BY plant_id DESC';

    const plants = await query(sql, params);
    res.json(plants);
  } catch (error) {
    console.error('Error fetching plants:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/plants/:id (both roles)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const plants = await query('SELECT * FROM plants WHERE plant_id = ?', [id]);

    if (plants.length === 0) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    res.json(plants[0]);
  } catch (error) {
    console.error('Error fetching plant:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/plants (agronomist only)
router.post('/', authenticateToken, requireAgronomist, async (req, res) => {
  try {
    const { plant_name, species, age_days, location, farmer_name, notes } = req.body;

    if (!plant_name || !species || !age_days || !location || !farmer_name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await run(
      `INSERT INTO plants (plant_name, species, age_days, location, farmer_name, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [plant_name, species, age_days, location, farmer_name, notes || '']
    );

    const plants = await query('SELECT * FROM plants WHERE plant_id = ?', [result.lastID]);
    res.status(201).json(plants[0]);
  } catch (error) {
    console.error('Error creating plant:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/plants/:id (agronomist only)
router.put('/:id', authenticateToken, requireAgronomist, async (req, res) => {
  try {
    const { id } = req.params;
    const { plant_name, species, age_days, location, farmer_name, notes } = req.body;

    // Check if plant exists
    const existingPlants = await query('SELECT * FROM plants WHERE plant_id = ?', [id]);
    if (existingPlants.length === 0) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    await run(
      `UPDATE plants 
       SET plant_name = ?, species = ?, age_days = ?, location = ?, farmer_name = ?, notes = ?
       WHERE plant_id = ?`,
      [plant_name, species, age_days, location, farmer_name, notes || '', id]
    );

    const updatedPlants = await query('SELECT * FROM plants WHERE plant_id = ?', [id]);
    res.json(updatedPlants[0]);
  } catch (error) {
    console.error('Error updating plant:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

