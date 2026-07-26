require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const xlsx = require('xlsx');
const vcf = require('vcard-parser');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sequelize, Client, User } = require('./models');

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });
const JWT_SECRET = process.env.JWT_SECRET || 'venueza-crm-super-secret-key-2026';

// --- AUTHENTICATION ---
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    
    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// --- CLIENTS ---
// Get all clients (Owner sees all, Salesman sees only theirs)
app.get('/api/clients', authenticate, async (req, res) => {
  try {
    const query = req.user.role === 'Owner' ? {} : { where: { userId: req.user.id } };
    const clients = await Client.findAll({ 
      ...query, 
      order: [['createdAt', 'DESC']],
      include: [{ model: User, attributes: ['name'] }]
    });
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add client
app.post('/api/clients', authenticate, async (req, res) => {
  try {
    const data = { ...req.body, userId: req.user.id };
    const client = await Client.create(data);
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update client (Salesman can only update theirs, Owner can update any)
app.put('/api/clients/:id', authenticate, async (req, res) => {
  try {
    const query = req.user.role === 'Owner' ? { id: req.params.id } : { id: req.params.id, userId: req.user.id };
    const client = await Client.findOne({ where: query });
    if (!client) return res.status(404).json({ error: 'Client not found or unauthorized' });
    await client.update(req.body);
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Import Excel
app.post('/api/import/excel', authenticate, upload.single('file'), async (req, res) => {
  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheet_name_list = workbook.SheetNames;
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
    
    let imported = 0;
    for (const row of data) {
      if (row.Name || row.name) {
        await Client.create({
          name: row.Name || row.name,
          phone: String(row.Phone || row.phone || ''),
          email: row.Email || row.email || '',
          package: row.Package || row.package || 'Standard',
          status: 'Lead',
          notes: row.Notes || row.notes || '',
          userId: req.user.id
        });
        imported++;
      }
    }
    fs.unlinkSync(req.file.path);
    res.json({ message: `Imported ${imported} clients successfully` });
  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: err.message });
  }
});

// Import VCF
app.post('/api/import/vcf', authenticate, upload.single('file'), async (req, res) => {
  try {
    const vcfData = fs.readFileSync(req.file.path, 'utf8');
    const parsed = vcf.parse(vcfData);
    
    let imported = 0;
    const lines = vcfData.split('\n');
    let currentContact = null;
    
    for (let line of lines) {
      line = line.trim();
      if (line.startsWith('BEGIN:VCARD')) {
        currentContact = { name: 'Unknown', phone: '' };
      } else if (line.startsWith('FN:')) {
        currentContact.name = line.substring(3);
      } else if (line.startsWith('TEL')) {
        const phoneParts = line.split(':');
        if (phoneParts.length > 1) {
          currentContact.phone = phoneParts[1];
        }
      } else if (line.startsWith('END:VCARD')) {
        if (currentContact) {
          await Client.create({
            name: currentContact.name,
            phone: currentContact.phone,
            status: 'Lead',
            userId: req.user.id
          });
          imported++;
        }
      }
    }
    
    fs.unlinkSync(req.file.path);
    res.json({ message: `Imported ${imported} contacts successfully` });
  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5007;
// Set alter: true to modify existing tables (e.g. changing status from ENUM to VARCHAR, adding userId)
sequelize.sync({ alter: true }).then(() => {
  app.listen(PORT, () => console.log(`CRM API running on port ${PORT}`));
});
