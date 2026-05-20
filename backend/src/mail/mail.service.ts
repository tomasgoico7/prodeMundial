import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

/**
 * Envío de emails con 3 modos:
 *  - SMTP real: si están SMTP_HOST/USER/PASS.
 *  - Ethereal (por defecto en dev): buzón de prueba real con link de preview.
 *  - Consola: si Ethereal falla (sin red) o MAIL_ETHEREAL=false.
 */
@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private ethereal = false;
  private from = 'El Prode de la Gambeta <no-reply@prodelagambeta.app>';

  constructor(private readonly config: ConfigService) {}

  async onModuleInit(): Promise<void> {
    this.from = this.config.get<string>('MAIL_FROM', this.from);
    const host = this.config.get<string>('SMTP_HOST');

    if (host) {
      const user = this.config.get<string>('SMTP_USER');
      const pass = this.config.get<string>('SMTP_PASS');
      this.transporter = nodemailer.createTransport({
        host,
        port: Number(this.config.get<string>('SMTP_PORT', '587')),
        secure: this.config.get<string>('SMTP_SECURE') === 'true',
        auth: user ? { user, pass } : undefined,
      });
      this.logger.log(`SMTP real configurado (${host}).`);
      return;
    }

    if (this.config.get<string>('MAIL_ETHEREAL', 'true') !== 'false') {
      try {
        const acc = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: acc.smtp.host,
          port: acc.smtp.port,
          secure: acc.smtp.secure,
          auth: { user: acc.user, pass: acc.pass },
        });
        this.ethereal = true;
        this.logger.log(
          `📬 Email de PRUEBA vía Ethereal listo (user: ${acc.user}). Cada mail trae link de preview.`,
        );
        return;
      } catch (err) {
        this.logger.warn(
          `No se pudo crear cuenta Ethereal (${(err as Error).message}). Uso consola.`,
        );
      }
    }
    this.logger.log('Sin SMTP: modo consola, los emails se loguean.');
  }

  async send(to: string, subject: string, text: string, html?: string): Promise<void> {
    if (!this.transporter) {
      this.logger.log(`📧 [MAIL DEV] Para: ${to} | ${subject}`);
      return;
    }
    try {
      const info = await this.transporter.sendMail({
        from: this.from,
        to,
        subject,
        text,
        html: html ?? text,
      });
      if (this.ethereal) {
        this.logger.log(`📧 "${subject}" → ${to} · ver: ${nodemailer.getTestMessageUrl(info)}`);
      } else {
        this.logger.log(`📧 Email enviado a ${to}: ${subject}`);
      }
    } catch (err) {
      this.logger.warn(`No se pudo enviar email a ${to}: ${(err as Error).message}`);
    }
  }

  /** Aviso de que una fase del prode quedó habilitada. */
  async sendPhaseAvailable(to: string, name: string, phaseLabel: string): Promise<void> {
    const subject = `⚽ El Prode de la Gambeta: ya podés completar "${phaseLabel}"`;
    const text =
      `¡Hola ${name}!\n\nYa se habilitó la fase "${phaseLabel}" del Mundial 2026 en tu prode. ` +
      `Entrá a completarla y firmarla antes de que arranquen los partidos.\n\n` +
      `👉 http://localhost:3100/predictions\n\n¡Aguante, crack! 🇦🇷`;
    const html =
      `<div style="font-family:system-ui,sans-serif;max-width:520px">` +
      `<h2 style="color:#0ea5e9">⚽ El Prode de la Gambeta</h2>` +
      `<p>¡Hola <strong>${name}</strong>!</p>` +
      `<p>Ya se habilitó la fase <strong>"${phaseLabel}"</strong> del Mundial 2026 en tu prode.</p>` +
      `<p>Entrá a completarla y firmarla <strong>antes de que arranquen los partidos</strong>.</p>` +
      `<p><a href="http://localhost:3100/predictions" style="background:#0ea5e9;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:bold">Completar mi prode</a></p>` +
      `<p style="color:#666">¡Aguante, crack! 🇦🇷</p></div>`;
    await this.send(to, subject, text, html);
  }

  /** Invitación a un grupo (con el código para unirse). */
  async sendGroupInvite(
    to: string,
    groupName: string,
    inviterName: string,
    inviteCode: string,
  ): Promise<void> {
    const subject = `⚽ ${inviterName} te invitó al grupo "${groupName}" — El Prode de la Gambeta`;
    const text =
      `¡Hola!\n\n${inviterName} te invitó a su grupo "${groupName}" para el Prode del Mundial 2026.\n\n` +
      `Código para unirte: ${inviteCode}\n\n` +
      `1) Entrá a http://localhost:3100/register y creá tu cuenta (o ingresá si ya tenés).\n` +
      `2) En "La Barra" tocá "Sumarme" y pegá el código ${inviteCode}.\n\n` +
      `¡Te esperamos, crack! 🇦🇷`;
    const html =
      `<div style="font-family:system-ui,sans-serif;max-width:520px">` +
      `<h2 style="color:#0ea5e9">⚽ El Prode de la Gambeta</h2>` +
      `<p><strong>${inviterName}</strong> te invitó a su grupo <strong>"${groupName}"</strong> para el Prode del Mundial 2026.</p>` +
      `<p>Tu código para unirte:</p>` +
      `<p style="font-size:28px;font-weight:bold;letter-spacing:4px;background:#f1f5f9;padding:12px 18px;border-radius:10px;display:inline-block;color:#0b1220">${inviteCode}</p>` +
      `<p>1) Creá tu cuenta o ingresá. &nbsp; 2) En <strong>La Barra → Sumarme</strong>, pegá el código.</p>` +
      `<p><a href="http://localhost:3100/register" style="background:#0ea5e9;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:bold">Crear cuenta y unirme</a></p>` +
      `<p style="color:#666">¡Te esperamos, crack! 🇦🇷</p></div>`;
    await this.send(to, subject, text, html);
  }
}
