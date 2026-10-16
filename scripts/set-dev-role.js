const fs = require('fs');
const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

const sa = JSON.parse(fs.readFileSync('serviceAccountKey.json', 'utf8'));
initializeApp({ credential: cert(sa) });

const auth = getAuth();
const db = getFirestore();

async function run() {
  const targetEmail = 'prathmeshbhilare52@gmail.com';
  try {
    const user = await auth.getUserByEmail(targetEmail);
    console.log('Found user in Auth:', user.uid, user.email, 'Claims:', user.customClaims);
    await auth.setCustomUserClaims(user.uid, { ...user.customClaims, role: 'developer' });
    console.log('Custom claims updated to developer');

    const userDocRef = db.collection('users').doc(user.uid);
    const doc = await userDocRef.get();
    if (doc.exists) {
      console.log('User doc in Firestore:', doc.data());
      await userDocRef.update({ role: 'developer', updatedAt: new Date().toISOString() });
      console.log('Firestore user doc updated to role developer');
    } else {
      console.log('Firestore user doc does not exist yet for UID:', user.uid);
      await userDocRef.set({
        uid: user.uid,
        userId: 'DEV-' + user.uid.slice(0, 6).toUpperCase(),
        fullName: user.displayName || 'Prathmesh Bhilare',
        email: targetEmail,
        phone: user.phoneNumber || '',
        role: 'developer',
        preferredBranch: 'koregaon',
        status: 'active',
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      console.log('Created Firestore user doc with role developer');
    }
  } catch (err) {
    console.log('Notice regarding user:', err.message);
  }
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
