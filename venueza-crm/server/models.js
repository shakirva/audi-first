const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/venueza_crm', {
  dialect: 'postgres',
  logging: false,
});

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('Owner', 'Salesman'), defaultValue: 'Salesman' },
});

const Client = sequelize.define('Client', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING },
  package: { type: DataTypes.ENUM('Standard', 'Advanced'), defaultValue: 'Standard' },
  status: { type: DataTypes.STRING, defaultValue: 'Lead' },
  notes: { type: DataTypes.TEXT },
});

User.hasMany(Client, { foreignKey: 'userId' });
Client.belongsTo(User, { foreignKey: 'userId' });

module.exports = { sequelize, Client, User };
