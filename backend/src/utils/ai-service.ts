import { GoogleGenAI } from "@google/genai";
import { drizzle } from "drizzle-orm/node-postgres";
import {
  universities,
  scholarships,
  universityScholarships,
} from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import type {
  ProfileData,
  AIAnalysisResult,
  UniversityMatch,
  MatchingResult,
} from "../types/index.js";

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
        model: "gemini-flash-latest",
        contents: prompt,
        config: {
          temperature: 0.1,
          maxOutputTokens: 2048,
        },
      });

      // Extract text from response, handling multiple parts
      let result = "";
      if (response.candidates?.[0]?.content?.parts) {
        result = response.candidates[0].content.parts
          .filter((part: any) => part.text)
          .map((part: any) => part.text)
          .join("\n");
      } else if (response.text) {
        result = response.text;
      }

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

  async analyzeCVFile(
    fileBuffer: Buffer,
    mimeType: string
  ): Promise<AIAnalysisResult> {
    try {
      // Use inline data instead of Files API - simpler and more reliable
      // Encode file as base64
      const base64Data = fileBuffer.toString("base64");

      // Use the file inline in the content request
      const response = await this.genai.models.generateContent({
        model: "gemini-flash-latest",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `You are an expert CV/Resume analyzer. Extract academic and personal information from the following CV/PDF and return it in JSON format.

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
1. Only include fields that are clearly mentioned in the document
2. Use null for missing information
3. Be conservative in your extractions - only include data you're confident about
4. For dates, use YYYY-MM-DD format when possible
5. Return only valid JSON, no additional text
6. If a field is not found, omit it from the JSON or set it to null`,
              },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: base64Data,
                },
              },
            ],
          },
        ],
        config: {
          temperature: 0.1,
          maxOutputTokens: 2048,
        },
      });

      console.log("📄 File analyzed successfully");

      const result = response.text || "";
      const parsedData = this.parseAIResponse(result);

      return {
        success: true,
        data: parsedData,
        confidence: 0.85,
      };
    } catch (error) {
      console.error("AI File Analysis Error:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "AI file analysis failed",
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
      // Step 1: Match existing universities first
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

      const matchPrompt = `You are an expert university admissions counselor. Analyze the user profile and match them with the most suitable universities from the provided list.

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

CRITICAL INSTRUCTIONS:
1. EXCLUDE any universities from ${
        userProfile.nationality || "the student's origin country"
      }. Only suggest universities outside the student's origin country.
2. Only include universities that match the student's intended major and academic profile.
3. Prioritize universities in or near the intended study abroad country (${
        userProfile.intendedCountry || "any country"
      }).

TASK:
1. Analyze each available university and calculate a match score (0-100) based on academic fit, program alignment, cultural/geographic fit, financial fit, and admission probability.
2. For each matching university (excluding origin country), provide: match score, detailed reasoning, 2-3 key strengths, and 1-2 potential concerns.
3. Rank all matches by score (highest first).

CRITICAL: Respond ONLY with valid JSON. No text before or after. No markdown. Start with { and end with }.

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
  ]
}

- All numbers must be actual numbers (not strings)
- acceptanceRate must be string like "65.50"`;

      console.log("📤 Sending match prompt to Gemini AI...");

      const matchResult = await this.genai.models.generateContent({
        model: "gemini-flash-latest",
        contents: matchPrompt,
        config: {
          temperature: 0.0,
          maxOutputTokens: 8192,
        },
      });

      // Extract text from response, handling multiple parts
      let matchResponseText = "";
      if (matchResult.candidates?.[0]?.content?.parts) {
        matchResponseText = matchResult.candidates[0].content.parts
          .filter((part: any) => part.text)
          .map((part: any) => part.text)
          .join("\n");
      } else if (matchResult.text) {
        matchResponseText = matchResult.text;
      }

      console.log("📥 Received match response");
      console.log(matchResponseText);
      console.log("Raw match response length:", matchResponseText.length);

      // Parse match response
      let parsedMatches: any = { matches: [] };
      try {
        let cleanedResponse = matchResponseText
          .replace(/```json\n?|\n?```/g, "")
          .replace(/```\n?|\n?```/g, "")
          .trim();

        const firstBrace = cleanedResponse.indexOf("{");
        const lastBrace = cleanedResponse.lastIndexOf("}");
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          cleanedResponse = cleanedResponse.substring(
            firstBrace,
            lastBrace + 1
          );
        }

        // Replace literal newlines and carriage returns within the JSON string
        // This is critical to prevent breaking JSON structure
        cleanedResponse = cleanedResponse
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line.length > 0)
          .join("");

        // More aggressive JSON cleaning
        cleanedResponse = cleanedResponse
          .replace(/,(\s*[}\]])/g, "$1") // Remove trailing commas
          .replace(/:\s*:/g, ":") // Fix double colons
          .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Quote unquoted keys
          .replace(/"null"/g, "null") // Fix quoted nulls
          .replace(/:\s*"(\d+(?:\.\d+)?)"/g, ":$1") // Unquote numbers
          .replace(/:\s*"(true|false)"/g, ":$1") // Unquote booleans
          .replace(/:\s*"(\d{4}-\d{2}-\d{2})"/g, ':"$1"') // Fix dates
          .replace(/,\s*,/g, ",") // Remove double commas
          .replace(/\[\s*,/g, "[") // Remove leading commas in arrays
          .replace(/,\s*\]/g, "]"); // Remove trailing commas in arrays

        // Escape unescaped quotes inside string values
        // Find all quoted strings and escape internal quotes
        cleanedResponse = cleanedResponse.replace(
          /"([^"]*)"/g,
          (match, content) => {
            // Escape any unescaped quotes inside the string value
            const escaped = content
              .replace(/\\/g, "\\\\") // Escape backslashes first
              .replace(/"/g, '\\"'); // Then escape quotes
            return `"${escaped}"`;
          }
        );

        parsedMatches = JSON.parse(cleanedResponse);
      } catch (parseError) {
        console.error(
          "Failed to parse match response, returning empty matches:",
          parseError
        );
        console.error(
          "Cleaned response sample:",
          matchResponseText.substring(0, 500)
        );
        parsedMatches = { matches: [] };
      }

      // Process matches
      const processedMatches: UniversityMatch[] =
        parsedMatches.matches
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

      processedMatches.sort((a, z) => z.matchScore - a.matchScore);

      // Step 2: Generate suggestions separately
      console.log("📤 Generating AI suggestions...");

      let suggestedUniversities: any[] = [];
      try {
        const suggestPrompt = `Based on this student profile, suggest 2-3 universities NOT in an existing database that would be excellent matches:

USER PROFILE:
- Target Level: ${userProfile.targetLevel || "Not specified"}
- Intended Major: ${userProfile.intendedMajor || "Not specified"}
- Academic Score: ${userProfile.academicScore || "Not provided"} (Scale: ${
          userProfile.scoreScale || "Not specified"
        })
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

TASK: Suggest 2-3 real universities with complete, realistic information.

RESPOND ONLY with JSON (no markdown, no text before/after):
{
  "suggestions": [
    {
      "name": "string",
      "location": "string",
      "country": "string",
      "reasoning": "string",
      "estimatedMatchScore": number,
      "specialties": ["string"],
      "type": "public|private",
      "ranking": number,
      "studentCount": number,
      "establishedYear": number,
      "tuitionRange": "string",
      "acceptanceRate": "string",
      "description": "string",
      "website": "string"
    }
  ]
}`;

        const suggestResult = await this.genai.models.generateContent({
          model: "gemini-flash-latest",
          contents: suggestPrompt,
          config: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        });

        // Extract text from response, handling multiple parts
        let suggestResponseText = "";
        if (suggestResult.candidates?.[0]?.content?.parts) {
          suggestResponseText = suggestResult.candidates[0].content.parts
            .filter((part: any) => part.text)
            .map((part: any) => part.text)
            .join("\n");
        } else if (suggestResult.text) {
          suggestResponseText = suggestResult.text;
        }

        console.log("📥 Received suggestions response");

        try {
          let cleanedSuggest = suggestResponseText
            .replace(/```json\n?|\n?```/g, "")
            .replace(/```\n?|\n?```/g, "")
            .trim();

          const firstBrace = cleanedSuggest.indexOf("{");
          const lastBrace = cleanedSuggest.lastIndexOf("}");
          if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            cleanedSuggest = cleanedSuggest.substring(
              firstBrace,
              lastBrace + 1
            );
          }

          cleanedSuggest = cleanedSuggest
            .replace(/,(\s*[}\]])/g, "$1")
            .replace(/:\s*:/g, ":")
            .replace(/([{,]\s*)(\w+):/g, '$1"$2":')
            .replace(/"null"/g, "null")
            .replace(/:\s*"(\d+(?:\.\d+)?)"/g, ":$1")
            .replace(/:\s*"(true|false)"/g, ":$1")
            .replace(/:\s*"(\d{4}-\d{2}-\d{2})"/g, ':"$1"')
            .replace(/[\n\r]/g, " "); // Replace newlines with spaces

          console.log("Attempting to parse suggestions JSON...");
          const parsedSuggest = JSON.parse(cleanedSuggest);
          console.log(
            "✅ Successfully parsed suggestions:",
            parsedSuggest.suggestions?.length || 0,
            "universities"
          );

          suggestedUniversities = (parsedSuggest.suggestions || []).map(
            (uni: any) => ({
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
              specialties: Array.isArray(uni.specialties)
                ? uni.specialties
                : [],
            })
          );
        } catch (suggestError) {
          console.error(
            "Failed to parse suggestions:",
            suggestError,
            "Raw response length:",
            suggestResponseText.length
          );
          // Continue with empty suggestions
          suggestedUniversities = [];
        }
      } catch (error) {
        console.error("Suggestion generation error:", error);
        // Continue with empty suggestions - not a critical failure
        suggestedUniversities = [];
      }

      // Return combined results
      return {
        success: true,
        matches: processedMatches,
        suggestedUniversities,
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

        // Parse acceptanceRate - remove % sign if present and ensure numeric format
        const parseAcceptanceRate = (rate: any): string => {
          if (!rate) return "50.00";
          const rateStr = String(rate).replace("%", "").trim();
          const numeric = parseFloat(rateStr);
          return isNaN(numeric) ? "50.00" : numeric.toFixed(2);
        };

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
            acceptanceRate: parseAcceptanceRate(suggested.acceptanceRate),
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
        model: "gemini-flash-latest",
        contents: prompt,
        config: {
          temperature: 0.3,
          maxOutputTokens: 4000,
        },
      });

      // Extract text from response, handling multiple parts
      let aiResponseText = "";
      if (response.candidates?.[0]?.content?.parts) {
        aiResponseText = response.candidates[0].content.parts
          .filter((part: any) => part.text)
          .map((part: any) => part.text)
          .join("\n");
      } else if (response.text) {
        aiResponseText = response.text;
      }

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
        model: "gemini-flash-latest",
        contents: prompt,
        config: {
          temperature: 0.7,
          maxOutputTokens: 2000,
        },
      });

      // Extract text from response, handling multiple parts
      let aiResponseText = "";
      if (response.candidates?.[0]?.content?.parts) {
        aiResponseText = response.candidates[0].content.parts
          .filter((part: any) => part.text)
          .map((part: any) => part.text)
          .join("\n");
      } else if (response.text) {
        aiResponseText = response.text;
      }
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
