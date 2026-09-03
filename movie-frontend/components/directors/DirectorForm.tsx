import { useEffect, useState } from "react";

import * as ImagePicker from "expo-image-picker";

import {
  ImagePlus,
  X,
} from "lucide-react-native";

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
  createDirector,
  updateDirector,
  type Director,
} from "@/services/DirectorService";

type DirectorImage = {
  uri: string;
  name: string;
  type: string;
};

type DirectorFormProps = {
  visible: boolean;
  director?: Director | null;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function DirectorForm({
  visible,
  director,
  onClose,
  onSuccess,
}: DirectorFormProps) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");

  // Image lama
  const [image, setImage] =
    useState<string | null>(null);

  // Image baru yang dipilih
  const [newImage, setNewImage] =
    useState<DirectorImage | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const isEdit = !!director;

  // =====================================================
  // LOAD FORM DATA
  // =====================================================

  useEffect(() => {
    if (!visible) return;

    if (director) {
      // EDIT
      setName(director.name);
      setAge(
        director.age !== null &&
        director.age !== undefined
          ? String(director.age)
          : ""
      );

      setImage(
        director.image ?? null
      );

      setNewImage(null);
      setError("");
    } else {
      // CREATE
      resetForm();
    }
  }, [visible, director]);

  // =====================================================
  // RESET
  // =====================================================

  const resetForm = () => {
    setName("");
    setAge("");
    setImage(null);
    setNewImage(null);
    setError("");
  };

  // =====================================================
  // PICK IMAGE
  // =====================================================

  const pickImage = async () => {
    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes:
          ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];

    const extension =
      asset.fileName?.split(".").pop() ||
      "jpg";

    setNewImage({
      uri: asset.uri,
      name:
        asset.fileName ||
        `director-${Date.now()}.${extension}`,
      type:
        asset.mimeType ||
        "image/jpeg",
    });

    // Preview image baru
    setImage(asset.uri);
  };

  // =====================================================
  // SAVE
  // =====================================================

  const handleSave = async () => {
    setError("");

    // ===================================================
    // VALIDATION
    // ===================================================

    if (!name.trim()) {
      setError(
        "Director name is required"
      );
      return;
    }

    if (!age.trim()) {
      setError("Age is required");
      return;
    }

    const parsedAge = Number(age);

    if (
      !Number.isInteger(parsedAge) ||
      parsedAge <= 0
    ) {
      setError(
        "Age must be a valid number"
      );
      return;
    }

    try {
      setLoading(true);

      // =================================================
      // EDIT
      // =================================================

      if (isEdit && director) {
        console.log(
          "✏️ UPDATE DIRECTOR:",
          director.id
        );

        await updateDirector(
          director.id,
          {
            name: name.trim(),
            age: parsedAge,
            image: newImage,
          }
        );
      }

      // =================================================
      // CREATE
      // =================================================

      else {
        console.log(
          "➕ CREATE DIRECTOR"
        );

        await createDirector({
          name: name.trim(),
          age: parsedAge,
          image: newImage,
        });
      }

      // =================================================
      // SUCCESS
      // =================================================

      resetForm();

      onSuccess?.();

      onClose();
    } catch (error) {
      console.error(
        isEdit
          ? "UPDATE DIRECTOR ERROR:"
          : "CREATE DIRECTOR ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : isEdit
            ? "Failed to update director"
            : "Failed to create director"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CLOSE
  // =====================================================

  const handleClose = () => {
    if (loading) return;

    resetForm();

    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View className="flex-1 items-center justify-center bg-black/70 p-5">

        <View className="w-full max-w-xl rounded-2xl border border-zinc-800 bg-zinc-950 p-8">

          {/* =================================================
              HEADER
          ================================================== */}

          <View className="flex-row items-center justify-between">

            <View>

              <Text className="text-2xl font-bold text-white">
                {isEdit
                  ? "Edit Director"
                  : "Add Director"}
              </Text>

              <Text className="mt-1 text-zinc-400">
                {isEdit
                  ? "Update director information"
                  : "Add a new movie director"}
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

          <View className="mt-8 gap-5">

            {/* =================================================
                ERROR
            ================================================== */}

            {error ? (
              <View className="rounded-xl border border-red-500/30 bg-red-500/10 p-3">

                <Text className="text-sm text-red-400">
                  {error}
                </Text>

              </View>
            ) : null}

            {/* =================================================
                IMAGE
            ================================================== */}

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

            </View>

            {/* =================================================
                NAME
            ================================================== */}

            <View>

              <Text className="mb-2 text-zinc-300">
                Director Name
              </Text>

              <TextInput
                value={name}
                onChangeText={setName}
                editable={!loading}
                placeholder="Example: Christopher Nolan"
                placeholderTextColor="#71717A"
                className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-4 text-white"
              />

            </View>

            {/* =================================================
                AGE
            ================================================== */}

            <View>

              <Text className="mb-2 text-zinc-300">
                Age
              </Text>

              <TextInput
                value={age}
                onChangeText={setAge}
                editable={!loading}
                placeholder="Example: 55"
                keyboardType="numeric"
                placeholderTextColor="#71717A"
                className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-4 text-white"
              />

            </View>

          </View>

          {/* =================================================
              FOOTER
          ================================================== */}

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
                    ? "Update Director"
                    : "Save Director"}
                </Text>
              )}

            </Pressable>

          </View>

        </View>

      </View>
    </Modal>
  );
}