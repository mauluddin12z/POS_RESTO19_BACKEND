import Users from "../users/users.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import messages from "../../utils/messages.js";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

// --- TOKENS ---
const generateAccessToken = (payload) =>
   jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: "15m" });

const generateRefreshToken = (payload) =>
   jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "30d" });

// --- REGISTER ---
export const register = async (payload) => {
   const { name, username, password, role } = payload;

   const exists = await Users.findOne({ where: { username } });
   if (exists) {
      throw { status: 409, message: messages.username_exists };
   }

   const hashed = await bcrypt.hash(password, 12);

   const user = await Users.create({
      name: name.trim(),
      username: username.trim(),
      password: hashed,
      role,
   });

   return {
      userId: user.userId,
      name: user.name,
      username: user.username,
      role: user.role,
   };
};

// --- LOGIN ---
export const login = async ({ username, password }) => {
   const user = await Users.findOne({ where: { username } });

   if (!user) {
      throw { status: 401, message: messages.invalid_credentials };
   }

   const isMatch = await bcrypt.compare(password, user.password);

   if (!isMatch) {
      throw { status: 401, message: messages.invalid_credentials };
   }

   const payload = {
      userId: user.userId,
      role: user.role,
   };

   const accessToken = generateAccessToken(payload);
   const refreshToken = generateRefreshToken(payload);

   // store latest refresh token (prevents reuse)
   user.refreshToken = refreshToken;
   await user.save();

   return {
      user: {
         userId: user.userId,
         name: user.name,
         role: user.role,
      },
      accessToken,
      refreshToken,
   };
};

// --- LOGOUT ---
export const logout = async (userId) => {
   const user = await Users.findByPk(userId);

   if (user) {
      // invalidate refresh token completely
      user.refreshToken = null;
      await user.save();
   }

   return true;
};

// --- REFRESH TOKEN ---
export const refresh = async (refreshToken) => {
   if (!refreshToken) {
      throw { status: 401, message: messages.refresh_token_required };
   }

   let decoded;

   try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
   } catch {
      throw { status: 403, message: messages.invalid_refresh_token };
   }

   const user = await Users.findByPk(decoded.userId);
   // critical security check
   if (!user || user.refreshToken !== refreshToken) {
      throw { status: 403, message: messages.invalid_refresh_token };
   }

   // ROTATE refresh token (important improvement)
   const newAccessToken = generateAccessToken({
      userId: user.userId,
      role: user.role,
   });

   const newRefreshToken = generateRefreshToken({
      userId: user.userId,
      role: user.role,
   });

   user.refreshToken = newRefreshToken;
   await user.save();

   return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
   };
};