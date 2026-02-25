--
-- PostgreSQL database dump
--

\restrict 091yV3o1Qtv4bvlalEx7X0bIqUWGG6kSvDc7xOu4PWghZ9tE5hLMbCTr6vRZh2L

-- Dumped from database version 16.11 (Ubuntu 16.11-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.11 (Ubuntu 16.11-0ubuntu0.24.04.1)

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
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: update_post_like_count(); Type: FUNCTION; Schema: public; Owner: skillbridge_user
--

CREATE FUNCTION public.update_post_like_count() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET like_count = like_count - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$;


ALTER FUNCTION public.update_post_like_count() OWNER TO skillbridge_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: company_profiles; Type: TABLE; Schema: public; Owner: skillbridge_user
--

CREATE TABLE public.company_profiles (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    logo_url text,
    description text,
    industry character varying(100),
    size character varying(50),
    website text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.company_profiles OWNER TO skillbridge_user;

--
-- Name: contact_requests; Type: TABLE; Schema: public; Owner: skillbridge_user
--

CREATE TABLE public.contact_requests (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    sender_id uuid NOT NULL,
    receiver_id uuid NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying,
    message text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.contact_requests OWNER TO skillbridge_user;

--
-- Name: content_reports; Type: TABLE; Schema: public; Owner: skillbridge_user
--

CREATE TABLE public.content_reports (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    reporter_id uuid,
    content_type character varying(50) NOT NULL,
    content_id uuid NOT NULL,
    reason text NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying,
    admin_notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.content_reports OWNER TO skillbridge_user;

--
-- Name: developer_bookmarks; Type: TABLE; Schema: public; Owner: skillbridge_user
--

CREATE TABLE public.developer_bookmarks (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    company_id uuid NOT NULL,
    developer_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.developer_bookmarks OWNER TO skillbridge_user;

--
-- Name: endorsements; Type: TABLE; Schema: public; Owner: skillbridge_user
--

CREATE TABLE public.endorsements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    endorser_id uuid NOT NULL,
    endorsed_id uuid NOT NULL,
    skill_id integer,
    message text,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT no_self_endorsement CHECK ((endorser_id <> endorsed_id))
);


ALTER TABLE public.endorsements OWNER TO skillbridge_user;

--
-- Name: follows; Type: TABLE; Schema: public; Owner: skillbridge_user
--

CREATE TABLE public.follows (
    follower_id uuid NOT NULL,
    following_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.follows OWNER TO skillbridge_user;

--
-- Name: github_repositories; Type: TABLE; Schema: public; Owner: skillbridge_user
--

CREATE TABLE public.github_repositories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    profile_id uuid,
    name character varying(255) NOT NULL,
    description text,
    stars integer DEFAULT 0,
    forks integer DEFAULT 0,
    language character varying(100),
    last_updated timestamp without time zone,
    is_pinned boolean DEFAULT false,
    is_hidden boolean DEFAULT false,
    is_public boolean DEFAULT true,
    custom_description text,
    demo_url character varying(500),
    readme_preview text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.github_repositories OWNER TO skillbridge_user;

--
-- Name: github_stats; Type: TABLE; Schema: public; Owner: skillbridge_user
--

CREATE TABLE public.github_stats (
    profile_id uuid NOT NULL,
    public_repos integer,
    followers integer,
    total_stars integer,
    total_commits integer,
    commits_30d integer DEFAULT 0,
    is_active boolean DEFAULT false,
    last_activity timestamp without time zone,
    account_created timestamp without time zone,
    last_synced_at timestamp without time zone,
    top_languages jsonb,
    contribution_streak integer,
    consistency_score numeric(3,2),
    github_bio text,
    github_following integer,
    account_age_months integer,
    weekly_activity jsonb,
    most_active_days jsonb,
    verification_status character varying(20) DEFAULT 'verified'::character varying,
    last_sync_with_github timestamp without time zone,
    github_username text
);


ALTER TABLE public.github_stats OWNER TO skillbridge_user;

--
-- Name: job_applications; Type: TABLE; Schema: public; Owner: skillbridge_user
--

CREATE TABLE public.job_applications (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    job_id uuid NOT NULL,
    developer_id uuid NOT NULL,
    message text,
    status character varying(20) DEFAULT 'pending'::character varying,
    applied_at timestamp without time zone DEFAULT now(),
    private_notes text,
    hiring_status character varying(20) DEFAULT 'applied'::character varying,
    updated_at timestamp without time zone DEFAULT now(),
    milestones jsonb DEFAULT '[]'::jsonb,
    total_bid_amount numeric(10,2) DEFAULT 0.00
);


ALTER TABLE public.job_applications OWNER TO skillbridge_user;

--
-- Name: jobs; Type: TABLE; Schema: public; Owner: skillbridge_user
--

CREATE TABLE public.jobs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    client_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    budget_range character varying(100),
    status character varying(20) DEFAULT 'open'::character varying,
    required_skills jsonb DEFAULT '[]'::jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    expected_outcome text,
    trial_friendly boolean DEFAULT false,
    is_published boolean DEFAULT true
);


ALTER TABLE public.jobs OWNER TO skillbridge_user;

--
-- Name: platform_settings; Type: TABLE; Schema: public; Owner: skillbridge_user
--

CREATE TABLE public.platform_settings (
    key character varying(100) NOT NULL,
    value jsonb NOT NULL,
    description text,
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.platform_settings OWNER TO skillbridge_user;

--
-- Name: post_comments; Type: TABLE; Schema: public; Owner: skillbridge_user
--

CREATE TABLE public.post_comments (
    id integer NOT NULL,
    post_id uuid,
    user_id uuid,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    deleted_at timestamp without time zone
);


ALTER TABLE public.post_comments OWNER TO skillbridge_user;

--
-- Name: post_comments_id_seq; Type: SEQUENCE; Schema: public; Owner: skillbridge_user
--

CREATE SEQUENCE public.post_comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.post_comments_id_seq OWNER TO skillbridge_user;

--
-- Name: post_comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: skillbridge_user
--

ALTER SEQUENCE public.post_comments_id_seq OWNED BY public.post_comments.id;


--
-- Name: post_likes; Type: TABLE; Schema: public; Owner: skillbridge_user
--

CREATE TABLE public.post_likes (
    id integer NOT NULL,
    post_id uuid,
    user_id uuid
);


ALTER TABLE public.post_likes OWNER TO skillbridge_user;

--
-- Name: post_likes_id_seq; Type: SEQUENCE; Schema: public; Owner: skillbridge_user
--

CREATE SEQUENCE public.post_likes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.post_likes_id_seq OWNER TO skillbridge_user;

--
-- Name: post_likes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: skillbridge_user
--

ALTER SEQUENCE public.post_likes_id_seq OWNED BY public.post_likes.id;


--
-- Name: post_tags; Type: TABLE; Schema: public; Owner: skillbridge_user
--

CREATE TABLE public.post_tags (
    post_id uuid NOT NULL,
    tag_id integer NOT NULL
);


ALTER TABLE public.post_tags OWNER TO skillbridge_user;

--
-- Name: posts; Type: TABLE; Schema: public; Owner: skillbridge_user
--

CREATE TABLE public.posts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    author_id uuid,
    title text NOT NULL,
    slug text NOT NULL,
    markdown text NOT NULL,
    sanitized_html text NOT NULL,
    views integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    like_count integer DEFAULT 0,
    shares_count integer DEFAULT 0,
    deleted_at timestamp without time zone,
    cover_image character varying(255)
);


ALTER TABLE public.posts OWNER TO skillbridge_user;

--
-- Name: profile_skills; Type: TABLE; Schema: public; Owner: skillbridge_user
--

CREATE TABLE public.profile_skills (
    profile_id uuid NOT NULL,
    skill_id integer NOT NULL
);


ALTER TABLE public.profile_skills OWNER TO skillbridge_user;

--
-- Name: profile_views; Type: TABLE; Schema: public; Owner: skillbridge_user
--

CREATE TABLE public.profile_views (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    profile_id uuid NOT NULL,
    viewer_id uuid,
    viewer_role character varying(50),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.profile_views OWNER TO skillbridge_user;

--
-- Name: profiles; Type: TABLE; Schema: public; Owner: skillbridge_user
--

CREATE TABLE public.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    username character varying(50) NOT NULL,
    full_name character varying(120),
    bio text,
    location character varying(120),
    github_username character varying(100),
    reputation_score integer DEFAULT 0,
    joined_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    deleted_at timestamp without time zone
);


ALTER TABLE public.profiles OWNER TO skillbridge_user;

--
-- Name: projects; Type: TABLE; Schema: public; Owner: skillbridge_user
--

CREATE TABLE public.projects (
    id integer NOT NULL,
    user_id uuid,
    title character varying(100) NOT NULL,
    github_repo text NOT NULL,
    live_demo text,
    tech_stack text[] NOT NULL,
    description text NOT NULL,
    thumbnail text,
    views integer DEFAULT 0,
    visibility character varying(20) DEFAULT 'public'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT projects_visibility_check CHECK (((visibility)::text = 'public'::text))
);


ALTER TABLE public.projects OWNER TO skillbridge_user;

--
-- Name: projects_id_seq; Type: SEQUENCE; Schema: public; Owner: skillbridge_user
--

CREATE SEQUENCE public.projects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.projects_id_seq OWNER TO skillbridge_user;

--
-- Name: projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: skillbridge_user
--

ALTER SEQUENCE public.projects_id_seq OWNED BY public.projects.id;


--
-- Name: reputation_history; Type: TABLE; Schema: public; Owner: skillbridge_user
--

CREATE TABLE public.reputation_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    previous_score integer NOT NULL,
    new_score integer NOT NULL,
    change_amount integer NOT NULL,
    reason character varying(50) NOT NULL,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.reputation_history OWNER TO skillbridge_user;

--
-- Name: skills; Type: TABLE; Schema: public; Owner: skillbridge_user
--

CREATE TABLE public.skills (
    id integer NOT NULL,
    name character varying(50) NOT NULL
);


ALTER TABLE public.skills OWNER TO skillbridge_user;

--
-- Name: skills_id_seq; Type: SEQUENCE; Schema: public; Owner: skillbridge_user
--

CREATE SEQUENCE public.skills_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.skills_id_seq OWNER TO skillbridge_user;

--
-- Name: skills_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: skillbridge_user
--

ALTER SEQUENCE public.skills_id_seq OWNED BY public.skills.id;


--
-- Name: tags; Type: TABLE; Schema: public; Owner: skillbridge_user
--

CREATE TABLE public.tags (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE public.tags OWNER TO skillbridge_user;

--
-- Name: tags_id_seq; Type: SEQUENCE; Schema: public; Owner: skillbridge_user
--

CREATE SEQUENCE public.tags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tags_id_seq OWNER TO skillbridge_user;

--
-- Name: tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: skillbridge_user
--

ALTER SEQUENCE public.tags_id_seq OWNED BY public.tags.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: skillbridge_user
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying(255) NOT NULL,
    password_hash text NOT NULL,
    name character varying(120),
    role character varying(50) DEFAULT 'developer'::character varying,
    is_active boolean DEFAULT true,
    is_verified boolean DEFAULT false,
    password_reset_token text,
    password_reset_expires timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    github_id bigint,
    github_username character varying(100),
    avatar_url text,
    onboarding_completed boolean DEFAULT false,
    github_verified boolean DEFAULT false,
    github_connected_at timestamp without time zone,
    username character varying(255)
);


ALTER TABLE public.users OWNER TO skillbridge_user;

--
-- Name: post_comments id; Type: DEFAULT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.post_comments ALTER COLUMN id SET DEFAULT nextval('public.post_comments_id_seq'::regclass);


--
-- Name: post_likes id; Type: DEFAULT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.post_likes ALTER COLUMN id SET DEFAULT nextval('public.post_likes_id_seq'::regclass);


--
-- Name: projects id; Type: DEFAULT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.projects ALTER COLUMN id SET DEFAULT nextval('public.projects_id_seq'::regclass);


--
-- Name: skills id; Type: DEFAULT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.skills ALTER COLUMN id SET DEFAULT nextval('public.skills_id_seq'::regclass);


--
-- Name: tags id; Type: DEFAULT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.tags ALTER COLUMN id SET DEFAULT nextval('public.tags_id_seq'::regclass);


--
-- Data for Name: company_profiles; Type: TABLE DATA; Schema: public; Owner: skillbridge_user
--

COPY public.company_profiles (id, user_id, name, logo_url, description, industry, size, website, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: contact_requests; Type: TABLE DATA; Schema: public; Owner: skillbridge_user
--

COPY public.contact_requests (id, sender_id, receiver_id, status, message, created_at, updated_at) FROM stdin;
64985e55-e14d-474e-aaf7-f8e0672a6288	e3cc033a-7303-4d4b-808b-1674b1ba9ae6	f21aaa21-d347-4285-93ff-5e8350875939	ignored	hi fira do you have time to talk 	2026-02-15 14:17:06.604475	2026-02-15 14:32:06.673379
8098eef9-b46d-4553-864f-514bb0bb81c3	e3cc033a-7303-4d4b-808b-1674b1ba9ae6	414ba292-0d37-4c7d-ae04-55087e863fe2	accepted	do you need this job	2026-02-15 15:50:23.349345	2026-02-15 15:50:47.010663
\.


--
-- Data for Name: content_reports; Type: TABLE DATA; Schema: public; Owner: skillbridge_user
--

COPY public.content_reports (id, reporter_id, content_type, content_id, reason, status, admin_notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: developer_bookmarks; Type: TABLE DATA; Schema: public; Owner: skillbridge_user
--

COPY public.developer_bookmarks (id, company_id, developer_id, created_at) FROM stdin;
\.


--
-- Data for Name: endorsements; Type: TABLE DATA; Schema: public; Owner: skillbridge_user
--

COPY public.endorsements (id, endorser_id, endorsed_id, skill_id, message, created_at) FROM stdin;
\.


--
-- Data for Name: follows; Type: TABLE DATA; Schema: public; Owner: skillbridge_user
--

COPY public.follows (follower_id, following_id, created_at) FROM stdin;
f21aaa21-d347-4285-93ff-5e8350875939	414ba292-0d37-4c7d-ae04-55087e863fe2	2026-02-23 12:03:41.489862+03
\.


--
-- Data for Name: github_repositories; Type: TABLE DATA; Schema: public; Owner: skillbridge_user
--

COPY public.github_repositories (id, profile_id, name, description, stars, forks, language, last_updated, is_pinned, is_hidden, is_public, custom_description, demo_url, readme_preview, created_at, updated_at) FROM stdin;
4a21c561-aed0-4818-9b08-733d1d708c85	ee24b89e-f8f7-4046-97eb-33e326b8c0a6	sql-labs	\N	0	0	\N	2026-02-01 09:57:29	f	f	t	\N	\N	\N	2026-02-01 16:55:29.892859	2026-02-01 16:55:29.892859
de33d5cc-3a8f-4d53-b688-2ac8e131f9fe	ee24b89e-f8f7-4046-97eb-33e326b8c0a6	FiraBro	Config files for my GitHub profile.	0	0	\N	2026-01-28 23:21:47	f	f	t	\N	\N	\N	2026-02-01 16:55:29.892859	2026-02-01 16:55:29.892859
5cf04c5a-22ca-4650-9f00-ff21b8c31339	ee24b89e-f8f7-4046-97eb-33e326b8c0a6	OIMS	\N	0	1	JavaScript	2026-01-27 16:57:29	f	f	t	\N	\N	\N	2026-02-01 16:55:29.892859	2026-02-01 16:55:29.892859
f7e191a0-f262-4254-8a82-ea2813af7f05	ee24b89e-f8f7-4046-97eb-33e326b8c0a6	Proccess-Management	\N	0	0	C	2026-01-24 14:37:53	f	f	t	\N	\N	\N	2026-02-01 16:55:29.892859	2026-02-01 16:55:29.892859
8989cbcc-3538-4c69-8043-233fba5766c3	ee24b89e-f8f7-4046-97eb-33e326b8c0a6	modern-shopping	\N	0	0	JavaScript	2026-01-06 14:06:19	f	f	t	\N	\N	\N	2026-02-01 16:55:29.892859	2026-02-01 16:55:29.892859
9eba87a2-aceb-432b-aec3-f7c88542a127	ee24b89e-f8f7-4046-97eb-33e326b8c0a6	rice-up	\N	0	0	\N	2025-12-26 22:43:26	f	f	t	\N	\N	\N	2026-02-01 16:55:29.892859	2026-02-01 16:55:29.892859
dd83e19a-4ac7-47ab-be4c-2d3de44b6867	ee24b89e-f8f7-4046-97eb-33e326b8c0a6	Eventify	\N	0	0	Go	2025-12-26 00:07:01	f	f	t	\N	\N	\N	2026-02-01 16:55:29.892859	2026-02-01 16:55:29.892859
42c26a3a-3788-49f7-af63-fc2a9bdf036b	ee24b89e-f8f7-4046-97eb-33e326b8c0a6	Aquisitions	\N	0	0	JavaScript	2025-12-20 10:33:53	f	f	t	\N	\N	\N	2026-02-01 16:55:29.892859	2026-02-01 16:55:29.892859
155054ea-f9b3-486b-90cf-05d94a34cbeb	ee24b89e-f8f7-4046-97eb-33e326b8c0a6	Learning-Pipline	\N	0	0	JavaScript	2025-12-15 11:01:43	f	f	t	\N	\N	\N	2026-02-01 16:55:29.892859	2026-02-01 16:55:29.892859
730a363b-d293-46a5-88e5-0e58d4774482	ee24b89e-f8f7-4046-97eb-33e326b8c0a6	smartMarketPlace	\N	0	0	JavaScript	2025-11-22 00:16:32	f	f	t	\N	\N	\N	2026-02-01 16:55:29.892859	2026-02-01 16:55:29.892859
6568f7d1-46e9-43df-acaa-9af1267960a0	ee24b89e-f8f7-4046-97eb-33e326b8c0a6	Social	\N	0	0	Go	2025-11-21 23:06:32	f	f	t	\N	\N	\N	2026-02-01 16:55:29.892859	2026-02-01 16:55:29.892859
a7e5e3e8-1ff5-4bfa-aa50-d1068b4c8fa0	ee24b89e-f8f7-4046-97eb-33e326b8c0a6	Elarning	\N	3	1	JavaScript	2025-11-05 23:14:38	f	f	t	\N	\N	\N	2026-02-01 16:55:29.892859	2026-02-01 16:55:29.892859
4e993503-6e8c-421e-a777-e25043f72841	ee24b89e-f8f7-4046-97eb-33e326b8c0a6	react-native-recipe-app	\N	0	0	JavaScript	2025-08-10 08:59:09	f	f	t	\N	\N	\N	2026-02-01 16:55:29.892859	2026-02-01 16:55:29.892859
905ab21d-8ce5-4628-bb76-7e807766f165	ee24b89e-f8f7-4046-97eb-33e326b8c0a6	EcomerceApi	\N	0	0	JavaScript	2025-08-08 07:46:30	f	f	t	\N	\N	\N	2026-02-01 16:55:29.892859	2026-02-01 16:55:29.892859
b207d7d6-3c21-46ac-bbf3-ef79deeb0dc6	ee24b89e-f8f7-4046-97eb-33e326b8c0a6	MyExpoApp	\N	0	0	JavaScript	2025-07-17 12:34:54	f	f	t	\N	\N	\N	2026-02-01 16:55:29.892859	2026-02-01 16:55:29.892859
8ab26d23-66dd-40a0-b967-635efba7a105	ee24b89e-f8f7-4046-97eb-33e326b8c0a6	Admin	\N	0	0	JavaScript	2025-06-26 10:13:34	f	f	t	\N	\N	\N	2026-02-01 16:55:29.892859	2026-02-01 16:55:29.892859
3e02e335-309f-46bf-a679-753b46f8924b	ee24b89e-f8f7-4046-97eb-33e326b8c0a6	FiraHub	\N	1	0	JavaScript	2025-06-12 10:20:45	f	f	t	\N	\N	\N	2026-02-01 16:55:29.892859	2026-02-01 16:55:29.892859
114b8a21-a8ab-48ea-b5b1-426e6d3ffe76	ee24b89e-f8f7-4046-97eb-33e326b8c0a6	HashawaProduct	This is hashawaproduct website	2	1	JavaScript	2025-06-10 09:44:13	f	f	t	\N	\N	\N	2026-02-01 16:55:29.892859	2026-02-01 16:55:29.892859
74b3accf-92a6-4683-bc5c-74cdaa40c358	ee24b89e-f8f7-4046-97eb-33e326b8c0a6	LibraryManagementSystem	\N	0	0	Java	2025-06-06 22:24:02	f	f	t	\N	\N	\N	2026-02-01 16:55:29.892859	2026-02-01 16:55:29.892859
76f4c3f0-b110-4d25-8d25-28b628dd14c2	ee24b89e-f8f7-4046-97eb-33e326b8c0a6	Todo-List	\N	0	0	JavaScript	2025-05-26 20:51:48	f	f	t	\N	\N	\N	2026-02-01 16:55:29.892859	2026-02-01 16:55:29.892859
06b96b5d-5752-4246-b8e8-431e986567a1	ee24b89e-f8f7-4046-97eb-33e326b8c0a6	Quiz-App	\N	1	0	JavaScript	2025-05-26 20:51:43	f	f	t	\N	\N	\N	2026-02-01 16:55:29.892859	2026-02-01 16:55:29.892859
93b36f1f-a9c6-49ea-a57f-b6582d43c36e	ee24b89e-f8f7-4046-97eb-33e326b8c0a6	Expence-Tracker	\N	1	0	JavaScript	2025-05-26 20:51:41	f	f	t	\N	\N	\N	2026-02-01 16:55:29.892859	2026-02-01 16:55:29.892859
578a1f32-3d03-4b5b-b533-53db8e96a71f	ee24b89e-f8f7-4046-97eb-33e326b8c0a6	EmailSends	\N	1	0	JavaScript	2025-05-26 20:51:39	f	f	t	\N	\N	\N	2026-02-01 16:55:29.892859	2026-02-01 16:55:29.892859
374cc1bd-b5e8-47e1-a946-677899ed3f93	ee24b89e-f8f7-4046-97eb-33e326b8c0a6	PreAPI	\N	1	0	JavaScript	2025-05-26 20:51:37	f	f	t	\N	\N	\N	2026-02-01 16:55:29.892859	2026-02-01 16:55:29.892859
f0d68303-7287-4ba5-987e-eb73ed0cceff	ee24b89e-f8f7-4046-97eb-33e326b8c0a6	Auth-API	\N	1	0	JavaScript	2025-05-26 20:51:36	f	f	t	\N	\N	\N	2026-02-01 16:55:29.892859	2026-02-01 16:55:29.892859
dbd61fef-7865-45e6-bc72-97fee8bc6626	ee24b89e-f8f7-4046-97eb-33e326b8c0a6	Food-Delivery	\N	1	0	JavaScript	2025-05-26 20:51:31	f	f	t	\N	\N	\N	2026-02-01 16:55:29.892859	2026-02-01 16:55:29.892859
e43eaec7-0925-457d-af3a-f1e29e7f6341	ee24b89e-f8f7-4046-97eb-33e326b8c0a6	shoeAdmin	\N	1	0	JavaScript	2025-05-26 20:51:17	f	f	t	\N	\N	\N	2026-02-01 16:55:29.892859	2026-02-01 16:55:29.892859
a95eca59-8159-4dc8-be12-db50e315c060	ee24b89e-f8f7-4046-97eb-33e326b8c0a6	React-Query	Learning react query	0	0	JavaScript	2025-05-21 08:54:32	f	f	t	\N	\N	\N	2026-02-01 16:55:29.892859	2026-02-01 16:55:29.892859
596933ba-1562-458d-84c5-dacf2e2f9cec	ee24b89e-f8f7-4046-97eb-33e326b8c0a6	shoes-project	\N	0	2	HTML	2025-05-20 07:50:05	f	f	t	\N	\N	\N	2026-02-01 16:55:29.892859	2026-02-01 16:55:29.892859
7503f8d0-5f45-48c4-9f4d-f49d091a8f2a	ee24b89e-f8f7-4046-97eb-33e326b8c0a6	Budget-App	\N	0	0	CSS	2025-02-07 11:16:29	f	f	t	\N	\N	\N	2026-02-01 16:55:29.892859	2026-02-01 16:55:29.892859
\.


--
-- Data for Name: github_stats; Type: TABLE DATA; Schema: public; Owner: skillbridge_user
--

COPY public.github_stats (profile_id, public_repos, followers, total_stars, total_commits, commits_30d, is_active, last_activity, account_created, last_synced_at, top_languages, contribution_streak, consistency_score, github_bio, github_following, account_age_months, weekly_activity, most_active_days, verification_status, last_sync_with_github, github_username) FROM stdin;
ee24b89e-f8f7-4046-97eb-33e326b8c0a6	33	18	14	285	285	t	2026-02-01 06:57:29	2024-12-18 06:19:40	2026-02-01 16:55:29.838607	["JavaScript", "CSS", "Go", "Java", "C"]	30	0.66	Creative Developer	17	13	{"Friday": 0, "Monday": 0, "Sunday": 4, "Tuesday": 18, "Saturday": 2, "Thursday": 2, "Wednesday": 4}	{}	verified	2026-02-01 16:55:29.838607	\N
\.


--
-- Data for Name: job_applications; Type: TABLE DATA; Schema: public; Owner: skillbridge_user
--

COPY public.job_applications (id, job_id, developer_id, message, status, applied_at, private_notes, hiring_status, updated_at, milestones, total_bid_amount) FROM stdin;
d95fcfdc-a3e4-48a5-ad75-b05e771544fe	3f206eea-f860-442a-97c2-dcb0f96f6989	414ba292-0d37-4c7d-ae04-55087e863fe2	i saw and understand the problem so im ready for it to implement that with react and shadcn if you want notify me	pending	2026-02-02 21:23:26.372972	you and ammazing guy	hired	2026-02-02 22:26:29.500853	[]	0.00
a86ce6f8-efa4-4f54-bcd7-8ec909de3bde	3f206eea-f860-442a-97c2-dcb0f96f6989	f21aaa21-d347-4285-93ff-5e8350875939	nanananananannananananananananannanan	pending	2026-02-10 16:00:02.652895	\N	applied	2026-02-10 16:00:02.652895	[{"amount": 80, "description": "backend "}]	80.00
\.


--
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: skillbridge_user
--

COPY public.jobs (id, client_id, title, description, budget_range, status, required_skills, created_at, updated_at, expected_outcome, trial_friendly, is_published) FROM stdin;
3f206eea-f860-442a-97c2-dcb0f96f6989	e3cc033a-7303-4d4b-808b-1674b1ba9ae6	Landin Page	We need an experinced reactjs developer that implement landing page for nexamart tech solution 	15-20	open	["React,Shadcn"]	2026-02-02 21:21:37.283693	2026-02-02 21:21:37.283693	a modern ui that explain every thing about next mart	t	t
\.


--
-- Data for Name: platform_settings; Type: TABLE DATA; Schema: public; Owner: skillbridge_user
--

COPY public.platform_settings (key, value, description, updated_at) FROM stdin;
reputation_weights	{"like": 3, "post": 15, "repo": 5, "star": 2, "skill": 10, "commit": 0.1, "project": 20, "follower": 3, "commit_30d": 2, "endorsement": 25, "longevity_max": 50}	Weights used by the reputation engine to calculate user scores.	2026-01-30 10:22:39.284585
\.


--
-- Data for Name: post_comments; Type: TABLE DATA; Schema: public; Owner: skillbridge_user
--

COPY public.post_comments (id, post_id, user_id, content, created_at, deleted_at) FROM stdin;
2	6124149b-4f05-4e75-8fa1-2c97de62e232	414ba292-0d37-4c7d-ae04-55087e863fe2	This is a great post!	2026-02-01 17:55:54.536495	2026-02-01 18:02:13.030547
3	a791638c-0310-4d4b-bcd4-5fa35d97cb9c	f21aaa21-d347-4285-93ff-5e8350875939	wow mashallah	2026-02-09 18:59:44.12187	\N
4	a791638c-0310-4d4b-bcd4-5fa35d97cb9c	f21aaa21-d347-4285-93ff-5e8350875939	Mashalla maali abo bekumsi akkana rabbin iti sif ha ida'u	2026-02-23 12:16:22.439966	\N
\.


--
-- Data for Name: post_likes; Type: TABLE DATA; Schema: public; Owner: skillbridge_user
--

COPY public.post_likes (id, post_id, user_id) FROM stdin;
1	6124149b-4f05-4e75-8fa1-2c97de62e232	f21aaa21-d347-4285-93ff-5e8350875939
39	a791638c-0310-4d4b-bcd4-5fa35d97cb9c	f21aaa21-d347-4285-93ff-5e8350875939
\.


--
-- Data for Name: post_tags; Type: TABLE DATA; Schema: public; Owner: skillbridge_user
--

COPY public.post_tags (post_id, tag_id) FROM stdin;
\.


--
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: skillbridge_user
--

COPY public.posts (id, author_id, title, slug, markdown, sanitized_html, views, created_at, updated_at, like_count, shares_count, deleted_at, cover_image) FROM stdin;
1335f587-ea08-40cc-8a93-08903451c37e	f21aaa21-d347-4285-93ff-5e8350875939	Best Post	best-post-1	# Building a Modern Markdown-Based Post Editor in React (Deep Dive)\n\nCreating a great writing experience is **not about adding more features** — it’s about removing friction.  \nIn this post, we’ll break down how a modern **Markdown-powered post editor** is built using **React**, **React Query**, and **clean UX principles**, focusing on *why* each decision matters, not just *how* it works.\n\n---\n\n## Why Markdown Still Wins for Content Creation\n\nMarkdown is simple, readable, and powerful.  \nInstead of fighting a heavy WYSIWYG editor, writers focus on **ideas**, while developers gain:\n\n- Predictable content structure\n- Easy storage and rendering\n- Full control over styling\n- Platform independence\n\nMarkdown turns writing into **thinking**, not formatting.\n\n---\n\n## Architecture Overview\n\nAt a high level, the editor is composed of five core systems:\n\n1. **State Management** (React Hooks)\n2. **Live Preview Toggle**\n3. **Image Upload & Preview**\n4. **Tag Normalization & Validation**\n5. **Optimistic Publishing with React Query**\n\nEach part is intentionally minimal — because complexity kills creativity.\n\n---\n\n## 1. State-Driven Writing Experience\n\nEvery piece of user input is controlled:\n\n- `title`\n- `markdown`\n- `tags`\n- `coverImage`\n- `previewMode`\n\nThis ensures:\n- Instant UI feedback\n- Reliable validation\n- Predictable publishing behavior\n\n```js\nconst [title, setTitle] = useState("");\nconst [markdown, setMarkdown] = useState("");\nconst [tags, setTags] = useState([]);\n	<h1>Building a Modern Markdown-Based Post Editor in React (Deep Dive)</h1>\n<p>Creating a great writing experience is <strong>not about adding more features</strong> — it’s about removing friction.<br />In this post, we’ll break down how a modern <strong>Markdown-powered post editor</strong> is built using <strong>React</strong>, <strong>React Query</strong>, and <strong>clean UX principles</strong>, focusing on <em>why</em> each decision matters, not just <em>how</em> it works.</p>\n<hr />\n<h2>Why Markdown Still Wins for Content Creation</h2>\n<p>Markdown is simple, readable, and powerful.<br />Instead of fighting a heavy WYSIWYG editor, writers focus on <strong>ideas</strong>, while developers gain:</p>\n<ul>\n<li>Predictable content structure</li>\n<li>Easy storage and rendering</li>\n<li>Full control over styling</li>\n<li>Platform independence</li>\n</ul>\n<p>Markdown turns writing into <strong>thinking</strong>, not formatting.</p>\n<hr />\n<h2>Architecture Overview</h2>\n<p>At a high level, the editor is composed of five core systems:</p>\n<ol>\n<li><strong>State Management</strong> (React Hooks)</li>\n<li><strong>Live Preview Toggle</strong></li>\n<li><strong>Image Upload &amp; Preview</strong></li>\n<li><strong>Tag Normalization &amp; Validation</strong></li>\n<li><strong>Optimistic Publishing with React Query</strong></li>\n</ol>\n<p>Each part is intentionally minimal — because complexity kills creativity.</p>\n<hr />\n<h2>1. State-Driven Writing Experience</h2>\n<p>Every piece of user input is controlled:</p>\n<ul>\n<li><code>title</code></li>\n<li><code>markdown</code></li>\n<li><code>tags</code></li>\n<li><code>coverImage</code></li>\n<li><code>previewMode</code></li>\n</ul>\n<p>This ensures:</p>\n<ul>\n<li>Instant UI feedback</li>\n<li>Reliable validation</li>\n<li>Predictable publishing behavior</li>\n</ul>\n<pre><code>const [title, setTitle] = useState("");\nconst [markdown, setMarkdown] = useState("");\nconst [tags, setTags] = useState([]);\n</code></pre>\n	0	2026-02-19 12:15:02.485492	2026-02-19 12:15:02.485492	0	0	2026-02-19 12:31:18.259084	\N
a791638c-0310-4d4b-bcd4-5fa35d97cb9c	414ba292-0d37-4c7d-ae04-55087e863fe2	how-to-build-a-responsive-ui	how-to-build-a-responsive-ui	\n   Building responsive UIs can be tricky, but with proper flex, min-width, and gap management, you can make your feed look professional across all devices. Here's a step-by-step guide to achieve a Dev.to style post layout using React and Tailwind CSS...	<p>   Building responsive UIs can be tricky, but with proper flex, min-width, and gap management, you can make your feed look professional across all devices. Here's a step-by-step guide to achieve a Dev.to style post layout using React and Tailwind CSS...</p>\n	109	2026-02-01 22:36:22.151336	2026-02-01 22:36:22.151336	1	11	\N	\N
6124149b-4f05-4e75-8fa1-2c97de62e232	f21aaa21-d347-4285-93ff-5e8350875939	mamamama	mamamama	annnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm	<p>annnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm</p>\n	1	2026-02-01 17:14:49.057506	2026-02-01 17:14:49.057506	1	1	2026-02-01 23:03:27.883959	\N
9f5228fd-dbb2-4a72-8ba0-e203fe981ef8	f21aaa21-d347-4285-93ff-5e8350875939	Best Post	best-post	# Building a Modern Markdown-Based Post Editor in React (Deep Dive)\n\nCreating a great writing experience is **not about adding more features** — it’s about removing friction.  \nIn this post, we’ll break down how a modern **Markdown-powered post editor** is built using **React**, **React Query**, and **clean UX principles**, focusing on *why* each decision matters, not just *how* it works.\n\n---\n\n## Why Markdown Still Wins for Content Creation\n\nMarkdown is simple, readable, and powerful.  \nInstead of fighting a heavy WYSIWYG editor, writers focus on **ideas**, while developers gain:\n\n- Predictable content structure\n- Easy storage and rendering\n- Full control over styling\n- Platform independence\n\nMarkdown turns writing into **thinking**, not formatting.\n\n---\n\n## Architecture Overview\n\nAt a high level, the editor is composed of five core systems:\n\n1. **State Management** (React Hooks)\n2. **Live Preview Toggle**\n3. **Image Upload & Preview**\n4. **Tag Normalization & Validation**\n5. **Optimistic Publishing with React Query**\n\nEach part is intentionally minimal — because complexity kills creativity.\n\n---\n\n## 1. State-Driven Writing Experience\n\nEvery piece of user input is controlled:\n\n- `title`\n- `markdown`\n- `tags`\n- `coverImage`\n- `previewMode`\n\nThis ensures:\n- Instant UI feedback\n- Reliable validation\n- Predictable publishing behavior\n\n```js\nconst [title, setTitle] = useState("");\nconst [markdown, setMarkdown] = useState("");\nconst [tags, setTags] = useState([]);\n	<h1>Building a Modern Markdown-Based Post Editor in React (Deep Dive)</h1>\n<p>Creating a great writing experience is <strong>not about adding more features</strong> — it’s about removing friction.<br />In this post, we’ll break down how a modern <strong>Markdown-powered post editor</strong> is built using <strong>React</strong>, <strong>React Query</strong>, and <strong>clean UX principles</strong>, focusing on <em>why</em> each decision matters, not just <em>how</em> it works.</p>\n<hr />\n<h2>Why Markdown Still Wins for Content Creation</h2>\n<p>Markdown is simple, readable, and powerful.<br />Instead of fighting a heavy WYSIWYG editor, writers focus on <strong>ideas</strong>, while developers gain:</p>\n<ul>\n<li>Predictable content structure</li>\n<li>Easy storage and rendering</li>\n<li>Full control over styling</li>\n<li>Platform independence</li>\n</ul>\n<p>Markdown turns writing into <strong>thinking</strong>, not formatting.</p>\n<hr />\n<h2>Architecture Overview</h2>\n<p>At a high level, the editor is composed of five core systems:</p>\n<ol>\n<li><strong>State Management</strong> (React Hooks)</li>\n<li><strong>Live Preview Toggle</strong></li>\n<li><strong>Image Upload &amp; Preview</strong></li>\n<li><strong>Tag Normalization &amp; Validation</strong></li>\n<li><strong>Optimistic Publishing with React Query</strong></li>\n</ol>\n<p>Each part is intentionally minimal — because complexity kills creativity.</p>\n<hr />\n<h2>1. State-Driven Writing Experience</h2>\n<p>Every piece of user input is controlled:</p>\n<ul>\n<li><code>title</code></li>\n<li><code>markdown</code></li>\n<li><code>tags</code></li>\n<li><code>coverImage</code></li>\n<li><code>previewMode</code></li>\n</ul>\n<p>This ensures:</p>\n<ul>\n<li>Instant UI feedback</li>\n<li>Reliable validation</li>\n<li>Predictable publishing behavior</li>\n</ul>\n<pre><code>const [title, setTitle] = useState("");\nconst [markdown, setMarkdown] = useState("");\nconst [tags, setTags] = useState([]);\n</code></pre>\n	0	2026-02-19 11:21:03.258381	2026-02-19 11:21:03.258381	0	0	2026-02-19 12:13:58.652273	\N
7467e860-bf72-467e-99be-26b6a072712b	f21aaa21-d347-4285-93ff-5e8350875939	Best Post	best-post-2	# Building a Modern Markdown-Based Post Editor in React (Deep Dive)\n\nCreating a great writing experience is **not about adding more features** — it’s about removing friction.  \nIn this post, we’ll break down how a modern **Markdown-powered post editor** is built using **React**, **React Query**, and **clean UX principles**, focusing on *why* each decision matters, not just *how* it works.\n\n---\n\n## Why Markdown Still Wins for Content Creation\n\nMarkdown is simple, readable, and powerful.  \nInstead of fighting a heavy WYSIWYG editor, writers focus on **ideas**, while developers gain:\n\n- Predictable content structure\n- Easy storage and rendering\n- Full control over styling\n- Platform independence\n\nMarkdown turns writing into **thinking**, not formatting.\n\n---\n\n## Architecture Overview\n\nAt a high level, the editor is composed of five core systems:\n\n1. **State Management** (React Hooks)\n2. **Live Preview Toggle**\n3. **Image Upload & Preview**\n4. **Tag Normalization & Validation**\n5. **Optimistic Publishing with React Query**\n\nEach part is intentionally minimal — because complexity kills creativity.\n\n---\n\n## 1. State-Driven Writing Experience\n\nEvery piece of user input is controlled:\n\n- `title`\n- `markdown`\n- `tags`\n- `coverImage`\n- `previewMode`\n\nThis ensures:\n- Instant UI feedback\n- Reliable validation\n- Predictable publishing behavior\n\n```js\nconst [title, setTitle] = useState("");\nconst [markdown, setMarkdown] = useState("");\nconst [tags, setTags] = useState([]);\n	<h1>Building a Modern Markdown-Based Post Editor in React (Deep Dive)</h1>\n<p>Creating a great writing experience is <strong>not about adding more features</strong> — it’s about removing friction.<br />In this post, we’ll break down how a modern <strong>Markdown-powered post editor</strong> is built using <strong>React</strong>, <strong>React Query</strong>, and <strong>clean UX principles</strong>, focusing on <em>why</em> each decision matters, not just <em>how</em> it works.</p>\n<hr />\n<h2>Why Markdown Still Wins for Content Creation</h2>\n<p>Markdown is simple, readable, and powerful.<br />Instead of fighting a heavy WYSIWYG editor, writers focus on <strong>ideas</strong>, while developers gain:</p>\n<ul>\n<li>Predictable content structure</li>\n<li>Easy storage and rendering</li>\n<li>Full control over styling</li>\n<li>Platform independence</li>\n</ul>\n<p>Markdown turns writing into <strong>thinking</strong>, not formatting.</p>\n<hr />\n<h2>Architecture Overview</h2>\n<p>At a high level, the editor is composed of five core systems:</p>\n<ol>\n<li><strong>State Management</strong> (React Hooks)</li>\n<li><strong>Live Preview Toggle</strong></li>\n<li><strong>Image Upload &amp; Preview</strong></li>\n<li><strong>Tag Normalization &amp; Validation</strong></li>\n<li><strong>Optimistic Publishing with React Query</strong></li>\n</ol>\n<p>Each part is intentionally minimal — because complexity kills creativity.</p>\n<hr />\n<h2>1. State-Driven Writing Experience</h2>\n<p>Every piece of user input is controlled:</p>\n<ul>\n<li><code>title</code></li>\n<li><code>markdown</code></li>\n<li><code>tags</code></li>\n<li><code>coverImage</code></li>\n<li><code>previewMode</code></li>\n</ul>\n<p>This ensures:</p>\n<ul>\n<li>Instant UI feedback</li>\n<li>Reliable validation</li>\n<li>Predictable publishing behavior</li>\n</ul>\n<pre><code>const [title, setTitle] = useState("");\nconst [markdown, setMarkdown] = useState("");\nconst [tags, setTags] = useState([]);\n</code></pre>\n	0	2026-02-19 12:32:18.743632	2026-02-19 12:32:18.743632	0	0	2026-02-19 12:40:51.987736	\N
4cb27063-890b-498c-8302-32d7e1bb5e49	f21aaa21-d347-4285-93ff-5e8350875939	Best Post	best-post-3	# Building a Modern Markdown-Based Post Editor in React (Deep Dive)\n\nCreating a great writing experience is **not about adding more features** — it’s about removing friction.  \nIn this post, we’ll break down how a modern **Markdown-powered post editor** is built using **React**, **React Query**, and **clean UX principles**, focusing on *why* each decision matters, not just *how* it works.\n\n---\n\n## Why Markdown Still Wins for Content Creation\n\nMarkdown is simple, readable, and powerful.  \nInstead of fighting a heavy WYSIWYG editor, writers focus on **ideas**, while developers gain:\n\n- Predictable content structure\n- Easy storage and rendering\n- Full control over styling\n- Platform independence\n\nMarkdown turns writing into **thinking**, not formatting.\n\n---\n\n## Architecture Overview\n\nAt a high level, the editor is composed of five core systems:\n\n1. **State Management** (React Hooks)\n2. **Live Preview Toggle**\n3. **Image Upload & Preview**\n4. **Tag Normalization & Validation**\n5. **Optimistic Publishing with React Query**\n\nEach part is intentionally minimal — because complexity kills creativity.\n\n---\n\n## 1. State-Driven Writing Experience\n\nEvery piece of user input is controlled:\n\n- `title`\n- `markdown`\n- `tags`\n- `coverImage`\n- `previewMode`\n\nThis ensures:\n- Instant UI feedback\n- Reliable validation\n- Predictable publishing behavior\n\n```js\nconst [title, setTitle] = useState("");\nconst [markdown, setMarkdown] = useState("");\nconst [tags, setTags] = useState([]);\n	<h1>Building a Modern Markdown-Based Post Editor in React (Deep Dive)</h1>\n<p>Creating a great writing experience is <strong>not about adding more features</strong> — it’s about removing friction.<br />In this post, we’ll break down how a modern <strong>Markdown-powered post editor</strong> is built using <strong>React</strong>, <strong>React Query</strong>, and <strong>clean UX principles</strong>, focusing on <em>why</em> each decision matters, not just <em>how</em> it works.</p>\n<hr />\n<h2>Why Markdown Still Wins for Content Creation</h2>\n<p>Markdown is simple, readable, and powerful.<br />Instead of fighting a heavy WYSIWYG editor, writers focus on <strong>ideas</strong>, while developers gain:</p>\n<ul>\n<li>Predictable content structure</li>\n<li>Easy storage and rendering</li>\n<li>Full control over styling</li>\n<li>Platform independence</li>\n</ul>\n<p>Markdown turns writing into <strong>thinking</strong>, not formatting.</p>\n<hr />\n<h2>Architecture Overview</h2>\n<p>At a high level, the editor is composed of five core systems:</p>\n<ol>\n<li><strong>State Management</strong> (React Hooks)</li>\n<li><strong>Live Preview Toggle</strong></li>\n<li><strong>Image Upload &amp; Preview</strong></li>\n<li><strong>Tag Normalization &amp; Validation</strong></li>\n<li><strong>Optimistic Publishing with React Query</strong></li>\n</ol>\n<p>Each part is intentionally minimal — because complexity kills creativity.</p>\n<hr />\n<h2>1. State-Driven Writing Experience</h2>\n<p>Every piece of user input is controlled:</p>\n<ul>\n<li><code>title</code></li>\n<li><code>markdown</code></li>\n<li><code>tags</code></li>\n<li><code>coverImage</code></li>\n<li><code>previewMode</code></li>\n</ul>\n<p>This ensures:</p>\n<ul>\n<li>Instant UI feedback</li>\n<li>Reliable validation</li>\n<li>Predictable publishing behavior</li>\n</ul>\n<pre><code>const [title, setTitle] = useState("");\nconst [markdown, setMarkdown] = useState("");\nconst [tags, setTags] = useState([]);\n</code></pre>\n	0	2026-02-19 12:42:43.20075	2026-02-19 12:42:43.20075	0	0	2026-02-19 13:54:26.125729	\N
d69d1ee9-53c1-40f4-b0a6-56599fc0f8b9	f21aaa21-d347-4285-93ff-5e8350875939	Best Post	best-post-4	# Building a Modern Markdown-Based Post Editor in React (Deep Dive)\n\nCreating a great writing experience is **not about adding more features** — it’s about removing friction.  \nIn this post, we’ll break down how a modern **Markdown-powered post editor** is built using **React**, **React Query**, and **clean UX principles**, focusing on *why* each decision matters, not just *how* it works.\n\n---\n\n## Why Markdown Still Wins for Content Creation\n\nMarkdown is simple, readable, and powerful.  \nInstead of fighting a heavy WYSIWYG editor, writers focus on **ideas**, while developers gain:\n\n- Predictable content structure\n- Easy storage and rendering\n- Full control over styling\n- Platform independence\n\nMarkdown turns writing into **thinking**, not formatting.\n\n---\n\n## Architecture Overview\n\nAt a high level, the editor is composed of five core systems:\n\n1. **State Management** (React Hooks)\n2. **Live Preview Toggle**\n3. **Image Upload & Preview**\n4. **Tag Normalization & Validation**\n5. **Optimistic Publishing with React Query**\n\nEach part is intentionally minimal — because complexity kills creativity.\n\n---\n\n## 1. State-Driven Writing Experience\n\nEvery piece of user input is controlled:\n\n- `title`\n- `markdown`\n- `tags`\n- `coverImage`\n- `previewMode`\n\nThis ensures:\n- Instant UI feedback\n- Reliable validation\n- Predictable publishing behavior\n\n```js\nconst [title, setTitle] = useState("");\nconst [markdown, setMarkdown] = useState("");\nconst [tags, setTags] = useState([]);\n	<h1>Building a Modern Markdown-Based Post Editor in React (Deep Dive)</h1>\n<p>Creating a great writing experience is <strong>not about adding more features</strong> — it’s about removing friction.<br />In this post, we’ll break down how a modern <strong>Markdown-powered post editor</strong> is built using <strong>React</strong>, <strong>React Query</strong>, and <strong>clean UX principles</strong>, focusing on <em>why</em> each decision matters, not just <em>how</em> it works.</p>\n<hr />\n<h2>Why Markdown Still Wins for Content Creation</h2>\n<p>Markdown is simple, readable, and powerful.<br />Instead of fighting a heavy WYSIWYG editor, writers focus on <strong>ideas</strong>, while developers gain:</p>\n<ul>\n<li>Predictable content structure</li>\n<li>Easy storage and rendering</li>\n<li>Full control over styling</li>\n<li>Platform independence</li>\n</ul>\n<p>Markdown turns writing into <strong>thinking</strong>, not formatting.</p>\n<hr />\n<h2>Architecture Overview</h2>\n<p>At a high level, the editor is composed of five core systems:</p>\n<ol>\n<li><strong>State Management</strong> (React Hooks)</li>\n<li><strong>Live Preview Toggle</strong></li>\n<li><strong>Image Upload &amp; Preview</strong></li>\n<li><strong>Tag Normalization &amp; Validation</strong></li>\n<li><strong>Optimistic Publishing with React Query</strong></li>\n</ol>\n<p>Each part is intentionally minimal — because complexity kills creativity.</p>\n<hr />\n<h2>1. State-Driven Writing Experience</h2>\n<p>Every piece of user input is controlled:</p>\n<ul>\n<li><code>title</code></li>\n<li><code>markdown</code></li>\n<li><code>tags</code></li>\n<li><code>coverImage</code></li>\n<li><code>previewMode</code></li>\n</ul>\n<p>This ensures:</p>\n<ul>\n<li>Instant UI feedback</li>\n<li>Reliable validation</li>\n<li>Predictable publishing behavior</li>\n</ul>\n<pre><code>const [title, setTitle] = useState("");\nconst [markdown, setMarkdown] = useState("");\nconst [tags, setTags] = useState([]);\n</code></pre>\n	0	2026-02-19 13:54:52.567162	2026-02-19 13:54:52.567162	0	0	2026-02-19 14:06:43.500069	\N
be82a5e5-9aac-428f-aa26-dab631b952d4	f21aaa21-d347-4285-93ff-5e8350875939	Best Post	best-post-5	# Building a Modern Markdown-Based Post Editor in React (Deep Dive)\n\nCreating a great writing experience is **not about adding more features** — it’s about removing friction.  \nIn this post, we’ll break down how a modern **Markdown-powered post editor** is built using **React**, **React Query**, and **clean UX principles**, focusing on *why* each decision matters, not just *how* it works.\n\n---\n\n## Why Markdown Still Wins for Content Creation\n\nMarkdown is simple, readable, and powerful.  \nInstead of fighting a heavy WYSIWYG editor, writers focus on **ideas**, while developers gain:\n\n- Predictable content structure\n- Easy storage and rendering\n- Full control over styling\n- Platform independence\n\nMarkdown turns writing into **thinking**, not formatting.\n\n---\n\n## Architecture Overview\n\nAt a high level, the editor is composed of five core systems:\n\n1. **State Management** (React Hooks)\n2. **Live Preview Toggle**\n3. **Image Upload & Preview**\n4. **Tag Normalization & Validation**\n5. **Optimistic Publishing with React Query**\n\nEach part is intentionally minimal — because complexity kills creativity.\n\n---\n\n## 1. State-Driven Writing Experience\n\nEvery piece of user input is controlled:\n\n- `title`\n- `markdown`\n- `tags`\n- `coverImage`\n- `previewMode`\n\nThis ensures:\n- Instant UI feedback\n- Reliable validation\n- Predictable publishing behavior\n\n```js\nconst [title, setTitle] = useState("");\nconst [markdown, setMarkdown] = useState("");\nconst [tags, setTags] = useState([]);\n	<h1>Building a Modern Markdown-Based Post Editor in React (Deep Dive)</h1>\n<p>Creating a great writing experience is <strong>not about adding more features</strong> — it’s about removing friction.<br />In this post, we’ll break down how a modern <strong>Markdown-powered post editor</strong> is built using <strong>React</strong>, <strong>React Query</strong>, and <strong>clean UX principles</strong>, focusing on <em>why</em> each decision matters, not just <em>how</em> it works.</p>\n<hr />\n<h2>Why Markdown Still Wins for Content Creation</h2>\n<p>Markdown is simple, readable, and powerful.<br />Instead of fighting a heavy WYSIWYG editor, writers focus on <strong>ideas</strong>, while developers gain:</p>\n<ul>\n<li>Predictable content structure</li>\n<li>Easy storage and rendering</li>\n<li>Full control over styling</li>\n<li>Platform independence</li>\n</ul>\n<p>Markdown turns writing into <strong>thinking</strong>, not formatting.</p>\n<hr />\n<h2>Architecture Overview</h2>\n<p>At a high level, the editor is composed of five core systems:</p>\n<ol>\n<li><strong>State Management</strong> (React Hooks)</li>\n<li><strong>Live Preview Toggle</strong></li>\n<li><strong>Image Upload &amp; Preview</strong></li>\n<li><strong>Tag Normalization &amp; Validation</strong></li>\n<li><strong>Optimistic Publishing with React Query</strong></li>\n</ol>\n<p>Each part is intentionally minimal — because complexity kills creativity.</p>\n<hr />\n<h2>1. State-Driven Writing Experience</h2>\n<p>Every piece of user input is controlled:</p>\n<ul>\n<li><code>title</code></li>\n<li><code>markdown</code></li>\n<li><code>tags</code></li>\n<li><code>coverImage</code></li>\n<li><code>previewMode</code></li>\n</ul>\n<p>This ensures:</p>\n<ul>\n<li>Instant UI feedback</li>\n<li>Reliable validation</li>\n<li>Predictable publishing behavior</li>\n</ul>\n<pre><code>const [title, setTitle] = useState("");\nconst [markdown, setMarkdown] = useState("");\nconst [tags, setTags] = useState([]);\n</code></pre>\n	0	2026-02-19 14:07:15.592475	2026-02-19 14:07:15.592475	0	0	2026-02-19 14:15:40.12589	\N
c19df36e-f397-4a40-bb6a-ed199a98f585	f21aaa21-d347-4285-93ff-5e8350875939	Best Post	best-post-6	# Building a Modern Markdown-Based Post Editor in React (Deep Dive)\n\nCreating a great writing experience is **not about adding more features** — it’s about removing friction.  \nIn this post, we’ll break down how a modern **Markdown-powered post editor** is built using **React**, **React Query**, and **clean UX principles**, focusing on *why* each decision matters, not just *how* it works.\n\n---\n\n## Why Markdown Still Wins for Content Creation\n\nMarkdown is simple, readable, and powerful.  \nInstead of fighting a heavy WYSIWYG editor, writers focus on **ideas**, while developers gain:\n\n- Predictable content structure\n- Easy storage and rendering\n- Full control over styling\n- Platform independence\n\nMarkdown turns writing into **thinking**, not formatting.\n\n---\n\n## Architecture Overview\n\nAt a high level, the editor is composed of five core systems:\n\n1. **State Management** (React Hooks)\n2. **Live Preview Toggle**\n3. **Image Upload & Preview**\n4. **Tag Normalization & Validation**\n5. **Optimistic Publishing with React Query**\n\nEach part is intentionally minimal — because complexity kills creativity.\n\n---\n\n## 1. State-Driven Writing Experience\n\nEvery piece of user input is controlled:\n\n- `title`\n- `markdown`\n- `tags`\n- `coverImage`\n- `previewMode`\n\nThis ensures:\n- Instant UI feedback\n- Reliable validation\n- Predictable publishing behavior\n\n```js\nconst [title, setTitle] = useState("");\nconst [markdown, setMarkdown] = useState("");\nconst [tags, setTags] = useState([]);\n	<h1>Building a Modern Markdown-Based Post Editor in React (Deep Dive)</h1>\n<p>Creating a great writing experience is <strong>not about adding more features</strong> — it’s about removing friction.<br />In this post, we’ll break down how a modern <strong>Markdown-powered post editor</strong> is built using <strong>React</strong>, <strong>React Query</strong>, and <strong>clean UX principles</strong>, focusing on <em>why</em> each decision matters, not just <em>how</em> it works.</p>\n<hr />\n<h2>Why Markdown Still Wins for Content Creation</h2>\n<p>Markdown is simple, readable, and powerful.<br />Instead of fighting a heavy WYSIWYG editor, writers focus on <strong>ideas</strong>, while developers gain:</p>\n<ul>\n<li>Predictable content structure</li>\n<li>Easy storage and rendering</li>\n<li>Full control over styling</li>\n<li>Platform independence</li>\n</ul>\n<p>Markdown turns writing into <strong>thinking</strong>, not formatting.</p>\n<hr />\n<h2>Architecture Overview</h2>\n<p>At a high level, the editor is composed of five core systems:</p>\n<ol>\n<li><strong>State Management</strong> (React Hooks)</li>\n<li><strong>Live Preview Toggle</strong></li>\n<li><strong>Image Upload &amp; Preview</strong></li>\n<li><strong>Tag Normalization &amp; Validation</strong></li>\n<li><strong>Optimistic Publishing with React Query</strong></li>\n</ol>\n<p>Each part is intentionally minimal — because complexity kills creativity.</p>\n<hr />\n<h2>1. State-Driven Writing Experience</h2>\n<p>Every piece of user input is controlled:</p>\n<ul>\n<li><code>title</code></li>\n<li><code>markdown</code></li>\n<li><code>tags</code></li>\n<li><code>coverImage</code></li>\n<li><code>previewMode</code></li>\n</ul>\n<p>This ensures:</p>\n<ul>\n<li>Instant UI feedback</li>\n<li>Reliable validation</li>\n<li>Predictable publishing behavior</li>\n</ul>\n<pre><code>const [title, setTitle] = useState("");\nconst [markdown, setMarkdown] = useState("");\nconst [tags, setTags] = useState([]);\n</code></pre>\n	0	2026-02-19 14:16:06.105757	2026-02-19 14:16:06.105757	0	0	2026-02-19 14:17:53.383208	\N
bf928267-ef8a-478f-9a7b-31993de030f5	f21aaa21-d347-4285-93ff-5e8350875939	Best Post Of The Year	best-post-of-the-year	# Building a Modern Markdown-Based Post Editor in React (Deep Dive)\r\n\r\nCreating a great writing experience is **not about adding more features** — it’s about removing friction.  \r\nIn this post, we’ll break down how a modern **Markdown-powered post editor** is built using **React**, **React Query**, and **clean UX principles**, focusing on *why* each decision matters, not just *how* it works.\r\n\r\n---\r\n\r\n## Why Markdown Still Wins for Content Creation\r\n\r\nMarkdown is simple, readable, and powerful.  \r\nInstead of fighting a heavy WYSIWYG editor, writers focus on **ideas**, while developers gain:\r\n\r\n- Predictable content structure\r\n- Easy storage and rendering\r\n- Full control over styling\r\n- Platform independence\r\n\r\nMarkdown turns writing into **thinking**, not formatting.\r\n\r\n---\r\n\r\n## Architecture Overview\r\n\r\nAt a high level, the editor is composed of five core systems:\r\n\r\n1. **State Management** (React Hooks)\r\n2. **Live Preview Toggle**\r\n3. **Image Upload & Preview**\r\n4. **Tag Normalization & Validation**\r\n5. **Optimistic Publishing with React Query**\r\n\r\nEach part is intentionally minimal — because complexity kills creativity.\r\n\r\n---\r\n\r\n## 1. State-Driven Writing Experience\r\n\r\nEvery piece of user input is controlled:\r\n\r\n- `title`\r\n- `markdown`\r\n- `tags`\r\n- `coverImage`\r\n- `previewMode`\r\n\r\nThis ensures:\r\n- Instant UI feedback\r\n- Reliable validation\r\n- Predictable publishing behavior\r\n\r\n```js\r\nconst [title, setTitle] = useState("");\r\nconst [markdown, setMarkdown] = useState("");\r\nconst [tags, setTags] = useState([]);\r\n	<h1>Building a Modern Markdown-Based Post Editor in React (Deep Dive)</h1>\n<p>Creating a great writing experience is <strong>not about adding more features</strong> — it’s about removing friction.<br />In this post, we’ll break down how a modern <strong>Markdown-powered post editor</strong> is built using <strong>React</strong>, <strong>React Query</strong>, and <strong>clean UX principles</strong>, focusing on <em>why</em> each decision matters, not just <em>how</em> it works.</p>\n<hr />\n<h2>Why Markdown Still Wins for Content Creation</h2>\n<p>Markdown is simple, readable, and powerful.<br />Instead of fighting a heavy WYSIWYG editor, writers focus on <strong>ideas</strong>, while developers gain:</p>\n<ul>\n<li>Predictable content structure</li>\n<li>Easy storage and rendering</li>\n<li>Full control over styling</li>\n<li>Platform independence</li>\n</ul>\n<p>Markdown turns writing into <strong>thinking</strong>, not formatting.</p>\n<hr />\n<h2>Architecture Overview</h2>\n<p>At a high level, the editor is composed of five core systems:</p>\n<ol>\n<li><strong>State Management</strong> (React Hooks)</li>\n<li><strong>Live Preview Toggle</strong></li>\n<li><strong>Image Upload &amp; Preview</strong></li>\n<li><strong>Tag Normalization &amp; Validation</strong></li>\n<li><strong>Optimistic Publishing with React Query</strong></li>\n</ol>\n<p>Each part is intentionally minimal — because complexity kills creativity.</p>\n<hr />\n<h2>1. State-Driven Writing Experience</h2>\n<p>Every piece of user input is controlled:</p>\n<ul>\n<li><code>title</code></li>\n<li><code>markdown</code></li>\n<li><code>tags</code></li>\n<li><code>coverImage</code></li>\n<li><code>previewMode</code></li>\n</ul>\n<p>This ensures:</p>\n<ul>\n<li>Instant UI feedback</li>\n<li>Reliable validation</li>\n<li>Predictable publishing behavior</li>\n</ul>\n<pre><code>const [title, setTitle] = useState("");\nconst [markdown, setMarkdown] = useState("");\nconst [tags, setTags] = useState([]);\n</code></pre>\n	0	2026-02-19 14:38:16.537675	2026-02-19 14:38:16.537675	0	0	2026-02-19 15:08:01.062287	/uploads/cover_image-1771501096470-609047929.jpeg
86460835-29e5-4925-812b-a56f786e4c20	f21aaa21-d347-4285-93ff-5e8350875939	Best Post Of The Year	best-post-of-the-year-1	# Building a Modern Markdown-Based Post Editor in React (Deep Dive)\r\n\r\nCreating a great writing experience is **not about adding more features** — it’s about removing friction.  \r\nIn this post, we’ll break down how a modern **Markdown-powered post editor** is built using **React**, **React Query**, and **clean UX principles**, focusing on *why* each decision matters, not just *how* it works.\r\n\r\n---\r\n\r\n## Why Markdown Still Wins for Content Creation\r\n\r\nMarkdown is simple, readable, and powerful.  \r\nInstead of fighting a heavy WYSIWYG editor, writers focus on **ideas**, while developers gain:\r\n\r\n- Predictable content structure\r\n- Easy storage and rendering\r\n- Full control over styling\r\n- Platform independence\r\n\r\nMarkdown turns writing into **thinking**, not formatting.\r\n\r\n---\r\n\r\n## Architecture Overview\r\n\r\nAt a high level, the editor is composed of five core systems:\r\n\r\n1. **State Management** (React Hooks)\r\n2. **Live Preview Toggle**\r\n3. **Image Upload & Preview**\r\n4. **Tag Normalization & Validation**\r\n5. **Optimistic Publishing with React Query**\r\n\r\nEach part is intentionally minimal — because complexity kills creativity.\r\n\r\n---\r\n\r\n## 1. State-Driven Writing Experience\r\n\r\nEvery piece of user input is controlled:\r\n\r\n- `title`\r\n- `markdown`\r\n- `tags`\r\n- `coverImage`\r\n- `previewMode`\r\n\r\nThis ensures:\r\n- Instant UI feedback\r\n- Reliable validation\r\n- Predictable publishing behavior\r\n\r\n```js\r\nconst [title, setTitle] = useState("");\r\nconst [markdown, setMarkdown] = useState("");\r\nconst [tags, setTags] = useState([]);\r\n	<h1>Building a Modern Markdown-Based Post Editor in React (Deep Dive)</h1>\n<p>Creating a great writing experience is <strong>not about adding more features</strong> — it’s about removing friction.<br />In this post, we’ll break down how a modern <strong>Markdown-powered post editor</strong> is built using <strong>React</strong>, <strong>React Query</strong>, and <strong>clean UX principles</strong>, focusing on <em>why</em> each decision matters, not just <em>how</em> it works.</p>\n<hr />\n<h2>Why Markdown Still Wins for Content Creation</h2>\n<p>Markdown is simple, readable, and powerful.<br />Instead of fighting a heavy WYSIWYG editor, writers focus on <strong>ideas</strong>, while developers gain:</p>\n<ul>\n<li>Predictable content structure</li>\n<li>Easy storage and rendering</li>\n<li>Full control over styling</li>\n<li>Platform independence</li>\n</ul>\n<p>Markdown turns writing into <strong>thinking</strong>, not formatting.</p>\n<hr />\n<h2>Architecture Overview</h2>\n<p>At a high level, the editor is composed of five core systems:</p>\n<ol>\n<li><strong>State Management</strong> (React Hooks)</li>\n<li><strong>Live Preview Toggle</strong></li>\n<li><strong>Image Upload &amp; Preview</strong></li>\n<li><strong>Tag Normalization &amp; Validation</strong></li>\n<li><strong>Optimistic Publishing with React Query</strong></li>\n</ol>\n<p>Each part is intentionally minimal — because complexity kills creativity.</p>\n<hr />\n<h2>1. State-Driven Writing Experience</h2>\n<p>Every piece of user input is controlled:</p>\n<ul>\n<li><code>title</code></li>\n<li><code>markdown</code></li>\n<li><code>tags</code></li>\n<li><code>coverImage</code></li>\n<li><code>previewMode</code></li>\n</ul>\n<p>This ensures:</p>\n<ul>\n<li>Instant UI feedback</li>\n<li>Reliable validation</li>\n<li>Predictable publishing behavior</li>\n</ul>\n<pre><code>const [title, setTitle] = useState("");\nconst [markdown, setMarkdown] = useState("");\nconst [tags, setTags] = useState([]);\n</code></pre>\n	0	2026-02-19 15:08:34.787823	2026-02-19 15:08:34.787823	0	8	\N	/uploads/cover_image-1771502914724-696112452.jpeg
\.


--
-- Data for Name: profile_skills; Type: TABLE DATA; Schema: public; Owner: skillbridge_user
--

COPY public.profile_skills (profile_id, skill_id) FROM stdin;
\.


--
-- Data for Name: profile_views; Type: TABLE DATA; Schema: public; Owner: skillbridge_user
--

COPY public.profile_views (id, profile_id, viewer_id, viewer_role, created_at) FROM stdin;
\.


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: skillbridge_user
--

COPY public.profiles (id, user_id, username, full_name, bio, location, github_username, reputation_score, joined_at, updated_at, deleted_at) FROM stdin;
e2b7b586-ed44-4f9d-bf1b-a4ba60768f91	414ba292-0d37-4c7d-ae04-55087e863fe2	users	users	\N	\N	\N	0	2026-01-30 10:30:59.923365	2026-01-30 10:30:59.923365	\N
8a2124bf-ac8a-4ae3-8a0a-d1d24461607a	e3cc033a-7303-4d4b-808b-1674b1ba9ae6	company	company	\N	\N	\N	0	2026-01-30 11:37:07.665468	2026-01-30 11:37:07.665468	\N
ee24b89e-f8f7-4046-97eb-33e326b8c0a6	f21aaa21-d347-4285-93ff-5e8350875939	jemal-firagos	Jemal Firagos	\N	\N	\N	0	2026-01-30 23:09:39.845336	2026-01-30 23:09:39.845336	\N
50fb1ee8-7b92-490f-b462-549d4a6de846	1f9f94a2-20c4-43ce-a137-2eda97d5a3f5	admin	admin	\N	\N	\N	0	2026-02-08 10:35:39.591238	2026-02-08 10:35:39.591238	\N
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: skillbridge_user
--

COPY public.projects (id, user_id, title, github_repo, live_demo, tech_stack, description, thumbnail, views, visibility, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: reputation_history; Type: TABLE DATA; Schema: public; Owner: skillbridge_user
--

COPY public.reputation_history (id, user_id, previous_score, new_score, change_amount, reason, metadata, created_at) FROM stdin;
\.


--
-- Data for Name: skills; Type: TABLE DATA; Schema: public; Owner: skillbridge_user
--

COPY public.skills (id, name) FROM stdin;
\.


--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: skillbridge_user
--

COPY public.tags (id, name) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: skillbridge_user
--

COPY public.users (id, email, password_hash, name, role, is_active, is_verified, password_reset_token, password_reset_expires, created_at, updated_at, github_id, github_username, avatar_url, onboarding_completed, github_verified, github_connected_at, username) FROM stdin;
414ba292-0d37-4c7d-ae04-55087e863fe2	user@test.com	$2b$12$UUMoaIrr.mO1.oZEms.DEuXtfWhStP1Ur9wyDJ/KEDL3/pkp0Xngy	users	developer	t	f	\N	\N	2026-01-30 10:30:59.913158	2026-01-30 10:30:59.913158	\N	\N	\N	f	f	\N	users
e3cc033a-7303-4d4b-808b-1674b1ba9ae6	company@test.com	$2b$12$RfYapY7v7Zd.w1pLkB.ttOkFq/J2QYQXFTgycEhNFa2afQZWCN3Ei	company	company	t	f	\N	\N	2026-01-30 11:37:07.6611	2026-01-30 11:37:07.6611	\N	\N	\N	f	f	\N	company
f21aaa21-d347-4285-93ff-5e8350875939	jemalfiragos@gmail.com	$2b$12$ArktADn0rXUm2HcXHZnnde7z36f0XiFvhIMUvAdihdgVZa.c89T/S	Jemal Firagos	developer	t	f	\N	\N	2026-01-30 23:09:39.839561	2026-01-30 23:09:39.839561	192071818	FiraBro	\N	f	t	2026-02-01 16:55:21.082204	jemal-firagos
1f9f94a2-20c4-43ce-a137-2eda97d5a3f5	admin@gmail.com	$2b$12$Qm9lb79IRiwCCpyOkSX9h.ugxobMcN5uh0odM6uLj0CSVdh2msQka	admin	admin	t	f	\N	\N	2026-02-08 10:35:39.585916	2026-02-08 10:35:39.585916	\N	\N	\N	f	f	\N	admin
\.


--
-- Name: post_comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: skillbridge_user
--

SELECT pg_catalog.setval('public.post_comments_id_seq', 4, true);


--
-- Name: post_likes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: skillbridge_user
--

SELECT pg_catalog.setval('public.post_likes_id_seq', 39, true);


--
-- Name: projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: skillbridge_user
--

SELECT pg_catalog.setval('public.projects_id_seq', 1, false);


--
-- Name: skills_id_seq; Type: SEQUENCE SET; Schema: public; Owner: skillbridge_user
--

SELECT pg_catalog.setval('public.skills_id_seq', 1, false);


--
-- Name: tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: skillbridge_user
--

SELECT pg_catalog.setval('public.tags_id_seq', 1, false);


--
-- Name: company_profiles company_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.company_profiles
    ADD CONSTRAINT company_profiles_pkey PRIMARY KEY (id);


--
-- Name: company_profiles company_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.company_profiles
    ADD CONSTRAINT company_profiles_user_id_key UNIQUE (user_id);


--
-- Name: contact_requests contact_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.contact_requests
    ADD CONSTRAINT contact_requests_pkey PRIMARY KEY (id);


--
-- Name: content_reports content_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.content_reports
    ADD CONSTRAINT content_reports_pkey PRIMARY KEY (id);


--
-- Name: developer_bookmarks developer_bookmarks_company_id_developer_id_key; Type: CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.developer_bookmarks
    ADD CONSTRAINT developer_bookmarks_company_id_developer_id_key UNIQUE (company_id, developer_id);


--
-- Name: developer_bookmarks developer_bookmarks_pkey; Type: CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.developer_bookmarks
    ADD CONSTRAINT developer_bookmarks_pkey PRIMARY KEY (id);


--
-- Name: endorsements endorsements_pkey; Type: CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.endorsements
    ADD CONSTRAINT endorsements_pkey PRIMARY KEY (id);


--
-- Name: follows follows_pkey; Type: CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT follows_pkey PRIMARY KEY (follower_id, following_id);


--
-- Name: github_repositories github_repositories_pkey; Type: CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.github_repositories
    ADD CONSTRAINT github_repositories_pkey PRIMARY KEY (id);


--
-- Name: github_stats github_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.github_stats
    ADD CONSTRAINT github_stats_pkey PRIMARY KEY (profile_id);


--
-- Name: job_applications job_applications_job_id_developer_id_key; Type: CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.job_applications
    ADD CONSTRAINT job_applications_job_id_developer_id_key UNIQUE (job_id, developer_id);


--
-- Name: job_applications job_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.job_applications
    ADD CONSTRAINT job_applications_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: platform_settings platform_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.platform_settings
    ADD CONSTRAINT platform_settings_pkey PRIMARY KEY (key);


--
-- Name: post_comments post_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.post_comments
    ADD CONSTRAINT post_comments_pkey PRIMARY KEY (id);


--
-- Name: post_likes post_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.post_likes
    ADD CONSTRAINT post_likes_pkey PRIMARY KEY (id);


--
-- Name: post_likes post_likes_post_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.post_likes
    ADD CONSTRAINT post_likes_post_id_user_id_key UNIQUE (post_id, user_id);


--
-- Name: post_tags post_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.post_tags
    ADD CONSTRAINT post_tags_pkey PRIMARY KEY (post_id, tag_id);


--
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- Name: posts posts_slug_key; Type: CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_slug_key UNIQUE (slug);


--
-- Name: profile_skills profile_skills_pkey; Type: CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.profile_skills
    ADD CONSTRAINT profile_skills_pkey PRIMARY KEY (profile_id, skill_id);


--
-- Name: profile_views profile_views_pkey; Type: CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.profile_views
    ADD CONSTRAINT profile_views_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_username_key; Type: CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_username_key UNIQUE (username);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: projects projects_user_id_github_repo_key; Type: CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_user_id_github_repo_key UNIQUE (user_id, github_repo);


--
-- Name: reputation_history reputation_history_pkey; Type: CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.reputation_history
    ADD CONSTRAINT reputation_history_pkey PRIMARY KEY (id);


--
-- Name: skills skills_name_key; Type: CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.skills
    ADD CONSTRAINT skills_name_key UNIQUE (name);


--
-- Name: skills skills_pkey; Type: CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.skills
    ADD CONSTRAINT skills_pkey PRIMARY KEY (id);


--
-- Name: tags tags_name_key; Type: CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_name_key UNIQUE (name);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: contact_requests unique_contact_request; Type: CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.contact_requests
    ADD CONSTRAINT unique_contact_request UNIQUE (sender_id, receiver_id);


--
-- Name: endorsements unique_endorsement; Type: CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.endorsements
    ADD CONSTRAINT unique_endorsement UNIQUE (endorser_id, endorsed_id, skill_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_github_id_key; Type: CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_github_id_key UNIQUE (github_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_bookmarks_company; Type: INDEX; Schema: public; Owner: skillbridge_user
--

CREATE INDEX idx_bookmarks_company ON public.developer_bookmarks USING btree (company_id);


--
-- Name: idx_company_profiles_user; Type: INDEX; Schema: public; Owner: skillbridge_user
--

CREATE INDEX idx_company_profiles_user ON public.company_profiles USING btree (user_id);


--
-- Name: idx_contact_requests_receiver; Type: INDEX; Schema: public; Owner: skillbridge_user
--

CREATE INDEX idx_contact_requests_receiver ON public.contact_requests USING btree (receiver_id);


--
-- Name: idx_endorsements_endorsed; Type: INDEX; Schema: public; Owner: skillbridge_user
--

CREATE INDEX idx_endorsements_endorsed ON public.endorsements USING btree (endorsed_id);


--
-- Name: idx_endorsements_endorser; Type: INDEX; Schema: public; Owner: skillbridge_user
--

CREATE INDEX idx_endorsements_endorser ON public.endorsements USING btree (endorser_id);


--
-- Name: idx_endorsements_skill; Type: INDEX; Schema: public; Owner: skillbridge_user
--

CREATE INDEX idx_endorsements_skill ON public.endorsements USING btree (skill_id);


--
-- Name: idx_follows_follower; Type: INDEX; Schema: public; Owner: skillbridge_user
--

CREATE INDEX idx_follows_follower ON public.follows USING btree (follower_id);


--
-- Name: idx_github_repositories_is_pinned; Type: INDEX; Schema: public; Owner: skillbridge_user
--

CREATE INDEX idx_github_repositories_is_pinned ON public.github_repositories USING btree (is_pinned);


--
-- Name: idx_github_repositories_name; Type: INDEX; Schema: public; Owner: skillbridge_user
--

CREATE INDEX idx_github_repositories_name ON public.github_repositories USING btree (name);


--
-- Name: idx_github_repositories_profile_id; Type: INDEX; Schema: public; Owner: skillbridge_user
--

CREATE INDEX idx_github_repositories_profile_id ON public.github_repositories USING btree (profile_id);


--
-- Name: idx_job_apps_developer; Type: INDEX; Schema: public; Owner: skillbridge_user
--

CREATE INDEX idx_job_apps_developer ON public.job_applications USING btree (developer_id);


--
-- Name: idx_job_apps_status; Type: INDEX; Schema: public; Owner: skillbridge_user
--

CREATE INDEX idx_job_apps_status ON public.job_applications USING btree (hiring_status);


--
-- Name: idx_jobs_status; Type: INDEX; Schema: public; Owner: skillbridge_user
--

CREATE INDEX idx_jobs_status ON public.jobs USING btree (status);


--
-- Name: idx_posts_author; Type: INDEX; Schema: public; Owner: skillbridge_user
--

CREATE INDEX idx_posts_author ON public.posts USING btree (author_id);


--
-- Name: idx_posts_slug; Type: INDEX; Schema: public; Owner: skillbridge_user
--

CREATE INDEX idx_posts_slug ON public.posts USING btree (slug);


--
-- Name: idx_profile_views_profile; Type: INDEX; Schema: public; Owner: skillbridge_user
--

CREATE INDEX idx_profile_views_profile ON public.profile_views USING btree (profile_id);


--
-- Name: idx_profiles_username; Type: INDEX; Schema: public; Owner: skillbridge_user
--

CREATE INDEX idx_profiles_username ON public.profiles USING btree (username);


--
-- Name: idx_projects_created_at; Type: INDEX; Schema: public; Owner: skillbridge_user
--

CREATE INDEX idx_projects_created_at ON public.projects USING btree (created_at DESC);


--
-- Name: idx_projects_tech_stack; Type: INDEX; Schema: public; Owner: skillbridge_user
--

CREATE INDEX idx_projects_tech_stack ON public.projects USING gin (tech_stack);


--
-- Name: idx_projects_user_id; Type: INDEX; Schema: public; Owner: skillbridge_user
--

CREATE INDEX idx_projects_user_id ON public.projects USING btree (user_id);


--
-- Name: idx_projects_views; Type: INDEX; Schema: public; Owner: skillbridge_user
--

CREATE INDEX idx_projects_views ON public.projects USING btree (views DESC);


--
-- Name: idx_reports_content; Type: INDEX; Schema: public; Owner: skillbridge_user
--

CREATE INDEX idx_reports_content ON public.content_reports USING btree (content_type, content_id);


--
-- Name: idx_reports_status; Type: INDEX; Schema: public; Owner: skillbridge_user
--

CREATE INDEX idx_reports_status ON public.content_reports USING btree (status);


--
-- Name: idx_reputation_history_created; Type: INDEX; Schema: public; Owner: skillbridge_user
--

CREATE INDEX idx_reputation_history_created ON public.reputation_history USING btree (created_at DESC);


--
-- Name: idx_reputation_history_user; Type: INDEX; Schema: public; Owner: skillbridge_user
--

CREATE INDEX idx_reputation_history_user ON public.reputation_history USING btree (user_id);


--
-- Name: post_likes trigger_update_post_like_count; Type: TRIGGER; Schema: public; Owner: skillbridge_user
--

CREATE TRIGGER trigger_update_post_like_count AFTER INSERT OR DELETE ON public.post_likes FOR EACH ROW EXECUTE FUNCTION public.update_post_like_count();


--
-- Name: company_profiles company_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.company_profiles
    ADD CONSTRAINT company_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: contact_requests contact_requests_receiver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.contact_requests
    ADD CONSTRAINT contact_requests_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: contact_requests contact_requests_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.contact_requests
    ADD CONSTRAINT contact_requests_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: content_reports content_reports_reporter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.content_reports
    ADD CONSTRAINT content_reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: developer_bookmarks developer_bookmarks_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.developer_bookmarks
    ADD CONSTRAINT developer_bookmarks_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: developer_bookmarks developer_bookmarks_developer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.developer_bookmarks
    ADD CONSTRAINT developer_bookmarks_developer_id_fkey FOREIGN KEY (developer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: endorsements endorsements_endorsed_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.endorsements
    ADD CONSTRAINT endorsements_endorsed_id_fkey FOREIGN KEY (endorsed_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: endorsements endorsements_endorser_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.endorsements
    ADD CONSTRAINT endorsements_endorser_id_fkey FOREIGN KEY (endorser_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: endorsements endorsements_skill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.endorsements
    ADD CONSTRAINT endorsements_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES public.skills(id) ON DELETE CASCADE;


--
-- Name: follows follows_follower_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT follows_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: follows follows_following_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT follows_following_id_fkey FOREIGN KEY (following_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: github_repositories github_repositories_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.github_repositories
    ADD CONSTRAINT github_repositories_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: github_stats github_stats_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.github_stats
    ADD CONSTRAINT github_stats_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: job_applications job_applications_developer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.job_applications
    ADD CONSTRAINT job_applications_developer_id_fkey FOREIGN KEY (developer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: job_applications job_applications_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.job_applications
    ADD CONSTRAINT job_applications_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: jobs jobs_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: post_comments post_comments_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.post_comments
    ADD CONSTRAINT post_comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: post_comments post_comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.post_comments
    ADD CONSTRAINT post_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: post_likes post_likes_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.post_likes
    ADD CONSTRAINT post_likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: post_likes post_likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.post_likes
    ADD CONSTRAINT post_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: post_tags post_tags_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.post_tags
    ADD CONSTRAINT post_tags_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: post_tags post_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.post_tags
    ADD CONSTRAINT post_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;


--
-- Name: posts posts_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id);


--
-- Name: profile_skills profile_skills_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.profile_skills
    ADD CONSTRAINT profile_skills_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: profile_skills profile_skills_skill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.profile_skills
    ADD CONSTRAINT profile_skills_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES public.skills(id) ON DELETE CASCADE;


--
-- Name: profile_views profile_views_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.profile_views
    ADD CONSTRAINT profile_views_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: profile_views profile_views_viewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.profile_views
    ADD CONSTRAINT profile_views_viewer_id_fkey FOREIGN KEY (viewer_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: profiles profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: projects projects_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: reputation_history reputation_history_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: skillbridge_user
--

ALTER TABLE ONLY public.reputation_history
    ADD CONSTRAINT reputation_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 091yV3o1Qtv4bvlalEx7X0bIqUWGG6kSvDc7xOu4PWghZ9tE5hLMbCTr6vRZh2L

