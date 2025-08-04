import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { deleteFileFromBucket } from "@/lib/files";

export async function DELETE(request: NextRequest) {
  try {
    // Validate user authentication
    const { user } = await validateRequest();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get("imageUrl");
    
    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
    }

    // Delete the file from S3 bucket
    console.log("🗑️ Deleting image from S3:", imageUrl);
    await deleteFileFromBucket(imageUrl);
    
    console.log("✅ Image deleted from S3:", imageUrl);
    
    return NextResponse.json({ 
      success: true, 
      message: "Image deleted successfully" 
    });

  } catch (error) {
    console.error("Error deleting image from S3:", error);
    return NextResponse.json({ 
      error: "Failed to delete image from S3" 
    }, { status: 500 });
  }
}