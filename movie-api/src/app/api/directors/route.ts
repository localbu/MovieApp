import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET() {
  try {
    const directors = await prisma.director.findMany({
      orderBy: {
        id: "asc",
      },
    });

    return NextResponse.json(directors, {
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("GET DIRECTORS ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to get directors",
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    console.log("CREATE DIRECTOR FORMDATA");

    const name = formData.get("name");
    const age = formData.get("age");
    const image = formData.get("image");

    console.log("NAME:", name);
    console.log("AGE:", age);
    console.log("IMAGE:", image);

    // NAME
    if (
      typeof name !== "string" ||
      name.trim() === ""
    ) {
      return NextResponse.json(
        {
          message: "Director name is required",
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // AGE
    let parsedAge: number | null = null;

    if (
      typeof age === "string" &&
      age.trim() !== ""
    ) {
      const value = Number(age);

      if (
        !Number.isInteger(value) ||
        value <= 0
      ) {
        return NextResponse.json(
          {
            message: "Invalid age",
          },
          {
            status: 400,
            headers: corsHeaders,
          }
        );
      }

      parsedAge = value;
    }

    // IMAGE
    let directorImage: string | null = null;

    if (
      image instanceof File &&
      image.size > 0
    ) {
      const uploadDir = path.join(
        process.cwd(),
        "public",
        "uploads",
        "directors"
      );

      await fs.mkdir(uploadDir, {
        recursive: true,
      });

      const originalName =
        image.name || "image";

      const extension =
        path.extname(originalName).toLowerCase() ||
        ".jpg";

      const fileName = `${crypto.randomUUID()}${extension}`;

      const filePath = path.join(
        uploadDir,
        fileName
      );

      const buffer = Buffer.from(
        await image.arrayBuffer()
      );

      await fs.writeFile(
        filePath,
        buffer
      );

      directorImage =
        `/uploads/directors/${fileName}`;

      console.log(
        "✅ IMAGE SAVED:",
        directorImage
      );
    }

    // CREATE
    const director =
      await prisma.director.create({
        data: {
          name: name.trim(),
          age: parsedAge,
          image: directorImage,
        },
      });

    return NextResponse.json(
      director,
      {
        status: 201,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError
    ) {
      // NAME UNIQUE
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

      console.error("PRISMA ERROR:", error);
    }

    console.error(
      "CREATE DIRECTOR ERROR:",
      error
    );

    return NextResponse.json(
      {
        message: "Failed to create director",
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}