import ChatInterface from "@/components/chat-interface"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <div className="flex flex-col items-center justify-center w-full flex-1">
        <div className="w-full max-w-5xl px-4 py-8 md:py-12">
          <div className="flex flex-col items-center justify-center mb-8">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Chat with Gemini AI</h1>
          </div>
          <ChatInterface />
        </div>
      </div>
    </main>
  )
}
