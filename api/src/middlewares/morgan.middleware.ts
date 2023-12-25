import morgan from "morgan";
import { Request, Response } from "express";
import { logger } from "../config/logger"

morgan.token('id', (req: Request, res: Response) => {
    return res.locals.errorId
})

const incomingMessage = (tokens: any, req: any, res: any) => {
    return [
        tokens.id(req, res),
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.req(req, res, 'content-length'), '-',
        tokens.res(req, res, 'response-time'), 'ms'
    ].join(' ')
}

const infoStream = {
    write: (message: string) => logger.info(message)
}

const errorStream = {
    write: (message: string) => logger.error(message)
}

export const infoMorgan = morgan(incomingMessage, {
    stream: infoStream, immediate: true
});

export const errorMorgan = morgan((tokens, req: Request, res:Response) => {
    return [
        incomingMessage(tokens, req, res),
        res.locals.errorMessage,
        res.locals.errorStack
    ].join(' ');
}, {
    stream: errorStream, skip(req: Request, res: Response): boolean {
        return res.statusCode < 400
    }
});