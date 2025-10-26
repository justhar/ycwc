import { GoogleGenAI } from "@google/genai";
import { drizzle } from "drizzle-orm/node-postgres";
import {
  universities,
  scholarships,
  universityScholarships,
} from "../db/schema.js";
import { eq, and, sql } from "drizzle-orm";

const API_BASE_URL = process.env.API_BASE_URL || "https://ycwc-backend.vercel.app";

export interface ProfileData {
  fullName?: string;
  dateOfBirth?: string;
  nationality?: string;
  email?: string;
  phone?: string;
  targetLevel?: "undergraduate" | "graduate" | "postgraduate";
  intendedMajor?: string;
  institution?: string;
  graduationYear?: number;
  academicScore?: string;
  scoreScale?: "gpa4" | "gpa5" | "percentage" | "other";
  englishTests?: Array<{
    type: string;
    score: string;
    date: string;
  }>;
  standardizedTests?: Array<{
    type: string;
    score: string;
    date: string;
  }>;
  awards?: Array<{
    title: string;
    year: string;
    level: string;
  }>;
  extracurriculars?: Array<{
    activity: string;
    period: string;
    description?: string;
  }>;
  intendedCountry?: string;
  budgetMin?: number;
  budgetMax?: number;
}

export interface AIAnalysisResult {
  success: boolean;
  data?: ProfileData;
  error?: string;
  confidence?: number;
}

export interface UniversityMatch {
  university: any;
  matchScore: number;
  reasoning: string;
  strengths: string[];
  concerns: string[];
}

export interface MatchingResult {
  success: boolean;
  matches?: UniversityMatch[];
  suggestedUniversities?: any[];
  error?: string;
}

class AIService {
  private genai: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_API_KEY environment variable is required");
    }

    this.genai = new GoogleGenAI({ apiKey });
    // Don't initialize model here, use genai.models.generateContent directly
  }

  async analyzeCVText(cvText: string): Promise<AIAnalysisResult> {
    try {
      const prompt = this.createProfileExtractionPrompt(cvText);

      const response = await this.genai.models.generateContent({
        model: "gemini-2.0-flash-001",
        contents: prompt,
        config: {
          temperature: 0.1,
          maxOutputTokens: 2048,
        },
      });

      const result = response.text || "";
      const parsedData = this.parseAIResponse(result);

      return {
        success: true,
        data: parsedData,
        confidence: 0.85,
      };
    } catch (error) {
      console.error("AI Analysis Error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "AI analysis failed",
      };
    }
  }

  private createProfileExtractionPrompt(cvText: string): string {
    return `
You are an expert CV/Resume analyzer. Extract academic and personal information from the following CV text and return it in JSON format.

CV Text:
${cvText}

Please extract the following information and return it as a JSON object:

{
  "fullName": "extracted full name",
  "email": "extracted email address",
  "phone": "extracted phone number",
  "dateOfBirth": "extracted date of birth in YYYY-MM-DD format",
  "nationality": "extracted nationality",
  "targetLevel": "undergraduate|graduate|postgraduate based on education level",
  "intendedMajor": "extracted field of study or major",
  "institution": "current or most recent educational institution",
  "graduationYear": "graduation year as number",
  "academicScore": "GPA or academic score if mentioned",
  "scoreScale": "gpa4|gpa5|percentage|other based on score type",
  "englishTests": [
    {
      "type": "TOEFL|IELTS|TOEIC|etc",
      "score": "score value",
      "date": "test date if available"
    }
  ],
  "standardizedTests": [
    {
      "type": "SAT|ACT|GRE|GMAT|etc",
      "score": "score value", 
      "date": "test date if available"
    }
  ],
  "awards": [
    {
      "title": "award title",
      "year": "year received",
      "level": "local|national|international"
    }
  ],
  "extracurriculars": [
    {
      "activity": "activity name",
      "period": "time period",
      "description": "brief description"
    }
  ]
}

Rules:
1. Only include fields that are clearly mentioned in the CV
2. Use null for missing information
3. Be conservative in your extractions - only include data you're confident about
4. For dates, use YYYY-MM-DD format when possible
5. Return only valid JSON, no additional text
6. If a field is not found, omit it from the JSON or set it to null
`;
  }

  private parseAIResponse(response: string): ProfileData {
    try {
      // Clean the response to extract JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in AI response");
      }

      const jsonString = jsonMatch[0];
      const parsed = JSON.parse(jsonString);

      // Validate and clean the parsed data
      const cleanedData: ProfileData = {};

      if (parsed.fullName && typeof parsed.fullName === "string") {
        cleanedData.fullName = parsed.fullName.trim();
      }

      if (parsed.email && typeof parsed.email === "string") {
        cleanedData.email = parsed.email.trim();
      }

      if (parsed.dateOfBirth && typeof parsed.dateOfBirth === "string") {
        cleanedData.dateOfBirth = parsed.dateOfBirth;
      }

      if (parsed.nationality && typeof parsed.nationality === "string") {
        cleanedData.nationality = parsed.nationality.trim();
      }

      if (
        parsed.targetLevel &&
        ["undergraduate", "graduate", "postgraduate"].includes(
          parsed.targetLevel
        )
      ) {
        cleanedData.targetLevel = parsed.targetLevel;
      }

      if (parsed.intendedMajor && typeof parsed.intendedMajor === "string") {
        cleanedData.intendedMajor = parsed.intendedMajor.trim();
      }

      if (parsed.institution && typeof parsed.institution === "string") {
        cleanedData.institution = parsed.institution.trim();
      }

      if (parsed.graduationYear && typeof parsed.graduationYear === "number") {
        cleanedData.graduationYear = parsed.graduationYear;
      }

      if (parsed.academicScore && typeof parsed.academicScore === "string") {
        cleanedData.academicScore = parsed.academicScore.trim();
      }

      if (
        parsed.scoreScale &&
        ["gpa4", "gpa5", "percentage", "other"].includes(parsed.scoreScale)
      ) {
        cleanedData.scoreScale = parsed.scoreScale;
      }

      // Clean array fields
      if (Array.isArray(parsed.englishTests)) {
        cleanedData.englishTests = parsed.englishTests.filter(
          (test: any) =>
            test &&
            typeof test.type === "string" &&
            typeof test.score === "string"
        );
      }

      if (Array.isArray(parsed.standardizedTests)) {
        cleanedData.standardizedTests = parsed.standardizedTests.filter(
          (test: any) =>
            test &&
            typeof test.type === "string" &&
            typeof test.score === "string"
        );
      }

      if (Array.isArray(parsed.awards)) {
        cleanedData.awards = parsed.awards.filter(
          (award: any) => award && typeof award.title === "string"
        );
      }

      if (Array.isArray(parsed.extracurriculars)) {
        cleanedData.extracurriculars = parsed.extracurriculars.filter(
          (activity: any) => activity && typeof activity.activity === "string"
        );
      }

      return cleanedData;
    } catch (error) {
      console.error("Error parsing AI response:", error);
      return {};
    }
  }

  // University Matching Method
  async matchUniversities(
    userProfile: ProfileData,
    universities: any[]
  ): Promise<MatchingResult> {
    console.log("🎯 Starting AI university matching...");

    try {
      // Prepare universities data for AI analysis
      const universitiesForAI = universities.map((uni) => ({
        id: uni.id,
        name: uni.name,
        location: uni.location,
        country: uni.country,
        ranking: uni.ranking,
        type: uni.type,
        tuitionRange: uni.tuitionRange,
        acceptanceRate: uni.acceptanceRate,
        specialties: uni.specialties,
        description: uni.description,
      }));

      const prompt = `You are an expert university admissions counselor. Analyze the user profile and match them with the most suitable universities from the provided list.

USER PROFILE:
- Name: ${userProfile.fullName || "Not provided"}
- Target Level: ${userProfile.targetLevel || "Not specified"}
- Intended Major: ${userProfile.intendedMajor || "Not specified"}
- Current Institution: ${userProfile.institution || "Not specified"}
- Graduation Year: ${userProfile.graduationYear || "Not specified"}
- Academic Score: ${userProfile.academicScore || "Not provided"} (Scale: ${
        userProfile.scoreScale || "Not specified"
      })
- Nationality: ${userProfile.nationality || "Not specified"}
- Intended Study Abroad Country: ${
        userProfile.intendedCountry || "Not specified"
      }
- Budget Range: ${
        userProfile.budgetMin && userProfile.budgetMax
          ? `$${userProfile.budgetMin.toLocaleString()} - $${userProfile.budgetMax.toLocaleString()} per year`
          : userProfile.budgetMin
          ? `Minimum $${userProfile.budgetMin.toLocaleString()} per year`
          : userProfile.budgetMax
          ? `Maximum $${userProfile.budgetMax.toLocaleString()} per year`
          : "Not specified"
      }

English Test Scores:
${
  userProfile.englishTests
    ?.map((test) => `- ${test.type}: ${test.score} (${test.date})`)
    .join("\n") || "- No English test scores provided"
}

Standardized Test Scores:
${
  userProfile.standardizedTests
    ?.map((test) => `- ${test.type}: ${test.score} (${test.date})`)
    .join("\n") || "- No standardized test scores provided"
}

Awards & Achievements:
${
  userProfile.awards
    ?.map((award) => `- ${award.title} (${award.year}) - ${award.level} level`)
    .join("\n") || "- No awards provided"
}

Extracurricular Activities:
${
  userProfile.extracurriculars
    ?.map(
      (activity) =>
        `- ${activity.activity} (${activity.period}): ${
          activity.description || ""
        }`
    )
    .join("\n") || "- No extracurricular activities provided"
}

AVAILABLE UNIVERSITIES:
${JSON.stringify(universitiesForAI, null, 2)}

TASK:
1. Analyze each existing university and calculate a match score (0-100) based on academic fit, program alignment, cultural/geographic fit, financial fit, and admission probability.

2. For each existing university, provide match score, detailed reasoning, 2-3 key strengths, and 1-2 potential concerns.

3. Suggest 2-3 additional universities NOT in the provided list with complete realistic information including scholarships.

4. Rank all matches by score (highest first).

CRITICAL: Respond ONLY with valid JSON. Do not include any text before or after the JSON. Do not use markdown code blocks. Start your response with { and end with }.

RESPONSE FORMAT (JSON only):
{
  "matches": [
    {
      "universityId": "string",
      "matchScore": number,
      "reasoning": "string",
      "strengths": ["string"],
      "concerns": ["string"]
    }
  ],
  "suggestedUniversities": [
    {
      "name": "string",
      "location": "string",
      "country": "string",
      "reasoning": "string",
      "estimatedMatchScore": number,
      "specialties": ["string"],
      "type": "string",
      "ranking": number,
      "studentCount": number,
      "establishedYear": number,
      "tuitionRange": "string",
      "acceptanceRate": "string",
      "description": "string",
      "website": "string",
      "campusSize": "string",
      "roomBoardCost": "string",
      "booksSuppliesCost": "string",
      "personalExpensesCost": "string",
      "facilitiesInfo": {
        "library": "string",
        "recreationCenter": "string",
        "researchLabs": "string",
        "healthServices": "string"
      },
      "housingOptions": ["string"],
      "studentOrganizations": ["string"],
      "diningOptions": ["string"],
      "transportationInfo": ["string"],
      "scholarships": [
        {
          "name": "string",
          "type": "string",
          "amount": "string",
          "description": "string",
          "requirements": ["string"],
          "deadline": "string",
          "provider": "string",
          "applicationUrl": "string",
          "eligiblePrograms": ["string"],
          "maxRecipients": number
        }
      ]
    }
  ]
}

DATA TYPE RULES:
- All numbers must be actual numbers (not strings)
- maxRecipients must be number or null
- acceptanceRate must be string like "65.50"
- Respond with JSON only - no explanations, no markdown, no additional text.`;

      console.log("📤 Sending prompt to Gemini AI...");

      const result = await this.genai.models.generateContent({
        model: "gemini-2.0-flash-001",
        contents: prompt,
        config: {
          temperature: 0.0,
          maxOutputTokens: 4096,
        },
      });
      const aiResponseText = result.text || "";

      console.log("📥 Received AI response");

      // Parse the AI response
      let parsedResponse;
      try {
        // Clean the response - remove any markdown formatting and fix common issues
        console.log("Raw AI response length:", aiResponseText.length);
        console.log(
          "Raw AI response preview:",
          aiResponseText.substring(0, 500) +
            (aiResponseText.length > 500 ? "..." : "")
        );
        let cleanedResponse = aiResponseText
          .replace(/```json\n?|\n?```/g, "")
          .replace(/```\n?|\n?```/g, "")
          .trim();

        // Extract JSON by finding the outermost braces
        const firstBrace = cleanedResponse.indexOf("{");
        const lastBrace = cleanedResponse.lastIndexOf("}");
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          cleanedResponse = cleanedResponse.substring(
            firstBrace,
            lastBrace + 1
          );
        } else {
          throw new Error("No valid JSON object found in response");
        }

        // Fix common JSON issues
        cleanedResponse = cleanedResponse
          .replace(/,(\s*[}\]])/g, "$1") // Remove trailing commas
          .replace(/:\s*:/g, ":") // Fix double colons
          .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Quote unquoted keys
          .replace(/"null"/g, "null") // Fix quoted null values
          .replace(/:\s*"(\d+(?:\.\d+)?)"/g, ":$1") // Unquote numeric values (including decimals)
          .replace(/:\s*"(true|false)"/g, ":$1") // Unquote boolean values
          .replace(/:\s*"(\d{4}-\d{2}-\d{2})"/g, ':"$1"'); // Keep dates as strings

        console.log("Cleaned response length:", cleanedResponse.length);
        console.log(
          "Cleaned response preview:",
          cleanedResponse.substring(0, 500) +
            (cleanedResponse.length > 500 ? "..." : "")
        );

        // Handle incomplete JSON by attempting to complete it
        let bracketCount = 0;
        let arrayBracketCount = 0;
        for (let i = 0; i < cleanedResponse.length; i++) {
          if (cleanedResponse[i] === "{") bracketCount++;
          if (cleanedResponse[i] === "}") bracketCount--;
          if (cleanedResponse[i] === "[") arrayBracketCount++;
          if (cleanedResponse[i] === "]") arrayBracketCount--;
        }

        // If JSON is incomplete, try to close it properly
        if (bracketCount > 0 || arrayBracketCount > 0) {
          console.log("Attempting to fix incomplete JSON...");

          // Remove incomplete last object/array if present
          let lastCommaIndex = cleanedResponse.lastIndexOf(",");
          let lastOpenBrace = cleanedResponse.lastIndexOf("{");
          let lastOpenBracket = cleanedResponse.lastIndexOf("[");

          // If there's an incomplete object or array after the last comma
          if (
            lastCommaIndex > -1 &&
            (lastOpenBrace > lastCommaIndex || lastOpenBracket > lastCommaIndex)
          ) {
            cleanedResponse = cleanedResponse.substring(0, lastCommaIndex);
          }

          // Close remaining brackets
          while (arrayBracketCount > 0) {
            cleanedResponse += "]";
            arrayBracketCount--;
          }
          while (bracketCount > 0) {
            cleanedResponse += "}";
            bracketCount--;
          }
        }

        console.log("Attempting JSON parse...");
        parsedResponse = JSON.parse(cleanedResponse);
      } catch (parseError) {
        console.error("Failed to parse AI response:", parseError);
        console.error(
          "Error details:",
          parseError instanceof Error ? parseError.message : "Unknown error"
        );

        // Try a more aggressive cleaning approach
        try {
          console.log("Attempting more aggressive cleaning...");
          let aggressiveCleaned = aiResponseText
            .replace(/```json\n?|\n?```/g, "")
            .replace(/```\n?|\n?```/g, "")
            .trim();

          // Extract JSON
          const firstBrace = aggressiveCleaned.indexOf("{");
          const lastBrace = aggressiveCleaned.lastIndexOf("}");
          if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            aggressiveCleaned = aggressiveCleaned.substring(
              firstBrace,
              lastBrace + 1
            );
          }

          aggressiveCleaned = aggressiveCleaned
            .replace(/([{,]\s*)(\w+)\s*:\s*/g, '$1"$2":') // Ensure all keys are quoted
            .replace(
              /:\s*([^",{\[\s][^,}\]]*[^",}\]\s])\s*([,}\]])/g,
              ':"$1"$2'
            ) // Quote unquoted string values
            .replace(/:\s*(\d+(?:\.\d+)?)\s*([,}\]])/g, ":$1$2") // Unquote numbers
            .replace(/:\s*(true|false)\s*([,}\]])/g, ":$1$2") // Unquote booleans
            .replace(/:\s*null\s*([,}\]])/g, ":null$1") // Ensure null is not quoted
            .replace(/,(\s*[}\]])/g, "$1"); // Remove trailing commas

          console.log(
            "Aggressive cleaned preview:",
            aggressiveCleaned.substring(0, 500)
          );
          parsedResponse = JSON.parse(aggressiveCleaned);
          console.log("Successfully parsed with aggressive cleaning");
        } catch (aggressiveError) {
          console.error("Aggressive cleaning also failed:", aggressiveError);

          // Try a more aggressive approach - extract only the matches part if suggestedUniversities is causing issues
          try {
            console.log("Attempting to extract only matches...");
            const matchesMatch = aiResponseText.match(
              /"matches"\s*:\s*\[[\s\S]*?\]/
            );
            if (matchesMatch) {
              const matchesArray = matchesMatch[0].split(":")[1].trim();
              let matchesOnlyJson = `{"matches": ${matchesArray}, "suggestedUniversities": []}`;

              // Apply the same cleaning as main parsing
              matchesOnlyJson = matchesOnlyJson
                .replace(/,(\s*[}\]])/g, "$1") // Remove trailing commas
                .replace(/:\s*:/g, ":") // Fix double colons
                .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Quote unquoted keys
                .replace(/"null"/g, "null") // Fix quoted null values
                .replace(/:\s*"(\d+(?:\.\d+)?)"/g, ":$1") // Unquote numeric values (including decimals)
                .replace(/:\s*"(true|false)"/g, ":$1") // Unquote boolean values
                .replace(/:\s*"(\d{4}-\d{2}-\d{2})"/g, ':"$1"'); // Keep dates as strings

              console.log(
                "Matches only JSON:",
                matchesOnlyJson.substring(0, 1000)
              );
              parsedResponse = JSON.parse(matchesOnlyJson);
              console.log("Successfully parsed matches only");
            } else {
              throw new Error("Could not extract matches from response");
            }
          } catch (fallbackError) {
            console.error("Fallback parsing also failed:", fallbackError);
            return {
              success: false,
              error: "Failed to parse AI response after multiple attempts",
            };
          }
        }
      }

      // Process matches and add university data
      const processedMatches: UniversityMatch[] =
        parsedResponse.matches
          ?.map((match: any) => {
            const university = universities.find(
              (uni) => uni.id === match.universityId
            );
            return {
              university,
              matchScore:
                typeof match.matchScore === "string"
                  ? parseInt(match.matchScore)
                  : match.matchScore,
              reasoning: match.reasoning,
              strengths: match.strengths || [],
              concerns: match.concerns || [],
            };
          })
          .filter((match: any) => match.university) || [];

      // Sort by match score (highest first)
      processedMatches.sort((a, z) => z.matchScore - a.matchScore);

      // Process suggested universities to fix data types
      const processedSuggestedUniversities = (
        parsedResponse.suggestedUniversities || []
      ).map((uni: any) => {
        // Helper function to parse JSON strings or return arrays as-is
        const parseJsonField = (field: any) => {
          if (typeof field === "string") {
            try {
              return JSON.parse(field);
            } catch {
              return [];
            }
          }
          return Array.isArray(field) ? field : [];
        };

        return {
          ...uni,
          ranking:
            typeof uni.ranking === "string"
              ? parseInt(uni.ranking)
              : uni.ranking,
          studentCount:
            typeof uni.studentCount === "string"
              ? parseInt(uni.studentCount)
              : uni.studentCount,
          establishedYear:
            typeof uni.establishedYear === "string"
              ? parseInt(uni.establishedYear)
              : uni.establishedYear,
          estimatedMatchScore:
            typeof uni.estimatedMatchScore === "string"
              ? parseInt(uni.estimatedMatchScore)
              : uni.estimatedMatchScore,
          specialties: parseJsonField(uni.specialties),
          housingOptions: parseJsonField(uni.housingOptions),
          studentOrganizations: parseJsonField(uni.studentOrganizations),
          diningOptions: parseJsonField(uni.diningOptions),
          transportationInfo: parseJsonField(uni.transportationInfo),
          facilitiesInfo:
            typeof uni.facilitiesInfo === "string"
              ? (() => {
                  try {
                    return JSON.parse(uni.facilitiesInfo);
                  } catch {
                    return {};
                  }
                })()
              : uni.facilitiesInfo || {},
          scholarships: (parseJsonField(uni.scholarships) || []).map(
            (scholarship: any) => ({
              ...scholarship,
              maxRecipients:
                scholarship.maxRecipients === "null" ||
                scholarship.maxRecipients === null
                  ? null
                  : typeof scholarship.maxRecipients === "string"
                  ? parseInt(scholarship.maxRecipients)
                  : scholarship.maxRecipients,
              requirements: parseJsonField(scholarship.requirements),
              eligiblePrograms: parseJsonField(scholarship.eligiblePrograms),
            })
          ),
        };
      });

      return {
        success: true,
        matches: processedMatches,
        suggestedUniversities: processedSuggestedUniversities,
      };
    } catch (error) {
      console.error("University matching error:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  async insertSuggestedUniversities(
    suggestedUniversities: any[],
    db: any
  ): Promise<any[]> {
    const insertedUniversities: any[] = [];

    for (const suggested of suggestedUniversities) {
      try {
        // Check for duplicates by name and country
        const existingUniversity = await db
          .select()
          .from(universities)
          .where(
            and(
              eq(universities.name, suggested.name),
              eq(universities.country, suggested.country)
            )
          )
          .limit(1);

        if (existingUniversity.length > 0) {
          console.log(
            `🔄 University ${suggested.name} already exists, skipping...`
          );
          insertedUniversities.push(existingUniversity[0]);
          continue;
        }

        // Insert new university with AI-provided data
        const newUniversity = await db
          .insert(universities)
          .values({
            name: suggested.name,
            location: suggested.location,
            country: suggested.country,
            ranking: suggested.ranking || 999,
            studentCount: suggested.studentCount || 10000,
            establishedYear: suggested.establishedYear || 1900,
            type: suggested.type === "private" ? "private" : "public",
            tuitionRange: suggested.tuitionRange || "Contact for details",
            acceptanceRate: suggested.acceptanceRate || "50.00",
            description:
              suggested.description ||
              suggested.reasoning ||
              `University recommended by AI matching system. Specializes in ${
                suggested.specialties?.join(", ") || "various fields"
              }.`,
            website: suggested.website || "#",
            imageUrl: null,
            specialties: suggested.specialties || [],
            campusSize: suggested.campusSize || "Medium",
            // Additional detailed fields from AI
            roomBoardCost: suggested.roomBoardCost || null,
            booksSuppliesCost: suggested.booksSuppliesCost || null,
            personalExpensesCost: suggested.personalExpensesCost || null,
            facilitiesInfo: suggested.facilitiesInfo || {},
            housingOptions: suggested.housingOptions || [],
            studentOrganizations: suggested.studentOrganizations || [],
            diningOptions: suggested.diningOptions || [],
            transportationInfo: suggested.transportationInfo || [],
            source: "ai_suggested", // Mark as AI suggested
          })
          .returning();

        console.log(`✅ Inserted AI suggested university: ${suggested.name}`);

        // Insert associated scholarships if provided
        if (suggested.scholarships && Array.isArray(suggested.scholarships)) {
          for (const scholarshipData of suggested.scholarships) {
            try {
              // Check if scholarship already exists by name and provider
              const existingScholarship = await db
                .select()
                .from(scholarships)
                .where(
                  and(
                    eq(scholarships.name, scholarshipData.name),
                    eq(
                      scholarships.provider,
                      scholarshipData.provider || "Unknown"
                    )
                  )
                )
                .limit(1);

              let scholarship;
              if (existingScholarship.length > 0) {
                scholarship = existingScholarship[0];
                console.log(
                  `🔄 Scholarship ${scholarshipData.name} already exists, linking to university...`
                );
              } else {
                // Insert new scholarship
                const newScholarship = await db
                  .insert(scholarships)
                  .values({
                    name: scholarshipData.name,
                    type:
                      scholarshipData.type === "fully-funded"
                        ? "fully-funded"
                        : scholarshipData.type === "partially-funded"
                        ? "partially-funded"
                        : "tuition-only",
                    amount: scholarshipData.amount || "Amount varies",
                    description:
                      scholarshipData.description ||
                      "AI suggested scholarship opportunity.",
                    requirements: scholarshipData.requirements || [],
                    deadline:
                      scholarshipData.deadline || "Contact for deadline",
                    provider: scholarshipData.provider || "Unknown",
                    country: suggested.country,
                    applicationUrl: scholarshipData.applicationUrl || null,
                    eligiblePrograms: scholarshipData.eligiblePrograms || [],
                    maxRecipients:
                      typeof scholarshipData.maxRecipients === "number"
                        ? scholarshipData.maxRecipients
                        : typeof scholarshipData.maxRecipients === "string" &&
                          !isNaN(Number(scholarshipData.maxRecipients))
                        ? Number(scholarshipData.maxRecipients)
                        : null,
                  })
                  .returning();

                scholarship = newScholarship[0];
                console.log(`✅ Inserted scholarship: ${scholarshipData.name}`);
              }

              // Create university-scholarship relationship
              await db.insert(universityScholarships).values({
                universityId: newUniversity[0].id,
                scholarshipId: scholarship.id,
              });

              console.log(
                `🔗 Linked scholarship ${scholarshipData.name} to university ${suggested.name}`
              );
            } catch (scholarshipError) {
              console.error(
                `❌ Failed to process scholarship ${scholarshipData.name}:`,
                scholarshipError
              );
              // Continue with other scholarships even if one fails
            }
          }
        }

        // Also try to match existing scholarships based on country and specialties
        await this.matchExistingScholarships(
          newUniversity[0].id,
          suggested.country,
          suggested.specialties || [],
          db
        );

        insertedUniversities.push(newUniversity[0]);
      } catch (error) {
        console.error(
          `❌ Failed to insert university ${suggested.name}:`,
          error
        );
        // Continue with other universities even if one fails
      }
    }

    return insertedUniversities;
  }

  async matchExistingScholarships(
    universityId: string,
    country: string,
    specialties: string[],
    db: any
  ): Promise<void> {
    try {
      console.log(
        `🔍 Looking for existing scholarships for country: ${country}, specialties: ${specialties.join(
          ", "
        )}`
      );

      // Find scholarships that match the university's country and programs
      const matchingScholarships = await db
        .select()
        .from(scholarships)
        .where(eq(scholarships.country, country))
        .limit(5); // Limit to avoid too many matches

      for (const scholarship of matchingScholarships) {
        // Check if this scholarship's eligible programs overlap with university specialties
        const hasMatchingPrograms = scholarship.eligiblePrograms.some(
          (program: string) =>
            specialties.some(
              (specialty) =>
                specialty.toLowerCase().includes(program.toLowerCase()) ||
                program.toLowerCase().includes(specialty.toLowerCase())
            )
        );

        if (hasMatchingPrograms || scholarship.eligiblePrograms.length === 0) {
          // Check if relationship already exists
          const existingLink = await db
            .select()
            .from(universityScholarships)
            .where(
              and(
                eq(universityScholarships.universityId, universityId),
                eq(universityScholarships.scholarshipId, scholarship.id)
              )
            )
            .limit(1);

          if (existingLink.length === 0) {
            // Create new relationship
            await db.insert(universityScholarships).values({
              universityId: universityId,
              scholarshipId: scholarship.id,
            });

            console.log(
              `🔗 Matched existing scholarship ${scholarship.name} to AI university`
            );
          }
        }
      }
    } catch (error) {
      console.error("❌ Failed to match existing scholarships:", error);
      // Don't throw error, just log it
    }
  }

  async generateTaskRecommendations(
    profile: any,
    favoriteUniversities: any[],
    favoriteScholarships: any[]
  ): Promise<any> {
    try {
      console.log("🎯 Generating task recommendations for user profile...");

      const prompt = this.createTaskRecommendationPrompt(
        profile,
        favoriteUniversities,
        favoriteScholarships
      );

      const response = await this.genai.models.generateContent({
        model: "gemini-2.0-flash-001",
        contents: prompt,
        config: {
          temperature: 0.3,
          maxOutputTokens: 4000,
        },
      });

      const aiResponseText = response.text || "";
      console.log("📝 AI Response received for task recommendations");

      const recommendations = this.parseTaskRecommendations(aiResponseText);

      return {
        success: true,
        recommendations,
      };
    } catch (error) {
      console.error("❌ Task recommendation generation failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        recommendations: [],
      };
    }
  }

  private createTaskRecommendationPrompt(
    profile: any,
    favoriteUniversities: any[],
    favoriteScholarships: any[]
  ): string {
    const universityNames = favoriteUniversities.map((u) => u.name).join(", ");
    const scholarshipNames = favoriteScholarships.map((s) => s.name).join(", ");

    return `You are an expert academic advisor helping students with university applications and scholarship applications.

**Student Profile:**
- Target Level: ${profile.targetLevel}
- Intended Major: ${profile.intendedMajor}
- Current Institution: ${profile.institution}
- Graduation Year: ${profile.graduationYear}
- Academic Score: ${profile.academicScore} (${profile.scoreScale})
- Nationality: ${profile.nationality}
- Intended Study Abroad Country: ${profile.intendedCountry || "Not specified"}
- Budget Range: ${
      profile.budgetMin && profile.budgetMax
        ? `$${profile.budgetMin.toLocaleString()} - $${profile.budgetMax.toLocaleString()} per year`
        : profile.budgetMin
        ? `Minimum $${profile.budgetMin.toLocaleString()} per year`
        : profile.budgetMax
        ? `Maximum $${profile.budgetMax.toLocaleString()} per year`
        : "Not specified"
    }

**Favorite Universities:** ${universityNames || "None selected"}
**Favorite Scholarships:** ${scholarshipNames || "None selected"}

**Instructions:**
Generate personalized task recommendations as a flat array. Each task should be actionable and specific to the student's profile and targets.

**Task Categories to consider:**
1. Academic Preparation (test scores, GPA improvement, coursework)
2. Application Materials (essays, CVs, portfolios, transcripts)
3. Documentation (visas, financial documents, recommendations)
4. Research (faculty research, program requirements, deadlines)
5. Financial Planning (scholarship applications, funding sources)

**Output Format (JSON only):**
{
  "tasks": [
    {
      "title": "Complete SAT/ACT with target score",
      "type": "GLOBAL",
      "priority": "MUST",
      "dueDate": "2025-12-15",
      "notes": "Target SAT 1540+ for competitive admission to top universities",
      "tags": ["standardized-tests"]
    },
    {
      "title": "Draft personal statement for Harvard University",
      "type": "UNIV_SPECIFIC",
      "priority": "MUST",
      "dueDate": "2025-11-01",
      "notes": "Write compelling essay highlighting leadership experience and academic goals",
      "tags": ["essays", "applications"]
    }
  ]
}

**Important Guidelines:**
- Return tasks as a flat array (no grouping)
- The task's title should be concise and descriptive consists of 3-7 words
- Use realistic due dates (within 6-12 months)
- Priority: MUST (critical), NEED (important), NICE (optional)
- Type: GLOBAL (applies broadly), UNIV_SPECIFIC (specific institution), GROUP (project-based)
- Include specific, actionable advice in notes
- Use relevant tags for categorization
- Generate 1-5 tasks total based on student's targets

Generate 1-5 tasks focused on the student's specific favorite universities and scholarships. Make tasks specific and actionable.`;
  }

  private parseTaskRecommendations(aiResponseText: string): any[] {
    try {
      // Extract JSON from AI response
      const jsonMatch = aiResponseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in AI response");
      }

      const jsonString = jsonMatch[0];
      const parsed = JSON.parse(jsonString);

      // Return tasks directly from the flat array
      if (parsed.tasks && Array.isArray(parsed.tasks)) {
        return parsed.tasks.map((task: any) => ({
          title: task.title,
          type: task.type || "GLOBAL",
          priority: task.priority,
          dueDate: task.dueDate,
          notes: task.notes,
          tags: task.tags || [],
        }));
      }

      return [];
    } catch (error) {
      console.error("Error parsing task recommendations:", error);
      console.log("Raw AI response:", aiResponseText);

      // Return default recommendations as fallback (flat tasks)
      return [
        {
          title: "Complete standardized test preparation",
          type: "GLOBAL",
          priority: "MUST",
          dueDate: "2025-12-01",
          notes:
            "Research requirements for target universities and prepare accordingly",
          tags: ["preparation", "tests"],
        },
        {
          title: "Draft personal statement",
          type: "GLOBAL",
          priority: "MUST",
          dueDate: "2025-11-15",
          notes:
            "Write compelling personal statement highlighting your goals and experiences",
          tags: ["essays", "applications"],
        },
      ];
    }
  }

  async generateChatResponse(
    userMessage: string,
    profile: any,
    favoriteUniversities: any[],
    favoriteScholarships: any[],
    chatHistory: Array<{ role: string; content: string }>
  ): Promise<{ response: string; suggestedTasks?: any[] }> {
    try {
      console.log("🤖 Generating chat response for user message...");

      const prompt = this.createChatPrompt(
        userMessage,
        profile,
        favoriteUniversities,
        favoriteScholarships,
        chatHistory
      );

      const response = await this.genai.models.generateContent({
        model: "gemini-2.0-flash-001",
        contents: prompt,
        config: {
          temperature: 0.7,
          maxOutputTokens: 2000,
        },
      });

      const aiResponseText = response.text || "";
      console.log("📝 AI chat response received");

      // Parse the response to extract text and suggested tasks
      const parsedResponse = this.parseChatResponse(aiResponseText);

      return parsedResponse;
    } catch (error) {
      console.error("❌ Chat response generation failed:", error);
      return {
        response:
          "I'm sorry, I encountered an error while processing your message. Please try again.",
        suggestedTasks: [],
      };
    }
  }

  private createChatPrompt(
    userMessage: string,
    profile: any,
    favoriteUniversities: any[],
    favoriteScholarships: any[],
    chatHistory: Array<{ role: string; content: string }>
  ): string {
    const universityNames = favoriteUniversities.map((u) => u.name).join(", ");
    const scholarshipNames = favoriteScholarships.map((s) => s.name).join(", ");

    // Format chat history for context
    const historyText = chatHistory
      .slice(-6) // Last 6 messages for context
      .map(
        (msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
      )
      .join("\n");

    return `You are an expert academic advisor and AI assistant helping students with university applications, career guidance, and academic planning.

**User Profile:**
${
  profile
    ? `- Target Level: ${profile.targetLevel}
- Intended Major: ${profile.intendedMajor}
- Current Institution: ${profile.institution}
- Graduation Year: ${profile.graduationYear}
- Academic Score: ${profile.academicScore} (${profile.scoreScale})
- Nationality: ${profile.nationality}`
    : "Profile not yet completed"
}

**Favorite Universities:** ${universityNames || "None selected"}
**Favorite Scholarships:** ${scholarshipNames || "None selected"}

**Recent Conversation History:**
${historyText}

**Current User Message:** ${userMessage}

**Instructions:**
Provide a helpful, personalized response based on the user's specific question or request. Focus on what they're asking for rather than making assumptions.

**Response Guidelines:**
- Answer their specific question directly and clearly
- Be conversational and friendly, but focused
- Reference their profile/interests only when relevant to their question
- Ask for clarification if their request is unclear or needs more details
- Provide specific, actionable advice when appropriate
- Keep responses focused and not too long
- Only suggest tasks or next steps if they specifically ask for advice or planning help
- Don't automatically suggest tasks unless they're asking for recommendations

**Important:** 
- If they're asking a general question, give a direct answer
- If they're asking for advice, provide specific recommendations
- If they're asking for help with something specific, focus on that
- Ask for clarification when needed rather than making assumptions

Response:`;
  }

  private parseChatResponse(aiResponseText: string): {
    response: string;
    suggestedTasks?: any[];
  } {
    // For now, just return the response as-is
    // In the future, we could parse for task suggestions
    return {
      response: aiResponseText.trim(),
      suggestedTasks: [],
    };
  }
}

export { AIService };

// Export singleton instance
export const aiService = new AIService();
