import type { APIRoute } from 'astro';
import { Resend } from 'resend';

// On-demand endpoint: must not be prerendered at build time.
export const prerender = false;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Length caps keep abuse (and Resend payload limits) in check.
const MAX_LENGTHS = { name: 200, email: 320, company: 200, message: 5000 } as const;

interface ContactPayload {
  name: string;
  email: string;
  company: string;
  message: string;
  /** Honeypot field — must stay empty; bots tend to fill every input. */
  website: string;
}

/** Read an env var at runtime (Vercel) with a build-time fallback (local dev). */
function env(key: string): string | undefined {
  return import.meta.env[key] ?? process.env[key];
}

/** Escape user input before interpolating it into the email HTML. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function json(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** Accept both fetch-based JSON posts and classic form-encoded submissions. */
async function parseBody(request: Request): Promise<ContactPayload | null> {
  const contentType = request.headers.get('content-type') ?? '';
  let raw: Record<string, unknown>;

  try {
    if (contentType.includes('application/json')) {
      raw = await request.json();
    } else if (
      contentType.includes('application/x-www-form-urlencoded') ||
      contentType.includes('multipart/form-data')
    ) {
      raw = Object.fromEntries(await request.formData());
    } else {
      return null;
    }
  } catch {
    return null;
  }

  const field = (key: string) => (typeof raw[key] === 'string' ? (raw[key] as string).trim() : '');

  return {
    name: field('name'),
    email: field('email'),
    company: field('company'),
    message: field('message'),
    website: field('website'),
  };
}

function buildHtml(data: ContactPayload): string {
  const name = escapeHtml(data.name);
  const email = escapeHtml(data.email);
  const company = escapeHtml(data.company) || '-';
  const message = escapeHtml(data.message).replace(/\n/g, '<br/>');

  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f4f7fb; padding: 32px;">
      <div style="background: linear-gradient(135deg, #001840 0%, #0A66C2 100%); border-radius: 12px; padding: 32px; margin-bottom: 24px;">
        <h1 style="color: #ffffff; font-size: 22px; margin: 0;">New contact form submission</h1>
      </div>
      <div style="background: #ffffff; border-radius: 12px; padding: 32px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #E8ECF2; color: #56687A; font-size: 13px; width: 120px;">Name</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #E8ECF2; font-weight: 600; color: #1A1F2E;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #E8ECF2; color: #56687A; font-size: 13px;">Email</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #E8ECF2;">
              <a href="mailto:${email}" style="color: #0A66C2;">${email}</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #E8ECF2; color: #56687A; font-size: 13px;">Company</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #E8ECF2; color: #1A1F2E;">${company}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #56687A; font-size: 13px; vertical-align: top;">Message</td>
            <td style="padding: 10px 0; color: #1A1F2E; line-height: 1.6;">${message}</td>
          </tr>
        </table>
      </div>
    </div>
  `;
}

function buildText(data: ContactPayload): string {
  return [
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Company: ${data.company || '-'}`,
    '',
    data.message,
  ].join('\n');
}

export const POST: APIRoute = async ({ request }) => {
  const apiKey = env('RESEND_API_KEY');
  const toEmail = env('CONTACT_TO_EMAIL');

  if (!apiKey || !toEmail) {
    console.error('Contact API misconfigured: RESEND_API_KEY and/or CONTACT_TO_EMAIL missing.');
    return json({ error: 'Server configuration error.' }, 500);
  }

  const data = await parseBody(request);
  if (!data) {
    return json({ error: 'Invalid request body.' }, 400);
  }

  // Honeypot tripped: report success so bots learn nothing, send nothing.
  if (data.website) {
    return json({ success: true }, 200);
  }

  if (!data.name || !data.email || !data.message) {
    return json({ error: 'Missing required fields.' }, 400);
  }
  if (!EMAIL_REGEX.test(data.email)) {
    return json({ error: 'Invalid email address.' }, 400);
  }
  for (const [key, max] of Object.entries(MAX_LENGTHS)) {
    if (data[key as keyof typeof MAX_LENGTHS].length > max) {
      return json({ error: `Field "${key}" is too long.` }, 400);
    }
  }

  const resend = new Resend(apiKey);
  const from = env('CONTACT_FROM_EMAIL') ?? 'BearingBridge AI <onboarding@resend.dev>';
  const subject = data.company
    ? `New enquiry from ${data.name} - ${data.company}`
    : `New enquiry from ${data.name}`;

  try {
    const { error } = await resend.emails.send({
      from,
      to: toEmail,
      replyTo: data.email,
      subject,
      html: buildHtml(data),
      text: buildText(data),
    });

    if (error) {
      console.error('Resend error:', error);
      return json({ error: 'Failed to send email.' }, 500);
    }
  } catch (err) {
    console.error('Unexpected error sending email:', err);
    return json({ error: 'Unexpected error.' }, 500);
  }

  return json({ success: true }, 200);
};
