// ─── Re-export all TMDB modules ──────────────────────────────────
// Import path: @/lib/tmdb — works for both the module and old file

export { TmdbApiError, TMDB_IMAGE_BASE, DEFAULT_REVALIDATE, fetchFromTmdb } from "./client";

export { getImageUrl, getBackdropUrl, getLogoUrl, getProfileUrl } from "./images";

export {
  getTrending, getPopular, getTopRated, getUpcoming, getNowPlaying,
  getMovieDetail, getMovieCredits, getMovieVideos, getMovieWatchProviders,
  getSimilarMovies, getMovieGenres, getRecommendedMovies,
  getTrendingCached,
} from "./movies";

export { searchMovies, discoverMovies } from "./search";

export { getWatchProviders, getWatchProviderList } from "./providers";

export {
  getTrendingActors, searchActors, getPersonDetail, getPersonMovieCredits,
} from "./actors";

export type {
  PosterSize, BackdropSize, LogoSizes, ProfileSize,
} from "./images";

export type { FetchOptions } from "./client";
