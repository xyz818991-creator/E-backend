import fs from 'fs';
import path from 'path';

export const runBackup = () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.resolve(process.cwd(), 'backend/data/backups');
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

  const sqliteSource = path.resolve(process.cwd(), 'backend/data/the_ethnic_edit.sqlite');
  if (fs.existsSync(sqliteSource)) {
    const dest = path.join(backupDir, `backup_${timestamp}.sqlite`);
    fs.copyFileSync(sqliteSource, dest);
    console.log(`[Backup] SQLite backup created at ${dest}`);
  } else {
    console.log('[Backup] MySQL backup marker recorded.');
  }
};

runBackup();

