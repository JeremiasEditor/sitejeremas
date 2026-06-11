"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
  Upload,
  Trash2,
  ImageIcon,
  CheckCircle,
  XCircle,
  RotateCw,
  Users,
} from "lucide-react";

interface Project {
  client: string;
  image: string | null;
}

interface UploadState {
  loading: boolean;
  message: string;
  type: "success" | "error" | "";
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [uploadStates, setUploadStates] = useState<Record<string, UploadState>>(
    {}
  );
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoadingProjects(true);
    try {
      const res = await fetch("/api/admin/projects");
      if (res.status === 401) {
        router.push("/admin-login");
        return;
      }
      const data = await res.json();
      setProjects(data);
    } catch (error) {
      console.error("Error loading projects:", error);
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth", { method: "DELETE" });
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const setUploadState = (client: string, state: Partial<UploadState>) => {
    setUploadStates((prev) => ({
      ...prev,
      [client]: { ...prev[client], ...state } as UploadState,
    }));
  };

  const handleFileChange = async (
    client: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadState(client, { loading: true, message: "", type: "" });

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("client", client);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setUploadState(client, {
        loading: false,
        message: "Imagem salva com sucesso!",
        type: "success",
      });

      // Refresh project list to show new image
      await loadProjects();

      // Clear the file input
      if (fileInputRefs.current[client]) {
        fileInputRefs.current[client]!.value = "";
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Erro ao fazer upload";
      setUploadState(client, {
        loading: false,
        message,
        type: "error",
      });
    }

    // Auto-clear message after 4 seconds
    setTimeout(() => {
      setUploadState(client, { message: "", type: "" });
    }, 4000);
  };

  const handleRemoveImage = async (client: string) => {
    if (!confirm(`Remover imagem de "${client}"?`)) return;

    setUploadState(client, { loading: true, message: "", type: "" });

    try {
      const res = await fetch("/api/admin/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to remove image");
      }

      setUploadState(client, {
        loading: false,
        message: "Imagem removida!",
        type: "success",
      });

      await loadProjects();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Erro ao remover imagem";
      setUploadState(client, {
        loading: false,
        message,
        type: "error",
      });
    }

    setTimeout(() => {
      setUploadState(client, { message: "", type: "" });
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black text-white py-12 px-6">
      {/* Background grid */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,27,27,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,27,27,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-bold mb-1">🖼️ Imagens do Portfólio</h1>
            <p className="text-white/50 text-sm">
              Gerencie as imagens dos projetos exibidos no portfólio
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/admin"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm text-white/70 hover:text-white transition"
            >
              📹 Vídeos
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/40 rounded-lg text-red-400 hover:text-red-300 transition text-sm font-medium"
              title="Sair da área de admin"
            >
              <LogOut size={16} />
              Sair
            </button>
          </div>
        </div>

        {/* Info banner */}
        <div className="mb-8 p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-white/50">
          <p>
            💡 As imagens são exibidas no cartão de cada projeto no portfólio
            público. Formatos aceitos: JPEG, PNG, WebP, GIF — máximo 5MB.
          </p>
        </div>

        {/* Projects list */}
        {loadingProjects ? (
          <div className="flex items-center justify-center py-24">
            <RotateCw size={24} className="animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => {
              const state = uploadStates[project.client] || {
                loading: false,
                message: "",
                type: "",
              };

              return (
                <div
                  key={project.client}
                  className="bg-slate-900/50 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    {/* Image preview */}
                    <div className="relative flex-shrink-0">
                      <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center">
                        {project.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={project.image}
                            alt={project.client}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Users size={28} className="text-slate-600" />
                        )}
                      </div>
                      {project.image && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle size={12} className="text-white" />
                        </div>
                      )}
                    </div>

                    {/* Project info & controls */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {project.client}
                      </h3>
                      <p className="text-sm text-white/40 mb-4">
                        {project.image ? (
                          <span className="text-green-400/80">
                            ✓ Imagem definida
                          </span>
                        ) : (
                          <span className="text-white/30">
                            Sem imagem — exibindo ícone padrão
                          </span>
                        )}
                      </p>

                      <div className="flex flex-wrap items-center gap-3">
                        {/* Upload button */}
                        <label className="cursor-pointer">
                          <input
                            ref={(el) => {
                              fileInputRefs.current[project.client] = el;
                            }}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            className="hidden"
                            onChange={(e) =>
                              handleFileChange(project.client, e)
                            }
                            disabled={state.loading}
                          />
                          <span
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                              state.loading
                                ? "bg-slate-700 text-white/40 cursor-not-allowed"
                                : "bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary hover:text-primary/80 cursor-pointer"
                            }`}
                          >
                            {state.loading ? (
                              <>
                                <RotateCw size={14} className="animate-spin" />
                                Enviando...
                              </>
                            ) : (
                              <>
                                <Upload size={14} />
                                {project.image
                                  ? "Trocar imagem"
                                  : "Adicionar imagem"}
                              </>
                            )}
                          </span>
                        </label>

                        {/* Remove button */}
                        {project.image && (
                          <button
                            onClick={() => handleRemoveImage(project.client)}
                            disabled={state.loading}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-600/10 hover:bg-red-600/20 border border-red-600/20 text-red-400 hover:text-red-300 transition disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Trash2 size={14} />
                            Remover
                          </button>
                        )}

                        {/* View image */}
                        {project.image && (
                          <a
                            href={project.image}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white/50 hover:text-white/80 transition"
                          >
                            <ImageIcon size={14} />
                            Ver
                          </a>
                        )}
                      </div>

                      {/* Status message */}
                      {state.message && (
                        <div
                          className={`mt-3 flex items-center gap-2 text-sm ${
                            state.type === "success"
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {state.type === "success" ? (
                            <CheckCircle size={14} />
                          ) : (
                            <XCircle size={14} />
                          )}
                          {state.message}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer note */}
        <div className="mt-12 text-center">
          <p className="text-white/20 text-xs">
            Painel de administração — acesso restrito
          </p>
        </div>
      </div>
    </div>
  );
}
