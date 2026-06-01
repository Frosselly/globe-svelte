export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const PASSWORD_RULES = [
	{
		test: (p: string) => p.length >= 8,
		msg: 'At least 8 characters'
	},
	{
		test: (p: string) => /[A-Z]/.test(p),
		msg: 'At least one uppercase letter'
	},
	{
		test: (p: string) => /[0-9]/.test(p),
		msg: 'At least one number'
	},
	{
		test: (p: string) => /[^A-Za-z0-9]/.test(p),
		msg: 'At least one special character'
	}
];

export function validateEmail(email: string): string | null {
	if (!email?.trim()) return 'Email is required';
	if (!EMAIL_RE.test(email.trim())) return 'Enter a valid email address';
	return null;
}

export function validatePassword(password: string, isRegister = false): string | null {
	if (!password) return 'Password is required';

	if (isRegister) {
		const failed = PASSWORD_RULES.find((rule) => !rule.test(password));
		if (failed) return failed.msg;
	}

	return null;
}
