const tryCatch = (handler) => {
    return async (req, res, next) => {
        try {
            await handler(req, res, next);
        }
        catch (error) {
            res.status(500).json({
                message: error instanceof Error ? error.message : "Unknown error",
            });
        }
    };
};
export default tryCatch;
//# sourceMappingURL=tryCatch.js.map