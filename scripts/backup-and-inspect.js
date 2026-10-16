const fs = require('fs');
const path = require('path');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const sa = JSON.parse(fs.readFileSync('serviceAccountKey.json', 'utf8'));
initializeApp({ credential: cert(sa) });
const db = getFirestore();

async function run() {
  console.log('Connecting to Firestore and inspecting collections...');

  // 1. Fetch current services
  const servicesSnap = await db.collection('services').get();
  const services = [];
  servicesSnap.forEach(doc => {
    services.push({ id: doc.id, ...doc.data() });
  });
  console.log(`Found ${services.length} total services in Firestore.`);

  // 2. Fetch appointments
  const apptsSnap = await db.collection('appointments').get();
  const appointments = [];
  apptsSnap.forEach(doc => {
    appointments.push({ id: doc.id, ...doc.data() });
  });
  console.log(`Found ${appointments.length} appointments in Firestore.`);

  // 3. Fetch invoices
  const invSnap = await db.collection('invoices').get();
  const invoices = [];
  invSnap.forEach(doc => {
    invoices.push({ id: doc.id, ...doc.data() });
  });
  console.log(`Found ${invoices.length} invoices in Firestore.`);

  // 4. Analyze service references in appointments
  const referencedServiceIds = new Set();
  appointments.forEach(a => {
    if (Array.isArray(a.serviceIds)) {
      a.serviceIds.forEach(id => referencedServiceIds.add(id));
    }
    if (a.serviceId) {
      referencedServiceIds.add(a.serviceId);
    }
  });
  console.log(`Unique service IDs referenced by appointments: ${referencedServiceIds.size}`);

  // 5. Create backup directory and save backup
  const backupDir = path.join(__dirname, '..', 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(backupDir, `services_backup_${timestamp}.json`);
  fs.writeFileSync(backupFile, JSON.stringify(services, null, 2), 'utf8');
  console.log(`Saved backup of ${services.length} services to: ${backupFile}`);

  // Also print existing categories
  const categories = {};
  services.forEach(s => {
    const cat = s.category || 'Uncategorized';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push({ id: s.id, name: s.name, price: s.price, active: s.active });
  });

  console.log('\nCurrent Categories and Services Breakdown:');
  for (const [cat, items] of Object.entries(categories)) {
    console.log(`  Category: "${cat}" (${items.length} services)`);
    items.forEach(it => {
      const isRef = referencedServiceIds.has(it.id) ? ' [REFERENCED]' : '';
      console.log(`    - [${it.id}] ${it.name} | ₹${it.price} | active: ${it.active}${isRef}`);
    });
  }
}

run()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Inspection failed:', err);
    process.exit(1);
  });
