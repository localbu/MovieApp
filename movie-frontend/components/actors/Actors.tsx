import { useEffect, useState } from "react";

import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";

import {
    Plus,
    Search,
} from "lucide-react-native";

import ActorCard from "./ActorCard";
import ActorForm from "./ActorForm";

import {
    getActors,
    type Actor,
} from "@/services/ActorService";

export default function Actors() {
  const [actors, setActors] = useState<Actor[]>([]);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [selectedActor, setSelectedActor] =
    useState<Actor | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // =========================
  // GET ACTORS
  // =========================

  const loadActors = async () => {
    console.log("📡 MULAI LOAD ACTORS");

    try {
      setLoading(true);
      setError("");

      const data = await getActors();

      console.log(
        "✅ DATA DARI BACKEND:",
        data
      );

      setActors(data);
    } catch (error) {
      console.error(
        "❌ GET ACTORS ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load actors"
      );
    } finally {
      setLoading(false);

      console.log(
        "🏁 LOAD ACTORS SELESAI"
      );
    }
  };

  // =========================
  // LOAD SAAT PAGE DIBUKA
  // =========================

  useEffect(() => {
    console.log(
      "🚀 ACTORS PAGE DIBUKA"
    );

    loadActors();
  }, []);

  // =========================
  // SEARCH
  // =========================

  const filteredActors = actors.filter(
    (actor) =>
      actor.name
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  // =========================
  // ADD
  // =========================

  const handleAddActor = () => {
    console.log(
      "➕ OPEN ADD ACTOR FORM"
    );

    setSelectedActor(null);
    setIsModalOpen(true);
  };

  // =========================
  // EDIT
  // =========================

  const handleEditActor = (
    actor: Actor
  ) => {
    console.log(
      "✏️ OPEN EDIT ACTOR:",
      actor
    );

    setSelectedActor(actor);
    setIsModalOpen(true);
  };

  // =========================
  // DELETE
  // =========================

  const handleDelete = (
    id: number
  ) => {
    console.log(
      "🗑️ DELETE ACTOR:",
      id
    );

    setActors((currentActors) =>
      currentActors.filter(
        (actor) => actor.id !== id
      )
    );
  };

  // =========================
  // FORM SUCCESS
  // =========================

  const handleFormSuccess = async () => {
    console.log(
      "🔄 ACTOR FORM SUCCESS → RELOAD DATA"
    );

    await loadActors();

    setSelectedActor(null);
  };

  // =========================
  // CLOSE FORM
  // =========================

  const handleCloseForm = () => {
    console.log(
      "❌ CLOSE ACTOR FORM"
    );

    setIsModalOpen(false);
    setSelectedActor(null);
  };

  return (
    <View className="flex-1 p-10">

      {/* HEADER */}

      <View className="flex-row items-center justify-between">

        <View>
          <Text className="text-4xl font-bold text-white">
            Actors
          </Text>

          <Text className="mt-2 text-zinc-400">
            Manage movie actors
          </Text>
        </View>

        <Pressable
          onPress={handleAddActor}
          className="flex-row items-center gap-2 rounded-xl bg-red-600 px-5 py-3"
        >
          <Plus
            size={20}
            color="white"
          />

          <Text className="font-semibold text-white">
            Add Actor
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
          placeholder="Search actors..."
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
            onPress={loadActors}
            className="mt-3 self-start rounded-lg bg-red-600 px-4 py-2"
          >
            <Text className="font-semibold text-white">
              Retry
            </Text>
          </Pressable>

        </View>
      ) : null}

      {/* ACTOR GRID */}

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
              Loading actors...
            </Text>

          </View>
        ) : filteredActors.length === 0 ? (
          <View className="items-center py-20">

            <Text className="text-lg font-semibold text-white">
              No actors found
            </Text>

            <Text className="mt-2 text-zinc-500">
              {search
                ? "Try another search"
                : "No actors available"}
            </Text>

          </View>
        ) : (
          <View className="flex-row flex-wrap gap-6">

            {filteredActors.map(
              (actor) => (
                <ActorCard
                  key={actor.id}
                  actor={actor}

                  onEdit={
                    handleEditActor
                  }

                  onDelete={(actor) => {
                    handleDelete(
                      actor.id
                    );
                  }}
                />
              )
            )}

          </View>
        )}

      </ScrollView>

      {/* FORM */}

      <ActorForm
        visible={isModalOpen}
        actor={selectedActor}

        onClose={
          handleCloseForm
        }

        onSuccess={
          handleFormSuccess
        }
      />

    </View>
  );
}