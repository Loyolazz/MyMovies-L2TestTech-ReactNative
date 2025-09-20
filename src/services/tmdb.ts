import axios from 'axios';
import { TMDB_API_KEY } from '@env';
import { Movie } from '../types/movie';

const api = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  params: {
    language: 'pt-BR',
  },
});

export interface MoviesResponse {
  page: number;
  totalPages: number;
  totalResults: number;
  results: Movie[];
}

const ensureApiKey = (): string => {
  if (!TMDB_API_KEY) {
    throw new Error('Chave da API do TMDb não encontrada. Verifique o arquivo .env.');
  }

  return TMDB_API_KEY;
};

const mapMovie = (movie: any): Movie => ({
  id: movie.id,
  title: movie.title ?? movie.name ?? 'Filme sem título',
  overview: movie.overview,
  posterPath: movie.poster_path,
  backdropPath: movie.backdrop_path,
  releaseDate: movie.release_date,
  voteAverage: movie.vote_average,
});

export async function fetchPopularMovies(page = 1): Promise<MoviesResponse> {
  const apiKey = ensureApiKey();
  const { data } = await api.get('/movie/popular', {
    params: { page, api_key: apiKey },
  });

  return {
    page: data.page,
    totalPages: data.total_pages,
    totalResults: data.total_results,
    results: data.results.map(mapMovie),
  };
}

export async function searchMovies(query: string, page = 1): Promise<MoviesResponse> {
  const apiKey = ensureApiKey();
  const { data } = await api.get('/search/movie', {
    params: {
      query,
      page,
      include_adult: false,
      api_key: apiKey,
    },
  });

  return {
    page: data.page,
    totalPages: data.total_pages,
    totalResults: data.total_results,
    results: data.results.map(mapMovie),
  };
}
