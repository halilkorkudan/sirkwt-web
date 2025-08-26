const express = require("express");
const cors = require("cors");
const { Sequelize, DataTypes } = require("sequelize");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

// PostgreSQL bağlantısı
const sequelize = new Sequelize("hefa", "hefa", "hefa", {
    host: "localhost",
    dialect: "postgres",
});

// BlogPost modeli
const BlogPost = sequelize.define(
    "BlogPost",
    {
        title: { type: DataTypes.STRING, allowNull: false },
        excerpt: { type: DataTypes.TEXT, allowNull: false },
        content: { type: DataTypes.TEXT, allowNull: false },
        image: { type: DataTypes.STRING, allowNull: false },
        category: { type: DataTypes.STRING, allowNull: false },
        author: { type: DataTypes.STRING, allowNull: false },
        date: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        readTime: { type: DataTypes.STRING, allowNull: false, defaultValue: "5 dk" },
        views: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        likes: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        tags: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: false, defaultValue: [] },
    },
    { tableName: "blog_posts", timestamps: false }
);

// Storage ve upload ayarı
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});
const upload = multer({ storage });

// Statik dosya servisi
app.use("/uploads", express.static("uploads"));

// Resim yükleme endpoint
app.post("/api/upload", upload.single("image"), (req, res) => {
    try {
        res.json({ url: `http://localhost:5000/uploads/${req.file.filename}` });
    } catch (err) {
        res.status(500).json({ message: "Resim yüklenemedi", error: err });
    }
});

// GET endpoint
app.get("/api/posts", async (req, res) => {
    try {
        const posts = await BlogPost.findAll({ order: [["date", "DESC"]] });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: "Veri çekilirken hata oluştu", error: err });
    }
});

// POST endpoint
app.post("/api/posts", async (req, res) => {
    try {
        const post = await BlogPost.create(req.body);
        res.json(post);
    } catch (err) {
        res.status(500).json({ message: "Post eklenirken hata oluştu", error: err });
    }
});

// UPDATE
app.put("/api/posts/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await BlogPost.update(req.body, { where: { id } });
        res.json({ message: "Post güncellendi" });
    } catch (err) {
        res.status(500).json({ message: "Post güncellenirken hata oluştu", error: err });
    }
});

// DELETE
app.delete("/api/posts/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await BlogPost.destroy({ where: { id } });
        res.json({ message: "Post silindi" });
    } catch (err) {
        res.status(500).json({ message: "Post silinirken hata oluştu", error: err });
    }
});


// Veritabanı senkronizasyonu
sequelize
    .authenticate()
    .then(() => console.log("PostgreSQL bağlantısı başarılı"))
    .catch((err) => console.error("Bağlantı hatası:", err));

BlogPost.sync({ alter: true }).then(() => console.log("BlogPost tablosu senkronize edildi"));

const PORT = 5000;
app.listen(PORT, () => console.log(`Backend ${PORT} portunda çalışıyor`));
