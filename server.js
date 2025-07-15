// ✅ SuperShoes Server - Complete server.js file
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const mysql = require("mysql2/promise");
const nodemailer = require("nodemailer");
app.use(express.static("public"));
app.use(cors());
app.use(express.json());

// ✅ MySQL connection with connection pooling
let pool;
try {
  pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "sohail",
    database: process.env.DB_NAME || "supershoes",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
  console.log("✅ Connected to MySQL");
} catch (err) {
  console.error("❌ MySQL connection failed:", err);
}

// 🔐 Stripe Checkout (Not used in this flow, reserved for Stripe payment page integrations)
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { items, email } = req.body;
    const lineItems = items.map(item => ({
      price_data: {
        currency: 'inr',
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: process.env.STRIPE_SUCCESS_URL || 'http://localhost:5000/thank-you.html',
      cancel_url: process.env.STRIPE_CANCEL_URL || 'http://localhost:5000/cart.html',
      metadata: { email, products: JSON.stringify(items) }
    });
    res.json({ id: session.id });
  } catch (err) {
    console.error("❌ Stripe Checkout error:", err);
    res.status(500).json({ error: "Checkout error", details: err.message });
  }
});

// ✅ Place order (COD or Stripe)
app.post("/place-order", async (req, res) => {
  try {
    const { user, billing, cart } = req.body;
    const query = `INSERT INTO orders (user_email, product_id, size, quantity, price, payment_method, status, tracking_id)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    const orderPromises = cart.map(async (product) => {
      const trackingId = "TRK" + Math.floor(100000 + Math.random() * 900000);
      await pool.execute(query, [
        user.email, product.id, product.size, product.quantity,
        product.price, billing.paymentMethod, "Placed", trackingId
      ]);
    });

    await Promise.all(orderPromises);
    res.json({ message: "✅ Order placed successfully!" });
  } catch (err) {
    console.error("❌ Order insert failed:", err);
    res.status(500).json({ message: "Order failed", details: err.message });
  }
});

// 📦 Orders
app.get('/get-orders', (req, res) => {
  const email = req.query.email;
  const sql = 'SELECT * FROM orders WHERE email = ?';
  db.query(sql, [email], (err, result) => {
    if (err) return res.status(500).send('Error retrieving orders');
    res.json(result);
  });
});


// 🔄 Returns & Exchange
app.post("/request-return", async (req, res) => {
  try {
    const { email, productId, size } = req.body;
    await pool.execute(
      `INSERT INTO returns (user_email, product_id, size, request_type) VALUES (?, ?, ?, 'return')`, 
      [email, productId, size]
    );
    res.json({ message: "✅ Return requested" });
  } catch (err) {
    res.status(500).json({ message: "Return error", details: err.message });
  }
});

app.get("/get-exchanges", (req, res) => {
  const userEmail = req.query.email;

  const sql = "SELECT * FROM exchanges WHERE email = ?";
  db.query(sql, [userEmail], (err, result) => {
    if (err) {
      console.error("Failed to fetch exchanges:", err);
      return res.status(500).json({ message: "Failed to fetch exchanges" });
    }

    res.json(result);
  });
});

app.get('/get-returns', (req, res) => {
  const email = req.query.email;
  const sql = 'SELECT * FROM returns WHERE email = ?';
  db.query(sql, [email], (err, result) => {
    if (err) return res.status(500).send('Error retrieving returns');
    res.json(result);
  });
});


app.post("/cancel-return-request", async (req, res) => {
  try {
    const { id } = req.body;
    const [result] = await pool.execute(
      `UPDATE returns SET status = 'Cancelled' WHERE id = ? AND status = 'Pending'`, 
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(400).json({ message: "Cannot cancel" });
    }
    res.json({ message: "✅ Request cancelled" });
  } catch (err) {
    res.status(500).json({ message: "Cancel error", details: err.message });
  }
});

// 🛠️ Admin APIs
app.get("/get-all-orders", async (req, res) => {
  try {
    const [results] = await pool.execute("SELECT * FROM orders ORDER BY created_at DESC");
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Orders fetch error", details: err.message });
  }
});

app.get("/get-all-returns", async (req, res) => {
  try {
    const [results] = await pool.execute("SELECT * FROM returns ORDER BY requested_at DESC");
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Returns fetch error", details: err.message });
  }
});

app.post("/update-return-status", async (req, res) => {
  try {
    const { id, status } = req.body;
    await pool.execute("UPDATE returns SET status = ? WHERE id = ?", [status, id]);
    res.json({ message: `✅ Marked as ${status}` });
  } catch (err) {
    res.status(500).json({ message: "Status update error", details: err.message });
  }
});

app.post("/update-order-status", async (req, res) => {
  try {
    const { id, status } = req.body;
    await pool.execute("UPDATE orders SET status = ? WHERE id = ?", [status, id]);
    res.json({ message: "✅ Order status updated" });
  } catch (err) {
    res.status(500).json({ message: "Order status error", details: err.message });
  }
});

// 👤 Auth (Register / Login)
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    await pool.execute("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, password]);
    res.json({ message: "✅ Registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Registration error", details: err.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user (including admin status)
    const [users] = await pool.execute(
      "SELECT id, name, email, password, is_admin FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = users[0];

    // 2. Simple password comparison (for now)
    // Note: You should eventually use bcrypt as shown in the commented code below
    if (password !== user.password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 4. Return user data with admin status
    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.is_admin || false // Default to false if column doesn't exist
      }
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed" });
  }
});

// ❤️ Wishlist
app.post("/add-to-wishlist", async (req, res) => {
  try {
    const { user_email, product_id, size, product_name, price, image_url } = req.body;
    await pool.execute(
      `INSERT INTO wishlist (user_email, product_id, size, product_name, price, image_url) VALUES (?, ?, ?, ?, ?, ?)`, 
      [user_email, product_id, size, product_name, price, image_url]
    );
    res.json({ message: "✅ Added to wishlist" });
  } catch (err) {
    res.status(500).json({ message: "Add to wishlist error", details: err.message });
  }
});

app.get("/get-wishlist", async (req, res) => {
  try {
    const [results] = await pool.execute(
      "SELECT * FROM wishlist WHERE user_email = ? ORDER BY created_at DESC", 
      [req.query.email]
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Wishlist fetch error", details: err.message });
  }
});

app.post("/remove-from-wishlist", async (req, res) => {
  try {
    const { user_email, product_id, size } = req.body;
    await pool.execute(
      "DELETE FROM wishlist WHERE user_email = ? AND product_id = ? AND size = ?", 
      [user_email, product_id, size]
    );
    res.json({ message: "✅ Removed from wishlist" });
  } catch (err) {
    res.status(500).json({ message: "Remove wishlist error", details: err.message });
  }
});
// 🚀 Order Success and Send Email
app.post("/order-success", (req, res) => {
  const { email, products } = req.body;

  const query = `INSERT INTO orders 
    (user_email, product_id, size, quantity, price, payment_method, status, tracking_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  const insertPromises = products.map(product => {
    const trackingId = "TRK" + Math.floor(100000 + Math.random() * 900000);
    product.tracking_id = trackingId;

    return new Promise((resolve, reject) => {
      db.query(query, [
        email,
        product.id,
        product.size,
        product.quantity,
        product.price,
        "Stripe",
        "Placed",
        trackingId
      ], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  });

  Promise.all(insertPromises)
    .then(() => {
      sendConfirmationEmail(email, products);
      res.status(200).json({ message: "✅ Order placed and email sent!" });
    })
    .catch(err => {
      console.error("❌ Order Error:", err);
      res.status(500).json({ error: "Could not place order" });
    });
});

function sendConfirmationEmail(email, orderDetails) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const itemsHtml = orderDetails.map(item => `
    <li><strong>${item.name}</strong> - Size: ${item.size}, Quantity: ${item.quantity}, Price: ₹${item.price}</li>
  `).join("");

  const mailOptions = {
    from: `"SuperShoes" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "🧾 SuperShoes Order Confirmation",
    html: `
      <h3>Thank you for your order!</h3>
      <ul>${itemsHtml}</ul>
      <p><strong>Tracking ID:</strong> ${orderDetails[0]?.tracking_id}</p>
    `
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("❌ Email Error:", error);
    } else {
      console.log("✅ Email Sent:", info.response);
    }
  });
}
const PDFDocument = require("pdfkit");
const fs = require("fs");

app.post("/download-invoice", (req, res) => {
  const { email, order } = req.body;

  const doc = new PDFDocument();
  const filename = `invoice_${Date.now()}.pdf`;
  const filePath = `invoices/${filename}`;

  // Create invoices folder if it doesn't exist
  if (!fs.existsSync("invoices")) {
    fs.mkdirSync("invoices");
  }

  doc.pipe(fs.createWriteStream(filePath));

  // Content
  doc.fontSize(20).text("SuperShoes Invoice", { align: "center" });
  doc.moveDown();
  doc.fontSize(12).text(`Customer: ${email}`);
  doc.text(`Date: ${new Date().toLocaleDateString()}`);
  doc.moveDown();

  doc.fontSize(14).text("Order Summary:");
  order.forEach((item, i) => {
    doc.fontSize(12).text(`${i + 1}. ${item.name} - Size: ${item.size} - ₹${item.price} x ${item.quantity}`);
  });

  const total = order.reduce((sum, i) => sum + i.price * i.quantity, 0);
  doc.moveDown().fontSize(14).text(`Total: ₹${total}`);

  doc.end();

  // Respond with download link
  doc.on("finish", () => {
    res.json({ file: filename });
  });
});


// 🚀 Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));