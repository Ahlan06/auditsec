import { mailer } from '../../../utils/mailer.js';

export const sendEmailVerification = async ({ to, verifyUrl }) => {
  const subject = 'AuditSec — Vérification de votre email';
  const text = `Bonjour,\n\nClique sur ce lien pour vérifier ton email :\n${verifyUrl}\n\nSi tu n'es pas à l'origine de cette demande, ignore ce message.`;
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5">
      <h2>Vérifie ton email</h2>
      <p>Clique sur ce lien :</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      <p>Si tu n'es pas à l'origine de cette demande, ignore ce message.</p>
    </div>
  `;

  await mailer.sendMail({ to, subject, text, html });
};

export const sendPasswordResetEmail = async ({ to, resetUrl }) => {
  const subject = 'AuditSec — Réinitialisation de mot de passe';
  const text = `Bonjour,\n\nClique sur ce lien pour réinitialiser ton mot de passe :\n${resetUrl}\n\nSi tu n'es pas à l'origine de cette demande, ignore ce message.`;
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5">
      <h2>Réinitialisation de mot de passe</h2>
      <p>Clique sur ce lien :</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>Si tu n'es pas à l'origine de cette demande, ignore ce message.</p>
    </div>
  `;

  await mailer.sendMail({ to, subject, text, html });
};
