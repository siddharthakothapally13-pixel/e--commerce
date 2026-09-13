import initSqlJs from 'sql.js';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'database.sqlite');

let db = null;

function saveDb() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

export async function initDb() {
  const SQL = await initSqlJs();

  if (fs.existsSync(dbPath)) {
    const filebuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(filebuffer);
  } else {
    db = new SQL.Database();
  }

  // Create Users Table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create Products Table
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      category TEXT NOT NULL,
      image TEXT NOT NULL,
      stock INTEGER NOT NULL DEFAULT 10,
      featured BOOLEAN DEFAULT 0,
      rating REAL DEFAULT 4.8,
      reviews_count INTEGER DEFAULT 12,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create Orders Table
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      user_id INTEGER NOT NULL,
      total_amount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'Placed',
      shipping_address TEXT NOT NULL,
      payment_method TEXT NOT NULL DEFAULT 'Credit Card',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
  `);

  // Create Order Items Table
  db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE RESTRICT
    );
  `);

  seedData();
  saveDb();
}

function seedData() {
  // Seed Users
  const userStmt = db.prepare('SELECT COUNT(*) as count FROM users');
  let userCount = 0;
  if (userStmt.step()) {
    userCount = userStmt.getAsObject().count;
  }
  userStmt.free();

  if (userCount === 0) {
    const userPass = bcrypt.hashSync('password123', 10);
    const adminPass = bcrypt.hashSync('admin123', 10);

    db.run('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', ['Demo Customer', 'user@example.com', userPass, 'user']);
    db.run('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', ['Store Administrator', 'admin@example.com', adminPass, 'admin']);

    console.log('✅ Default users seeded (user@example.com / admin@example.com)');
  }

  // Seed Products
  const prodStmt = db.prepare('SELECT COUNT(*) as count FROM products');
  let prodCount = 0;
  if (prodStmt.step()) {
    prodCount = prodStmt.getAsObject().count;
  }
  prodStmt.free();

  if (prodCount === 0) {
    const products = [
      {
        name: 'Aura Studio Wireless Headphones',
        description: 'Premium noise-canceling spatial audio headphones with 45-hour battery life, ultra-plush memory foam pads, and sleek dark obsidian finish.',
        price: 299.99,
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
        stock: 25,
        featured: 1,
        rating: 4.9,
        reviews_count: 84
      },
      {
        name: 'Vortex Mechanical Gaming Keyboard',
        description: 'RGB mechanical keyboard featuring hot-swappable tactile switches, aluminum chassis, customizable macros, and detachable braided cable.',
        price: 149.50,
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
        stock: 18,
        featured: 1,
        rating: 4.8,
        reviews_count: 62
      },
      {
        name: 'Minimalist Horizon Smartwatch',
        description: 'Sleek OLED smartwatch with continuous health tracking, GPS navigation, water resistance up to 50m, and sapphire glass display.',
        price: 219.00,
        category: 'Wearables',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
        stock: 14,
        featured: 1,
        rating: 4.7,
        reviews_count: 45
      },
      {
        name: 'Zenith Studio Desk Lamp',
        description: 'Architectural LED desk lamp with touch dimming, color temperature adjustment, built-in wireless charging pad, and matte black finish.',
        price: 89.99,
        category: 'Home & Office',
        image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
        stock: 30,
        featured: 0,
        rating: 4.6,
        reviews_count: 29
      },
      {
        name: 'Nomad Minimalist Leather Backpack',
        description: 'Handcrafted full-grain Italian leather laptop backpack with weather-sealed zippers and ergonomic padded shoulder straps.',
        price: 185.00,
        category: 'Fashion',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
        stock: 12,
        featured: 1,
        rating: 4.9,
        reviews_count: 110
      },
      {
        name: 'PurePour Thermal Coffee Carafe',
        description: 'Double-wall vacuum insulated stainless steel coffee press that keeps beverages hot for 12 hours with precision pour spout.',
        price: 54.99,
        category: 'Home & Office',
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
        stock: 40,
        featured: 0,
        rating: 4.5,
        reviews_count: 38
      },
      {
        name: 'SonicWave Portable Bluetooth Speaker',
        description: '360° immersive audio speaker with deep bass, IP67 dust/waterproof rating, and 20-hour playback time.',
        price: 119.99,
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80',
        stock: 22,
        featured: 0,
        rating: 4.7,
        reviews_count: 53
      },
      {
        name: 'ErgoComfort Executive Chair',
        description: 'High-back mesh ergonomic desk chair with lumbar support, 4D adjustable armrests, and synchro-tilt mechanism.',
        price: 349.00,
        category: 'Home & Office',
        image: 'https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?auto=format&fit=crop&w=800&q=80',
        stock: 8,
        featured: 1,
        rating: 4.8,
        reviews_count: 76
      }
    ];

    for (const p of products) {
      db.run(
        `INSERT INTO products (name, description, price, category, image, stock, featured, rating, reviews_count)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.name, p.description, p.price, p.category, p.image, p.stock, p.featured, p.rating, p.reviews_count]
      );
    }
    console.log('✅ Default products seeded');
  }

  // Seed sample initial order if empty
  const orderStmt = db.prepare('SELECT COUNT(*) as count FROM orders');
  let orderCount = 0;
  if (orderStmt.step()) {
    orderCount = orderStmt.getAsObject().count;
  }
  orderStmt.free();

  if (orderCount === 0) {
    const userStmt = db.prepare("SELECT id FROM users WHERE email = 'user@example.com'");
    if (userStmt.step()) {
      const user = userStmt.getAsObject();
      userStmt.free();

      const orderNumber = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
      db.run(
        `INSERT INTO orders (order_number, user_id, total_amount, status, shipping_address, payment_method)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [orderNumber, user.id, 449.49, 'Processing', '123 Tech Lane, Silicon Valley, CA 94025', 'Credit Card']
      );

      const lastIdStmt = db.prepare('SELECT last_insert_rowid() as id');
      let orderId = 1;
      if (lastIdStmt.step()) {
        orderId = lastIdStmt.getAsObject().id;
      }
      lastIdStmt.free();

      db.run(`INSERT INTO order_items (order_id, product_id, product_name, price, quantity) VALUES (?, ?, ?, ?, ?)`, [orderId, 1, 'Aura Studio Wireless Headphones', 299.99, 1]);
      db.run(`INSERT INTO order_items (order_id, product_id, product_name, price, quantity) VALUES (?, ?, ?, ?, ?)`, [orderId, 2, 'Vortex Mechanical Gaming Keyboard', 149.50, 1]);
      console.log(`✅ Default order ${orderNumber} seeded`);
    } else {
      userStmt.free();
    }
  }
}

// Database helper functions
export const query = {
  get(sql, params = []) {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    let result = null;
    if (stmt.step()) {
      result = stmt.getAsObject();
    }
    stmt.free();
    return result;
  },
  all(sql, params = []) {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  },
  run(sql, params = []) {
    db.run(sql, params);
    saveDb();
    const lastIdResult = db.exec('SELECT last_insert_rowid() as id');
    const lastInsertRowid = lastIdResult[0] && lastIdResult[0].values[0] ? lastIdResult[0].values[0][0] : 0;
    const changesResult = db.exec('SELECT changes() as count');
    const changes = changesResult[0] && changesResult[0].values[0] ? changesResult[0].values[0][0] : 0;
    return { lastInsertRowid, changes };
  }
};

export default query;
