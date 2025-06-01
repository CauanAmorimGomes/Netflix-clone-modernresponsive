import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './authcontext';
import { db } from '@/services/firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setFavorites([]);
      return;
    }

    const fetchFavorites = async () => {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setFavorites(docSnap.data().favorites || []);
      } else {
        await setDoc(docRef, { favorites: [] });
        setFavorites([]);
      }
    };

    fetchFavorites();
  }, [user]);

  const addFavorite = async (movie) => {
    if (!user) return;

    const docRef = doc(db, 'users', user.uid);
    await updateDoc(docRef, {
      favorites: arrayUnion({
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        vote_average: movie.vote_average,
      }),
    });

    setFavorites((prev) => [
      ...prev,
      {
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        vote_average: movie.vote_average,
      },
    ]);
  };

  const removeFavorite = async (movieId) => {
    if (!user) return;

    const docRef = doc(db, 'users', user.uid);
    const favoriteToRemove = favorites.find((fav) => fav.id === movieId);

    if (favoriteToRemove) {
      await updateDoc(docRef, {
        favorites: arrayRemove(favoriteToRemove),
      });

      setFavorites((prev) => prev.filter((fav) => fav.id !== movieId));
    }
  };

  return (
    <FavoritesContext.Provider
      value={{ favorites, addFavorite, removeFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}