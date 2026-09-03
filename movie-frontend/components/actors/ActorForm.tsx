import { useEffect, useState } from "react";

import * as ImagePicker from "expo-image-picker";

import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  ImagePlus,
  X,
} from "lucide-react-native";

import {
  createActor,
  updateActor,
  type Actor,
  type ActorImage,
} from "@/services/ActorService";

type ActorFormProps = {
  visible: boolean;
  actor?: Actor | null;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function ActorForm({
  visible,
  actor,
  onClose,
  onSuccess,
}: ActorFormProps) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");

  const [image, setImage] =
    useState<string | null>(null);

  const [newImage, setNewImage] =
    useState<ActorImage | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const isEdit = !!actor;

  // ========================================
  // LOAD DATA WHEN FORM OPENS
  // ========================================

  useEffect(() => {
    if (!visible) return;

    if (actor) {
      console.log(
        "✏️ LOAD ACTOR TO FORM:",
        actor
      );

      setName(actor.name);

      setAge(
        actor.age !== null &&
          actor.age !== undefined
          ? String(actor.age)
          : ""
      );

      setImage(actor.image ?? null);

      setNewImage(null);

      setError("");
    } else {
      resetForm();
    }
  }, [visible, actor]);

  // ========================================
  // RESET FORM
  // ========================================

  const resetForm = () => {
    setName("");
    setAge("");
    setImage(null);
    setNewImage(null);
    setError("");
  };

  // ========================================
  // PICK IMAGE
  // ========================================

  const pickImage = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setError(
        "Permission to access gallery is required"
      );
      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes:
          ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

    if (result.canceled) return;

    const asset = result.assets[0];

    const extension =
      asset.fileName
        ?.split(".")
        .pop() || "jpg";

    const selectedImage: ActorImage = {
      uri: asset.uri,
      name:
        asset.fileName ||
        `actor-${Date.now()}.${extension}`,
      type:
        asset.mimeType ||
        "image/jpeg",
    };

    setNewImage(selectedImage);

    setImage(asset.uri);

    setError("");
  };

  // ========================================
  // SAVE
  // ========================================

  const handleSave = async () => {
    setError("");

    // NAME
    if (!name.trim()) {
      setError("Actor name is required");
      return;
    }

    // AGE
    if (!age.trim()) {
      setError("Age is required");
      return;
    }

    const parsedAge = Number(age);

    if (
      !Number.isInteger(parsedAge) ||
      parsedAge <= 0
    ) {
      setError("Age must be a valid number");
      return;
    }

    try {
      setLoading(true);

      // ========================================
      // UPDATE
      // ========================================

      if (isEdit && actor) {
        console.log(
          "✏️ UPDATE ACTOR:",
          actor.id
        );

        await updateActor(actor.id, {
          name: name.trim(),
          age: parsedAge,
          image: newImage,
        });

        console.log(
          "✅ ACTOR UPDATED"
        );
      }

      // ========================================
      // CREATE
      // ========================================

      else {
        console.log(
          "➕ CREATE ACTOR"
        );

        await createActor({
          name: name.trim(),
          age: parsedAge,
          image: newImage,
        });

        console.log(
          "✅ ACTOR CREATED"
        );
      }

      resetForm();

      onSuccess?.();

      onClose();
    } catch (error) {
      console.error(
        isEdit
          ? "❌ UPDATE ACTOR ERROR:"
          : "❌ CREATE ACTOR ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : isEdit
            ? "Failed to update actor"
            : "Failed to create actor"
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // CLOSE
  // ========================================

  const handleClose = () => {
    if (loading) return;

    resetForm();

    onClose();
  };

  // ========================================
  // UI
  // ========================================

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View className="flex-1 items-center justify-center bg-black/70 p-5">

        <View className="w-full max-w-xl rounded-2xl border border-zinc-800 bg-zinc-950 p-8">

          {/* HEADER */}

          <View className="flex-row items-center justify-between">

            <View>
              <Text className="text-2xl font-bold text-white">
                {isEdit
                  ? "Edit Actor"
                  : "Add Actor"}
              </Text>

              <Text className="mt-1 text-zinc-400">
                {isEdit
                  ? "Update actor information"
                  : "Add a new movie actor"}
              </Text>
            </View>

            <Pressable
              onPress={handleClose}
              disabled={loading}
              className="rounded-lg bg-zinc-800 p-2"
            >
              <X
                size={20}
                color="white"
              />
            </Pressable>

          </View>

          {/* FORM */}

          <View className="mt-8 gap-5">

            {/* ERROR */}

            {error ? (
              <View className="rounded-xl border border-red-500/30 bg-red-500/10 p-3">
                <Text className="text-sm text-red-400">
                  {error}
                </Text>
              </View>
            ) : null}

            {/* IMAGE */}

            <View>

              <Text className="mb-2 text-zinc-300">
                Profile Image
              </Text>

              <Pressable
                onPress={pickImage}
                disabled={loading}
                className="h-52 items-center justify-center overflow-hidden rounded-xl border border-dashed border-zinc-700 bg-zinc-900"
              >

                {image ? (
                  <Image
                    source={{
                      uri: image,
                    }}
                    className="h-full w-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="items-center">

                    <View className="rounded-full bg-zinc-800 p-4">

                      <ImagePlus
                        size={28}
                        color="#A1A1AA"
                      />

                    </View>

                    <Text className="mt-3 font-medium text-white">
                      Upload Profile Image
                    </Text>

                  </View>
                )}

              </Pressable>

              {isEdit && image ? (
                <Text className="mt-2 text-xs text-zinc-500">
                  Click the image to replace it
                </Text>
              ) : null}

            </View>

            {/* NAME */}

            <View>

              <Text className="mb-2 text-zinc-300">
                Actor Name
              </Text>

              <TextInput
                value={name}
                onChangeText={setName}
                editable={!loading}
                placeholder="Example: Leonardo DiCaprio"
                placeholderTextColor="#71717A"
                className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-4 text-white"
              />

            </View>

            {/* AGE */}

            <View>

              <Text className="mb-2 text-zinc-300">
                Age
              </Text>

              <TextInput
                value={age}
                onChangeText={setAge}
                editable={!loading}
                placeholder="Example: 51"
                keyboardType="numeric"
                placeholderTextColor="#71717A"
                className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-4 text-white"
              />

            </View>

          </View>

          {/* FOOTER */}

          <View className="mt-8 flex-row justify-end gap-3">

            <Pressable
              onPress={handleClose}
              disabled={loading}
              className="rounded-xl bg-zinc-800 px-5 py-3"
            >
              <Text className="font-semibold text-white">
                Cancel
              </Text>
            </Pressable>

            <Pressable
              onPress={handleSave}
              disabled={loading}
              className="flex-row items-center justify-center rounded-xl bg-red-600 px-5 py-3"
            >

              {loading ? (
                <ActivityIndicator
                  size="small"
                  color="white"
                />
              ) : (
                <Text className="font-semibold text-white">
                  {isEdit
                    ? "Update Actor"
                    : "Save Actor"}
                </Text>
              )}

            </Pressable>

          </View>

        </View>

      </View>
    </Modal>
  );
}