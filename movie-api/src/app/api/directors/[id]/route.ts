import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { directorScheme } from "@/lib/validations/director";

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
// GET DIRECTOR BY ID
// ========================================

export async function GET(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;

    const directorId = Number(id);

    if (
      Number.isNaN(directorId) ||
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

    const director =
      await prisma.director.findUnique({
        where: {
          id: directorId,
        },
        include: {
          movies: true,
        },
      });

    if (!director) {
      return NextResponse.json(
        {
          message: "Director not found",
        },
        {
          status: 404,
          headers: corsHeaders,
        }
      );
    }

    return NextResponse.json(
      director,
      {
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Failed to get director",
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

// ========================================
// PUT DIRECTOR
// ========================================

export async function PUT(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;

    const directorId = Number(id);

    if (
      Number.isNaN(directorId) ||
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

    const oldDirector =
      await prisma.director.findUnique({
        where: {
          id: directorId,
        },
      });

    if (!oldDirector) {
      return NextResponse.json(
        {
          message: "Director not found",
        },
        {
          status: 404,
          headers: corsHeaders,
        }
      );
    }

    const formData =
      await request.formData();

    const name =
      formData.get("name");

    const ageValue =
      formData.get("age");

    const age =
      ageValue === null ||
      ageValue === ""
        ? undefined
        : Number(ageValue);

    const image =
      formData.get("image");

    // ========================================
    // VALIDATE DATA
    // ========================================

    const result =
      directorScheme.safeParse({
        name,
        age,
      });

    if (!result.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors:
            result.error.flatten().fieldErrors,
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // ========================================
    // VALIDATE IMAGE
    // ========================================

    if (image instanceof File) {
      if (image.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          {
            message:
              "Image must be less than 5MB",
          },
          {
            status: 400,
            headers: corsHeaders,
          }
        );
      }

      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
      ];

      if (!allowedTypes.includes(image.type)) {
        return NextResponse.json(
          {
            message:
              "Only JPG, PNG, and WebP images are allowed",
          },
          {
            status: 400,
            headers: corsHeaders,
          }
        );
      }
    }

    // ========================================
    // IMAGE
    // ========================================

    let imagePath =
      oldDirector.image;

    let newImagePath:
      string | null = null;

    if (
      image instanceof File &&
      image.size > 0
    ) {
      const bytes =
        await image.arrayBuffer();

      const buffer =
        Buffer.from(bytes);

      const extension =
        path.extname(image.name) ||
        ".jpg";

      const filename =
        `${crypto.randomUUID()}${extension}`;

      const uploadDir =
        path.join(
          process.cwd(),
          "public",
          "uploads",
          "directors"
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
        `/uploads/directors/${filename}`;

      imagePath =
        newImagePath;
    }

    // ========================================
    // UPDATE
    // ========================================

    const director =
      await prisma.director.update({
        where: {
          id: directorId,
        },

        data: {
          name: result.data.name,
          age: result.data.age,
          image: imagePath,
        },

        include: {
          movies: true,
        },
      });

    // ========================================
    // DELETE OLD IMAGE
    // ========================================

    if (
      newImagePath &&
      oldDirector.image &&
      oldDirector.image !== newImagePath
    ) {
      const oldImagePath =
        path.join(
          process.cwd(),
          "public",
          oldDirector.image
        );

      try {
        await fs.unlink(
          oldImagePath
        );
      } catch (error) {
        console.error(
          "Failed to delete old image:",
          error
        );
      }
    }

    return NextResponse.json(
      director,
      {
        headers: corsHeaders,
      }
    );
  } catch (error) {
    if (
      error instanceof
      Prisma.PrismaClientKnownRequestError
    ) {
      if (error.code === "P2025") {
        return NextResponse.json(
          {
            message:
              "Director not found",
          },
          {
            status: 404,
            headers: corsHeaders,
          }
        );
      }

      if (error.code === "P2002") {
        return NextResponse.json(
          {
            message:
              "Director name already exists",
          },
          {
            status: 409,
            headers: corsHeaders,
          }
        );
      }
    }

    console.error(error);

    return NextResponse.json(
      {
        message:
          "Failed to update director",
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

// ========================================
// DELETE DIRECTOR
// ========================================

export async function DELETE(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;

    const directorId = Number(id);

    // ========================================
    // VALIDATE ID
    // ========================================

    if (
      Number.isNaN(directorId) ||
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

    // ========================================
    // GET DIRECTOR
    // ========================================

    const director =
      await prisma.director.findUnique({
        where: {
          id: directorId,
        },
      });

    if (!director) {
      return NextResponse.json(
        {
          message: "Director not found",
        },
        {
          status: 404,
          headers: corsHeaders,
        }
      );
    }

    // ========================================
    // CHECK MOVIES
    // ========================================

    const movieCount =
      await prisma.movie.count({
        where: {
          directorId,
        },
      });

    if (movieCount > 0) {
      return NextResponse.json(
        {
          message:
            "Cannot delete director because they still have movies",
        },
        {
          status: 409,
          headers: corsHeaders,
        }
      );
    }

    // ========================================
    // DELETE DATABASE
    // ========================================

    await prisma.director.delete({
      where: {
        id: directorId,
      },
    });

    // ========================================
    // DELETE IMAGE
    // ========================================

    if (director.image) {
      const imagePath =
        path.join(
          process.cwd(),
          "public",
          director.image
        );

      try {
        await fs.unlink(
          imagePath
        );

        console.log(
          "🗑️ DIRECTOR IMAGE DELETED:",
          imagePath
        );
      } catch (error) {
        console.error(
          "❌ FAILED TO DELETE DIRECTOR IMAGE:",
          error
        );
      }
    }

    // ========================================
    // RESPONSE
    // ========================================

    return NextResponse.json(
      {
        message:
          "Director deleted successfully",
      },
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error(
      "❌ DELETE DIRECTOR ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to delete director",
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}