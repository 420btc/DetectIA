import OpenAI from "openai"

let openaiInstance: OpenAI | null = null

export function getOpenAIClient(): OpenAI {
  if (!openaiInstance) {
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY environment variable is not set. Please add it to your Vercel project environment variables.",
      )
    }

    openaiInstance = new OpenAI({
      apiKey: apiKey,
      // Explicitly disable browser usage to ensure this only runs on server
      dangerouslyAllowBrowser: false,
    })
  }

  return openaiInstance
}

// Export a function to verify the client is properly initialized
export function verifyOpenAISetup(): boolean {
  try {
    const client = getOpenAIClient()
    return !!client
  } catch (error) {
    console.error("[v0] OpenAI setup verification failed:", error)
    return false
  }
}
