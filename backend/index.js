import express from 'express';
import dotenv from 'dotenv';
import colors from 'colors';
import cors from 'cors';

// Importar rutas
import productsRoutes from './routes/products.routes.js';
import authRoutes from './routes/auth.routes.js';
import usersRoutes from './routes/users.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import categoriesRoutes from './routes/categories.routes.js';
import tasksRoutes from './routes/tasks.routes.js';

// Variables de entorno
dotenv.config();

// Configurar la app
const app = express();

// Middlewares
// Leer datos via body
app.use(express.json());
// Configurar CORS
const whiteList = [process.env.FRONTEND_URL, undefined];
const corsOptions = {
  origin: function (origin, callback) {
    // console.log(origin);
    if (whiteList.includes(origin)) {
      //Permitir la conexión
      callback(null, true);
    } else {
      //No permitir la conexión
      callback(new Error('Error de CORS'));
    }
  },
};

app.use(cors(corsOptions));

// Definir una ruta
// app.use('/', (req, res) => {
//   res.send('Servidor sistema tolko funcionando');
// });

// Rutas de la API
app.use('/api/products', productsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/tasks', tasksRoutes);

// Definir puerto
const PORT = process.env.PORT || 4000;

// Arrancar la app
app.listen(PORT, () => {
  console.log(colors.blue(`El servidor se esta ejecutando en el puerto: ${PORT}`));
});
