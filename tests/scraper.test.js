const Scraper = require('../services/scraper');

describe('Scraper Service', () => {
  const scraper = new Scraper();

  test('should build search URLs correctly for movies', () => {
    const urls = scraper.buildSearchURLs('Inception', 'movies');
    expect(urls).toHaveLength(5);
    expect(urls[0]).toContain('Inception');
    expect(urls[0]).toContain('fmovies.to');
  });

  test('should build search URLs correctly for TV', () => {
    const urls = scraper.buildSearchURLs('Breaking Bad', 'tv');
    expect(urls).toHaveLength(5);
    expect(urls[0]).toContain('Breaking%20Bad');
  });

  test('should build search URLs correctly for anime', () => {
    const urls = scraper.buildSearchURLs('Naruto', 'anime');
    expect(urls).toHaveLength(5);
    expect(urls[0]).toContain('Naruto');
  });

  test('should return empty array for unknown type', () => {
    const urls = scraper.buildSearchURLs('Test', 'games');
    expect(urls).toEqual([]);
  });

  test('should format season/episode correctly', () => {
    expect(scraper.formatSeasonEpisode(1, 5)).toBe('S01E05');
    expect(scraper.formatSeasonEpisode(10, 3)).toBe('S10E03');
    expect(scraper.formatSeasonEpisode(0, 0)).toBe('S00E00');
  });

  test('should detect yt-dlp availability', () => {
    const available = scraper.isYTDLPAvailable();
    expect(typeof available).toBe('boolean');
  });

  test('should load all 15 sites from config', () => {
    const totalSites = Object.values(scraper.sites).reduce((sum, arr) => sum + arr.length, 0);
    expect(totalSites).toBe(15);
  });
});
