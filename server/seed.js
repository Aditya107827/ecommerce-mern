require("dotenv").config();

const mongoose = require("mongoose");
const Product = require("./models/Product");

const products = [
    {
        name: "Resine Photo Frame",
        price: 899,
        image: "",
        category: "resine-photo-frames",
        description:
            "Beautiful resin photo frame designed to preserve your special memories.",
        stock: 20,
        featured: true,
    },

    {
        name: "Decorative Candles",
        price: 499,
        image: "",
        category: "candles",
        description:
            "Beautifully crafted decorative candles perfect for home decoration and gifting.",
        stock: 25,
        featured: true,
    },

    {
        name: "Premium Calender",
        price: 699,
        image: "",
        category: "calendars",
        description:
            "Premium calendar designed to add style and organization to your space.",
        stock: 15,
        featured: true,
    },

    {
        name: "Personalized Resine Frame",
        price: 1299,
        image: "",
        category: "resine-photo-frames",
        description:
            "Personalized resin frame made to preserve your favorite memories.",
        stock: 10,
        featured: true,
    },
];

const seedProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB Connected");

        // Remove existing products
        await Product.deleteMany({});

        console.log("Existing products removed");

        // Insert products
        await Product.insertMany(products);

        console.log("Products seeded successfully");

        process.exit(0);
    } catch (error) {
        console.error("Seeding failed:", error.message);

        process.exit(1);
    }
};

seedProducts();