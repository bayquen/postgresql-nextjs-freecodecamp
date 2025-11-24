import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Client } from "pg";

// Define the structure of a User object
interface User {
    id: string;
    name: string;
    email: string;
    age: number;
  }

// Create a PostgreSQL client
function getClient() {
    return new Client({
        connectionString: process.env.PGSQL_URL,
    });
}

// Fetch all users from the database
async function readUsers(): Promise<User[]> {
    const client= getClient();
    await client.connect();

    try {
        const result = await client.query("SELECT id, name, email, age FROM users");
        return result.rows;
    } finally {
        await client.end();
    }
}

// Insert or update users in the DB
async function writeUsers(users: User[]) {
    const client = getClient();
    await client.connect();

    try {
        const insertQuery = `
        INSERT INTO users (id, name, email, age) 
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            email = EXCLUDED.email,
            age = EXCLUDED.age;
        `;

        for (const user of users) {
            await client.query(insertQuery, [user.id, user.name, user.email, user.age]);
        } 
    } finally {
        await client.end();
    }
}