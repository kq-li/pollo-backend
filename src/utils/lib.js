// @flow
import {
    NextFunction,
    Response,
    Request,
} from 'express';
import AppDevResponse from './AppDevResponse';
import UserSessionsRepo from '../repos/UserSessionsRepo';

/** Removes element from array on predicate */
function remove <T>(arr: Array<T>, pred: (param: T, num: number) => boolean) {
    for (let i = arr.length - 1; i > -1; i -= 1) {
        if (pred(arr[i], i)) {
            arr.splice(i, 1);
        }
    }
}

// Checks authentication header for token
async function ensureAuthenticated(req: Request, res: Response,
    next: NextFunction) {
    const header = req.get('Authorization');
    if (!header) {
        res.send(new AppDevResponse(false,
            { errors: ['Authorization header missing!'] }));
        return next(true);
    }
    const bearerToken = header.replace('Bearer ', '').trim();
    if (!bearerToken) {
        res.send(new AppDevResponse(false,
            { errors: ['Invalid authorization header!'] }));
        return next(true);
    }

    if (!await UserSessionsRepo.verifySession(bearerToken)) {
        res.send(new AppDevResponse(false,
            { errors: ['Invalid session token'] }));
        return next(true);
    }
    const user = await UserSessionsRepo.getUserFromToken(bearerToken);
    req.user = user;

    return next();
}

// Checks for refresh token, and updates session accordingly
async function updateSession(req: Request, res: Response, next: NextFunction) {
    const header = req.get('Authorization');
    if (!header) {
        res.send(new AppDevResponse(false,
            { errors: ['Authorization header missing!'] }));
        return next(true);
    }
    const bearerToken = header.replace('Bearer ', '').trim();
    if (!bearerToken) {
        res.send(new AppDevResponse(false,
            { errors: ['Invalid authorization header!'] }));
        return next(true);
    }

    const session = await UserSessionsRepo.updateSession(bearerToken);
    if (!session) {
        res.send(new AppDevResponse(false,
            { errors: ['Invalid refresh token!'] }));
        return next(true);
    }
    req.session = session;
    return next();
}

export default {
    remove,
    ensureAuthenticated,
    updateSession,
};
