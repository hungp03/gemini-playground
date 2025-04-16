"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { Send, Loader2, ImageIcon, Paperclip } from "lucide-react"
import ChatMessage from "@/components/chat-message"
import { useMobile } from "@/hooks/use-mobile"
import { sendMessage } from "@/app/actions"

export type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  format?: "text" | "markdown" | "code" | "image"
  language?: string
}

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

const GEMINI_MODELS = [
  { label: "Gemini 2.0 Flash", value: "gemini-2.0-flash" },
  { label: "Gemini 2.0 Flash Lite", value: "gemini-2.0-flash-lite" },
  { label: "Gemini 1.5 Flash", value: "gemini-1.5-flash" },
  { label: "Gemini 1.5 Flash 8B", value: "gemini-1.5-flash-8b" },
]

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const [model, setModel] = useState<string>("gemini-2.0-flash-lite")

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isMobile = useMobile()

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      format: "text",
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("message", input)
      formData.append("model", model)

      const response = await sendMessage(formData)

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response.content,
          format: response.format,
          language: response.language,
        },
      ])
    } catch (error) {
      console.error("Error sending message:", error)
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, I encountered an error processing your request. Please try again.",
          format: "text",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] md:h-[calc(100vh-250px)]">
      <Card className="flex-1 overflow-hidden border rounded-lg mb-4">
        <ScrollArea className="h-full p-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="rounded-full bg-primary/10 p-3 mb-4">
                <ImageIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Welcome to Gemini AI Chatbot</h3>
              <p className="text-muted-foreground max-w-md">
                Ask me anything and I'll respond with text, code, markdown, or even analyze images.
              </p>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
      </Card>

      <div className="mb-2">
        <Select value={model} onValueChange={setModel}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Gemini Model" />
          </SelectTrigger>
          <SelectContent>
            {GEMINI_MODELS.map((m) => (
              <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-2">

        <div className="flex items-end space-x-2">
          <div className="flex-1">
            {isMobile ? (
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
                className="min-h-10"
              />
            ) : (
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
                className="min-h-10 resize-none"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
              />
            )}
          </div>


          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </form>
    </div>
  )
}
