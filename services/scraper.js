const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

class Scraper {
  constructor() {
    this.sites = require('../config/sites.json');
    const bundledPath = path.join(process.resourcesPath || __dirname, '..', 'bin', 'yt-dlp.exe');
    this.ytdlpBinary = fs.existsSync(bundledPath) ? bundledPath : 'yt-dlp';
  }

  buildSearchURLs(query, contentType) {
    const type = contentType.toLowerCase();
    const siteList = this.sites[type];
    if (!siteList) return [];

    return siteList.map(site => {
      return site.searchUrl.replace('{query}', encodeURIComponent(query));
    });
  }

  formatSeasonEpisode(season, episode) {
    const s = String(season).padStart(2, '0');
    const e = String(episode).padStart(2, '0');
    return `S${s}E${e}`;
  }

  isYTDLPAvailable() {
    try {
      execSync(`${this.ytdlpBinary} --version`, { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }

  async extractVideoURL(pageURL) {
    if (!this.isYTDLPAvailable()) {
      throw new Error('yt-dlp not available. Please install it or check PATH.');
    }
    try {
      const command = `${this.ytdlpBinary} --get-url "${pageURL}" 2>/dev/null`;
      const output = execSync(command, { encoding: 'utf-8', timeout: 30000 });
      const urls = output.trim().split('\n').filter(url => url.startsWith('http'));
      if (urls.length === 0) {
        throw new Error('No video URL found');
      }
      return urls[0];
    } catch (error) {
      throw new Error(`yt-dlp extraction failed: ${error.message}`);
    }
  }

  async searchAndExtract(title, type, seasonNum = null, episodeNum = null) {
    const searchURLs = this.buildSearchURLs(title, type);
    const suffix = seasonNum && episodeNum 
      ? ` ${this.formatSeasonEpisode(seasonNum, episodeNum)}`
      : '';

    for (const searchURL of searchURLs) {
      try {
        const videoURL = await this.extractVideoURL(searchURL);
        return {
          success: true,
          videoURL,
          source: searchURL.split('/')[2],
        };
      } catch (error) {
        continue;
      }
    }
    throw new Error(`No video found for "${title}${suffix}"`);
  }
}

module.exports = Scraper;
