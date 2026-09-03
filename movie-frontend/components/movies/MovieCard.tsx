import {
    ChevronRight,
    Pencil,
    Star,
    Trash2,
} from "lucide-react-native";

import {
    Image,
    Pressable,
    Text,
    View,
} from "react-native";

import { router } from "expo-router";

import {
    deleteMovie,
    type Movie,
} from "@/services/MovieService";

type MovieCardProps = {
  movie: Movie;

  onEdit: (movie: Movie) => void;
  onDelete?: (movie: Movie) => void;
};

export default function MovieCard({
  movie,
  onEdit,
  onDelete,
}: MovieCardProps) {
  // =====================================================
  // DETAIL
  // =====================================================

  function handleDetail() {
    router.push(`/movie/${movie.id}`);
  }

  // =====================================================
  // DELETE
  // =====================================================

  async function handleDelete() {
    console.log("🗑️ DELETE CLICKED");
    console.log("MOVIE ID:", movie.id);

    try {
      await deleteMovie(movie.id);

      console.log(
        "✅ MOVIE DELETED:",
        movie.id
      );

      onDelete?.(movie);
    } catch (error) {
      console.error(
        "❌ DELETE MOVIE ERROR:",
        error
      );
    }
  }

  return (
    <View className="mb-0 w-[300px] overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">

      {/* IMAGE */}

      <Pressable onPress={handleDetail}>
        <View className="h-64 w-full bg-zinc-800">
          {movie.image ? (
            <Image
              source={{
                uri: movie.image,
              }}
              className="h-full w-full"
              resizeMode="cover"
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Text className="text-zinc-500">
                No Image
              </Text>
            </View>
          )}
        </View>
      </Pressable>

      {/* CONTENT */}

      <View className="p-5">

        {/* TITLE */}

        <Text
          className="text-xl font-bold text-white"
          numberOfLines={1}
        >
          {movie.title}
        </Text>

        {/* META */}

        <View className="mt-2 flex-row items-center">

          <Text className="text-sm text-zinc-400">
            {movie.genre}
          </Text>

          {movie.rating !== null &&
            movie.rating !== undefined && (
              <>
                <Text className="mx-2 text-zinc-600">
                  •
                </Text>

                <View className="flex-row items-center">

                  <Star
                    size={15}
                    color="#facc15"
                    fill="#facc15"
                  />

                  <Text className="ml-1 text-sm text-zinc-300">
                    {movie.rating}
                  </Text>

                </View>
              </>
            )}

        </View>

        {/* DETAIL */}

        <Pressable
          onPress={handleDetail}
          className="mt-5 flex-row items-center justify-center rounded-xl bg-white py-3"
        >
          <Text className="font-semibold text-black">
            View Details
          </Text>

          <ChevronRight
            size={18}
            color="#000"
          />
        </Pressable>

        {/* ACTION */}

        <View className="mt-3 flex-row gap-3">

          {/* EDIT */}

          <Pressable
            onPress={() => onEdit(movie)}
            className="flex-1 flex-row items-center justify-center rounded-xl border border-zinc-700 py-3"
          >
            <Pencil
              size={17}
              color="white"
            />

            <Text className="ml-2 text-white">
              Edit
            </Text>
          </Pressable>

          {/* DELETE */}

          <Pressable
            onPress={handleDelete}
            className="flex-1 flex-row items-center justify-center rounded-xl border border-red-900 py-3"
          >
            <Trash2
              size={17}
              color="#ef4444"
            />

            <Text className="ml-2 text-red-500">
              Delete
            </Text>
          </Pressable>

        </View>

      </View>

    </View>
  );
}