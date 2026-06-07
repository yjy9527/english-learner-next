/**
 * AI 调用封装 — 多提供商 + Chat/思考模型切换
 * 所有 AI 接口走 OpenAI 兼容格式
 */

export type AIProvider = "deepseek" | "mimo" | "openai" | "custom";
export type AIMode = "chat" | "think";

interface AIConfig {
  baseURL: string;
  apiKey: string;
  model: string;
}

/** 获取 AI 配置 */
export function getAIConfig(
  provider: AIProvider,
  mode: AIMode,
  customBaseUrl?: string,
  customApiKey?: string,
  customModel?: string
): AIConfig {
  const configs: Record<AIProvider, { baseURL: string; apiKey: string; models: { chat: string; think: string } }> = {
    deepseek: {
      baseURL: "https://api.deepseek.com/v1",
      apiKey: process.env.DEEPSEEK_API_KEY || "",
      models: { chat: "deepseek-chat", think: "deepseek-reasoner" },
    },
    mimo: {
      baseURL: "https://api.mimo.com/v1",
      apiKey: process.env.MIMO_API_KEY || "",
      models: { chat: "mimo-chat", think: "mimo-pro" },
    },
    openai: {
      baseURL: "https://api.openai.com/v1",
      apiKey: process.env.OPENAI_API_KEY || "",
      models: { chat: "gpt-4o-mini", think: "o1-mini" },
    },
    custom: {
      baseURL: customBaseUrl || "",
      apiKey: customApiKey || "",
      models: { chat: customModel || "gpt-3.5-turbo", think: customModel || "gpt-3.5-turbo" },
    },
  };

  const cfg = configs[provider];
  return {
    baseURL: cfg.baseURL,
    apiKey: cfg.apiKey,
    model: cfg.models[mode],
  };
}

/** 通用 AI 调用（15 秒超时） */
export async function callAI(
  provider: AIProvider,
  mode: AIMode,
  systemPrompt: string,
  userMessage: string,
  customConfig?: { baseUrl?: string; apiKey?: string; model?: string },
  timeoutMs = 15000
): Promise<string> {
  const cfg = getAIConfig(
    provider, mode,
    customConfig?.baseUrl, customConfig?.apiKey, customConfig?.model
  );

  if (!cfg.apiKey) {
    throw new Error(`AI 提供商 [${provider}] 未配置 API Key`);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${cfg.baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cfg.apiKey}`,
      },
      body: JSON.stringify({
        model: cfg.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: mode === "think" ? 0.3 : 0.7,
        max_tokens: 2048,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`AI API 错误 (${res.status}): ${err.slice(0, 200)}`);
    }

    const data = await res.json();
    return data.choices[0].message.content;
  } catch (e: any) {
    if (e.name === "AbortError") {
      throw new Error(`AI 请求超时（${timeoutMs / 1000}秒），请重试或切换模型`);
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}
