import nodemailer from 'nodemailer';

const DEFAULT_RECIPIENT = 'Lockdownstudio021@gmail.com';

function escapeHtml(value) {
    return String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function detailRow(label, value) {
    if (!value) return '';
    return `<tr><th style="padding:10px 12px;text-align:left;vertical-align:top;border-bottom:1px solid #dce3e8;color:#40505e;font-size:13px;width:150px">${escapeHtml(label)}</th><td style="padding:10px 12px;border-bottom:1px solid #dce3e8;color:#111820;font-size:14px;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`;
}

export function createLeadMessage(lead, reference) {
    const isCallRequest = lead.enquiryType === 'call';
    const isTestingSignup = lead.enquiryType === 'testing';
    const subject = isCallRequest
        ? `Call request from ${lead.name}`
        : isTestingSignup ? `Mobile testing pool signup from ${lead.name}` : `Website enquiry from ${lead.name}`;

    const rows = [
        detailRow('Enquiry type', isCallRequest ? 'Free 15-minute call' : isTestingSignup ? 'Mobile game testing pool' : 'Project enquiry'),
        detailRow('Name', lead.name),
        detailRow('Business', lead.company),
        detailRow('Email', lead.email),
        detailRow('Phone', lead.phone),
        detailRow('Contact preference', lead.contactPreference),
        detailRow('Preferred call time', lead.bestTime),
        detailRow('Service', lead.service),
        detailRow('Testing contact consent', isTestingSignup && lead.testingConsent ? 'Yes' : ''),
        detailRow('Message', lead.message),
        detailRow('Received', lead.receivedAt),
        detailRow('Reference', reference)
    ].join('');

    const gmailUser = process.env.GMAIL_USER || DEFAULT_RECIPIENT;
    return {
        from: `Lockdown Studios Website <${gmailUser}>`,
        to: process.env.CONTACT_TO_EMAIL || gmailUser,
        replyTo: lead.email,
        subject,
        html: `<div style="font-family:Arial,sans-serif;max-width:680px;margin:auto;color:#111820"><h1 style="font-size:24px">${escapeHtml(subject)}</h1><p style="color:#40505e">A new enquiry was submitted through lockdownstudios.com.</p><table style="width:100%;border-collapse:collapse;border:1px solid #dce3e8">${rows}</table><p style="margin-top:20px;color:#667786;font-size:12px">Reply to this message to contact ${escapeHtml(lead.name)} at ${escapeHtml(lead.email)}.</p></div>`
    };
}

export async function sendLeadNotification(lead, reference) {
    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
    if (!gmailUser || !gmailAppPassword) throw new Error('Gmail delivery is not configured');

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: gmailUser,
            pass: gmailAppPassword
        },
        connectionTimeout: 8_000,
        greetingTimeout: 8_000,
        socketTimeout: 10_000
    });

    await transporter.sendMail(createLeadMessage(lead, reference));
}

export function createGameFeedbackMessage(feedback, reference) {
    const subject = 'Drift Protocol playtest feedback';
    const rows = [
        detailRow('Game', 'Drift Protocol'),
        detailRow('Rating', feedback.rating ? `${feedback.rating}/5` : 'Not rated'),
        detailRow('Liked', feedback.liked ? 'Yes' : 'No'),
        detailRow('Alias', feedback.alias || 'Anonymous'),
        detailRow('Comment', feedback.comment || 'No comment'),
        detailRow('Received', feedback.receivedAt),
        detailRow('Reference', reference)
    ].join('');
    const gmailUser = process.env.GMAIL_USER || DEFAULT_RECIPIENT;
    return {
        from: `Lockdown Studios Website <${gmailUser}>`,
        to: process.env.CONTACT_TO_EMAIL || gmailUser,
        subject,
        html: `<div style="font-family:Arial,sans-serif;max-width:680px;margin:auto;color:#111820"><h1 style="font-size:24px">${subject}</h1><p style="color:#40505e">A player submitted private feedback through lockdownstudios.com.</p><table style="width:100%;border-collapse:collapse;border:1px solid #dce3e8">${rows}</table></div>`
    };
}

export async function sendGameFeedbackNotification(feedback, reference) {
    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
    if (!gmailUser || !gmailAppPassword) throw new Error('Gmail delivery is not configured');
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com', port: 465, secure: true,
        auth: { user: gmailUser, pass: gmailAppPassword },
        connectionTimeout: 8_000, greetingTimeout: 8_000, socketTimeout: 10_000
    });
    await transporter.sendMail(createGameFeedbackMessage(feedback, reference));
}
