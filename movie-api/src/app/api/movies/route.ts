import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

// ========================================
// CORS
// ========================================

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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
// GET ALL MOVIES
// ========================================

export async function GET() {
  try {
    const movies = await prisma.movie.findMany({
      include: {
        director: true,
        actors: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    return NextResponse.json(movies, {
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("GET MOVIES ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to get movies",
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

// ========================================
// CREATE MOVIE
// ========================================

export async function POST(request: Request) {
  try {
    // ==============================
    // AMBIL FORM DATA
    // ==============================

    const formData = await request.formData();

    console.log("CREATE MOVIE FORMDATA");

    const title = formData.get("title");
    const description = formData.get("description");
    const genre = formData.get("genre");
    const releaseYear = formData.get("releaseYear");
    const rating = formData.get("rating");
    const directorId = formData.get("directorId");
    const actorIds = formData.get("actorIds");
    const image = formData.get("image");

    console.log("TITLE:", title);
    console.log("GENRE:", genre);
    console.log("RELEASE YEAR:", releaseYear);
    console.log("RATING:", rating);
    console.log("DIRECTOR ID:", directorId);
    console.log("ACTOR IDS:", actorIds);
    console.log("IMAGE:", image);

    // ==============================
    // VALIDASI TITLE
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

    // ==============================
    // VALIDASI GENRE
    // ==============================

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

    // ==============================
    // VALIDASI RELEASE YEAR
    // ==============================

    const parsedReleaseYear = Number(releaseYear);

    if (
      !Number.isInteger(parsedReleaseYear) ||
      parsedReleaseYear <= 0
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

    // ==============================
    // VALIDASI DIRECTOR
    // ==============================

    const parsedDirectorId = Number(directorId);

    if (
      !Number.isInteger(parsedDirectorId) ||
      parsedDirectorId <= 0
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

    // ==============================
    // PARSE ACTOR IDS
    // ==============================

    let parsedActorIds: number[] = [];

    if (typeof actorIds === "string" && actorIds.trim() !== "") {
      try {
        const parsed = JSON.parse(actorIds);

        if (Array.isArray(parsed)) {
          parsedActorIds = parsed
            .map((id: unknown) => Number(id))
            .filter(
              (id: number) =>
                Number.isInteger(id) && id > 0
            );
        }
      } catch (error) {
        console.error("ACTOR IDS PARSE ERROR:", error);

        return NextResponse.json(
          {
            message: "Invalid actor IDs",
          },
          {
            status: 400,
            headers: corsHeaders,
          }
        );
      }
    }

    // ==============================
    // RATING
    // ==============================

    let parsedRating: number | null = null;

    if (
      typeof rating === "string" &&
      rating.trim() !== ""
    ) {
      const value = Number(rating);

      if (!Number.isNaN(value)) {
        parsedRating = value;
      }
    }

    // ==============================
    // IMAGE UPLOAD
    // ==============================

    let movieImage: string | null = null;

    if (image instanceof File && image.size > 0) {
      // Folder:
      // public/uploads/movies

      const uploadDir = path.join(
        process.cwd(),
        "public",
        "uploads",
        "movies"
      );

      await fs.mkdir(uploadDir, {
        recursive: true,
      });

      // Ambil extension
      const originalName = image.name || "image";
      const extension =
        path.extname(originalName).toLowerCase() || ".jpg";

      // Generate nama unik
      const fileName = `${crypto.randomUUID()}${extension}`;

      const filePath = path.join(
        uploadDir,
        fileName
      );

      // File → Buffer
      const buffer = Buffer.from(
        await image.arrayBuffer()
      );

      // Simpan file
      await fs.writeFile(
        filePath,
        buffer
      );

      // URL yang disimpan ke database
      movieImage = `/uploads/movies/${fileName}`;

      console.log("✅ IMAGE SAVED:", movieImage);
    }

    // ==============================
    // CREATE MOVIE
    // ==============================

    const movie = await prisma.movie.create({
      data: {
        title: title.trim(),

        description:
          typeof description === "string" &&
          description.trim() !== ""
            ? description.trim()
            : null,

        genre: genre.trim(),

        releaseYear: parsedReleaseYear,

        rating: parsedRating,

        image: movieImage,

        directorId: parsedDirectorId,

        actors: {
          connect: parsedActorIds.map((id) => ({
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
    // RESPONSE
    // ==============================

    return NextResponse.json(movie, {
      status: 201,
      headers: corsHeaders,
    });
  } catch (error) {
    // ==============================
    // PRISMA ERROR
    // ==============================

    if (
      error instanceof Prisma.PrismaClientKnownRequestError
    ) {
      if (error.code === "P2003") {
        return NextResponse.json(
          {
            message: "Director or actor not found",
          },
          {
            status: 400,
            headers: corsHeaders,
          }
        );
      }

      console.error("PRISMA ERROR:", error);
    }

    // ==============================
    // GENERAL ERROR
    // ==============================

    console.error("CREATE MOVIE ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to create movie",
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}