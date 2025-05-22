import { drizzle } from "drizzle-orm/node-postgres";
import db from "../../db/connectDb";
import { and, eq } from "drizzle-orm";
import { user } from "../../db/schema/user.model";
import { session } from "../../db/schema/session.model";
import { NotFoundException } from "utils/error";


type SessionType = typeof session.$inferInsert;

class SessionServices {




    public async getAllSession(userId: string): Promise<SessionType[]> { 

       const sessions = await db.query.session.findMany({where: eq(user.id, userId)})

       return sessions

    }

    public async getSessionById( sessionId:string) : Promise<SessionType> {

        const retrivedSession = await db.query.session.findFirst({ where: eq(session.id, sessionId) })

        if (!retrivedSession) {
            throw new NotFoundException("Session not found");
        }
        return retrivedSession;

    }

    public async createSession (userId:string, expires_at: Date): Promise<{id:string}> {

        const [newSession] = await db.insert(session).values({user_id:userId, expires_at: expires_at}).returning({
            id:session.id
        })

        return newSession

    }
    
}

const sessionServices = new SessionServices()
export default sessionServices