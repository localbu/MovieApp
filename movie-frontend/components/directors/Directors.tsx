import { useEffect, useState } from "react";

import {
    Plus,
    Search,
} from "lucide-react-native";

import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";

import DirectorCard from "./DirectorCard";
import DirectorForm from "./DirectorForm";

import {
    getDirectors,
    type Director,
} from "@/services/DirectorService";

export default function Directors() {
  const [directors, setDirectors] = useState<Director[]>([]);

  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedDirector, setSelectedDirector] =
    useState<Director | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const loadDirectors = async () => {
    console.log("📡 MULAI LOAD DIRECTORS");

    try {
      setLoading(true);
      setError("");

      const data = await getDirectors();

      console.log("✅ DATA DARI BACKEND:", data);

      setDirectors(data);
    } catch (error) {
      console.error("❌ GET DIRECTORS ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load directors"
      );
    } finally {
      setLoading(false);

      console.log("🏁 LOAD DIRECTORS SELESAI");
    }
  };

  useEffect(() => {
    loadDirectors();
  }, []);

  const filteredDirectors = directors.filter((director) =>
    director.name
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const handleAddDirector = () => {
    console.log("➕ OPEN ADD DIRECTOR FORM");

    setSelectedDirector(null);
    setIsModalOpen(true);
  };

  const handleEditDirector = (director: Director) => {
    console.log("✏️ OPEN EDIT DIRECTOR:", director);

    setSelectedDirector(director);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    console.log("🗑️ DELETE DIRECTOR:", id);

    setDirectors((currentDirectors) =>
      currentDirectors.filter(
        (director) => director.id !== id
      )
    );
  };

  const handleFormSuccess = async () => {
    console.log("🔄 DIRECTOR FORM SUCCESS → RELOAD DATA");

    await loadDirectors();

    setSelectedDirector(null);
  };

  const handleCloseForm = () => {
    console.log("❌ CLOSE DIRECTOR FORM");

    setIsModalOpen(false);
    setSelectedDirector(null);
  };

  return (
    <View className="flex-1 p-10">

      {/* HEADER */}

      <View className="flex-row items-center justify-between">

        <View>
          <Text className="text-4xl font-bold text-white">
            Directors
          </Text>

          <Text className="mt-2 text-zinc-400">
            Manage movie directors
          </Text>
        </View>

        <Pressable
          onPress={handleAddDirector}
          className="flex-row items-center gap-2 rounded-xl bg-red-600 px-5 py-3"
        >
          <Plus
            size={20}
            color="white"
          />

          <Text className="font-semibold text-white">
            Add Director
          </Text>
        </Pressable>

      </View>

      {/* SEARCH */}

      <View className="mt-8 flex-row items-center rounded-xl border border-zinc-800 bg-zinc-900 px-4">

        <Search
          size={20}
          color="#A1A1AA"
        />

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search directors..."
          placeholderTextColor="#71717A"
          className="flex-1 px-3 py-4 text-white"
        />

      </View>

      {/* ERROR */}

      {error ? (
        <View className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4">

          <Text className="text-red-400">
            {error}
          </Text>

          <Pressable
            onPress={loadDirectors}
            className="mt-3 self-start rounded-lg bg-red-600 px-4 py-2"
          >
            <Text className="font-semibold text-white">
              Retry
            </Text>
          </Pressable>

        </View>
      ) : null}

      {/* DIRECTOR GRID */}

      <ScrollView
        className="mt-8"
        showsVerticalScrollIndicator={false}
      >

        {loading ? (
          <View className="items-center py-20">

            <ActivityIndicator
              size="large"
              color="#EF4444"
            />

            <Text className="mt-4 text-zinc-500">
              Loading directors...
            </Text>

          </View>
        ) : filteredDirectors.length === 0 ? (
          <View className="items-center py-20">

            <Text className="text-lg font-semibold text-white">
              No directors found
            </Text>

            <Text className="mt-2 text-zinc-500">
              {search
                ? "Try another search"
                : "No directors available"}
            </Text>

          </View>
        ) : (
          <View className="flex-row flex-wrap gap-6">

            {filteredDirectors.map((director) => (
              <DirectorCard
                key={director.id}
                director={director}
                onEdit={handleEditDirector}
                onDelete={(director) => {
                  handleDelete(director.id);
                }}
              />
            ))}

          </View>
        )}

      </ScrollView>

      {/* FORM */}

      <DirectorForm
        visible={isModalOpen}
        director={selectedDirector}
        onClose={handleCloseForm}
        onSuccess={handleFormSuccess}
      />

    </View>
  );
}