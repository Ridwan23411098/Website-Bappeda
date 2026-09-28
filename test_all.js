const fs = require('fs');

global.window = {};
global.BAPPEDA_DATA = require('./js/bappeda_data.js');

let mockStorage = {};
global.localStorage = {
  getItem: (k) => mockStorage[k] || null,
  setItem: (k, v) => { mockStorage[k] = v; },
  removeItem: (k) => { delete mockStorage[k]; }
};

const storeCode = fs.readFileSync('./js/store.js', 'utf-8');
const wrappedStore = storeCode.replace('const Store =', 'global.Store =');
eval(wrappedStore);

console.log('--- Store Status ---');
console.log('Employees loaded in Store:', global.Store.state.employees.length);
console.log('Default Active ASN:', global.Store.state.user.name);
console.log('Default Active NIP:', global.Store.state.user.nip);
console.log('Default Active Unit:', global.Store.state.user.unitKerja);
console.log('Total Master Metode:', global.Store.state.masterData.metode.length);
console.log('Total Monitoring Units:', global.Store.state.monitoringUnits.length);
console.log('Total Verifications:', global.Store.state.verifications.length);

// Count per unit
const unitCounts = {};
global.Store.state.employees.forEach(e => {
  unitCounts[e.unit] = (unitCounts[e.unit] || 0) + 1;
});
console.log('--- Employees per Bidang ---');
for (const [u, count] of Object.entries(unitCounts)) {
  console.log(`  * ${u}: ${count} ASN`);
}

// Test quickLogin
console.log('--- Quick Login Accounts ---');
global.Store.accounts.forEach(a => {
  console.log(`  * Role: ${a.role} -> ${a.name} (${a.nip}) - ${a.unitKerja}`);
});
