const API_URL = "http://localhost:3000/api";
const SERVER_URL = "http://localhost:3000";

export type Director = {
  id: number;
  name: string;
  age?: number | null;
  image?: string | null;
};

export type DirectorImage = {
  uri: string;
  name: string;
  type: string;
};

export type CreateDirectorData = {
  name: string;
  age?: number;
  image?: DirectorImage | null;
};

export type UpdateDirectorData = {
  name: string;
  age?: number;
  image?: DirectorImage | null;
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
// CREATE IMAGE FILE
// ========================================

async function createImageFile(
  image: DirectorImage
): Promise<File> {
  const imageResponse = await fetch(image.uri);

  const blob = await imageResponse.blob();

  return new File(
    [blob],
    image.name,
    {
      type:
        image.type ||
        "image/jpeg",
    }
  );
}

// ========================================
// GET DIRECTORS
// ========================================

export async function getDirectors(): Promise<Director[]> {
  const response = await fetch(
    `${API_URL}/directors`,
    {
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "Failed to get directors"
    );
  }

  const directors: Director[] =
    Array.isArray(data)
      ? data
      : data.data ?? [];

  return directors.map(
    (director) => ({
      ...director,
      image: getImageUrl(
        director.image
      ),
    })
  );
}

// ========================================
// GET DIRECTOR BY ID
// ========================================

export async function getDirectorById(
  id: number
): Promise<Director> {
  const response = await fetch(
    `${API_URL}/directors/${id}`,
    {
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "Failed to get director"
    );
  }

  return {
    ...data,
    image: getImageUrl(
      data.image
    ),
  };
}

// ========================================
// CREATE DIRECTOR
// ========================================

export async function createDirector(
  directorData: CreateDirectorData
): Promise<Director> {
  const formData = new FormData();

  formData.append(
    "name",
    directorData.name
  );

  if (
    directorData.age !== undefined
  ) {
    formData.append(
      "age",
      String(directorData.age)
    );
  }

  // ========================================
  // IMAGE
  // ========================================

  if (directorData.image) {
    const file =
      await createImageFile(
        directorData.image
      );

    formData.append(
      "image",
      file
    );
  }

  // ========================================
  // REQUEST
  // ========================================

  const response = await fetch(
    `${API_URL}/directors`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "Failed to create director"
    );
  }

  return {
    ...data,
    image: getImageUrl(
      data.image
    ),
  };
}

// ========================================
// UPDATE DIRECTOR
// ========================================

export async function updateDirector(
  id: number,
  directorData: UpdateDirectorData
): Promise<Director> {
  console.log(
    "✏️ UPDATE DIRECTOR:",
    id
  );

  const formData = new FormData();

  formData.append(
    "name",
    directorData.name
  );

  if (
    directorData.age !== undefined
  ) {
    formData.append(
      "age",
      String(directorData.age)
    );
  }

  // ========================================
  // IMAGE
  // ========================================

  if (directorData.image) {
    console.log(
      "📸 UPDATE DIRECTOR IMAGE:",
      directorData.image
    );

    const file =
      await createImageFile(
        directorData.image
      );

    formData.append(
      "image",
      file
    );
  }

  // ========================================
  // REQUEST
  // ========================================

  const response = await fetch(
    `${API_URL}/directors/${id}`,
    {
      method: "PUT",
      body: formData,
    }
  );

  const data =
    await response.json();

  console.log(
    "📥 UPDATE DIRECTOR RESPONSE:",
    data
  );

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "Failed to update director"
    );
  }

  return {
    ...data,
    image: getImageUrl(
      data.image
    ),
  };
}

// ========================================
// DELETE DIRECTOR
// ========================================

export async function deleteDirector(
  id: number
): Promise<void> {
  console.log(
    "🗑️ DELETE DIRECTOR:",
    id
  );

  const response = await fetch(
    `${API_URL}/directors/${id}`,
    {
      method: "DELETE",
    }
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "Failed to delete director"
    );
  }

  console.log(
    "✅ DIRECTOR DELETED:",
    id
  );
}