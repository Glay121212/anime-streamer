const axios = require('axios');

class TMDB {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.themoviedb.org/3';
    this.imageBase = 'https://image.tmdb.org/t/p/w200';
    this.client = axios.create({
      baseURL: this.baseUrl,
      params: { api_key: apiKey },
    });
  }

  async search(query) {
    try {
      const response = await this.client.get('/search/multi', {
        params: {
          query,
          page: 1,
        },
      });

      return response.data.results
        .filter(r => r.media_type === 'movie' || r.media_type === 'tv')
        .map(r => this.formatResult(r));
    } catch (error) {
      console.error('TMDB search error:', error.message);
      return [];
    }
  }

  formatResult(result) {
    const isAnime = result.genres && result.genres.some(g => g.id === 16);
    const type = result.media_type === 'tv' ? (isAnime ? 'anime' : 'tv') : 'movie';
    const year = result.release_date?.substring(0, 4) || result.first_air_date?.substring(0, 4) || '';

    return {
      id: result.id,
      title: result.title || result.name,
      poster: result.poster_path ? `${this.imageBase}${result.poster_path}` : null,
      year,
      type,
    };
  }

  async getDetails(id, type) {
    try {
      const endpoint = type === 'movie' ? `/movie/${id}` : `/tv/${id}`;
      const response = await this.client.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('TMDB details error:', error.message);
      return null;
    }
  }

  async getSeasons(tvId) {
    try {
      const response = await this.client.get(`/tv/${tvId}`);
      const { seasons } = response.data;
      
      return seasons
        .filter(s => s.season_number > 0)
        .map(s => ({
          seasonNumber: s.season_number,
          episodeCount: s.episode_count,
          name: s.name,
        }));
    } catch (error) {
      console.error('TMDB seasons error:', error.message);
      return [];
    }
  }
}

module.exports = TMDB;
