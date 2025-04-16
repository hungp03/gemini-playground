"use server"

import { generateText } from "ai"
import { google } from "@ai-sdk/google"

type ResponseFormat = "text" | "markdown" | "code" | "image"

interface MessageResponse {
  content: string
  format: ResponseFormat
  language?: string
}

export async function sendMessage(formData: FormData): Promise<MessageResponse> {
  const message = formData.get("message") as string
  const modelName = (formData.get("model") as string) || "gemini-2.0-flash-lite"

  try {
    let prompt = message

    const isCodeRequest =
      message.toLowerCase().includes("code") ||
      message.toLowerCase().includes("function") ||
      message.toLowerCase().includes("script") ||
      message.toLowerCase().includes("program")

    const isMarkdownRequest =
      message.toLowerCase().includes("markdown") ||
      message.toLowerCase().includes("format") ||
      message.toLowerCase().includes("document")

    // Generate response using Google's Gemini model
    const { text } = await generateText({
      model: google(modelName, { apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY }),
      prompt,
      system: `You are a helpful AI assistant that can respond in multiple formats.
      If the user asks for code, provide well-formatted, working code with explanations.
      If the user asks for formatted text or documentation, use markdown.
      Otherwise, respond in plain text.
      Be concise but thorough in your responses.`,
    })


    let format: ResponseFormat = "text"
    let language: string | undefined = undefined
    let content = text

    if (isCodeRequest || text.includes("```")) {
      const codeBlockRegex = /```(?:[a-zA-Z0-9#]+)?\n([\s\S]*?)```/
      const match = text.match(codeBlockRegex)

      if (match && match[1]) {
        format = "code"
        content = match[1].trim()
        const langMatch = text.match(/```([a-zA-Z0-9#]+)/)
        language = langMatch ? langMatch[1] : "javascript"
      } else {
        format = "markdown"
      }
    } else if (
      isMarkdownRequest ||
      (text.includes("#") && text.includes("\n")) ||
      text.includes("**") ||
      text.includes("__")
    ) {
      format = "markdown"
    }

    return {
      content,
      format,
      language,
    }
  } catch (error) {
    console.error("Error processing message:", error)
    return {
      content: "Sorry, I encountered an error processing your request. Please try again.",
      format: "text",
    }
  }
}
