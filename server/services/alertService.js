/**
 * GeoNail Alert Dispatcher Service
 * Integrates Nodemailer (Email) and Twilio (SMS) with transparent status reporting.
 * Primary Alert Recipient: phoenix.team0091@gmail.com
 */

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

class AlertService {
  constructor() {
    this.emailConfigured = Boolean(
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.SMTP_USER !== 'geonail.alerts@gmail.com' &&
      process.env.SMTP_USER !== 'mineguard.alerts@gmail.com' &&
      process.env.SMTP_PASS !== 'your_app_password_here'
    );

    this.smsConfigured = Boolean(
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      !process.env.TWILIO_ACCOUNT_SID.startsWith('ACXXXX')
    );

    this.transporter = null;
    if (this.emailConfigured) {
      try {
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: Number(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
      } catch (err) {
        console.warn('[AlertService] Failed to initialize Nodemailer:', err.message);
        this.emailConfigured = false;
      }
    }
  }

  async dispatchEmergencyAlert(alertPayload) {
    const {
      node_id,
      zone = 'Extraction Zone',
      risk_score = 0.91,
      state = 'CRITICAL',
      trigger_reason = 'Deformation threshold exceeded',
      tilt_deg = null,
      displacement_mm = null,
      disp_rate_mm_hr = null,
      vibration_rms_g = null,
      crack_width_mm = null,
      neighbor_corr = null,
      message
    } = alertPayload;

    const isDemo = Boolean(alertPayload.is_demo);
    const emailSubject = isDemo
      ? 'GeoNail Critical Subsidence Alert'
      : `[URGENT] ${state} Mine Safety Alert: Node ${node_id} (${zone})`;

    const bodyContent = isDemo
      ? `GeoNail
Mine Safety Monitoring System

CRITICAL SUBSIDENCE ALERT

Node:
${node_id || 'N06'}

Risk Score:
${risk_score || 0.91}

Displacement:
${displacement_mm != null ? displacement_mm : '5.21'} mm

Displacement Rate:
${disp_rate_mm_hr != null ? disp_rate_mm_hr : '1.40'} mm/hr

Tilt:
${tilt_deg != null ? tilt_deg : '0.62'}°

Vibration RMS:
${vibration_rms_g != null ? vibration_rms_g : '0.74'} g

Crack Width:
${crack_width_mm != null ? crack_width_mm : '1.80'} mm

Event:
Demo Critical Alert

Timestamp:
${new Date().toISOString()}

================================================================================
NOTE: This is a DEMONSTRATION ALERT generated for SIH 2026 presentation testing.
Recipient: phoenix.team0091@gmail.com
================================================================================
`
      : `================================================================================
GEONAIL MINE SAFETY EARLY WARNING SYSTEM
Smart India Hackathon 2026 | PS 26025
================================================================================

ALERT SEVERITY    : ${state}
ZONE              : ${zone}
STATION NODE      : ${node_id}
RISK SCORE        : ${risk_score}
TIMESTAMP         : ${new Date().toISOString()}

MEASUREMENTS:
- Displacement     : ${displacement_mm != null ? displacement_mm + ' mm' : '--'}
- Disp Rate        : ${disp_rate_mm_hr != null ? disp_rate_mm_hr + ' mm/hr' : '--'}
- Tilt Angle       : ${tilt_deg != null ? tilt_deg + '°' : '--'}
- Vibration RMS    : ${vibration_rms_g != null ? vibration_rms_g + ' g' : '--'}
- Crack Width      : ${crack_width_mm != null ? crack_width_mm + ' mm' : '--'}
- Neighbor Corr    : ${neighbor_corr != null ? neighbor_corr : '--'}

TRIGGER REASON:
${trigger_reason}

Action Directive:
1. Initiate surface area evacuation for the monitored perimeter.
2. Halt heavy equipment operations above extraction face.
3. Notify mine safety officer and geotechnical response team.
================================================================================
`;

    let emailResult = { status: 'NOT CONFIGURED', message: 'Email service not configured in environment' };
    let smsResult = { status: 'NOT CONFIGURED', message: 'SMS service not configured in environment' };

    // 1. Process Email
    const targetEmail = process.env.ALERT_EMAIL_TO || process.env.ALERT_EMAIL_RECIPIENTS || 'phoenix.team0091@gmail.com';
    if (this.emailConfigured && this.transporter) {
      try {
        await this.transporter.sendMail({
          from: `"GeoNail Mine Safety" <${process.env.SMTP_USER}>`,
          to: targetEmail,
          subject: emailSubject,
          text: bodyContent,
        });
        emailResult = { status: 'SENT', message: `Email dispatched to ${targetEmail}` };
      } catch (err) {
        console.error('[AlertService] Email dispatch failed:', err.message);
        emailResult = { status: 'FAILED', message: `Email error: ${err.message}` };
      }
    }

    // 2. Process SMS
    if (this.smsConfigured) {
      try {
        const twilio = (await import('twilio')).default;
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        const recipients = (process.env.ALERT_SMS_RECIPIENTS || '').split(',').filter(Boolean);

        const smsText = `[GEONAIL ${state}] Node ${node_id} (Risk: ${risk_score}) in ${zone}. Disp: ${displacement_mm}mm. Siren Triggered.`;

        for (const phone of recipients) {
          await client.messages.create({
            body: smsText,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phone.trim()
          });
        }
        smsResult = { status: 'SENT', message: `SMS sent to ${recipients.length} emergency contacts` };
      } catch (err) {
        console.error('[AlertService] SMS dispatch failed:', err.message);
        smsResult = { status: 'FAILED', message: `SMS error: ${err.message}` };
      }
    }

    return {
      email: emailResult.status,
      sms: smsResult.status,
      email_details: emailResult.message,
      sms_details: smsResult.message,
      siren: 'TRIGGERED',
      timestamp: new Date().toISOString()
    };
  }
}

export const alertService = new AlertService();
