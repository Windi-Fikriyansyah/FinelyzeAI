import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '.schema'
const sql = neon('postgresql://finelyzedb_owner:npg_x0wsP9zTRUCZ@ep-soft-bread-a16ga22g-pooler.ap-southeast-1.aws.neon.tech/finelyzedb?sslmode=require');
const db = drizzle(sql,{schema});