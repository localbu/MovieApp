import { NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";

type Params = {
  params: Promise<{
    filename: string;
  }>;
};

export async function DELETE(
  request: Request,
  { params }: Params
) {
  try {
    const { filename } = await params;

    const filePath = path.join(
      process.cwd(),
      "public",
      "images",
      "movies",
      filename
    );

    await unlink(filePath);

    return NextResponse.json({
      message: "Movie poster deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Movie poster not found" },
      { status: 404 }
    );
  }
}