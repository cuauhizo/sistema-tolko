import express from 'express'
import dotenv from 'dotenv'
import colors from 'colors'
import cors from 'cors'

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

// Variables de entorno
dotenv.config()

// Configurar la app
const app = express()

// Middlewares

// Configurar CORS
const whiteList = [process.env.FRONTEND_URL, 'http://localhost:5174', 'https://www.tolkogroup.com', 'https://tolkogroup.com']
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

app.use('/', (req, res) => {
  res.send('Servidor sistema tolko funcionando')
})

// Definir puerto
const PORT = process.env.PORT || 4000

// Arrancar la app
app.listen(PORT, () => {
  console.log(colors.blue(`El servidor se esta ejecutando en el puerto: ${PORT}`))
})
