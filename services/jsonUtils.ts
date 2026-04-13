
/**
 * Cleans a string that is expected to be JSON, removing markdown blocks and trailing commas.
 */
export const cleanAIJson = (text: string): string => {
  if (!text) return "{}";
  
  let cleaned = text.trim();
  
  // Remove markdown code blocks if present
  if (cleaned.startsWith("```")) {
    const lines = cleaned.split("\n");
    if (lines[0].startsWith("```")) {
      lines.shift(); // Remove opening ```json or ```
    }
    if (lines[lines.length - 1].startsWith("```")) {
      lines.pop(); // Remove closing ```
    }
    cleaned = lines.join("\n").trim();
  }
  
  // Remove trailing commas in arrays and objects
  // This regex looks for a comma followed by a closing bracket or brace, possibly with whitespace in between.
  cleaned = cleaned.replace(/,\s*([\]}])/g, "$1");
  
  return cleaned;
};

/**
 * Safely parses JSON from an AI response.
 */
export const safeParseJson = (text: string, fallback: any = {}): any => {
  try {
    const cleaned = cleanAIJson(text);
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Failed to parse AI JSON:", e, "\nOriginal text:", text);
    return fallback;
  }
};
