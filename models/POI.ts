import mongoose from "mongoose"

const POISchema = new mongoose.Schema(
  {
    // Encrypted data for privacy
    encryptedName: {
      type: String,
      required: true,
    },
    encryptedLat: {
      type: String,
      required: true,
    },
    encryptedLon: {
      type: String,
      required: true,
    },

    // Unencrypted data for admin/owner management
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    area: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    pinCode: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "restaurant",
        "cafe",
        "gym",
        "hospital",
        "school",
        "park",
        "shopping",
        "gas_station",
        "bank",
        "pharmacy",
        "other",
      ],
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.POI || mongoose.model("POI", POISchema)
