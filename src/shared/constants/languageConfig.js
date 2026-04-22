// ─── Languages ───────────────────────────────────────────────
export const LANGUAGES_CONFIG = {
  python: {
    label: "Python",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg",
  },
  go: {
    label: "Go",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/go/go-original-wordmark.svg",
  },
  nodejs: {
    label: "Node.js",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg",
  },
  ruby: {
    label: "Ruby",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/ruby/ruby-original.svg",
  },
  rust: {
    label: "Rust",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/rust/rust-original.svg",
  },
  java: {
    label: "Java",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg",
  },
  csharp: {
    label: "C#",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/csharp/csharp-original.svg",
  },
  php: {
    label: "PHP",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/php/php-original.svg",
  },
  elixir: {
    label: "Elixir",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/elixir/elixir-original.svg",
  },
  swift: {
    label: "Swift",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/swift/swift-original.svg",
  },
};

// ─── Frontend Frameworks ──────────────────────────────────────
export const FRONTEND_FRAMEWORKS_CONFIG = {
  react: {
    label: "React",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg",
  },
  vue: {
    label: "Vue.js",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vuejs/vuejs-original.svg",
  },
  angular: {
    label: "Angular",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/angular/angular-original.svg",
  },
  svelte: {
    label: "Svelte",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/svelte/svelte-original.svg",
  },
  nextjs: {
    label: "Next.js",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg",
  },
  nuxt: {
    label: "Nuxt.js",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nuxtjs/nuxtjs-original.svg",
  },
};

// ─── Backend Frameworks ───────────────────────────────────────
export const BACKEND_FRAMEWORKS_CONFIG = {
  fastapi: {
    label: "FastAPI",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/fastapi/fastapi-original.svg",
  },
  express: {
    label: "Express",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/express/express-original.svg",
  },
  django: {
    label: "Django",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/django/django-plain.svg",
  },
  flask: {
    label: "Flask",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/flask/flask-original.svg",
  },
  rails: {
    label: "Rails",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/rails/rails-original-wordmark.svg",
  },
  spring: {
    label: "Spring",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/spring/spring-original.svg",
  },
  laravel: {
    label: "Laravel",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/laravel/laravel-original.svg",
  },
  nestjs: {
    label: "NestJS",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nestjs/nestjs-original.svg",
  },
  phoenix: {
    label: "Phoenix",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/phoenix/phoenix-original.svg",
  },
};

// ─── Databases ────────────────────────────────────────────────
export const DATABASES_CONFIG = {
  mongo: {
    label: "MongoDB",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original-wordmark.svg",
  },
  postgres: {
    label: "PostgreSQL",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg",
  },
  redis: {
    label: "Redis",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/redis/redis-original.svg",
  },
  mysql: {
    label: "MySQL",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original-wordmark.svg",
  },
  sqlite: {
    label: "SQLite",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/sqlite/sqlite-original.svg",
  },
  cassandra: {
    label: "Cassandra",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/cassandra/cassandra-original.svg",
  },
  elasticsearch: {
    label: "Elasticsearch",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/elasticsearch/elasticsearch-original.svg",
  },
};

export const SERVICE_TECH_CONFIG = {
  ...LANGUAGES_CONFIG,
  ...FRONTEND_FRAMEWORKS_CONFIG,
  ...BACKEND_FRAMEWORKS_CONFIG,
  ...DATABASES_CONFIG,
};

export const SERVICE_TECH_GROUPS = [
  { label: "Languages", options: LANGUAGES_CONFIG },
  { label: "Frontend Frameworks", options: FRONTEND_FRAMEWORKS_CONFIG },
  { label: "Backend Frameworks", options: BACKEND_FRAMEWORKS_CONFIG },
  { label: "Databases", options: DATABASES_CONFIG },
];
