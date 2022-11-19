import mongoose from "mongoose";

const mdbChart = "carritos";

//1. crear schema carrito mongoose
const mongoStChar = new mongoose.Schema({
  timestamp: {
    type: String,
    required: true,
  },
  products: {
    type: String,
    required: true,
  },
});

export const mdbModChart = mongoose.model(mdbChart, mongoStChar);
