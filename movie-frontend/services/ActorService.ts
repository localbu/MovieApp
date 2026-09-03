const API_URL = "http://localhost:3000/api";
const SERVER_URL = "http://localhost:3000";

export type ActorImage = {
  uri: string;
  name: string;
  type: string;
};

export type Actor = {
  id: number;
  name: string;
  age?: number | null;
  image?: string | null;
};

export type CreateActorData = {
  name: string;
  age?: number;
  image?: ActorImage | null;
};

export type UpdateActorData = {
  name: string;
  age?: number;
  image?: ActorImage | null;
};

// ========================================
// IMAGE URL
// ========================================

function getImageUrl(
  image: string | null | undefined
): string | null {
  if (!image) {
    return null;
  }

  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  return `${SERVER_URL}${image}`;
}

// ========================================
// GET ACTORS
// ========================================

export async function getActors(): Promise<Actor[]> {
  const response = await fetch(`${API_URL}/actors`, {
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message || "Failed to get actors"
    );
  }

  const actors: Actor[] = Array.isArray(data)
    ? data
    : data.data ?? [];

  return actors.map((actor) => ({
    ...actor,
    image: getImageUrl(actor.image),
  }));
}

// ========================================
// GET ACTOR BY ID
// ========================================

export async function getActorById(
  id: number
): Promise<Actor> {
  const response = await fetch(
    `${API_URL}/actors/${id}`,
    {
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message || "Failed to get actor"
    );
  }

  return {
    ...data,
    image: getImageUrl(data.image),
  };
}

// ========================================
// CREATE ACTOR
// ========================================

export async function createActor(
  actorData: CreateActorData
): Promise<Actor> {
  const formData = new FormData();

  formData.append(
    "name",
    actorData.name
  );

  if (actorData.age !== undefined) {
    formData.append(
      "age",
      String(actorData.age)
    );
  }

  if (actorData.image) {
    const imageResponse = await fetch(
      actorData.image.uri
    );

    const blob = await imageResponse.blob();

    const file = new File(
      [blob],
      actorData.image.name,
      {
        type:
          actorData.image.type ||
          "image/jpeg",
      }
    );

    formData.append("image", file);
  }

  const response = await fetch(
    `${API_URL}/actors`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message || "Failed to create actor"
    );
  }

  return {
    ...data,
    image: getImageUrl(data.image),
  };
}

// ========================================
// UPDATE ACTOR
// ========================================

export async function updateActor(
  id: number,
  actorData: UpdateActorData
): Promise<Actor> {
  const formData = new FormData();

  formData.append(
    "name",
    actorData.name
  );

  if (actorData.age !== undefined) {
    formData.append(
      "age",
      String(actorData.age)
    );
  }

  if (actorData.image) {
    console.log(
      "📸 UPDATE ACTOR IMAGE:",
      actorData.image
    );

    const imageResponse = await fetch(
      actorData.image.uri
    );

    const blob = await imageResponse.blob();

    const file = new File(
      [blob],
      actorData.image.name,
      {
        type:
          actorData.image.type ||
          "image/jpeg",
      }
    );

    formData.append("image", file);
  }

  console.log(
    "📤 UPDATING ACTOR:",
    id
  );

  for (const [key, value] of formData.entries()) {
    console.log(
      "FORMDATA:",
      key,
      value
    );
  }

  const response = await fetch(
    `${API_URL}/actors/${id}`,
    {
      method: "PUT",
      body: formData,
    }
  );

  const data = await response.json();

  console.log(
    "📥 UPDATE ACTOR RESPONSE:",
    data
  );

  if (!response.ok) {
    throw new Error(
      data?.message || "Failed to update actor"
    );
  }

  return {
    ...data,
    image: getImageUrl(data.image),
  };
}

// ========================================
// DELETE ACTOR
// ========================================

export async function deleteActor(
  id: number
): Promise<void> {
  console.log(
    "🗑️ DELETE ACTOR:",
    id
  );

  const response = await fetch(
    `${API_URL}/actors/${id}`,
    {
      method: "DELETE",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message || "Failed to delete actor"
    );
  }

  console.log(
    "✅ ACTOR DELETED:",
    id
  );
}