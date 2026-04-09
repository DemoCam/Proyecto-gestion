const mongoose = require('mongoose');


const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error("No se encontró la variable MONGO_URI en el entorno");
  process.exit(1);
}

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String }
}, { timestamps: true });

const Category = mongoose.model('InventoryCategory', categorySchema);

async function seed() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to DB');
    
    const defaults = [
      { name: 'Electrónica', description: 'Dispositivos y componentes digitales' },
      { name: 'Mobiliario Corporativo', description: 'Muebles de oficina e infraestructura' },
      { name: 'Suministros de Oficina', description: 'Papelería y consumibles diarios' },
      { name: 'Mantenimiento & Aseo', description: 'Insumos de limpieza corporativa' },
      { name: 'Herramientas', description: 'Instrumentos de precisión y carga' }
    ];
    
    for (const cat of defaults) {
      const exists = await Category.findOne({ name: cat.name });
      if (!exists) {
        await Category.create(cat);
        console.log('Created category:', cat.name);
      }
    }
    
    await mongoose.disconnect();
    console.log('Done seeding categories.');
  } catch (e) {
    console.error(e);
  }
}

seed();
