--
-- PostgreSQL database dump
--

\restrict 7XyVyqd7zDE7TTdtbUyx0aNfgmAMu8Pnejfg86igbCLwBgMELzYh1EP1fYuxEUP

-- Dumped from database version 15.14 (Debian 15.14-1.pgdg13+1)
-- Dumped by pg_dump version 15.14 (Debian 15.14-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assignments (
    id integer NOT NULL,
    student_id uuid,
    word_id uuid,
    assigned_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.assignments_id_seq OWNED BY public.assignments.id;


--
-- Name: notes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notes (
    id integer NOT NULL,
    student_id uuid,
    content text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: notes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notes_id_seq OWNED BY public.notes.id;


--
-- Name: progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.progress (
    id integer NOT NULL,
    student_id uuid,
    word_id uuid,
    level character varying(20) NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    notes text,
    for_review boolean DEFAULT true,
    CONSTRAINT progress_level_check CHECK (((level)::text = ANY ((ARRAY['Input'::character varying, 'Comprehension'::character varying, 'Imitation'::character varying, 'Prompted'::character varying, 'Spontaneous'::character varying])::text[])))
);


--
-- Name: progress_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.progress_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: progress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.progress_id_seq OWNED BY public.progress.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    id integer NOT NULL,
    user_id integer,
    skill text NOT NULL,
    minutes integer NOT NULL,
    confidence integer,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sessions_id_seq OWNED BY public.sessions.id;


--
-- Name: student_parent_association; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_parent_association (
    student_id uuid NOT NULL,
    parent_id integer NOT NULL
);


--
-- Name: students; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.students (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    school character varying(100),
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    date_of_birth date,
    claim_code character varying(8) NOT NULL,
    avatar_url character varying(255) DEFAULT '/resources/img/default_user.png'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    first_name character varying(100),
    last_name character varying(100),
    email text NOT NULL,
    password text NOT NULL,
    role character varying(20) NOT NULL,
    avatar_url character varying(255) DEFAULT '/resources/img/default_user.png'::character varying,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['teacher'::character varying, 'parent'::character varying])::text[])))
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: words; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.words (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    category character varying(50) NOT NULL,
    word character varying(100) NOT NULL,
    level character varying(20),
    image_link text,
    video_link text,
    custom_image_boolean boolean DEFAULT false,
    custom_image_link text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: assignments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assignments ALTER COLUMN id SET DEFAULT nextval('public.assignments_id_seq'::regclass);


--
-- Name: notes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notes ALTER COLUMN id SET DEFAULT nextval('public.notes_id_seq'::regclass);


--
-- Name: progress id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.progress ALTER COLUMN id SET DEFAULT nextval('public.progress_id_seq'::regclass);


--
-- Name: sessions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions ALTER COLUMN id SET DEFAULT nextval('public.sessions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: assignments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.assignments (id, student_id, word_id, assigned_at) FROM stdin;
\.


--
-- Data for Name: notes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notes (id, student_id, content, created_at) FROM stdin;
\.


--
-- Data for Name: progress; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.progress (id, student_id, word_id, level, updated_at, notes, for_review) FROM stdin;
23	30239d72-7996-4271-aeb7-1398258ddb54	230a428a-7f46-4e53-810e-9f72338d3d98	Prompted	2025-09-14 05:44:49.366051	\N	\N
27	30239d72-7996-4271-aeb7-1398258ddb54	29266a1b-c405-43b9-a9a4-43d7ff3c0fcd	Prompted	2025-09-14 05:44:49.366051	\N	\N
42	30239d72-7996-4271-aeb7-1398258ddb54	42d23349-3d60-4d55-b180-26535f6c9486	Prompted	2025-09-14 05:44:49.366051	\N	\N
46	30239d72-7996-4271-aeb7-1398258ddb54	4e9225bb-2231-42c7-a043-49e632b1f5fc	Prompted	2025-09-14 05:44:49.366051	\N	\N
48	30239d72-7996-4271-aeb7-1398258ddb54	50a05e0a-c564-46cd-82e2-ce2589ee1ad2	Prompted	2025-09-14 05:44:49.366051	\N	\N
50	30239d72-7996-4271-aeb7-1398258ddb54	5415cafe-de12-44d7-b5f3-590801356411	Prompted	2025-09-14 05:44:49.366051	\N	\N
51	30239d72-7996-4271-aeb7-1398258ddb54	54eb2a4e-69d7-4fd4-b777-86628228d302	Prompted	2025-09-14 05:44:49.366051	\N	\N
60	30239d72-7996-4271-aeb7-1398258ddb54	74dc6913-2c2f-4891-9ec2-e35f238229fe	Prompted	2025-09-14 05:44:49.366051	\N	\N
62	30239d72-7996-4271-aeb7-1398258ddb54	76b530e9-e6f6-4884-a0f1-d24894f56333	Prompted	2025-09-14 05:44:49.366051	\N	\N
69	30239d72-7996-4271-aeb7-1398258ddb54	89d65a15-ba40-44d2-a3aa-be41da7e84ce	Prompted	2025-09-14 05:44:49.366051	\N	\N
74	30239d72-7996-4271-aeb7-1398258ddb54	9a63c82c-c1ee-4775-a765-e870130040eb	Prompted	2025-09-14 05:44:49.366051	\N	\N
78	30239d72-7996-4271-aeb7-1398258ddb54	9dc597a7-2f0e-4730-9ac5-bc1de44f3753	Prompted	2025-09-14 05:44:49.366051	\N	\N
79	30239d72-7996-4271-aeb7-1398258ddb54	9ea7c7f0-06c4-4113-a40d-2bea0b5fdea9	Prompted	2025-09-14 05:44:49.366051	\N	\N
85	30239d72-7996-4271-aeb7-1398258ddb54	aceac11b-7da8-4c3d-bce4-eaaeffb1db6e	Prompted	2025-09-14 05:44:49.366051	\N	\N
97	30239d72-7996-4271-aeb7-1398258ddb54	dbe5277b-10ba-4fd8-b51f-4cdb323915e6	Prompted	2025-09-14 05:44:49.366051	\N	\N
33	30239d72-7996-4271-aeb7-1398258ddb54	30fb0650-435a-41d5-9c82-ddd77623716f	Spontaneous	2025-09-15 03:31:30.30506	\N	f
92	30239d72-7996-4271-aeb7-1398258ddb54	c2512927-f267-4eb8-9093-d66f0b6e0efa	Spontaneous	2025-09-15 03:38:09.979113	\N	f
81	30239d72-7996-4271-aeb7-1398258ddb54	a1787c34-00d4-4fca-8d29-5d165cd70ef8	Spontaneous	2025-09-15 03:38:09.979445	\N	f
76	30239d72-7996-4271-aeb7-1398258ddb54	9c09cafa-3442-4c72-9332-ed378d359c17	Spontaneous	2025-09-15 03:38:09.97991	\N	f
54	30239d72-7996-4271-aeb7-1398258ddb54	66b62167-d95b-4edd-b3e0-64f6626a921c	Spontaneous	2025-09-15 03:38:09.9802	\N	f
55	30239d72-7996-4271-aeb7-1398258ddb54	689d65a2-c186-428b-ab26-3034ac793c2b	Spontaneous	2025-09-15 03:38:09.980572	\N	f
56	30239d72-7996-4271-aeb7-1398258ddb54	6b0df44d-7d3e-4428-9b0f-c0f26efef800	Spontaneous	2025-09-15 03:38:09.983671	\N	f
90	30239d72-7996-4271-aeb7-1398258ddb54	bab00729-e54c-409e-9157-d7039ffaf4e4	Spontaneous	2025-09-15 03:38:09.990866	\N	f
31	30239d72-7996-4271-aeb7-1398258ddb54	2ef88fdb-8f62-43b8-afef-d708c89620bc	Spontaneous	2025-09-15 03:38:19.12461	\N	f
1	30239d72-7996-4271-aeb7-1398258ddb54	03b9ce61-3faf-4d00-90c0-dcd6533eba8f	Spontaneous	2025-09-15 03:38:19.125003	\N	f
29	30239d72-7996-4271-aeb7-1398258ddb54	2c06f364-4893-4e88-8299-ce0b42d6b6cd	Spontaneous	2025-09-15 03:38:22.271811	\N	f
20	30239d72-7996-4271-aeb7-1398258ddb54	204f1af0-ee77-45be-9551-6f4e17eb21a2	Spontaneous	2025-09-15 03:38:22.297921	\N	f
93	30239d72-7996-4271-aeb7-1398258ddb54	c2ac9715-d90a-4fec-8549-f60b828d0e88	Spontaneous	2025-09-15 03:38:22.298264	\N	f
95	30239d72-7996-4271-aeb7-1398258ddb54	ca8abdd1-0da9-4163-8c09-d075167ba423	Spontaneous	2025-09-15 03:38:22.309567	\N	f
24	30239d72-7996-4271-aeb7-1398258ddb54	230b767f-f247-4974-bdf4-3120d0b808e3	Spontaneous	2025-09-15 03:38:22.314231	\N	f
2	30239d72-7996-4271-aeb7-1398258ddb54	03c8ec69-c9d8-4cd1-9928-89f6947b85da	Spontaneous	2025-09-15 03:38:22.318752	\N	f
39	30239d72-7996-4271-aeb7-1398258ddb54	3b2c59cd-4f0e-4e6b-8799-d8332127d365	Spontaneous	2025-09-15 03:38:22.319031	\N	f
94	30239d72-7996-4271-aeb7-1398258ddb54	c2c3fb2a-a395-4944-b9c0-d886d0272832	Spontaneous	2025-09-15 03:38:22.321564	\N	f
6	30239d72-7996-4271-aeb7-1398258ddb54	0a5f00a7-8e89-4f05-a74d-6701407bac19	Spontaneous	2025-09-15 03:38:22.324363	\N	f
15	30239d72-7996-4271-aeb7-1398258ddb54	16ef0144-9188-41e2-ac83-c83984674af9	Spontaneous	2025-09-15 03:38:22.327207	\N	f
18	30239d72-7996-4271-aeb7-1398258ddb54	1dbdec36-95a4-4cf0-bd25-5946015f0f20	Spontaneous	2025-09-15 03:38:22.329863	\N	f
30	30239d72-7996-4271-aeb7-1398258ddb54	2eac304d-818a-44f9-bc51-31ccb873fbca	Spontaneous	2025-09-15 03:38:25.221975	\N	f
88	30239d72-7996-4271-aeb7-1398258ddb54	b50cc41a-40c3-4ffe-95e2-61b05a2a861c	Spontaneous	2025-09-15 03:38:25.222317	\N	f
58	30239d72-7996-4271-aeb7-1398258ddb54	6e500dd8-2392-4de1-a2ca-ad91bc8308b2	Spontaneous	2025-09-15 03:38:27.125521	\N	f
57	30239d72-7996-4271-aeb7-1398258ddb54	6c142855-bf39-4342-ba01-bbe6d0452dc4	Spontaneous	2025-09-15 03:38:27.126075	\N	f
67	30239d72-7996-4271-aeb7-1398258ddb54	85d4edeb-b14d-4f6e-8d68-3362421271be	Spontaneous	2025-09-15 03:38:27.126542	\N	f
9	30239d72-7996-4271-aeb7-1398258ddb54	0de2056e-df97-4238-8ece-0413105743b7	Spontaneous	2025-09-15 03:38:27.128329	\N	f
41	30239d72-7996-4271-aeb7-1398258ddb54	41c5562b-805a-454c-bd07-be01cb1a23b1	Spontaneous	2025-09-15 03:38:27.129236	\N	f
28	30239d72-7996-4271-aeb7-1398258ddb54	2a53e47b-d5f3-494b-b494-140fe8ed70f5	Spontaneous	2025-09-15 03:38:27.145129	\N	f
77	30239d72-7996-4271-aeb7-1398258ddb54	9d687877-be5e-4c53-a75a-a17d2b2ee8c8	Spontaneous	2025-09-15 03:38:28.608068	\N	f
26	30239d72-7996-4271-aeb7-1398258ddb54	25d57f20-6475-47b4-aa10-89066a6c79cb	Spontaneous	2025-09-15 03:38:28.608571	\N	f
22	30239d72-7996-4271-aeb7-1398258ddb54	2287785b-a144-47fb-a2fe-a1ef4cf0514a	Spontaneous	2025-09-15 03:38:28.614245	\N	f
87	30239d72-7996-4271-aeb7-1398258ddb54	b4cef981-597f-479a-bf3b-477e0ad5885b	Spontaneous	2025-09-15 03:38:28.615062	\N	f
89	30239d72-7996-4271-aeb7-1398258ddb54	b7eb7910-8028-489d-9657-9c03bee2cb63	Spontaneous	2025-09-15 03:38:28.617076	\N	f
82	30239d72-7996-4271-aeb7-1398258ddb54	aa786408-31a6-4994-8095-b7c84423d87a	Spontaneous	2025-09-15 03:38:28.628676	\N	f
71	30239d72-7996-4271-aeb7-1398258ddb54	92633f59-c9da-43c6-8ef3-af5f8e51d2dd	Spontaneous	2025-09-15 03:38:28.637475	\N	f
36	30239d72-7996-4271-aeb7-1398258ddb54	35229299-9e3a-475a-9d52-c1c7e5510f13	Spontaneous	2025-09-15 03:38:28.641661	\N	f
38	30239d72-7996-4271-aeb7-1398258ddb54	36559f62-2e19-4d90-a259-2c6976a0c600	Spontaneous	2025-09-15 03:38:28.642057	\N	f
65	30239d72-7996-4271-aeb7-1398258ddb54	7a0fb818-61d6-4541-8a37-7a7b11bb48f4	Spontaneous	2025-09-15 03:38:28.642741	\N	f
73	30239d72-7996-4271-aeb7-1398258ddb54	999a37b1-ccc2-49ac-955e-33a62ddfcc81	Spontaneous	2025-09-15 03:38:28.649307	\N	f
3	30239d72-7996-4271-aeb7-1398258ddb54	03e0ac65-68ce-42b8-98f8-5919f165751e	Spontaneous	2025-09-15 03:38:28.650644	\N	f
19	30239d72-7996-4271-aeb7-1398258ddb54	1fa39eef-ac15-412b-8408-cb3f790627db	Spontaneous	2025-09-15 03:38:28.652972	\N	f
59	30239d72-7996-4271-aeb7-1398258ddb54	6f29e1e4-b67b-4094-b49e-15f8a503dc6f	Spontaneous	2025-09-15 03:38:30.088261	\N	f
75	30239d72-7996-4271-aeb7-1398258ddb54	9adcd130-17b8-44eb-af58-bc33d38ba258	Spontaneous	2025-09-15 03:38:30.09074	\N	f
16	30239d72-7996-4271-aeb7-1398258ddb54	1bb659c7-af23-4a59-ade8-20ca4b4bb2eb	Spontaneous	2025-09-15 03:38:30.091236	\N	f
10	30239d72-7996-4271-aeb7-1398258ddb54	0f809808-94c1-4238-9d41-00098e6b1167	Spontaneous	2025-09-15 03:38:30.103892	\N	f
12	30239d72-7996-4271-aeb7-1398258ddb54	12924acd-5a0c-47c9-b5c3-2b759f5fe5a1	Spontaneous	2025-09-15 03:38:32.36267	\N	f
96	30239d72-7996-4271-aeb7-1398258ddb54	db5b83ca-a224-4e43-80ac-e1f9aa9862d4	Spontaneous	2025-09-15 03:38:32.364743	\N	f
25	30239d72-7996-4271-aeb7-1398258ddb54	253dca5a-c944-4451-892c-accf9a3c68dc	Spontaneous	2025-09-15 03:38:32.365018	\N	f
44	30239d72-7996-4271-aeb7-1398258ddb54	4979b233-aa14-48b1-b83e-f09cfd60f492	Spontaneous	2025-09-15 03:38:32.36721	\N	f
8	30239d72-7996-4271-aeb7-1398258ddb54	0d5f7618-246a-41f9-a26b-258f47b8a68f	Spontaneous	2025-09-15 03:38:34.393255	\N	f
21	30239d72-7996-4271-aeb7-1398258ddb54	20c494ac-6713-4569-b9b3-766757d969d1	Spontaneous	2025-09-15 03:38:34.393745	\N	f
43	30239d72-7996-4271-aeb7-1398258ddb54	46458f35-c9ee-4508-8df4-9584d1d95dd4	Spontaneous	2025-09-15 03:38:34.396372	\N	f
83	30239d72-7996-4271-aeb7-1398258ddb54	abbad4c9-e561-4ce2-8bb7-1c6192b1e57a	Spontaneous	2025-09-15 03:38:34.396662	\N	f
91	30239d72-7996-4271-aeb7-1398258ddb54	bb92d18a-fc47-4b85-a9f7-897f7b6110af	Spontaneous	2025-09-15 03:38:34.39689	\N	f
40	30239d72-7996-4271-aeb7-1398258ddb54	3f551e0c-e729-4004-baca-f1e356172214	Spontaneous	2025-09-15 03:38:35.676847	\N	f
37	30239d72-7996-4271-aeb7-1398258ddb54	352b8ab8-87e6-43ac-a4b4-d8eefb0776db	Spontaneous	2025-09-15 03:38:35.677325	\N	f
80	30239d72-7996-4271-aeb7-1398258ddb54	a1728aef-ee05-48e0-9d5d-6ac12fe13ec3	Spontaneous	2025-09-15 03:38:35.677829	\N	f
52	30239d72-7996-4271-aeb7-1398258ddb54	5c2000cd-c308-4eb7-a964-230562da7352	Spontaneous	2025-09-15 03:38:35.678071	\N	f
61	30239d72-7996-4271-aeb7-1398258ddb54	75cd5f32-6cea-4431-877a-e9f2a1c23337	Spontaneous	2025-09-15 04:30:53.153641	\N	f
86	30239d72-7996-4271-aeb7-1398258ddb54	b0147305-9b1c-43e6-8846-c64f9d3ab2c7	Spontaneous	2025-09-15 04:09:30.59897	\N	f
4	30239d72-7996-4271-aeb7-1398258ddb54	07cddfc5-eb9d-41b7-8b8a-ae7fbbacfc68	Spontaneous	2025-09-15 04:30:48.978364	\N	f
35	30239d72-7996-4271-aeb7-1398258ddb54	34a5959a-db6a-4e77-9fee-60952e90f517	Spontaneous	2025-09-15 04:31:12.716719	\N	t
11	30239d72-7996-4271-aeb7-1398258ddb54	0f9a745f-070d-431f-b1cf-9250f7de1926	Spontaneous	2025-09-15 04:31:19.518571	\N	t
5	30239d72-7996-4271-aeb7-1398258ddb54	09e5ef09-890d-4e95-a534-da5b81622611	Spontaneous	2025-09-15 04:30:53.133626	\N	f
66	30239d72-7996-4271-aeb7-1398258ddb54	80c4a085-7078-49b8-9dee-1a2fcb3d603c	Spontaneous	2025-09-15 04:30:48.233813	\N	f
7	30239d72-7996-4271-aeb7-1398258ddb54	0ca633cb-d7e2-4f5a-a2a3-16fcafb11ee2	Spontaneous	2025-09-15 04:30:53.155328	\N	f
14	30239d72-7996-4271-aeb7-1398258ddb54	162cc0cd-f77f-4904-bff4-fce9db481cf5	Spontaneous	2025-09-15 04:31:30.09496	\N	t
17	30239d72-7996-4271-aeb7-1398258ddb54	1d04de74-61df-447b-a39a-a8f8c1e7d9b9	Spontaneous	2025-09-15 03:38:09.962097	\N	f
13	30239d72-7996-4271-aeb7-1398258ddb54	1394f4c2-1acc-49b1-8845-ddc6aaea2de7	Spontaneous	2025-09-15 03:38:09.964445	\N	f
64	30239d72-7996-4271-aeb7-1398258ddb54	79459408-6f0c-4953-be27-e4dec0561f47	Spontaneous	2025-09-15 03:38:09.965731	\N	f
32	30239d72-7996-4271-aeb7-1398258ddb54	2f8468d2-d88f-467a-a331-063e537726dd	Spontaneous	2025-09-15 03:38:09.966204	\N	f
34	30239d72-7996-4271-aeb7-1398258ddb54	33f1060b-b036-42a6-a8f2-18f4179ec2dc	Spontaneous	2025-09-15 03:38:09.966648	\N	f
100	30239d72-7996-4271-aeb7-1398258ddb54	e09ecb5a-d975-4e45-af13-80b45c66853c	Spontaneous	2025-09-15 03:38:22.267527	\N	f
99	30239d72-7996-4271-aeb7-1398258ddb54	df9836e6-0fd9-4490-a950-db049aa45722	Spontaneous	2025-09-15 03:38:25.217995	\N	f
45	30239d72-7996-4271-aeb7-1398258ddb54	4cbf9dd9-2015-4ec5-8d4e-61cf8bd88023	Spontaneous	2025-09-15 03:38:25.222668	\N	f
49	30239d72-7996-4271-aeb7-1398258ddb54	5218e9dc-6fc1-4d75-9aa2-171ae5cf869c	Spontaneous	2025-09-15 03:38:25.224865	\N	f
53	30239d72-7996-4271-aeb7-1398258ddb54	65c03fef-0a7c-48aa-9157-80909271e078	Spontaneous	2025-09-15 03:38:25.226257	\N	f
84	30239d72-7996-4271-aeb7-1398258ddb54	acb98b46-a2f2-4513-947c-dd681924df78	Spontaneous	2025-09-15 03:38:27.12984	\N	f
98	30239d72-7996-4271-aeb7-1398258ddb54	ddd33386-f8b5-4fef-81f5-7bd9f37cc1a9	Spontaneous	2025-09-15 03:38:28.619199	\N	f
68	30239d72-7996-4271-aeb7-1398258ddb54	85de8342-b946-4300-8a51-27d9cb8fc8dc	Spontaneous	2025-09-15 03:38:30.094231	\N	f
47	30239d72-7996-4271-aeb7-1398258ddb54	506bef80-e318-4957-bd45-98a80941239a	Spontaneous	2025-09-15 03:38:30.094528	\N	f
70	30239d72-7996-4271-aeb7-1398258ddb54	8c163c1d-7940-4f0d-b046-fd22519b6a47	Spontaneous	2025-09-15 03:38:30.094841	\N	f
63	30239d72-7996-4271-aeb7-1398258ddb54	77c6e5ef-1b19-4cf0-9eb8-ff6074651b4e	Spontaneous	2025-09-15 03:38:35.680915	\N	f
72	30239d72-7996-4271-aeb7-1398258ddb54	97ca3832-b149-4c01-80af-251afb4ff11c	Spontaneous	2025-09-15 03:39:04.714416	signs Bubbles	f
101	30239d72-7996-4271-aeb7-1398258ddb54	feeecb9b-74c7-446b-a6bb-c939803e0bd2	Spontaneous	2025-09-15 04:30:53.153339	\N	f
102	30239d72-7996-4271-aeb7-1398258ddb54	fb4a56c4-64ee-4f7b-9922-7ec25969e337	Spontaneous	2025-09-15 04:34:07.022469	\N	t
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sessions (id, user_id, skill, minutes, confidence, notes, created_at) FROM stdin;
\.


--
-- Data for Name: student_parent_association; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.student_parent_association (student_id, parent_id) FROM stdin;
\.


--
-- Data for Name: students; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.students (id, school, first_name, last_name, date_of_birth, claim_code, avatar_url, created_at) FROM stdin;
30239d72-7996-4271-aeb7-1398258ddb54	CES	Olivia	Belvin	2020-12-31	K1MLD865	/resources/img/default_user.png	2025-09-13 12:33:15.820282
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, first_name, last_name, email, password, role, avatar_url) FROM stdin;
1	Lacey	Wood	laceywoodtodhh@gmail.com	$2b$10$tIMUGYW1XZ9oT6Jsz2MKzO815pGKSc7twxyXx7THnBnHiIBVig.fq	teacher	/resources/img/default_user.png
\.


--
-- Data for Name: words; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.words (id, category, word, level, image_link, video_link, custom_image_boolean, custom_image_link, created_at) FROM stdin;
e09ecb5a-d975-4e45-af13-80b45c66853c	Animals	bear	\N	/resources/flashcards/Animals/bear.svg	\N	f	\N	2025-09-13 12:32:24.53642
2c06f364-4893-4e88-8299-ce0b42d6b6cd	Animals	bird	\N	/resources/flashcards/Animals/bird.svg	\N	f	\N	2025-09-13 12:32:24.546441
3b2c59cd-4f0e-4e6b-8799-d8332127d365	Animals	cat	\N	/resources/flashcards/Animals/cat.svg	\N	f	\N	2025-09-13 12:32:24.556807
230b767f-f247-4974-bdf4-3120d0b808e3	Animals	cow	\N	/resources/flashcards/Animals/cow.svg	\N	f	\N	2025-09-13 12:32:24.565346
1dbdec36-95a4-4cf0-bd25-5946015f0f20	Animals	dog	\N	/resources/flashcards/Animals/dog.svg	\N	f	\N	2025-09-13 12:32:24.573985
c2ac9715-d90a-4fec-8549-f60b828d0e88	Animals	duck	\N	/resources/flashcards/Animals/duck.svg	\N	f	\N	2025-09-13 12:32:24.578309
204f1af0-ee77-45be-9551-6f4e17eb21a2	Animals	elephant	\N	/resources/flashcards/Animals/elephant.svg	\N	f	\N	2025-09-13 12:32:24.589913
ca8abdd1-0da9-4163-8c09-d075167ba423	Animals	fish	\N	/resources/flashcards/Animals/fish.svg	\N	f	\N	2025-09-13 12:32:24.595142
03c8ec69-c9d8-4cd1-9928-89f6947b85da	Animals	horse	\N	/resources/flashcards/Animals/horse.svg	\N	f	\N	2025-09-13 12:32:24.599041
74dc6913-2c2f-4891-9ec2-e35f238229fe	Animals	monkey	\N	/resources/flashcards/Animals/monkey.svg	\N	f	\N	2025-09-13 12:32:24.608614
c2c3fb2a-a395-4944-b9c0-d886d0272832	Animals	pig	\N	/resources/flashcards/Animals/pig.svg	\N	f	\N	2025-09-13 12:32:24.618961
0a5f00a7-8e89-4f05-a74d-6701407bac19	Animals	rabbit/bunny	\N	/resources/flashcards/Animals/rabbit.svg	\N	f	\N	2025-09-13 12:32:24.626208
16ef0144-9188-41e2-ac83-c83984674af9	Animals	sheep	\N	/resources/flashcards/Animals/sheep.svg	\N	f	\N	2025-09-13 12:32:24.634721
5415cafe-de12-44d7-b5f3-590801356411	Household	bathtub	\N	\N	\N	f	\N	2025-09-13 12:32:24.63873
6f29e1e4-b67b-4094-b49e-15f8a503dc6f	Household	chair	\N	/resources/flashcards/Household/chair.svg	\N	f	\N	2025-09-13 12:32:24.646982
9adcd130-17b8-44eb-af58-bc33d38ba258	Household	cup	\N	/resources/flashcards/Household/cup.svg	\N	f	\N	2025-09-13 12:32:24.654737
fb4a56c4-64ee-4f7b-9922-7ec25969e337	Household	door	\N	\N	\N	f	\N	2025-09-13 12:32:24.666758
1bb659c7-af23-4a59-ade8-20ca4b4bb2eb	Household	knife	\N	/resources/flashcards/Household/knife.svg	\N	f	\N	2025-09-13 12:32:24.674754
85de8342-b946-4300-8a51-27d9cb8fc8dc	Household	phone	\N	/resources/flashcards/Household/phone.svg	\N	f	\N	2025-09-13 12:32:24.678915
506bef80-e318-4957-bd45-98a80941239a	Household	potty/toilet	\N	/resources/flashcards/Household/potty.svg	\N	f	\N	2025-09-13 12:32:24.686695
8c163c1d-7940-4f0d-b046-fd22519b6a47	Household	spoon	\N	/resources/flashcards/Household/spoon.svg	\N	f	\N	2025-09-13 12:32:24.699008
0f809808-94c1-4238-9d41-00098e6b1167	Household	table	\N	/resources/flashcards/Household/table.svg	\N	f	\N	2025-09-13 12:32:24.70758
ffe55958-35d6-454a-889f-a5ecf622624b	Household	toothbrush	\N	/resources/flashcards/Household/toothbrush.svg	\N	f	\N	2025-09-13 12:32:24.718807
df9836e6-0fd9-4490-a950-db049aa45722	Body Parts	ear	\N	\N	\N	f	\N	2025-09-13 12:32:24.723418
f8d96bd2-6ce1-4156-a696-ee192febf4af	Body Parts	eyes	\N	/resources/flashcards/BodyParts/eyes.svg	\N	f	\N	2025-09-13 12:32:24.727027
2eac304d-818a-44f9-bc51-31ccb873fbca	Body Parts	foot	\N	\N	\N	f	\N	2025-09-13 12:32:24.736388
b50cc41a-40c3-4ffe-95e2-61b05a2a861c	Body Parts	hair	\N	/resources/flashcards/BodyParts/hair.svg	\N	f	\N	2025-09-13 12:32:24.747012
5218e9dc-6fc1-4d75-9aa2-171ae5cf869c	Body Parts	hand	\N	/resources/flashcards/BodyParts/hand.svg	\N	f	\N	2025-09-13 12:32:24.757581
4cbf9dd9-2015-4ec5-8d4e-61cf8bd88023	Body Parts	mouth	\N	/resources/flashcards/BodyParts/mouth.svg	\N	f	\N	2025-09-13 12:32:24.768115
65c03fef-0a7c-48aa-9157-80909271e078	Body Parts	nose	\N	/resources/flashcards/BodyParts/nose.svg	\N	f	\N	2025-09-13 12:32:24.78775
9dc597a7-2f0e-4730-9ac5-bc1de44f3753	Body Parts	teeth	\N	/resources/flashcards/BodyParts/teeth.svg	\N	f	\N	2025-09-13 12:32:24.792512
0f9a745f-070d-431f-b1cf-9250f7de1926	Clothes	boot/s	\N	/resources/flashcards/Clothes/boots.svg	\N	f	\N	2025-09-13 12:32:24.808666
6e500dd8-2392-4de1-a2ca-ad91bc8308b2	Clothes	coat	\N	\N	\N	f	\N	2025-09-13 12:32:24.822709
6c142855-bf39-4342-ba01-bbe6d0452dc4	Clothes	diaper	\N	/resources/flashcards/Clothes/diaper.svg	\N	f	\N	2025-09-13 12:32:24.830402
85d4edeb-b14d-4f6e-8d68-3362421271be	Clothes	hat	\N	/resources/flashcards/Clothes/hat.svg	\N	f	\N	2025-09-13 12:32:24.844453
0de2056e-df97-4238-8ece-0413105743b7	Clothes	pants	\N	/resources/flashcards/Clothes/pants.svg	\N	f	\N	2025-09-13 12:32:24.863184
41c5562b-805a-454c-bd07-be01cb1a23b1	Clothes	shirt	\N	/resources/flashcards/Clothes/shirt.svg	\N	f	\N	2025-09-13 12:32:24.894297
acb98b46-a2f2-4513-947c-dd681924df78	Clothes	shoe/s	\N	/resources/flashcards/Clothes/shoes.svg	\N	f	\N	2025-09-13 12:32:24.909118
2a53e47b-d5f3-494b-b494-140fe8ed70f5	Clothes	sock/s	\N	/resources/flashcards/Clothes/socks.svg	\N	f	\N	2025-09-13 12:32:24.91491
12924acd-5a0c-47c9-b5c3-2b759f5fe5a1	Nature	flower	\N	/resources/flashcards/Nature/flower.svg	\N	f	\N	2025-09-13 12:32:24.918824
4979b233-aa14-48b1-b83e-f09cfd60f492	Nature	rain	\N	/resources/flashcards/Nature/rain.svg	\N	f	\N	2025-09-13 12:32:24.922923
db5b83ca-a224-4e43-80ac-e1f9aa9862d4	Nature	sun	\N	/resources/flashcards/Nature/sun.svg	\N	f	\N	2025-09-13 12:32:24.936724
253dca5a-c944-4451-892c-accf9a3c68dc	Nature	tree	\N	/resources/flashcards/Nature/tree.svg	\N	f	\N	2025-09-13 12:32:24.938349
0d5f7618-246a-41f9-a26b-258f47b8a68f	People	baby	\N	/resources/flashcards/People/baby.svg	\N	f	\N	2025-09-13 12:32:24.939778
bb92d18a-fc47-4b85-a9f7-897f7b6110af	People	boy	\N	/resources/flashcards/People/boy-girl.svg	\N	f	\N	2025-09-13 12:32:24.95375
20c494ac-6713-4569-b9b3-766757d969d1	People	Daddy	\N	/resources/flashcards/People/dad-mom.svg	\N	f	\N	2025-09-13 12:32:24.974747
46458f35-c9ee-4508-8df4-9584d1d95dd4	People	girl	\N	/resources/flashcards/People/boy-girl.svg	\N	f	\N	2025-09-13 12:32:24.977208
abbad4c9-e561-4ce2-8bb7-1c6192b1e57a	People	Mommy	\N	/resources/flashcards/People/dad-mom.svg	\N	f	\N	2025-09-13 12:32:24.986866
ddd33386-f8b5-4fef-81f5-7bd9f37cc1a9	Food	apple	\N	/resources/flashcards/Food/apple.svg	\N	f	\N	2025-09-13 12:32:24.994855
9d687877-be5e-4c53-a75a-a17d2b2ee8c8	Food	banana	\N	/resources/flashcards/Food/banana.svg	\N	f	\N	2025-09-13 12:32:25.007376
25d57f20-6475-47b4-aa10-89066a6c79cb	Food	candy	\N	/resources/flashcards/Food/candy.svg	\N	f	\N	2025-09-13 12:32:25.011395
b4cef981-597f-479a-bf3b-477e0ad5885b	Food	cheese	\N	/resources/flashcards/Food/cheese.svg	\N	f	\N	2025-09-13 12:32:25.02127
2287785b-a144-47fb-a2fe-a1ef4cf0514a	Food	cookie	\N	/resources/flashcards/Food/cookie.svg	\N	f	\N	2025-09-13 12:32:25.025946
b7eb7910-8028-489d-9657-9c03bee2cb63	Food	cracker	\N	/resources/flashcards/Food/cracker.svg	\N	f	\N	2025-09-13 12:32:25.040726
aa786408-31a6-4994-8095-b7c84423d87a	Food	French fries	\N	/resources/flashcards/Food/frenchfries.svg	\N	f	\N	2025-09-13 12:32:25.051003
4e9225bb-2231-42c7-a043-49e632b1f5fc	Food	hamburger	\N	/resources/flashcards/Food/hamburger.svg	\N	f	\N	2025-09-13 12:32:25.065452
92633f59-c9da-43c6-8ef3-af5f8e51d2dd	Food	hotdog	\N	/resources/flashcards/Food/hotdog.svg	\N	f	\N	2025-09-13 12:32:25.077022
36559f62-2e19-4d90-a259-2c6976a0c600	Food	ice cream cone	\N	/resources/flashcards/Food/icecream.svg	\N	f	\N	2025-09-13 12:32:25.085393
35229299-9e3a-475a-9d52-c1c7e5510f13	Food	juice	\N	/resources/flashcards/Food/juice.svg	\N	f	\N	2025-09-13 12:32:25.102954
7a0fb818-61d6-4541-8a37-7a7b11bb48f4	Food	milk	\N	/resources/flashcards/Food/milk.svg	\N	f	\N	2025-09-13 12:32:25.116831
03e0ac65-68ce-42b8-98f8-5919f165751e	Food	pizza	\N	/resources/flashcards/Food/pizza.svg	\N	f	\N	2025-09-13 12:32:25.136552
999a37b1-ccc2-49ac-955e-33a62ddfcc81	Food	strawberry	\N	/resources/flashcards/Food/strawberry.svg	\N	f	\N	2025-09-13 12:32:25.138246
1fa39eef-ac15-412b-8408-cb3f790627db	Food	water	\N	/resources/flashcards/Food/water.svg	\N	f	\N	2025-09-13 12:32:25.150887
34a5959a-db6a-4e77-9fee-60952e90f517	Toys/Travel	airplane	\N	/resources/flashcards/ToysTravel/plane.svg	\N	f	\N	2025-09-13 12:32:25.158732
3f551e0c-e729-4004-baca-f1e356172214	Toys/Travel	ball	\N	/resources/flashcards/ToysTravel/ball.svg	\N	f	\N	2025-09-13 12:32:25.165778
352b8ab8-87e6-43ac-a4b4-d8eefb0776db	Toys/Travel	balloon	\N	/resources/flashcards/ToysTravel/balloon.svg	\N	f	\N	2025-09-13 12:32:25.169812
50a05e0a-c564-46cd-82e2-ce2589ee1ad2	Toys/Travel	bike	\N	/resources/flashcards/ToysTravel/bike.svg	\N	f	\N	2025-09-13 12:32:25.173731
a1728aef-ee05-48e0-9d5d-6ac12fe13ec3	Toys/Travel	book	\N	/resources/flashcards/ToysTravel/book.svg	\N	f	\N	2025-09-13 12:32:25.178406
5c2000cd-c308-4eb7-a964-230562da7352	Toys/Travel	bubbles	\N	\N	\N	f	\N	2025-09-13 12:32:25.18878
77c6e5ef-1b19-4cf0-9eb8-ff6074651b4e	Toys/Travel	car	\N	/resources/flashcards/ToysTravel/car.svg	\N	f	\N	2025-09-13 12:32:25.190705
dbe5277b-10ba-4fd8-b51f-4cdb323915e6	Toys/Travel	train	\N	/resources/flashcards/ToysTravel/train.svg	\N	f	\N	2025-09-13 12:32:25.192303
97ca3832-b149-4c01-80af-251afb4ff11c	Action Words/Verbs	blow	\N	\N	\N	f	\N	2025-09-13 12:32:25.194831
1d04de74-61df-447b-a39a-a8f8c1e7d9b9	Action Words/Verbs	clap	\N	\N	\N	f	\N	2025-09-13 12:32:25.207752
162cc0cd-f77f-4904-bff4-fce9db481cf5	Action Words/Verbs	cry	\N	\N	\N	f	\N	2025-09-13 12:32:25.21272
ecb42365-ac87-478c-ac6c-ce6918503c65	Action Words/Verbs	cut	\N	\N	\N	f	\N	2025-09-13 12:32:25.215795
33f1060b-b036-42a6-a8f2-18f4179ec2dc	Action Words/Verbs	drink	\N	\N	\N	f	\N	2025-09-13 12:32:25.230418
54eb2a4e-69d7-4fd4-b777-86628228d302	Action Words/Verbs	drive	\N	\N	\N	f	\N	2025-09-13 12:32:25.249124
79459408-6f0c-4953-be27-e4dec0561f47	Action Words/Verbs	drop	\N	\N	\N	f	\N	2025-09-13 12:32:25.256686
1394f4c2-1acc-49b1-8845-ddc6aaea2de7	Action Words/Verbs	eat	\N	\N	\N	f	\N	2025-09-13 12:32:25.263579
66b62167-d95b-4edd-b3e0-64f6626a921c	Action Words/Verbs	fall down	\N	/resources/flashcards/ActionWordsVerbs/falldown.svg	\N	f	\N	2025-09-13 12:32:25.271626
29266a1b-c405-43b9-a9a4-43d7ff3c0fcd	Action Words/Verbs	hug	\N	\N	\N	f	\N	2025-09-13 12:32:25.274864
30fb0650-435a-41d5-9c82-ddd77623716f	Action Words/Verbs	jump	\N	\N	\N	f	\N	2025-09-13 12:32:25.285311
2f8468d2-d88f-467a-a331-063e537726dd	Action Words/Verbs	kick	\N	\N	\N	f	\N	2025-09-13 12:32:25.29649
c2512927-f267-4eb8-9093-d66f0b6e0efa	Action Words/Verbs	kiss	\N	\N	\N	f	\N	2025-09-13 12:32:25.322728
a1787c34-00d4-4fca-8d29-5d165cd70ef8	Action Words/Verbs	open	\N	\N	\N	f	\N	2025-09-13 12:32:25.343302
89d65a15-ba40-44d2-a3aa-be41da7e84ce	Action Words/Verbs	pour	\N	\N	\N	f	\N	2025-09-13 12:32:25.361135
aceac11b-7da8-4c3d-bce4-eaaeffb1db6e	Action Words/Verbs	push	\N	\N	\N	f	\N	2025-09-13 12:32:25.367928
9c09cafa-3442-4c72-9332-ed378d359c17	Action Words/Verbs	run	\N	\N	\N	f	\N	2025-09-13 12:32:25.370176
689d65a2-c186-428b-ab26-3034ac793c2b	Action Words/Verbs	sit down	\N	/resources/flashcards/ActionWordsVerbs/sitdown.svg	\N	f	\N	2025-09-13 12:32:25.388023
e87ccc81-222c-4ac8-9b22-a1ff4bf9035f	Action Words/Verbs	sleep	\N	\N	\N	f	\N	2025-09-13 12:32:25.404908
6b0df44d-7d3e-4428-9b0f-c0f26efef800	Action Words/Verbs	stir	\N	\N	\N	f	\N	2025-09-13 12:32:25.411053
76b530e9-e6f6-4884-a0f1-d24894f56333	Action Words/Verbs	throw	\N	\N	\N	f	\N	2025-09-13 12:32:25.41684
9a63c82c-c1ee-4775-a765-e870130040eb	Action Words/Verbs	turn around	\N	/resources/flashcards/ActionWordsVerbs/turnaround.svg	\N	f	\N	2025-09-13 12:32:25.419486
bab00729-e54c-409e-9157-d7039ffaf4e4	Action Words/Verbs	walk	\N	\N	\N	f	\N	2025-09-13 12:32:25.432167
42d23349-3d60-4d55-b180-26535f6c9486	Action Words/Verbs	wash	\N	\N	\N	f	\N	2025-09-13 12:32:25.448026
09e5ef09-890d-4e95-a534-da5b81622611	Adjectives	blue	\N	/resources/flashcards/Adjectives/color-blue.svg	\N	f	\N	2025-09-13 12:32:25.464193
80c4a085-7078-49b8-9dee-1a2fcb3d603c	Adjectives	green	\N	/resources/flashcards/Adjectives/color-green.svg	\N	f	\N	2025-09-13 12:32:25.483224
b0147305-9b1c-43e6-8846-c64f9d3ab2c7	Adjectives	orange	\N	/resources/flashcards/Adjectives/color-orange.svg	\N	f	\N	2025-09-13 12:32:25.488344
0ca633cb-d7e2-4f5a-a2a3-16fcafb11ee2	Adjectives	purple	\N	/resources/flashcards/Adjectives/color-purple.svg	\N	f	\N	2025-09-13 12:32:25.500887
75cd5f32-6cea-4431-877a-e9f2a1c23337	Adjectives	red	\N	/resources/flashcards/Adjectives/color-red.svg	\N	f	\N	2025-09-13 12:32:25.522785
230a428a-7f46-4e53-810e-9f72338d3d98	Adjectives	yellow	\N	/resources/flashcards/Adjectives/color-yellow.svg	\N	f	\N	2025-09-13 12:32:25.532831
feeecb9b-74c7-446b-a6bb-c939803e0bd2	Adjectives	one	\N	/resources/flashcards/Adjectives/number-1.svg	\N	f	\N	2025-09-13 12:32:25.537786
e17f2b2c-a2a4-43e1-bc5e-a86cff3233f7	Adjectives	two	\N	/resources/flashcards/Adjectives/number-2.svg	\N	f	\N	2025-09-13 12:32:25.547483
07cddfc5-eb9d-41b7-8b8a-ae7fbbacfc68	Adjectives	three	\N	/resources/flashcards/Adjectives/number-3.svg	\N	f	\N	2025-09-13 12:32:25.561414
2ef88fdb-8f62-43b8-afef-d708c89620bc	Adjectives	big/little	\N	/resources/flashcards/Adjectives/big-little.svg	\N	f	\N	2025-09-13 12:32:25.566271
03b9ce61-3faf-4d00-90c0-dcd6533eba8f	Adjectives	clean/dirty	\N	\N	\N	f	\N	2025-09-13 12:32:25.577695
9ea7c7f0-06c4-4113-a40d-2bea0b5fdea9	Adjectives	happy/sad	\N	\N	\N	f	\N	2025-09-13 12:32:25.601447
fdd17f9c-ef6d-4a05-98e0-915c84514398	Adjectives	hot/cold	\N	\N	\N	f	\N	2025-09-13 12:32:25.606699
\.


--
-- Name: assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.assignments_id_seq', 1, false);


--
-- Name: notes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notes_id_seq', 1, false);


--
-- Name: progress_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.progress_id_seq', 102, true);


--
-- Name: sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sessions_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- Name: assignments assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_pkey PRIMARY KEY (id);


--
-- Name: notes notes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_pkey PRIMARY KEY (id);


--
-- Name: progress progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.progress
    ADD CONSTRAINT progress_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: student_parent_association student_parent_association_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_parent_association
    ADD CONSTRAINT student_parent_association_pkey PRIMARY KEY (student_id, parent_id);


--
-- Name: students students_claim_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_claim_code_key UNIQUE (claim_code);


--
-- Name: students students_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: words words_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.words
    ADD CONSTRAINT words_pkey PRIMARY KEY (id);


--
-- Name: words words_word_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.words
    ADD CONSTRAINT words_word_key UNIQUE (word);


--
-- Name: assignments assignments_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;


--
-- Name: assignments assignments_word_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_word_id_fkey FOREIGN KEY (word_id) REFERENCES public.words(id) ON DELETE CASCADE;


--
-- Name: notes notes_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;


--
-- Name: progress progress_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.progress
    ADD CONSTRAINT progress_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;


--
-- Name: progress progress_word_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.progress
    ADD CONSTRAINT progress_word_id_fkey FOREIGN KEY (word_id) REFERENCES public.words(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: student_parent_association student_parent_association_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_parent_association
    ADD CONSTRAINT student_parent_association_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: student_parent_association student_parent_association_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_parent_association
    ADD CONSTRAINT student_parent_association_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 7XyVyqd7zDE7TTdtbUyx0aNfgmAMu8Pnejfg86igbCLwBgMELzYh1EP1fYuxEUP

