import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { actorSchema } from "@/lib/validations/actor";

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
// GET ACTOR BY ID
// ========================================

export async function GET(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;
    const actorId = Number(id);

    if (
      Number.isNaN(actorId) ||
      !Number.isInteger(actorId) ||
      actorId <= 0
    ) {
      return NextResponse.json(
        { message: "Invalid actor ID" },
        { status: 400, headers: corsHeaders }
      );
    }

    const actor = await prisma.actor.findUnique({
      where: {
        id: actorId,
      },
      include: {
        movies: true,
      },
    });

    if (!actor) {
      return NextResponse.json(
        { message: "Actor not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(actor, {
      headers: corsHeaders,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to get actor" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// ========================================
// PUT ACTOR
// ========================================

export async function PUT(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;
    const actorId = Number(id);

    // =========================
    // VALIDATE ID
    // =========================

    if (
      Number.isNaN(actorId) ||
      !Number.isInteger(actorId) ||
      actorId <= 0
    ) {
      return NextResponse.json(
        { message: "Invalid actor ID" },
        { status: 400, headers: corsHeaders }
      );
    }

    // =========================
    // GET OLD ACTOR
    // =========================

    const oldActor = await prisma.actor.findUnique({
      where: {
        id: actorId,
      },
    });

    if (!oldActor) {
      return NextResponse.json(
        { message: "Actor not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    // =========================
    // FORM DATA
    // =========================

    const formData = await request.formData();

    const name = formData.get("name");

    const ageValue = formData.get("age");

    const age =
      ageValue === null ||
      ageValue === ""
        ? undefined
        : Number(ageValue);

    const image = formData.get("image");

    // =========================
    // VALIDATE DATA
    // =========================

    const result = actorSchema.safeParse({
      name,
      age,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: result.error.flatten().fieldErrors,
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // =========================
    // VALIDATE IMAGE
    // =========================

    if (image instanceof File) {
      if (image.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          {
            message: "Image must be less than 5MB",
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

    // =========================
    // IMAGE
    // =========================

    let imagePath = oldActor.image;
    let newImagePath: string | null = null;

    if (
      image instanceof File &&
      image.size > 0
    ) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const extension =
        path.extname(image.name) || ".jpg";

      const filename =
        `${crypto.randomUUID()}${extension}`;

      const uploadDir = path.join(
        process.cwd(),
        "public",
        "uploads",
        "actors"
      );

      await fs.mkdir(uploadDir, {
        recursive: true,
      });

      const filePath = path.join(
        uploadDir,
        filename
      );

      await fs.writeFile(
        filePath,
        buffer
      );

      newImagePath =
        `/uploads/actors/${filename}`;

      imagePath = newImagePath;
    }

    // =========================
    // UPDATE ACTOR
    // =========================

    const actor = await prisma.actor.update({
      where: {
        id: actorId,
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

    // =========================
    // DELETE OLD IMAGE
    // =========================

    if (
      newImagePath &&
      oldActor.image &&
      oldActor.image !== newImagePath
    ) {
      const oldImagePath = path.join(
        process.cwd(),
        "public",
        oldActor.image
      );

      try {
        await fs.unlink(oldImagePath);
      } catch (error) {
        console.error(
          "Failed to delete old image:",
          error
        );
      }
    }

    return NextResponse.json(actor, {
      headers: corsHeaders,
    });
  } catch (error) {
    if (
      error instanceof
      Prisma.PrismaClientKnownRequestError
    ) {
      if (error.code === "P2025") {
        return NextResponse.json(
          {
            message: "Actor not found",
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
            message: "Actor name already exists",
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
        message: "Failed to update actor",
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

// ========================================
// DELETE ACTOR
// ========================================

export async function DELETE(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;
    const actorId = Number(id);

    // =========================
    // VALIDATE ID
    // =========================

    if (
      Number.isNaN(actorId) ||
      !Number.isInteger(actorId) ||
      actorId <= 0
    ) {
      return NextResponse.json(
        { message: "Invalid actor ID" },
        { status: 400, headers: corsHeaders }
      );
    }

    // =========================
    // GET ACTOR
    // =========================

    const actor = await prisma.actor.findUnique({
      where: {
        id: actorId,
      },
    });

    if (!actor) {
      return NextResponse.json(
        { message: "Actor not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    // =========================
    // DELETE DATABASE
    // =========================

    await prisma.actor.delete({
      where: {
        id: actorId,
      },
    });

    // =========================
    // DELETE IMAGE
    // =========================

    if (actor.image) {
      const imagePath = path.join(
        process.cwd(),
        "public",
        actor.image
      );

      try {
        await fs.unlink(imagePath);
      } catch (error) {
        console.error(
          "Failed to delete actor image:",
          error
        );
      }
    }

    return NextResponse.json(
      {
        message: "Actor deleted successfully",
      },
      {
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Failed to delete actor",
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}