import { useCallback, useEffect, useState } from "react";

import {
    ActivityIndicator,
    Text,
    View,
} from "react-native";

import {
    Film,
    User,
    Users,
} from "lucide-react-native";

const API_URL = "http://localhost:3000/api";

type StatCardProps = {
  title: string;
  value: number;
  icon: React.ReactNode;
};

function StatCard({
  title,
  value,
  icon,
}: StatCardProps) {
  return (
    <View className="w-52 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm text-zinc-400">
          {title}
        </Text>

        {icon}
      </View>

      <Text className="mt-3 text-3xl font-bold text-white">
        {value}
      </Text>
    </View>
  );
}

export default function Dashboard() {
  const [movies, setMovies] = useState(0);
  const [directors, setDirectors] = useState(0);
  const [actors, setActors] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [
        moviesResponse,
        directorsResponse,
        actorsResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/movies`),
        fetch(`${API_URL}/directors`),
        fetch(`${API_URL}/actors`),
      ]);

      const [
        moviesData,
        directorsData,
        actorsData,
      ] = await Promise.all([
        moviesResponse.json(),
        directorsResponse.json(),
        actorsResponse.json(),
      ]);

      if (!moviesResponse.ok) {
        throw new Error(
          moviesData?.message ||
            "Failed to get movies"
        );
      }

      if (!directorsResponse.ok) {
        throw new Error(
          directorsData?.message ||
            "Failed to get directors"
        );
      }

      if (!actorsResponse.ok) {
        throw new Error(
          actorsData?.message ||
            "Failed to get actors"
        );
      }

      const movieList = Array.isArray(moviesData)
        ? moviesData
        : moviesData.data ?? [];

      const directorList =
        Array.isArray(directorsData)
          ? directorsData
          : directorsData.data ?? [];

      const actorList =
        Array.isArray(actorsData)
          ? actorsData
          : actorsData.data ?? [];

      setMovies(movieList.length);
      setDirectors(directorList.length);
      setActors(actorList.length);

      console.log(
        "📊 DASHBOARD:",
        {
          movies: movieList.length,
          directors: directorList.length,
          actors: actorList.length,
        }
      );
    } catch (error) {
      console.error(
        "❌ DASHBOARD ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return (
    <View className="flex-1 p-10">

      {/* HEADER */}

      <Text className="text-4xl font-bold text-white">
        Dashboard
      </Text>

      <Text className="mt-2 text-zinc-400">
        Welcome back to Movie App 🎬
      </Text>

      {/* ERROR */}

      {error ? (
        <View className="mt-8 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
          <Text className="text-red-400">
            {error}
          </Text>
        </View>
      ) : null}

      {/* STATS */}

      {loading ? (
        <View className="mt-10 flex-row items-center">
          <ActivityIndicator
            size="large"
            color="#EF4444"
          />

          <Text className="ml-4 text-zinc-400">
            Loading dashboard...
          </Text>
        </View>
      ) : (
        <View className="mt-10 flex-row gap-5">

          <StatCard
            title="Total Movies"
            value={movies}
            icon={
              <Film
                size={22}
                color="#A1A1AA"
              />
            }
          />

          <StatCard
            title="Total Directors"
            value={directors}
            icon={
              <User
                size={22}
                color="#A1A1AA"
              />
            }
          />

          <StatCard
            title="Total Actors"
            value={actors}
            icon={
              <Users
                size={22}
                color="#A1A1AA"
              />
            }
          />

        </View>
      )}

    </View>
  );
}