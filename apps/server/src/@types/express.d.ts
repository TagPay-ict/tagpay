// src/@types/express.d.ts
import { user } from '@db/schema/user.model';
import { Request } from 'express';

declare global {
    namespace Express {
        interface Request {
            user?: Partial<typeof user>
            sessionId:string
        }
    }
}
