import express from 'express'
import dotenv from 'dotenv'
import colors from 'colors'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'

// Importar rutas
import productsRoutes from './routes/products.routes.js'
import authRoutes from './routes/auth.routes.js'
import usersRoutes from './routes/users.routes.js'
import dashboardRoutes from './routes/dashboard.routes.js'
import categoriesRoutes from './routes/categories.routes.js'
import tasksRoutes from './routes/tasks.routes.js'
import workOrdersRoutes from './routes/workOrders.routes.js'
import inventoryRoutes from './routes/inventory.routes.js'
import userDashboardRoutes from './routes/userDashboard.routes.js'
import notificationsRoutes from './routes/notifications.routes.js'
import publicRoutes from './routes/public.routes.js'
import suppliersRoutes from './routes/suppliers.routes.js'

// Variables de entorno
dotenv.config()

// Configurar la app
const app = express()

// --- CONFIGURAR EL SERVIDOR HTTP Y SOCKET.IO ---
const httpServer = createServer(app)
const whiteList = [process.env.FRONTEND_URL, 'http://localhost:5174', 'https://www.tolkogroup.com', 'https://tolkogroup.com', 'https://sistema.tolkogroup.com']

// Inicializamos Socket.io aplicándole tu misma lista blanca de CORS
const io = new Server(httpServer, {
  cors: {
    origin: whiteList,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
})

// Exportamos 'io' para que los controladores puedan enviar notificaciones
export { io }

// Escuchamos cuando un usuario se conecta o desconecta
io.on('connection', socket => {
  console.log(colors.magenta('Un usuario se ha conectado al WebSocket:'), socket.id)

  // NUEVO: Escuchamos cuando el frontend nos manda los datos del usuario
  socket.on('register', userData => {
    // Lo metemos a su sala privada (ej. "user-5")
    if (userData.id) {
      socket.join(`user-${userData.id}`)
      console.log(colors.cyan(`Usuario ${userData.id} unido a la sala: user-${userData.id}`))
    }

    // Si es administrador, lo metemos a la sala general de admins
    if (userData.isAdmin) {
      socket.join('admins')
      console.log(colors.yellow(`Usuario ${userData.id} unido a la sala: admins`))
    }
  })

  socket.on('disconnect', () => {
    console.log(colors.gray('Usuario desconectado del WebSocket:'), socket.id)
  })
})

// Middlewares

// Configurar CORS para las peticiones normales de Express (Axios)
const corsOptions = {
  origin: function (origin, callback) {
    // console.log(origin);
    if (whiteList.includes(origin) || !origin) {
      //Permitir la conexión
      callback(null, true)
    } else {
      //No permitir la conexión
      callback(new Error('Error de CORS'))
    }
  },
}

app.use(cors(corsOptions))

// Leer datos via body
app.use(express.json())

// --- RUTAS PÚBLICAS ---
app.use('/api/public', publicRoutes)

// Definir una ruta
// Rutas de la API
app.use('/api/auth', authRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/products', productsRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/categories', categoriesRoutes)
app.use('/api/tasks', tasksRoutes)
app.use('/api/workorders', workOrdersRoutes)
app.use('/api/inventory', inventoryRoutes)
app.use('/api/user-dashboard', userDashboardRoutes)
app.use('/api/notifications', notificationsRoutes)
app.use('/api/suppliers', suppliersRoutes)

app.use('/', (req, res) => {
  res.send('Servidor sistema tolko funcionando')
})

// Definir puerto
const PORT = process.env.PORT || 4000

// --- ARRANCAR LA APP (Usando httpServer en lugar de app) ---
httpServer.listen(PORT, () => {
  console.log(colors.blue(`El servidor HTTP y WebSockets se están ejecutando en el puerto: ${PORT}`))
})
