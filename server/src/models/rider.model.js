import mongoose from "mongoose";

const RiderSchema = mongoose.Schema(
  {
    riderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      unique: true,
    },
    vehicleDetails: {
      type: {
        vehicleType: { type: String, default: "Bike" },
        vehicleNumber: { type: String, default: "" },
        vehicleModel: { type: String, default: "" },
        vehicleColor: { type: String, default: "" },
      },
      default: {},
    },
    documents: {
      type: {
        drivingLicense: { type: String, default: "" },
        vehicleRegistrationCertificate: { type: String, default: "" },
        insuranceCertificate: { type: String, default: "" },
        aadharCard: { type: String, default: "" },
        panCard: { type: String, default: "" },
      },
      default: {},
    },
    currentAddress: {
      type: {
        address: { type: String, default: "" },
        city: { type: String, default: "" },
        state: { type: String, default: "" },
        pinCode: { type: String, default: "" },
        country: { type: String, default: "India" },
      },
      default: {},
    },
    status: {
      type: String,
      enum: ["active", "inactive", "blocked"],
      default: "active",
    },
    averageRating: { type: Number, default: 4.8 },
    isAvailable: { type: Boolean, default: true },
    financialDetails: {
      type: {
        bankName: { type: String, default: "" },
        accountNumber: { type: String, default: "" },
        ifscCode: { type: String, default: "" },
      },
      default: {},
    },
    currentLocation: {
      type: {
        lat: { type: String, default: "" },
        lon: { type: String, default: "" },
      },
      default: {},
    },
  },
  { timestamps: true },
);

const Rider = mongoose.model("rider", RiderSchema);

export default Rider;
