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
      // to: 'clazcano@tolkogroup.com, frodriguez@tolkogroup.com', // El correo que recibe (configurado en el .env de este backend)
      to: 'frodriguez@tolkogroup.com', // El correo que recibe (configurado en el .env de este backend)
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

// NUEVO CONTROLADOR PARA "ÚNETE AL EQUIPO"
export const handleCareersForm = async (req, res) => {
  // Los campos de texto llegan en req.body
  const { nombre, telefono, email } = req.body
  // El archivo llega en req.file (gracias a multer)
  const cvFile = req.file

  if (!nombre || !telefono || !email || !cvFile) {
    return res.status(400).json({ msg: 'Todos los campos y el CV son obligatorios.' })
  }

  const contentHTML = `
        <html>
            <body>
                <h3>Nueva Solicitud de Programa de Becarios
                </h3>
                <ul>
                    <li><strong>Nombre:</strong> ${nombre}</li>
                    <li><strong>Email:</strong> ${email}</li>
                    <li><strong>Teléfono:</strong> ${telefono}</li>
                </ul>
                <p>El currículum vitae se encuentra adjunto a este correo.</p>
            </body>
        </html>
    `

  try {
    await transporter.sendMail({
      from: `"Programa de Becarios Tolko" <${process.env.EMAIL_USER}>`,
      to: 'frodriguez@tolkogroup.com', // O el correo de Recursos Humanos
      subject: `Nueva postulación de: ${nombre}`,
      html: contentHTML,
      replyTo: email,
      // AQUÍ ADJUNTAMOS EL CV AL CORREO
      attachments: [
        {
          filename: cvFile.originalname,
          content: cvFile.buffer,
        },
      ],
    })

    res.status(200).json({ msg: '¡Tu información y CV se enviaron con éxito!' })
  } catch (error) {
    console.error('Error al enviar correo desde Bolsa de Trabajo:', error)
    res.status(500).json({ msg: 'Error del servidor al enviar la solicitud' })
  }
}
