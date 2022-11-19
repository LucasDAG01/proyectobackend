import mongoose from "mongoose";

const mdbProducts = "productos";

//1. crear schema productos mongoose
const mongoStProd = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  thumbnail: {
    type: String,
    required: true,
  },
});
export const mdbModProd = mongoose.model(mdbProducts, mongoStProd);
