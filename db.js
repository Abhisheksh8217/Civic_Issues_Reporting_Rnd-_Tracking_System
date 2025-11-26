import low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const adapter = new FileSync(path.join(__dirname, 'data', 'db.json'));
const db = low(adapter);

// Initialize database with default structure
db.defaults({
  users: [],
  issues: [],
  authorities: [],
  settings: {
    pointsPerReport: 10,
    pointsPerVerified: 5,
    pointsPerResolved: 20,
    duplicateThreshold: 0.55,
    geoRadiusMeters: 200,
    imageHashThreshold: 5,
    spamReportLimit: 10,
    spamTimeWindowMinutes: 10,
    spamDuplicateRatio: 0.6
  }
}).write();

export default db;
export { db };
