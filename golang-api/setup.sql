-- TYPES
CREATE TYPE public.status_order AS ENUM ('waiting_payment','payment_verification','paid','production','completed','cancelled','printing','ready');
CREATE TYPE public.status_payment AS ENUM ('pending','approved','rejected');
CREATE TYPE public.status_review AS ENUM ('approved','revision_requested');
CREATE TYPE public.type_activity AS ENUM ('login','logout');
CREATE TYPE public.type_change AS ENUM ('in','out');

-- TABLES
CREATE TABLE public.roles (id SERIAL PRIMARY KEY, name VARCHAR(50) NOT NULL UNIQUE);
CREATE TABLE public.categories (id SERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL, created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE public.materials (id SERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL, stock NUMERIC(12,2) DEFAULT 0.00, unit VARCHAR(20), created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE public.payment_methods (id SERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL);
CREATE TABLE public.users (id SERIAL PRIMARY KEY, role_id INTEGER NOT NULL REFERENCES public.roles(id), name VARCHAR(100) NOT NULL, email VARCHAR(100) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL, phone VARCHAR(20), is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMPTZ, deleted_at TIMESTAMPTZ);
CREATE TABLE public.login_logs (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES public.users(id), activity_type public.type_activity NOT NULL, ip_address VARCHAR(50), user_agent TEXT, created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE public.login_attempts (id SERIAL PRIMARY KEY, email VARCHAR(100), ip_address VARCHAR(50), success BOOLEAN, created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE public.audit_logs (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES public.users(id), role VARCHAR(50), action VARCHAR(255), entity_type VARCHAR(50), entity_id INTEGER, ip_address VARCHAR(50), user_agent TEXT, created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE public.products (id SERIAL PRIMARY KEY, category_id INTEGER REFERENCES public.categories(id), name VARCHAR(150) NOT NULL, description TEXT, base_price NUMERIC(12,2) NOT NULL, estimated_days INTEGER DEFAULT 1, is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMPTZ, deleted_at TIMESTAMPTZ);
CREATE TABLE public.product_variants (id SERIAL PRIMARY KEY, product_id INTEGER NOT NULL REFERENCES public.products(id) ON DELETE CASCADE, sku VARCHAR(100) UNIQUE, variant_name VARCHAR(255) NOT NULL, price NUMERIC(12,2) NOT NULL DEFAULT 0, stock INTEGER DEFAULT -1, is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP, material_id INTEGER REFERENCES public.materials(id), material_usage NUMERIC(12,2) DEFAULT 0);
CREATE TABLE public.carts (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL UNIQUE REFERENCES public.users(id), created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP);
CREATE UNIQUE INDEX idx_cart_user_id ON public.carts USING btree (user_id);
CREATE TABLE public.cart_items (id SERIAL PRIMARY KEY, cart_id INTEGER NOT NULL REFERENCES public.carts(id), product_id INTEGER NOT NULL REFERENCES public.products(id), quantity INTEGER NOT NULL, notes TEXT, variant_id INTEGER REFERENCES public.product_variants(id) ON DELETE CASCADE);
CREATE TABLE public.orders (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES public.users(id), order_code VARCHAR(50) NOT NULL UNIQUE, total_price NUMERIC(12,2) NOT NULL, status public.status_order DEFAULT 'waiting_payment', estimated_finish_date DATE, created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMPTZ);
CREATE INDEX idx_orders_user_id ON public.orders USING btree (user_id);
CREATE INDEX idx_orders_status ON public.orders USING btree (status);
CREATE TABLE public.order_items (id SERIAL PRIMARY KEY, order_id INTEGER NOT NULL REFERENCES public.orders(id), product_id INTEGER NOT NULL REFERENCES public.products(id), quantity INTEGER NOT NULL, price NUMERIC(12,2) NOT NULL, notes TEXT, variant_id INTEGER REFERENCES public.product_variants(id) ON DELETE CASCADE);
CREATE INDEX idx_order_items_order_id ON public.order_items USING btree (order_id);
CREATE TABLE public.payment_transactions (id SERIAL PRIMARY KEY, order_id INTEGER NOT NULL REFERENCES public.orders(id), payment_method_id INTEGER NOT NULL REFERENCES public.payment_methods(id), transaction_code VARCHAR(100) UNIQUE, amount NUMERIC(12,2) NOT NULL, payment_proof VARCHAR(255), payment_status public.status_payment DEFAULT 'pending', verified_by INTEGER REFERENCES public.users(id), verified_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX idx_payment_order_id ON public.payment_transactions USING btree (order_id);
CREATE TABLE public.order_status_logs (id SERIAL PRIMARY KEY, order_id INTEGER NOT NULL REFERENCES public.orders(id), status public.status_order NOT NULL, changed_by INTEGER NOT NULL REFERENCES public.users(id), notes TEXT, created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE public.production_logs (id SERIAL PRIMARY KEY, order_id INTEGER NOT NULL REFERENCES public.orders(id), start_time TIMESTAMPTZ, end_time TIMESTAMPTZ, notes TEXT, created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP, staff_id INTEGER REFERENCES public.users(id));
CREATE TABLE public.material_stock_logs (id SERIAL PRIMARY KEY, material_id INTEGER NOT NULL REFERENCES public.materials(id), change_type public.type_change NOT NULL, quantity NUMERIC(12,2) NOT NULL, reference VARCHAR(100), created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE public.design_files (id SERIAL PRIMARY KEY, order_item_id INTEGER NOT NULL REFERENCES public.order_items(id), file_path VARCHAR(255) NOT NULL, version INTEGER NOT NULL, uploaded_by INTEGER NOT NULL REFERENCES public.users(id), created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP, UNIQUE(order_item_id, version));
CREATE TABLE public.design_reviews (id SERIAL PRIMARY KEY, reviewed_by INTEGER NOT NULL REFERENCES public.users(id), status public.status_review NOT NULL, notes TEXT, created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP, design_file_id INTEGER NOT NULL REFERENCES public.design_files(id) ON DELETE CASCADE, CONSTRAINT unique_review_per_file UNIQUE (design_file_id));

-- SEED DATA
INSERT INTO public.roles (id, name) VALUES (1,'owner'),(2,'staff'),(3,'customer');
SELECT setval('public.roles_id_seq', 3, true);

INSERT INTO public.categories (id, name, created_at) VALUES (1,'Printing','2026-04-11 20:45:56.858504+07');
SELECT setval('public.categories_id_seq', 1, true);

INSERT INTO public.materials (id, name, stock, unit, created_at) VALUES (1,'Kertas Glossy',100.00,'Meter','2026-04-19 15:38:10.814322+07'),(2,'Kertas Art Carton 260gsm',45.50,'Rim','2026-04-24 11:23:32.855973+07');
SELECT setval('public.materials_id_seq', 2, true);

INSERT INTO public.payment_methods (id, name) VALUES (1,'BCA Transfer'),(2,'Mandiri Transfer'),(3,'QRIS');
SELECT setval('public.payment_methods_id_seq', 3, true);

INSERT INTO public.users (id,role_id,name,email,password,phone,is_active,created_at,updated_at,deleted_at) VALUES
(1,3,'Customer','customer@gmail.com','$2a$10$AnPTNgJRZ7pP.geGAL9iButov3uMfJyMAXkqjTgZzGbAEpxSqU8lq',NULL,true,'2026-04-11 20:44:04.838091+07',NULL,NULL),
(2,1,'Admin','admin@gmail.com','$2a$10$AnPTNgJRZ7pP.geGAL9iButov3uMfJyMAXkqjTgZzGbAEpxSqU8lq',NULL,true,'2026-04-11 20:44:04.838091+07',NULL,NULL),
(3,3,'test user','test@gmail.com','$2a$10$8VBlqVbKSm0dWBvhq3kYIus5YdNcx0Z9FLlgZKmhwZl2LKtMAg0QK',NULL,true,'2026-04-12 17:58:36.132668+07',NULL,NULL),
(4,3,'audit test','audit@gmail.com','$2a$10$hxPb3dBfOMy/EY7d9gzLCOtV47Q664qc8fPWIP14a4m7hIIfF3WKW',NULL,true,'2026-04-12 19:29:49.098263+07',NULL,NULL),
(5,3,'audit fix','auditfix@gmail.com','$2a$10$JoFjZMf7c9HhjKoIDovRlO8U0GIiPtyC.su.urNjkUodQtzPLHlsy',NULL,true,'2026-04-12 20:12:46.624513+07',NULL,NULL),
(6,2,'Budi Mesin','budi@jayamandiri.com','$2a$10$TrMpTavmC7sLHtHfnHkWKON3Li8SikqWXEzUdhkfLTsfnbEzSeGSe',NULL,true,'2026-04-14 12:14:27.845042+07',NULL,NULL),
(7,2,'Siti Admin','siti@jayamandiri.com','$2a$10$UuRqQCIdI2WMfIrsaiQJAeWeEXiyBklYQ7uYlySjRNgelRrklvSgq',NULL,true,'2026-04-14 13:32:35.777676+07',NULL,NULL),
(8,3,'Budi','budi@test.com','$2a$10$zK0qxnp.Er8qEV/05Rxz9OyUCvZlntOUWDiWyWIKCSczcTCUaKYEe',NULL,true,'2026-04-19 14:54:34.684471+07',NULL,NULL),
(9,2,'Andi Staff Produksi','andi@jayamandiri.com','$2a$10$zF7MVSijR7Ad06nj97nF2ehsymBxBBnahPCdiLdx18Dts53tb19oq',NULL,true,'2026-04-19 16:29:30.793069+07',NULL,NULL),
(10,3,'User Tester','tester1@example.com','$2a$10$mXc3BV7XTG4C6MO7hDBBxe5Q9N/auc77G660l5QqwhHux6ytoATmm',NULL,true,'2026-04-23 22:17:12.207178+07',NULL,NULL);
SELECT setval('public.users_id_seq', 10, true);

INSERT INTO public.products (id,category_id,name,description,base_price,estimated_days,is_active,created_at,updated_at,deleted_at) VALUES
(1,1,'Banner','Cetak banner',10000.00,1,true,'2026-04-11 20:46:08.602471+07',NULL,NULL),
(2,1,'Poster','Cetak poster',5000.00,1,true,'2026-04-11 20:46:08.602471+07',NULL,NULL),
(4,1,'Brosur A4 Premium','Cetak brosur full color kertas tebal',50000.00,2,true,'2026-04-24 10:46:48.364675+07',NULL,NULL);
SELECT setval('public.products_id_seq', 4, true);

INSERT INTO public.product_variants (id,product_id,sku,variant_name,price,stock,is_active,created_at,updated_at,material_id,material_usage) VALUES
(1,1,'BANN-001','Glossy Premium',50000.00,100,true,'2026-04-19 15:38:10.814322+07','2026-04-19 15:38:10.814322+07',1,1.00),
(2,2,'POST-001','A3 Glossy',15000.00,50,true,'2026-04-19 15:38:10.814322+07','2026-04-19 15:38:10.814322+07',1,0.50),
(3,4,'BRS-A4-GLS-150','Glossy 150gsm',50000.00,0,true,'2026-04-24 10:46:48.364675+07','2026-04-24 10:46:48.364675+07',NULL,0.00),
(4,4,'BRS-A4-MTT-150','Matte 150gsm',52000.00,0,true,'2026-04-24 10:46:48.364675+07','2026-04-24 10:46:48.364675+07',NULL,0.00);
SELECT setval('public.product_variants_id_seq', 4, true);

INSERT INTO public.carts (id,user_id,created_at) VALUES (1,1,'2026-04-12 10:42:23.96363+07'),(2,8,'2026-04-19 15:16:33.154829+07');
SELECT setval('public.carts_id_seq', 2, true);

INSERT INTO public.orders (id,user_id,order_code,total_price,status,estimated_finish_date,created_at,updated_at) VALUES
(1,1,'ORD-1775968238',20000.00,'printing',NULL,'2026-04-12 11:30:38.179732+07','2026-04-25 10:55:17.071126+07'),
(2,1,'ORD-1775993503',10000.00,'cancelled',NULL,'2026-04-12 18:31:43.903156+07',NULL),
(3,1,'ORD-11776086108',50000.00,'ready',NULL,'2026-04-13 20:15:08.876415+07','2026-04-14 12:27:59.913461+07'),
(4,8,'ORD-81776588502',300000.00,'cancelled',NULL,'2026-04-19 15:48:22.639101+07','2026-04-19 16:10:52.208158+07'),
(5,8,'ORD-1776589683',100000.00,'waiting_payment',NULL,'2026-04-19 16:08:03.200338+07',NULL),
(6,8,'ORD-81776590098',100000.00,'ready',NULL,'2026-04-19 16:14:58.30992+07','2026-04-19 16:47:50.286293+07');
SELECT setval('public.orders_id_seq', 6, true);

INSERT INTO public.order_items (id,order_id,product_id,quantity,price,notes,variant_id) VALUES
(1,1,1,2,10000.00,NULL,NULL),(2,2,1,1,10000.00,NULL,NULL),
(3,3,1,5,10000.00,'Cetak banner ukuran 2x1, bahan outdoor',NULL),
(4,4,1,3,50000.00,'Cetak Banner Glossy ukuran 2x1m',1),
(5,4,2,10,15000.00,'Poster A3 untuk promosi',2),
(6,5,1,2,50000.00,'Tes pesanan manual',1),
(7,6,1,2,50000.00,'Tes Payment Baru',1);
SELECT setval('public.order_items_id_seq', 7, true);

INSERT INTO public.payment_transactions (id,order_id,payment_method_id,transaction_code,amount,payment_proof,payment_status,verified_by,verified_at,created_at) VALUES
(1,1,1,NULL,20000.00,'bukti.jpg','approved',2,'2026-04-12 12:11:23.496295+07','2026-04-12 11:31:32.836609+07'),
(2,2,1,NULL,10000.00,'bukti.jpg','rejected',2,'2026-04-12 18:32:47.765311+07','2026-04-12 18:32:20.966972+07'),
(3,3,1,'TF-BCA-123',50000.00,'bukti_transfer_oke.jpg','approved',2,'2026-04-13 20:35:29.489692+07','2026-04-13 20:21:56.288093+07'),
(4,6,1,'',100000.00,'bukti_transfer_final_banget.jpg','approved',2,'2026-04-19 16:37:32.747242+07','2026-04-19 16:18:23.079136+07');
SELECT setval('public.payment_transactions_id_seq', 5, true);

INSERT INTO public.production_logs (id,order_id,start_time,end_time,notes,created_at,staff_id) VALUES
(2,3,'2026-04-14 12:27:01.373038+07','2026-04-14 12:27:59.914835+07','Budi mulai cetak banner di Mesin Epson A | Hasil cetak tajam, sudah dilaminasi doff. Siap dijemput!','2026-04-14 12:27:01.363604+07',6),
(3,6,'2026-04-19 16:46:33.639384+07','2026-04-19 16:47:50.29392+07',' | ','2026-04-19 16:46:33.618926+07',2),
(4,1,'2026-04-25 10:55:17.08274+07',NULL,'','2026-04-25 10:55:17.012129+07',9);
SELECT setval('public.production_logs_id_seq', 4, true);

INSERT INTO public.material_stock_logs (id,material_id,change_type,quantity,reference,created_at) VALUES
(1,2,'in',50.50,'Initial Stock','2026-04-24 11:23:32.869529+07'),
(2,2,'out',5.00,'Rusak terkena bocoran air','2026-04-24 11:26:57.316911+07');
SELECT setval('public.material_stock_logs_id_seq', 2, true);

INSERT INTO public.design_files (id,order_item_id,file_path,version,uploaded_by,created_at) VALUES
(1,1,'/uploads/designs/1777018401_1.png',1,1,'2026-04-24 15:13:21.448725+07');
SELECT setval('public.design_files_id_seq', 1, true);

INSERT INTO public.design_reviews (id,reviewed_by,status,notes,created_at,design_file_id) VALUES
(1,9,'approved','Desain sudah oke, siap cetak!','2026-04-24 15:29:45.693284+07',1);
SELECT setval('public.design_reviews_id_seq', 1, true);

INSERT INTO public.login_logs (id,user_id,activity_type,ip_address,user_agent,created_at) VALUES
(1,1,'logout','::1','PostmanRuntime/7.53.0','2026-04-25 11:35:38.911715+07'),
(2,1,'login','::1','PostmanRuntime/7.53.0','2026-04-25 11:36:02.16993+07');
SELECT setval('public.login_logs_id_seq', 2, true);

INSERT INTO public.audit_logs (id,user_id,role,action,entity_type,entity_id,ip_address,user_agent,created_at) VALUES
(2,4,'customer','login','user',4,'','','2026-04-12 19:30:26.1579+07'),
(3,5,'customer','register','user',5,'','','2026-04-12 20:12:46.639097+07'),
(4,1,'customer','login','users',1,'::1','curl/8.12.1','2026-04-13 00:00:32.08448+07'),
(5,1,'customer','checkout','orders',3,'','','2026-04-13 20:15:08.928211+07'),
(6,1,'customer','create_payment','payment_transactions',3,'::1','curl/8.12.1','2026-04-13 20:21:56.309129+07'),
(7,2,'owner','login','users',2,'::1','curl/8.12.1','2026-04-13 20:24:10.084982+07'),
(8,2,'admin','approve_payment','payment_transactions',3,'::1','curl/8.12.1','2026-04-13 20:35:29.500533+07'),
(9,6,'customer','register','users',6,'::1','curl/8.12.1','2026-04-14 12:14:27.869046+07'),
(10,6,'staff','login','users',6,'::1','curl/8.12.1','2026-04-14 12:18:09.225407+07'),
(11,6,'staff','start_production','orders',3,'::1','curl/8.12.1','2026-04-14 12:27:01.384029+07'),
(12,6,'staff','finish_production','orders',3,'::1','curl/8.12.1','2026-04-14 12:27:59.925651+07'),
(13,2,'owner','login','users',2,'::1','curl/8.12.1','2026-04-14 13:31:41.529135+07'),
(14,2,'owner','register_staff','users',7,'::1','curl/8.12.1','2026-04-14 13:32:35.79117+07'),
(15,2,'owner','login','users',2,'::1','curl/8.12.1','2026-04-15 11:09:29.218109+07'),
(16,2,'owner','login','users',2,'::1','curl/8.12.1','2026-04-18 19:41:36.596362+07'),
(17,8,'customer','register','users',8,'::1','curl/8.12.1','2026-04-19 14:54:34.708486+07'),
(18,8,'customer','login','users',8,'::1','curl/8.12.1','2026-04-19 15:02:27.992301+07'),
(19,8,'customer','checkout','orders',4,'::1','curl/8.12.1','2026-04-19 15:48:22.669112+07'),
(20,8,'customer','create_order','orders',5,'::1','curl/8.12.1','2026-04-19 16:08:03.228607+07'),
(21,8,'customer','CANCEL_ORDER','orders',4,'::1','curl/8.12.1','2026-04-19 16:10:52.219309+07'),
(22,8,'customer','checkout','orders',6,'::1','curl/8.12.1','2026-04-19 16:14:58.320948+07'),
(23,8,'customer','create_payment','payment_transactions',4,'::1','curl/8.12.1','2026-04-19 16:18:23.10086+07'),
(24,2,'owner','login','users',2,'::1','curl/8.12.1','2026-04-19 16:28:10.216464+07'),
(25,2,'owner','register_staff','users',9,'::1','curl/8.12.1','2026-04-19 16:29:30.79958+07'),
(26,2,'admin','approve_payment','payment_transactions',4,'::1','curl/8.12.1','2026-04-19 16:37:32.763394+07'),
(27,2,'owner','login','users',2,'::1','curl/8.12.1','2026-04-19 16:42:35.121815+07'),
(28,2,'staff','start_production','orders',6,'::1','curl/8.12.1','2026-04-19 16:46:33.644422+07'),
(29,2,'staff','finish_production','orders',6,'::1','curl/8.12.1','2026-04-19 16:47:50.299941+07'),
(30,10,'customer','register','users',10,'::1','PostmanRuntime/7.53.0','2026-04-23 22:17:12.238561+07'),
(31,2,'owner','login','users',2,'::1','PostmanRuntime/7.53.0','2026-04-24 10:32:51.244911+07'),
(32,2,'admin/owner','create_material','materials',2,'::1','PostmanRuntime/7.53.0','2026-04-24 11:23:32.874661+07'),
(33,2,'admin/owner','adjust_material_stock','materials',2,'::1','PostmanRuntime/7.53.0','2026-04-24 11:26:57.330294+07'),
(34,1,'customer','login','users',1,'::1','PostmanRuntime/7.53.0','2026-04-24 15:09:38.126187+07'),
(35,1,'customer','upload_design','design_files',1,'::1','PostmanRuntime/7.53.0','2026-04-24 15:13:21.458262+07'),
(36,9,'staff','login','users',9,'::1','PostmanRuntime/7.53.0','2026-04-24 15:27:53.541321+07'),
(37,9,'admin/owner','review_design_approved','design_reviews',1,'::1','PostmanRuntime/7.53.0','2026-04-24 15:29:45.696115+07'),
(38,3,'customer','login','users',3,'::1','PostmanRuntime/7.53.0','2026-04-24 15:56:32.460001+07'),
(39,1,'customer','login','users',1,'::1','PostmanRuntime/7.53.0','2026-04-25 10:20:02.983483+07'),
(40,3,'customer','login','users',3,'::1','PostmanRuntime/7.53.0','2026-04-25 10:29:35.955338+07'),
(41,2,'owner','login','users',2,'::1','PostmanRuntime/7.53.0','2026-04-25 10:44:48.217022+07'),
(42,9,'staff','login','users',9,'::1','PostmanRuntime/7.53.0','2026-04-25 10:54:58.361221+07'),
(43,9,'staff','start_production','orders',1,'::1','PostmanRuntime/7.53.0','2026-04-25 10:55:17.087506+07'),
(44,1,'','LOGOUT','users',1,'::1','PostmanRuntime/7.53.0','2026-04-25 11:35:38.929147+07'),
(45,1,'customer','login','users',1,'::1','PostmanRuntime/7.53.0','2026-04-25 11:36:02.15999+07');
SELECT setval('public.audit_logs_id_seq', 45, true);

-- GRANT PRIVILEGES
GRANT USAGE ON SCHEMA public TO printing_user;
GRANT ALL ON ALL TABLES IN SCHEMA public TO printing_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO printing_user;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT,INSERT,DELETE,UPDATE ON TABLES TO printing_user;
