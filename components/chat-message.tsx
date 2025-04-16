"use client"

import { useState } from "react"
import type { Message } from "@/components/chat-interface"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Copy, Check, User } from "lucide-react"
import ReactMarkdown from "react-markdown"

interface ChatMessageProps {
  message: Message
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const renderContent = () => {
    switch (message.format) {
      case "markdown":
        return (
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }: { node?: any; inline?: boolean; className?: string; children?: React.ReactNode }) {
                  const match = /language-(\w+)/.exec(className || "")
                  return !inline ? (
                    <pre className="bg-black/50 p-4 rounded-md overflow-x-auto">
                      <code className={className} {...props}>
                        {String(children).replace(/\n$/, "")}
                      </code>
                    </pre>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  )
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )
      case "code":
        return (
          <div className="relative">
            <pre className="bg-black/50 p-4 rounded-md overflow-x-auto text-sm font-mono whitespace-pre">
              <code>{message.content}</code>
            </pre>
          </div>
        )
      case "image":
        return (
          <div>
            <img src={message.content || "/placeholder.svg"} alt="AI generated" className="max-w-full rounded-md" />
          </div>
        )
      default:
        return <p className="whitespace-pre-wrap">{message.content}</p>
    }
  }

  return (
    <div className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
      {message.role === "assistant" &&
        <Avatar className="h-8 w-8">
          <img src="https://img.40407.com/upload/202405/22/22083800ee60aUPZLQyKc6hlufj.webp" alt="Gemini AI" className="h-8 w-8 object-cover rounded-full" />
        </Avatar>
     }

      <div className={`max-w-[85%] ${message.role === "user" ? "order-1" : "order-2"}`}>
        <Card className={`p-3 ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-card"}`}>
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1 overflow-hidden">{renderContent()}</div>

            {message.role === "assistant" && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={copyToClipboard}
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </Button>
            )}
          </div>
        </Card>
      </div>

      {message.role === "user" && (
        <Avatar className="h-8 w-8 bg-primary order-2">
          <User className="h-8 w-8" />
        </Avatar>
      )}
    </div>
  )
}
