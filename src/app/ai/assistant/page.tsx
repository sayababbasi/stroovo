'use client';

import { useEffect, useRef, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { Bot, Brain, Loader2, MessageSquare, Send, Shield, Sparkles, TrendingUp, User } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface PromptCard {
  title: string;
  description: string;
  prompt: string;
  icon: typeof Brain;
}

const STORAGE_KEY = 'stroovo-ai-assistant-messages';

const starterPrompts: PromptCard[] = [
  {
    title: 'Plan work',
    description: 'Break a goal into concrete tasks and sequencing.',
    prompt: 'Generate a clear execution plan for our next product release.',
    icon: Brain,
  },
  {
    title: 'Check risk',
    description: 'Ask the AI to surface delivery issues or blockers.',
    prompt: 'What delivery risks should I review this week?',
    icon: Shield,
  },
  {
    title: 'Improve flow',
    description: 'Look for workload and execution improvements.',
    prompt: 'How can I improve team throughput without increasing burnout?',
    icon: TrendingUp,
  },
  {
    title: 'Summarize',
    description: 'Get a concise operational summary for today.',
    prompt: 'Give me a short executive summary of what I should focus on today.',
    icon: MessageSquare,
  },
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) return;

      const parsed = JSON.parse(stored) as Message[];
      if (Array.isArray(parsed)) {
        setMessages(parsed);
      }
    } catch (storageError) {
      console.error('Failed to restore AI conversation:', storageError);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async (providedPrompt?: string) => {
    const prompt = (providedPrompt ?? input).trim();
    if (!prompt || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: prompt,
      timestamp: new Date().toISOString(),
    };

    setMessages((current) => [...current, userMessage]);
    setInput('');
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model: 'phi3:mini' }),
      });

      if (!response.ok) {
        const failure = await response.json().catch(() => ({}));
        throw new Error(failure.error || 'Failed to get AI response.');
      }

      const result = await response.json();
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: result.data?.content || 'No response returned.',
        timestamp: new Date().toISOString(),
      };

      setMessages((current) => [...current, assistantMessage]);
    } catch (requestError) {
      console.error('Assistant chat failed:', requestError);
      setError(requestError instanceof Error ? requestError.message : 'Unknown error occurred');

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'I could not reach the local AI service. Confirm Ollama is running and try again.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearConversation = () => {
    setMessages([]);
    setError('');
    window.localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <main className="ml-0 min-h-screen p-4 md:ml-60 md:p-8">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col gap-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                    <Bot className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Stroovo AI Assistant</h1>
                    <p className="text-sm text-slate-500">Chat with the local AI assistant backed by Ollama.</p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  <Sparkles className="h-3.5 w-3.5" />
                  Local model chat using `phi3:mini`
                </div>
              </div>

              <button
                type="button"
                onClick={clearConversation}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Clear conversation
              </button>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Prompt Library</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">Seed the conversation with focused prompts tied to delivery, planning, and execution.</p>
              </div>
              <div className="space-y-3">
                {starterPrompts.map((promptCard) => {
                  const Icon = promptCard.icon;
                  return (
                    <button
                      key={promptCard.title}
                      type="button"
                      onClick={() => {
                        setInput(promptCard.prompt);
                      }}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50"
                    >
                      <div className="mb-3 flex items-center gap-3">
                        <div className="rounded-xl bg-white p-2 text-blue-600 shadow-sm">
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="font-medium text-slate-900">{promptCard.title}</span>
                      </div>
                      <p className="text-sm leading-6 text-slate-500">{promptCard.description}</p>
                    </button>
                  );
                })}
              </div>
            </aside>

            <section className="flex min-h-[640px] flex-col rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Conversation</h2>
                  <p className="text-sm text-slate-500">Ask questions about workload, project planning, task generation, or risk.</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                  Local AI chat
                </div>
              </div>

              <div className="flex-1 space-y-6 overflow-y-auto px-5 py-6">
                {messages.length === 0 ? (
                  <div className="flex h-full min-h-[360px] flex-col items-center justify-center text-center">
                    <div className="rounded-3xl bg-blue-50 p-5 text-blue-600">
                      <Bot className="h-10 w-10" />
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-slate-900">Start a conversation</h3>
                    <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">
                      Use a prompt from the left or ask a direct question. Responses are generated by the local Ollama runtime instead of a hosted API.
                    </p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex max-w-3xl items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`rounded-2xl p-3 ${message.role === 'user' ? 'bg-slate-900 text-white' : 'bg-blue-100 text-blue-700'}`}>
                          {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                        </div>
                        <div
                          className={`rounded-3xl px-4 py-3 shadow-sm ${
                            message.role === 'user'
                              ? 'bg-slate-900 text-white'
                              : 'border border-slate-200 bg-slate-50 text-slate-800'
                          }`}
                        >
                          <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>
                          <p className={`mt-2 text-xs ${message.role === 'user' ? 'text-slate-300' : 'text-slate-400'}`}>
                            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {isLoading ? (
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <div className="rounded-2xl bg-blue-100 p-3 text-blue-700">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                    Stroovo AI is generating a response...
                  </div>
                ) : null}

                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-slate-200 px-5 py-4">
                {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
                <div className="flex flex-col gap-3 sm:flex-row">
                  <textarea
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        sendMessage();
                      }
                    }}
                    rows={3}
                    placeholder="Ask Stroovo AI about priorities, risks, task planning, or workload balance..."
                    className="min-h-[72px] flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || isLoading}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Send
                  </button>
                </div>
              </div>
            </section>
          </section>
        </div>
      </main>
    </div>
  );
}
