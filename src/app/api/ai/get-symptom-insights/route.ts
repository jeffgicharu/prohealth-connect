import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import rateLimiter from '@/lib/utils/rateLimiter';
import { z } from 'zod';

const MODEL_NAME = "gemini-2.0-flash";
const API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

// Configuration for safety settings
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// Define the symptoms schema
const symptomsSchema = z.object({
  symptoms: z.string()
    .min(10, 'Please provide more detailed symptoms (minimum 10 characters)')
    .max(1000, 'Input is too long. Please keep it under 1000 characters')
    .refine(
      (value) => !/<script>|javascript:|on\w+=|data:/i.test(value),
      'Invalid input detected'
    ),
});

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

  let requestBody: unknown;
  try {
    requestBody = await request.json();
    
    // Validate input using Zod schema
    const validation = symptomsSchema.safeParse(requestBody);
    
    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      const errorMessage = Object.entries(fieldErrors)
        .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
        .join('; ');
        
      return NextResponse.json(
        { 
          error: 'Invalid input provided',
          message: errorMessage,
          details: fieldErrors 
        },
        { status: 400 }
      );
    }

    const { symptoms } = validation.data;

    // Rate limiting
    const rateLimitInfo = rateLimiter.limit(session.user.id);
    
    if (rateLimitInfo.remaining === 0) {
      return NextResponse.json({
        error: 'Rate limit exceeded',
        message: `You've reached the maximum number of requests. Please try again in ${rateLimitInfo.resetIn} seconds.`,
        resetIn: rateLimitInfo.resetIn
      }, { 
        status: 429,
        headers: rateLimiter.getRateLimitHeaders(rateLimitInfo)
      });
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
          error: 'Content blocked by safety filters',
          message: `Your request was blocked because it may contain inappropriate content. Please rephrase your symptoms in a more appropriate way.`,
          details: response.promptFeedback.blockReason
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
        error: 'AI service unavailable',
        message: 'We were unable to process your request at this time. Please try again in a few moments.'
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
    console.error("Error getting AI symptom insights (Gemini):", {
      error,
      userId: session?.user?.id,
      timestamp: new Date().toISOString(),
      input: requestBody && typeof requestBody === 'object' && 'symptoms' in requestBody 
        ? String(requestBody.symptoms) 
        : ''
    });

    // Log the error to the database
    if (session?.user?.id) {
      await prisma.aIInteractionLog.create({
        data: {
          userId: session.user.id,
          input: requestBody && typeof requestBody === 'object' && 'symptoms' in requestBody 
            ? String(requestBody.symptoms) 
            : '',
          response: '',
          status: 'ERROR',
          error: errorMessage
        }
      });
    }

    // Map common errors to user-friendly messages
    const errorMessages: { [key: string]: string } = {
      "API_KEY_MISSING": "The AI service is currently unavailable. Please try again later.",
      "INVALID_REQUEST": "Your request could not be processed. Please check your input and try again.",
      "RATE_LIMIT_EXCEEDED": "You've made too many requests. Please wait a moment before trying again.",
      "SERVICE_UNAVAILABLE": "The AI service is temporarily unavailable. Please try again later.",
      "INVALID_RESPONSE": "We received an unexpected response. Please try again.",
    };

    // Check if the error message matches any known error patterns
    for (const [key, message] of Object.entries(errorMessages)) {
      if (errorMessage.includes(key)) {
        return NextResponse.json({ 
          error: message,
          message: message
        }, { status: 400 });
      }
    }

    // For unknown errors, return a generic message
    return NextResponse.json({ 
      error: 'Service error',
      message: 'We encountered an unexpected error while processing your request. Our team has been notified.',
    }, { status: 500 });
  }
}