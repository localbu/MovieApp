import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// ========================================
// OPTIONS
// ========================================

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// ========================================
// GET MOVIE BY ID
// ========================================

export async function GET(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;

    const movieId = Number(id);

    if (
      Number.isNaN(movieId) ||
      !Number.isInteger(movieId) ||
      movieId <= 0
    ) {
      return NextResponse.json(
        {
          message: "Invalid movie ID",
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    const movie = await prisma.movie.findUnique({
      where: {
        id: movieId,
      },
      include: {
        director: true,
        actors: true,
      },
    });

    if (!movie) {
      return NextResponse.json(
        {
          message: "Movie not found",
        },
        {
          status: 404,
          headers: corsHeaders,
        }
      );
    }

    return NextResponse.json(movie, {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("GET MOVIE BY ID ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to get movie",
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

// ========================================
// PUT MOVIE
// ========================================

export async function PUT(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;

    const movieId = Number(id);

    if (
      Number.isNaN(movieId) ||
      !Number.isInteger(movieId) ||
      movieId <= 0
    ) {
      return NextResponse.json(
        {
          message: "Invalid movie ID",
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // ==============================
    // CEK MOVIE LAMA
    // ==============================

    const oldMovie = await prisma.movie.findUnique({
      where: {
        id: movieId,
      },
    });

    if (!oldMovie) {
      return NextResponse.json(
        {
          message: "Movie not found",
        },
        {
          status: 404,
          headers: corsHeaders,
        }
      );
    }

    // ==============================
    // FORM DATA
    // ==============================

    const formData = await request.formData();

    const title = formData.get("title");

    const description = formData.get("description");

    const genre = formData.get("genre");

    const releaseYear = Number(
      formData.get("releaseYear")
    );

    const ratingValue = formData.get("rating");

    const rating =
      typeof ratingValue === "string" &&
      ratingValue.trim() !== ""
        ? Number(ratingValue)
        : null;

    const directorId = Number(
      formData.get("directorId")
    );

    // Bisa menerima:
    // actorIds=1
    // actorIds=2
    //
    // maupun:
    // actorIds=[1,2]

    const actorIdsValue =
      formData.get("actorIds");

    let actorIds: number[] = [];

    if (typeof actorIdsValue === "string") {
      try {
        const parsed = JSON.parse(actorIdsValue);

        if (Array.isArray(parsed)) {
          actorIds = parsed.map(Number);
        } else {
          actorIds = [Number(actorIdsValue)];
        }
      } catch {
        actorIds = [Number(actorIdsValue)];
      }
    }

    const image = formData.get("image");

    // ==============================
    // VALIDASI
    // ==============================

    if (
      typeof title !== "string" ||
      title.trim() === ""
    ) {
      return NextResponse.json(
        {
          message: "Title is required",
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    if (
      typeof genre !== "string" ||
      genre.trim() === ""
    ) {
      return NextResponse.json(
        {
          message: "Genre is required",
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    if (
      !Number.isInteger(releaseYear) ||
      releaseYear <= 0
    ) {
      return NextResponse.json(
        {
          message: "Invalid release year",
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    if (
      rating !== null &&
      (!Number.isFinite(rating) ||
        rating < 0 ||
        rating > 10)
    ) {
      return NextResponse.json(
        {
          message: "Invalid rating",
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    if (
      !Number.isInteger(directorId) ||
      directorId <= 0
    ) {
      return NextResponse.json(
        {
          message: "Invalid director ID",
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    if (
      actorIds.some(
        (id) =>
          !Number.isInteger(id) ||
          id <= 0
      )
    ) {
      return NextResponse.json(
        {
          message: "Invalid actor ID",
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // ==============================
    // IMAGE
    // ==============================

    let imagePath = oldMovie.image;

    let newImagePath: string | null = null;

    if (
      image instanceof File &&
      image.size > 0
    ) {
      const bytes =
        await image.arrayBuffer();

      const buffer =
        Buffer.from(bytes);

      const extension =
        path.extname(image.name).toLowerCase() ||
        ".jpg";

      const filename =
        `${crypto.randomUUID()}${extension}`;

      const uploadDir =
        path.join(
          process.cwd(),
          "public",
          "uploads",
          "movies"
        );

      await fs.mkdir(
        uploadDir,
        {
          recursive: true,
        }
      );

      const filePath =
        path.join(
          uploadDir,
          filename
        );

      await fs.writeFile(
        filePath,
        buffer
      );

      newImagePath =
        `/uploads/movies/${filename}`;

      imagePath = newImagePath;
    }

    // ==============================
    // UPDATE MOVIE
    // ==============================

    const movie =
      await prisma.movie.update({
        where: {
          id: movieId,
        },

        data: {
          title: title.trim(),

          description:
            typeof description === "string" &&
            description.trim() !== ""
              ? description.trim()
              : null,

          genre: genre.trim(),

          releaseYear,

          rating,

          image: imagePath,

          directorId,

          actors: {
            set: actorIds.map((id) => ({
              id,
            })),
          },
        },

        include: {
          director: true,
          actors: true,
        },
      });

    // ==============================
    // HAPUS IMAGE LAMA
    // ==============================

    if (
      newImagePath &&
      oldMovie.image &&
      oldMovie.image !== newImagePath
    ) {
      const oldImagePath =
        path.join(
          process.cwd(),
          "public",
          oldMovie.image
        );

      try {
        await fs.unlink(
          oldImagePath
        );
      } catch (error) {
        console.error(
          "FAILED TO DELETE OLD IMAGE:",
          error
        );
      }
    }

    return NextResponse.json(
      movie,
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    if (
      error instanceof
      Prisma.PrismaClientKnownRequestError
    ) {
      if (error.code === "P2003") {
        return NextResponse.json(
          {
            message:
              "Director or actor not found",
          },
          {
            status: 400,
            headers: corsHeaders,
          }
        );
      }

      if (error.code === "P2025") {
        return NextResponse.json(
          {
            message: "Movie not found",
          },
          {
            status: 404,
            headers: corsHeaders,
          }
        );
      }
    }

    console.error(
      "UPDATE MOVIE ERROR:",
      error
    );

    return NextResponse.json(
      {
        message: "Failed to update movie",
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

// ========================================
// DELETE MOVIE
// ========================================

export async function DELETE(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;

    const movieId = Number(id);

    if (
      Number.isNaN(movieId) ||
      !Number.isInteger(movieId) ||
      movieId <= 0
    ) {
      return NextResponse.json(
        {
          message: "Invalid movie ID",
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // ==============================
    // CEK MOVIE
    // ==============================

    const movie =
      await prisma.movie.findUnique({
        where: {
          id: movieId,
        },
      });

    if (!movie) {
      return NextResponse.json(
        {
          message: "Movie not found",
        },
        {
          status: 404,
          headers: corsHeaders,
        }
      );
    }

    // ==============================
    // DELETE DATABASE
    // ==============================

    await prisma.movie.delete({
      where: {
        id: movieId,
      },
    });

    // ==============================
    // DELETE IMAGE
    // ==============================

    if (movie.image) {
      const imagePath =
        path.join(
          process.cwd(),
          "public",
          movie.image
        );

      try {
        await fs.unlink(
          imagePath
        );
      } catch (error) {
        console.error(
          "FAILED TO DELETE MOVIE IMAGE:",
          error
        );
      }
    }

    return NextResponse.json(
      {
        message:
          "Movie deleted successfully",
      },
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error(
      "DELETE MOVIE ERROR:",
      error
    );

    return NextResponse.json(
      {
        message: "Failed to delete movie",
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}