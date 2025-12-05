// This file handles the connection between our backend server and the MongoDB database.
// It defines a function that, when called in server.js, establishes the database connection
// so that all models and controllers can store and retrieve data from MongoDB.

import mongoose from "mongoose";                // Mongoose is a library that allows your backend to talk to MongoDB easily And interact with the database using schemas and models.

const connectDB = async () => {  
    // Declaring an async function because 'mongoose.connect()' returns a Promise
    // and we want to wait until the database is connected before starting the server.

    mongoose.connection.on('connected', () => 
        console.log("Database Connected")
    );
    // This event listener runs when the connection is successfully established.
    // It prints a message only once when MongoDB is connected.

    await mongoose.connect(`${process.env.MONGODB_URI}/Major-Backend-December`);
    // Connects to MongoDB using the connection string stored in the .env file.
    // 'MONGODB_URI' usually contains the server address (e.g., MongoDB Atlas or local DB).
    // '/Major-Backend-December' is the database name — MongoDB will auto-create it if it doesn't exist.
};

export default connectDB;  
// Exporting the function so it can be imported and executed from server.js
// to initialize the database connection when the backend starts.
