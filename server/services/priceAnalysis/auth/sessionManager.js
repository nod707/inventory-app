const fs = require('fs').promises;
const path = require('path');

class SessionManager {
  constructor() {
    this.sessionsDir = path.join(__dirname, '../../../../sessions');
  }

  async ensureSessionsDir() {
    try {
      await fs.access(this.sessionsDir);
    } catch {
      await fs.mkdir(this.sessionsDir, { recursive: true });
    }
  }

  getSessionPath(platform, username) {
    return path.join(this.sessionsDir, `${platform}_${username}.json`);
  }

  async saveSession(platform, username, sessionData) {
    await this.ensureSessionsDir();
    const sessionPath = this.getSessionPath(platform, username);
    await fs.writeFile(sessionPath, JSON.stringify(sessionData, null, 2));
  }

  async getSession(platform) {
    try {
      // Get all files in the sessions directory
      await this.ensureSessionsDir();
      const files = await fs.readdir(this.sessionsDir);
      
      // Find the most recent session file for this platform
      const sessionFiles = files.filter(file => file.startsWith(`${platform}_`));
      if (sessionFiles.length === 0) {
        return null;
      }
      
      // Get the most recently modified file
      const filePaths = sessionFiles.map(file => path.join(this.sessionsDir, file));
      const fileStats = await Promise.all(filePaths.map(async (filePath) => ({
        path: filePath,
        stat: await fs.stat(filePath)
      })));
      
      const mostRecent = fileStats.reduce((latest, current) => {
        return !latest || current.stat.mtime > latest.stat.mtime ? current : latest;
      });
      
      // Read and parse the session data
      const sessionData = JSON.parse(await fs.readFile(mostRecent.path, 'utf8'));
      
      // Check if session is expired
      if (sessionData.expiresAt && new Date(sessionData.expiresAt) < new Date()) {
        // Delete expired session
        await fs.unlink(mostRecent.path);
        return null;
      }
      
      return sessionData;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  async clearSession(platform, username) {
    try {
      const sessionPath = this.getSessionPath(platform, username);
      await fs.unlink(sessionPath);
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  }
}

const sessionManager = new SessionManager();

module.exports = {
  saveSession: sessionManager.saveSession.bind(sessionManager),
  getSession: sessionManager.getSession.bind(sessionManager),
  clearSession: sessionManager.clearSession.bind(sessionManager)
};
