import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";

import {
    Plus,
    Search,
} from "lucide-react-native";

import {
    useCallback,
    useEffect,
    useState,
} from "react";

import MovieForm from "./MoiveForms";
import MovieCard from "./MovieCard";

import {
    getMovies,
    Movie,
} from "../../services/MovieService";

export default function Movies() {
  // =====================================================
  // STATE
  // =====================================================

  const [movies, setMovies] =
    useState<Movie[]>([]);

  const [search, setSearch] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  // Movie yang sedang diedit
  const [selectedMovie, setSelectedMovie] =
    useState<Movie | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  // =====================================================
  // LOAD MOVIES
  // =====================================================

  const loadMovies = useCallback(
    async () => {
      try {
        setError("");

        const data =
          await getMovies();

        setMovies(data);
      } catch (error) {
        console.error(error);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load movies"
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadMovies();
  }, [loadMovies]);

  // =====================================================
  // REFRESH
  // =====================================================

  async function handleRefresh() {
    setRefreshing(true);

    await loadMovies();
  }

  // =====================================================
  // ADD MOVIE
  // =====================================================

  function handleAddMovie() {
    // Penting:
    // Add Movie = tidak ada movie yang dipilih

    setSelectedMovie(null);

    setShowForm(true);
  }

  // =====================================================
  // EDIT MOVIE
  // =====================================================

  function handleEditMovie(
    movie: Movie
  ) {
    console.log(
      "✏️ EDIT MOVIE:",
      movie
    );

    setSelectedMovie(movie);

    setShowForm(true);
  }

  // =====================================================
  // DELETE SUCCESS
  // =====================================================

  function handleDeleteMovie(
    deletedMovie: Movie
  ) {
    // Langsung hilangkan dari UI
    // tanpa perlu fetch ulang

    setMovies((currentMovies) =>
      currentMovies.filter(
        (movie) =>
          movie.id !== deletedMovie.id
      )
    );
  }

  // =====================================================
  // FORM SUCCESS
  // =====================================================

  async function handleFormSuccess() {
    // Setelah create / update
    // ambil data terbaru

    await loadMovies();

    setSelectedMovie(null);
  }

  // =====================================================
  // FILTER
  // =====================================================

  const filteredMovies =
    movies.filter((movie) => {
      const keyword =
        search.toLowerCase();

      return (
        movie.title
          .toLowerCase()
          .includes(keyword) ||
        movie.genre
          .toLowerCase()
          .includes(keyword)
      );
    });

  return (
    <View className="flex-1 bg-black">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <View className="flex-row items-center justify-between px-6 pb-5 pt-10">

        <View>

          <Text className="text-3xl font-bold text-white">
            Movies
          </Text>

          <Text className="mt-2 text-zinc-500">
            Manage all your movies here
          </Text>

        </View>

        <Pressable
          onPress={handleAddMovie}
          className="flex-row items-center gap-2 rounded-xl bg-red-600 px-5 py-3"
        >

          <Plus
            size={20}
            color="white"
          />

          <Text className="font-semibold text-white">
            Add Movie
          </Text>

        </Pressable>

      </View>

      {/* =====================================================
          SEARCH
      ====================================================== */}

      <View className="mx-6 flex-row items-center rounded-xl border border-zinc-800 bg-zinc-900 px-4">

        <Search
          size={20}
          color="#A1A1AA"
        />

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search movies..."
          placeholderTextColor="#71717A"
          className="flex-1 px-3 py-4 text-white"
        />

      </View>

      {/* =====================================================
          ERROR
      ====================================================== */}

      {error ? (
        <View className="mx-6 mt-5 rounded-xl border border-red-900 bg-red-950 p-4">

          <Text className="text-red-400">
            {error}
          </Text>

          <Pressable
            onPress={loadMovies}
            className="mt-3 self-start rounded-lg bg-red-900 px-4 py-2"
          >

            <Text className="text-white">
              Retry
            </Text>

          </Pressable>

        </View>
      ) : null}

      {/* =====================================================
          CONTENT
      ====================================================== */}

      {loading ? (
        <View className="flex-1 items-center justify-center">

          <ActivityIndicator
            size="large"
            color="white"
          />

          <Text className="mt-4 text-zinc-500">
            Loading movies...
          </Text>

        </View>
      ) : (
        <ScrollView
          className="mt-6"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="white"
            />
          }
        >

          {/* =====================================================
              GRID
          ====================================================== */}

          <View className="flex-row flex-wrap gap-6 px-6 pb-10">

            {filteredMovies.length === 0 ? (

              <View className="w-full items-center py-20">

                <Text className="text-xl font-bold text-white">
                  No movies found
                </Text>

                <Text className="mt-2 text-zinc-500">
                  {search
                    ? "Try another search"
                    : "Add your first movie"}
                </Text>

              </View>

            ) : (

              filteredMovies.map(
                (movie) => (

                  <MovieCard
                    key={movie.id}

                    movie={movie}

                    // =========================
                    // EDIT
                    // =========================

                    onEdit={handleEditMovie}

                    // =========================
                    // DELETE
                    // =========================

                    onDelete={
                      handleDeleteMovie
                    }
                  />

                )
              )

            )}

          </View>

        </ScrollView>
      )}

      {/* =====================================================
          MOVIE FORM
      ====================================================== */}

      <MovieForm
        visible={showForm}

        // Movie null = CREATE
        // Movie ada = EDIT
        movie={selectedMovie}

        onClose={() => {
          setShowForm(false);

          setSelectedMovie(null);
        }}

        onSuccess={
          handleFormSuccess
        }
      />

    </View>
  );
}