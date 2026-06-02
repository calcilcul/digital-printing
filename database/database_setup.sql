--
-- PostgreSQL database dump
--


-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

-- Started on 2026-05-23 11:53:17

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 5 (class 2615 OID 16390)
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- TOC entry 5298 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- TOC entry 892 (class 1247 OID 16392)
-- Name: status_order; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.status_order AS ENUM (
    'waiting_payment',
    'payment_verification',
    'paid',
    'production',
    'completed',
    'cancelled',
    'printing',
    'ready',
    'design_review'
);


ALTER TYPE public.status_order OWNER TO postgres;

--
-- TOC entry 895 (class 1247 OID 16406)
-- Name: status_payment; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.status_payment AS ENUM (
    'pending',
    'approved',
    'rejected'
);


ALTER TYPE public.status_payment OWNER TO postgres;

--
-- TOC entry 904 (class 1247 OID 16426)
-- Name: status_review; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.status_review AS ENUM (
    'approved',
    'revision_requested'
);


ALTER TYPE public.status_review OWNER TO postgres;

--
-- TOC entry 901 (class 1247 OID 16420)
-- Name: type_activity; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.type_activity AS ENUM (
    'login',
    'logout'
);


ALTER TYPE public.type_activity OWNER TO postgres;

--
-- TOC entry 898 (class 1247 OID 16414)
-- Name: type_change; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.type_change AS ENUM (
    'in',
    'out'
);


ALTER TYPE public.type_change OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 234 (class 1259 OID 16531)
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id integer NOT NULL,
    user_id integer NOT NULL,
    role character varying(50),
    action character varying(255),
    entity_type character varying(50),
    entity_id integer,
    ip_address character varying(50),
    user_agent text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 16530)
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_logs_id_seq OWNER TO postgres;

--
-- TOC entry 5301 (class 0 OID 0)
-- Dependencies: 233
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- TOC entry 240 (class 1259 OID 16643)
-- Name: cart_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart_items (
    id integer NOT NULL,
    cart_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL,
    notes text,
    variant_id integer
);


ALTER TABLE public.cart_items OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 16642)
-- Name: cart_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cart_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cart_items_id_seq OWNER TO postgres;

--
-- TOC entry 5304 (class 0 OID 0)
-- Dependencies: 239
-- Name: cart_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cart_items_id_seq OWNED BY public.cart_items.id;


--
-- TOC entry 238 (class 1259 OID 16626)
-- Name: carts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.carts (
    id integer NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.carts OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 16625)
-- Name: carts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.carts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.carts_id_seq OWNER TO postgres;

--
-- TOC entry 5307 (class 0 OID 0)
-- Dependencies: 237
-- Name: carts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.carts_id_seq OWNED BY public.carts.id;


--
-- TOC entry 222 (class 1259 OID 16443)
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16442)
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO postgres;

--
-- TOC entry 5310 (class 0 OID 0)
-- Dependencies: 221
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- TOC entry 254 (class 1259 OID 16804)
-- Name: design_files; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.design_files (
    id integer NOT NULL,
    order_item_id integer NOT NULL,
    file_path character varying(255) NOT NULL,
    version integer NOT NULL,
    uploaded_by integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.design_files OWNER TO postgres;

--
-- TOC entry 253 (class 1259 OID 16803)
-- Name: design_files_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.design_files_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.design_files_id_seq OWNER TO postgres;

--
-- TOC entry 5313 (class 0 OID 0)
-- Dependencies: 253
-- Name: design_files_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.design_files_id_seq OWNED BY public.design_files.id;


--
-- TOC entry 256 (class 1259 OID 16829)
-- Name: design_reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.design_reviews (
    id integer NOT NULL,
    reviewed_by integer NOT NULL,
    status public.status_review NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    design_file_id integer NOT NULL
);


ALTER TABLE public.design_reviews OWNER TO postgres;

--
-- TOC entry 255 (class 1259 OID 16828)
-- Name: design_reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.design_reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.design_reviews_id_seq OWNER TO postgres;

--
-- TOC entry 5316 (class 0 OID 0)
-- Dependencies: 255
-- Name: design_reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.design_reviews_id_seq OWNED BY public.design_reviews.id;


--
-- TOC entry 232 (class 1259 OID 16522)
-- Name: login_attempts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.login_attempts (
    id integer NOT NULL,
    email character varying(100),
    ip_address character varying(50),
    success boolean,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.login_attempts OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16521)
-- Name: login_attempts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.login_attempts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.login_attempts_id_seq OWNER TO postgres;

--
-- TOC entry 5319 (class 0 OID 0)
-- Dependencies: 231
-- Name: login_attempts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.login_attempts_id_seq OWNED BY public.login_attempts.id;


--
-- TOC entry 230 (class 1259 OID 16504)
-- Name: login_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.login_logs (
    id integer NOT NULL,
    user_id integer NOT NULL,
    activity_type public.type_activity NOT NULL,
    ip_address character varying(50),
    user_agent text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.login_logs OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16503)
-- Name: login_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.login_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.login_logs_id_seq OWNER TO postgres;

--
-- TOC entry 5322 (class 0 OID 0)
-- Dependencies: 229
-- Name: login_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.login_logs_id_seq OWNED BY public.login_logs.id;


--
-- TOC entry 252 (class 1259 OID 16787)
-- Name: material_stock_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.material_stock_logs (
    id integer NOT NULL,
    material_id integer NOT NULL,
    change_type public.type_change NOT NULL,
    quantity numeric(12,2) NOT NULL,
    reference character varying(100),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.material_stock_logs OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 16786)
-- Name: material_stock_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.material_stock_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.material_stock_logs_id_seq OWNER TO postgres;

--
-- TOC entry 5325 (class 0 OID 0)
-- Dependencies: 251
-- Name: material_stock_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.material_stock_logs_id_seq OWNED BY public.material_stock_logs.id;


--
-- TOC entry 224 (class 1259 OID 16453)
-- Name: materials; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.materials (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    stock numeric(12,2) DEFAULT 0.00,
    unit character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.materials OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16452)
-- Name: materials_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.materials_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.materials_id_seq OWNER TO postgres;

--
-- TOC entry 5328 (class 0 OID 0)
-- Dependencies: 223
-- Name: materials_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.materials_id_seq OWNED BY public.materials.id;


--
-- TOC entry 244 (class 1259 OID 16686)
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL,
    price numeric(12,2) NOT NULL,
    notes text,
    variant_id integer
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 16685)
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_items_id_seq OWNER TO postgres;

--
-- TOC entry 5331 (class 0 OID 0)
-- Dependencies: 243
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- TOC entry 248 (class 1259 OID 16740)
-- Name: order_status_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_status_logs (
    id integer NOT NULL,
    order_id integer NOT NULL,
    status public.status_order NOT NULL,
    changed_by integer NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.order_status_logs OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 16739)
-- Name: order_status_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_status_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_status_logs_id_seq OWNER TO postgres;

--
-- TOC entry 5334 (class 0 OID 0)
-- Dependencies: 247
-- Name: order_status_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_status_logs_id_seq OWNED BY public.order_status_logs.id;


--
-- TOC entry 242 (class 1259 OID 16666)
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    user_id integer NOT NULL,
    order_code character varying(50) NOT NULL,
    total_price numeric(12,2) NOT NULL,
    status public.status_order DEFAULT 'waiting_payment'::public.status_order,
    estimated_finish_date date,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 16665)
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_id_seq OWNER TO postgres;

--
-- TOC entry 5337 (class 0 OID 0)
-- Dependencies: 241
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- TOC entry 226 (class 1259 OID 16474)
-- Name: payment_methods; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_methods (
    id integer NOT NULL,
    name character varying(100) NOT NULL
);


ALTER TABLE public.payment_methods OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16473)
-- Name: payment_methods_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payment_methods_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payment_methods_id_seq OWNER TO postgres;

--
-- TOC entry 5340 (class 0 OID 0)
-- Dependencies: 225
-- Name: payment_methods_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payment_methods_id_seq OWNED BY public.payment_methods.id;


--
-- TOC entry 246 (class 1259 OID 16710)
-- Name: payment_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_transactions (
    id integer NOT NULL,
    order_id integer NOT NULL,
    payment_method_id integer NOT NULL,
    transaction_code character varying(100),
    amount numeric(12,2) NOT NULL,
    payment_proof character varying(255),
    payment_status public.status_payment DEFAULT 'pending'::public.status_payment,
    verified_by integer,
    verified_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.payment_transactions OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 16709)
-- Name: payment_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payment_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payment_transactions_id_seq OWNER TO postgres;

--
-- TOC entry 5343 (class 0 OID 0)
-- Dependencies: 245
-- Name: payment_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payment_transactions_id_seq OWNED BY public.payment_transactions.id;


--
-- TOC entry 258 (class 1259 OID 16869)
-- Name: product_variants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_variants (
    id integer NOT NULL,
    product_id integer NOT NULL,
    sku character varying(100),
    variant_name character varying(255) NOT NULL,
    price numeric(12,2) DEFAULT 0 NOT NULL,
    stock integer DEFAULT '-1'::integer,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    material_id integer,
    material_usage numeric(12,2) DEFAULT 0
);


ALTER TABLE public.product_variants OWNER TO postgres;

--
-- TOC entry 257 (class 1259 OID 16868)
-- Name: product_variants_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_variants_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_variants_id_seq OWNER TO postgres;

--
-- TOC entry 5346 (class 0 OID 0)
-- Dependencies: 257
-- Name: product_variants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_variants_id_seq OWNED BY public.product_variants.id;


--
-- TOC entry 250 (class 1259 OID 16764)
-- Name: production_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.production_logs (
    id integer NOT NULL,
    order_id integer NOT NULL,
    start_time timestamp with time zone,
    end_time timestamp with time zone,
    notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    staff_id integer
);


ALTER TABLE public.production_logs OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 16763)
-- Name: production_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.production_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.production_logs_id_seq OWNER TO postgres;

--
-- TOC entry 5349 (class 0 OID 0)
-- Dependencies: 249
-- Name: production_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.production_logs_id_seq OWNED BY public.production_logs.id;


--
-- TOC entry 236 (class 1259 OID 16548)
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id integer NOT NULL,
    category_id integer,
    name character varying(150) NOT NULL,
    description text,
    base_price numeric(12,2) NOT NULL,
    estimated_days integer DEFAULT 1,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone,
    image character varying(255)
);


ALTER TABLE public.products OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 16547)
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO postgres;

--
-- TOC entry 5352 (class 0 OID 0)
-- Dependencies: 235
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- TOC entry 220 (class 1259 OID 16432)
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying(50) NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16431)
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO postgres;

--
-- TOC entry 5355 (class 0 OID 0)
-- Dependencies: 219
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- TOC entry 228 (class 1259 OID 16483)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    role_id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    phone character varying(20),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16482)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 5358 (class 0 OID 0)
-- Dependencies: 227
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 259 (class 1259 OID 16916)
-- Name: v_users; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_users AS
 SELECT id,
        CASE
            WHEN (role_id = 1) THEN ('OWN-'::text || lpad((id)::text, 3, '0'::text))
            WHEN (role_id = 2) THEN ('STF-'::text || lpad((id)::text, 3, '0'::text))
            ELSE ('CUS-'::text || lpad((id)::text, 3, '0'::text))
        END AS formatted_id,
    role_id,
    name,
    email,
    password,
    COALESCE(phone, ''::character varying) AS phone,
    COALESCE(is_active, true) AS is_active,
    created_at,
    updated_at,
    deleted_at
   FROM public.users;


ALTER VIEW public.v_users OWNER TO postgres;

--
-- TOC entry 4985 (class 2604 OID 16534)
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- TOC entry 4993 (class 2604 OID 16646)
-- Name: cart_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items ALTER COLUMN id SET DEFAULT nextval('public.cart_items_id_seq'::regclass);


--
-- TOC entry 4991 (class 2604 OID 16629)
-- Name: carts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carts ALTER COLUMN id SET DEFAULT nextval('public.carts_id_seq'::regclass);


--
-- TOC entry 4972 (class 2604 OID 16446)
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- TOC entry 5007 (class 2604 OID 16807)
-- Name: design_files id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.design_files ALTER COLUMN id SET DEFAULT nextval('public.design_files_id_seq'::regclass);


--
-- TOC entry 5009 (class 2604 OID 16832)
-- Name: design_reviews id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.design_reviews ALTER COLUMN id SET DEFAULT nextval('public.design_reviews_id_seq'::regclass);


--
-- TOC entry 4983 (class 2604 OID 16525)
-- Name: login_attempts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.login_attempts ALTER COLUMN id SET DEFAULT nextval('public.login_attempts_id_seq'::regclass);


--
-- TOC entry 4981 (class 2604 OID 16507)
-- Name: login_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.login_logs ALTER COLUMN id SET DEFAULT nextval('public.login_logs_id_seq'::regclass);


--
-- TOC entry 5005 (class 2604 OID 16790)
-- Name: material_stock_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.material_stock_logs ALTER COLUMN id SET DEFAULT nextval('public.material_stock_logs_id_seq'::regclass);


--
-- TOC entry 4974 (class 2604 OID 16456)
-- Name: materials id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materials ALTER COLUMN id SET DEFAULT nextval('public.materials_id_seq'::regclass);


--
-- TOC entry 4997 (class 2604 OID 16689)
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- TOC entry 5001 (class 2604 OID 16743)
-- Name: order_status_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_status_logs ALTER COLUMN id SET DEFAULT nextval('public.order_status_logs_id_seq'::regclass);


--
-- TOC entry 4994 (class 2604 OID 16669)
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- TOC entry 4977 (class 2604 OID 16477)
-- Name: payment_methods id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_methods ALTER COLUMN id SET DEFAULT nextval('public.payment_methods_id_seq'::regclass);


--
-- TOC entry 4998 (class 2604 OID 16713)
-- Name: payment_transactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_transactions ALTER COLUMN id SET DEFAULT nextval('public.payment_transactions_id_seq'::regclass);


--
-- TOC entry 5011 (class 2604 OID 16872)
-- Name: product_variants id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants ALTER COLUMN id SET DEFAULT nextval('public.product_variants_id_seq'::regclass);


--
-- TOC entry 5003 (class 2604 OID 16767)
-- Name: production_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.production_logs ALTER COLUMN id SET DEFAULT nextval('public.production_logs_id_seq'::regclass);


--
-- TOC entry 4987 (class 2604 OID 16551)
-- Name: products id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- TOC entry 4971 (class 2604 OID 16435)
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- TOC entry 4978 (class 2604 OID 16486)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 5268 (class 0 OID 16531)
-- Dependencies: 234
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (2, 4, 'customer', 'login', 'user', 4, '', '', '2026-04-12 19:30:26.1579+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (3, 5, 'customer', 'register', 'user', 5, '', '', '2026-04-12 20:12:46.639097+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (4, 1, 'customer', 'login', 'users', 1, '::1', 'curl/8.12.1', '2026-04-13 00:00:32.08448+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (5, 1, 'customer', 'checkout', 'orders', 3, '', '', '2026-04-13 20:15:08.928211+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (6, 1, 'customer', 'create_payment', 'payment_transactions', 3, '::1', 'curl/8.12.1', '2026-04-13 20:21:56.309129+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (7, 2, 'owner', 'login', 'users', 2, '::1', 'curl/8.12.1', '2026-04-13 20:24:10.084982+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (8, 2, 'admin', 'approve_payment', 'payment_transactions', 3, '::1', 'curl/8.12.1', '2026-04-13 20:35:29.500533+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (9, 6, 'customer', 'register', 'users', 6, '::1', 'curl/8.12.1', '2026-04-14 12:14:27.869046+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (10, 6, 'staff', 'login', 'users', 6, '::1', 'curl/8.12.1', '2026-04-14 12:18:09.225407+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (11, 6, 'staff', 'start_production', 'orders', 3, '::1', 'curl/8.12.1', '2026-04-14 12:27:01.384029+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (12, 6, 'staff', 'finish_production', 'orders', 3, '::1', 'curl/8.12.1', '2026-04-14 12:27:59.925651+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (13, 2, 'owner', 'login', 'users', 2, '::1', 'curl/8.12.1', '2026-04-14 13:31:41.529135+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (14, 2, 'owner', 'register_staff', 'users', 7, '::1', 'curl/8.12.1', '2026-04-14 13:32:35.79117+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (15, 2, 'owner', 'login', 'users', 2, '::1', 'curl/8.12.1', '2026-04-15 11:09:29.218109+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (16, 2, 'owner', 'login', 'users', 2, '::1', 'curl/8.12.1', '2026-04-18 19:41:36.596362+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (17, 8, 'customer', 'register', 'users', 8, '::1', 'curl/8.12.1', '2026-04-19 14:54:34.708486+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (18, 8, 'customer', 'login', 'users', 8, '::1', 'curl/8.12.1', '2026-04-19 15:02:27.992301+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (19, 8, 'customer', 'checkout', 'orders', 4, '::1', 'curl/8.12.1', '2026-04-19 15:48:22.669112+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (20, 8, 'customer', 'create_order', 'orders', 5, '::1', 'curl/8.12.1', '2026-04-19 16:08:03.228607+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (21, 8, 'customer', 'CANCEL_ORDER', 'orders', 4, '::1', 'curl/8.12.1', '2026-04-19 16:10:52.219309+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (22, 8, 'customer', 'checkout', 'orders', 6, '::1', 'curl/8.12.1', '2026-04-19 16:14:58.320948+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (23, 8, 'customer', 'create_payment', 'payment_transactions', 4, '::1', 'curl/8.12.1', '2026-04-19 16:18:23.10086+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (24, 2, 'owner', 'login', 'users', 2, '::1', 'curl/8.12.1', '2026-04-19 16:28:10.216464+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (25, 2, 'owner', 'register_staff', 'users', 9, '::1', 'curl/8.12.1', '2026-04-19 16:29:30.79958+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (26, 2, 'admin', 'approve_payment', 'payment_transactions', 4, '::1', 'curl/8.12.1', '2026-04-19 16:37:32.763394+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (27, 2, 'owner', 'login', 'users', 2, '::1', 'curl/8.12.1', '2026-04-19 16:42:35.121815+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (28, 2, 'staff', 'start_production', 'orders', 6, '::1', 'curl/8.12.1', '2026-04-19 16:46:33.644422+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (29, 2, 'staff', 'finish_production', 'orders', 6, '::1', 'curl/8.12.1', '2026-04-19 16:47:50.299941+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (30, 10, 'customer', 'register', 'users', 10, '::1', 'PostmanRuntime/7.53.0', '2026-04-23 22:17:12.238561+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (31, 2, 'owner', 'login', 'users', 2, '::1', 'PostmanRuntime/7.53.0', '2026-04-24 10:32:51.244911+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (32, 2, 'admin/owner', 'create_material', 'materials', 2, '::1', 'PostmanRuntime/7.53.0', '2026-04-24 11:23:32.874661+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (33, 2, 'admin/owner', 'adjust_material_stock', 'materials', 2, '::1', 'PostmanRuntime/7.53.0', '2026-04-24 11:26:57.330294+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (34, 1, 'customer', 'login', 'users', 1, '::1', 'PostmanRuntime/7.53.0', '2026-04-24 15:09:38.126187+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (35, 1, 'customer', 'upload_design', 'design_files', 1, '::1', 'PostmanRuntime/7.53.0', '2026-04-24 15:13:21.458262+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (36, 9, 'staff', 'login', 'users', 9, '::1', 'PostmanRuntime/7.53.0', '2026-04-24 15:27:53.541321+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (37, 9, 'admin/owner', 'review_design_approved', 'design_reviews', 1, '::1', 'PostmanRuntime/7.53.0', '2026-04-24 15:29:45.696115+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (38, 3, 'customer', 'login', 'users', 3, '::1', 'PostmanRuntime/7.53.0', '2026-04-24 15:56:32.460001+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (39, 1, 'customer', 'login', 'users', 1, '::1', 'PostmanRuntime/7.53.0', '2026-04-25 10:20:02.983483+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (40, 3, 'customer', 'login', 'users', 3, '::1', 'PostmanRuntime/7.53.0', '2026-04-25 10:29:35.955338+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (41, 2, 'owner', 'login', 'users', 2, '::1', 'PostmanRuntime/7.53.0', '2026-04-25 10:44:48.217022+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (42, 9, 'staff', 'login', 'users', 9, '::1', 'PostmanRuntime/7.53.0', '2026-04-25 10:54:58.361221+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (43, 9, 'staff', 'start_production', 'orders', 1, '::1', 'PostmanRuntime/7.53.0', '2026-04-25 10:55:17.087506+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (44, 1, '', 'LOGOUT', 'users', 1, '::1', 'PostmanRuntime/7.53.0', '2026-04-25 11:35:38.929147+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (45, 1, 'customer', 'login', 'users', 1, '::1', 'PostmanRuntime/7.53.0', '2026-04-25 11:36:02.15999+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (46, 1, 'customer', 'login', 'users', 1, '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8115', '2026-04-30 11:49:26.108177+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (47, 1, 'customer', 'login', 'users', 1, '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8115', '2026-04-30 11:49:44.418674+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (48, 2, 'owner', 'login', 'users', 2, '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8115', '2026-04-30 11:49:44.70916+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (49, 1, 'customer', 'login', 'users', 1, '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8115', '2026-04-30 16:24:30.865031+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (50, 2, 'owner', 'login', 'users', 2, '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8115', '2026-04-30 16:24:31.274965+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (51, 6, 'staff', 'login', 'users', 6, '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8115', '2026-04-30 16:24:31.452402+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (52, 2, 'owner', 'login', 'users', 2, '::1', 'PostmanRuntime/7.53.0', '2026-05-02 17:41:30.307052+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (53, 2, 'owner', 'login', 'users', 2, '::1', 'PostmanRuntime/7.53.0', '2026-05-02 18:03:29.506259+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (54, 1, 'customer', 'login', 'users', 1, '::1', 'PostmanRuntime/7.53.0', '2026-05-02 18:04:42.141121+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (55, 3, 'customer', 'login', 'users', 3, '::1', 'PostmanRuntime/7.53.0', '2026-05-02 18:06:02.33848+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (56, 9, 'staff', 'login', 'users', 9, '::1', 'PostmanRuntime/7.53.0', '2026-05-02 18:07:13.690283+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (57, 1, 'customer', 'login', 'users', 1, '::1', 'PostmanRuntime/7.53.0', '2026-05-03 16:10:48.149625+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (58, 1, 'customer', 'checkout', 'orders', 7, '::1', 'PostmanRuntime/7.53.0', '2026-05-03 16:19:36.31828+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (59, 1, 'customer', 'upload_design', 'design_files', 2, '::1', 'PostmanRuntime/7.53.0', '2026-05-03 16:35:31.586317+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (60, 1, 'customer', 'upload_design', 'design_files', 3, '::1', 'PostmanRuntime/7.53.0', '2026-05-03 16:35:52.822754+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (61, 1, 'customer', 'create_payment', 'payment_transactions', 6, '::1', 'PostmanRuntime/7.53.0', '2026-05-03 16:47:07.203165+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (62, 9, 'staff', 'login', 'users', 9, '::1', 'PostmanRuntime/7.53.0', '2026-05-03 16:49:11.253238+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (63, 9, 'admin/owner', 'review_design_approved', 'design_reviews', 2, '::1', 'PostmanRuntime/7.53.0', '2026-05-03 16:55:40.562848+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (64, 9, 'admin', 'approve_payment', 'payment_transactions', 6, '::1', 'PostmanRuntime/7.53.0', '2026-05-03 16:58:31.350974+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (65, 9, 'admin/owner', 'review_design_approved', 'design_reviews', 3, '::1', 'PostmanRuntime/7.53.0', '2026-05-03 17:00:16.766227+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (66, 9, 'staff', 'start_production', 'orders', 7, '::1', 'PostmanRuntime/7.53.0', '2026-05-03 17:00:23.723318+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (67, 9, 'staff', 'finish_production', 'orders', 7, '::1', 'PostmanRuntime/7.53.0', '2026-05-03 17:02:08.675095+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (68, 1, 'customer', 'COMPLETE_ORDER', 'orders', 7, '::1', 'PostmanRuntime/7.53.0', '2026-05-03 17:06:23.776646+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (70, 1, 'customer', 'login', 'users', 1, '::1', 'PostmanRuntime/7.53.0', '2026-05-06 10:01:10.014671+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (71, 2, 'owner', 'login', 'users', 2, '::1', 'GuzzleHttp/7', '2026-05-08 10:27:03.117174+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (72, 2, 'owner', 'login', 'users', 2, '::1', 'GuzzleHttp/7', '2026-05-08 10:27:09.262687+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (73, 2, 'owner', 'login', 'users', 2, '::1', 'GuzzleHttp/7', '2026-05-08 10:27:11.769775+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (74, 2, 'owner', 'login', 'users', 2, '::1', 'GuzzleHttp/7', '2026-05-08 10:27:13.26512+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (75, 1, 'customer', 'login', 'users', 1, '::1', 'GuzzleHttp/7', '2026-05-08 10:27:30.61145+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (76, 2, 'owner', 'login', 'users', 2, '::1', 'GuzzleHttp/7', '2026-05-08 10:35:11.154038+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (77, 2, '', 'LOGOUT', 'users', 2, '::1', 'GuzzleHttp/7', '2026-05-08 10:36:11.150988+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (78, 1, 'customer', 'login', 'users', 1, '::1', 'GuzzleHttp/7', '2026-05-08 10:36:22.772933+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (79, 1, '', 'LOGOUT', 'users', 1, '::1', 'GuzzleHttp/7', '2026-05-08 10:36:49.754449+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (80, 6, 'staff', 'login', 'users', 6, '::1', 'GuzzleHttp/7', '2026-05-08 10:38:21.320824+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (81, 6, '', 'LOGOUT', 'users', 6, '::1', 'GuzzleHttp/7', '2026-05-08 10:47:42.14955+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (82, 6, 'staff', 'login', 'users', 6, '::1', 'GuzzleHttp/7', '2026-05-08 10:47:48.382918+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (83, 6, '', 'LOGOUT', 'users', 6, '::1', 'GuzzleHttp/7', '2026-05-08 10:49:06.195984+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (84, 2, 'owner', 'login', 'users', 2, '::1', 'GuzzleHttp/7', '2026-05-08 10:49:11.400257+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (85, 2, '', 'LOGOUT', 'users', 2, '::1', 'GuzzleHttp/7', '2026-05-08 11:52:04.627005+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (86, 1, 'customer', 'login', 'users', 1, '::1', 'GuzzleHttp/7', '2026-05-08 11:52:10.848186+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (87, 1, 'customer', 'login', 'users', 1, '::1', 'GuzzleHttp/7', '2026-05-11 08:43:57.550006+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (88, 1, '', 'LOGOUT', 'users', 1, '::1', 'GuzzleHttp/7', '2026-05-11 08:44:10.610318+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (89, 2, 'owner', 'login', 'users', 2, '::1', 'GuzzleHttp/7', '2026-05-11 08:44:15.70062+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (90, 2, '', 'LOGOUT', 'users', 2, '::1', 'GuzzleHttp/7', '2026-05-11 08:50:15.960411+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (91, 6, 'staff', 'login', 'users', 6, '::1', 'GuzzleHttp/7', '2026-05-11 09:06:10.169914+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (92, 1, 'customer', 'login', 'users', 1, '::1', 'GuzzleHttp/7', '2026-05-17 19:34:27.140141+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (93, 1, 'customer', 'login', 'users', 1, '::1', 'GuzzleHttp/7', '2026-05-17 19:35:24.575114+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (94, 1, '', 'LOGOUT', 'users', 1, '::1', 'GuzzleHttp/7', '2026-05-17 19:35:32.527499+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (95, 9, 'staff', 'login', 'users', 9, '::1', 'GuzzleHttp/7', '2026-05-17 19:36:32.734234+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (96, 9, '', 'LOGOUT', 'users', 9, '::1', 'GuzzleHttp/7', '2026-05-17 19:37:15.772383+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (97, 2, 'owner', 'login', 'users', 2, '::1', 'GuzzleHttp/7', '2026-05-17 19:37:32.305783+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (98, 2, '', 'LOGOUT', 'users', 2, '::1', 'GuzzleHttp/7', '2026-05-17 20:07:35.594429+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (99, 1, 'customer', 'login', 'users', 1, '::1', 'GuzzleHttp/7', '2026-05-17 20:07:40.515546+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (100, 1, '', 'LOGOUT', 'users', 1, '::1', 'GuzzleHttp/7', '2026-05-17 20:07:59.68274+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (101, 9, 'staff', 'login', 'users', 9, '::1', 'GuzzleHttp/7', '2026-05-17 20:08:40.726085+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (102, 9, '', 'LOGOUT', 'users', 9, '::1', 'GuzzleHttp/7', '2026-05-17 20:08:58.428941+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (103, 2, 'owner', 'login', 'users', 2, '::1', 'GuzzleHttp/7', '2026-05-17 20:09:24.173695+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (104, 2, '', 'LOGOUT', 'users', 2, '::1', 'GuzzleHttp/7', '2026-05-17 20:10:06.995308+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (105, 1, 'customer', 'login', 'users', 1, '::1', 'GuzzleHttp/7', '2026-05-17 20:10:11.183369+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (106, 1, '', 'LOGOUT', 'users', 1, '::1', 'GuzzleHttp/7', '2026-05-17 20:11:21.871025+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (107, 1, 'customer', 'login', 'users', 1, '::1', 'GuzzleHttp/7', '2026-05-17 20:11:57.022239+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (108, 1, '', 'LOGOUT', 'users', 1, '::1', 'GuzzleHttp/7', '2026-05-17 20:12:04.469171+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (109, 1, '', 'LOGOUT', 'users', 1, '::1', 'GuzzleHttp/7', '2026-05-17 20:15:52.871503+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (110, 9, 'staff', 'login', 'users', 9, '::1', 'GuzzleHttp/7', '2026-05-17 20:16:21.043754+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (111, 1, 'customer', 'login', 'users', 1, '::1', 'GuzzleHttp/7', '2026-05-17 20:16:38.112048+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (112, 1, '', 'LOGOUT', 'users', 1, '::1', 'GuzzleHttp/7', '2026-05-17 20:25:23.896475+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (113, 1, 'customer', 'login', 'users', 1, '::1', 'GuzzleHttp/7', '2026-05-17 20:25:30.632454+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (114, 1, 'customer', 'checkout', 'orders', 8, '::1', 'GuzzleHttp/7', '2026-05-17 20:25:36.98457+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (115, 1, 'customer', 'create_payment', 'payment_transactions', 7, '::1', 'GuzzleHttp/7', '2026-05-17 20:36:43.564622+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (116, 9, 'admin', 'approve_payment', 'payment_transactions', 7, '::1', 'GuzzleHttp/7', '2026-05-17 20:37:20.871205+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (117, 1, 'customer', 'upload_design', 'design_files', 4, '::1', 'GuzzleHttp/7', '2026-05-17 20:37:52.301648+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (118, 1, 'customer', 'upload_design', 'design_files', 5, '::1', 'GuzzleHttp/7', '2026-05-17 20:38:51.711183+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (119, 1, 'customer', 'upload_design', 'design_files', 6, '::1', 'GuzzleHttp/7', '2026-05-17 20:49:56.524851+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (120, 9, 'admin/owner', 'review_design_approved', 'design_reviews', 4, '::1', 'GuzzleHttp/7', '2026-05-17 20:53:11.824235+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (121, 9, 'staff', 'start_production', 'orders', 8, '::1', 'GuzzleHttp/7', '2026-05-17 20:58:28.661941+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (122, 1, '', 'LOGOUT', 'users', 1, '::1', 'GuzzleHttp/7', '2026-05-17 22:00:30.018324+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (123, 1, 'customer', 'login', 'users', 1, '::1', 'GuzzleHttp/7', '2026-05-17 22:09:41.522864+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (124, 1, 'customer', 'login', 'users', 1, '::1', 'GuzzleHttp/7', '2026-05-18 09:58:58.638688+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (125, 9, 'staff', 'login', 'users', 9, '::1', 'GuzzleHttp/7', '2026-05-18 09:59:16.248001+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (126, 9, '', 'LOGOUT', 'users', 9, '::1', 'GuzzleHttp/7', '2026-05-18 10:00:06.199618+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (127, 2, 'owner', 'login', 'users', 2, '::1', 'GuzzleHttp/7', '2026-05-18 10:00:39.509618+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (128, 1, '', 'LOGOUT', 'users', 1, '::1', 'GuzzleHttp/7', '2026-05-18 10:09:34.908976+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (129, 1, 'customer', 'login', 'users', 1, '::1', 'GuzzleHttp/7', '2026-05-18 10:09:54.445404+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (130, 1, 'customer', 'checkout', 'orders', 9, '::1', 'GuzzleHttp/7', '2026-05-18 10:11:20.408933+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (131, 1, 'customer', 'create_payment', 'payment_transactions', 8, '::1', 'GuzzleHttp/7', '2026-05-18 10:11:58.258854+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (132, 2, '', 'LOGOUT', 'users', 2, '::1', 'GuzzleHttp/7', '2026-05-18 10:12:06.668874+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (133, 9, 'staff', 'login', 'users', 9, '::1', 'GuzzleHttp/7', '2026-05-18 10:12:14.707082+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (134, 9, 'admin', 'approve_payment', 'payment_transactions', 8, '::1', 'GuzzleHttp/7', '2026-05-18 10:12:32.739312+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (135, 1, 'customer', 'upload_design', 'design_files', 7, '::1', 'GuzzleHttp/7', '2026-05-18 10:14:27.852029+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (136, 9, 'admin/owner', 'review_design_approved', 'design_reviews', 5, '::1', 'GuzzleHttp/7', '2026-05-18 10:15:55.824001+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (137, 9, 'staff', 'start_production', 'orders', 9, '::1', 'GuzzleHttp/7', '2026-05-18 10:16:36.344252+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (138, 9, 'staff', 'finish_production', 'orders', 9, '::1', 'GuzzleHttp/7', '2026-05-18 10:16:47.793264+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (139, 1, 'customer', 'COMPLETE_ORDER', 'orders', 9, '::1', 'GuzzleHttp/7', '2026-05-18 10:18:04.66921+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (140, 9, '', 'LOGOUT', 'users', 9, '::1', 'GuzzleHttp/7', '2026-05-18 10:18:18.461262+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (141, 2, 'owner', 'login', 'users', 2, '::1', 'GuzzleHttp/7', '2026-05-18 10:18:36.718312+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (142, 1, 'customer', 'login', 'users', 1, '::1', 'GuzzleHttp/7', '2026-05-18 21:30:34.493319+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (143, 1, '', 'LOGOUT', 'users', 1, '::1', 'GuzzleHttp/7', '2026-05-18 21:58:19.709239+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (144, 1, 'customer', 'login', 'users', 1, '::1', 'GuzzleHttp/7', '2026-05-18 21:58:24.883447+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (145, 1, 'customer', 'checkout', 'orders', 10, '::1', 'GuzzleHttp/7', '2026-05-18 22:01:41.37683+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (146, 1, 'customer', 'checkout', 'orders', 11, '::1', 'GuzzleHttp/7', '2026-05-18 22:06:52.330942+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (147, 1, 'customer', 'checkout', 'orders', 12, '::1', 'GuzzleHttp/7', '2026-05-18 22:12:26.890905+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (148, 1, 'customer', 'CANCEL_ORDER', 'orders', 11, '::1', 'GuzzleHttp/7', '2026-05-18 22:16:02.378062+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (149, 9, 'staff', 'login', 'users', 9, '::1', 'GuzzleHttp/7', '2026-05-18 22:23:50.513287+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (150, 1, 'customer', 'create_payment', 'payment_transactions', 9, '::1', 'GuzzleHttp/7', '2026-05-18 22:24:28.256689+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (151, 9, 'admin', 'approve_payment', 'payment_transactions', 9, '::1', 'GuzzleHttp/7', '2026-05-18 22:26:05.51302+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (152, 1, 'customer', 'upload_design', 'design_files', 8, '::1', 'GuzzleHttp/7', '2026-05-18 22:27:09.508513+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (153, 1, 'customer', 'upload_design', 'design_files', 9, '::1', 'GuzzleHttp/7', '2026-05-18 22:27:20.228596+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (154, 9, 'admin/owner', 'review_design_approved', 'design_reviews', 6, '::1', 'GuzzleHttp/7', '2026-05-18 22:28:38.353433+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (155, 1, 'customer', 'create_order', 'orders', 13, '::1', 'GuzzleHttp/7', '2026-05-18 23:27:00.532236+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (156, 1, 'customer', 'upload_design', 'design_files', 10, '::1', 'GuzzleHttp/7', '2026-05-18 23:27:22.776797+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (157, 1, 'customer', 'create_payment', 'payment_transactions', 10, '::1', 'GuzzleHttp/7', '2026-05-18 23:27:58.084414+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (158, 9, 'admin', 'approve_payment', 'payment_transactions', 10, '::1', 'GuzzleHttp/7', '2026-05-18 23:29:57.956208+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (159, 1, 'customer', 'upload_design', 'design_files', 11, '::1', 'GuzzleHttp/7', '2026-05-19 00:58:38.036073+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (160, 1, 'customer', 'upload_design', 'design_files', 12, '::1', 'GuzzleHttp/7', '2026-05-19 01:14:49.041632+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (161, 1, 'customer', 'upload_design', 'design_files', 13, '::1', 'GuzzleHttp/7', '2026-05-19 02:24:06.772646+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (162, 1, 'customer', 'create_order', 'orders', 14, '::1', 'GuzzleHttp/7', '2026-05-19 02:38:41.392384+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (163, 1, 'customer', 'upload_design', 'design_files', 14, '::1', 'GuzzleHttp/7', '2026-05-19 02:38:50.817818+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (164, 1, '', 'LOGOUT', 'users', 1, '::1', 'GuzzleHttp/7', '2026-05-19 03:04:54.570179+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (165, 1, 'customer', 'login', 'users', 1, '::1', 'GuzzleHttp/7', '2026-05-19 03:05:14.401515+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (166, 1, '', 'LOGOUT', 'users', 1, '::1', 'GuzzleHttp/7', '2026-05-19 03:05:47.331135+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (167, 1, 'customer', 'login', 'users', 1, '::1', 'GuzzleHttp/7', '2026-05-19 03:06:00.641867+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (168, 1, 'customer', 'create_order', 'orders', 15, '::1', 'GuzzleHttp/7', '2026-05-19 03:09:26.878215+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (169, 1, 'customer', 'upload_design', 'design_files', 15, '::1', 'GuzzleHttp/7', '2026-05-19 03:10:00.195395+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (170, 1, 'customer', 'login', 'users', 1, '::1', 'GuzzleHttp/7', '2026-05-19 17:29:24.621819+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (171, 1, '', 'UPDATE_PROFILE', 'users', 1, '::1', 'GuzzleHttp/7', '2026-05-19 17:30:17.919894+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (172, 9, 'staff', 'login', 'users', 9, '::1', 'GuzzleHttp/7', '2026-05-19 17:31:39.783027+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (173, 9, 'admin/owner', 'review_design_revision_requested', 'design_reviews', 7, '::1', 'GuzzleHttp/7', '2026-05-19 17:49:22.493016+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (174, 1, 'customer', 'COMPLETE_ORDER', 'orders', 3, '::1', 'GuzzleHttp/7', '2026-05-19 18:00:34.981668+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (175, 1, 'customer', 'create_payment', 'payment_transactions', 11, '::1', 'GuzzleHttp/7', '2026-05-19 18:31:01.233835+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (176, 9, '', 'LOGOUT', 'users', 9, '::1', 'GuzzleHttp/7', '2026-05-19 19:01:05.278548+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (177, 1, '', 'LOGOUT', 'users', 1, '::1', 'GuzzleHttp/7', '2026-05-19 19:01:15.330854+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (178, 2, 'owner', 'login', 'users', 2, '::1', 'GuzzleHttp/7', '2026-05-19 19:01:35.024665+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (179, 1, 'customer', 'login', 'users', 1, '::1', 'GuzzleHttp/7', '2026-05-19 19:07:28.184495+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (180, 2, 'admin', 'approve_payment', 'payment_transactions', 11, '::1', 'GuzzleHttp/7', '2026-05-19 19:07:56.738777+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (181, 2, 'owner', 'login', 'users', 2, '::1', 'GuzzleHttp/7', '2026-05-19 19:31:41.132835+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (182, 2, 'admin/owner', 'create_material', 'materials', 3, '::1', 'GuzzleHttp/7', '2026-05-19 19:42:05.642051+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (183, 2, 'admin/owner', 'adjust_material_stock', 'materials', 3, '::1', 'GuzzleHttp/7', '2026-05-19 19:42:46.782321+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (184, 1, 'customer', 'login', 'users', 1, '::1', 'GuzzleHttp/7', '2026-05-20 09:59:47.621913+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (185, 1, 'customer', 'create_order', 'orders', 16, '::1', 'GuzzleHttp/7', '2026-05-20 10:00:20.967921+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (186, 1, 'customer', 'upload_design', 'design_files', 22, '::1', 'GuzzleHttp/7', '2026-05-20 10:01:35.876299+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (187, 1, 'customer', 'create_payment', 'payment_transactions', 12, '::1', 'GuzzleHttp/7', '2026-05-20 10:02:21.373661+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (188, 6, 'staff', 'login', 'users', 6, '::1', 'GuzzleHttp/7', '2026-05-20 10:03:25.80753+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (189, 6, '', 'LOGOUT', 'users', 6, '::1', 'GuzzleHttp/7', '2026-05-20 10:07:48.033015+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (190, 2, 'owner', 'login', 'users', 2, '::1', 'GuzzleHttp/7', '2026-05-20 10:07:56.118518+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (191, 2, 'admin', 'reject_payment', 'payment_transactions', 12, '::1', 'GuzzleHttp/7', '2026-05-20 10:08:14.401598+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (192, 2, '', 'LOGOUT', 'users', 2, '::1', 'GuzzleHttp/7', '2026-05-20 10:08:30.564144+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (193, 1, 'customer', 'login', 'users', 1, '::1', 'GuzzleHttp/7', '2026-05-20 10:23:49.210302+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (194, 2, 'owner', 'login', 'users', 2, '::1', 'GuzzleHttp/7', '2026-05-20 10:24:12.640587+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (195, 1, 'customer', 'create_payment', 'payment_transactions', 15, '::1', 'GuzzleHttp/7', '2026-05-20 10:25:44.66272+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (196, 2, 'admin', 'approve_payment', 'payment_transactions', 15, '::1', 'GuzzleHttp/7', '2026-05-20 10:26:11.915304+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (197, 1, 'customer', 'checkout', 'orders', 17, '::1', 'GuzzleHttp/7', '2026-05-20 11:09:18.227889+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (198, 1, 'customer', 'login', 'users', 1, '::1', 'GuzzleHttp/7', '2026-05-20 15:37:53.991447+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (199, 1, '', 'LOGOUT', 'users', 1, '::1', 'GuzzleHttp/7', '2026-05-20 15:38:08.485755+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (200, 2, 'owner', 'login', 'users', 2, '::1', 'GuzzleHttp/7', '2026-05-20 15:38:22.515861+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (201, 2, 'owner', 'login', 'users', 2, '::1', 'GuzzleHttp/7', '2026-05-20 20:45:25.158109+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (202, 2, 'owner', 'login', 'users', 2, '::1', 'GuzzleHttp/7', '2026-05-21 18:27:16.200523+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (203, 2, '', 'LOGOUT', 'users', 2, '::1', 'GuzzleHttp/7', '2026-05-21 18:48:11.546206+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (204, 9, 'staff', 'login', 'users', 9, '::1', 'GuzzleHttp/7', '2026-05-21 18:48:19.221667+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (205, 9, '', 'LOGOUT', 'users', 9, '::1', 'GuzzleHttp/7', '2026-05-21 18:52:21.707657+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (206, 2, 'owner', 'login', 'users', 2, '::1', 'GuzzleHttp/7', '2026-05-21 18:52:32.697539+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (207, 2, '', 'LOGOUT', 'users', 2, '::1', 'GuzzleHttp/7', '2026-05-21 19:15:13.966533+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (208, 1, 'customer', 'login', 'users', 1, '::1', 'GuzzleHttp/7', '2026-05-21 19:15:57.709093+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (209, 1, 'customer', 'create_order', 'orders', 18, '::1', 'GuzzleHttp/7', '2026-05-21 19:44:30.510114+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (210, 2, 'owner', 'login', 'users', 2, '::1', 'GuzzleHttp/7', '2026-05-22 10:38:15.636684+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (211, 2, '', 'LOGOUT', 'users', 2, '::1', 'GuzzleHttp/7', '2026-05-22 10:38:43.668263+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (212, 6, 'staff', 'login', 'users', 6, '::1', 'GuzzleHttp/7', '2026-05-22 10:38:54.648519+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (213, 6, '', 'LOGOUT', 'users', 6, '::1', 'GuzzleHttp/7', '2026-05-22 10:39:13.122777+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (214, 1, 'customer', 'login', 'users', 1, '::1', 'GuzzleHttp/7', '2026-05-22 10:39:33.061053+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (215, 1, '', 'LOGOUT', 'users', 1, '::1', 'GuzzleHttp/7', '2026-05-22 10:43:14.024774+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (216, 1, 'customer', 'login', 'users', 1, '::1', 'GuzzleHttp/7', '2026-05-22 10:43:28.139662+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (217, 1, 'customer', 'login', 'users', 1, '::1', 'GuzzleHttp/7', '2026-05-22 10:50:04.384061+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (218, 1, '', 'LOGOUT', 'users', 1, '::1', 'GuzzleHttp/7', '2026-05-22 10:50:57.178746+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (219, 2, 'owner', 'login', 'users', 2, '::1', 'GuzzleHttp/7', '2026-05-22 10:51:04.149471+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (220, 2, '', 'LOGOUT', 'users', 2, '::1', 'GuzzleHttp/7', '2026-05-22 10:52:13.648159+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (221, 1, 'customer', 'login', 'users', 1, '::1', 'GuzzleHttp/7', '2026-05-22 10:52:21.338063+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (222, 1, 'customer', 'login', 'users', 1, '::1', 'GuzzleHttp/7', '2026-05-23 10:09:53.256447+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (223, 1, 'customer', 'create_order', 'orders', 19, '::1', 'GuzzleHttp/7', '2026-05-23 10:10:14.382701+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (224, 1, 'customer', 'upload_design', 'design_files', 23, '::1', 'GuzzleHttp/7', '2026-05-23 10:12:38.509058+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (225, 1, 'customer', 'create_payment', 'payment_transactions', 16, '::1', 'GuzzleHttp/7', '2026-05-23 10:12:57.817769+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (226, 2, 'owner', 'login', 'users', 2, '::1', 'GuzzleHttp/7', '2026-05-23 11:33:36.848106+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (227, 2, 'admin', 'reject_payment', 'payment_transactions', 16, '::1', 'GuzzleHttp/7', '2026-05-23 11:33:54.045359+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (228, 1, 'customer', 'create_payment', 'payment_transactions', 17, '::1', 'GuzzleHttp/7', '2026-05-23 11:34:33.421314+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (229, 2, 'admin', 'approve_payment', 'payment_transactions', 17, '::1', 'GuzzleHttp/7', '2026-05-23 11:35:11.887702+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (230, 2, '', 'LOGOUT', 'users', 2, '::1', 'GuzzleHttp/7', '2026-05-23 11:36:32.390496+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (231, 6, 'staff', 'login', 'users', 6, '::1', 'GuzzleHttp/7', '2026-05-23 11:36:48.231605+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (232, 6, 'admin/owner', 'review_design_revision_requested', 'design_reviews', 8, '::1', 'GuzzleHttp/7', '2026-05-23 11:37:15.255262+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (233, 1, 'customer', 'upload_design', 'design_files', 24, '::1', 'GuzzleHttp/7', '2026-05-23 11:38:38.060256+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (234, 6, 'admin/owner', 'review_design_approved', 'design_reviews', 9, '::1', 'GuzzleHttp/7', '2026-05-23 11:39:02.356789+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (235, 6, 'staff', 'finish_production', 'orders', 19, '::1', 'GuzzleHttp/7', '2026-05-23 11:39:53.683571+07');
INSERT INTO public.audit_logs (id, user_id, role, action, entity_type, entity_id, ip_address, user_agent, created_at) VALUES (236, 1, 'customer', 'COMPLETE_ORDER', 'orders', 19, '::1', 'GuzzleHttp/7', '2026-05-23 11:40:06.654886+07');


--
-- TOC entry 5274 (class 0 OID 16643)
-- Dependencies: 240
-- Data for Name: cart_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.cart_items (id, cart_id, product_id, quantity, notes, variant_id) VALUES (13, 3, 4, 9, '', 3);


--
-- TOC entry 5272 (class 0 OID 16626)
-- Dependencies: 238
-- Data for Name: carts; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.carts (id, user_id, created_at) VALUES (1, 1, '2026-04-12 10:42:23.96363+07');
INSERT INTO public.carts (id, user_id, created_at) VALUES (2, 8, '2026-04-19 15:16:33.154829+07');
INSERT INTO public.carts (id, user_id, created_at) VALUES (3, 2, '2026-05-17 20:02:03.984919+07');


--
-- TOC entry 5256 (class 0 OID 16443)
-- Dependencies: 222
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.categories (id, name, created_at) VALUES (1, 'Printing', '2026-04-11 20:45:56.858504+07');
INSERT INTO public.categories (id, name, created_at) VALUES (2, 'Cetak Buku & Majalah', '2026-05-19 19:16:00.771804+07');
INSERT INTO public.categories (id, name, created_at) VALUES (3, 'Banner & Spanduk', '2026-05-19 19:16:00.774022+07');
INSERT INTO public.categories (id, name, created_at) VALUES (4, 'Sticker & Label', '2026-05-19 19:16:00.775705+07');
INSERT INTO public.categories (id, name, created_at) VALUES (5, 'Kartu & Undangan', '2026-05-19 19:16:00.777478+07');
INSERT INTO public.categories (id, name, created_at) VALUES (6, 'Kaos & Merchandise', '2026-05-19 19:16:00.779187+07');
INSERT INTO public.categories (id, name, created_at) VALUES (7, 'Outdoor Advertising', '2026-05-19 19:16:00.780918+07');
INSERT INTO public.categories (id, name, created_at) VALUES (8, 'Packaging & Dus', '2026-05-19 19:16:00.782529+07');
INSERT INTO public.categories (id, name, created_at) VALUES (9, 'Poster & Brosur', '2026-05-19 19:18:10.177796+07');


--
-- TOC entry 5288 (class 0 OID 16804)
-- Dependencies: 254
-- Data for Name: design_files; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.design_files (id, order_item_id, file_path, version, uploaded_by, created_at) VALUES (1, 1, '/uploads/designs/1777018401_1.png', 1, 1, '2026-04-24 15:13:21.448725+07');
INSERT INTO public.design_files (id, order_item_id, file_path, version, uploaded_by, created_at) VALUES (2, 8, '/uploads/designs/1777800931_Potoku1.png', 1, 1, '2026-05-03 16:35:31.582643+07');
INSERT INTO public.design_files (id, order_item_id, file_path, version, uploaded_by, created_at) VALUES (3, 9, '/uploads/designs/1777800952_Potoku1.png', 1, 1, '2026-05-03 16:35:52.821381+07');
INSERT INTO public.design_files (id, order_item_id, file_path, version, uploaded_by, created_at) VALUES (4, 10, '/uploads/designs/1779025072_Class_diagram_digiprint-Page-1.drawio (1).png', 1, 1, '2026-05-17 20:37:52.298422+07');
INSERT INTO public.design_files (id, order_item_id, file_path, version, uploaded_by, created_at) VALUES (5, 10, '/uploads/designs/1779025131_Class_diagram_digiprint-Page-1.drawio (1).png', 2, 1, '2026-05-17 20:38:51.70798+07');
INSERT INTO public.design_files (id, order_item_id, file_path, version, uploaded_by, created_at) VALUES (6, 10, '/uploads/designs/1779025796_Class_diagram_digiprint-Page-1.drawio (1).png', 3, 1, '2026-05-17 20:49:56.514811+07');
INSERT INTO public.design_files (id, order_item_id, file_path, version, uploaded_by, created_at) VALUES (7, 11, '/uploads/designs/1779074067_Usecase_diagram_digiprint-Halaman-2.drawio (1).png', 1, 1, '2026-05-18 10:14:27.8502+07');
INSERT INTO public.design_files (id, order_item_id, file_path, version, uploaded_by, created_at) VALUES (8, 14, '/uploads/designs/1779118029_Class_diagram_digiprint-Page-1.drawio (1).png', 1, 1, '2026-05-18 22:27:09.506025+07');
INSERT INTO public.design_files (id, order_item_id, file_path, version, uploaded_by, created_at) VALUES (9, 15, '/uploads/designs/1779118040_Class_diagram_digiprint-Page-1.drawio (1).png', 1, 1, '2026-05-18 22:27:20.227254+07');
INSERT INTO public.design_files (id, order_item_id, file_path, version, uploaded_by, created_at) VALUES (10, 16, '/uploads/designs/1779121642_Class_diagram_digiprint-Page-1.drawio (1).png', 1, 1, '2026-05-18 23:27:22.775113+07');
INSERT INTO public.design_files (id, order_item_id, file_path, version, uploaded_by, created_at) VALUES (11, 12, '/uploads/designs/1779127118_ptblur2.jpg', 1, 1, '2026-05-19 00:58:38.026681+07');
INSERT INTO public.design_files (id, order_item_id, file_path, version, uploaded_by, created_at) VALUES (12, 12, '/uploads/designs/1779128089_ptblur2.jpg', 2, 1, '2026-05-19 01:14:49.0377+07');
INSERT INTO public.design_files (id, order_item_id, file_path, version, uploaded_by, created_at) VALUES (13, 12, '/uploads/designs/1779132243_ptblur2.jpg', 3, 1, '2026-05-19 02:24:06.765399+07');
INSERT INTO public.design_files (id, order_item_id, file_path, version, uploaded_by, created_at) VALUES (14, 17, '/uploads/designs/1779133130_ptblur2.jpg', 1, 1, '2026-05-19 02:38:50.8124+07');
INSERT INTO public.design_files (id, order_item_id, file_path, version, uploaded_by, created_at) VALUES (15, 18, '/uploads/designs/1779134999_Class_diagram_digiprint-Page-1.drawio.png', 1, 1, '2026-05-19 03:10:00.189472+07');
INSERT INTO public.design_files (id, order_item_id, file_path, version, uploaded_by, created_at) VALUES (22, 19, '/uploads/designs/1779246095_Usecase_diagram_digiprint-Halaman-2.drawio (2).png', 1, 1, '2026-05-20 10:01:35.873513+07');
INSERT INTO public.design_files (id, order_item_id, file_path, version, uploaded_by, created_at) VALUES (23, 22, '/uploads/designs/1779505955_Screenshot 2026-05-22 191117.png', 1, 1, '2026-05-23 10:12:38.505248+07');
INSERT INTO public.design_files (id, order_item_id, file_path, version, uploaded_by, created_at) VALUES (24, 22, '/uploads/designs/1779511117_Screenshot 2026-05-16 094049.png', 2, 1, '2026-05-23 11:38:38.058475+07');


--
-- TOC entry 5290 (class 0 OID 16829)
-- Dependencies: 256
-- Data for Name: design_reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.design_reviews (id, reviewed_by, status, notes, created_at, design_file_id) VALUES (1, 9, 'approved', 'Desain sudah oke, siap cetak!', '2026-04-24 15:29:45.693284+07', 1);
INSERT INTO public.design_reviews (id, reviewed_by, status, notes, created_at, design_file_id) VALUES (2, 9, 'approved', 'Desain sudah oke, resolusi bagus, siap cetak!', '2026-05-03 16:55:40.559807+07', 2);
INSERT INTO public.design_reviews (id, reviewed_by, status, notes, created_at, design_file_id) VALUES (3, 9, 'approved', 'Desain sudah oke, resolusi bagus, siap cetak!', '2026-05-03 17:00:16.756387+07', 3);
INSERT INTO public.design_reviews (id, reviewed_by, status, notes, created_at, design_file_id) VALUES (4, 9, 'approved', 'mantap', '2026-05-17 20:53:11.811122+07', 6);
INSERT INTO public.design_reviews (id, reviewed_by, status, notes, created_at, design_file_id) VALUES (5, 9, 'approved', 'mantap', '2026-05-18 10:15:55.819157+07', 7);
INSERT INTO public.design_reviews (id, reviewed_by, status, notes, created_at, design_file_id) VALUES (6, 9, 'approved', 'elek', '2026-05-18 22:28:38.350509+07', 8);
INSERT INTO public.design_reviews (id, reviewed_by, status, notes, created_at, design_file_id) VALUES (7, 9, 'revision_requested', 'gambar kurang sesuai dengan ukuran yang di cetak', '2026-05-19 17:49:22.48901+07', 15);
INSERT INTO public.design_reviews (id, reviewed_by, status, notes, created_at, design_file_id) VALUES (8, 6, 'revision_requested', 'ojok ngunu', '2026-05-23 11:37:15.251264+07', 23);
INSERT INTO public.design_reviews (id, reviewed_by, status, notes, created_at, design_file_id) VALUES (9, 6, 'approved', 'oke', '2026-05-23 11:39:02.354203+07', 24);


--
-- TOC entry 5266 (class 0 OID 16522)
-- Dependencies: 232
-- Data for Name: login_attempts; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5264 (class 0 OID 16504)
-- Dependencies: 230
-- Data for Name: login_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (1, 1, 'logout', '::1', 'PostmanRuntime/7.53.0', '2026-04-25 11:35:38.911715+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (2, 1, 'login', '::1', 'PostmanRuntime/7.53.0', '2026-04-25 11:36:02.16993+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (3, 1, 'login', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8115', '2026-04-30 11:49:26.132885+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (4, 1, 'login', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8115', '2026-04-30 11:49:44.428116+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (5, 2, 'login', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8115', '2026-04-30 11:49:44.718217+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (6, 1, 'login', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8115', '2026-04-30 16:24:30.881939+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (7, 2, 'login', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8115', '2026-04-30 16:24:31.276739+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (8, 6, 'login', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8115', '2026-04-30 16:24:31.453729+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (9, 2, 'login', '::1', 'PostmanRuntime/7.53.0', '2026-05-02 18:03:29.517401+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (10, 1, 'login', '::1', 'PostmanRuntime/7.53.0', '2026-05-02 18:04:42.151064+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (11, 3, 'login', '::1', 'PostmanRuntime/7.53.0', '2026-05-02 18:06:02.339834+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (12, 9, 'login', '::1', 'PostmanRuntime/7.53.0', '2026-05-02 18:07:13.699736+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (13, 1, 'login', '::1', 'PostmanRuntime/7.53.0', '2026-05-03 16:10:48.159022+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (14, 9, 'login', '::1', 'PostmanRuntime/7.53.0', '2026-05-03 16:49:11.262901+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (15, 1, 'login', '::1', 'PostmanRuntime/7.53.0', '2026-05-06 10:01:10.036088+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (16, 2, 'login', '::1', 'GuzzleHttp/7', '2026-05-08 10:27:03.124606+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (17, 2, 'login', '::1', 'GuzzleHttp/7', '2026-05-08 10:27:09.263872+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (18, 2, 'login', '::1', 'GuzzleHttp/7', '2026-05-08 10:27:11.770842+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (19, 2, 'login', '::1', 'GuzzleHttp/7', '2026-05-08 10:27:13.267209+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (20, 1, 'login', '::1', 'GuzzleHttp/7', '2026-05-08 10:27:30.613693+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (21, 2, 'login', '::1', 'GuzzleHttp/7', '2026-05-08 10:35:11.158511+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (22, 2, 'logout', '::1', 'GuzzleHttp/7', '2026-05-08 10:36:11.140737+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (23, 1, 'login', '::1', 'GuzzleHttp/7', '2026-05-08 10:36:22.782131+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (24, 1, 'logout', '::1', 'GuzzleHttp/7', '2026-05-08 10:36:49.75299+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (25, 6, 'login', '::1', 'GuzzleHttp/7', '2026-05-08 10:38:21.323157+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (26, 6, 'logout', '::1', 'GuzzleHttp/7', '2026-05-08 10:47:42.139118+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (27, 6, 'login', '::1', 'GuzzleHttp/7', '2026-05-08 10:47:48.38675+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (28, 6, 'logout', '::1', 'GuzzleHttp/7', '2026-05-08 10:49:06.193758+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (29, 2, 'login', '::1', 'GuzzleHttp/7', '2026-05-08 10:49:11.40148+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (30, 2, 'logout', '::1', 'GuzzleHttp/7', '2026-05-08 11:52:04.623251+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (31, 1, 'login', '::1', 'GuzzleHttp/7', '2026-05-08 11:52:10.849509+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (32, 1, 'login', '::1', 'GuzzleHttp/7', '2026-05-11 08:43:57.59131+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (33, 1, 'logout', '::1', 'GuzzleHttp/7', '2026-05-11 08:44:10.609137+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (34, 2, 'login', '::1', 'GuzzleHttp/7', '2026-05-11 08:44:15.703441+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (35, 2, 'logout', '::1', 'GuzzleHttp/7', '2026-05-11 08:50:15.955927+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (36, 6, 'login', '::1', 'GuzzleHttp/7', '2026-05-11 09:06:10.184297+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (37, 1, 'login', '::1', 'GuzzleHttp/7', '2026-05-17 19:34:27.183362+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (38, 1, 'login', '::1', 'GuzzleHttp/7', '2026-05-17 19:35:24.584029+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (39, 1, 'logout', '::1', 'GuzzleHttp/7', '2026-05-17 19:35:32.518128+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (40, 9, 'login', '::1', 'GuzzleHttp/7', '2026-05-17 19:36:32.736175+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (41, 9, 'logout', '::1', 'GuzzleHttp/7', '2026-05-17 19:37:15.759227+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (42, 2, 'login', '::1', 'GuzzleHttp/7', '2026-05-17 19:37:32.315839+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (43, 2, 'logout', '::1', 'GuzzleHttp/7', '2026-05-17 20:07:35.582921+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (44, 1, 'login', '::1', 'GuzzleHttp/7', '2026-05-17 20:07:40.525074+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (45, 1, 'logout', '::1', 'GuzzleHttp/7', '2026-05-17 20:07:59.673488+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (46, 9, 'login', '::1', 'GuzzleHttp/7', '2026-05-17 20:08:40.735797+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (47, 9, 'logout', '::1', 'GuzzleHttp/7', '2026-05-17 20:08:58.419996+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (48, 2, 'login', '::1', 'GuzzleHttp/7', '2026-05-17 20:09:24.182836+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (49, 2, 'logout', '::1', 'GuzzleHttp/7', '2026-05-17 20:10:06.985815+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (50, 1, 'login', '::1', 'GuzzleHttp/7', '2026-05-17 20:10:11.193073+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (51, 1, 'logout', '::1', 'GuzzleHttp/7', '2026-05-17 20:11:21.861675+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (52, 1, 'login', '::1', 'GuzzleHttp/7', '2026-05-17 20:11:57.024365+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (53, 1, 'logout', '::1', 'GuzzleHttp/7', '2026-05-17 20:12:04.464723+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (54, 1, 'logout', '::1', 'GuzzleHttp/7', '2026-05-17 20:15:52.867799+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (55, 9, 'login', '::1', 'GuzzleHttp/7', '2026-05-17 20:16:21.053996+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (56, 1, 'login', '::1', 'GuzzleHttp/7', '2026-05-17 20:16:38.121566+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (57, 1, 'logout', '::1', 'GuzzleHttp/7', '2026-05-17 20:25:23.884267+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (58, 1, 'login', '::1', 'GuzzleHttp/7', '2026-05-17 20:25:30.641712+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (59, 1, 'logout', '::1', 'GuzzleHttp/7', '2026-05-17 22:00:30.005899+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (60, 1, 'login', '::1', 'GuzzleHttp/7', '2026-05-17 22:09:41.528354+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (61, 1, 'login', '::1', 'GuzzleHttp/7', '2026-05-18 09:58:58.663263+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (62, 9, 'login', '::1', 'GuzzleHttp/7', '2026-05-18 09:59:16.257812+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (63, 9, 'logout', '::1', 'GuzzleHttp/7', '2026-05-18 10:00:06.194834+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (64, 2, 'login', '::1', 'GuzzleHttp/7', '2026-05-18 10:00:39.510904+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (65, 1, 'logout', '::1', 'GuzzleHttp/7', '2026-05-18 10:09:34.896761+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (66, 1, 'login', '::1', 'GuzzleHttp/7', '2026-05-18 10:09:54.455101+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (67, 2, 'logout', '::1', 'GuzzleHttp/7', '2026-05-18 10:12:06.666237+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (68, 9, 'login', '::1', 'GuzzleHttp/7', '2026-05-18 10:12:14.710206+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (69, 9, 'logout', '::1', 'GuzzleHttp/7', '2026-05-18 10:18:18.457268+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (70, 2, 'login', '::1', 'GuzzleHttp/7', '2026-05-18 10:18:36.721004+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (71, 1, 'login', '::1', 'GuzzleHttp/7', '2026-05-18 21:30:34.524923+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (72, 1, 'logout', '::1', 'GuzzleHttp/7', '2026-05-18 21:58:19.696615+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (73, 1, 'login', '::1', 'GuzzleHttp/7', '2026-05-18 21:58:24.887649+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (74, 9, 'login', '::1', 'GuzzleHttp/7', '2026-05-18 22:23:50.525263+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (75, 1, 'logout', '::1', 'GuzzleHttp/7', '2026-05-19 03:04:54.5641+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (76, 1, 'login', '::1', 'GuzzleHttp/7', '2026-05-19 03:05:14.404078+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (77, 1, 'logout', '::1', 'GuzzleHttp/7', '2026-05-19 03:05:47.329351+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (78, 1, 'login', '::1', 'GuzzleHttp/7', '2026-05-19 03:06:00.644711+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (79, 1, 'login', '::1', 'GuzzleHttp/7', '2026-05-19 17:29:24.645252+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (80, 9, 'login', '::1', 'GuzzleHttp/7', '2026-05-19 17:31:39.792802+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (81, 9, 'logout', '::1', 'GuzzleHttp/7', '2026-05-19 19:01:05.266958+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (82, 1, 'logout', '::1', 'GuzzleHttp/7', '2026-05-19 19:01:15.321191+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (83, 2, 'login', '::1', 'GuzzleHttp/7', '2026-05-19 19:01:35.027262+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (84, 1, 'login', '::1', 'GuzzleHttp/7', '2026-05-19 19:07:28.189953+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (85, 2, 'login', '::1', 'GuzzleHttp/7', '2026-05-19 19:31:41.144863+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (86, 1, 'login', '::1', 'GuzzleHttp/7', '2026-05-20 09:59:47.661362+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (87, 6, 'login', '::1', 'GuzzleHttp/7', '2026-05-20 10:03:25.80929+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (88, 6, 'logout', '::1', 'GuzzleHttp/7', '2026-05-20 10:07:48.021054+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (89, 2, 'login', '::1', 'GuzzleHttp/7', '2026-05-20 10:07:56.121695+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (90, 2, 'logout', '::1', 'GuzzleHttp/7', '2026-05-20 10:08:30.554775+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (91, 1, 'login', '::1', 'GuzzleHttp/7', '2026-05-20 10:23:49.222364+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (92, 2, 'login', '::1', 'GuzzleHttp/7', '2026-05-20 10:24:12.642129+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (93, 1, 'login', '::1', 'GuzzleHttp/7', '2026-05-20 15:37:54.007826+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (94, 1, 'logout', '::1', 'GuzzleHttp/7', '2026-05-20 15:38:08.484172+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (95, 2, 'login', '::1', 'GuzzleHttp/7', '2026-05-20 15:38:22.517455+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (96, 2, 'login', '::1', 'GuzzleHttp/7', '2026-05-20 20:45:25.16317+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (97, 2, 'login', '::1', 'GuzzleHttp/7', '2026-05-21 18:27:16.238612+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (98, 2, 'logout', '::1', 'GuzzleHttp/7', '2026-05-21 18:48:11.542102+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (99, 9, 'login', '::1', 'GuzzleHttp/7', '2026-05-21 18:48:19.223012+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (100, 9, 'logout', '::1', 'GuzzleHttp/7', '2026-05-21 18:52:21.705044+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (101, 2, 'login', '::1', 'GuzzleHttp/7', '2026-05-21 18:52:32.702921+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (102, 2, 'logout', '::1', 'GuzzleHttp/7', '2026-05-21 19:15:13.96276+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (103, 1, 'login', '::1', 'GuzzleHttp/7', '2026-05-21 19:15:57.718209+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (104, 2, 'login', '::1', 'GuzzleHttp/7', '2026-05-22 10:38:15.683883+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (105, 2, 'logout', '::1', 'GuzzleHttp/7', '2026-05-22 10:38:43.667137+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (106, 6, 'login', '::1', 'GuzzleHttp/7', '2026-05-22 10:38:54.650019+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (107, 6, 'logout', '::1', 'GuzzleHttp/7', '2026-05-22 10:39:13.120149+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (108, 1, 'login', '::1', 'GuzzleHttp/7', '2026-05-22 10:39:33.071179+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (109, 1, 'logout', '::1', 'GuzzleHttp/7', '2026-05-22 10:43:14.020626+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (110, 1, 'login', '::1', 'GuzzleHttp/7', '2026-05-22 10:43:28.144086+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (111, 1, 'login', '::1', 'GuzzleHttp/7', '2026-05-22 10:50:04.389508+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (112, 1, 'logout', '::1', 'GuzzleHttp/7', '2026-05-22 10:50:57.177364+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (113, 2, 'login', '::1', 'GuzzleHttp/7', '2026-05-22 10:51:04.150672+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (114, 2, 'logout', '::1', 'GuzzleHttp/7', '2026-05-22 10:52:13.647006+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (115, 1, 'login', '::1', 'GuzzleHttp/7', '2026-05-22 10:52:21.33946+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (116, 1, 'login', '::1', 'GuzzleHttp/7', '2026-05-23 10:09:53.290643+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (117, 2, 'login', '::1', 'GuzzleHttp/7', '2026-05-23 11:33:36.86553+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (118, 2, 'logout', '::1', 'GuzzleHttp/7', '2026-05-23 11:36:32.380605+07');
INSERT INTO public.login_logs (id, user_id, activity_type, ip_address, user_agent, created_at) VALUES (119, 6, 'login', '::1', 'GuzzleHttp/7', '2026-05-23 11:36:48.244464+07');


--
-- TOC entry 5286 (class 0 OID 16787)
-- Dependencies: 252
-- Data for Name: material_stock_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.material_stock_logs (id, material_id, change_type, quantity, reference, created_at) VALUES (1, 2, 'in', 50.50, 'Initial Stock', '2026-04-24 11:23:32.869529+07');
INSERT INTO public.material_stock_logs (id, material_id, change_type, quantity, reference, created_at) VALUES (2, 2, 'out', 5.00, 'Rusak terkena bocoran air', '2026-04-24 11:26:57.316911+07');
INSERT INTO public.material_stock_logs (id, material_id, change_type, quantity, reference, created_at) VALUES (3, 1, 'out', 2.00, 'Order Paid #7', '2026-05-03 16:58:31.326764+07');
INSERT INTO public.material_stock_logs (id, material_id, change_type, quantity, reference, created_at) VALUES (4, 1, 'out', 5.00, 'Order Paid #7', '2026-05-03 16:58:31.326764+07');
INSERT INTO public.material_stock_logs (id, material_id, change_type, quantity, reference, created_at) VALUES (5, 1, 'in', 2.00, 'Order Cancelled #5 (Refund)', '2026-05-03 19:00:00.101753+07');
INSERT INTO public.material_stock_logs (id, material_id, change_type, quantity, reference, created_at) VALUES (6, 1, 'in', 1.00, 'Order Cancelled #11 (Refund)', '2026-05-18 22:16:02.361294+07');
INSERT INTO public.material_stock_logs (id, material_id, change_type, quantity, reference, created_at) VALUES (7, 3, 'in', 15.00, 'Initial Stock', '2026-05-19 19:42:05.635961+07');
INSERT INTO public.material_stock_logs (id, material_id, change_type, quantity, reference, created_at) VALUES (8, 3, 'in', 5.00, 'Restock manual oleh Owner/Admin', '2026-05-19 19:42:46.779887+07');


--
-- TOC entry 5258 (class 0 OID 16453)
-- Dependencies: 224
-- Data for Name: materials; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.materials (id, name, stock, unit, created_at) VALUES (2, 'Kertas Art Carton 260gsm', 45.50, 'Rim', '2026-04-24 11:23:32.855973+07');
INSERT INTO public.materials (id, name, stock, unit, created_at) VALUES (3, 'Kertas HVS 80g', 20.00, 'Rim', '2026-05-19 19:42:05.628179+07');
INSERT INTO public.materials (id, name, stock, unit, created_at) VALUES (1, 'Kertas Glossy', 81.50, 'Meter', '2026-04-19 15:38:10.814322+07');


--
-- TOC entry 5278 (class 0 OID 16686)
-- Dependencies: 244
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.order_items (id, order_id, product_id, quantity, price, notes, variant_id) VALUES (1, 1, 1, 2, 10000.00, NULL, NULL);
INSERT INTO public.order_items (id, order_id, product_id, quantity, price, notes, variant_id) VALUES (2, 2, 1, 1, 10000.00, NULL, NULL);
INSERT INTO public.order_items (id, order_id, product_id, quantity, price, notes, variant_id) VALUES (3, 3, 1, 5, 10000.00, 'Cetak banner ukuran 2x1, bahan outdoor', NULL);
INSERT INTO public.order_items (id, order_id, product_id, quantity, price, notes, variant_id) VALUES (4, 4, 1, 3, 50000.00, 'Cetak Banner Glossy ukuran 2x1m', 1);
INSERT INTO public.order_items (id, order_id, product_id, quantity, price, notes, variant_id) VALUES (5, 4, 2, 10, 15000.00, 'Poster A3 untuk promosi', 2);
INSERT INTO public.order_items (id, order_id, product_id, quantity, price, notes, variant_id) VALUES (6, 5, 1, 2, 50000.00, 'Tes pesanan manual', 1);
INSERT INTO public.order_items (id, order_id, product_id, quantity, price, notes, variant_id) VALUES (7, 6, 1, 2, 50000.00, 'Tes Payment Baru', 1);
INSERT INTO public.order_items (id, order_id, product_id, quantity, price, notes, variant_id) VALUES (8, 7, 1, 2, 50000.00, '', 1);
INSERT INTO public.order_items (id, order_id, product_id, quantity, price, notes, variant_id) VALUES (9, 7, 2, 10, 15000.00, '', 2);
INSERT INTO public.order_items (id, order_id, product_id, quantity, price, notes, variant_id) VALUES (10, 8, 4, 5, 50000.00, '', 3);
INSERT INTO public.order_items (id, order_id, product_id, quantity, price, notes, variant_id) VALUES (11, 9, 2, 20, 15000.00, '', 2);
INSERT INTO public.order_items (id, order_id, product_id, quantity, price, notes, variant_id) VALUES (12, 10, 2, 1, 15000.00, 'finish', 2);
INSERT INTO public.order_items (id, order_id, product_id, quantity, price, notes, variant_id) VALUES (13, 11, 1, 1, 50000.00, '', 1);
INSERT INTO public.order_items (id, order_id, product_id, quantity, price, notes, variant_id) VALUES (14, 12, 1, 1, 50000.00, '', 1);
INSERT INTO public.order_items (id, order_id, product_id, quantity, price, notes, variant_id) VALUES (15, 12, 2, 1, 15000.00, '', 2);
INSERT INTO public.order_items (id, order_id, product_id, quantity, price, notes, variant_id) VALUES (16, 13, 2, 1, 15000.00, '', 2);
INSERT INTO public.order_items (id, order_id, product_id, quantity, price, notes, variant_id) VALUES (17, 14, 2, 4, 15000.00, '', 2);
INSERT INTO public.order_items (id, order_id, product_id, quantity, price, notes, variant_id) VALUES (18, 15, 1, 10, 50000.00, '', 1);
INSERT INTO public.order_items (id, order_id, product_id, quantity, price, notes, variant_id) VALUES (19, 16, 4, 1, 52000.00, '', 4);
INSERT INTO public.order_items (id, order_id, product_id, quantity, price, notes, variant_id) VALUES (20, 17, 2, 3, 15000.00, '', 2);
INSERT INTO public.order_items (id, order_id, product_id, quantity, price, notes, variant_id) VALUES (21, 18, 4, 1, 52000.00, '', 4);
INSERT INTO public.order_items (id, order_id, product_id, quantity, price, notes, variant_id) VALUES (22, 19, 2, 1, 15000.00, '', 2);


--
-- TOC entry 5282 (class 0 OID 16740)
-- Dependencies: 248
-- Data for Name: order_status_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.order_status_logs (id, order_id, status, changed_by, notes, created_at) VALUES (1, 8, 'waiting_payment', 1, 'Checkout created', '2026-05-17 20:25:36.956323+07');
INSERT INTO public.order_status_logs (id, order_id, status, changed_by, notes, created_at) VALUES (2, 8, 'payment_verification', 1, 'Customer uploaded payment proof', '2026-05-17 20:36:43.562377+07');
INSERT INTO public.order_status_logs (id, order_id, status, changed_by, notes, created_at) VALUES (3, 8, 'paid', 9, 'Payment status updated: approved', '2026-05-17 20:37:20.859207+07');
INSERT INTO public.order_status_logs (id, order_id, status, changed_by, notes, created_at) VALUES (4, 8, 'printing', 9, '', '2026-05-17 20:58:28.64264+07');
INSERT INTO public.order_status_logs (id, order_id, status, changed_by, notes, created_at) VALUES (5, 9, 'waiting_payment', 1, 'Checkout created', '2026-05-18 10:11:20.386088+07');
INSERT INTO public.order_status_logs (id, order_id, status, changed_by, notes, created_at) VALUES (6, 9, 'payment_verification', 1, 'Customer uploaded payment proof', '2026-05-18 10:11:58.257545+07');
INSERT INTO public.order_status_logs (id, order_id, status, changed_by, notes, created_at) VALUES (7, 9, 'paid', 9, 'Payment status updated: approved', '2026-05-18 10:12:32.734213+07');
INSERT INTO public.order_status_logs (id, order_id, status, changed_by, notes, created_at) VALUES (8, 9, 'printing', 9, '', '2026-05-18 10:16:36.333266+07');
INSERT INTO public.order_status_logs (id, order_id, status, changed_by, notes, created_at) VALUES (9, 9, 'ready', 9, '', '2026-05-18 10:16:47.7865+07');
INSERT INTO public.order_status_logs (id, order_id, status, changed_by, notes, created_at) VALUES (10, 9, 'completed', 1, 'Order marked as completed by customer', '2026-05-18 10:18:04.667834+07');
INSERT INTO public.order_status_logs (id, order_id, status, changed_by, notes, created_at) VALUES (11, 10, 'waiting_payment', 1, 'Checkout created', '2026-05-18 22:01:41.355718+07');
INSERT INTO public.order_status_logs (id, order_id, status, changed_by, notes, created_at) VALUES (12, 11, 'waiting_payment', 1, 'Checkout created', '2026-05-18 22:06:52.305862+07');
INSERT INTO public.order_status_logs (id, order_id, status, changed_by, notes, created_at) VALUES (13, 12, 'waiting_payment', 1, 'Checkout created', '2026-05-18 22:12:26.871961+07');
INSERT INTO public.order_status_logs (id, order_id, status, changed_by, notes, created_at) VALUES (14, 11, 'cancelled', 1, 'Order cancelled', '2026-05-18 22:16:02.361294+07');
INSERT INTO public.order_status_logs (id, order_id, status, changed_by, notes, created_at) VALUES (15, 12, 'payment_verification', 1, 'Customer uploaded payment proof', '2026-05-18 22:24:28.254468+07');
INSERT INTO public.order_status_logs (id, order_id, status, changed_by, notes, created_at) VALUES (16, 12, 'paid', 9, 'Payment status updated: approved', '2026-05-18 22:26:05.501035+07');
INSERT INTO public.order_status_logs (id, order_id, status, changed_by, notes, created_at) VALUES (17, 13, 'waiting_payment', 1, 'Order created manually', '2026-05-18 23:27:00.517047+07');
INSERT INTO public.order_status_logs (id, order_id, status, changed_by, notes, created_at) VALUES (18, 13, 'payment_verification', 1, 'Customer uploaded payment proof', '2026-05-18 23:27:58.083187+07');
INSERT INTO public.order_status_logs (id, order_id, status, changed_by, notes, created_at) VALUES (19, 13, 'paid', 9, 'Payment status updated: approved', '2026-05-18 23:29:57.944649+07');
INSERT INTO public.order_status_logs (id, order_id, status, changed_by, notes, created_at) VALUES (20, 14, 'waiting_payment', 1, 'Order created manually', '2026-05-19 02:38:41.356514+07');
INSERT INTO public.order_status_logs (id, order_id, status, changed_by, notes, created_at) VALUES (21, 15, 'waiting_payment', 1, 'Order created manually', '2026-05-19 03:09:26.867266+07');
INSERT INTO public.order_status_logs (id, order_id, status, changed_by, notes, created_at) VALUES (22, 3, 'completed', 1, 'Order marked as completed by customer', '2026-05-19 18:00:34.978412+07');
INSERT INTO public.order_status_logs (id, order_id, status, changed_by, notes, created_at) VALUES (23, 14, 'payment_verification', 1, 'Customer uploaded payment proof', '2026-05-19 18:31:01.231007+07');
INSERT INTO public.order_status_logs (id, order_id, status, changed_by, notes, created_at) VALUES (24, 14, 'paid', 2, 'Payment status updated: approved', '2026-05-19 19:07:56.730036+07');
INSERT INTO public.order_status_logs (id, order_id, status, changed_by, notes, created_at) VALUES (27, 16, 'waiting_payment', 1, 'Order created manually', '2026-05-20 10:00:20.956798+07');
INSERT INTO public.order_status_logs (id, order_id, status, changed_by, notes, created_at) VALUES (28, 16, 'payment_verification', 1, 'Customer uploaded payment proof', '2026-05-20 10:02:21.372584+07');
INSERT INTO public.order_status_logs (id, order_id, status, changed_by, notes, created_at) VALUES (29, 16, 'waiting_payment', 2, 'Payment status updated: rejected', '2026-05-20 10:08:14.387836+07');
INSERT INTO public.order_status_logs (id, order_id, status, changed_by, notes, created_at) VALUES (30, 16, 'payment_verification', 1, 'Customer uploaded payment proof', '2026-05-20 10:25:44.660431+07');
INSERT INTO public.order_status_logs (id, order_id, status, changed_by, notes, created_at) VALUES (31, 16, 'paid', 2, 'Payment status updated: approved', '2026-05-20 10:26:11.910386+07');
INSERT INTO public.order_status_logs (id, order_id, status, changed_by, notes, created_at) VALUES (34, 17, 'waiting_payment', 1, 'Checkout created', '2026-05-20 11:09:18.209107+07');
INSERT INTO public.order_status_logs (id, order_id, status, changed_by, notes, created_at) VALUES (50, 18, 'waiting_payment', 1, 'Order created manually', '2026-05-21 19:44:30.480402+07');
INSERT INTO public.order_status_logs (id, order_id, status, changed_by, notes, created_at) VALUES (51, 19, 'waiting_payment', 1, 'Order created manually', '2026-05-23 10:10:14.349093+07');
INSERT INTO public.order_status_logs (id, order_id, status, changed_by, notes, created_at) VALUES (52, 19, 'payment_verification', 1, 'Customer uploaded payment proof', '2026-05-23 10:12:57.815447+07');
INSERT INTO public.order_status_logs (id, order_id, status, changed_by, notes, created_at) VALUES (57, 19, 'payment_verification', 2, 'Payment status updated: rejected', '2026-05-23 11:33:54.031879+07');
INSERT INTO public.order_status_logs (id, order_id, status, changed_by, notes, created_at) VALUES (58, 19, 'payment_verification', 1, 'Customer uploaded payment proof', '2026-05-23 11:34:33.420111+07');
INSERT INTO public.order_status_logs (id, order_id, status, changed_by, notes, created_at) VALUES (59, 19, 'design_review', 2, 'Payment status updated: approved', '2026-05-23 11:35:11.883149+07');
INSERT INTO public.order_status_logs (id, order_id, status, changed_by, notes, created_at) VALUES (60, 19, 'printing', 6, 'Semua desain disetujui, produksi dimulai', '2026-05-23 11:39:02.362185+07');
INSERT INTO public.order_status_logs (id, order_id, status, changed_by, notes, created_at) VALUES (61, 19, 'ready', 6, '', '2026-05-23 11:39:53.668976+07');
INSERT INTO public.order_status_logs (id, order_id, status, changed_by, notes, created_at) VALUES (62, 19, 'completed', 1, 'Order marked as completed by customer', '2026-05-23 11:40:06.653715+07');


--
-- TOC entry 5276 (class 0 OID 16666)
-- Dependencies: 242
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.orders (id, user_id, order_code, total_price, status, estimated_finish_date, created_at, updated_at) VALUES (2, 1, 'ORD-1775993503', 10000.00, 'cancelled', NULL, '2026-04-12 18:31:43.903156+07', NULL);
INSERT INTO public.orders (id, user_id, order_code, total_price, status, estimated_finish_date, created_at, updated_at) VALUES (18, 1, 'ORD-1779367470', 52000.00, 'waiting_payment', NULL, '2026-05-21 19:44:30.480402+07', NULL);
INSERT INTO public.orders (id, user_id, order_code, total_price, status, estimated_finish_date, created_at, updated_at) VALUES (12, 1, 'ORD-11779117146', 65000.00, 'design_review', NULL, '2026-05-18 22:12:26.871961+07', '2026-05-18 22:26:05.501035+07');
INSERT INTO public.orders (id, user_id, order_code, total_price, status, estimated_finish_date, created_at, updated_at) VALUES (4, 8, 'ORD-81776588502', 300000.00, 'cancelled', NULL, '2026-04-19 15:48:22.639101+07', '2026-04-19 16:10:52.208158+07');
INSERT INTO public.orders (id, user_id, order_code, total_price, status, estimated_finish_date, created_at, updated_at) VALUES (13, 1, 'ORD-1779121620', 15000.00, 'design_review', NULL, '2026-05-18 23:27:00.517047+07', '2026-05-18 23:29:57.944649+07');
INSERT INTO public.orders (id, user_id, order_code, total_price, status, estimated_finish_date, created_at, updated_at) VALUES (14, 1, 'ORD-1779133121', 60000.00, 'design_review', NULL, '2026-05-19 02:38:41.356514+07', '2026-05-19 19:07:56.730036+07');
INSERT INTO public.orders (id, user_id, order_code, total_price, status, estimated_finish_date, created_at, updated_at) VALUES (16, 1, 'ORD-1779246020', 52000.00, 'design_review', NULL, '2026-05-20 10:00:20.956798+07', '2026-05-20 10:26:11.910386+07');
INSERT INTO public.orders (id, user_id, order_code, total_price, status, estimated_finish_date, created_at, updated_at) VALUES (6, 8, 'ORD-81776590098', 100000.00, 'ready', NULL, '2026-04-19 16:14:58.30992+07', '2026-04-19 16:47:50.286293+07');
INSERT INTO public.orders (id, user_id, order_code, total_price, status, estimated_finish_date, created_at, updated_at) VALUES (1, 1, 'ORD-1775968238', 20000.00, 'printing', NULL, '2026-04-12 11:30:38.179732+07', '2026-04-25 10:55:17.071126+07');
INSERT INTO public.orders (id, user_id, order_code, total_price, status, estimated_finish_date, created_at, updated_at) VALUES (19, 1, 'ORD-1779505814', 15000.00, 'completed', NULL, '2026-05-23 10:10:14.349093+07', '2026-05-23 11:40:06.652383+07');
INSERT INTO public.orders (id, user_id, order_code, total_price, status, estimated_finish_date, created_at, updated_at) VALUES (7, 1, 'ORD-11777799976', 250000.00, 'completed', NULL, '2026-05-03 16:19:36.28367+07', '2026-05-03 17:06:23.773952+07');
INSERT INTO public.orders (id, user_id, order_code, total_price, status, estimated_finish_date, created_at, updated_at) VALUES (5, 8, 'ORD-1776589683', 100000.00, 'cancelled', NULL, '2026-04-19 16:08:03.200338+07', '2026-05-03 19:00:00.101753+07');
INSERT INTO public.orders (id, user_id, order_code, total_price, status, estimated_finish_date, created_at, updated_at) VALUES (8, 1, 'ORD-11779024336', 250000.00, 'printing', NULL, '2026-05-17 20:25:36.956323+07', '2026-05-17 20:58:28.643134+07');
INSERT INTO public.orders (id, user_id, order_code, total_price, status, estimated_finish_date, created_at, updated_at) VALUES (9, 1, 'ORD-11779073880', 300000.00, 'completed', NULL, '2026-05-18 10:11:20.386088+07', '2026-05-18 10:18:04.665349+07');
INSERT INTO public.orders (id, user_id, order_code, total_price, status, estimated_finish_date, created_at, updated_at) VALUES (10, 1, 'ORD-11779116501', 15000.00, 'waiting_payment', NULL, '2026-05-18 22:01:41.355718+07', NULL);
INSERT INTO public.orders (id, user_id, order_code, total_price, status, estimated_finish_date, created_at, updated_at) VALUES (11, 1, 'ORD-11779116812', 50000.00, 'cancelled', NULL, '2026-05-18 22:06:52.305862+07', '2026-05-18 22:16:02.361294+07');
INSERT INTO public.orders (id, user_id, order_code, total_price, status, estimated_finish_date, created_at, updated_at) VALUES (15, 1, 'ORD-1779134966', 500000.00, 'waiting_payment', NULL, '2026-05-19 03:09:26.867266+07', NULL);
INSERT INTO public.orders (id, user_id, order_code, total_price, status, estimated_finish_date, created_at, updated_at) VALUES (3, 1, 'ORD-11776086108', 50000.00, 'completed', NULL, '2026-04-13 20:15:08.876415+07', '2026-05-19 18:00:34.967145+07');
INSERT INTO public.orders (id, user_id, order_code, total_price, status, estimated_finish_date, created_at, updated_at) VALUES (17, 1, 'ORD-11779250158', 45000.00, 'waiting_payment', NULL, '2026-05-20 11:09:18.209107+07', NULL);


--
-- TOC entry 5260 (class 0 OID 16474)
-- Dependencies: 226
-- Data for Name: payment_methods; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.payment_methods (id, name) VALUES (1, 'BCA Transfer');
INSERT INTO public.payment_methods (id, name) VALUES (2, 'Mandiri Transfer');
INSERT INTO public.payment_methods (id, name) VALUES (3, 'QRIS');


--
-- TOC entry 5280 (class 0 OID 16710)
-- Dependencies: 246
-- Data for Name: payment_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.payment_transactions (id, order_id, payment_method_id, transaction_code, amount, payment_proof, payment_status, verified_by, verified_at, created_at) VALUES (1, 1, 1, NULL, 20000.00, 'bukti.jpg', 'approved', 2, '2026-04-12 12:11:23.496295+07', '2026-04-12 11:31:32.836609+07');
INSERT INTO public.payment_transactions (id, order_id, payment_method_id, transaction_code, amount, payment_proof, payment_status, verified_by, verified_at, created_at) VALUES (2, 2, 1, NULL, 10000.00, 'bukti.jpg', 'rejected', 2, '2026-04-12 18:32:47.765311+07', '2026-04-12 18:32:20.966972+07');
INSERT INTO public.payment_transactions (id, order_id, payment_method_id, transaction_code, amount, payment_proof, payment_status, verified_by, verified_at, created_at) VALUES (3, 3, 1, 'TF-BCA-123', 50000.00, 'bukti_transfer_oke.jpg', 'approved', 2, '2026-04-13 20:35:29.489692+07', '2026-04-13 20:21:56.288093+07');
INSERT INTO public.payment_transactions (id, order_id, payment_method_id, transaction_code, amount, payment_proof, payment_status, verified_by, verified_at, created_at) VALUES (4, 6, 1, '', 100000.00, 'bukti_transfer_final_banget.jpg', 'approved', 2, '2026-04-19 16:37:32.747242+07', '2026-04-19 16:18:23.079136+07');
INSERT INTO public.payment_transactions (id, order_id, payment_method_id, transaction_code, amount, payment_proof, payment_status, verified_by, verified_at, created_at) VALUES (6, 7, 1, 'TF-BCA-20260502-001', 250000.00, '/uploads/payments/1777801627_1.png', 'approved', 9, '2026-05-03 16:58:31.326764+07', '2026-05-03 16:47:07.184981+07');
INSERT INTO public.payment_transactions (id, order_id, payment_method_id, transaction_code, amount, payment_proof, payment_status, verified_by, verified_at, created_at) VALUES (7, 8, 1, 'AUTO-ORD-11779024336', 250000.00, '/uploads/payments/1779025003_Potoku1.png', 'approved', 9, '2026-05-17 20:37:20.859207+07', '2026-05-17 20:36:43.550452+07');
INSERT INTO public.payment_transactions (id, order_id, payment_method_id, transaction_code, amount, payment_proof, payment_status, verified_by, verified_at, created_at) VALUES (8, 9, 1, 'AUTO-ORD-11779073880', 300000.00, '/uploads/payments/1779073918_ERD-Salinan dari Halaman-1.drawio.png', 'approved', 9, '2026-05-18 10:12:32.734213+07', '2026-05-18 10:11:58.248983+07');
INSERT INTO public.payment_transactions (id, order_id, payment_method_id, transaction_code, amount, payment_proof, payment_status, verified_by, verified_at, created_at) VALUES (9, 12, 1, 'AUTO-ORD-11779117146', 65000.00, '/uploads/payments/1779117868_Class_diagram_digiprint-Page-1.drawio.png', 'approved', 9, '2026-05-18 22:26:05.501035+07', '2026-05-18 22:24:28.248037+07');
INSERT INTO public.payment_transactions (id, order_id, payment_method_id, transaction_code, amount, payment_proof, payment_status, verified_by, verified_at, created_at) VALUES (10, 13, 1, 'AUTO-ORD-1779121620', 15000.00, '/uploads/payments/1779121678_Class_diagram_digiprint-Page-1.drawio (1).png', 'approved', 9, '2026-05-18 23:29:57.944649+07', '2026-05-18 23:27:58.078158+07');
INSERT INTO public.payment_transactions (id, order_id, payment_method_id, transaction_code, amount, payment_proof, payment_status, verified_by, verified_at, created_at) VALUES (11, 14, 1, 'AUTO-ORD-1779133121', 60000.00, '/uploads/payments/1779190261_Potoku1.png', 'approved', 2, '2026-05-19 19:07:56.730036+07', '2026-05-19 18:31:01.221696+07');
INSERT INTO public.payment_transactions (id, order_id, payment_method_id, transaction_code, amount, payment_proof, payment_status, verified_by, verified_at, created_at) VALUES (15, 16, 1, 'AUTO-ORD-1779246020', 52000.00, '/uploads/payments/1779247544_ERD-Salinan dari Halaman-1.drawio.png', 'approved', 2, '2026-05-20 10:26:11.910386+07', '2026-05-20 10:25:44.655715+07');
INSERT INTO public.payment_transactions (id, order_id, payment_method_id, transaction_code, amount, payment_proof, payment_status, verified_by, verified_at, created_at) VALUES (17, 19, 1, 'AUTO-ORD-1779505814', 15000.00, '/uploads/payments/1779510873_Screenshot 2026-05-16 094049.png', 'approved', 2, '2026-05-23 11:35:11.883149+07', '2026-05-23 11:34:33.415243+07');


--
-- TOC entry 5292 (class 0 OID 16869)
-- Dependencies: 258
-- Data for Name: product_variants; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.product_variants (id, product_id, sku, variant_name, price, stock, is_active, created_at, updated_at, material_id, material_usage) VALUES (1, 1, 'BANN-001', 'Glossy Premium', 50000.00, 100, true, '2026-04-19 15:38:10.814322+07', '2026-04-19 15:38:10.814322+07', 1, 1.00);
INSERT INTO public.product_variants (id, product_id, sku, variant_name, price, stock, is_active, created_at, updated_at, material_id, material_usage) VALUES (2, 2, 'POST-001', 'A3 Glossy', 15000.00, 50, true, '2026-04-19 15:38:10.814322+07', '2026-04-19 15:38:10.814322+07', 1, 0.50);
INSERT INTO public.product_variants (id, product_id, sku, variant_name, price, stock, is_active, created_at, updated_at, material_id, material_usage) VALUES (3, 4, 'BRS-A4-GLS-150', 'Glossy 150gsm', 50000.00, 0, true, '2026-04-24 10:46:48.364675+07', '2026-04-24 10:46:48.364675+07', NULL, 0.00);
INSERT INTO public.product_variants (id, product_id, sku, variant_name, price, stock, is_active, created_at, updated_at, material_id, material_usage) VALUES (4, 4, 'BRS-A4-MTT-150', 'Matte 150gsm', 52000.00, 0, true, '2026-04-24 10:46:48.364675+07', '2026-04-24 10:46:48.364675+07', NULL, 0.00);


--
-- TOC entry 5284 (class 0 OID 16764)
-- Dependencies: 250
-- Data for Name: production_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.production_logs (id, order_id, start_time, end_time, notes, created_at, staff_id) VALUES (2, 3, '2026-04-14 12:27:01.373038+07', '2026-04-14 12:27:59.914835+07', 'Budi mulai cetak banner di Mesin Epson A | Hasil cetak tajam, sudah dilaminasi doff. Siap dijemput!', '2026-04-14 12:27:01.363604+07', 6);
INSERT INTO public.production_logs (id, order_id, start_time, end_time, notes, created_at, staff_id) VALUES (3, 6, '2026-04-19 16:46:33.639384+07', '2026-04-19 16:47:50.29392+07', ' | ', '2026-04-19 16:46:33.618926+07', 2);
INSERT INTO public.production_logs (id, order_id, start_time, end_time, notes, created_at, staff_id) VALUES (4, 1, '2026-04-25 10:55:17.08274+07', NULL, '', '2026-04-25 10:55:17.012129+07', 9);
INSERT INTO public.production_logs (id, order_id, start_time, end_time, notes, created_at, staff_id) VALUES (5, 7, '2026-05-03 17:00:23.719814+07', '2026-05-03 17:02:08.671217+07', 'Mulai cetak di Mesin Epson A, target selesai hari ini | Hasil cetak tajam, warna sangat akurat. Barang sudah di-packing rapi dan siap dijemput di kasir!', '2026-05-03 17:00:23.717042+07', 9);
INSERT INTO public.production_logs (id, order_id, start_time, end_time, notes, created_at, staff_id) VALUES (6, 8, '2026-05-17 20:58:28.656607+07', NULL, '', '2026-05-17 20:58:28.64264+07', 9);
INSERT INTO public.production_logs (id, order_id, start_time, end_time, notes, created_at, staff_id) VALUES (7, 9, '2026-05-18 10:16:36.339933+07', '2026-05-18 10:16:47.78797+07', ' | ', '2026-05-18 10:16:36.333266+07', 9);


--
-- TOC entry 5270 (class 0 OID 16548)
-- Dependencies: 236
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.products (id, category_id, name, description, base_price, estimated_days, is_active, created_at, updated_at, deleted_at, image) VALUES (1, 1, 'Banner', 'Cetak banner', 10000.00, 1, true, '2026-04-11 20:46:08.602471+07', NULL, NULL, NULL);
INSERT INTO public.products (id, category_id, name, description, base_price, estimated_days, is_active, created_at, updated_at, deleted_at, image) VALUES (2, 1, 'Poster', 'Cetak poster', 5000.00, 1, true, '2026-04-11 20:46:08.602471+07', NULL, NULL, NULL);
INSERT INTO public.products (id, category_id, name, description, base_price, estimated_days, is_active, created_at, updated_at, deleted_at, image) VALUES (4, 1, 'Brosur A4 Premium', 'Cetak brosur full color kertas tebal', 50000.00, 2, true, '2026-04-24 10:46:48.364675+07', NULL, NULL, NULL);


--
-- TOC entry 5254 (class 0 OID 16432)
-- Dependencies: 220
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.roles (id, name) VALUES (1, 'owner');
INSERT INTO public.roles (id, name) VALUES (2, 'staff');
INSERT INTO public.roles (id, name) VALUES (3, 'customer');


--
-- TOC entry 5262 (class 0 OID 16483)
-- Dependencies: 228
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.users (id, role_id, name, email, password, phone, is_active, created_at, updated_at, deleted_at) VALUES (2, 1, 'Admin', 'admin@gmail.com', '$2a$10$AnPTNgJRZ7pP.geGAL9iButov3uMfJyMAXkqjTgZzGbAEpxSqU8lq', NULL, true, '2026-04-11 20:44:04.838091+07', NULL, NULL);
INSERT INTO public.users (id, role_id, name, email, password, phone, is_active, created_at, updated_at, deleted_at) VALUES (3, 3, 'test user', 'test@gmail.com', '$2a$10$8VBlqVbKSm0dWBvhq3kYIus5YdNcx0Z9FLlgZKmhwZl2LKtMAg0QK', NULL, true, '2026-04-12 17:58:36.132668+07', NULL, NULL);
INSERT INTO public.users (id, role_id, name, email, password, phone, is_active, created_at, updated_at, deleted_at) VALUES (4, 3, 'audit test', 'audit@gmail.com', '$2a$10$hxPb3dBfOMy/EY7d9gzLCOtV47Q664qc8fPWIP14a4m7hIIfF3WKW', NULL, true, '2026-04-12 19:29:49.098263+07', NULL, NULL);
INSERT INTO public.users (id, role_id, name, email, password, phone, is_active, created_at, updated_at, deleted_at) VALUES (5, 3, 'audit fix', 'auditfix@gmail.com', '$2a$10$JoFjZMf7c9HhjKoIDovRlO8U0GIiPtyC.su.urNjkUodQtzPLHlsy', NULL, true, '2026-04-12 20:12:46.624513+07', NULL, NULL);
INSERT INTO public.users (id, role_id, name, email, password, phone, is_active, created_at, updated_at, deleted_at) VALUES (6, 2, 'Budi Mesin', 'budi@jayamandiri.com', '$2a$10$TrMpTavmC7sLHtHfnHkWKON3Li8SikqWXEzUdhkfLTsfnbEzSeGSe', NULL, true, '2026-04-14 12:14:27.845042+07', NULL, NULL);
INSERT INTO public.users (id, role_id, name, email, password, phone, is_active, created_at, updated_at, deleted_at) VALUES (7, 2, 'Siti Admin', 'siti@jayamandiri.com', '$2a$10$UuRqQCIdI2WMfIrsaiQJAeWeEXiyBklYQ7uYlySjRNgelRrklvSgq', NULL, true, '2026-04-14 13:32:35.777676+07', NULL, NULL);
INSERT INTO public.users (id, role_id, name, email, password, phone, is_active, created_at, updated_at, deleted_at) VALUES (8, 3, 'Budi', 'budi@test.com', '$2a$10$zK0qxnp.Er8qEV/05Rxz9OyUCvZlntOUWDiWyWIKCSczcTCUaKYEe', NULL, true, '2026-04-19 14:54:34.684471+07', NULL, NULL);
INSERT INTO public.users (id, role_id, name, email, password, phone, is_active, created_at, updated_at, deleted_at) VALUES (9, 2, 'Andi Staff Produksi', 'andi@jayamandiri.com', '$2a$10$zF7MVSijR7Ad06nj97nF2ehsymBxBBnahPCdiLdx18Dts53tb19oq', NULL, true, '2026-04-19 16:29:30.793069+07', NULL, NULL);
INSERT INTO public.users (id, role_id, name, email, password, phone, is_active, created_at, updated_at, deleted_at) VALUES (10, 3, 'User Tester', 'tester1@example.com', '$2a$10$mXc3BV7XTG4C6MO7hDBBxe5Q9N/auc77G660l5QqwhHux6ytoATmm', NULL, true, '2026-04-23 22:17:12.207178+07', NULL, NULL);
INSERT INTO public.users (id, role_id, name, email, password, phone, is_active, created_at, updated_at, deleted_at) VALUES (1, 3, 'Faisal Ramdhani', 'customer@gmail.com', '$2a$10$AnPTNgJRZ7pP.geGAL9iButov3uMfJyMAXkqjTgZzGbAEpxSqU8lq', '811445580057', true, '2026-04-11 20:44:04.838091+07', '2026-05-19 17:30:17.918173+07', NULL);


--
-- TOC entry 5361 (class 0 OID 0)
-- Dependencies: 233
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 236, true);


--
-- TOC entry 5362 (class 0 OID 0)
-- Dependencies: 239
-- Name: cart_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cart_items_id_seq', 20, true);


--
-- TOC entry 5363 (class 0 OID 0)
-- Dependencies: 237
-- Name: carts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.carts_id_seq', 3, true);


--
-- TOC entry 5364 (class 0 OID 0)
-- Dependencies: 221
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_id_seq', 9, true);


--
-- TOC entry 5365 (class 0 OID 0)
-- Dependencies: 253
-- Name: design_files_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.design_files_id_seq', 24, true);


--
-- TOC entry 5366 (class 0 OID 0)
-- Dependencies: 255
-- Name: design_reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.design_reviews_id_seq', 9, true);


--
-- TOC entry 5367 (class 0 OID 0)
-- Dependencies: 231
-- Name: login_attempts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.login_attempts_id_seq', 1, false);


--
-- TOC entry 5368 (class 0 OID 0)
-- Dependencies: 229
-- Name: login_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.login_logs_id_seq', 119, true);


--
-- TOC entry 5369 (class 0 OID 0)
-- Dependencies: 251
-- Name: material_stock_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.material_stock_logs_id_seq', 8, true);


--
-- TOC entry 5370 (class 0 OID 0)
-- Dependencies: 223
-- Name: materials_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.materials_id_seq', 3, true);


--
-- TOC entry 5371 (class 0 OID 0)
-- Dependencies: 243
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_items_id_seq', 22, true);


--
-- TOC entry 5372 (class 0 OID 0)
-- Dependencies: 247
-- Name: order_status_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_status_logs_id_seq', 62, true);


--
-- TOC entry 5373 (class 0 OID 0)
-- Dependencies: 241
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orders_id_seq', 19, true);


--
-- TOC entry 5374 (class 0 OID 0)
-- Dependencies: 225
-- Name: payment_methods_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payment_methods_id_seq', 1, false);


--
-- TOC entry 5375 (class 0 OID 0)
-- Dependencies: 245
-- Name: payment_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payment_transactions_id_seq', 17, true);


--
-- TOC entry 5376 (class 0 OID 0)
-- Dependencies: 257
-- Name: product_variants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_variants_id_seq', 4, true);


--
-- TOC entry 5377 (class 0 OID 0)
-- Dependencies: 249
-- Name: production_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.production_logs_id_seq', 7, true);


--
-- TOC entry 5378 (class 0 OID 0)
-- Dependencies: 235
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_id_seq', 4, true);


--
-- TOC entry 5379 (class 0 OID 0)
-- Dependencies: 219
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 1, false);


--
-- TOC entry 5380 (class 0 OID 0)
-- Dependencies: 227
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 10, true);


--
-- TOC entry 5037 (class 2606 OID 16541)
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 5046 (class 2606 OID 16654)
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);


--
-- TOC entry 5041 (class 2606 OID 16634)
-- Name: carts carts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_pkey PRIMARY KEY (id);


--
-- TOC entry 5043 (class 2606 OID 16636)
-- Name: carts carts_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_user_id_key UNIQUE (user_id);


--
-- TOC entry 5023 (class 2606 OID 16451)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- TOC entry 5068 (class 2606 OID 16817)
-- Name: design_files design_files_order_item_id_version_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.design_files
    ADD CONSTRAINT design_files_order_item_id_version_key UNIQUE (order_item_id, version);


--
-- TOC entry 5070 (class 2606 OID 16815)
-- Name: design_files design_files_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.design_files
    ADD CONSTRAINT design_files_pkey PRIMARY KEY (id);


--
-- TOC entry 5072 (class 2606 OID 16841)
-- Name: design_reviews design_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.design_reviews
    ADD CONSTRAINT design_reviews_pkey PRIMARY KEY (id);


--
-- TOC entry 5035 (class 2606 OID 16529)
-- Name: login_attempts login_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.login_attempts
    ADD CONSTRAINT login_attempts_pkey PRIMARY KEY (id);


--
-- TOC entry 5033 (class 2606 OID 16515)
-- Name: login_logs login_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.login_logs
    ADD CONSTRAINT login_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 5066 (class 2606 OID 16797)
-- Name: material_stock_logs material_stock_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.material_stock_logs
    ADD CONSTRAINT material_stock_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 5025 (class 2606 OID 16462)
-- Name: materials materials_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materials
    ADD CONSTRAINT materials_pkey PRIMARY KEY (id);


--
-- TOC entry 5055 (class 2606 OID 16698)
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- TOC entry 5062 (class 2606 OID 16752)
-- Name: order_status_logs order_status_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_status_logs
    ADD CONSTRAINT order_status_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 5050 (class 2606 OID 16679)
-- Name: orders orders_order_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_code_key UNIQUE (order_code);


--
-- TOC entry 5052 (class 2606 OID 16677)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- TOC entry 5027 (class 2606 OID 16481)
-- Name: payment_methods payment_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_methods
    ADD CONSTRAINT payment_methods_pkey PRIMARY KEY (id);


--
-- TOC entry 5058 (class 2606 OID 16721)
-- Name: payment_transactions payment_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_pkey PRIMARY KEY (id);


--
-- TOC entry 5060 (class 2606 OID 16723)
-- Name: payment_transactions payment_transactions_transaction_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_transaction_code_key UNIQUE (transaction_code);


--
-- TOC entry 5076 (class 2606 OID 16883)
-- Name: product_variants product_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_pkey PRIMARY KEY (id);


--
-- TOC entry 5078 (class 2606 OID 16885)
-- Name: product_variants product_variants_sku_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_sku_key UNIQUE (sku);


--
-- TOC entry 5064 (class 2606 OID 16775)
-- Name: production_logs production_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.production_logs
    ADD CONSTRAINT production_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 5039 (class 2606 OID 16561)
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- TOC entry 5019 (class 2606 OID 16441)
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- TOC entry 5021 (class 2606 OID 16439)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- TOC entry 5074 (class 2606 OID 16908)
-- Name: design_reviews unique_review_per_file; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.design_reviews
    ADD CONSTRAINT unique_review_per_file UNIQUE (design_file_id);


--
-- TOC entry 5029 (class 2606 OID 16497)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 5031 (class 2606 OID 16495)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 5044 (class 1259 OID 16855)
-- Name: idx_cart_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cart_user_id ON public.carts USING btree (user_id);


--
-- TOC entry 5053 (class 1259 OID 16856)
-- Name: idx_order_items_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_items_order_id ON public.order_items USING btree (order_id);


--
-- TOC entry 5047 (class 1259 OID 16853)
-- Name: idx_orders_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_status ON public.orders USING btree (status);


--
-- TOC entry 5048 (class 1259 OID 16852)
-- Name: idx_orders_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_user_id ON public.orders USING btree (user_id);


--
-- TOC entry 5056 (class 1259 OID 16854)
-- Name: idx_payment_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_order_id ON public.payment_transactions USING btree (order_id);


--
-- TOC entry 5081 (class 2606 OID 16542)
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 5084 (class 2606 OID 16655)
-- Name: cart_items cart_items_cart_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_cart_id_fkey FOREIGN KEY (cart_id) REFERENCES public.carts(id);


--
-- TOC entry 5085 (class 2606 OID 16660)
-- Name: cart_items cart_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- TOC entry 5086 (class 2606 OID 16891)
-- Name: cart_items cart_items_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON DELETE CASCADE;


--
-- TOC entry 5083 (class 2606 OID 16637)
-- Name: carts carts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 5099 (class 2606 OID 16818)
-- Name: design_files design_files_order_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.design_files
    ADD CONSTRAINT design_files_order_item_id_fkey FOREIGN KEY (order_item_id) REFERENCES public.order_items(id);


--
-- TOC entry 5100 (class 2606 OID 16823)
-- Name: design_files design_files_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.design_files
    ADD CONSTRAINT design_files_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- TOC entry 5101 (class 2606 OID 16902)
-- Name: design_reviews design_reviews_design_file_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.design_reviews
    ADD CONSTRAINT design_reviews_design_file_id_fkey FOREIGN KEY (design_file_id) REFERENCES public.design_files(id) ON DELETE CASCADE;


--
-- TOC entry 5102 (class 2606 OID 16847)
-- Name: design_reviews design_reviews_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.design_reviews
    ADD CONSTRAINT design_reviews_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id);


--
-- TOC entry 5080 (class 2606 OID 16516)
-- Name: login_logs login_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.login_logs
    ADD CONSTRAINT login_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 5098 (class 2606 OID 16798)
-- Name: material_stock_logs material_stock_logs_material_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.material_stock_logs
    ADD CONSTRAINT material_stock_logs_material_id_fkey FOREIGN KEY (material_id) REFERENCES public.materials(id);


--
-- TOC entry 5088 (class 2606 OID 16699)
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- TOC entry 5089 (class 2606 OID 16704)
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- TOC entry 5090 (class 2606 OID 16896)
-- Name: order_items order_items_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON DELETE CASCADE;


--
-- TOC entry 5094 (class 2606 OID 16758)
-- Name: order_status_logs order_status_logs_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_status_logs
    ADD CONSTRAINT order_status_logs_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.users(id);


--
-- TOC entry 5095 (class 2606 OID 16753)
-- Name: order_status_logs order_status_logs_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_status_logs
    ADD CONSTRAINT order_status_logs_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- TOC entry 5087 (class 2606 OID 16680)
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 5091 (class 2606 OID 16724)
-- Name: payment_transactions payment_transactions_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- TOC entry 5092 (class 2606 OID 16729)
-- Name: payment_transactions payment_transactions_payment_method_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_payment_method_id_fkey FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id);


--
-- TOC entry 5093 (class 2606 OID 16734)
-- Name: payment_transactions payment_transactions_verified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES public.users(id);


--
-- TOC entry 5103 (class 2606 OID 16910)
-- Name: product_variants product_variants_material_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_material_id_fkey FOREIGN KEY (material_id) REFERENCES public.materials(id);


--
-- TOC entry 5104 (class 2606 OID 16886)
-- Name: product_variants product_variants_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- TOC entry 5096 (class 2606 OID 16776)
-- Name: production_logs production_logs_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.production_logs
    ADD CONSTRAINT production_logs_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- TOC entry 5097 (class 2606 OID 16863)
-- Name: production_logs production_logs_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.production_logs
    ADD CONSTRAINT production_logs_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.users(id);


--
-- TOC entry 5082 (class 2606 OID 16562)
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- TOC entry 5079 (class 2606 OID 16498)
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- TOC entry 5299 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO printing_user;


--
-- TOC entry 5300 (class 0 OID 0)
-- Dependencies: 234
-- Name: TABLE audit_logs; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.audit_logs TO printing_user;


--
-- TOC entry 5302 (class 0 OID 0)
-- Dependencies: 233
-- Name: SEQUENCE audit_logs_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.audit_logs_id_seq TO printing_user;


--
-- TOC entry 5303 (class 0 OID 0)
-- Dependencies: 240
-- Name: TABLE cart_items; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.cart_items TO printing_user;


--
-- TOC entry 5305 (class 0 OID 0)
-- Dependencies: 239
-- Name: SEQUENCE cart_items_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.cart_items_id_seq TO printing_user;


--
-- TOC entry 5306 (class 0 OID 0)
-- Dependencies: 238
-- Name: TABLE carts; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.carts TO printing_user;


--
-- TOC entry 5308 (class 0 OID 0)
-- Dependencies: 237
-- Name: SEQUENCE carts_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.carts_id_seq TO printing_user;


--
-- TOC entry 5309 (class 0 OID 0)
-- Dependencies: 222
-- Name: TABLE categories; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.categories TO printing_user;


--
-- TOC entry 5311 (class 0 OID 0)
-- Dependencies: 221
-- Name: SEQUENCE categories_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.categories_id_seq TO printing_user;


--
-- TOC entry 5312 (class 0 OID 0)
-- Dependencies: 254
-- Name: TABLE design_files; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.design_files TO printing_user;


--
-- TOC entry 5314 (class 0 OID 0)
-- Dependencies: 253
-- Name: SEQUENCE design_files_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.design_files_id_seq TO printing_user;


--
-- TOC entry 5315 (class 0 OID 0)
-- Dependencies: 256
-- Name: TABLE design_reviews; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.design_reviews TO printing_user;


--
-- TOC entry 5317 (class 0 OID 0)
-- Dependencies: 255
-- Name: SEQUENCE design_reviews_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.design_reviews_id_seq TO printing_user;


--
-- TOC entry 5318 (class 0 OID 0)
-- Dependencies: 232
-- Name: TABLE login_attempts; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.login_attempts TO printing_user;


--
-- TOC entry 5320 (class 0 OID 0)
-- Dependencies: 231
-- Name: SEQUENCE login_attempts_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.login_attempts_id_seq TO printing_user;


--
-- TOC entry 5321 (class 0 OID 0)
-- Dependencies: 230
-- Name: TABLE login_logs; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.login_logs TO printing_user;


--
-- TOC entry 5323 (class 0 OID 0)
-- Dependencies: 229
-- Name: SEQUENCE login_logs_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.login_logs_id_seq TO printing_user;


--
-- TOC entry 5324 (class 0 OID 0)
-- Dependencies: 252
-- Name: TABLE material_stock_logs; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.material_stock_logs TO printing_user;


--
-- TOC entry 5326 (class 0 OID 0)
-- Dependencies: 251
-- Name: SEQUENCE material_stock_logs_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.material_stock_logs_id_seq TO printing_user;


--
-- TOC entry 5327 (class 0 OID 0)
-- Dependencies: 224
-- Name: TABLE materials; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.materials TO printing_user;


--
-- TOC entry 5329 (class 0 OID 0)
-- Dependencies: 223
-- Name: SEQUENCE materials_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.materials_id_seq TO printing_user;


--
-- TOC entry 5330 (class 0 OID 0)
-- Dependencies: 244
-- Name: TABLE order_items; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.order_items TO printing_user;


--
-- TOC entry 5332 (class 0 OID 0)
-- Dependencies: 243
-- Name: SEQUENCE order_items_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.order_items_id_seq TO printing_user;


--
-- TOC entry 5333 (class 0 OID 0)
-- Dependencies: 248
-- Name: TABLE order_status_logs; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.order_status_logs TO printing_user;


--
-- TOC entry 5335 (class 0 OID 0)
-- Dependencies: 247
-- Name: SEQUENCE order_status_logs_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.order_status_logs_id_seq TO printing_user;


--
-- TOC entry 5336 (class 0 OID 0)
-- Dependencies: 242
-- Name: TABLE orders; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.orders TO printing_user;


--
-- TOC entry 5338 (class 0 OID 0)
-- Dependencies: 241
-- Name: SEQUENCE orders_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.orders_id_seq TO printing_user;


--
-- TOC entry 5339 (class 0 OID 0)
-- Dependencies: 226
-- Name: TABLE payment_methods; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.payment_methods TO printing_user;


--
-- TOC entry 5341 (class 0 OID 0)
-- Dependencies: 225
-- Name: SEQUENCE payment_methods_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.payment_methods_id_seq TO printing_user;


--
-- TOC entry 5342 (class 0 OID 0)
-- Dependencies: 246
-- Name: TABLE payment_transactions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.payment_transactions TO printing_user;


--
-- TOC entry 5344 (class 0 OID 0)
-- Dependencies: 245
-- Name: SEQUENCE payment_transactions_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.payment_transactions_id_seq TO printing_user;


--
-- TOC entry 5345 (class 0 OID 0)
-- Dependencies: 258
-- Name: TABLE product_variants; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.product_variants TO printing_user;


--
-- TOC entry 5347 (class 0 OID 0)
-- Dependencies: 257
-- Name: SEQUENCE product_variants_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.product_variants_id_seq TO printing_user;


--
-- TOC entry 5348 (class 0 OID 0)
-- Dependencies: 250
-- Name: TABLE production_logs; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.production_logs TO printing_user;


--
-- TOC entry 5350 (class 0 OID 0)
-- Dependencies: 249
-- Name: SEQUENCE production_logs_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.production_logs_id_seq TO printing_user;


--
-- TOC entry 5351 (class 0 OID 0)
-- Dependencies: 236
-- Name: TABLE products; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.products TO printing_user;


--
-- TOC entry 5353 (class 0 OID 0)
-- Dependencies: 235
-- Name: SEQUENCE products_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.products_id_seq TO printing_user;


--
-- TOC entry 5354 (class 0 OID 0)
-- Dependencies: 220
-- Name: TABLE roles; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.roles TO printing_user;


--
-- TOC entry 5356 (class 0 OID 0)
-- Dependencies: 219
-- Name: SEQUENCE roles_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.roles_id_seq TO printing_user;


--
-- TOC entry 5357 (class 0 OID 0)
-- Dependencies: 228
-- Name: TABLE users; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.users TO printing_user;


--
-- TOC entry 5359 (class 0 OID 0)
-- Dependencies: 227
-- Name: SEQUENCE users_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.users_id_seq TO printing_user;


--
-- TOC entry 5360 (class 0 OID 0)
-- Dependencies: 259
-- Name: TABLE v_users; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.v_users TO printing_user;


--
-- TOC entry 2166 (class 826 OID 16858)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT,INSERT,DELETE,UPDATE ON TABLES TO printing_user;


-- Completed on 2026-05-23 11:53:18

--
-- PostgreSQL database dump complete
--


