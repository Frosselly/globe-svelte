// scripts/addUser.ts
import * as fs from 'fs';
import * as path from 'path';

interface User {
	id: number;
	username: string;
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	role: string;
}

interface Database {
	users: User[];
}

const dbPath = path.join(process.cwd(), 'static', 'tempAuthDB.json');

function loadDatabase(): Database {
	try {
		const data = fs.readFileSync(dbPath, 'utf-8');
		return JSON.parse(data);
	} catch (error) {
		console.error('Error reading database:', error);
		return { users: [] };
	}
}

function saveDatabase(db: Database): void {
	try {
		fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
		console.log('Database saved successfully');
	} catch (error) {
		console.error('Error saving database:', error);
	}
}

function addUser(user: Omit<User, 'id'>): void {
	const db = loadDatabase();

	// Check if email already exists
	if (db.users.some((u) => u.email === user.email)) {
		console.error(`User with email ${user.email} already exists`);
		return;
	}

	// Generate new ID
	const newId = db.users.length > 0 ? Math.max(...db.users.map((u) => u.id)) + 1 : 1;

	const newUser: User = {
		id: newId,
		...user
	};

	db.users.push(newUser);
	saveDatabase(db);
	console.log(`User added successfully:`, newUser);
}

// Get arguments from command line
const args = process.argv.slice(2);

if (args.length < 5) {
	console.log(
		'Usage: npx ts-node scripts/addUser.ts <username> <email> <password> <firstName> <lastName> [role]'
	);
	console.log(
		'Example: npx ts-node scripts/addUser.ts johndoe john@example.com pass123 John Doe user'
	);
	process.exit(1);
}

const [username, email, password, firstName, lastName, role = 'user'] = args;

addUser({
	username,
	email,
	password,
	firstName,
	lastName,
	role
});
