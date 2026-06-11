import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

const projectsJsonPath = path.join(process.cwd(), "data", "projects.json");

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

function readProjects() {
  if (!fs.existsSync(projectsJsonPath)) {
    return [];
  }
  const data = fs.readFileSync(projectsJsonPath, "utf-8");
  return JSON.parse(data);
}

function writeProjects(projects: unknown[]) {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(projectsJsonPath, JSON.stringify(projects, null, 2));
}

// GET — return all projects with their image data (public, read-only)
export async function GET() {
  try {
    const projects = readProjects();
    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error reading projects:", error);
    return NextResponse.json(
      { error: "Failed to read projects" },
      { status: 500 }
    );
  }
}

// POST — update a project's image
export async function POST(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { client, image } = await request.json();

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

    projects[index] = { ...projects[index], image };
    writeProjects(projects);

    return NextResponse.json({ success: true, project: projects[index] });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}
