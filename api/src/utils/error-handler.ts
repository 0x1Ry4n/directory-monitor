import { ApiError } from "./api-error";
import { Request, Response } from "express";

export const errorHandler = (err: ApiError | Error, req: Request, res: Response) => {
    res.locals.errorId = Math.floor(Math.random() * 1000000);

    const errorStatusCode = err instanceof ApiError ? err.statusCode : 500;

    res.locals.errorMessage = err.message;
    res.locals.errorStack = err.stack;

    res.status(errorStatusCode).json({ errorId: res.locals.errorId, message: err.message})
}


