import jwt from "jsonwebtoken";
export declare const generateAuthToken: (user: any) => string;
export declare const verifyAuthToken: (token: string) => string | jwt.JwtPayload | null;
//# sourceMappingURL=generateToken.d.ts.map