-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 12-09-2025 a las 00:36:14
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `bd_sistema_tolko`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categories`
--

INSERT INTO `categories` (`id`, `name`, `created_at`) VALUES
(1, 'Rotulación', '2025-08-27 17:11:17'),
(2, 'Impresión Gran Formato 2', '2025-08-27 17:11:43'),
(5, 'Viniles', '2025-08-27 17:13:46'),
(6, 'Impresión en Offset', '2025-08-27 17:23:42'),
(8, 'Impresión Digital', '2025-08-28 17:27:00'),
(12, 'Señaliticas', '2025-08-28 21:04:43'),
(13, 'Telas', '2025-09-03 19:05:55'),
(16, 'Papel', '2025-09-03 20:12:00'),
(18, 'Presswall', '2025-09-05 16:10:04'),
(19, 'Tarjetas de Presentación', '2025-09-05 16:16:06'),
(21, 'Dípticos Y Trípticos', '2025-09-05 16:16:43'),
(22, 'Folletos Y Catálogos - ACT', '2025-09-05 16:16:53'),
(23, 'Volantes Publicitarios', '2025-09-05 16:17:00'),
(25, 'para borrar', '2025-09-09 23:41:19'),
(26, 'Football', '2025-09-09 23:42:52');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inventory_movements`
--

CREATE TABLE `inventory_movements` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `work_order_id` int(11) DEFAULT NULL,
  `quantity_change` int(11) NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `inventory_movements`
--

INSERT INTO `inventory_movements` (`id`, `product_id`, `work_order_id`, `quantity_change`, `reason`, `created_at`) VALUES
(1, 7, 2, -1, 'Salida por Orden de Trabajo #2', '2025-09-01 20:10:25'),
(2, 11, 2, -1, 'Salida por Orden de Trabajo #2', '2025-09-01 20:10:25'),
(3, 20, 2, -3, 'Salida por Orden de Trabajo #2', '2025-09-01 20:10:25'),
(4, 6, 3, -3, 'Salida por Orden de Trabajo #3', '2025-09-01 20:48:12'),
(5, 8, 3, -1, 'Salida por Orden de Trabajo #3', '2025-09-01 20:48:12'),
(6, 20, 3, -1, 'Salida por Orden de Trabajo #3', '2025-09-01 20:48:12'),
(7, 8, 4, -1, 'Salida por Orden de Trabajo #4', '2025-09-04 18:15:38'),
(8, 17, 4, -1, 'Salida por Orden de Trabajo #4', '2025-09-04 18:15:38'),
(9, 18, 4, -1, 'Salida por Orden de Trabajo #4', '2025-09-04 18:15:38'),
(10, 31, 4, -4, 'Salida por Orden de Trabajo #4', '2025-09-04 18:15:38'),
(11, 15, 8, -1, 'Salida por Orden de Trabajo #8', '2025-09-04 19:35:06'),
(12, 17, 8, -3, 'Salida por Orden de Trabajo #8', '2025-09-04 19:35:06'),
(13, 18, 8, -9, 'Salida por Orden de Trabajo #8', '2025-09-04 19:35:06'),
(14, 7, 11, -4, 'Salida por Orden de Trabajo #11', '2025-09-04 19:39:20'),
(15, 29, 11, -3, 'Salida por Orden de Trabajo #11', '2025-09-04 19:39:20'),
(16, 8, 4, -1, 'Salida por Orden de Trabajo #4', '2025-09-04 19:48:25'),
(17, 17, 4, -1, 'Salida por Orden de Trabajo #4', '2025-09-04 19:48:25'),
(18, 18, 4, -1, 'Salida por Orden de Trabajo #4', '2025-09-04 19:48:25'),
(19, 31, 4, -4, 'Salida por Orden de Trabajo #4', '2025-09-04 19:48:25'),
(20, 7, 11, -4, 'Salida por Orden de Trabajo #11', '2025-09-05 00:11:37'),
(21, 29, 11, -3, 'Salida por Orden de Trabajo #11', '2025-09-05 00:11:37'),
(22, 7, 7, -3, 'Salida por Orden de Trabajo #7', '2025-09-05 00:11:43'),
(23, 13, 7, -2, 'Salida por Orden de Trabajo #7', '2025-09-05 00:11:43'),
(24, 15, 7, -1, 'Salida por Orden de Trabajo #7', '2025-09-05 00:11:43'),
(25, 7, 11, -4, 'Salida por Orden de Trabajo #11', '2025-09-05 00:20:16'),
(26, 29, 11, -3, 'Salida por Orden de Trabajo #11', '2025-09-05 00:20:16'),
(27, 8, 4, -1, 'Salida por Orden de Trabajo #4', '2025-09-05 15:45:31'),
(28, 17, 4, -1, 'Salida por Orden de Trabajo #4', '2025-09-05 15:45:31'),
(29, 18, 4, -1, 'Salida por Orden de Trabajo #4', '2025-09-05 15:45:31'),
(30, 31, 4, -4, 'Salida por Orden de Trabajo #4', '2025-09-05 15:45:31'),
(31, 6, 3, -3, 'Salida por Orden de Trabajo #3', '2025-09-05 19:44:01'),
(32, 8, 3, -1, 'Salida por Orden de Trabajo #3', '2025-09-05 19:44:01'),
(33, 20, 3, -1, 'Salida por Orden de Trabajo #3', '2025-09-05 19:44:01'),
(34, 7, 11, -4, 'Salida por Orden de Trabajo #11', '2025-09-05 20:25:50'),
(35, 29, 11, -3, 'Salida por Orden de Trabajo #11', '2025-09-05 20:25:50'),
(36, 7, 16, -3, 'Salida por Orden de Trabajo #16', '2025-09-08 17:55:55'),
(37, 12, 16, -10, 'Salida por Orden de Trabajo #16', '2025-09-08 17:55:55'),
(38, 20, 17, -5, 'Salida por Orden de Trabajo #17', '2025-09-09 15:54:48'),
(39, 41, 17, -15, 'Salida por Orden de Trabajo #17', '2025-09-09 15:54:48'),
(40, 36, NULL, 30, 'Compra de material', '2025-09-09 20:28:11'),
(41, 18, NULL, 2, 'Sobrante de OT-0012', '2025-09-09 20:30:31'),
(42, 7, 16, -3, 'Salida por Orden de Trabajo #16', '2025-09-09 21:03:19'),
(43, 12, 16, -10, 'Salida por Orden de Trabajo #16', '2025-09-09 21:03:19'),
(44, 7, 16, -3, 'Salida por Orden de Trabajo #16', '2025-09-09 21:11:04'),
(45, 12, 16, -10, 'Salida por Orden de Trabajo #16', '2025-09-09 21:11:04'),
(46, 28, 15, -110, 'Salida por Orden de Trabajo #15', '2025-09-10 00:17:43'),
(47, 41, 15, -50, 'Salida por Orden de Trabajo #15', '2025-09-10 00:17:43'),
(48, 18, NULL, 5, 'sobrantes del proyecto TO- 0015', '2025-09-10 00:18:53'),
(49, 7, NULL, 50, 'compra ', '2025-09-11 17:25:01');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `message` varchar(255) NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `link` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `message`, `is_read`, `link`, `created_at`) VALUES
(1, 10, 'La tarea \"tarea otro usuario\" que tienes asignada ha sido actualizada.', 1, '/my-tasks', '2025-09-05 21:22:39'),
(2, 10, 'La tarea \"otra mas para eliminar\" que tienes asignada ha sido actualizada.', 1, '/my-tasks', '2025-09-05 21:40:28'),
(3, 7, 'La tarea \"Vendor tellus elementum consectetur sit\" que tienes asignada ha sido actualizada.', 0, '/my-tasks', '2025-09-05 21:40:35'),
(4, 10, 'La tarea \"tarea otro usuario\" que tienes asignada ha sido actualizada.', 1, '/my-tasks', '2025-09-05 21:40:46'),
(5, 10, 'Se te ha asignado una nueva tarea: \"Semper consectetur sit nisi vivamus.\"', 1, '/my-tasks', '2025-09-05 21:41:24'),
(6, 10, 'Nueva orden de trabajo asignada: \"Elit consectetur elementum tellus consectetur\"', 1, '/my-work-orders', '2025-09-05 21:42:38'),
(7, 26, 'Se te ha asignado una nueva tarea: \"Aenean elit elementum aenean eiusmod\"', 1, '/my-tasks', '2025-09-05 22:04:19'),
(8, 26, 'Se te ha asignado una nueva tarea: \"Semper leo aenean nisi vivamus\"', 1, '/my-tasks', '2025-09-08 15:34:51'),
(9, 26, 'Nueva orden de trabajo asignada: \"Ipsum nisi vivamus dolor semper\"', 1, '/my-work-orders', '2025-09-08 15:36:59'),
(10, 26, 'Nueva orden de trabajo asignada: \"Emily Brown\"', 1, '/my-work-orders', '2025-09-08 16:53:19'),
(11, 26, 'La orden \"Nueva orden\" que tienes asignada ha sido actualizada.', 1, '/my-work-orders', '2025-09-08 16:53:59'),
(12, 26, 'La tarea \"Elementum nisi ipsum vivamus consectetur\" que tienes asignada ha sido actualizada.', 0, '/my-tasks', '2025-09-08 16:57:57'),
(13, 26, 'Nueva orden de trabajo asignada: \"Orden test productos\"', 0, '/my-work-orders', '2025-09-08 17:50:56'),
(14, 26, 'La orden \"Orden test productos\" que tienes asignada ha sido actualizada.', 1, '/my-work-orders', '2025-09-08 17:51:22'),
(15, 26, 'Nueva tarea (TA-0026) asignada: \"Semper consectetur dolor semper vendor\"', 1, '/my-tasks', '2025-09-08 21:55:40'),
(16, 26, 'La tarea \"Vivamus nisi consectetur elit leo - actu\" (TA-0015) que tienes asignada ha sido actualizada.', 0, '/my-tasks', '2025-09-08 22:33:00'),
(17, 26, 'La tarea \"Semper leo aenean nisi vivamus - actualizado\" (TA-0025) que tienes asignada ha sido actualizada.', 0, '/my-tasks', '2025-09-09 15:38:10'),
(18, 26, 'Nueva tarea (TA-0027) asignada: \"Consectetur elementum porttitor nisi leo\"', 1, '/my-tasks', '2025-09-09 15:38:56'),
(19, 26, 'Nueva orden (OT-0017) asignada: \"Dolor porttitor consectetur tellus vendor\"', 0, '/my-work-orders', '2025-09-09 15:40:52'),
(20, 26, 'La orden \"Elit consectetur elementum tellus consectetur\" (OT-0013) ha sido actualizada.', 1, '/my-work-orders', '2025-09-09 15:49:53'),
(21, 26, 'La orden \"Dolor porttitor consectetur tellus vendor\" (OT-0017) ha sido actualizada.', 0, '/my-work-orders', '2025-09-09 15:54:48'),
(22, 26, 'La orden \"Dolor porttitor consectetur tellus vendor\" (OT-0017) ha sido actualizada.', 1, '/my-work-orders', '2025-09-09 16:04:55'),
(23, 26, 'La orden \"Elit consectetur elementum tellus consectetur\" (OT-0013) ha sido actualizada.', 0, '/my-work-orders', '2025-09-09 16:05:53'),
(24, 26, 'La orden \"Orden test productos\" (OT-0016) ha sido actualizada.', 0, '/my-work-orders', '2025-09-09 21:03:19'),
(25, 26, 'La orden \"Orden test productos\" (OT-0016) ha sido actualizada.', 0, '/my-work-orders', '2025-09-09 21:11:04'),
(26, 26, 'La orden \"Elit consectetur elementum tellus consectetur\" (OT-0013) ha sido actualizada.', 1, '/my-work-orders', '2025-09-09 21:11:13'),
(27, 26, 'La orden \"Emily Brown\" (OT-0015) ha sido actualizada.', 0, '/my-work-orders', '2025-09-10 00:17:43'),
(28, 26, 'Nueva orden (OT-0018) asignada: \"Aenean leo semper sit vendor\"', 0, '/my-work-orders', '2025-09-11 00:21:09'),
(29, 26, 'Nueva orden (OT-0019) asignada: \"sadasdas\"', 0, '/my-work-orders', '2025-09-11 00:34:18'),
(30, 7, 'Nueva orden (OT-0020) asignada: \"sfded\"', 0, '/my-work-orders', '2025-09-11 00:40:31'),
(31, 7, 'Nueva orden de trabajo asignada: \"Orden multiple\"', 0, '/my-work-orders', '2025-09-11 16:40:48'),
(32, 14, 'Nueva orden de trabajo asignada: \"Orden multiple\"', 1, '/my-work-orders', '2025-09-11 16:40:48'),
(33, 26, 'Nueva orden de trabajo asignada: \"Orden multiple\"', 0, '/my-work-orders', '2025-09-11 16:40:48'),
(34, 1, 'La orden \"Orden multiple\" (OT-0021) requiere aprobación.', 1, '/work-orders', '2025-09-11 17:09:59'),
(35, 14, 'La orden \"Orden multiple\" (OT-0021) requiere aprobación.', 0, '/work-orders', '2025-09-11 17:09:59'),
(36, 1, 'La orden \"Orden multiple\" (OT-0021) requiere aprobación.', 1, '/work-orders', '2025-09-11 17:10:04'),
(37, 14, 'La orden \"Orden multiple\" (OT-0021) requiere aprobación.', 0, '/work-orders', '2025-09-11 17:10:04'),
(38, 7, 'La orden \"Orden multiple\" (OT-0021) ha sido actualizada.', 0, '/my-work-orders', '2025-09-11 18:03:47'),
(39, 14, 'La orden \"Orden multiple\" (OT-0021) ha sido actualizada.', 0, '/my-work-orders', '2025-09-11 18:03:47'),
(40, 26, 'La orden \"Orden multiple\" (OT-0021) ha sido actualizada.', 0, '/my-work-orders', '2025-09-11 18:03:47'),
(41, 7, 'La orden \"Orden multiple\" (OT-0021) ha sido actualizada.', 0, '/my-work-orders', '2025-09-11 18:23:29'),
(42, 14, 'La orden \"Orden multiple\" (OT-0021) ha sido actualizada.', 0, '/my-work-orders', '2025-09-11 18:23:29'),
(43, 26, 'La orden \"Orden multiple\" (OT-0021) ha sido actualizada.', 0, '/my-work-orders', '2025-09-11 18:23:29'),
(44, 26, 'La orden \"Orden de trabajo XX\" (OT-0002) ha sido actualizada.', 0, '/my-work-orders', '2025-09-11 18:43:33'),
(45, 18, 'La orden \"Correo LDP 214\" (OT-0009) ha sido actualizada.', 0, '/my-work-orders', '2025-09-11 19:04:41'),
(46, 26, 'La orden \"Semper elementum consectetur porttitor ipsum.\" (OT-0012) ha sido actualizada.', 0, '/my-work-orders', '2025-09-11 19:04:56'),
(47, 10, 'La orden \"Aenean leo semper sit vendor\" (OT-0018) ha sido actualizada.', 0, '/my-work-orders', '2025-09-11 19:05:23'),
(48, 18, 'La orden \"Aenean leo semper sit vendor\" (OT-0018) ha sido actualizada.', 0, '/my-work-orders', '2025-09-11 19:05:23'),
(49, 23, 'La orden \"Aenean leo semper sit vendor\" (OT-0018) ha sido actualizada.', 0, '/my-work-orders', '2025-09-11 19:05:23'),
(50, 26, 'La orden \"Aenean leo semper sit vendor\" (OT-0018) ha sido actualizada.', 0, '/my-work-orders', '2025-09-11 19:05:23'),
(51, 26, 'La orden \"Ipsum nisi vivamus dolor semper\" (OT-0014) ha sido actualizada.', 0, '/my-work-orders', '2025-09-11 19:06:05'),
(52, 10, 'La orden \"Dolor porttitor consectetur tellus vendor\" (OT-0017) ha sido actualizada.', 0, '/my-work-orders', '2025-09-11 19:06:22'),
(53, 10, 'La orden \"Orden desde bruce\" (OT-0008) ha sido actualizada.', 0, '/my-work-orders', '2025-09-11 19:06:37'),
(54, 1, 'La orden \"sfded\" (OT-0020) ha sido actualizada.', 0, '/my-work-orders', '2025-09-11 19:07:22'),
(55, 14, 'La orden \"Nisi leo sit consectetur eiusmod\" (OT-0007) ha sido actualizada.', 0, '/my-work-orders', '2025-09-11 19:07:38'),
(56, 23, 'La orden \"Nisi leo sit consectetur eiusmod\" (OT-0007) ha sido actualizada.', 0, '/my-work-orders', '2025-09-11 19:07:38'),
(57, 18, 'La orden \"Orden test productos\" (OT-0016) ha sido actualizada.', 0, '/my-work-orders', '2025-09-11 19:07:51'),
(58, 26, 'La orden \"Sit dolor semper elementum vendor\" (OT-0004) ha sido actualizada.', 0, '/my-work-orders', '2025-09-11 19:08:04'),
(59, 10, 'La orden \"Emily Brown\" (OT-0015) ha sido actualizada.', 0, '/my-work-orders', '2025-09-11 19:15:34'),
(60, 10, 'La orden \"Nueva orden\" (OT-0003) ha sido actualizada.', 0, '/my-work-orders', '2025-09-11 19:15:48'),
(61, 22, 'La orden \"Elit consectetur elementum tellus consectetur\" (OT-0013) ha sido actualizada.', 0, '/my-work-orders', '2025-09-11 19:16:10'),
(62, 26, 'La orden \"Elit consectetur elementum tellus consectetur\" (OT-0013) ha sido actualizada.', 0, '/my-work-orders', '2025-09-11 19:16:10'),
(63, 1, 'La orden \"Elit porttitor sit ipsum tellus\" (OT-0011) ha sido actualizada.', 0, '/my-work-orders', '2025-09-11 19:16:30'),
(64, 10, 'Nueva orden de trabajo asignada: \"Tellus aenean porttitor dolor aenean\"', 0, '/my-work-orders', '2025-09-11 19:21:29'),
(65, 23, 'Nueva orden de trabajo asignada: \"Tellus aenean porttitor dolor aenean\"', 0, '/my-work-orders', '2025-09-11 19:21:29'),
(66, 1, 'Nueva orden de trabajo asignada: \"Sed elementum tellus vendor vivamus\"', 0, '/my-work-orders', '2025-09-11 19:24:51'),
(67, 10, 'Nueva orden de trabajo asignada: \"Sed elementum tellus vendor vivamus\"', 0, '/my-work-orders', '2025-09-11 19:24:51'),
(68, 26, 'Nueva orden de trabajo asignada: \"Sed elementum tellus vendor vivamus\"', 0, '/my-work-orders', '2025-09-11 19:24:51'),
(69, 1, 'El usuario Regina actualizó la tarea \"Nisi porttitor vendor semper elit\" (TA-0005) al estado: En progreso.', 0, '/tasks', '2025-09-11 20:29:14'),
(70, 14, 'El usuario Regina actualizó la tarea \"Nisi porttitor vendor semper elit\" (TA-0005) al estado: En progreso.', 0, '/tasks', '2025-09-11 20:29:14'),
(71, 1, 'El usuario Regina actualizó la tarea \"Nisi porttitor vendor semper elit\" (TA-0005) al estado: Completada.', 0, '/tasks', '2025-09-11 20:31:35'),
(72, 14, 'El usuario Regina actualizó la tarea \"Nisi porttitor vendor semper elit\" (TA-0005) al estado: Completada.', 0, '/tasks', '2025-09-11 20:31:35'),
(73, 1, 'El usuario Regina actualizó la tarea \"Nisi porttitor vendor semper elit\" (TA-0005) al estado: En progreso.', 0, '/tasks', '2025-09-11 20:37:20'),
(74, 14, 'El usuario Regina actualizó la tarea \"Nisi porttitor vendor semper elit\" (TA-0005) al estado: En progreso.', 0, '/tasks', '2025-09-11 20:37:20'),
(75, 1, 'La orden \"Tellus aenean porttitor dolor aenean\" (OT-0022) requiere aprobación.', 0, '/work-orders', '2025-09-11 21:00:55'),
(76, 14, 'La orden \"Tellus aenean porttitor dolor aenean\" (OT-0022) requiere aprobación.', 0, '/work-orders', '2025-09-11 21:00:55'),
(77, 10, 'Nueva tarea (TA-0028) asignada: \"Ipsum consectetur aenean dolor elit\"', 1, '/my-tasks', '2025-09-11 21:03:47'),
(78, 26, 'Nueva tarea (TA-0029) asignada: \"Consectetur semper lorem vendor dolor\"', 1, '/my-tasks', '2025-09-11 21:04:33'),
(79, 1, 'El usuario Fabian actualizó la tarea \"Consectetur semper lorem vendor dolor\" (TA-0029) al estado: En progreso.', 0, '/tasks', '2025-09-11 21:07:22'),
(80, 14, 'El usuario Fabian actualizó la tarea \"Consectetur semper lorem vendor dolor\" (TA-0029) al estado: En progreso.', 0, '/tasks', '2025-09-11 21:07:22'),
(81, 1, 'El usuario Fabian actualizó la tarea \"Consectetur semper lorem vendor dolor\" (TA-0029) al estado: Completada.', 0, '/tasks', '2025-09-11 21:17:47'),
(82, 14, 'El usuario Fabian actualizó la tarea \"Consectetur semper lorem vendor dolor\" (TA-0029) al estado: Completada.', 0, '/tasks', '2025-09-11 21:17:47');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `price` decimal(10,2) NOT NULL,
  `unit` varchar(50) NOT NULL DEFAULT 'piezas',
  `category_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `products`
--

INSERT INTO `products` (`id`, `name`, `description`, `stock`, `price`, `unit`, `category_id`, `created_at`) VALUES
(6, 'Nisi sit sed tellus porttitor', 'Vivamus eiusmod vivamus leo porttitor elementum.', 114, 10.00, 'kg', 6, '2025-08-26 18:41:36'),
(7, 'Impresión Tela Banner', 'Descripción opcional', 47, 19.99, 'piezas', 2, '2025-08-26 18:42:11'),
(8, 'Impresión Vinil Microperforado', '', 145, 19.99, 'litros', 5, '2025-08-26 21:06:44'),
(11, 'Impresión Lona Mate', 'test', 149, 5.00, 'piezas', 2, '2025-08-27 17:59:23'),
(12, 'Impresión Vinil Microperforado', 'test', 120, 200.00, 'cajas', 2, '2025-08-27 18:07:57'),
(13, 'Impresión Vinil Blanco Mate', 'test', 1, 5.00, 'litros', 2, '2025-08-27 18:08:43'),
(14, 'IImpresión Tela Canvas Mate', 'test', 40, 50.00, 'kg', 2, '2025-08-27 18:15:55'),
(15, 'Impresión Lona Mate', '', 8, 410.00, 'piezas', 2, '2025-08-27 18:22:22'),
(16, 'Flag Football', 'test', 10, 150.00, 'kg', 2, '2025-08-27 20:44:39'),
(17, 'Volantes Publicitarios', 'test', 4, 150.00, 'kg', 6, '2025-08-27 20:44:55'),
(18, 'Stickers de Vinil', 'test', 9, 45.00, 'metros', 5, '2025-08-27 20:46:26'),
(20, 'Rotulación de vehículos', 'test vinil', 90, 2.50, 'piezas', 1, '2025-08-28 15:38:03'),
(21, 'Elementum elit eiusmod leo elit', 'Leo nisi sed nisi sed. Porttitor consectetur elit. Sed vendor tellus porttitor vendor tellus. Sed.', 150, 25.00, 'litros', 6, '2025-08-28 20:55:04'),
(26, 'Impresión Vinil Electrostático Blanco', 'Dolor leo tellus consectetur eiusmod porttitor leo lorem. Nisi. Porttitor. Dolor ipsum. Sit elit semper.', 150, 2.50, 'piezas', 5, '2025-09-02 18:50:01'),
(27, 'Volantes Publicitarios', 'Vendor nisi ipsum sit aenean eiusmod consectetur sit sed. Elit sed consectetur vivamus elit semper.', 25, 197.00, 'metros', 6, '2025-09-02 18:56:13'),
(28, 'Calcomanías', 'Sed tellus sit eiusmod consectetur. Dolor eiusmod sed elementum tellus. Semper leo nisi eiusmod leo.', 40, 120.00, 'metros', 22, '2025-09-02 19:11:35'),
(29, 'Banner Display Y Roll Ups', 'Lorem elementum aenean sed lorem nisi vendor sit porttitor. Eiusmod semper vivamus. Dolor sed elementum.', 138, 200.00, 'metros', 8, '2025-09-02 19:13:00'),
(30, 'Folletos Y Catálogos', '', 21, 367.00, 'cajas', 6, '2025-09-02 19:14:45'),
(31, 'Vinil Electrostático', 'sdasda', 80, 59.00, 'piezas', 8, '2025-09-02 19:24:58'),
(32, 'Dípticos Y Trípticos', 'Vendor dolor sed porttitor nisi. Eiusmod. Vendor sit vendor sit. Elementum porttitor vendor elit porttitor.', 5, 54.00, 'piezas', 21, '2025-09-02 19:26:58'),
(33, 'Impresión En Vinil Adhesivo', 'Ipsum semper vendor ipsum porttitor elementum. Sed eiusmod aenean elit. Aenean elit sed nisi porttitor.', 150, 25.00, 'metros', 8, '2025-09-02 19:32:33'),
(34, 'Semper vivamus lorem semper vivamus.', 'Aenean elementum aenean tellus vendor ipsum tellus consectetur. Aenean lorem aenean nisi. Eiusmod elit sit.', 150, 210.00, 'kg', 2, '2025-09-02 19:36:47'),
(35, 'Sit lorem porttitor aenean leo', 'Consectetur vivamus sit dolor sed leo elementum. Porttitor. Consectetur. Elementum semper dolor elit leo. Porttitor.', 150, 45.00, 'litros', 2, '2025-09-02 19:43:11'),
(36, 'Flyers', 'Tellus sed lorem elit leo semper lorem dolor leo. Nisi tellus lorem dolor semper. Dolor.', 150, 5.00, 'piezas', 6, '2025-09-02 19:45:16'),
(37, 'Calcomanías - act', 'Vivamus leo semper elementum consectetur vendor eiusmod. Sit dolor lorem porttitor semper. Eiusmod porttitor. Elit.', 25, 10.00, 'cajas', 12, '2025-09-02 19:47:26'),
(38, 'Tarjetas de Presentación', 'Elementum vendor nisi tellus vivamus leo dolor lorem. Elit porttitor. Eiusmod sit vendor aenean tellus.', 500, 25.00, 'piezas', 6, '2025-09-02 20:16:46'),
(39, 'Impresión Vinil Transparente act', 'Eiusmod nisi eiusmod consectetur dolor vendor consectetur sed tellus. Eiusmod. Vendor elit lorem nisi sed.', 14, 56.00, 'cajas', 5, '2025-09-02 20:18:20'),
(41, 'Impresión Papel Fotográfico', 'Leo semper aenean dolor sit. Tellus sit. Nisi. Porttitor nisi elementum lorem vendor elit. Dolor.', -45, 15.00, 'piezas', 8, '2025-09-02 20:29:49'),
(43, 'Impresión Vinil Blanco Brillante', 'Porttitor tellus porttitor sed ipsum. Lorem leo aenean. Sed vivamus elementum eiusmod nisi elit. Porttitor.', 15, 21.00, 'piezas', 5, '2025-09-02 20:38:39'),
(44, 'Impresión en Vinil act2', 'Sed aenean ipsum eiusmod elementum. Aenean dolor sit. Vendor leo sed ipsum eiusmod sit. Porttitor.', 45, 150.00, 'metros', 5, '2025-09-02 20:44:02'),
(45, 'Impresión en Lona', 'Aenean sit lorem dolor sit. Ipsum nisi tellus leo sed. Ipsum sit elementum vivamus elit. - actualizacion', 51, 546.00, 'piezas', 2, '2025-09-02 20:45:11'),
(49, 'Impresión En Vinil Adhesivo', '', 150, 150.59, 'cajas', 12, '2025-09-04 18:38:10'),
(50, 'Impresión en Lona', 'aesrdf - ACT', 150, 15.00, 'cajas', 18, '2025-09-05 19:54:00'),
(51, 'Sit tellus lorem', 'Descripción del producto - act', 25, 150.00, 'kg', 16, '2025-09-09 23:01:42');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`id`, `name`) VALUES
(1, 'admin'),
(2, 'user');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tasks`
--

CREATE TABLE `tasks` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('pendiente','en_progreso','completada') NOT NULL DEFAULT 'pendiente',
  `request_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `due_date` date DEFAULT NULL,
  `assigned_to_id` int(11) NOT NULL,
  `assigned_by_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tasks`
--

INSERT INTO `tasks` (`id`, `title`, `description`, `status`, `request_date`, `due_date`, `assigned_to_id`, `assigned_by_id`) VALUES
(2, 'Eiusmod vendor dolor nisi vendor', 'Semper dolor eiusmod semper sed. Dolor. Nisi. Tellus porttitor ipsum elit vendor consectetur ipsum. Sed.', 'en_progreso', '2025-08-28 22:51:11', '2025-09-03', 7, 1),
(3, 'Leo tellus lorem dolor porttitor', 'Porttitor vivamus nisi eiusmod vendor nisi elementum. Tellus lorem consectetur ipsum tellus dolor ipsum. Aenean.', 'en_progreso', '2025-08-28 23:22:06', '2025-09-03', 10, 1),
(4, 'Semper vendor sed ipsum eiusmod', 'Descripcion de la tarea asignada ', 'completada', '2025-08-28 23:26:20', '2025-09-06', 10, 1),
(5, 'Nisi porttitor vendor semper elit', 'Porttitor ipsum eiusmod dolor aenean vendor. Porttitor aenean. Sit porttitor vendor consectetur dolor sed ipsum.', 'en_progreso', '2025-08-28 23:27:23', '2025-09-10', 10, 1),
(8, 'Consectetur nisi lorem ipsum leo', 'Eiusmod elit eiusmod sit semper. Porttitor. Tellus porttitor vendor. Nisi. Sit ipsum elementum consectetur. Sit.', 'pendiente', '2025-08-29 16:10:59', '2025-09-03', 14, 1),
(9, 'Elementum tellus lorem sit sed.', 'Aenean vendor elit sit elit ipsum tellus sed elit. Tellus leo semper tellus aenean porttitor.', 'en_progreso', '2025-08-29 16:30:00', '2025-09-10', 7, 1),
(10, 'Elementum nisi ipsum vivamus consectetur', 'Semper elementum nisi dolor elementum ipsum elit. Leo eiusmod leo. Sed leo. Ipsum sit. Eiusmod.', 'en_progreso', '2025-08-29 17:09:49', '2025-09-15', 26, 1),
(11, 'otra mas para eliminar', 'Nisi leo elementum sed porttitor tellus semper. Consectetur leo aenean elit vendor. Tellus nisi sit. xx', 'completada', '2025-08-29 18:18:41', '2025-09-10', 10, 1),
(12, 'tarea otro usuario', 'Lorem eiusmod elementum vivamus elementum sit ipsum tellus ipsum. Vivamus nisi aenean lorem dolor lorem. xxx', 'pendiente', '2025-08-29 19:36:52', '2025-09-04', 10, 14),
(13, 'Vivamus consectetur elit lorem elit', 'Vivamus tellus vivamus lorem eiusmod vendor semper. Sit. Sed sit. Eiusmod nisi consectetur aenean porttitor.', 'completada', '2025-08-29 19:37:46', '2025-09-19', 10, 14),
(14, 'Vendor tellus elementum consectetur sit', 'Consectetur elementum ipsum eiusmod sit elementum sed. Consectetur. Tellus vendor consectetur lorem elementum ipsum leo. xx', 'completada', '2025-08-29 19:43:43', '2025-09-18', 7, 14),
(15, 'Vivamus nisi consectetur elit leo - actu', 'Sit eiusmod lorem semper elementum eiusmod lorem. Eiusmod elit leo. Tellus nisi dolor ipsum porttitor.', 'completada', '2025-08-29 19:44:15', '2025-09-03', 26, 14),
(16, 'Vivamus nisi consectetur elit leo 2', 'Sit eiusmod lorem semper elementum eiusmod lorem. Eiusmod elit leo. Tellus nisi dolor ipsum porttitor.', 'pendiente', '2025-08-29 19:44:39', '2025-09-03', 7, 14),
(17, 'Leo elit vivamus porttitor sed', 'Lorem sit vivamus lorem eiusmod sed elementum consectetur nisi. Lorem eiusmod consectetur. Sed elementum consectetur.', 'completada', '2025-08-29 19:45:27', '2025-07-29', 7, 14),
(18, 'Nisi dolor lorem ipsum elementum', 'Consectetur ipsum vendor ipsum elementum aenean sit vendor vivamus. Semper leo ipsum eiusmod consectetur sed.', 'pendiente', '2025-09-01 21:09:00', '2025-09-25', 7, 1),
(20, 'Vivamus nisi elit consectetur nisi', 'Semper leo consectetur tellus eiusmod tellus sit consectetur. Vivamus leo nisi leo lorem dolor sed.', 'completada', '2025-09-01 21:10:07', '2025-10-11', 7, 1),
(21, 'Sed consectetur eiusmod dolor sed', 'Vendor dolor ipsum elementum tellus vivamus. Eiusmod tellus sed aenean. Tellus ipsum tellus dolor sed semper. Vendor tellus. Elit semper elit vendor nisi sit. Ipsum lorem dolor lorem leo tellus. Aenean dolor aenean lorem semper. Vendor. Elit lorem nisi tellus lorem eiusmod. Sed eiusmod sit. Semper vendor consectetur. Nisi elementum tellus sed consectetur vendor dolor vendor. Elementum porttitor vendor elementum. Ipsum vivamus lorem. Elementum ipsum. Elementum. Leo elementum lorem vivamus sit elementum. Nisi tellus elementum. Sit leo sed consectetur elit sed. Ipsum dolor semper. Lorem tellus nisi lorem vivamus sed. Elit. Eiusmod leo vendor semper. Lorem vendor consectetur vivamus dolor.', 'completada', '2025-09-01 21:10:30', '2025-10-30', 7, 1),
(23, 'Semper consectetur sit nisi vivamus.', 'Porttitor nisi porttitor leo vendor. Vivamus dolor porttitor sed aenean. Tellus aenean lorem ipsum nisi.', 'pendiente', '2025-09-05 21:41:24', '2025-09-15', 10, 1),
(24, 'Aenean elit elementum aenean eiusmod', 'Elementum consectetur nisi vivamus semper vendor aenean. Semper tellus eiusmod. Aenean elementum ipsum sit consectetur.', 'pendiente', '2025-09-05 22:04:19', '2025-09-10', 26, 14),
(25, 'Semper leo aenean nisi vivamus - actualizado', 'Vivamus leo lorem sed tellus dolor semper. Lorem tellus elit vivamus eiusmod. Vivamus ipsum aenean.', 'pendiente', '2025-09-08 15:34:51', '2025-09-30', 26, 1),
(26, 'Semper consectetur dolor semper vendor', 'Consectetur ipsum semper sit semper elementum vivamus vendor. Consectetur sit. Nisi porttitor aenean lorem sed.', 'completada', '2025-09-08 21:55:39', '2025-09-15', 26, 1),
(27, 'Consectetur elementum porttitor nisi leo', 'Porttitor tellus dolor porttitor consectetur leo vendor ipsum. Leo aenean dolor sit aenean semper. Eiusmod.', 'pendiente', '2025-09-09 15:38:56', '2025-09-12', 26, 1),
(28, 'Ipsum consectetur aenean dolor elit', 'Semper ipsum elementum tellus leo porttitor. Sed ipsum sed dolor vivamus tellus. Sit leo. Porttitor.', 'pendiente', '2025-09-11 21:03:47', '2025-09-19', 10, 1),
(29, 'Consectetur semper lorem vendor dolor', 'Aenean dolor nisi consectetur dolor. Elementum porttitor aenean vivamus porttitor. Elit aenean sed porttitor. Consectetur.', 'completada', '2025-09-11 21:04:33', '2025-09-23', 26, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `role_id`, `created_at`) VALUES
(1, 'cuauhizo', 'cuauhizo@gmail.com', '$2b$10$oDABTgrc3ZQ2eEhXFhFlDeQvN7IFWQRtHdj.2bZbkWhDtdU8z3gmm', 1, '2025-08-26 16:22:51'),
(7, 'username', 'correo@correo.com', '$2b$10$WvrjhSJ1LEnoJaI2AgrVkuipVR4.qpRSLp2NQ5s5lCN/eSCH4Xnxe', 2, '2025-08-26 20:23:59'),
(10, 'Regina', 'regina@gmail.com', '$2b$10$igapwbA8PZ/Jo0XH6anWzeryfnli6acKlybXP.aY4Ndsqq.2A285q', 2, '2025-08-27 00:13:39'),
(14, 'bruce', 'bsalgado@tolkogroup.com', '$2b$10$oDABTgrc3ZQ2eEhXFhFlDeQvN7IFWQRtHdj.2bZbkWhDtdU8z3gmm', 1, '2025-08-28 16:53:13'),
(15, 'William Brown', 'jjohnson@gmail.com', '$2b$10$eXwCZPs0i1bMq2Hf5ycmUuWUorHLRI2uCOW8tdEcoU4qngUOVt/rS', 2, '2025-08-28 20:59:21'),
(18, 'William Johnson', 'mbrown@gmail.com', '$2b$10$cQxApFezcUm45EVSsO.KS.sQCzyT/JRT197IZ5dsPGzsDgyIOv3uS', 2, '2025-09-02 18:52:31'),
(19, 'Michael Davis', 'lbrown@gmail.com', '$2b$10$vzeKLI0UhuB6ztlWi.trpO.Lz0fBh5hj1ZQ.rRxhhCrGJEI7GGsk.', 2, '2025-09-03 22:13:52'),
(22, 'Emily Williams', 'ljohnson@gmail.com', '$2b$10$cwkm73zNp1Kh.bonX60UJuniVSlQfVHvQjD3MXImctXNBWr9CksKm', 2, '2025-09-05 17:00:36'),
(23, 'Linda Davis', 'mwilliams@gmail.com', '$2b$10$KIrtURN6NT0ZnXzzlUJY4urxr1i3KyXeL0slBusvDsTzTchNG5unq', 2, '2025-09-05 17:01:06'),
(25, 'Linda Smith', 'wsmith@gmail.com', '$2b$10$e.Gnt3We/B.9UBuvdWppLOQIvc2Ch3kvewIFr2W3Jm9VsLw4mPih6', 2, '2025-09-05 17:01:57'),
(26, 'Fabian', 'frodriguez@tolkogroup.com', '$2b$10$rOcF/P6OxDROPIq.wW/9QO1pNe0HPUK0iTUMj2GsMrEdetleohflC', 2, '2025-09-05 22:03:43');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `work_orders`
--

CREATE TABLE `work_orders` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `client_name` varchar(255) DEFAULT NULL,
  `status` enum('pendiente','en_progreso','por_aprobar','completada','cancelada') DEFAULT 'pendiente',
  `created_by_id` int(11) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `work_orders`
--

INSERT INTO `work_orders` (`id`, `title`, `description`, `client_name`, `status`, `created_by_id`, `start_date`, `end_date`, `created_at`, `updated_at`) VALUES
(2, 'Orden de trabajo XX', 'Porttitor leo sed eiusmod tellus. Vivamus. Lorem. Elementum porttitor aenean lorem elementum. Consectetur lorem eiusmod.', 'Bimbo', 'completada', 1, '2025-09-10', '2025-09-17', '2025-09-01 18:25:52', '2025-09-01 20:10:25'),
(3, 'Nueva orden', 'Descripción de la orden', 'Nike', 'en_progreso', 1, '2025-09-10', '2025-09-25', '2025-09-01 18:40:06', '2025-09-08 16:53:58'),
(4, 'Sit dolor semper elementum vendor', 'Solicito unos banners', 'Enfragen', 'completada', 1, '2025-09-18', '2025-09-30', '2025-09-01 19:05:49', '2025-09-05 18:50:45'),
(7, 'Nisi leo sit consectetur eiusmod', 'Vivamus nisi sit elit aenean ipsum dolor. Tellus nisi tellus. Eiusmod nisi elementum tellus porttitor.', 'Emily Johnson', 'en_progreso', 1, '2025-09-04', '2025-09-17', '2025-09-01 19:52:40', '2025-09-05 19:43:32'),
(8, 'Orden desde bruce', 'Vendor dolor ipsum elementum tellus vivamus. Eiusmod tellus sed aenean. Tellus ipsum tellus dolor sed semper. Vendor tellus. Elit semper elit vendor nisi sit. Ipsum lorem dolor lorem leo tellus. Aenean dolor aenean lorem semper. Vendor. Elit lorem nisi tellus lorem eiusmod. Sed eiusmod sit. Semper vendor consectetur. Nisi elementum tellus sed consectetur vendor dolor vendor.', 'tolko', 'cancelada', 14, '2025-09-25', '2025-10-10', '2025-09-01 22:26:44', '2025-09-05 19:35:58'),
(9, 'Correo LDP 214', 'Hacer el templete de LDP 213', 'Nike', 'pendiente', 1, '2025-09-09', '2025-09-12', '2025-09-03 23:36:31', '2025-09-05 19:16:14'),
(11, 'Elit porttitor sit ipsum tellus', 'Descripcion de la tarea a realizar ', 'Nike', 'completada', 1, '2025-09-17', '2025-10-03', '2025-09-04 18:23:36', '2025-09-05 20:25:50'),
(12, 'Semper elementum consectetur porttitor ipsum.', 'Lorem nisi porttitor semper sit. Leo vivamus porttitor ipsum elementum. Sed consectetur eiusmod tellus. Dolor.', 'Nike', 'pendiente', 1, '2025-09-08', '2025-09-12', '2025-09-05 20:03:16', '2025-09-05 20:03:16'),
(13, 'Elit consectetur elementum tellus consectetur', 'Elementum vivamus nisi lorem aenean eiusmod lorem elit nisi. Consectetur lorem sit. Semper porttitor nisi. Nuevas instrucciones test nuevas instrucciones', 'Enfragen', 'cancelada', 1, '2025-09-08', '2025-09-18', '2025-09-05 21:42:38', '2025-09-09 21:11:13'),
(14, 'Ipsum nisi vivamus dolor semper', 'Eiusmod vendor vivamus leo ipsum sit vivamus semper. Elit porttitor vivamus porttitor elit sit. Porttitor.', 'Nike', 'por_aprobar', 1, '2025-09-15', '2025-09-30', '2025-09-08 15:36:59', '2025-09-09 18:57:03'),
(15, 'Emily Brown', 'Eiusmod vivamus elit porttitor eiusmod lorem nisi aenean. Eiusmod sit vendor tellus vivamus nisi elit.', 'Bimbo', 'completada', 1, '2025-09-10', '2025-09-15', '2025-09-08 16:53:19', '2025-09-10 00:17:43'),
(16, 'Orden test productos', 'Elementum vendor ipsum leo elementum sed. Vendor consectetur ipsum eiusmod nisi semper. Consectetur ipsum vivamus.', 'Tolko', 'completada', 1, '2025-09-15', '2025-09-13', '2025-09-08 17:50:56', '2025-09-09 21:11:04'),
(17, 'Dolor porttitor consectetur tellus vendor', 'Elit elementum sit lorem eiusmod porttitor lorem semper. Aenean sed elit elementum tellus porttitor. Elementum. test', 'Bimbo', 'en_progreso', 1, '2025-09-10', '2025-09-15', '2025-09-09 15:40:52', '2025-09-09 20:55:51'),
(18, 'Aenean leo semper sit vendor', 'Vivamus semper tellus consectetur ipsum. Eiusmod aenean. Tellus porttitor vendor tellus leo porttitor leo. Semper.', 'Bimbo', 'pendiente', 1, '2025-09-15', '2025-09-19', '2025-09-11 00:21:09', '2025-09-11 00:21:09'),
(19, 'sadasdas', 'sfdfbgncfdfsdaxzcv ', 'Nike', 'pendiente', 1, '2025-09-30', '2025-09-20', '2025-09-11 00:34:18', '2025-09-11 00:34:18'),
(20, 'sfded', 'asddasa', 'sfdsddsa', 'pendiente', 1, '2025-09-10', '2025-09-19', '2025-09-11 00:40:31', '2025-09-11 00:40:31'),
(21, 'Orden multiple', 'Vivamus consectetur sit dolor sit semper sit. Vivamus ipsum. Lorem ipsum elit lorem nisi vivamus.', 'Bimbo', 'en_progreso', 1, '2025-09-15', '2025-09-19', '2025-09-11 16:40:48', '2025-09-11 18:23:29'),
(22, 'Tellus aenean porttitor dolor aenean', 'Tellus consectetur ipsum dolor porttitor. Vendor tellus aenean ipsum. Semper nisi lorem semper nisi elit.', 'Enfragen', 'por_aprobar', 1, '2025-09-11', '2025-09-19', '2025-09-11 19:21:29', '2025-09-11 21:00:55'),
(23, 'Sed elementum tellus vendor vivamus', 'Consectetur elit eiusmod ipsum eiusmod. Consectetur. Semper. Vivamus. Ipsum elementum ipsum tellus vivamus elit tellus.', 'Bimbo', 'pendiente', 1, '2025-09-22', '2025-09-26', '2025-09-11 19:24:51', '2025-09-11 19:24:51');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `work_order_assignees`
--

CREATE TABLE `work_order_assignees` (
  `work_order_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `work_order_assignees`
--

INSERT INTO `work_order_assignees` (`work_order_id`, `user_id`) VALUES
(2, 26),
(3, 10),
(4, 26),
(7, 14),
(7, 23),
(8, 10),
(9, 18),
(11, 1),
(12, 26),
(13, 22),
(13, 26),
(14, 26),
(15, 10),
(16, 18),
(17, 10),
(18, 10),
(18, 18),
(18, 23),
(18, 26),
(19, 7),
(20, 1),
(21, 7),
(21, 14),
(21, 26),
(22, 10),
(22, 23),
(23, 1),
(23, 10),
(23, 26);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `work_order_products`
--

CREATE TABLE `work_order_products` (
  `id` int(11) NOT NULL,
  `work_order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity_used` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `work_order_products`
--

INSERT INTO `work_order_products` (`id`, `work_order_id`, `product_id`, `quantity_used`) VALUES
(131, 19, 30, 7),
(132, 19, 32, 6),
(133, 19, 39, 5),
(146, 21, 8, 5),
(147, 21, 30, 15),
(148, 2, 7, 1),
(149, 2, 11, 1),
(150, 2, 20, 3),
(151, 12, 29, 5),
(152, 12, 30, 2),
(153, 12, 31, 1),
(154, 18, 13, 6),
(155, 18, 34, 4),
(156, 18, 36, 5),
(157, 18, 37, 25),
(158, 14, 14, 10),
(159, 14, 32, 150),
(160, 17, 20, 5),
(161, 17, 41, 15),
(162, 8, 15, 1),
(163, 8, 17, 3),
(164, 8, 18, 9),
(165, 20, 31, 80),
(166, 20, 49, 10),
(167, 7, 7, 3),
(168, 7, 13, 2),
(169, 7, 15, 1),
(170, 16, 7, 3),
(171, 16, 12, 10),
(172, 4, 8, 1),
(173, 4, 17, 1),
(174, 4, 18, 1),
(175, 4, 31, 4),
(176, 15, 28, 110),
(177, 15, 41, 50),
(178, 3, 6, 3),
(179, 3, 8, 1),
(180, 3, 20, 1),
(181, 13, 29, 1),
(182, 13, 30, 2),
(183, 13, 31, 4),
(184, 11, 7, 4),
(185, 11, 29, 3),
(186, 22, 33, 10),
(187, 22, 8, 50),
(188, 23, 38, 100),
(189, 23, 50, 0);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indices de la tabla `inventory_movements`
--
ALTER TABLE `inventory_movements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `work_order_id` (`work_order_id`);

--
-- Indices de la tabla `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indices de la tabla `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_category` (`category_id`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indices de la tabla `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_assigned_to` (`assigned_to_id`),
  ADD KEY `fk_assigned_by` (`assigned_by_id`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `role_id` (`role_id`);

--
-- Indices de la tabla `work_orders`
--
ALTER TABLE `work_orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by_id` (`created_by_id`);

--
-- Indices de la tabla `work_order_assignees`
--
ALTER TABLE `work_order_assignees`
  ADD PRIMARY KEY (`work_order_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indices de la tabla `work_order_products`
--
ALTER TABLE `work_order_products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `work_order_id` (`work_order_id`,`product_id`),
  ADD KEY `product_id` (`product_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT de la tabla `inventory_movements`
--
ALTER TABLE `inventory_movements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT de la tabla `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=83;

--
-- AUTO_INCREMENT de la tabla `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `tasks`
--
ALTER TABLE `tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT de la tabla `work_orders`
--
ALTER TABLE `work_orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT de la tabla `work_order_products`
--
ALTER TABLE `work_order_products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=190;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `inventory_movements`
--
ALTER TABLE `inventory_movements`
  ADD CONSTRAINT `inventory_movements_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `inventory_movements_ibfk_2` FOREIGN KEY (`work_order_id`) REFERENCES `work_orders` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `fk_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `fk_assigned_by` FOREIGN KEY (`assigned_by_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_assigned_to` FOREIGN KEY (`assigned_to_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`);

--
-- Filtros para la tabla `work_orders`
--
ALTER TABLE `work_orders`
  ADD CONSTRAINT `work_orders_ibfk_2` FOREIGN KEY (`created_by_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `work_order_assignees`
--
ALTER TABLE `work_order_assignees`
  ADD CONSTRAINT `work_order_assignees_ibfk_1` FOREIGN KEY (`work_order_id`) REFERENCES `work_orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `work_order_assignees_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `work_order_products`
--
ALTER TABLE `work_order_products`
  ADD CONSTRAINT `work_order_products_ibfk_1` FOREIGN KEY (`work_order_id`) REFERENCES `work_orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `work_order_products_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
