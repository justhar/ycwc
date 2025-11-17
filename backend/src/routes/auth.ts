import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db } from "../db/db.js";
import { users } from "../db/schema.js";
import { hashPassword, comparePassword, generateToken } from "../utils/auth.js";
import { getLocalizedMessage, getLanguageFromHeader } from "../utils/i18n.js";

const auth = new Hono();

// User Registration
auth.post("/register", async (c) => {
  try {
    const { fullName, email, password } = await c.req.json();
    const lang = getLanguageFromHeader(c);

    // Validate input
    if (!fullName || !email || !password) {
      return c.json(
        { error: getLocalizedMessage("missingRequiredFields", "errors", lang) },
        400
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return c.json(
        { error: getLocalizedMessage("invalidEmailFormat", "errors", lang) },
        400
      );
    }

    if (password.length < 6) {
      return c.json(
        { error: getLocalizedMessage("passwordTooShort", "errors", lang) },
        400
      );
    }

    if (fullName.trim().length < 2) {
      return c.json(
        { error: getLocalizedMessage("fullNameTooShort", "errors", lang) },
        400
      );
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existingUser.length > 0) {
      return c.json(
        { error: getLocalizedMessage("emailAlreadyExists", "errors", lang) },
        409
      );
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);

    const newUser = await db
      .insert(users)
      .values({
        fullName: fullName.trim(),
        email,
        password: hashedPassword,
      })
      .returning({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
      });

    // Generate JWT token
    const token = generateToken(newUser[0].id);

    return c.json(
      {
        message: getLocalizedMessage("signupSuccessful", "success", lang),
        user: {
          id: newUser[0].id,
          fullName: newUser[0].fullName,
          email: newUser[0].email,
        },
        token,
      },
      201
    );
  } catch (error) {
    console.error("Registration error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// User Login
auth.post("/login", async (c) => {
  try {
    const { email, password } = await c.req.json();
    const lang = getLanguageFromHeader(c);

    // Validate input
    if (!email || !password) {
      return c.json(
        { error: getLocalizedMessage("missingRequiredFields", "errors", lang) },
        400
      );
    }

    // Find user by email
    const user = await db.select().from(users).where(eq(users.email, email));

    if (user.length === 0) {
      return c.json(
        { error: getLocalizedMessage("invalidCredentials", "errors", lang) },
        401
      );
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user[0].password);

    if (!isValidPassword) {
      return c.json(
        { error: getLocalizedMessage("invalidCredentials", "errors", lang) },
        401
      );
    }

    // Generate JWT token
    const token = generateToken(user[0].id);

    return c.json({
      message: getLocalizedMessage("loginSuccessful", "success", lang),
      user: { id: user[0].id, email: user[0].email },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    const lang = getLanguageFromHeader(c);
    return c.json(
      { error: getLocalizedMessage("internalServerError", "errors", lang) },
      500
    );
  }
});

// Logout (client-side token removal, but we can provide an endpoint)
auth.post("/logout", async (c) => {
  return c.json({
    message: "Logout successful. Please remove the token from client storage.",
  });
});

export default auth;
