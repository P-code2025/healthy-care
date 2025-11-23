
app.delete("/api/chat-messages", requireAuth, async (req, res) => {
    try {
        const userId = req.userId;
        console.log(`[DELETE /api/chat-messages] Clearing messages for user: ${userId}`);

        const result = await prisma.chatMessage.deleteMany({
            where: { userId },
        });

        console.log(`[DELETE /api/chat-messages] Deleted ${result.count} messages`);
        res.json({
            success: true,
            deletedCount: result.count,
            message: 'All chat messages cleared successfully'
        });
    } catch (error) {
        console.error("[DELETE /api/chat-messages] Error:", error);
        res.status(500).json({ error: "Failed to delete chat messages" });
    }
});
