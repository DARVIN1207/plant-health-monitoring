const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'database', 'plant_monitoring.db');
const dbDir = path.dirname(dbPath);

// Create database directory if it doesn't exist
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  console.log('Connected to SQLite database');
});

// Initialize database schema
db.serialize(() => {
  // Create plants table
  db.run(`CREATE TABLE IF NOT EXISTS plants (
    plant_id INTEGER PRIMARY KEY AUTOINCREMENT,
    plant_name TEXT NOT NULL,
    species TEXT NOT NULL,
    age_days INTEGER NOT NULL,
    location TEXT NOT NULL,
    farmer_name TEXT NOT NULL,
    notes TEXT
  )`);

  // Create plant_health_logs table
  db.run(`CREATE TABLE IF NOT EXISTS plant_health_logs (
    log_id INTEGER PRIMARY KEY AUTOINCREMENT,
    plant_id INTEGER NOT NULL,
    log_date DATE NOT NULL,
    soil_moisture REAL,
    soil_ph REAL,
    temperature REAL,
    humidity REAL,
    sunlight_lux INTEGER,
    nutrient_n REAL,
    nutrient_p REAL,
    nutrient_k REAL,
    growth_height_cm REAL,
    disease_risk INTEGER,
    FOREIGN KEY (plant_id) REFERENCES plants(plant_id)
  )`);

  // Create agronomists table
  db.run(`CREATE TABLE IF NOT EXISTS agronomists (
    agronomist_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    specialization TEXT,
    phone TEXT,
    email TEXT
  )`);

  // Create recommendations table
  db.run(`CREATE TABLE IF NOT EXISTS recommendations (
    rec_id INTEGER PRIMARY KEY AUTOINCREMENT,
    plant_id INTEGER NOT NULL,
    agronomist_id INTEGER NOT NULL,
    advice_text TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plant_id) REFERENCES plants(plant_id),
    FOREIGN KEY (agronomist_id) REFERENCES agronomists(agronomist_id)
  )`);

  // Create alerts table
  db.run(`CREATE TABLE IF NOT EXISTS alerts (
    alert_id INTEGER PRIMARY KEY AUTOINCREMENT,
    plant_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plant_id) REFERENCES plants(plant_id)
  )`);

  console.log('Database tables created');

  // Clear existing data
  db.run('DELETE FROM alerts');
  db.run('DELETE FROM recommendations');
  db.run('DELETE FROM plant_health_logs');
  db.run('DELETE FROM plants');
  db.run('DELETE FROM agronomists');

  console.log('Existing data cleared');

  // Helper function to get random number in range
  const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const randomFloat = (min, max) => (Math.random() * (max - min) + min).toFixed(2);

  // Seed agronomists (20 agronomists)
  const bcrypt = require('bcryptjs');
  const saltRounds = 10;

  const specializations = [
    'Crop Management', 'Soil Science', 'Pest Control', 'Irrigation Systems',
    'Organic Farming', 'Greenhouse Management', 'Compost Technology', 'Seed Production'
  ];

  const agronomistPromises = [];
  for (let i = 1; i <= 20; i++) {
    const username = `agro${i.toString().padStart(2, '0')}`;
    const password = i === 1 ? 'pass01' : `pass${i.toString().padStart(2, '0')}`;
    const hashedPassword = bcrypt.hashSync(password, saltRounds);
    const fullName = `Agronomist ${i}`;
    const specialization = specializations[random(0, specializations.length - 1)];

    agronomistPromises.push(new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO agronomists (username, password, full_name, specialization, phone, email)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          username,
          hashedPassword,
          fullName,
          specialization,
          `+1-555-${random(100, 999)}-${random(1000, 9999)}`,
          `agro${i}@farm.com`
        ],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    }));
  }

  Promise.all(agronomistPromises).catch((err) => {
    console.error('Error creating agronomists:', err);
    db.close();
    process.exit(1);
  }).then((agronomistIds) => {
    if (!agronomistIds) return;
    console.log(`Created ${agronomistIds.length} agronomists`);

    // Seed plants (200 plants)
    const species = ['Tomato', 'Corn', 'Wheat', 'Rice', 'Potato', 'Carrot', 'Lettuce', 'Cucumber', 'Pepper', 'Beans'];
    const locations = ['Field A', 'Field B', 'Field C', 'Greenhouse 1', 'Greenhouse 2', 'Plot 1', 'Plot 2', 'Plot 3'];
    const farmerNames = ['John Smith', 'Maria Garcia', 'Robert Johnson', 'Sarah Williams', 'James Brown', 'Emily Davis'];

    const plantPromises = [];
    for (let i = 1; i <= 200; i++) {
      const plantName = `plant${i.toString().padStart(3, '0')}`;
      const plantSpecies = species[random(0, species.length - 1)];
      const ageDays = random(10, 180);
      const location = locations[random(0, locations.length - 1)];
      const farmerName = farmerNames[random(0, farmerNames.length - 1)];

      plantPromises.push(new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO plants (plant_name, species, age_days, location, farmer_name, notes)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            plantName,
            plantSpecies,
            ageDays,
            location,
            farmerName,
            `Notes for ${plantName} - ${plantSpecies}`
          ],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      }));
    }

    return Promise.all(plantPromises).catch((err) => {
      console.error('Error creating plants:', err);
      db.close();
      process.exit(1);
    }).then((plantIds) => {
      if (!plantIds) return;
      console.log(`Created ${plantIds.length} plants`);

      // Seed health logs (7-14 days per plant)
      const logPromises = [];
      plantIds.forEach((plantId) => {
        const numLogs = random(7, 14);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - numLogs);

        for (let day = 0; day < numLogs; day++) {
          const logDate = new Date(startDate);
          logDate.setDate(logDate.getDate() + day);
          const dateStr = logDate.toISOString().split('T')[0];

          const soilMoisture = parseFloat(randomFloat(20, 80));
          const soilPh = parseFloat(randomFloat(5.5, 7.5));
          const temperature = parseFloat(randomFloat(18, 36));
          const humidity = parseFloat(randomFloat(40, 90));
          const sunlightLux = random(2000, 80000);
          const nutrientN = parseFloat(randomFloat(20, 300));
          const nutrientP = parseFloat(randomFloat(20, 300));
          const nutrientK = parseFloat(randomFloat(20, 300));
          const growthHeight = parseFloat(randomFloat(10, 250));
          const diseaseRisk = random(0, 100);

          logPromises.push(new Promise((resolve, reject) => {
            db.run(
              `INSERT INTO plant_health_logs 
               (plant_id, log_date, soil_moisture, soil_ph, temperature, humidity, sunlight_lux,
                nutrient_n, nutrient_p, nutrient_k, growth_height_cm, disease_risk)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                plantId, dateStr, soilMoisture, soilPh, temperature, humidity, sunlightLux,
                nutrientN, nutrientP, nutrientK, growthHeight, diseaseRisk
              ],
              function(err) {
                if (err) reject(err);
                else resolve();
              }
            );
          }));
        }
      });

      return Promise.all(logPromises).catch((err) => {
        console.error('Error creating health logs:', err);
        db.close();
        process.exit(1);
      }).then(() => {
        console.log('Created health logs');

        // Seed recommendations (random recommendations per plant)
        const recommendationTexts = [
          'Increase watering frequency to maintain optimal soil moisture',
          'Apply nitrogen-rich fertilizer to boost growth',
          'Monitor for pest activity in the coming weeks',
          'Consider pruning to improve air circulation',
          'Soil pH is optimal, maintain current levels',
          'Increase sunlight exposure if possible',
          'Apply potassium supplement to strengthen root system',
          'Temperature is within optimal range, continue monitoring',
          'Consider mulching to retain soil moisture',
          'Disease risk is low, maintain current practices'
        ];

        const recPromises = [];
        plantIds.forEach((plantId) => {
          if (Math.random() > 0.3) { // 70% of plants get recommendations
            const agronomistId = agronomistIds[random(0, agronomistIds.length - 1)];
            const adviceText = recommendationTexts[random(0, recommendationTexts.length - 1)];

            recPromises.push(new Promise((resolve, reject) => {
              db.run(
                `INSERT INTO recommendations (plant_id, agronomist_id, advice_text)
                 VALUES (?, ?, ?)`,
                [plantId, agronomistId, adviceText],
                function(err) {
                  if (err) reject(err);
                  else resolve();
                }
              );
            }));
          }
        });

        return Promise.all(recPromises).catch((err) => {
          console.error('Error creating recommendations:', err);
          db.close();
          process.exit(1);
        }).then(() => {
          console.log('Created recommendations');

          // Seed alerts (random alerts for some plants)
          const alertMessages = [
            'Low soil moisture detected - immediate watering recommended',
            'High disease risk detected - inspect plant for symptoms',
            'Temperature outside optimal range - consider protection measures',
            'Low nutrient levels - fertilizer application needed',
            'Abnormal growth pattern detected - consult agronomist',
            'Soil pH imbalance - corrective action required',
            'Insufficient sunlight exposure - relocate if possible',
            'Humidity levels critical - adjust irrigation system'
          ];

          const alertPromises = [];
          plantIds.forEach((plantId) => {
            if (Math.random() > 0.7) { // 30% of plants get alerts
              const message = alertMessages[random(0, alertMessages.length - 1)];
              const status = Math.random() > 0.5 ? 'active' : 'resolved';

              alertPromises.push(new Promise((resolve, reject) => {
                db.run(
                  `INSERT INTO alerts (plant_id, message, status)
                   VALUES (?, ?, ?)`,
                  [plantId, message, status],
                  function(err) {
                    if (err) reject(err);
                    else resolve();
                  }
                );
              }));
            }
          });

          return Promise.all(alertPromises).catch((err) => {
            console.error('Error creating alerts:', err);
            db.close();
            process.exit(1);
          }).then(() => {
            console.log('Created alerts');
            
            // Create demo farmer account (hashed password)
            const farmerPassword = bcrypt.hashSync('pwd001', saltRounds);
            db.run(
              `INSERT OR IGNORE INTO agronomists (username, password, full_name, specialization, phone, email)
               VALUES (?, ?, ?, ?, ?, ?)`,
              ['farmer001', farmerPassword, 'Demo Farmer', 'Crop Monitoring', '+1-555-000-0000', 'farmer001@farm.com'],
              function(err) {
                if (err) {
                  console.error('Error creating farmer account:', err);
                } else {
                  console.log('Created demo farmer account (farmer001/pwd001)');
                }
                
                db.close((err) => {
                  if (err) {
                    console.error('Error closing database:', err.message);
                  } else {
                    console.log('Database initialization completed successfully!');
                  }
                });
              }
            );
          });
        });
      });
    });
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  if (db) {
    db.close((err) => {
      if (err) console.error('Error closing database:', err);
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  if (db) {
    db.close((closeErr) => {
      if (closeErr) console.error('Error closing database:', closeErr);
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});


