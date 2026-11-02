import mongoose from "mongoose";

const MenuItemSchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: {
      type: String,
      enum: [
        "Appetizer",
        "Main Course",
        "Dessert",
        "Beverage",
        "Salad",
        "Soup",
        "Side Dish",
        "Breakfast",
        "Lunch",
        "Dinner",
        "Snack",
        "Pizza",
        "Pasta",
        "Burger",
        "Sandwich",
        "Seafood",
        "Rice",
        "Wrap",
        "Starter",
        "Drink",
        "Other",
      ],
      required: true,
    },
    foodType: {
      type: String,
      enum: [
        "Vegetarian",
        "Non-Vegetarian",
        "Vegan",
        "Gluten-Free",
        "Dairy-Free",
        "Egg-Free",
        "Other",
      ],
      required: true,
    },
    image: {
      type: { url: { type: String }, publicId: { type: String } },
      required: true,
    },
    status: {
      type: String,
      enum: ["available", "unavailable", "discontinued"],
      default: "available",
    },
    isTopRated: { type: Boolean, default: false },
    isRecommended: { type: Boolean, default: false },
    isNew: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { suppressReservedKeysWarning: true },
);

const MenuSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "restaurant",
      required: true,
    },
    menuItems: [MenuItemSchema],
  },
  { timestamps: true, suppressReservedKeysWarning: true },
);

const Menu = mongoose.model("menu", MenuSchema);

export default Menu;
