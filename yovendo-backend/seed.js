const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const DB_URI = 'mongodb+srv://Proyecto_Gestion:si2Tef1oPqQmktog@cluster0.uux2ndk.mongodb.net/yovendo_db?appName=Cluster0';

async function seed() {
  await mongoose.connect(DB_URI);
  console.log('Connected to MongoDB');

  const roleSchema = new mongoose.Schema({
    name: String,
    description: String,
    isActive: Boolean,
  }, { timestamps: true });

  const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    passwordHash: String,
    roleId: mongoose.Schema.Types.ObjectId,
    status: String,
  }, { timestamps: true });

  const Role = mongoose.models.Role || mongoose.model('Role', roleSchema);
  const User = mongoose.models.User || mongoose.model('User', userSchema);

  // Seed Roles
  const roles = ['ADMIN', 'SUPERVISOR', 'DIRECTOR', 'CONSULTOR'];
  let adminRole = null;
  for (const roleName of roles) {
    let role = await Role.findOne({ name: roleName });
    if (!role) {
      role = await Role.create({
        name: roleName,
        description: `Rol de ${roleName}`,
        isActive: true,
      });
      console.log(`Created role: ${roleName}`);
    }
    if (roleName === 'ADMIN') {
      adminRole = role;
    }
  }

  // Seed Initial Admin
  const adminEmail = 'admin@yovendo.com';
  let adminUser = await User.findOne({ email: adminEmail });
  if (!adminUser) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('admin123', salt);
    
    adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'Sistema',
      email: adminEmail,
      passwordHash: passwordHash,
      roleId: adminRole._id,
      status: 'ACTIVE'
    });
    console.log(`Created admin user: ${adminEmail} / admin123`);
  } else {
    console.log('Admin user already exists');
  }

  await mongoose.disconnect();
  console.log('Done');
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
