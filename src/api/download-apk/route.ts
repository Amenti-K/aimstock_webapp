import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  //   const apkUrl =
  //     "https://github.com/ProjectMercato/Aim_mobile/releases/download/AIM-Stock/AimStock_v1.apk";
  const apkUrl =
    "https://release-assets.githubusercontent.com/github-production-release-asset/1069484768/19af5b8f-8889-4dbe-91da-cd1b0d56c19d?sp=r&sv=2018-11-09&sr=b&spr=https&se=2026-04-04T07%3A16%3A07Z&rscd=attachment%3B+filename%3DAimStock_v1.apk&rsct=application%2Fvnd.android.package-archive&skoid=96c2d410-5711-43a1-aedd-ab1947aa7ab0&sktid=398a6654-997b-47e9-b12b-9515b896b4de&skt=2026-04-04T06%3A15%3A22Z&ske=2026-04-04T07%3A16%3A07Z&sks=b&skv=2018-11-09&sig=Aw4r9%2BqrZXlGpoNv6B4lITLir685cbpzG8f7E5O2gzU%3D&jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmVsZWFzZS1hc3NldHMuZ2l0aHVidXNlcmNvbnRlbnQuY29tIiwia2V5Ijoia2V5MSIsImV4cCI6MTc3NTI4NzUzNywibmJmIjoxNzc1MjgzOTM3LCJwYXRoIjoicmVsZWFzZWFzc2V0cHJvZHVjdGlvbi5ibG9iLmNvcmUud2luZG93cy5uZXQifQ.lmOFiYSTcy79qvQEs1gJgAZTfXXV7ezlTwbXOFae7Lk&response-content-disposition=attachment%3B%20filename%3DAimStock_v1.apk&response-content-type=application%2Fvnd.android.package-archive";

  try {
    const response = await fetch(apkUrl, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible)", // Helps avoid some GitHub blocks
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch APK from GitHub" },
        { status: response.status },
      );
    }

    // Get the raw binary data
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();

    // Force proper download headers
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.android.package-archive", // Correct MIME for APK
        "Content-Disposition": 'attachment; filename="AimStock_v1.apk"',
        "Content-Length": arrayBuffer.byteLength.toString(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("APK download error:", error);
    return NextResponse.json(
      { error: "Download failed. Please try again later." },
      { status: 500 },
    );
  }
}
