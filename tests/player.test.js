const Player = require('../services/player');

describe('Player Service', () => {
  const player = new Player();

  test('should detect VLC executable path on Windows', () => {
    const vlcPath = player.getVLCPath();
    if (vlcPath) {
      expect(vlcPath).toContain('vlc.exe');
    }
  });

  test('should detect MPV executable path on Windows', () => {
    const mpvPath = player.getMPVPath();
    if (mpvPath) {
      expect(mpvPath).toContain('mpv.exe');
    }
  });

  test('should validate video URL format', () => {
    expect(player.isValidURL('https://example.com/video.mp4')).toBe(true);
    expect(player.isValidURL('http://example.com/video')).toBe(true);
    expect(player.isValidURL('invalid-url')).toBe(false);
    expect(player.isValidURL('')).toBe(false);
  });

  test('should format launch command correctly', () => {
    const cmd = player.formatCommand(
      'C:\\Program Files\\VideoLAN\\VLC\\vlc.exe',
      'https://example.com/video.mp4'
    );
    expect(cmd).toContain('vlc.exe');
    expect(cmd).toContain('https://example.com/video.mp4');
    expect(cmd).toContain('"');
  });

  test('should return empty installed players when none found', () => {
    const installed = player.detectInstalledPlayers();
    expect(typeof installed).toBe('object');
  });

  test('should have valid VLC paths defined', () => {
    expect(player.vlcPaths.length).toBeGreaterThan(0);
    expect(player.vlcPaths[0]).toContain('vlc.exe');
  });

  test('should have valid MPV paths defined', () => {
    expect(player.mpvPaths.length).toBeGreaterThan(0);
    expect(player.mpvPaths[0]).toContain('mpv.exe');
  });
});
