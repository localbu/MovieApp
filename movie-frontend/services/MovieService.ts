const API_URL = "http://localhost:3000/api";
const SERVER_URL = "http://localhost:3000";

export type Director = {
  id: number;
  name: string;
  age?: number | null;
  image?: string | null;
};

export type Actor = {
  id: number;
  name: string;
  age?: number | null;
  image?: string | null;
};

export type MovieImage = {
  uri: string;
  name: string;
  type: string;
};

export type Movie = {
  id: number;
  directorId: number;
  title: string;
  description?: string | null;
  genre: string;
  releaseYear: number;
  rating?: number | null;
  image?: string | null;
  director?: Director | null;
  actors?: Actor[];
};

export type CreateMovieData = {
  title: string;
  genre: string;
  releaseYear: number;
  rating?: number;
  description?: string;
  directorId: number;
  actorIds: number[];
  image?: MovieImage | null;
};

export type UpdateMovieData = {
  title: string;
  genre: string;
  releaseYear: number;
  rating?: number;
  description?: string;
  directorId: number;
  actorIds: number[];
  image?: MovieImage | null;
};

function getImageUrl(
  image: string | null | undefined
): string | null {
  if (!image) return null;

  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  return `${SERVER_URL}${image}`;
}

// ========================================
// GET MOVIES
// ========================================

export async function getMovies(): Promise<Movie[]> {
  const response = await fetch(
    `${API_URL}/movies`,
    {
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message || "Failed to get movies"
    );
  }

  const movies: Movie[] = Array.isArray(data)
    ? data
    : data.data ?? [];

  return movies.map((movie) => ({
    ...movie,
    image: getImageUrl(movie.image),
  }));
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
      data?.message || "Failed to get directors"
    );
  }

  return Array.isArray(data)
    ? data
    : data.data ?? [];
}

// ========================================
// GET ACTORS
// ========================================

export async function getActors(): Promise<Actor[]> {
  const response = await fetch(
    `${API_URL}/actors`,
    {
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message || "Failed to get actors"
    );
  }

  return Array.isArray(data)
    ? data
    : data.data ?? [];
}

// ========================================
// GET MOVIE BY ID
// ========================================

export async function getMovieById(
  id: number
): Promise<Movie> {
  const response = await fetch(
    `${API_URL}/movies/${id}`,
    {
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message || "Failed to get movie"
    );
  }

  return {
    ...data,

    image: getImageUrl(data.image),

    director: data.director
      ? {
          ...data.director,
          image: getImageUrl(
            data.director.image
          ),
        }
      : null,

    actors: data.actors?.map(
      (actor: Actor) => ({
        ...actor,
        image: getImageUrl(actor.image),
      })
    ),
  };
}

// ========================================
// CREATE MOVIE
// ========================================

export async function createMovie(
  movieData: CreateMovieData
): Promise<Movie> {
  const formData = new FormData();

  formData.append(
    "title",
    movieData.title
  );

  formData.append(
    "genre",
    movieData.genre
  );

  formData.append(
    "releaseYear",
    String(movieData.releaseYear)
  );

  formData.append(
    "directorId",
    String(movieData.directorId)
  );

  formData.append(
    "actorIds",
    JSON.stringify(movieData.actorIds)
  );

  if (movieData.description) {
    formData.append(
      "description",
      movieData.description
    );
  }

  if (movieData.rating !== undefined) {
    formData.append(
      "rating",
      String(movieData.rating)
    );
  }

  if (movieData.image) {
    const imageResponse = await fetch(
      movieData.image.uri
    );

    const blob =
      await imageResponse.blob();

    const file = new File(
      [blob],
      movieData.image.name,
      {
        type:
          movieData.image.type ||
          "image/jpeg",
      }
    );

    formData.append(
      "image",
      file
    );
  }

  const response = await fetch(
    `${API_URL}/movies`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "Failed to create movie"
    );
  }

  return {
    ...data,
    image: getImageUrl(data.image),
  };
}

// ========================================
// UPDATE MOVIE
// ========================================

export async function updateMovie(
  id: number,
  movieData: UpdateMovieData
): Promise<Movie> {
  const formData = new FormData();

  formData.append(
    "title",
    movieData.title
  );

  formData.append(
    "genre",
    movieData.genre
  );

  formData.append(
    "releaseYear",
    String(movieData.releaseYear)
  );

  formData.append(
    "directorId",
    String(movieData.directorId)
  );

  formData.append(
    "actorIds",
    JSON.stringify(movieData.actorIds)
  );

  if (movieData.description) {
    formData.append(
      "description",
      movieData.description
    );
  }

  if (movieData.rating !== undefined) {
    formData.append(
      "rating",
      String(movieData.rating)
    );
  }

  // =========================
  // IMAGE
  // =========================

  if (movieData.image) {
    console.log(
      "📸 UPDATE MOVIE IMAGE:",
      movieData.image
    );

    const imageResponse =
      await fetch(
        movieData.image.uri
      );

    const blob =
      await imageResponse.blob();

    const file = new File(
      [blob],
      movieData.image.name,
      {
        type:
          movieData.image.type ||
          "image/jpeg",
      }
    );

    formData.append(
      "image",
      file
    );
  }

  console.log(
    "📤 UPDATE MOVIE:",
    id
  );

  const response = await fetch(
    `${API_URL}/movies/${id}`,
    {
      method: "PUT",
      body: formData,
    }
  );

  const data = await response.json();

  console.log(
    "📥 UPDATE MOVIE RESPONSE:",
    data
  );

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "Failed to update movie"
    );
  }

  return {
    ...data,

    image: getImageUrl(data.image),

    director: data.director
      ? {
          ...data.director,
          image: getImageUrl(
            data.director.image
          ),
        }
      : null,

    actors: data.actors?.map(
      (actor: Actor) => ({
        ...actor,
        image: getImageUrl(actor.image),
      })
    ),
  };
}

// ========================================
// DELETE MOVIE
// ========================================

export async function deleteMovie(
  id: number
): Promise<void> {
  const response = await fetch(
    `${API_URL}/movies/${id}`,
    {
      method: "DELETE",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "Failed to delete movie"
    );
  }
}