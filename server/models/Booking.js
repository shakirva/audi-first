const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Booking = sequelize.define("Booking", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tenantId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "Tenants", key: "id" },
  },
  environmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "Environments", key: "id" },
  },
  bookingId: { type: DataTypes.STRING },
  customerName: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: false },
  eventType: { type: DataTypes.STRING, allowNull: false },
  hall: { type: DataTypes.STRING, allowNull: false },
  date: { type: DataTypes.STRING, allowNull: false },
  session: { type: DataTypes.ENUM("Morning", "Evening", "Full Day"), defaultValue: "Full Day" },
  guests: { type: DataTypes.INTEGER, defaultValue: 0 },
  advance: { type: DataTypes.INTEGER, defaultValue: 0 },
  totalAmount: { type: DataTypes.INTEGER, defaultValue: 0 },
  status: { type: DataTypes.ENUM("Enquiry", "Pending Payment", "Confirmed", "Completed", "Cancelled"), defaultValue: "Enquiry" },
  notes: { type: DataTypes.TEXT, defaultValue: "" },
}, {
  hooks: {
    beforeCreate: async (booking) => {
      if (!booking.bookingId) {
        // Scope booking ID generation to tenant + environment
        const count = await Booking.count({
          where: { tenantId: booking.tenantId, environmentId: booking.environmentId },
        });
        booking.bookingId = `BK${String(count + 1).padStart(3, "0")}`;
      }
    }
  },
  indexes: [
    { fields: ["tenantId", "environmentId"], name: "idx_bookings_tenant_env" },
    { unique: true, fields: ["bookingId", "tenantId", "environmentId"], name: "idx_bookings_id_tenant_env" },
  ],
});

module.exports = Booking;
