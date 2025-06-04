import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schemas from "../../db/schema"
import { Pool } from "pg";


export default class WebhookHandlers {

    private readonly db: NodePgDatabase<typeof schemas> & {$client: Pool};


    constructor(db: NodePgDatabase<typeof schemas> &{ $client: Pool }){
        this.db = db
    }

    public walletCreated_handler (data:any) {
        
        

    }


}