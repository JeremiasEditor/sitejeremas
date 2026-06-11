import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

const projectsJsonPath = path.join(process.cwd(), "data", "projects.json");
const imagesDir = path.join(process.cwd(), "public", "portfolio-images");

// Validate admin cookie token
function isAuthenticated(request: NextRequest): boolean {
  const token = request.cookies.get("admin_token")?.value;
  if (!token) return false;

  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const correctPassword = process.env.ADMIN_PASSWORD || "admin123";
    return decoded === correctPassword;
  } catch {
    return false;
  }
}

function ensureDirectories() {
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function readProjects() {
  if (!fs.existsSync(projectsJsonPath)) {
    return [];
  }
  const data = fs.readFileSync(projectsJsonPath, "utf-8");
  return JSON.parse(data);
}

function writeProjects(projects: unknown[]) {
  fs.writeFileSync(projectsJsonPath, JSON.stringify(projects, null, 2));
}

// POST — upload an image for a project
export async function POST(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    ensureDirectories();

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const client = formData.get("client") as string;

    if (!file || !client) {
      return NextResponse.json(
        { error: "File and client name are required" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, WebP, and GIF images are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image must be smaller than 5MB" },
        { status: 400 }
      );
    }

    // Build a safe filename from the client name
    const safeClient = client.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${safeClient}-${Date.now()}.${ext}`;
    const filePath = path.join(imagesDir, fileName);

    // Remove old image for this client if it exists
    const projects = readProjects();
    const existing = projects.find(
      (p: { client: string; image?: string | null }) => p.client === client
    );
    if (existing?.image) {
      const oldFileName = existing.image.split("/").pop();
      if (oldFileName) {
        const oldPath = path.join(imagesDir, oldFileName);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    }

    // Save new image file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    fs.writeFileSync(filePath, buffer);

    const imageUrl = `/portfolio-images/${fileName}`;

    // Update projects.json
    const index = projects.findIndex(
      (p: { client: string }) => p.client === client
    );
    if (index !== -1) {
      projects[index] = { ...projects[index], image: imageUrl };
      writeProjects(projects);
    }

    return NextResponse.json({ success: true, imageUrl });
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}

// DELETE — remove image for a project
export async function DELETE(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    ensureDirectories();

    const { client } = await request.json();

    if (!client) {
      return NextResponse.json(
        { error: "Client name is required" },
        { status: 400 }
      );
    }

    const projects = readProjects();
    const index = projects.findIndex(
      (p: { client: string }) => p.client === client
    );

    if (index === -1) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Remove image file
    const existing = projects[index];
    if (existing?.image) {
      const oldFileName = existing.image.split("/").pop();
      if (oldFileName) {
        const oldPath = path.join(imagesDir, oldFileName);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    }

    projects[index] = { ...projects[index], image: null };
    writeProjects(projects);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing image:", error);
    return NextResponse.json(
      { error: "Failed to remove image" },
      { status: 500 }
    );
  }
}
