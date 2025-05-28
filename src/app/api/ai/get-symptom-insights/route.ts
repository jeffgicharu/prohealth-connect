import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import rateLimiter from '@/lib/utils/rateLimiter';

const MODEL_NAME = "gemini-2.0-flash";
const API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

// Configuration for safety settings
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// Input validation function
function validateInput(symptoms: string): { isValid: boolean; error?: string } {
  if (!symptoms || typeof symptoms !== 'string') {
    return { isValid: false, error: 'Symptom description is required.' };
  }

  const trimmedSymptoms = symptoms.trim();
  if (trimmedSymptoms.length === 0) {
    return { isValid: false, error: 'Symptom description cannot be empty.' };
  }

  if (trimmedSymptoms.length > 1000) {
    return { isValid: false, error: 'Input is too long. Please keep it under 1000 characters.' };
  }

  // Basic content validation
  const suspiciousPatterns = [
    /<script>/i,
    /javascript:/i,
    /on\w+=/i,
    /data:/i,
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(trimmedSymptoms)) {
      return { isValid: false, error: 'Invalid input detected.' };
    }
  }

  return { isValid: true };
}

export async function POST(request: Request) {
  // Early API key check
  if (!API_KEY) {
    return NextResponse.json(
      { error: "The AI Health Assistant is temporarily unavailable due to a configuration issue. Please try again later or contact support if the issue persists." },
      { status: 503 }
    );
  }

  // Initialize GoogleGenerativeAI only if API key is present
  const genAI = new GoogleGenerativeAI(API_KEY);

  // Protect this endpoint
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const body = await request.json();
  const { symptoms } = body;

  try {
    // Rate limiting
    const rateLimitInfo = rateLimiter.limit(session.user.id);
    
    if (rateLimitInfo.remaining === 0) {
      return rateLimiter.createRateLimitResponse(rateLimitInfo);
    }

    // Input validation
    const validation = validateInput(symptoms);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: MODEL_NAME, safetySettings });

    const prompt = `You are "ProHealth Connect AI Assistant," a helpful AI designed to provide general health information.

A user has described the following symptoms: "${symptoms}"

Based on these symptoms, please provide some general information about potential common conditions or factors that MIGHT be associated with them.
Structure your response clearly. If appropriate, use bullet points for different possibilities.
Your entire response should be for informational purposes ONLY.

CRITICAL INSTRUCTIONS - YOU MUST FOLLOW THESE:

DO NOT PROVIDE MEDICAL DIAGNOSIS. Do not state or imply that the user has any specific condition.

DO NOT SUGGEST SPECIFIC TREATMENTS, MEDICATIONS, OR DOSAGES.

DO NOT ASK FOLLOW-UP QUESTIONS TO GATHER MORE MEDICAL DETAILS FROM THE USER.

ALWAYS INCLUDE THE FOLLOWING DISCLAIMER VERBATIM AT THE VERY END OF YOUR RESPONSE:
"Disclaimer: This information is not medical advice. Please consult with a qualified healthcare professional for any health concerns or before making any decisions related to your health."

If the user's input is too vague, clearly inappropriate for your function, or describes what seems to be a very serious medical emergency, you must politely state that you cannot provide specific information and that they should seek immediate medical attention from a healthcare professional.

Keep your response to a helpful length, focusing on general information.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const insight = response.text()?.trim();

    if (!insight) {
      // Check if the response was blocked due to safety settings
      if (response.promptFeedback?.blockReason) {
        console.warn("Gemini response blocked due to safety settings:", response.promptFeedback.blockReason);
        
        // Log the blocked interaction
        await prisma.aIInteractionLog.create({
          data: {
            userId: session.user.id,
            input: symptoms,
            response: '',
            status: 'ERROR',
            error: `AI response blocked due to: ${response.promptFeedback.blockReason}`
          }
        });

        return NextResponse.json({ 
          error: `AI response blocked due to: ${response.promptFeedback.blockReason}. Please rephrase your query or ensure it's appropriate.` 
        }, { status: 400 });
      }

      // Log the failed interaction
      await prisma.aIInteractionLog.create({
        data: {
          userId: session.user.id,
          input: symptoms,
          response: '',
          status: 'ERROR',
          error: 'Failed to get insights from AI. The AI did not provide a response.'
        }
      });

      return NextResponse.json({ 
        error: 'Failed to get insights from AI. The AI did not provide a response.' 
      }, { status: 500 });
    }

    // Log successful interaction
    await prisma.aIInteractionLog.create({
      data: {
        userId: session.user.id,
        input: symptoms,
        response: insight,
        status: 'SUCCESS'
      }
    });

    // Add rate limit headers to successful response
    return NextResponse.json(
      { insight },
      { headers: rateLimiter.getRateLimitHeaders(rateLimitInfo) }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error("Error getting AI symptom insights (Gemini):", error);

    // Log the error
    if (session?.user?.id) {
      await prisma.aIInteractionLog.create({
        data: {
          userId: session.user.id,
          input: symptoms,
          response: '',
          status: 'ERROR',
          error: errorMessage
        }
      });
    }

    return NextResponse.json({ 
      error: 'An error occurred while processing your request with the AI service.' 
    }, { status: 500 });
  }
}