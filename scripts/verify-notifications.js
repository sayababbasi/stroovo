require('dotenv').config();

const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const webpush = require('web-push');
const { Client } = require('pg');

const db = new Client({
  connectionString: process.env.DATABASE_URL
});

function getArg(name, fallback) {
  const prefix = `--${name}=`;
  const arg = process.argv.find((item) => item.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : fallback;
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

async function getTenantById(tenantId) {
  const result = await db.query(
    'SELECT id, name, "customerServiceEmail", "customerServicePass", "internalEmail", "internalPass", "smtpHost", "smtpPort", "smtpSecure" FROM "Tenant" WHERE id = $1 LIMIT 1',
    [tenantId]
  );
  return result.rows[0] || null;
}

async function resolveMailConfig(tenantId, profile) {
  const baseConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number.parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || process.env.EMAIL_USER || '',
      pass: process.env.SMTP_PASS || process.env.EMAIL_PASS || ''
    }
  };

  const tenant = tenantId ? await getTenantById(tenantId).catch(() => null) : null;

  const config = {
    ...baseConfig,
    auth: { ...baseConfig.auth }
  };

  if (tenant) {
    if (profile === 'CUSTOMER_SERVICE') {
      config.auth.user = tenant.customerServiceEmail || process.env.CUSTOMER_SERVICE_EMAIL || config.auth.user;
      config.auth.pass = tenant.customerServicePass || process.env.CUSTOMER_SERVICE_PASS || config.auth.pass;
    } else {
      config.auth.user = tenant.internalEmail || process.env.INTERNAL_EMAIL || config.auth.user;
      config.auth.pass = tenant.internalPass || process.env.INTERNAL_PASSWORD || config.auth.pass;
    }

    config.host = tenant.smtpHost || config.host;
    config.port = tenant.smtpPort || config.port;
    config.secure = tenant.smtpSecure ?? config.secure;
  } else if (profile === 'CUSTOMER_SERVICE') {
    config.auth.user = process.env.CUSTOMER_SERVICE_EMAIL || config.auth.user;
    config.auth.pass = process.env.CUSTOMER_SERVICE_PASS || config.auth.pass;
  } else {
    config.auth.user = process.env.INTERNAL_EMAIL || config.auth.user;
    config.auth.pass = process.env.INTERNAL_PASSWORD || config.auth.pass;
  }

  return { config, tenant };
}

function buildEmailContent({ title, message, priority, profile, tenantName, supportEmail, link, metadata }) {
  const priorityColorMap = {
    LOW: '#28a745',
    MEDIUM: '#ffc107',
    HIGH: '#fd7e14',
    URGENT: '#dc3545'
  };
  const priorityColor = priorityColorMap[priority] || '#6c757d';
  const metadataRows = Object.entries(metadata || {})
    .map(([key, value]) => {
      return `
        <div style="display:flex;justify-content:space-between;gap:16px;font-size:14px;color:#475569;padding:8px 0;border-bottom:1px solid #e2e8f0;">
          <span style="font-weight:600;color:#1e293b;">${key}</span>
          <span>${String(value)}</span>
        </div>
      `;
    })
    .join('');

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:24px;background:#f7fafc;font-family:Segoe UI,Arial,sans-serif;color:#1a202c;">
  <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:24px;overflow:hidden;box-shadow:0 10px 15px -3px rgba(0,0,0,0.08);">
    <div style="padding:36px 28px;background:linear-gradient(135deg,#4c51bf 0%,#667eea 100%);color:#ffffff;text-align:center;">
      <div style="font-size:28px;font-weight:700;">Revotic AI Workflow Platform</div>
      <div style="margin-top:10px;font-size:15px;opacity:0.92;">Live notification delivery test</div>
    </div>
    <div style="padding:32px 28px;">
      <div style="display:inline-block;background:${priorityColor};color:#ffffff;padding:6px 12px;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:0.04em;">
        ${priority}
      </div>
      <h1 style="margin:18px 0 10px;font-size:26px;line-height:1.2;color:#1e293b;">${title}</h1>
      <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#475569;">${message}</p>
      <div style="background:#f8fafc;border-left:4px solid ${priorityColor};border-radius:14px;padding:18px 18px 8px;">
        ${metadataRows}
      </div>
      ${link ? `<a href="${link}" style="display:inline-block;margin-top:24px;background:linear-gradient(135deg,#4c51bf 0%,#667eea 100%);color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:12px;font-weight:600;">Open Workspace</a>` : ''}
    </div>
    <div style="padding:24px 28px;background:#f8fafc;border-top:1px solid #edf2f7;text-align:center;">
      <div style="font-size:18px;font-weight:700;color:#4c51bf;">Revotic AI</div>
      <div style="margin-top:10px;font-size:13px;color:#718096;">Tenant: ${tenantName}</div>
      <div style="margin-top:6px;font-size:13px;color:#718096;">Profile: ${profile}</div>
      <div style="margin-top:6px;font-size:13px;color:#718096;">Support: <a href="mailto:${supportEmail}" style="color:#4c51bf;text-decoration:none;">${supportEmail}</a></div>
      <div style="margin-top:16px;font-size:11px;color:#94a3b8;">(c) 2026 Revotic AI Pvt Ltd. All rights reserved.</div>
    </div>
  </div>
</body>
</html>`;

  const text = [
    'REVOTIC AI WORKFLOW PLATFORM',
    '================================',
    '',
    `${title} [${priority}]`,
    '',
    message,
    '',
    `Tenant: ${tenantName}`,
    `Profile: ${profile}`,
    ...Object.entries(metadata || {}).map(([key, value]) => `${key}: ${String(value)}`),
    link ? `Link: ${link}` : '',
    '',
    `Support: ${supportEmail}`
  ].join('\n');

  return { html, text };
}

function writePreview(html) {
  const outputPath = path.join(process.cwd(), 'tmp', 'notification-email-preview.html');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, html, 'utf8');
  return outputPath;
}

async function verifySmtp(profile, tenantId) {
  const { config, tenant } = await resolveMailConfig(tenantId, profile);
  const transporter = nodemailer.createTransport(config);
  await transporter.verify();
  return {
    transporter,
    tenant,
    username: config.auth.user,
    host: config.host,
    port: config.port,
    secure: config.secure
  };
}

async function main() {
  const tenantId = getArg('tenant', 'default');
  const sendTo = getArg('to', '');
  const sendProfile = getArg('profile', 'INTERNAL').toUpperCase() === 'CUSTOMER_SERVICE'
    ? 'CUSTOMER_SERVICE'
    : 'INTERNAL';
  const shouldSend = hasFlag('send');

  console.log('Running notification verification...');

  const results = [];

  try {
    await db.connect();
    const tenant = await getTenantById(tenantId).catch(() => null);
    results.push({
      check: 'database',
      status: 'PASS',
      details: tenant ? `Connected. Tenant "${tenant.name}" found.` : `Connected. Tenant "${tenantId}" not found, env fallback will be used.`
    });
  } catch (error) {
    results.push({
      check: 'database',
      status: 'FAIL',
      details: error.message
    });
  }

  try {
    const internal = await verifySmtp('INTERNAL', tenantId);
    results.push({
      check: 'smtp_internal',
      status: 'PASS',
      details: `Verified ${internal.host}:${internal.port} as ${internal.username}`
    });
  } catch (error) {
    results.push({
      check: 'smtp_internal',
      status: 'FAIL',
      details: error.message
    });
  }

  try {
    const customer = await verifySmtp('CUSTOMER_SERVICE', tenantId);
    results.push({
      check: 'smtp_customer_service',
      status: 'PASS',
      details: `Verified ${customer.host}:${customer.port} as ${customer.username}`
    });
  } catch (error) {
    results.push({
      check: 'smtp_customer_service',
      status: 'FAIL',
      details: error.message
    });
  }

  try {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || process.env.VAPID_PUBLIC_KEY || '';
    const privateKey = process.env.VAPID_PRIVATE_KEY || '';
    const subject = process.env.VAPID_SUBJECT || '';
    if (!publicKey || !privateKey || !subject) {
      throw new Error('Missing one or more VAPID settings');
    }
    webpush.setVapidDetails(subject, publicKey, privateKey);
    results.push({
      check: 'vapid',
      status: 'PASS',
      details: `Configured with subject ${subject}`
    });
  } catch (error) {
    results.push({
      check: 'vapid',
      status: 'FAIL',
      details: error.message
    });
  }

  const supportEmail = process.env.CUSTOMER_SERVICE_EMAIL || 'contact.revoticai@gmail.com';
  const preview = buildEmailContent({
    title: 'Revotic AI notification delivery test',
    message: 'This confirms that tenant-aware notification settings, SMTP delivery, and branded email rendering are configured for live use.',
    priority: 'MEDIUM',
    profile: sendProfile,
    tenantName: tenantId,
    supportEmail,
    link: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    metadata: {
      tenantId,
      generatedAt: new Date().toISOString(),
      fallbackMode: 'tenant-first, env-second'
    }
  });

  const previewPath = writePreview(preview.html);
  results.push({
    check: 'email_template',
    status: 'PASS',
    details: `Preview written to ${previewPath}`
  });

  if (shouldSend) {
    if (!sendTo) {
      throw new Error('Missing --to=<email> for --send');
    }

    const smtp = await verifySmtp(sendProfile, tenantId);
    await smtp.transporter.sendMail({
      from: `"Workflow Notifications" <${smtp.username}>`,
      to: sendTo,
      subject: 'Revotic AI Workflow Platform Test Email',
      text: preview.text,
      html: preview.html
    });

    results.push({
      check: 'email_send',
      status: 'PASS',
      details: `Sent test email to ${sendTo} using ${sendProfile}`
    });
  }

  console.table(results);

  const failed = results.filter((item) => item.status === 'FAIL');
  if (failed.length > 0) {
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error('Verification failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.end().catch(() => {});
  });
