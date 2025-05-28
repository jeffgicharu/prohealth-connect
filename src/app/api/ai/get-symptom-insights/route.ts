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
    .trim()
    .min(1, "Symptom description cannot be empty.")
    .min(15, "Please provide a more detailed description (at least 15 characters).")
    .max(1000, "Symptom description is too long (max 1000 characters).")
    .regex(
      /^(?!.*(<script>|javascript:|on\w+=|data:))/i,
      "Input contains disallowed characters or patterns."
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
    return NextResponse.json({ error: 'You must be logged in to use this feature.' }, { status: 401 });
  }

  let requestBody: unknown;
  try {
    requestBody = await request.json();
    
    // Validate input using Zod schema
    const validation = symptomsSchema.safeParse(requestBody);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: "Invalid input",
          details: validation.error.flatten().fieldErrors.symptoms
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
        message: `You've reached the maximum number of requests. Please try again in ${rateLimitInfo.reset} seconds.`,
        reset: rateLimitInfo.reset
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

If the user's input is too vague, clearly inappropriate for your function (e.g., asking for recipes, coding help, historical facts, opinions, or any non-health related topic), or describes what seems to be a very serious medical emergency, you MUST politely state that you cannot provide specific information on that topic and that your purpose is to offer general health-related information.

Examples of how to respond to irrelevant inputs:

If asked "What's the weather like?": "I am designed to provide general health information and cannot provide weather updates. Do you have a health-related question?"

If asked "Can you help me with my homework?": "My apologies, but I can only provide general health-related information. I'm not equipped to help with homework."

If asked "What is your opinion on the new movie?": "As an AI health assistant, I don't have personal opinions. My purpose is to offer general health information. Is there a health topic I can help you with?"

If the input seems to describe a very serious medical emergency (e.g., "I think I'm having a heart attack right now"): "I cannot provide medical advice or assistance in an emergency. If you believe you are experiencing a medical emergency, please contact your local emergency services immediately or go to the nearest emergency room."

Do not engage in conversation about the off-topic subject. Just a polite refusal and a reminder of your purpose.

ALWAYS INCLUDE THE FOLLOWING DISCLAIMER VERBATIM AT THE VERY END OF YOUR RESPONSE:
"Disclaimer: This information is not medical advice. Please consult with a qualified healthcare professional for any health concerns or before making any decisions related to your health."

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