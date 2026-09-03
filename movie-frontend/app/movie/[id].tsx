import {
    ArrowLeft,
    Calendar,
    Play,
    Star,
    User,
} from "lucide-react-native";

import {
    Image,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";

import {
    router,
    useLocalSearchParams,
} from "expo-router";

import {
    getMovieById,
    type Movie,
} from "@/services/MovieService";

import { useEffect, useState } from "react";

export default function MovieDetail() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const movieId = Number(id);

  const [movie, setMovie] = useState<Movie | null>(
    null
  );

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(
    null
  );

  // =====================================================
  // FETCH MOVIE
  // =====================================================

  useEffect(() => {
    async function fetchMovie() {
      try {
        setLoading(true);
        setError(null);

        if (
          !Number.isInteger(movieId) ||
          movieId <= 0
        ) {
          throw new Error("Invalid movie ID");
        }

        const data = await getMovieById(movieId);

        console.log("🎬 MOVIE DETAIL:", data);

        setMovie(data);
      } catch (error) {
        console.error(
          "GET MOVIE DETAIL ERROR:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to get movie"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchMovie();
  }, [movieId]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <Text className="text-zinc-400">
          Loading movie...
        </Text>
      </View>
    );
  }

  // =====================================================
  // ERROR / NOT FOUND
  // =====================================================

  if (error || !movie) {
    return (
      <View className="flex-1 items-center justify-center bg-black px-10">
        <Text className="text-xl font-bold text-white">
          Movie not found
        </Text>

        <Text className="mt-2 text-center text-zinc-500">
          {error || "Movie does not exist"}
        </Text>

        <Pressable
          onPress={() => router.back()}
          className="mt-5 rounded-xl bg-zinc-800 px-5 py-3"
        >
          <Text className="font-semibold text-white">
            Go Back
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <ScrollView
        showsVerticalScrollIndicator={false}
      >
        {/* =====================================================
            HERO
        ====================================================== */}

        <View className="relative h-[500px]">
          {/* BACKDROP */}

          {movie.image ? (
            <Image
              source={{
                uri: movie.image,
              }}
              className="absolute inset-0 h-full w-full"
              resizeMode="cover"
            />
          ) : (
            <View className="absolute inset-0 items-center justify-center bg-zinc-900">
              <Text className="text-zinc-600">
                No Movie Image
              </Text>
            </View>
          )}

          {/* OVERLAY */}

          <View className="absolute inset-0 bg-black/50" />

          <View className="absolute inset-x-0 bottom-0 h-64 bg-black/80" />

          {/* BACK BUTTON */}

          <Pressable
            onPress={() => router.back()}
            className="absolute left-8 top-8 rounded-full bg-black/60 p-3"
          >
            <ArrowLeft
              size={22}
              color="white"
            />
          </Pressable>

          {/* HERO CONTENT */}

          <View className="absolute bottom-10 left-10 right-10">
            <Text className="text-5xl font-bold text-white">
              {movie.title}
            </Text>

            {/* META */}

            <View className="mt-4 flex-row items-center gap-5">
              {/* RATING */}

              {movie.rating !== null &&
                movie.rating !== undefined && (
                  <View className="flex-row items-center gap-2">
                    <Star
                      size={18}
                      color="#FACC15"
                      fill="#FACC15"
                    />

                    <Text className="font-semibold text-white">
                      {movie.rating}
                    </Text>
                  </View>
                )}

              {/* YEAR */}

              <View className="flex-row items-center gap-2">
                <Calendar
                  size={17}
                  color="#A1A1AA"
                />

                <Text className="text-zinc-300">
                  {movie.releaseYear}
                </Text>
              </View>

              {/* GENRE */}

              <Text className="text-zinc-300">
                {movie.genre}
              </Text>
            </View>

            {/* PLAY */}

            <Pressable className="mt-6 flex-row w-40 items-center justify-center gap-2 rounded-xl bg-white py-3">
              <Play
                size={18}
                color="black"
                fill="black"
              />

              <Text className="font-bold text-black">
                Play
              </Text>
            </Pressable>
          </View>
        </View>

        {/* =====================================================
            MAIN CONTENT
        ====================================================== */}

        <View className="px-10 py-10">
          {/* DESCRIPTION */}

          <View className="max-w-4xl">
            <Text className="text-2xl font-bold text-white">
              Overview
            </Text>

            <Text className="mt-4 text-base leading-7 text-zinc-400">
              {movie.description ||
                "No description available."}
            </Text>
          </View>

          {/* =====================================================
              DIRECTOR
          ====================================================== */}

          {movie.director && (
            <View className="mt-12">
              <Text className="text-2xl font-bold text-white">
                Director
              </Text>

              <View className="mt-5 flex-row items-center">
                {/* DIRECTOR IMAGE */}

                <View className="h-20 w-20 overflow-hidden rounded-full bg-zinc-800">
                  {movie.director.image ? (
                    <Image
                      source={{
                        uri: movie.director.image,
                      }}
                      className="h-full w-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="flex-1 items-center justify-center">
                      <User
                        size={30}
                        color="#71717A"
                      />
                    </View>
                  )}
                </View>

                {/* DIRECTOR INFO */}

                <View className="ml-5">
                  <Text className="text-lg font-bold text-white">
                    {movie.director.name}
                  </Text>

                  <Text className="mt-1 text-zinc-500">
                    Director
                  </Text>

                  {movie.director.age !== null &&
                    movie.director.age !==
                      undefined && (
                      <Text className="mt-1 text-sm text-zinc-600">
                        Age: {movie.director.age}
                      </Text>
                    )}
                </View>
              </View>
            </View>
          )}

          {/* =====================================================
              CAST
          ====================================================== */}

          <View className="mt-12">
            <Text className="text-2xl font-bold text-white">
              Cast
            </Text>

            {movie.actors &&
            movie.actors.length > 0 ? (
              <View className="mt-5 flex-row flex-wrap gap-6">
                {movie.actors.map((actor) => (
                  <View
                    key={actor.id}
                    className="w-40"
                  >
                    {/* ACTOR IMAGE */}

                    <View className="h-52 overflow-hidden rounded-xl bg-zinc-800">
                      {actor.image ? (
                        <Image
                          source={{
                            uri: actor.image,
                          }}
                          className="h-full w-full"
                          resizeMode="cover"
                        />
                      ) : (
                        <View className="flex-1 items-center justify-center">
                          <User
                            size={40}
                            color="#71717A"
                          />
                        </View>
                      )}
                    </View>

                    {/* ACTOR INFO */}

                    <Text
                      numberOfLines={1}
                      className="mt-3 font-semibold text-white"
                    >
                      {actor.name}
                    </Text>

                    <Text className="mt-1 text-sm text-zinc-500">
                      Actor
                    </Text>

                    {actor.age !== null &&
                      actor.age !== undefined && (
                        <Text className="mt-1 text-xs text-zinc-600">
                          Age: {actor.age}
                        </Text>
                      )}
                  </View>
                ))}
              </View>
            ) : (
              <Text className="mt-5 text-zinc-500">
                No cast available.
              </Text>
            )}
          </View>

          {/* =====================================================
              EXTRA INFORMATION
          ====================================================== */}

          <View className="mt-14 border-t border-zinc-800 pt-8">
            <Text className="text-sm text-zinc-500">
              Genre
            </Text>

            <Text className="mt-2 text-white">
              {movie.genre}
            </Text>

            <Text className="mt-6 text-sm text-zinc-500">
              Release Year
            </Text>

            <Text className="mt-2 text-white">
              {movie.releaseYear}
            </Text>

            {movie.rating !== null &&
              movie.rating !== undefined && (
                <>
                  <Text className="mt-6 text-sm text-zinc-500">
                    Rating
                  </Text>

                  <Text className="mt-2 text-white">
                    {movie.rating}
                  </Text>
                </>
              )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}