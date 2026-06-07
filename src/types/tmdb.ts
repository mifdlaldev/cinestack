// ─────────────────────────────────────────────────────────────
// TMDB API TypeScript Types
// ─────────────────────────────────────────────────────────────

/** Core movie data returned from list endpoints. */
export interface TmdbMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  original_language: string;
  adult: boolean;
  video: boolean;
}

/** Full movie detail including nested relations. */
export interface TmdbMovieDetail extends TmdbMovie {
  genres: TmdbGenre[];
  runtime: number | null;
  budget: number;
  revenue: number;
  status: string;
  tagline: string | null;
  homepage: string | null;
  production_companies: TmdbProductionCompany[];
  production_countries: TmdbProductionCountry[];
  spoken_languages: TmdbSpokenLanguage[];
  belongs_to_collection: TmdbCollection | null;
}

export interface TmdbGenre {
  id: number;
  name: string;
}

export interface TmdbCredit {
  id: number;
  cast: TmdbCastMember[];
  crew: TmdbCrewMember[];
}

export interface TmdbCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface TmdbCrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface TmdbVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface TmdbVideos {
  id: number;
  results: TmdbVideo[];
}

export interface TmdbWatchProvider {
  logo_path: string;
  provider_id: number;
  provider_name: string;
  display_priority: number;
}

export interface TmdbWatchProviders {
  id: number;
  results: {
    [countryCode: string]: {
      link: string;
      flatrate?: TmdbWatchProvider[];
      rent?: TmdbWatchProvider[];
      buy?: TmdbWatchProvider[];
    };
  };
}

export interface TmdbProductionCompany {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
}

export interface TmdbProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface TmdbSpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

export interface TmdbCollection {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
}

/** Paginated response wrapper used by TMDB list endpoints. */
export interface TmdbPaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

/** Person (actor / crew) returned from trending people endpoint. */
export interface TmdbPerson {
  id: number;
  name: string;
  known_for_department: string;
  profile_path: string | null;
  popularity: number;
  known_for: TmdbMovie[];
}

/** Full person detail returned from /person/{id} endpoint. */
export interface TmdbPersonDetail extends TmdbPerson {
  biography: string;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  also_known_as: string[];
  gender: number;
  homepage: string | null;
  imdb_id: string | null;
}

/** Cast member in a person's movie credits response. */
export interface TmdbPersonCastMember extends TmdbCastMember {
  credit_id: string;
  release_date: string;
  vote_count: number;
  vote_average: number;
  popularity: number;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  genre_ids: number[];
  original_language: string;
  adult: boolean;
  title: string;
  id: number;
}

/** Crew member in a person's movie credits response. */
export interface TmdbPersonCrewMember extends TmdbCrewMember {
  credit_id: string;
  release_date: string;
  vote_count: number;
  vote_average: number;
  popularity: number;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  genre_ids: number[];
  original_language: string;
  adult: boolean;
  title: string;
  id: number;
}

/** Movie credits response for a person. */
export interface TmdbPersonCredits {
  id: number;
  cast: TmdbPersonCastMember[];
  crew: TmdbPersonCrewMember[];
}
