import OpenAI from 'openai';

class AIService {
    constructor() {
        this.apiKey = localStorage.getItem("gemini_api_key");
        this.client = null;
        this.model = "gpt-oss-120b";
        this.client = null;

        if (this.apiKey) {
            this.initClient(this.apiKey);
        }
    }

    initClient(apiKey) {
        this.client = new OpenAI({
            apiKey: apiKey,
            baseURL: "https://api.cerebras.ai/v1",
            dangerouslyAllowBrowser: true
        });
    }

    setApiKey(key) {
        this.apiKey = key;
        localStorage.setItem("gemini_api_key", key);
        this.initClient(key);
    }

    getApiKey() {
        return this.apiKey;
    }

    async validateApiKey(key) {
        try {
            const tempClient = new OpenAI({
                apiKey: key,
                baseURL: "https://api.cerebras.ai/v1",
                dangerouslyAllowBrowser: true
            });

            await tempClient.chat.completions.create({
                messages: [{ role: "user", content: "Test" }],
                model: this.model,
                max_tokens: 1
            });

            return true;
        } catch (error) {
            console.error("API Key Validation Error:", error);
            return false;
        }
    }

    async generateQuestion({ difficulty = "B1 (Intermediate)", topic = "General", style = "Standard", length = "Medium (1-2 sentences)", focusContext = null } = {}) {
        if (!this.client) throw new Error("API Key not set");

        let prompt = `Generate English text for translation practice.
    
    Parameters:
    - **Difficulty**: ${difficulty}
    - **Topic**: ${topic}
    - **Style/Tone**: ${style}
    - **Length**: ${length}`;

        if (focusContext) {
            // Truncate context to prevent prompt issues
            const safeContext = focusContext.substring(0, 800).replace(/"/g, "'");
            prompt += `\n    - **REMEDIAL MODE (STRICT)**: 
            The user previously failed to translate this properly: "${safeContext}".
            
            **MANDATORY INSTRUCTION**:
            1. You MUST generate a NEW sentence that forces the user to practice the SAME vocabulary/grammar concepts found in the "Original" text provided above.
            2. Do NOT just copy the original text exactly, but create a VARIATION that uses the *same* difficult words or sentence structure.
            3. The goal is to let them retry the specific concept they failed at.`;
        }

        prompt += `\n    
    Instructions:
    1. Create a unique, creative, and engaging text based on the parameters above.
    2. Ensure the vocabulary and grammar match the requested difficulty level.
    3. Output ONLY the English text to be translated. Do not include quotes, prefixes, or any other commentary.`;

        try {
            const completion = await this.client.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: this.model,
                temperature: 1.3, // High creativity
                max_tokens: 200,
            });

            const content = completion.choices[0].message.content?.trim();
            if (!content) {
                throw new Error("AI returned empty content");
            }

            return {
                question: content,
                usage: completion.usage
            };
        } catch (error) {
            console.error("AI Generate Error:", error);
            throw error;
        }
    }

    async evaluateTranslation(original, translation) {
        if (!this.client) throw new Error("API Key not set");

        const prompt = `Act as a Supportive Expert Language Tutor. Evaluate the following translation from English to Indonesian.
    
    English Source: "${original}"
    User Translation: "${translation}"
    
    Evaluation Criteria:
    1. **Meaning Accuracy** (High Priority): Does the translation convey the intended meaning?
    2. **Fluency**: Is the Indonesian sentence natural?
    3. **Vocabulary**: Are the chosen words appropriate?

    SCORING RUBRIC (Use this to determine the score):
    - **95-100 (Perfect/Excellent)**: Accurate meaning, natural phrasing. usage of synonyms is ACCEPTED.
    - **85-94 (Great)**: Accurate meaning but slight unnatural phrasing or 1 very minor typo.
    - **70-84 (Good)**: Meaning is mostly there, but mistakes in grammar or word choice are noticeable.
    - **50-69 (Fair)**: Understandable but significant errors in structure or meaning.
    - **0-49 (Poor)**: Wrong meaning, hallucination, or irrelevant text.

    CRITICAL RULES:
    - **VALID SYNONYMS ARE CORRECT**: If the user uses a valid synonym (e.g., using "Anda" instead of "Kamu", or "Rumah" instead of "Tempat Tinggal"), give a **High Score (100)**. Do not penalize for style preference.
    - **LENIENCY**: Do not deduct points for missing punctuation unless it changes the meaning.
    - **FOCUS ON MEANING**: If the core message is conveyed, the score should not be below 70.
    
    output in JSON format with the following keys:
    - "score": A precise number between 0 and 100.
    - "feedback": A constructive summary of the evaluation (in Indonesian). be encouraging.
    - "better_translation": The most natural and accurate translation possible.
    - "strength": A specific compliment about what the user did well (in Indonesian).
    - "weakness": A specific constructive criticism about what needs improvement (in Indonesian).
    - "highlights": An array of objects detecting specific issues. Each object must have:
        - "text": The exact substring from the user's translation.
        - "type": "suggestion" (blue - NO PENALTY), "minor" (yellow - small penalty), "major" (orange - medium penalty), "fatal" (red - large penalty).
        - "correction": The corrected word.
        - "explanation": Brief explanation (in Indonesian).
    - "vocabulary": An array of 3-5 interesting English words/phrases from the source. Each object must have:
        - "word": The English word/phrase.
        - "translation": The Indonesian meaning.
        - "type": Part of speech (e.g., Verb, Noun, Idiom).
    
    Output ONLY raw JSON.`;

        try {
            const completion = await this.client.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: this.model,
                temperature: 0.2, // High accuracy/determinism
                max_tokens: 1500,
            });

            let text = completion.choices[0].message.content.trim();

            // Robust JSON extraction
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                console.error("Invalid JSON format from AI:", text);
                throw new Error("AI response format error");
            }

            const result = JSON.parse(jsonMatch[0]);
            return { ...result, usage: completion.usage };
        } catch (error) {
            console.error("AI Evaluate Error:", error);
            // Fallback result to prevent app crash
            return {
                score: 0,
                feedback: "Maaf, terjadi kesalahan teknis saat menganalisis jawaban Anda. Mohon coba lagi.",
                better_translation: "-",
                strength: "-",
                weakness: "-",
                highlights: [],
                vocabulary: []
            };
        }
    }
}

export const aiService = new AIService();
