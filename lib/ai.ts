import OpenAI from "openai"

const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null

const MOCK_SCHEMA = {
  title: "Contact Form",
  fields: [
    { type: "TEXT", name: "firstName", label: "First Name", required: true, order: 1 },
    { type: "TEXT", name: "lastName", label: "Last Name", required: true, order: 2 },
    { type: "EMAIL", name: "email", label: "Email Address", required: true, order: 3 },
    { type: "PHONE", name: "phone", label: "Phone Number", required: false, order: 4 },
    { type: "TEXTAREA", name: "message", label: "Message", required: true, order: 5 },
    { type: "CONSENT", name: "consent", label: "I agree to the privacy policy", required: true, order: 6 },
  ],
}

export async function generateFormSchema(prompt: string) {
  if (!client) return MOCK_SCHEMA

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are a form builder assistant. Given a description, return a JSON object with:
- title: string
- fields: array of { type (TEXT|EMAIL|PHONE|DROPDOWN|RADIO|CHECKBOX|DATE|TEXTAREA|CONSENT|NUMBER|URL|HIDDEN), name, label, required, order, options? (array for DROPDOWN/RADIO/CHECKBOX) }
Return only valid JSON, no markdown.`,
      },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
  })

  return JSON.parse(completion.choices[0].message.content ?? "{}")
}

export async function generateContent(type: "cta" | "thankYou" | "description", context: string) {
  if (!client) {
    const mocks = {
      cta: "Submit Now",
      thankYou: "Thank you for your submission! We'll be in touch shortly.",
      description: "Please fill out the form below and we'll get back to you.",
    }
    return mocks[type]
  }

  const prompts = {
    cta: `Write a compelling CTA button text (2-4 words) for: ${context}`,
    thankYou: `Write a thank-you message (1-2 sentences) for a form about: ${context}`,
    description: `Write a brief form description (1 sentence) for: ${context}`,
  }

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompts[type] }],
    max_tokens: 100,
  })

  return completion.choices[0].message.content?.trim() ?? ""
}
