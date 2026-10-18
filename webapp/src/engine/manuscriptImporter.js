/**
 * Manuscript Import & Chapter Splitting Engine (Bohemica Studio)
 * Parses plain text / Markdown files into structured chapters and scenes.
 */

export function parseManuscriptText(rawText, options = { splitByHeadings: true, customDelimiter: "" }) {
  if (!rawText || !rawText.trim()) {
    return { chapters: [] };
  }

  const text = rawText.replace(/\r\n/g, "\n");
  const chapters = [];

  // Default Regex patterns for Czech chapter markers:
  // - Markdown headings: # Kapitola..., ## 1..., # Chapter...
  // - Czech textual markers: Kapitola I, Kapitola 1, Část 1, KAPITOLA PRVNÍ
  // - Divider lines: ---, ***, ===
  let chapterRegex = /(?:\n|^)(?=#+\s+|\b(?:Kapitola|KAPITOLA|Část|ČÁST|Chapter|CHAPTER)\b[^\n]*|\n(?:---|\*\*\*|===)+\n)/g;

  if (options.customDelimiter && options.customDelimiter.trim()) {
    try {
      chapterRegex = new RegExp(options.customDelimiter, "gi");
    } catch (e) {
      console.warn("Invalid custom regex delimiter, fallback to default", e);
    }
  }

  // Split text by chapter headings
  const rawBlocks = text.split(chapterRegex).filter((b) => b.trim().length > 0);

  if (rawBlocks.length <= 1) {
    // If no explicit chapter markers found, split into chapters every ~2000 words or by double headings
    const paragraphs = text.split(/\n\s*\n/);
    let currentChapText = "";
    let wordCount = 0;
    let chapIndex = 1;

    paragraphs.forEach((p) => {
      const pWords = p.trim().split(/\s+/).length;
      if (wordCount + pWords > 2500 && currentChapText.trim().length > 0) {
        chapters.push({
          id: `chap-imp-${Date.now()}-${chapIndex}`,
          title: `Kapitola ${chapIndex}`,
          scenes: [
            {
              id: `scene-imp-${Date.now()}-${chapIndex}-1`,
              title: "Scéna 1",
              content: currentChapText.trim()
            }
          ]
        });
        chapIndex++;
        currentChapText = "";
        wordCount = 0;
      }
      currentChapText += p + "\n\n";
      wordCount += pWords;
    });

    if (currentChapText.trim().length > 0) {
      chapters.push({
        id: `chap-imp-${Date.now()}-${chapIndex}`,
        title: `Kapitola ${chapIndex}`,
        scenes: [
          {
            id: `scene-imp-${Date.now()}-${chapIndex}-1`,
            title: "Scéna 1",
            content: currentChapText.trim()
          }
        ]
      });
    }
  } else {
    // Process detected chapter blocks
    rawBlocks.forEach((block, idx) => {
      const lines = block.trim().split("\n");
      let title = lines[0].replace(/^#+\s*/, "").replace(/^[-*=]+\s*/, "").trim();

      // Fallback title if line is empty or too long
      if (!title || title.length > 80) {
        title = `Kapitola ${idx + 1}`;
      }

      const content = lines.slice(title === lines[0].replace(/^#+\s*/, "").replace(/^[-*=]+\s*/, "").trim() ? 1 : 0).join("\n").trim();

      // Split scene by *** or --- inside chapter if present
      const sceneBlocks = content.split(/\n\s*(?:\*\*\*|---|===)\s*\n/).filter((s) => s.trim().length > 0);

      const scenes = sceneBlocks.map((scContent, sIdx) => ({
        id: `scene-imp-${Date.now()}-${idx + 1}-${sIdx + 1}`,
        title: `Scéna ${sIdx + 1}`,
        content: scContent.trim()
      }));

      chapters.push({
        id: `chap-imp-${Date.now()}-${idx + 1}`,
        title: title,
        scenes: scenes.length > 0 ? scenes : [{
          id: `scene-imp-${Date.now()}-${idx + 1}-1`,
          title: "Scéna 1",
          content: content || "Prázdná scéna"
        }]
      });
    });
  }

  return { chapters };
}
