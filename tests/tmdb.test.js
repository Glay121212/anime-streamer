const TMDB = require('../services/tmdb');

describe('TMDB API', () => {
  const tmdb = new TMDB('fake-api-key-for-testing');

  test('should format search result correctly for movie', () => {
    const result = tmdb.formatResult({
      id: 123,
      title: 'Inception',
      poster_path: '/image.jpg',
      release_date: '2010-07-16',
      media_type: 'movie',
    });

    expect(result).toEqual({
      id: 123,
      title: 'Inception',
      poster: 'https://image.tmdb.org/t/p/w200/image.jpg',
      year: '2010',
      type: 'movie',
    });
  });

  test('should format search result correctly for TV show', () => {
    const result = tmdb.formatResult({
      id: 456,
      name: 'Breaking Bad',
      poster_path: '/tv.jpg',
      first_air_date: '2008-01-20',
      media_type: 'tv',
    });

    expect(result).toEqual({
      id: 456,
      title: 'Breaking Bad',
      poster: 'https://image.tmdb.org/t/p/w200/tv.jpg',
      year: '2008',
      type: 'tv',
    });
  });

  test('should detect anime by genre id 16', () => {
    const result = tmdb.formatResult({
      id: 789,
      name: 'Attack on Titan',
      poster_path: '/anime.jpg',
      first_air_date: '2013-04-07',
      media_type: 'tv',
      genres: [{ id: 16 }], // Anime genre
    });

    expect(result.type).toBe('anime');
  });

  test('should handle null poster_path', () => {
    const result = tmdb.formatResult({
      id: 999,
      title: 'No Poster Movie',
      poster_path: null,
      release_date: '2020-01-01',
      media_type: 'movie',
    });

    expect(result.poster).toBe(null);
  });

  test('should handle missing date fields', () => {
    const result = tmdb.formatResult({
      id: 888,
      title: 'Test Movie',
      media_type: 'movie',
    });

    expect(result.year).toBe('');
  });

  test('should validate API key is set', () => {
    expect(tmdb.apiKey).toBe('fake-api-key-for-testing');
  });

  test('should have correct base URLs', () => {
    expect(tmdb.baseUrl).toBe('https://api.themoviedb.org/3');
    expect(tmdb.imageBase).toBe('https://image.tmdb.org/t/p/w200');
  });
});
