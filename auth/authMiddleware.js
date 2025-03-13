import { supabaseAuthMiddleware } from "./supabaseAuthMiddleware.js";

export const authMiddleWare = async (req, res, next) => {
    supabaseAuthMiddleware(req, res, next)
};