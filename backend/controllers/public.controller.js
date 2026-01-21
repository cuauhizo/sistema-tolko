import transporter from '../config/mailer.js' // Importamos el transporter que YA existe

export const handleContactForm = async (req, res) => {
  // 1. Obtenemos los datos del formulario (igual que en tu API de landing)
  const { nombre, email, telefono, servicio, mensaje } = req.body

  if (!nombre || !email || !telefono || !servicio || !mensaje) {
    // Si falta algún campo, devuelve un error 400 (Bad Request)
    return res.status(400).json({ msg: 'Todos los campos son obligatorios.' })
  }

  // 2. Definimos el contenido del correo (igual que en tu API de landing)
  const contentHTML = `
        <html>
            <body>
                <h3>Nuevo Contacto desde la Web</h3>
                <ul>
                    <li><strong>Nombre:</strong> ${nombre}</li>
                    <li><strong>Email:</strong> ${email}</li>
                    <li><strong>Teléfono:</strong> ${telefono}</li>
                    <li><strong>Servicio:</strong> ${servicio}</li>
                </ul>
                <p>${mensaje}</p>
            </body>
        </html>
    `

  try {
    // 3. Usamos el transporter de 'sistema-tolko' para enviar el correo
    await transporter.sendMail({
      from: `"Formulario Web Tolko" <${process.env.EMAIL_USER}>`, // El 'from' debe ser el correo de Google
      to: 'clazcano@tolkogroup.com, frodriguez@tolkogroup.com', // El correo que recibe (configurado en el .env de este backend)
      subject: 'Nuevo Mensaje del Formulario de Contacto',
      html: contentHTML,
      replyTo: email, // ¡Importante! Para que al 'Responder' se le conteste al cliente
    })

    res.status(200).json({ msg: 'Mensaje enviado correctamente' })
  } catch (error) {
    console.error('Error al enviar correo desde formulario público:', error)
    res.status(500).json({ msg: 'Error del servidor al enviar el correo' })
  }
}
