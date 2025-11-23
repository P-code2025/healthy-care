// Backend endpoint for CLOVA function calling
// Add this to api-proxy.js

app.post("/api/chat-clova-functions", requireAuth, async (req, res) => {
    try {
        const { messages, functions, userProfile } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: "messages array is required" });
        }

        console.log(`🤖 CLOVA Function Calling: ${functions?.length || 0} functions available`);

        // Call CLOVA
        const response = await fetch(CLOVA_API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${CLOVA_API_KEY}`,
                "Content-Type": "application/json",
                "X-NCP-CLOVASTUDIO-REQUEST-ID": `chat-functions-${req.user.id}-${Date.now()}`,
            },
            body: JSON.stringify({
                messages,
                topP: 0.8,
                topK: 0,
                maxTokens: 1000,
                temperature: 0.5,
                repeatPenalty: 1.2,
                stopBefore: [],
            }),
        });

        if (!response.ok) {
            throw new Error(`CLOVA API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.result?.message?.content || "";

        // Parse for function calls
        const functionCallMatch = content.match(/FUNCTION_CALL:\s*(\{[\s\S]*?\})/);

        if (functionCallMatch) {
            try {
                const functionCallData = JSON.parse(functionCallMatch[1]);
                console.log(`📞 CLOVA wants to call: ${functionCallData.name}`);

                return res.json({
                    functionCall: {
                        name: functionCallData.name,
                        arguments: JSON.stringify(functionCallData.arguments),
                    },
                });
            } catch (parseError) {
                console.error("Failed to parse function call:", parseError);
            }
        }

        // No function call, return text response
        res.json({ content });
    } catch (error) {
        console.error("CLOVA function calling error:", error);
        res.status(500).json({
            error: "Failed to process AI request",
            details: error.message,
        });
    }
});
