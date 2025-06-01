import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Header from '@/components/Header';
import Player from '@/components/Player';
import { fetchMovieDetails, fetchSimilarMovies } from '@/services/tmdb';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import { motion } from 'framer-motion';
import MovieCard from '@/components/MovieCard';

export default function MovieDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [movie, setMovie] = useState(null);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPlayer, setShowPlayer] = useState(false);
  const { user } = useAuth();
  const { favorites, addFavorite, removeFavorite } = useFavorites();
  const isFavorite = favorites.some(fav => fav.id === parseInt(id));

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        const [details, similar] = await Promise.all([
          fetchMovieDetails(id),
          fetchSimilarMovies(id),
        ]);
        setMovie(details);
        setSimilarMovies(similar);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching movie details:', error);
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const toggleFavorite = () => {
    if (!user) {
      router.push('/auth/signin');
      return;
    }

    if (isFavorite) {
      removeFavorite(movie.id);
    } else {
      addFavorite(movie);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Header />
        <div className="px-4 md:px-12 pt-32 pb-12">
          <div className="animate-pulse">
            <div className="h-12 w-3/4 bg-gray-800 rounded mb-8"></div>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-1/3 aspect-[2/3] bg-gray-800 rounded"></div>
              <div className="w-full md:w-2/3 space-y-4">
                <div className="h-8 w-1/2 bg-gray-800 rounded"></div>
                <div className="h-4 w-full bg-gray-800 rounded"></div>
                <div className="h-4 w-3/4 bg-gray-800 rounded"></div>
                <div className="h-4 w-2/3 bg-gray-800 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <Header />
        <p>Movie not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Head>
        <title>{movie.title} | Netflix Clone</title>
        <meta name="description" content={movie.overview} />
      </Head>

      <Header />

      <main className="px-4 md:px-12 pt-32 pb-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3">
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                className="rounded-lg shadow-xl w-full aspect-[2/3] object-cover"
              />
            </div>

            <div className="w-full md:w-2/3 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-3xl md:text-5xl font-bold">{movie.title}</h1>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowPlayer(true)}
                    className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded flex items-center gap-2 transition"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                    Play Trailer
                  </button>
                  <button
                    onClick={toggleFavorite}
                    className={`px-4 py-2 rounded-full border ${isFavorite ? 'bg-red-600 border-red-600' : 'border-white'}`}
                  >
                    {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                <span>{new Date(movie.release_date).getFullYear()}</span>
                <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
                <span>{movie.vote_average.toFixed(1)}/10</span>
                <div className="flex gap-2">
                  {movie.genres.map(genre => (
                    <span key={genre.id} className="px-2 py-1 bg-gray-800 rounded">
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Overview</h2>
                <p className="text-gray-300">{movie.overview}</p>
              </div>

              {movie.production_companies.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Production</h2>
                  <div className="flex flex-wrap gap-4">
                    {movie.production_companies.map(company => (
                      <div key={company.id} className="flex items-center gap-2">
                        {company.logo_path && (
                          <img
                            src={`https://image.tmdb.org/t/p/w200${company.logo_path}`}
                            alt={company.name}
                            className="h-8 object-contain"
                          />
                        )}
                        {!company.logo_path && <span>{company.name}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {similarMovies.length > 0 && (
            <div className="pt-8">
              <h2 className="text-2xl font-bold mb-6">More Like This</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {similarMovies.slice(0, 6).map(movie => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </main>

      {showPlayer && (
        <Player
          movieId={movie.id}
          onClose={() => setShowPlayer(false)}
        />
      )}
    </div>
  );
}