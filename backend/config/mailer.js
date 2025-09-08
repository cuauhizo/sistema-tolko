import nodemailer from 'nodemailer';
import { config } from 'dotenv';

config();

// Configura el "transportador" que se conectará al servicio de correo.
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true, // true para el puerto 465, false para otros puertos
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verifica que la conexión con el servidor de correo sea exitosa.
transporter.verify().then(() => {
  console.log('Servidor de correo listo para enviar notificaciones.'.cyan);
}).catch(error => {
  console.error('Error al conectar con el servidor de correo:'.red, error);
});

export default transporter;