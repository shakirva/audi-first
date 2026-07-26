const User = require('./models/User');
const sequelize = require('./db');

(async () => {
  try {
    const users = await User.findAll({ attributes: ['email', 'password'] });
    console.log(users.map(u => u.email));
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
})();
