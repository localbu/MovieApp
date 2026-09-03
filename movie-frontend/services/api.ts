const API_URL = "http://YOUR_IP:3000/api";

export async function uploadImage(uri: string) {
  const formData = new FormData();

  const filename = uri.split("/").pop() || "image.jpg";
  const extension = filename.split(".").pop();

  formData.append("file", {
    uri,
    name: filename,
    type: `image/${extension}`,
  } as any);

  const response = await fetch(`${API_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload image");
  }

  return response.json();
}