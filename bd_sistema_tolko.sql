-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 05-09-2025 a las 21:49:35
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
(2, 'Impresión Gran Formato', '2025-08-27 17:11:43'),
(5, 'Viniles', '2025-08-27 17:13:46'),
(6, 'Impresión en Offset', '2025-08-27 17:23:42'),
(8, 'Impresión Digital', '2025-08-28 17:27:00'),
(12, 'Señaliticas', '2025-08-28 21:04:43'),
(13, 'Telas', '2025-09-03 19:05:55'),
(16, 'Papel', '2025-09-03 20:12:00'),
(18, 'Presswall', '2025-09-05 16:10:04'),
(19, 'Tarjetas de Presentación', '2025-09-05 16:16:06'),
(21, 'Dípticos Y Trípticos', '2025-09-05 16:16:43'),
(22, 'Folletos Y Catálogos', '2025-09-05 16:16:53'),
(23, 'Volantes Publicitarios', '2025-09-05 16:17:00');

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
(33, 20, 3, -1, 'Salida por Orden de Trabajo #3', '2025-09-05 19:44:01');

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
(7, 'Impresión Tela Banner', 'Descripción opcional', 10, 19.99, 'piezas', 2, '2025-08-26 18:42:11'),
(8, 'Impresión Vinil Microperforado', '', 145, 19.99, 'litros', 5, '2025-08-26 21:06:44'),
(11, 'Impresión Lona Mate', 'test', 149, 5.00, 'piezas', 2, '2025-08-27 17:59:23'),
(12, 'Impresión Vinil Microperforado', 'test', 150, 200.00, 'cajas', 2, '2025-08-27 18:07:57'),
(13, 'Impresión Vinil Blanco Mate', 'test', 1, 5.00, 'litros', 2, '2025-08-27 18:08:43'),
(14, 'IImpresión Tela Canvas Mate', 'test', 40, 50.00, 'kg', 2, '2025-08-27 18:15:55'),
(15, 'Impresión Lona Mate', '', 8, 410.00, 'piezas', 2, '2025-08-27 18:22:22'),
(16, 'Flag Football', 'test', 10, 150.00, 'kg', 2, '2025-08-27 20:44:39'),
(17, 'Volantes Publicitarios', 'test', 4, 150.00, 'kg', 6, '2025-08-27 20:44:55'),
(18, 'Stickers de Vinil', 'test', 2, 45.00, 'metros', 5, '2025-08-27 20:46:26'),
(20, 'Rotulación de vehículos', 'test vinil', 95, 2.50, 'piezas', 1, '2025-08-28 15:38:03'),
(21, 'Elementum elit eiusmod leo elit', 'Leo nisi sed nisi sed. Porttitor consectetur elit. Sed vendor tellus porttitor vendor tellus. Sed.', 150, 25.00, 'litros', 6, '2025-08-28 20:55:04'),
(26, 'Impresión Vinil Electrostático Blanco', 'Dolor leo tellus consectetur eiusmod porttitor leo lorem. Nisi. Porttitor. Dolor ipsum. Sit elit semper.', 150, 2.50, 'piezas', 5, '2025-09-02 18:50:01'),
(27, 'Volantes Publicitarios', 'Vendor nisi ipsum sit aenean eiusmod consectetur sit sed. Elit sed consectetur vivamus elit semper.', 25, 197.00, 'metros', 6, '2025-09-02 18:56:13'),
(28, 'Calcomanías', 'Sed tellus sit eiusmod consectetur. Dolor eiusmod sed elementum tellus. Semper leo nisi eiusmod leo.', 150, 120.00, 'metros', 22, '2025-09-02 19:11:35'),
(29, 'Banner Display Y Roll Ups', 'Lorem elementum aenean sed lorem nisi vendor sit porttitor. Eiusmod semper vivamus. Dolor sed elementum.', 141, 200.00, 'metros', 8, '2025-09-02 19:13:00'),
(30, 'Folletos Y Catálogos', '', 21, 367.00, 'cajas', 6, '2025-09-02 19:14:45'),
(31, 'Vinil Electrostático', 'sdasda', 80, 59.00, 'piezas', 8, '2025-09-02 19:24:58'),
(32, 'Dípticos Y Trípticos', 'Vendor dolor sed porttitor nisi. Eiusmod. Vendor sit vendor sit. Elementum porttitor vendor elit porttitor.', 5, 54.00, 'piezas', 21, '2025-09-02 19:26:58'),
(33, 'Impresión En Vinil Adhesivo', 'Ipsum semper vendor ipsum porttitor elementum. Sed eiusmod aenean elit. Aenean elit sed nisi porttitor.', 150, 25.00, 'metros', 8, '2025-09-02 19:32:33'),
(34, 'Semper vivamus lorem semper vivamus.', 'Aenean elementum aenean tellus vendor ipsum tellus consectetur. Aenean lorem aenean nisi. Eiusmod elit sit.', 150, 210.00, 'kg', 2, '2025-09-02 19:36:47'),
(35, 'Sit lorem porttitor aenean leo', 'Consectetur vivamus sit dolor sed leo elementum. Porttitor. Consectetur. Elementum semper dolor elit leo. Porttitor.', 150, 45.00, 'litros', 2, '2025-09-02 19:43:11'),
(36, 'Flyers', 'Tellus sed lorem elit leo semper lorem dolor leo. Nisi tellus lorem dolor semper. Dolor.', 120, 5.00, 'piezas', 6, '2025-09-02 19:45:16'),
(37, 'Calcomanías', 'Vivamus leo semper elementum consectetur vendor eiusmod. Sit dolor lorem porttitor semper. Eiusmod porttitor. Elit.', 25, 10.00, 'cajas', 12, '2025-09-02 19:47:26'),
(38, 'Tarjetas de Presentación', 'Elementum vendor nisi tellus vivamus leo dolor lorem. Elit porttitor. Eiusmod sit vendor aenean tellus.', 500, 25.00, 'piezas', 6, '2025-09-02 20:16:46'),
(39, 'Impresión Vinil Transparente', 'Eiusmod nisi eiusmod consectetur dolor vendor consectetur sed tellus. Eiusmod. Vendor elit lorem nisi sed.', 14, 56.00, 'cajas', 5, '2025-09-02 20:18:20'),
(41, 'Impresión Papel Fotográfico', 'Leo semper aenean dolor sit. Tellus sit. Nisi. Porttitor nisi elementum lorem vendor elit. Dolor.', 20, 15.00, 'piezas', 8, '2025-09-02 20:29:49'),
(43, 'Impresión Vinil Blanco Brillante', 'Porttitor tellus porttitor sed ipsum. Lorem leo aenean. Sed vivamus elementum eiusmod nisi elit. Porttitor.', 15, 21.00, 'piezas', 5, '2025-09-02 20:38:39'),
(44, 'Impresión en Vinil', 'Sed aenean ipsum eiusmod elementum. Aenean dolor sit. Vendor leo sed ipsum eiusmod sit. Porttitor.', 45, 150.00, 'metros', 5, '2025-09-02 20:44:02'),
(45, 'Impresión en Lona', 'Aenean sit lorem dolor sit. Ipsum nisi tellus leo sed. Ipsum sit elementum vivamus elit.', 51, 546.00, 'piezas', 2, '2025-09-02 20:45:11'),
(49, 'Impresión En Vinil Adhesivo', '', 150, 150.59, 'cajas', 12, '2025-09-04 18:38:10');

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
(4, 'Semper vendor sed ipsum eiusmod', 'Descripcion de la tarea asignada ', 'en_progreso', '2025-08-28 23:26:20', '2025-09-06', 10, 1),
(5, 'Nisi porttitor vendor semper elit', 'Porttitor ipsum eiusmod dolor aenean vendor. Porttitor aenean. Sit porttitor vendor consectetur dolor sed ipsum.', 'pendiente', '2025-08-28 23:27:23', '2025-09-10', 10, 1),
(8, 'Consectetur nisi lorem ipsum leo', 'Eiusmod elit eiusmod sit semper. Porttitor. Tellus porttitor vendor. Nisi. Sit ipsum elementum consectetur. Sit.', 'pendiente', '2025-08-29 16:10:59', '2025-09-03', 14, 1),
(9, 'Elementum tellus lorem sit sed.', 'Aenean vendor elit sit elit ipsum tellus sed elit. Tellus leo semper tellus aenean porttitor.', 'en_progreso', '2025-08-29 16:30:00', '2025-09-10', 7, 1),
(10, 'Elementum nisi ipsum vivamus consectetur', 'Semper elementum nisi dolor elementum ipsum elit. Leo eiusmod leo. Sed leo. Ipsum sit. Eiusmod.', 'en_progreso', '2025-08-29 17:09:49', '2025-09-15', 10, 1),
(11, 'otra mas para eliminar', 'Nisi leo elementum sed porttitor tellus semper. Consectetur leo aenean elit vendor. Tellus nisi sit.', 'completada', '2025-08-29 18:18:41', '2025-09-10', 10, 1),
(12, 'tarea otro usuario', 'Lorem eiusmod elementum vivamus elementum sit ipsum tellus ipsum. Vivamus nisi aenean lorem dolor lorem.', 'pendiente', '2025-08-29 19:36:52', '2025-09-04', 10, 14),
(13, 'Vivamus consectetur elit lorem elit', 'Vivamus tellus vivamus lorem eiusmod vendor semper. Sit. Sed sit. Eiusmod nisi consectetur aenean porttitor.', 'completada', '2025-08-29 19:37:46', '2025-09-19', 10, 14),
(14, 'Vendor tellus elementum consectetur sit', 'Consectetur elementum ipsum eiusmod sit elementum sed. Consectetur. Tellus vendor consectetur lorem elementum ipsum leo.', 'completada', '2025-08-29 19:43:43', '2025-09-18', 7, 14),
(15, 'Vivamus nisi consectetur elit leo', 'Sit eiusmod lorem semper elementum eiusmod lorem. Eiusmod elit leo. Tellus nisi dolor ipsum porttitor.', 'completada', '2025-08-29 19:44:15', '2025-09-03', 7, 14),
(16, 'Vivamus nisi consectetur elit leo 2', 'Sit eiusmod lorem semper elementum eiusmod lorem. Eiusmod elit leo. Tellus nisi dolor ipsum porttitor.', 'pendiente', '2025-08-29 19:44:39', '2025-09-03', 7, 14),
(17, 'Leo elit vivamus porttitor sed', 'Lorem sit vivamus lorem eiusmod sed elementum consectetur nisi. Lorem eiusmod consectetur. Sed elementum consectetur.', 'completada', '2025-08-29 19:45:27', '2025-07-29', 7, 14),
(18, 'Nisi dolor lorem ipsum elementum', 'Consectetur ipsum vendor ipsum elementum aenean sit vendor vivamus. Semper leo ipsum eiusmod consectetur sed.', 'pendiente', '2025-09-01 21:09:00', '2025-09-25', 7, 1),
(20, 'Vivamus nisi elit consectetur nisi', 'Semper leo consectetur tellus eiusmod tellus sit consectetur. Vivamus leo nisi leo lorem dolor sed.', 'pendiente', '2025-09-01 21:10:07', '2025-10-11', 7, 1),
(21, 'Sed consectetur eiusmod dolor sed', 'Vendor dolor ipsum elementum tellus vivamus. Eiusmod tellus sed aenean. Tellus ipsum tellus dolor sed semper. Vendor tellus. Elit semper elit vendor nisi sit. Ipsum lorem dolor lorem leo tellus. Aenean dolor aenean lorem semper. Vendor. Elit lorem nisi tellus lorem eiusmod. Sed eiusmod sit. Semper vendor consectetur. Nisi elementum tellus sed consectetur vendor dolor vendor. Elementum porttitor vendor elementum. Ipsum vivamus lorem. Elementum ipsum. Elementum. Leo elementum lorem vivamus sit elementum. Nisi tellus elementum. Sit leo sed consectetur elit sed. Ipsum dolor semper. Lorem tellus nisi lorem vivamus sed. Elit. Eiusmod leo vendor semper. Lorem vendor consectetur vivamus dolor.', 'completada', '2025-09-01 21:10:30', '2025-10-30', 7, 1);

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
(25, 'Linda Smith', 'wsmith@gmail.com', '$2b$10$e.Gnt3We/B.9UBuvdWppLOQIvc2Ch3kvewIFr2W3Jm9VsLw4mPih6', 2, '2025-09-05 17:01:57');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `work_orders`
--

CREATE TABLE `work_orders` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `client_name` varchar(255) DEFAULT NULL,
  `status` enum('pendiente','en_progreso','completada','cancelada') DEFAULT 'pendiente',
  `assigned_to_id` int(11) DEFAULT NULL,
  `created_by_id` int(11) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `work_orders`
--

INSERT INTO `work_orders` (`id`, `title`, `description`, `client_name`, `status`, `assigned_to_id`, `created_by_id`, `start_date`, `end_date`, `created_at`, `updated_at`) VALUES
(2, 'Orden de trabajo XX', 'Porttitor leo sed eiusmod tellus. Vivamus. Lorem. Elementum porttitor aenean lorem elementum. Consectetur lorem eiusmod.', 'Bimbo', 'completada', NULL, 1, '2025-09-10', '2025-09-17', '2025-09-01 18:25:52', '2025-09-01 20:10:25'),
(3, 'Nueva orden', 'Descripción de la orden', 'Nike', 'completada', 7, 1, '2025-09-10', '2025-09-25', '2025-09-01 18:40:06', '2025-09-05 19:44:01'),
(4, 'Sit dolor semper elementum vendor', 'Solicito unos banners', 'Enfragen', 'completada', 10, 1, '2025-09-18', '2025-09-30', '2025-09-01 19:05:49', '2025-09-05 18:50:45'),
(7, 'Nisi leo sit consectetur eiusmod', 'Vivamus nisi sit elit aenean ipsum dolor. Tellus nisi tellus. Eiusmod nisi elementum tellus porttitor.', 'Emily Johnson', 'en_progreso', 7, 1, '2025-09-04', '2025-09-17', '2025-09-01 19:52:40', '2025-09-05 19:43:32'),
(8, 'Orden desde bruce', 'Vendor dolor ipsum elementum tellus vivamus. Eiusmod tellus sed aenean. Tellus ipsum tellus dolor sed semper. Vendor tellus. Elit semper elit vendor nisi sit. Ipsum lorem dolor lorem leo tellus. Aenean dolor aenean lorem semper. Vendor. Elit lorem nisi tellus lorem eiusmod. Sed eiusmod sit. Semper vendor consectetur. Nisi elementum tellus sed consectetur vendor dolor vendor.', 'tolko', 'cancelada', 7, 14, '2025-09-25', '2025-10-10', '2025-09-01 22:26:44', '2025-09-05 19:35:58'),
(9, 'Correo LDP 214', 'Hacer el templete de LDP 213', 'Nike', 'pendiente', 1, 1, '2025-09-09', '2025-09-12', '2025-09-03 23:36:31', '2025-09-05 19:16:14'),
(11, 'Elit porttitor sit ipsum tellus', 'Descripcion de la tarea a realizar ', 'Nike', 'en_progreso', 7, 1, '2025-09-17', '2025-10-03', '2025-09-04 18:23:36', '2025-09-05 19:43:40');

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
(32, 7, 7, 3),
(33, 7, 13, 2),
(34, 7, 15, 1),
(35, 2, 7, 1),
(36, 2, 11, 1),
(37, 2, 20, 3),
(68, 3, 6, 3),
(69, 3, 8, 1),
(70, 3, 20, 1),
(74, 11, 7, 4),
(75, 11, 29, 3),
(76, 4, 8, 1),
(77, 4, 17, 1),
(78, 4, 18, 1),
(79, 4, 31, 4),
(80, 8, 15, 1),
(81, 8, 17, 3),
(82, 8, 18, 9);

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
  ADD KEY `assigned_to_id` (`assigned_to_id`),
  ADD KEY `created_by_id` (`created_by_id`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT de la tabla `inventory_movements`
--
ALTER TABLE `inventory_movements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT de la tabla `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `tasks`
--
ALTER TABLE `tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT de la tabla `work_orders`
--
ALTER TABLE `work_orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `work_order_products`
--
ALTER TABLE `work_order_products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=83;

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
  ADD CONSTRAINT `work_orders_ibfk_1` FOREIGN KEY (`assigned_to_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `work_orders_ibfk_2` FOREIGN KEY (`created_by_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

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
