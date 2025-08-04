import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { getFileUrl } from "@/lib/files";

export async function GET(request: NextRequest) {
  try {
    // Validate user authentication
    const { user } = await validateRequest();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");
    
    if (!path) {
      return NextResponse.json({ error: "Path parameter is required" }, { status: 400 });
    }

    // Get signed URL from S3
    const signedUrl = await getFileUrl(path);
    
    return NextResponse.json({ 
      success: true, 
      url: signedUrl 
    });

  } catch (error) {
    console.error("Error getting file URL:", error);
    return NextResponse.json({ 
      error: "Failed to get file URL" 
    }, { status: 500 });
  }
}