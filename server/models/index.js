/**
 * Model associations — defines all relationships between models.
 * Import this file once in index.js after all models are loaded.
 */
const Tenant = require("./Tenant");
const Environment = require("./Environment");
const Subscription = require("./Subscription");
const User = require("./User");
const Booking = require("./Booking");
const Expense = require("./Expense");
const Settings = require("./Settings");
const AuditLog = require("./AuditLog");

// ── Tenant has many ──
Tenant.hasMany(Environment, { foreignKey: "tenantId", onDelete: "CASCADE" });
Tenant.hasMany(User, { foreignKey: "tenantId", onDelete: "CASCADE" });
Tenant.hasMany(Booking, { foreignKey: "tenantId", onDelete: "CASCADE" });
Tenant.hasMany(Expense, { foreignKey: "tenantId", onDelete: "CASCADE" });
Tenant.hasOne(Settings, { foreignKey: "tenantId", onDelete: "CASCADE" });
Tenant.hasMany(Subscription, { foreignKey: "tenantId", onDelete: "CASCADE" });

// ── Environment has many ──
Environment.hasMany(Booking, { foreignKey: "environmentId", onDelete: "CASCADE" });
Environment.hasMany(Expense, { foreignKey: "environmentId", onDelete: "CASCADE" });
Environment.hasOne(Settings, { foreignKey: "environmentId", onDelete: "CASCADE" });

// ── Belongs to Tenant ──
Environment.belongsTo(Tenant, { foreignKey: "tenantId" });
User.belongsTo(Tenant, { foreignKey: "tenantId" });
Booking.belongsTo(Tenant, { foreignKey: "tenantId" });
Expense.belongsTo(Tenant, { foreignKey: "tenantId" });
Settings.belongsTo(Tenant, { foreignKey: "tenantId" });
Subscription.belongsTo(Tenant, { foreignKey: "tenantId" });

// ── Belongs to Environment ──
Booking.belongsTo(Environment, { foreignKey: "environmentId" });
Expense.belongsTo(Environment, { foreignKey: "environmentId" });
Settings.belongsTo(Environment, { foreignKey: "environmentId" });

module.exports = { Tenant, Environment, Subscription, User, Booking, Expense, Settings, AuditLog };
