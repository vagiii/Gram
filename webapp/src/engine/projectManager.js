import { INITIAL_NOVEL } from "../data/sampleNovel";

/**
 * Loads project databases from local storage, performing backward-compatible
 * migration from single-novel schema if present.
 */
export function loadProjectsFromStorage() {
  const savedProjects = localStorage.getItem("bohemica_projects");
  if (savedProjects) {
    try {
      return JSON.parse(savedProjects);
    } catch (e) {
      console.error("Failed to parse saved projects", e);
    }
  }

  // Fallback / migration path from single book schema
  const oldSaved = localStorage.getItem("bohemica_novel_data");
  if (oldSaved) {
    try {
      const parsed = JSON.parse(oldSaved);
      const firstProject = {
        id: parsed.id || `proj-${Date.now()}`,
        title: parsed.title || "Můj román",
        author: parsed.author || "Autor",
        targetWordCount: parsed.targetWordCount || 50000,
        chapters: parsed.chapters || [],
        codex: parsed.codex || [],
        createdAt: parsed.createdAt || new Date().toISOString()
      };
      const projectsList = [firstProject];
      localStorage.setItem("bohemica_projects", JSON.stringify(projectsList));
      localStorage.setItem("bohemica_active_project_id", firstProject.id);
      return projectsList;
    } catch (e) {
      console.error("Failed to migrate old novel data", e);
    }
  }

  // Return default novel template
  const defaultProject = {
    id: "default-project",
    ...INITIAL_NOVEL,
    createdAt: new Date().toISOString()
  };
  return [defaultProject];
}
