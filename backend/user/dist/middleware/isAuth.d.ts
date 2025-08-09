import type { NextFunction, Request, Response } from "express";
import type { IUser } from "../model/User.js";
export interface IsAuthRequest extends Request {
    user?: IUser | null;
}
export declare const isAuth: (req: IsAuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=isAuth.d.ts.map