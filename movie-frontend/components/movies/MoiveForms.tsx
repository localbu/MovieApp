import {
    Check,
    ChevronDown,
    ImagePlus,
    X,
} from "lucide-react-native";

import * as ImagePicker from "expo-image-picker";

import {
    ActivityIndicator,
    Image,
    Modal,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";

import { useEffect, useState } from "react";

import {
    Actor,
    createMovie,
    Director,
    getActors,
    getDirectors,
    Movie,
    MovieImage,
    updateMovie,
} from "../../services/MovieService";

type MovieFormProps = {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  movie?: Movie | null;
};

export default function MovieForm({
  visible,
  onClose,
  onSuccess,
  movie,
}: MovieFormProps) {
  const isEdit = !!movie;

  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [releaseYear, setReleaseYear] =
    useState("");
  const [rating, setRating] = useState("");
  const [description, setDescription] =
    useState("");

  const [image, setImage] =
    useState<string | null>(null);

  const [newImage, setNewImage] =
    useState<MovieImage | null>(null);

  const [directors, setDirectors] = useState<
    Director[]
  >([]);

  const [actors, setActors] = useState<Actor[]>(
    []
  );

  const [selectedDirector, setSelectedDirector] =
    useState<number | null>(null);

  const [selectedActors, setSelectedActors] =
    useState<number[]>([]);

  const [showDirectorList, setShowDirectorList] =
    useState(false);

  const [showActorList, setShowActorList] =
    useState(false);

  const [loadingOptions, setLoadingOptions] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] = useState("");

  // ========================================
  // LOAD OPTIONS
  // ========================================

  useEffect(() => {
    if (visible) {
      loadOptions();
    }
  }, [visible]);

  // ========================================
  // LOAD MOVIE DATA FOR EDIT
  // ========================================

  useEffect(() => {
    if (!visible) return;

    if (movie) {
      setTitle(movie.title);
      setGenre(movie.genre);
      setReleaseYear(
        String(movie.releaseYear)
      );

      setRating(
        movie.rating !== null &&
        movie.rating !== undefined
          ? String(movie.rating)
          : ""
      );

      setDescription(
        movie.description ?? ""
      );

      setImage(movie.image ?? null);
      setNewImage(null);

      setSelectedDirector(
        movie.directorId
      );

      setSelectedActors(
        movie.actors?.map(
          (actor) => actor.id
        ) ?? []
      );
    } else {
      resetForm();
    }

    setError("");
  }, [visible, movie]);

  // ========================================
  // LOAD DIRECTORS & ACTORS
  // ========================================

  async function loadOptions() {
    try {
      setLoadingOptions(true);
      setError("");

      const [
        directorData,
        actorData,
      ] = await Promise.all([
        getDirectors(),
        getActors(),
      ]);

      setDirectors(directorData);
      setActors(actorData);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load options"
      );
    } finally {
      setLoadingOptions(false);
    }
  }

  // ========================================
  // PICK IMAGE
  // ========================================

  async function pickImage() {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setError(
        "Permission to access photos is required."
      );
      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [2, 3],
        quality: 0.8,
      });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];

    const extension =
      asset.fileName
        ?.split(".")
        .pop()
        ?.toLowerCase() ||
      asset.uri
        .split(".")
        .pop()
        ?.toLowerCase() ||
      "jpg";

    const mimeType =
      asset.mimeType ||
      (extension === "png"
        ? "image/png"
        : extension === "webp"
        ? "image/webp"
        : "image/jpeg");

    setImage(asset.uri);

    setNewImage({
      uri: asset.uri,
      name:
        asset.fileName ||
        `movie-${Date.now()}.${extension}`,
      type: mimeType,
    });
  }

  // ========================================
  // TOGGLE ACTOR
  // ========================================

  function toggleActor(id: number) {
    setSelectedActors((current) => {
      if (current.includes(id)) {
        return current.filter(
          (actorId) => actorId !== id
        );
      }

      return [...current, id];
    });
  }

  // ========================================
  // RESET FORM
  // ========================================

  function resetForm() {
    setTitle("");
    setGenre("");
    setReleaseYear("");
    setRating("");
    setDescription("");

    setImage(null);
    setNewImage(null);

    setSelectedDirector(null);
    setSelectedActors([]);

    setShowDirectorList(false);
    setShowActorList(false);

    setError("");
  }

  // ========================================
  // CLOSE
  // ========================================

  function handleClose() {
    if (loading) return;

    resetForm();
    onClose();
  }

  // ========================================
  // SUBMIT
  // ========================================

  async function handleSubmit() {
    setError("");

    // =========================
    // TITLE
    // =========================

    if (!title.trim()) {
      setError("Movie title is required");
      return;
    }

    // =========================
    // GENRE
    // =========================

    if (!genre.trim()) {
      setError("Genre is required");
      return;
    }

    // =========================
    // RELEASE YEAR
    // =========================

    if (!releaseYear.trim()) {
      setError("Release year is required");
      return;
    }

    const year = Number(releaseYear);

    if (
      Number.isNaN(year) ||
      !Number.isInteger(year)
    ) {
      setError(
        "Release year must be a valid number"
      );
      return;
    }

    // =========================
    // DIRECTOR
    // =========================

    if (!selectedDirector) {
      setError("Please select a director");
      return;
    }

    // =========================
    // RATING
    // =========================

    let movieRating:
      | number
      | undefined;

    if (rating.trim()) {
      movieRating = Number(rating);

      if (Number.isNaN(movieRating)) {
        setError("Rating must be a number");
        return;
      }
    }

    try {
      setLoading(true);

      if (isEdit && movie) {
        // =========================
        // UPDATE
        // =========================

        await updateMovie(movie.id, {
          title: title.trim(),

          genre: genre.trim(),

          releaseYear: year,

          rating: movieRating,

          description:
            description.trim() ||
            undefined,

          directorId: selectedDirector,

          actorIds: selectedActors,

          image: newImage,
        });
      } else {
        // =========================
        // CREATE
        // =========================

        await createMovie({
          title: title.trim(),

          genre: genre.trim(),

          releaseYear: year,

          rating: movieRating,

          description:
            description.trim() ||
            undefined,

          directorId: selectedDirector,

          actorIds: selectedActors,

          image: newImage,
        });
      }

      resetForm();

      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : isEdit
          ? "Failed to update movie"
          : "Failed to create movie"
      );
    } finally {
      setLoading(false);
    }
  }

  // ========================================
  // SELECTED DIRECTOR
  // ========================================

  const selectedDirectorData =
    directors.find(
      (director) =>
        director.id === selectedDirector
    );

  // ========================================
  // SELECTED ACTORS
  // ========================================

  const selectedActorData =
    actors.filter((actor) =>
      selectedActors.includes(actor.id)
    );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View className="flex-1 justify-end bg-black/70">
        <View className="max-h-[92%] rounded-t-3xl bg-zinc-950">

          {/* HEADER */}

          <View className="flex-row items-center justify-between border-b border-zinc-800 px-6 py-5">
            <View>
              <Text className="text-2xl font-bold text-white">
                {isEdit
                  ? "Edit Movie"
                  : "Add Movie"}
              </Text>

              <Text className="mt-1 text-sm text-zinc-500">
                {isEdit
                  ? "Update movie information"
                  : "Add a new movie to your collection"}
              </Text>
            </View>

            <Pressable
              onPress={handleClose}
              className="rounded-full bg-zinc-900 p-2"
            >
              <X
                size={20}
                color="#A1A1AA"
              />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            className="px-6"
            contentContainerStyle={{
              paddingTop: 24,
              paddingBottom: 40,
            }}
          >

            {/* ERROR */}

            {error ? (
              <View className="mb-5 rounded-xl border border-red-900 bg-red-950 px-4 py-3">
                <Text className="text-sm text-red-400">
                  {error}
                </Text>
              </View>
            ) : null}

            {/* LOADING OPTIONS */}

            {loadingOptions ? (
              <View className="mb-5 flex-row items-center rounded-xl bg-zinc-900 px-4 py-3">
                <ActivityIndicator
                  size="small"
                  color="white"
                />

                <Text className="ml-3 text-sm text-zinc-400">
                  Loading...
                </Text>
              </View>
            ) : null}

            {/* TITLE */}

            <Text className="mb-2 text-sm font-medium text-zinc-300">
              Movie Title
            </Text>

            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Enter movie title"
              placeholderTextColor="#71717A"
              className="mb-5 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-4 text-white"
            />

            {/* GENRE */}

            <Text className="mb-2 text-sm font-medium text-zinc-300">
              Genre
            </Text>

            <TextInput
              value={genre}
              onChangeText={setGenre}
              placeholder="Action, Drama, Sci-Fi..."
              placeholderTextColor="#71717A"
              className="mb-5 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-4 text-white"
            />

            {/* YEAR */}

            <Text className="mb-2 text-sm font-medium text-zinc-300">
              Release Year
            </Text>

            <TextInput
              value={releaseYear}
              onChangeText={setReleaseYear}
              placeholder="2026"
              placeholderTextColor="#71717A"
              keyboardType="numeric"
              className="mb-5 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-4 text-white"
            />

            {/* RATING */}

            <Text className="mb-2 text-sm font-medium text-zinc-300">
              Rating
            </Text>

            <TextInput
              value={rating}
              onChangeText={setRating}
              placeholder="8.5"
              placeholderTextColor="#71717A"
              keyboardType="decimal-pad"
              className="mb-5 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-4 text-white"
            />

            {/* DIRECTOR */}

            <Text className="mb-2 text-sm font-medium text-zinc-300">
              Director
            </Text>

            <Pressable
              onPress={() => {
                setShowDirectorList(
                  !showDirectorList
                );

                setShowActorList(false);
              }}
              className="mb-2 flex-row items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-4"
            >
              <Text
                className={
                  selectedDirectorData
                    ? "text-white"
                    : "text-zinc-500"
                }
              >
                {selectedDirectorData
                  ? selectedDirectorData.name
                  : "Select Director"}
              </Text>

              <ChevronDown
                size={20}
                color="#A1A1AA"
              />
            </Pressable>

            {showDirectorList ? (
              <View className="mb-5 max-h-52 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
                <ScrollView
                  nestedScrollEnabled
                  showsVerticalScrollIndicator={false}
                >
                  {directors.map(
                    (director) => {
                      const selected =
                        selectedDirector ===
                        director.id;

                      return (
                        <Pressable
                          key={director.id}
                          onPress={() => {
                            setSelectedDirector(
                              director.id
                            );

                            setShowDirectorList(
                              false
                            );
                          }}
                          className={`flex-row items-center justify-between border-b border-zinc-800 px-4 py-4 ${
                            selected
                              ? "bg-zinc-800"
                              : ""
                          }`}
                        >
                          <View>
                            <Text className="font-medium text-white">
                              {director.name}
                            </Text>

                            {director.age ? (
                              <Text className="mt-1 text-xs text-zinc-500">
                                Age{" "}
                                {director.age}
                              </Text>
                            ) : null}
                          </View>

                          {selected ? (
                            <Check
                              size={18}
                              color="white"
                            />
                          ) : null}
                        </Pressable>
                      );
                    }
                  )}
                </ScrollView>
              </View>
            ) : null}

            {/* ACTORS */}

            <Text className="mb-2 text-sm font-medium text-zinc-300">
              Actors
            </Text>

            <Pressable
              onPress={() => {
                setShowActorList(
                  !showActorList
                );

                setShowDirectorList(false);
              }}
              className="mb-2 flex-row items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-4"
            >
              <Text
                className={
                  selectedActors.length
                    ? "text-white"
                    : "text-zinc-500"
                }
              >
                {selectedActors.length
                  ? `${selectedActors.length} actor${
                      selectedActors.length >
                      1
                        ? "s"
                        : ""
                    } selected`
                  : "Select Actors"}
              </Text>

              <ChevronDown
                size={20}
                color="#A1A1AA"
              />
            </Pressable>

            {showActorList ? (
              <View className="mb-3 max-h-60 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
                <ScrollView
                  nestedScrollEnabled
                  showsVerticalScrollIndicator={false}
                >
                  {actors.map((actor) => {
                    const selected =
                      selectedActors.includes(
                        actor.id
                      );

                    return (
                      <Pressable
                        key={actor.id}
                        onPress={() =>
                          toggleActor(
                            actor.id
                          )
                        }
                        className={`flex-row items-center justify-between border-b border-zinc-800 px-4 py-4 ${
                          selected
                            ? "bg-zinc-800"
                            : ""
                        }`}
                      >
                        <View className="flex-row items-center">
                          {actor.image ? (
                            <Image
                              source={{
                                uri: actor.image,
                              }}
                              className="mr-3 h-10 w-10 rounded-full"
                            />
                          ) : (
                            <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-zinc-700">
                              <Text className="font-bold text-white">
                                {actor.name
                                  .charAt(0)
                                  .toUpperCase()}
                              </Text>
                            </View>
                          )}

                          <Text className="font-medium text-white">
                            {actor.name}
                          </Text>
                        </View>

                        {selected ? (
                          <View className="rounded-full bg-white p-1">
                            <Check
                              size={14}
                              color="black"
                            />
                          </View>
                        ) : null}
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            ) : null}

            {/* SELECTED ACTORS */}

            {selectedActorData.length >
            0 ? (
              <View className="mb-5 flex-row flex-wrap gap-2">
                {selectedActorData.map(
                  (actor) => (
                    <View
                      key={actor.id}
                      className="flex-row items-center rounded-full bg-zinc-800 px-3 py-2"
                    >
                      <Text className="text-sm text-white">
                        {actor.name}
                      </Text>

                      <Pressable
                        onPress={() =>
                          toggleActor(
                            actor.id
                          )
                        }
                        className="ml-2"
                      >
                        <X
                          size={14}
                          color="#A1A1AA"
                        />
                      </Pressable>
                    </View>
                  )
                )}
              </View>
            ) : null}

            {/* IMAGE */}

            <Text className="mb-2 text-sm font-medium text-zinc-300">
              Movie Poster
            </Text>

            <Pressable
              onPress={pickImage}
              className="mb-5 overflow-hidden rounded-xl border border-dashed border-zinc-700 bg-zinc-900"
            >
              {image ? (
                <View className="relative">
                  <Image
                    source={{
                      uri: image,
                    }}
                    className="h-72 w-full"
                    resizeMode="cover"
                  />

                  <View className="absolute bottom-0 left-0 right-0 bg-black/70 px-4 py-3">
                    <Text className="text-center font-medium text-white">
                      {isEdit
                        ? "Change Image"
                        : "Change Image"}
                    </Text>
                  </View>
                </View>
              ) : (
                <View className="items-center justify-center py-10">
                  <ImagePlus
                    size={30}
                    color="#71717A"
                  />

                  <Text className="mt-3 font-medium text-white">
                    Upload Movie Poster
                  </Text>

                  <Text className="mt-1 text-xs text-zinc-500">
                    PNG, JPG or WEBP
                  </Text>
                </View>
              )}
            </Pressable>

            {/* DESCRIPTION */}

            <Text className="mb-2 text-sm font-medium text-zinc-300">
              Description
            </Text>

            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Tell us about this movie..."
              placeholderTextColor="#71717A"
              multiline
              textAlignVertical="top"
              className="mb-6 min-h-[140px] rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-4 text-white"
            />

            {/* SUBMIT */}

            <Pressable
              disabled={loading}
              onPress={handleSubmit}
              className={`rounded-xl py-4 ${
                loading
                  ? "bg-zinc-700"
                  : "bg-red-600"
              }`}
            >
              {loading ? (
                <View className="flex-row items-center justify-center">
                  <ActivityIndicator
                    size="small"
                    color="white"
                  />

                  <Text className="ml-2 font-bold text-white">
                    {isEdit
                      ? "Updating..."
                      : "Creating..."}
                  </Text>
                </View>
              ) : (
                <Text className="text-center font-bold text-white">
                  {isEdit
                    ? "Update Movie"
                    : "Create Movie"}
                </Text>
              )}
            </Pressable>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}