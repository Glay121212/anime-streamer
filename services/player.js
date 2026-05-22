const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class Player {
  constructor() {
    this.vlcPaths = [
      'C:\\Program Files\\VideoLAN\\VLC\\vlc.exe',
      'C:\\Program Files (x86)\\VideoLAN\\VLC\\vlc.exe',
    ];
    this.mpvPaths = [
      'C:\\Program Files\\mpv\\mpv.exe',
      'C:\\Program Files (x86)\\mpv\\mpv.exe',
    ];
  }

  getVLCPath() {
    for (const vlcPath of this.vlcPaths) {
      if (fs.existsSync(vlcPath)) {
        return vlcPath;
      }
    }
    return null;
  }

  getMPVPath() {
    for (const mpvPath of this.mpvPaths) {
      if (fs.existsSync(mpvPath)) {
        return mpvPath;
      }
    }
    return null;
  }

  detectInstalledPlayers() {
    const installed = {};
    const vlc = this.getVLCPath();
    if (vlc) installed.vlc = vlc;
    const mpv = this.getMPVPath();
    if (mpv) installed.mpv = mpv;
    return installed;
  }

  isValidURL(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  formatCommand(playerPath, videoURL) {
    const escapedPath = `"${playerPath}"`;
    const escapedURL = `"${videoURL}"`;
    return `${escapedPath} ${escapedURL}`;
  }

  async launch(videoURL, playerPath) {
    if (!this.isValidURL(videoURL)) {
      throw new Error(`Invalid video URL: ${videoURL}`);
    }
    if (!playerPath || !fs.existsSync(playerPath)) {
      throw new Error(`Player not found: ${playerPath}`);
    }
    return new Promise((resolve, reject) => {
      const command = this.formatCommand(playerPath, videoURL);
      exec(command, (error) => {
        if (error && error.code !== 0) {
          if (error.code === 'ERR_UV_PLATFORM') {
            resolve({ success: true, platform: process.platform });
            return;
          }
          reject(new Error(`Failed to launch player: ${error.message}`));
        } else {
          resolve({ success: true });
        }
      });
    });
  }
}

module.exports = Player;
