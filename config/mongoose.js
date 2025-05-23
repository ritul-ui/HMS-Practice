import mongoose from "mongoose";


const uri = ""; // use your localmongodb url

mongoose.connect(uri).
    then(() => console.log("MongoDB connected successfully")).
    catch(err => console.log("MongoDB connection error:", err));

    