import dynamicIconImports from 'lucide-react/dynamicIconImports';

type IconConfig = { 
  icon: keyof typeof dynamicIconImports; 
  color: string; 
  regex: RegExp 
};

// ORDER MATTERS: Specific tools first, Generic categories last.
const TECH_MAP: IconConfig[] = [
  // --- 1. LANGUAGES (The "Core" Layer) ---
  { 
    icon: 'file-json', 
    color: '#F7DF1E', // JS Yellow
    regex: /\b(javascript|js|node|nodejs|express|bun|deno)\b/i 
  },
  { 
    icon: 'file-code-2', 
    color: '#3178C6', // TS Blue
    regex: /\b(typescript|ts|angular)\b/i 
  },
  { 
    icon: 'file-code', 
    color: '#3776AB', // Python Blue
    regex: /\b(python|py|django|flask|fastapi|pandas|numpy|pip)\b/i 
  },
  { 
    icon: 'coffee', 
    color: '#E76F00', // Java Orange
    regex: /\b(java|spring|boot|jvm|kotlin|scala|maven|gradle)\b/i 
  },
  { 
    icon: 'hexagon', 
    color: '#68217A', // C# Purple
    regex: /\b(csharp|c#|\.net|dotnet|asp\.net|blazor)\b/i 
  },
  { 
    icon: 'container', 
    color: '#00ADD8', // Go Blue (Fixed: uses \b to avoid matching 'mongo')
    regex: /\b(go|golang|gin|echo)\b/i 
  },
  { 
    icon: 'cog', 
    color: '#dea584', // Rust Orange
    regex: /\b(rust|cargo|tauri)\b/i 
  },
  { 
    icon: 'file-type-2', 
    color: '#777BB4', // PHP Purple
    regex: /\b(php|laravel|composer|wordpress)\b/i 
  },
  {
    icon: 'apple', // Using Apple icon for Swift/iOS
    color: '#F05138',
    regex: /\b(swift|ios|mac|xcode)\b/i
  },

  // --- 2. FRONTEND & MOBILE ---
  { 
    icon: 'atom', 
    color: '#61DAFB', // React Cyan
    regex: /\b(react|rn|native|redux|zustand)\b/i 
  },
  { 
    icon: 'smartphone', 
    color: '#02569B', // Flutter Blue
    regex: /\b(flutter|dart|mobile|android|apk)\b/i 
  },
  { 
    icon: 'zap', 
    color: '#000000', 
    regex: /\b(next|nextjs|vercel)\b/i 
  },
  { 
    icon: 'triangle', 
    color: '#4FC08D', // Vue Green
    regex: /\b(vue|nuxt|pinia|vite)\b/i 
  },
  { 
    icon: 'wind', 
    color: '#38B2AC', // Tailwind Teal
    regex: /\b(tailwind|css|sass|less|style)\b/i 
  },
  {
    icon: 'figma', // Lucide has a figma icon!
    color: '#F24E1E',
    regex: /\b(figma|design|ui|ux)\b/i
  },

  // --- 3. DATABASES & DATA ---
  { 
    icon: 'database', 
    color: '#336791', // Postgres Blue
    regex: /\b(postgres|pgsql|postgresql|cockroach|sql)\b/i 
  },
  { 
    icon: 'table-2', 
    color: '#00758F', // MySQL Blue
    regex: /\b(mysql|mariadb|sqlite)\b/i 
  },
  { 
    icon: 'leaf', 
    color: '#47A248', // Mongo Green
    regex: /\b(mongo|mongodb|mongoose)\b/i 
  },
  { 
    icon: 'layers', 
    color: '#DC382D', // Redis Red
    regex: /\b(redis|cache|memcached|keydb)\b/i 
  },
  { 
    icon: 'search', 
    color: '#005571', // Elastic/Search
    regex: /\b(elastic|elasticsearch|search|algolia|meilisearch)\b/i 
  },
  { 
    icon: 'hard-drive', 
    color: '#3FCF8E', // Supabase Green
    regex: /\b(supabase|firebase|pocketbase|appwrite)\b/i 
  },
  { 
    icon: 'hard-drive-upload', 
    color: '#569A31', // S3 Green
    regex: /\b(s3|storage|bucket|minio|cdn|cloudflare|r2)\b/i 
  },
  {
    icon: 'share-2', 
    color: '#E535AB', // GraphQL Pink
    regex: /\b(graphql|gql|apollo|trpc|prisma|drizzle)\b/i
  },

  // --- 4. MESSAGING & EVENTS ---
  { 
    icon: 'message-square-dashed', 
    color: '#231F20', // Kafka Black
    regex: /\b(kafka|confluent|stream|redpanda)\b/i 
  },
  { 
    icon: 'mail', 
    color: '#FF6600', // RabbitMQ Orange
    regex: /\b(rabbit|mq|amqp|queue|sqs|sns|activemq)\b/i 
  },
  { 
    icon: 'radio-receiver', 
    color: '#009639', // Nginx Green
    regex: /\b(nginx|proxy|gateway|envoy|apache|haproxy|kong)\b/i 
  },

  // --- 5. DEVOPS & INFRA ---
  { 
    icon: 'container', 
    color: '#2496ED', // Docker Blue
    regex: /\b(docker|container|image|compose)\b/i 
  },
  { 
    icon: 'ship-wheel', 
    color: '#326CE5', // Kubernetes Blue
    regex: /\b(kube|k8s|kubernetes|helm|pod|cluster|argocd)\b/i 
  },
  { 
    icon: 'cloud-lightning', 
    color: '#FF9900', // AWS Orange
    regex: /\b(aws|ec2|lambda|beanstalk|amplify|dynamo|dynamodb)\b/i 
  },
  { 
    icon: 'cloud-sun', 
    color: '#0078D4', // Azure Blue
    regex: /\b(azure|microsoft|entra|cosmos)\b/i 
  },
  { 
    icon: 'cloud-rain', 
    color: '#4285F4', // GCP Blue
    regex: /\b(gcp|google|cloud|compute)\b/i 
  },
  { 
    icon: 'blocks', 
    color: '#7B42BC', // Terraform Purple
    regex: /\b(terraform|hcl|iac|ansible|jenkins|circleci|github|gitlab|actions)\b/i 
  },
  {
    icon: 'activity', 
    color: '#F46800', // Grafana Orange
    regex: /\b(grafana|prometheus|monitor|observability|datadog|newrelic)\b/i
  },

  // --- 6. SECURITY & AI ---
  { 
    icon: 'shield-check', 
    color: '#EB5424', // Auth0 Orange
    regex: /\b(auth|oauth|jwt|login|guard|clerk|okta|cognito)\b/i 
  },
  { 
    icon: 'bot', 
    color: '#10A37F', // OpenAI Green
    regex: /\b(ai|gpt|llm|openai|gemini|bot|ml|model|hugging|transformer)\b/i 
  },
  
  // --- 7. GENERIC FALLBACKS (If no specific tool matches) ---
  // These use 'generic' regexes without word boundaries to catch partials
  { icon: 'smartphone', color: '#8b5cf6', regex: /mobile|phone|app/i },
  { icon: 'globe', color: '#10b981', regex: /web|browser|site|front|ui|client/i },
  { icon: 'server', color: '#64748b', regex: /server|backend|api|service/i },
  { icon: 'database', color: '#64748b', regex: /db|data|store/i },
];

export function getIconForLabel(label: string) {
  const cleanLabel = label.toLowerCase().trim();

  // 1. DIRECT LUCIDE HIT
  const kebabName = cleanLabel.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  if (kebabName in dynamicIconImports) {
    return { icon: kebabName as keyof typeof dynamicIconImports, color: '#64748b' };
  }

  // 2. TECH STACK LOOKUP
  for (const config of TECH_MAP) {
    if (config.regex.test(cleanLabel)) {
      return { 
        icon: config.icon, 
        color: config.color 
      };
    }
  }

  // 3. ULTIMATE FALLBACK
  return { icon: 'server', color: '#64748b' };
}