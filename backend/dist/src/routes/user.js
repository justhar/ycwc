import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth.js";
import { profileController } from "../controllers/index.js";
const user = new Hono();
// Profile routes
user.get("/profile", authMiddleware, (c) => profileController.getProfile(c));
user.put("/profile", authMiddleware, (c) => profileController.updateProfile(c));
user.put("/info", authMiddleware, (c) => profileController.updateUserInfo(c));
// Favorite universities
user.get("/favorites/universities", authMiddleware, (c) => profileController.getFavoriteUniversities(c));
user.post("/favorites/universities/:universityId", authMiddleware, (c) => profileController.addFavoriteUniversity(c));
user.delete("/favorites/universities/:universityId", authMiddleware, (c) => profileController.removeFavoriteUniversity(c));
user.get("/favorites/universities/check/:universityId", authMiddleware, (c) => profileController.checkFavoriteUniversity(c));
// Favorite scholarships - check route must be defined first to prevent conflicts
user.get("/favorites/scholarships/check/:scholarshipId", authMiddleware, (c) => profileController.checkFavoriteScholarship(c));
user.get("/favorites/scholarships", authMiddleware, (c) => profileController.getFavoriteScholarships(c));
user.post("/favorites/scholarships/:scholarshipId", authMiddleware, (c) => profileController.addFavoriteScholarship(c));
user.delete("/favorites/scholarships/:scholarshipId", authMiddleware, (c) => profileController.removeFavoriteScholarship(c));
// Backward compatibility alias for universities
user.get("/favorites", authMiddleware, (c) => profileController.getFavoriteUniversities(c));
// Backward compatibility aliases for scholarship favorites
user.get("/scholarship-favorites", authMiddleware, (c) => profileController.getFavoriteScholarships(c));
user.post("/scholarship-favorites/:scholarshipId", authMiddleware, (c) => profileController.addFavoriteScholarship(c));
user.delete("/scholarship-favorites/:scholarshipId", authMiddleware, (c) => profileController.removeFavoriteScholarship(c));
export default user;
