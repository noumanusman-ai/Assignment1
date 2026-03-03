import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { env } from '$env/dynamic/private';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import * as authSchema from '$lib/server/db/auth.schema';
import nodemailer from 'nodemailer';

let _transporter: nodemailer.Transporter;
function getTransporter() {
	if (!_transporter) {
		_transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: env.SMTP_USER,
				pass: env.SMTP_APP_PASSWORD
			}
		});
	}
	return _transporter;
}

function buildVerificationEmail(url: string): string {
	return `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#131022;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
	<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#131022;padding:40px 20px;">
		<tr>
			<td align="center">
				<table width="480" cellpadding="0" cellspacing="0" style="background:rgba(41,35,72,0.9);border:1px solid rgba(155,146,201,0.2);border-radius:16px;padding:40px;">
					<tr>
						<td align="center" style="padding-bottom:24px;">
							<div style="width:48px;height:48px;background-color:#3713EC;border-radius:12px;display:inline-flex;align-items:center;justify-content:center;">
								<span style="font-size:28px;color:white;">&#128274;</span>
							</div>
						</td>
					</tr>
					<tr>
						<td align="center" style="padding-bottom:8px;">
							<h1 style="margin:0;font-size:24px;font-weight:800;color:#ffffff;">NexusID</h1>
						</td>
					</tr>
					<tr>
						<td align="center" style="padding-bottom:32px;">
							<p style="margin:0;font-size:14px;color:#94a3b8;">Verify your email address</p>
						</td>
					</tr>
					<tr>
						<td align="center" style="padding-bottom:32px;">
							<p style="margin:0;font-size:14px;color:#cbd5e1;line-height:1.6;">
								Click the button below to verify your email and activate your NexusID account.
							</p>
						</td>
					</tr>
					<tr>
						<td align="center" style="padding-bottom:32px;">
							<a href="${url}" style="display:inline-block;padding:12px 32px;background-color:#3713EC;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;border-radius:8px;">
								Verify Email
							</a>
						</td>
					</tr>
					<tr>
						<td align="center">
							<p style="margin:0;font-size:12px;color:#64748b;line-height:1.5;">
								If you didn't create a NexusID account, you can safely ignore this email.
							</p>
						</td>
					</tr>
				</table>
			</td>
		</tr>
	</table>
</body>
</html>`;
}

export const auth = betterAuth({
	baseURL: env.ORIGIN,
	secret: env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, { provider: 'pg', schema: authSchema }),
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true
	},
	emailVerification: {
		sendOnSignUp: true,
		autoSignInAfterVerification: true,
		sendVerificationEmail: async ({ user, url }) => {
			await getTransporter().sendMail({
				from: `"NexusID" <${env.SMTP_USER}>`,
				to: user.email,
				subject: 'Verify your NexusID email',
				html: buildVerificationEmail(url)
			});
		}
	},
	socialProviders: {
		github: {
			clientId: env.GITHUB_CLIENT_ID,
			clientSecret: env.GITHUB_CLIENT_SECRET
		},
		google: {
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET
		}
	},
	plugins: [sveltekitCookies(getRequestEvent)] // make sure this is the last plugin in the array
});
