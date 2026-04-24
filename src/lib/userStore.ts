//fake store
const users = [];

export const findUserByEmail = (email) => {
	return users.find((u) => u.email === email);
};

export const createUser = (email, password) => {
	const user = {
		id: crypto.randomUUID(),
		email,
		password, //hash later
		createdAt: new Date()
	};
	users.push(user);
	return user;
};

export const getUserById = (id) => {
	return users.find((u) => u.id === id);
};
