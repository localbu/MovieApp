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
// GET ALL ACTORS
// ========================================

export async function GET() {
  try {
    const actors = await prisma.actor.findMany({
      orderBy: {
        id: "asc",
      },
    });

    return NextResponse.json(actors, {
      headers: corsHeaders,
    });
  } catch (error) {
    console.error(
      "GET ACTORS ERROR:",
      error
    );

    return NextResponse.json(
      {
        message: "Failed to get actors",
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

// ========================================
// CREATE ACTOR
// ========================================

export async function POST(
  request: Request
) {
  try {
    // =========================
    // GET FORMDATA
    // =========================

    const formData =
      await request.formData();

    console.log(
      "CREATE ACTOR FORMDATA"
    );

    const name =
      formData.get("name");

    const age =
      formData.get("age");

    const image =
      formData.get("image");

    console.log(
      "NAME:",
      name
    );

    console.log(
      "AGE:",
      age
    );

    console.log(
      "IMAGE:",
      image
    );

    // =========================
    // VALIDATE NAME
    // =========================

    if (
      typeof name !== "string" ||
      name.trim() === ""
    ) {
      return NextResponse.json(
        {
          message:
            "Actor name is required",
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // =========================
    // VALIDATE AGE
    // =========================

    let parsedAge: number | null = null;

    if (
      typeof age === "string" &&
      age.trim() !== ""
    ) {
      const value =
        Number(age);

      if (
        !Number.isInteger(value) ||
        value <= 0
      ) {
        return NextResponse.json(
          {
            message:
              "Invalid age",
          },
          {
            status: 400,
            headers: corsHeaders,
          }
        );
      }

      parsedAge = value;
    }

    // =========================
    // IMAGE UPLOAD
    // =========================

    let actorImage:
      | string
      | null = null;

    if (
      image instanceof File &&
      image.size > 0
    ) {
      const uploadDir =
        path.join(
          process.cwd(),
          "public",
          "uploads",
          "actors"
        );

      await fs.mkdir(
        uploadDir,
        {
          recursive: true,
        }
      );

      const originalName =
        image.name || "image";

      const extension =
        path
          .extname(
            originalName
          )
          .toLowerCase() ||
        ".jpg";

      const fileName =
        `${crypto.randomUUID()}${extension}`;

      const filePath =
        path.join(
          uploadDir,
          fileName
        );

      const buffer =
        Buffer.from(
          await image.arrayBuffer()
        );

      await fs.writeFile(
        filePath,
        buffer
      );

      actorImage =
        `/uploads/actors/${fileName}`;

      console.log(
        "✅ IMAGE SAVED:",
        actorImage
      );
    }

    // =========================
    // CREATE ACTOR
    // =========================

    const actor =
      await prisma.actor.create({
        data: {
          name: name.trim(),
          age: parsedAge,
          image: actorImage,
        },
      });

    console.log(
      "✅ ACTOR CREATED:",
      actor
    );

    return NextResponse.json(
      actor,
      {
        status: 201,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    // =========================
    // DUPLICATE NAME
    // =========================

    if (
      error instanceof
      Prisma.PrismaClientKnownRequestError
    ) {
      if (
        error.code === "P2002"
      ) {
        return NextResponse.json(
          {
            message:
              "Actor name already exists",
          },
          {
            status: 409,
            headers: corsHeaders,
          }
        );
      }

      console.error(
        "PRISMA ERROR:",
        error
      );
    }

    // =========================
    // OTHER ERROR
    // =========================

    console.error(
      "CREATE ACTOR ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to create actor",
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}