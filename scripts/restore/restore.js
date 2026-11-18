import fs from 'fs';
import path from 'path';

export const runRestore = () => {
  const backupDir = path.resolve(process.cwd(), 'backend/data/backups');
  if (!fs.existsSync(backupDir)) {
    console.log('[Restore] No backup directory found.');
    return;
  }
  const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.sqlite'));
  if (files.length === 0) {
    console.log('[Restore] No backups available to restore.');
    return;
  }
  const latest = files.sort().pop();
  const src = path.join(backupDir, latest);
  const dest = path.resolve(process.cwd(), 'backend/data/the_ethnic_edit.sqlite');
  fs.copyFileSync(src, dest);
  console.log(`[Restore] Restored database from ${latest}`);
};

runRestore();

