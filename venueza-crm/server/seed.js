require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User } = require('./models');

(async () => {
  await sequelize.sync({ alter: true });
  
  const hash = await bcrypt.hash('password123', 10);
  
  await User.findOrCreate({
    where: { email: 'owner@venueza.com' },
    defaults: { name: 'Admin Owner', password: hash, role: 'Owner' }
  });

  await User.findOrCreate({
    where: { email: 'sales@venueza.com' },
    defaults: { name: 'Sales Agent', password: hash, role: 'Salesman' }
  });

  console.log('Seed complete! Users created:');
  console.log('owner@venueza.com / password123');
  console.log('sales@venueza.com / password123');
  process.exit(0);
})();
