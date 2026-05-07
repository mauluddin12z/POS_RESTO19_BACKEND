import cookie from "cookie";

const isProduction = process.env.NODE_ENV === "production";

const baseOptions = {
   httpOnly: true,
   secure: isProduction,
   sameSite: isProduction ? "none" : "lax",
   path: "/",
   domain: isProduction ? process.env.COOKIE_DOMAIN : undefined,
};

export const setAuthCookies = (res, accessToken, refreshToken) => {
   const cookies = [];

   if (accessToken) {
      cookies.push(
         cookie.serialize("accessToken", accessToken, {
            ...baseOptions,
            maxAge: 60 * 60 * 24 * 7, // 7d
         })
      );
   }

   if (refreshToken) {
      cookies.push(
         cookie.serialize("refreshToken", refreshToken, {
            ...baseOptions,
            maxAge: 60 * 60 * 24 * 30, // 30d
         })
      );
   }

   res.setHeader("Set-Cookie", cookies);
};

export const clearAuthCookies = (res) => {
   res.setHeader("Set-Cookie", [
      cookie.serialize("accessToken", "", {
         ...baseOptions,
         maxAge: 0,
      }),
      cookie.serialize("refreshToken", "", {
         ...baseOptions,
         maxAge: 0,
      }),
   ]);
};