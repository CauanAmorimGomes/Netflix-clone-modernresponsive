import { useEffect, useState } from 'react';
import Head from 'next/head';
import Header from '@/components/Header';
import Banner from '@/components/Banner';
import Carousel from '@/components/Carousel';
import { fetchTrending, fetchNetflixOriginals, fetchTopRated, fetchByGenre } from '@/services/tmdb';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

export default function Home() {
  const { user } = useAuth();
  const [trending, setTrending] = useState([]);
  const [originals, setOriginals] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [actionMovies, setActionMovies] = useState([]);
  const [comedyMovies, setComedyMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          trendingData,
          originalsData,
          topRatedData,
          actionData,
          comedyData,
        ] = await Promise.all([
          fetchTrending(),
          fetchNetflixOriginals(),
          fetchTopRated(),
          fetchByGenre(28), // Action
          fetchByGenre(35), // Comedy
        ]);

        setTrending(trendingData);
        setOriginals(originalsData);
        setTopRated(topRatedData);
        setActionMovies(actionData);
        setComedyMovies(comedyData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="relative min-h-screen bg-gray-900 text-white">
      <Head>
        <title>Netflix Clone</title>
        <meta name="description" content="A Netflix clone built with Next.js" />
      </Head>

      <Header />

      <main className="relative pb-16">
        {!loading && originals.length > 0 && (
          <Banner movie={originals[Math.floor(Math.random() * originals.length)]} />
        )}

        <div className="space-y-12 md:space-y-16">
          {loading ? (
            <SkeletonCarousel />
          ) : (
            <Carousel title="Trending Now" movies={trending} />
          )}

          {loading ? (
            <SkeletonCarousel />
          ) : (
            <Carousel title="Netflix Originals" movies={originals} />
          )}

          {loading ? (
            <SkeletonCarousel />
          ) : (
            <Carousel title="Top Rated" movies={topRated} />
          )}

          {loading ? (
            <SkeletonCarousel />
          ) : (
            <Carousel title="Action Movies" movies={actionMovies} />
          )}

          {loading ? (
            <SkeletonCarousel />
          ) : (
            <Carousel title="Comedy Movies" movies={comedyMovies} />
          )}
        </div>
      </main>
    </div>
  );
}

const SkeletonCarousel = () => (
  <div className="px-4 md:px-12 space-y-4">
    <div className="h-8 w-48 bg-gray-800 rounded animate-pulse"></div>
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="aspect-video bg-gray-800 rounded animate-pulse"></div>
      ))}
    </div>
  </div>
);