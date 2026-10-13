import {Pool} from 'pg';
const globalPool=globalThis as unknown as {dragonPool?:Pool};
export const db=globalPool.dragonPool??new Pool({connectionString:process.env.DATABASE_URL,max:3,connectionTimeoutMillis:5000,idleTimeoutMillis:10000,ssl:process.env.DB_SSL==='true'?{rejectUnauthorized:true}:undefined});
if(process.env.NODE_ENV!=='production')globalPool.dragonPool=db;
