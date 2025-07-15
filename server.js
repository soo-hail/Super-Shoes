// SuperShoes Server
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