import { Hono } from "hono";
import { cors } from "hono/cors";
import { PDFParse } from "pdf-parse";
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
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

ai.use(
  "/*",
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

// Initialize AI service
const aiService = new AIService();

// Profile autofill endpoint
ai.post("/profile-autofill", async (c) => {
  try {
    const formData = await c.req.formData();

    // Get the uploaded file
    const file = formData.get("cv") as File;

    if (!file || !(file instanceof File)) {
      return c.json(
        {
          success: false,
          error: getLocalizedMessage(c, "noFileUploaded"),
        },
        400
      );
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      return c.json(
        {
          success: false,
          error: getLocalizedMessage(c, "invalidFileType"),
        },
        400
      );
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return c.json(
        {
          success: false,
          error: getLocalizedMessage(c, "fileTooLarge"),
        },
        400
      );
    }

    // Convert file to buffer for pdf-parse
    const fileBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(fileBuffer);

    // Parse PDF content using ESM API
    const parser = new PDFParse({ data: buffer });
    const textResult = await parser.getText();
    const pdfText = textResult.text;
    await parser.destroy();

    if (!pdfText.trim()) {
      return c.json(
        {
          success: false,
          error: "Could not extract text from PDF",
        },
        400
      );
    }

    // Extract profile data using AI
    const analysisResult = await aiService.analyzeCVText(pdfText);
    if (!analysisResult.success) {
      return c.json(
        {
          success: false,
          error: analysisResult.error,
        },
        500
      );
    }
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

      if (error.message.includes("Only PDF files are allowed")) {
        console.log("❌ File type error");
        return c.json(
          {
            success: false,
            error: getLocalizedMessage(c, "invalidFileType"),
          },
          400
        );
      }

      if (error.message.includes("File too large")) {
        console.log("❌ File size error");
        return c.json(
          {
            success: false,
            error: getLocalizedMessage(c, "fileTooLarge"),
          },
          400
        );
      }

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
        suggestedUniversities: matchingResult.suggestedUniversities || [],
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
