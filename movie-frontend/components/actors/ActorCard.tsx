import {
  Pencil,
  Trash2,
  User,
} from "lucide-react-native";

import {
  Image,
  Pressable,
  Text,
  View,
} from "react-native";

import {
  deleteActor,
  type Actor,
} from "@/services/ActorService";

type ActorCardProps = {
  actor: Actor;
  onEdit: (actor: Actor) => void;
  onDelete?: (actor: Actor) => void;
};

export default function ActorCard({
  actor,
  onEdit,
  onDelete,
}: ActorCardProps) {
  async function handleDelete() {
    console.log("🗑️ DELETE ACTOR:", actor.id);

    try {
      await deleteActor(actor.id);

      console.log("✅ ACTOR DELETED:", actor.id);

      onDelete?.(actor);
    } catch (error) {
      console.error(
        "❌ DELETE ACTOR ERROR:",
        error
      );
    }
  }

  return (
    <View className="w-64 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
      {/* IMAGE */}
      <View className="h-64 items-center justify-center bg-zinc-800">
        {actor.image ? (
          <Image
            source={{ uri: actor.image }}
            className="h-full w-full"
            resizeMode="cover"
          />
        ) : (
          <View className="items-center">
            <User
              size={50}
              color="#71717A"
            />

            <Text className="mt-3 text-zinc-500">
              No Image
            </Text>
          </View>
        )}
      </View>

      {/* CONTENT */}
      <View className="p-5">
        <Text
          numberOfLines={1}
          className="text-xl font-bold text-white"
        >
          {actor.name}
        </Text>

        <Text className="mt-2 text-zinc-400">
          Age: {actor.age ?? "-"}
        </Text>

        {/* ACTION */}
        <View className="mt-5 flex-row gap-3">
          {/* EDIT */}
          <Pressable
            onPress={() => {
              console.log(
                "✏️ EDIT ACTOR CLICKED:",
                actor
              );

              onEdit(actor);
            }}
            className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-zinc-800 py-3"
          >
            <Pencil
              size={18}
              color="white"
            />

            <Text className="font-semibold text-white">
              Edit
            </Text>
          </Pressable>

          {/* DELETE */}
          <Pressable
            onPress={handleDelete}
            className="flex-row items-center justify-center rounded-xl bg-red-500/20 px-4"
          >
            <Trash2
              size={18}
              color="#EF4444"
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}