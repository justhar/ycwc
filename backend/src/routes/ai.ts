import { Hono } from "hono";
import { cors } from "hono/cors";
import { AIService } from "../utils/ai-service.js";
import { db } from "../db/db.js";
import { universities } from "../db/schema.js";
import { authMiddleware } from "../middleware/auth.js";

const ai = new Hono();

// Localization messages
const messages = {
  en: {
    noFileUploaded: "No file uploaded",
    invalidFileType: "Invalid file type. Please upload a PDF file.",
    fileTooLarge: "File too large. Maximum size is 10MB.",
    fileProcessingError: "Error processing the uploaded file",
    profileAutofillSuccess: "Profile data extracted successfully",
    noUniversitiesFound: "No universities found in database",
    aiMatchingFailed: "AI matching failed",
    universityMatchError: "Failed to generate university matches",
    invalidProfileData: "Invalid profile data provided",
    databaseError: "Database operation failed",
  },
  id: {
    noFileUploaded: "Tidak ada file yang diunggah",
    invalidFileType: "Tipe file tidak valid. Silakan unggah file PDF.",
    fileTooLarge: "File terlalu besar. Ukuran maksimum adalah 10MB.",
    fileProcessingError: "Error memproses file yang diunggah",
    profileAutofillSuccess: "Data profil berhasil diekstrak",
    noUniversitiesFound: "Tidak ada universitas yang ditemukan di database",
    aiMatchingFailed: "Pencocokan AI gagal",
    universityMatchError: "Gagal menghasilkan kecocokan universitas",
    invalidProfileData: "Data profil yang diberikan tidak valid",
    databaseError: "Operasi database gagal",
  },
};

// Type for message keys
type MessageKey = keyof typeof messages.en;

// Helper function to get localized message
const getLocalizedMessage = (c: any, key: MessageKey): string => {
  const acceptLanguage = c.req.header("Accept-Language") || "id";
  const locale = acceptLanguage.startsWith("en") ? "en" : "id";
  return messages[locale][key] || messages.en[key] || key;
};

// Enable CORS for AI routes
const FRONTEND_URL =
  process.env.FRONTEND_URL || "https://abroadly-ycwc.vercel.app";

ai.use(
  "/*",
  cors({
    origin: [
      "https://abroadly-ycwc.vercel.app",
      "http://localhost:3000",
      "http://localhost:3001",
    ],
    credentials: true,
  })
);

// Initialize AI service
const aiService = new AIService();

// Profile autofill endpoint - handles both file upload and text extraction
ai.post("/profile-autofill", async (c) => {
  try {
    let analysisResult;

    // Try to get file from form data
    try {
      const formData = await c.req.formData();
      const cvFile = formData.get("file") as File;

      if (cvFile) {
        // File upload path - use Files API
        const validMimeTypes = ["application/pdf", "application/x-pdf"];
        if (!validMimeTypes.includes(cvFile.type)) {
          return c.json(
            {
              success: false,
              error: getLocalizedMessage(c, "invalidFileType"),
            },
            400
          );
        }

        const maxFileSize = 10 * 1024 * 1024; // 10MB
        if (cvFile.size > maxFileSize) {
          return c.json(
            {
              success: false,
              error: getLocalizedMessage(c, "fileTooLarge"),
            },
            400
          );
        }

        const fileBuffer = await cvFile.arrayBuffer();
        analysisResult = await aiService.analyzeCVFile(
          Buffer.from(fileBuffer),
          cvFile.type
        );
      } else {
        // Fallback to JSON body with cvText (text extraction path)
        const body = await c.req.json();
        const { cvText } = body;

        if (!cvText || typeof cvText !== "string") {
          return c.json(
            {
              success: false,
              error: getLocalizedMessage(c, "noFileUploaded"),
            },
            400
          );
        }

        // Validate text length (approximate 10MB limit for text)
        if (cvText.length > 10 * 1024 * 1024) {
          return c.json(
            {
              success: false,
              error: getLocalizedMessage(c, "fileTooLarge"),
            },
            400
          );
        }

        if (!cvText.trim()) {
          return c.json(
            {
              success: false,
              error: "Could not extract text from PDF",
            },
            400
          );
        }

        analysisResult = await aiService.analyzeCVText(cvText);
      }
    } catch (parseError) {
      // If form parsing fails, try JSON body
      const body = await c.req.json().catch(() => null);

      if (!body || !body.cvText) {
        return c.json(
          {
            success: false,
            error: getLocalizedMessage(c, "noFileUploaded"),
          },
          400
        );
      }

      const { cvText } = body;

      if (!cvText || typeof cvText !== "string") {
        return c.json(
          {
            success: false,
            error: getLocalizedMessage(c, "noFileUploaded"),
          },
          400
        );
      }

      analysisResult = await aiService.analyzeCVText(cvText);
    }

    if (!analysisResult.success) {
      return c.json(
        {
          success: false,
          error: analysisResult.error,
        },
        500
      );
    }

    console.log("✅ AI analysis complete, returning data:", {
      intendedCountry: analysisResult.data?.intendedCountry,
      budgetMin: analysisResult.data?.budgetMin,
      budgetMax: analysisResult.data?.budgetMax,
    });

    return c.json({
      success: true,
      data: analysisResult.data,
      message: getLocalizedMessage(c, "profileAutofillSuccess"),
    });
  } catch (error) {
    console.error("💥 AI profile autofill error:", error);

    // Handle specific errors
    if (error instanceof Error) {
      console.log("🔍 Error details:", {
        message: error.message,
        stack: error.stack,
      });

      if (error.message.includes("API key")) {
        console.log("❌ API key error");
        return c.json(
          {
            success: false,
            error: "AI service configuration error",
          },
          500
        );
      }
    }

    console.log("❌ Unknown error occurred");
    return c.json(
      {
        success: false,
        error: "Failed to process CV. Please try again.",
      },
      500
    );
  }
});

// Chat endpoint (placeholder for future implementation)
ai.post("/chat", async (c) => {
  try {
    const { message, conversationHistory } = await c.req.json();

    if (!message) {
      return c.json(
        {
          success: false,
          error: "Message is required",
        },
        400
      );
    }

    // TODO: Implement actual chat AI using aiService
    return c.json({
      success: true,
      data: {
        response: "AI chat feature coming soon!",
        conversationId: Date.now().toString(),
      },
    });
  } catch (error) {
    console.error("AI chat error:", error);
    return c.json(
      {
        success: false,
        error: "Failed to process chat message",
      },
      500
    );
  }
});

// Task suggestions endpoint (placeholder for future implementation)
ai.post("/task-suggestions", async (c) => {
  try {
    const { currentProfile, goals } = await c.req.json();

    // TODO: Implement AI task suggestions using aiService
    return c.json({
      success: true,
      data: {
        suggestions: [
          "Complete your standardized test preparation",
          "Research target universities",
          "Prepare application essays",
        ],
      },
    });
  } catch (error) {
    console.error("AI task suggestions error:", error);
    return c.json(
      {
        success: false,
        error: "Failed to generate task suggestions",
      },
      500
    );
  }
});

// University matching endpoint
ai.post("/match", authMiddleware, async (c) => {
  try {
    const requestBody = await c.req.json();
    const { profile } = requestBody;

    if (!profile) {
      return c.json(
        {
          success: false,
          error: getLocalizedMessage(c, "invalidProfileData"),
        },
        400
      );
    }

    // Fetch all universities from database
    const allUniversities = await db.select().from(universities);

    if (allUniversities.length === 0) {
      return c.json(
        {
          success: false,
          error: getLocalizedMessage(c, "noUniversitiesFound"),
        },
        404
      );
    }

    // Use AI service to match universities
    const matchingResult = await aiService.matchUniversities(
      profile,
      allUniversities
    );

    if (!matchingResult.success) {
      return c.json(
        {
          success: false,
          error:
            matchingResult.error || getLocalizedMessage(c, "aiMatchingFailed"),
        },
        500
      );
    }

    // Handle suggested universities - insert them into database with deduplication
    let insertedSuggestions: any[] = [];
    if (
      matchingResult.suggestedUniversities &&
      matchingResult.suggestedUniversities.length > 0
    ) {
      try {
        insertedSuggestions = await aiService.insertSuggestedUniversities(
          matchingResult.suggestedUniversities,
          db
        );
      } catch (error) {
        console.error("❌ Failed to insert suggested universities:", error);
        // Continue without failing the entire request
      }
    }

    return c.json({
      success: true,
      data: {
        matches: matchingResult.matches || [],
        suggestedUniversities: insertedSuggestions.length > 0 ? insertedSuggestions : matchingResult.suggestedUniversities || [],
        insertedSuggestions: insertedSuggestions,
        totalMatches: matchingResult.matches?.length || 0,
      },
    });
  } catch (error) {
    console.error("❌ University match error:", error);
    return c.json(
      {
        success: false,
        error: getLocalizedMessage(c, "universityMatchError"),
      },
      500
    );
  }
});

export default ai;
