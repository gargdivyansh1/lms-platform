const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

/**
 * Create a database backup
 */
exports.createBackup = async () => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, '../backups');
    
    // Ensure backup directory exists
    await fs.mkdir(backupDir, { recursive: true });
    
    const backupPath = path.join(backupDir, `backup-${timestamp}.sql`);
    
    // Get database URL from environment
    const databaseUrl = process.env.DATABASE_URL;
    
    // Extract database name from connection string
    const dbMatch = databaseUrl.match(/\/([^?]+)/);
    const dbName = dbMatch ? dbMatch[1] : 'lms_db';
    
    // For PostgreSQL
    if (databaseUrl.includes('postgresql')) {
      // Using pg_dump for PostgreSQL
      const command = `pg_dump ${databaseUrl} > ${backupPath}`;
      await execPromise(command);
    } else {
      // For SQLite or other databases, create a JSON backup
      const { prisma } = require('../lib/prisma');
      
      // Get all data
      const tables = ['User', 'Course', 'UserCourse', 'Module', 'Assignment', 'Notification'];
      const backupData = {};
      
      for (const table of tables) {
        backupData[table] = await prisma[table.toLowerCase()].findMany();
      }
      
      await fs.writeFile(backupPath, JSON.stringify(backupData, null, 2));
    }
    
    return {
      id: timestamp,
      path: backupPath,
      timestamp: new Date().toISOString(),
      size: (await fs.stat(backupPath)).size
    };
  } catch (error) {
    console.error('Backup creation error:', error);
    throw new Error('Failed to create backup');
  }
};

/**
 * Restore a database backup
 */
exports.restoreBackup = async (backupId) => {
  try {
    const backupDir = path.join(__dirname, '../backups');
    const backupPath = path.join(backupDir, `backup-${backupId}.sql`);
    
    // Check if backup exists
    await fs.access(backupPath);
    
    const databaseUrl = process.env.DATABASE_URL;
    
    if (databaseUrl.includes('postgresql')) {
      const command = `psql ${databaseUrl} < ${backupPath}`;
      await execPromise(command);
    } else {
      // For SQLite or other databases
      const backupData = JSON.parse(await fs.readFile(backupPath, 'utf8'));
      const { prisma } = require('../lib/prisma');
      
      // Restore data in correct order
      for (const [table, data] of Object.entries(backupData)) {
        // Clear existing data
        await prisma[table.toLowerCase()].deleteMany();
        
        // Insert backup data
        for (const record of data) {
          await prisma[table.toLowerCase()].create({ data: record });
        }
      }
    }
    
    return {
      message: 'Backup restored successfully',
      backupId
    };
  } catch (error) {
    console.error('Restore backup error:', error);
    throw new Error('Failed to restore backup');
  }
};

/**
 * List all available backups
 */
exports.listBackups = async () => {
  try {
    const backupDir = path.join(__dirname, '../backups');
    await fs.mkdir(backupDir, { recursive: true });
    
    const files = await fs.readdir(backupDir);
    const backups = [];
    
    for (const file of files) {
      const filePath = path.join(backupDir, file);
      const stats = await fs.stat(filePath);
      
      backups.push({
        id: file.replace('backup-', '').replace('.sql', ''),
        name: file,
        size: stats.size,
        createdAt: stats.birthtime,
        path: filePath
      });
    }
    
    return backups.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error('List backups error:', error);
    return [];
  }
};