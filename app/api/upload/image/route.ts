import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { uploadFileToBucket } from "@/lib/files";

export async function POST(request: NextRequest) {
  try {
    // Validate user authentication
    const { user } = await validateRequest();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." 
      }, { status: 400 });
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: "File size too large. Maximum size is 5MB." 
      }, { status: 400 });
    }

    // Generate a unique path for the image
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = `products/images/${timestamp}_${cleanFileName}`;
    
    // Upload to S3 bucket using existing utility
    await uploadFileToBucket(file.stream(), path);
    
    console.log("📸 Image uploaded to S3:", path);
    
    return NextResponse.json({ 
      success: true, 
      url: path,
      fileName: cleanFileName 
    });

  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json({ 
      error: "Failed to upload image" 
    }, { status: 500 });
  }
}