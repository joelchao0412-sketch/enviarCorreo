// api/send-email.js
import nodemailer from 'nodemailer';

// El handler es la función que Vercel ejecutará
export default async function handler(req, res) {
  // 1. Solo permitimos peticiones POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }
  

  // 2. Verificamos el token Bearer
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No autorizado: falta token' });
  }

  const token = authHeader.split(' ')[1];

  // Comparamos con el token que tienes en variables de entorno
  if (token !== process.env.API_SECRET) {
    return res.status(403).json({ message: 'Token inválido' });
  }

  // 3. Obtenemos los datos del cuerpo de la petición
  const { to, subject, body, attachment, filename } = req.body;

  if (!to || !subject || !body) {
    return res.status(400).json({ message: 'Faltan campos: to, subject, body' });
  }

  // 4. Configuramos el transporter de Nodemailer
  // Usamos variables de entorno para las credenciales (¡MUY IMPORTANTE!)
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST, // 'smtp.gmail.com' para Gmail
    port: process.env.EMAIL_PORT, // 465 para SSL
    secure: true, // true para 465, false para otros puertos
    auth: {
      user: process.env.EMAIL_USER, // Tu correo electrónico
      pass: process.env.EMAIL_PASS, // Tu Contraseña de Aplicación
    },
  });

  // 5. Configuramos las opciones del correo
  const mailOptions = {
    from: `"Mi App Flutter" <${process.env.EMAIL_USER}>`,
    to: to,
    subject: subject,
    text: body || '',
    attachments: attachment
      ? [
          {
            filename: filename || 'archivo.pdf',
            content: Buffer.from(attachment, 'base64'),
            contentType: 'application/pdf',
          },
        ]
      : [],
    // html: "<b>Hola mundo</b>" // Puedes enviar HTML también
  };

  try {
    // 6. Enviamos el correo
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Correo enviado con éxito' });
  } catch (error) {
    console.error('Error al enviar correo:', error);
    res.status(500).json({ message: 'Error al enviar el correo', error: error.message });
  }
}