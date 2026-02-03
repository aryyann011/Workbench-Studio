import dynamicIconImports from "lucide-react/dynamicIconImports";

const CATEGORIES: Record<string, {icon : string; color : string; regex : RegExp}> = {
    database : {
        icon : 'database',
        color : '#3b82f6',
        regex : /db|sql|mongo|postgres|redis|cache|store|data|supa/i
    },
    messaging : {
        icon : 'message-square',
        color : '#f97316',
        regex : /kafka|queue|mq|rabbit|pubsub|event|stream|message/i
    },
    security: { 
    icon: 'shield', 
    color: '#ef4444', // Red
    regex: /auth|guard|firewall|waf|secure|login|secret|jwt/i 
  },
  cloud: { 
    icon: 'cloud', 
    color: '#06b6d4', // Cyan
    regex: /aws|gcp|azure|cloud|net|vpc|route/i 
  },
  device: { 
    icon: 'smartphone', 
    color: '#8b5cf6', // Purple
    regex: /mobile|phone|ios|android|tablet|app/i 
  },
  web: { 
    icon: 'globe', 
    color: '#10b981', // Emerald
    regex: /web|browser|site|front|ui|client/i 
  },
  code: {
    icon: 'code-2',
    color: '#eab308', // Yellow
    regex: /func|lambda|script|js|ts|py|node/i
  },
  container: {
    icon: 'box',
    color: '#3b82f6',
    regex: /docker|kube|container|pod|service/i
  }
};

export function getIconForLabel(label : string){
    const cleanLabel = label.toLocaleLowerCase().trim();

    const kebabName = cleanLabel.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
    if(kebabName in dynamicIconImports){
        return {icon : kebabName, color : '#64748b'}
    }

    for(const key in CATEGORIES){
        if(CATEGORIES[key].regex.test(cleanLabel)){
            return {
                icon : CATEGORIES[key].icon,
                color : CATEGORIES[key].color
            };
        }
    }

    return {icon : 'server', color : '#64748b'};
}