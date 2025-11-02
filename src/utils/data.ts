import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

export interface AutomationLink {
  name: string;
  url: string;
}

export interface Schedule {
  frequency: string;
  time?: string;
  timezone?: string;
  days?: string[];
}

export interface Automation {
  id: string;
  name: string;
  author: string;
  department: string;
  customer?: string;
  status: 'live' | 'development' | 'backlog';
  description: string;
  tags: string[];
  systems: string[];
  time_saved_hours_per_month: number;
  annual_value_usd: number;
  created: string;
  last_updated: string;
  closed?: string;
  links?: AutomationLink[];
  schedules?: Schedule[];
  api_keys?: ApiKey[];
  diagramPath?: string;
  readmePath?: string;
}

export interface ApiKey {
  name: string;
  system: string;
  expiration: string | null;
  notes?: string;
  link?: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
}

export interface Engineer {
  id: string;
  name: string;
  role: string;
  avatar: string;
  email?: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Emojis {
  automation: string;
  timeSaved: string;
  money: string;
  chart: string;
  key: string;
  warning: string;
  calendar: string;
  checkmark: string;
  link: string;
  computer: string;
  schedule: string;
  completed: string;
  favicon: string;
}

function getDataPath(relativePath: string): string {
  return path.join(process.cwd(), relativePath);
}

export function loadAutomations(): Automation[] {
  const automationsDir = getDataPath('automations');

  if (!fs.existsSync(automationsDir)) {
    return [];
  }

  const folders = fs.readdirSync(automationsDir);
  const automations: Automation[] = [];

  for (const folder of folders) {
    const folderPath = path.join(automationsDir, folder);

    if (!fs.statSync(folderPath).isDirectory()) {
      continue;
    }

    const metadataPath = path.join(folderPath, 'metadata.yaml');

    if (!fs.existsSync(metadataPath)) {
      continue;
    }

    try {
      const content = fs.readFileSync(metadataPath, 'utf8');
      const data = yaml.load(content) as Automation;

      automations.push({
        ...data,
        id: folder,
        diagramPath: fs.existsSync(path.join(folderPath, 'diagram.svg'))
          ? `/automations/${folder}/diagram.svg`
          : undefined,
        readmePath: fs.existsSync(path.join(folderPath, 'README.md'))
          ? `/automations/${folder}/README.md`
          : undefined,
      });
    } catch (error) {
      console.error(`Error loading automation ${folder}:`, error);
    }
  }

  return automations;
}

export function loadDepartments(): Department[] {
  const filePath = getDataPath('data/departments.yaml');

  if (!fs.existsSync(filePath)) {
    return [];
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = yaml.load(content) as { departments: Department[] };
    return data.departments || [];
  } catch (error) {
    console.error('Error loading departments:', error);
    return [];
  }
}

export function loadEngineers(): Engineer[] {
  const filePath = getDataPath('data/engineers.yaml');

  if (!fs.existsSync(filePath)) {
    return [];
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = yaml.load(content) as { engineers: Engineer[] };
    return data.engineers || [];
  } catch (error) {
    console.error('Error loading engineers:', error);
    return [];
  }
}

export function loadTags(): Tag[] {
  const filePath = getDataPath('data/tags.yaml');

  if (!fs.existsSync(filePath)) {
    return [];
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = yaml.load(content) as { tags: Tag[] };
    return data.tags || [];
  } catch (error) {
    console.error('Error loading tags:', error);
    return [];
  }
}

export function loadEmojis(): Emojis {
  const filePath = getDataPath('data/emojis.yaml');

  // Default emojis if file doesn't exist
  const defaults: Emojis = {
    automation: '🤖',
    timeSaved: '🕒',
    money: '💰',
    chart: '📊',
    key: '🔑',
    warning: '⚠️',
    calendar: '📅',
    checkmark: '✅',
    link: '🔗',
    computer: '💻',
    schedule: '⏰',
    completed: '✓',
    favicon: '🤖',
  };

  if (!fs.existsSync(filePath)) {
    return defaults;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = yaml.load(content) as { emojis: Emojis };
    return { ...defaults, ...data.emojis };
  } catch (error) {
    console.error('Error loading emojis:', error);
    return defaults;
  }
}

export function getAutomationById(id: string): Automation | undefined {
  const automations = loadAutomations();
  return automations.find(a => a.id === id);
}

export function getExpiringApiKeys(daysAhead: number = 90): Array<ApiKey & { automationId: string; automationName: string }> {
  const automations = loadAutomations().filter(a => a.status === 'live');
  const expiringKeys: Array<ApiKey & { automationId: string; automationName: string }> = [];
  const now = new Date();
  const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

  for (const automation of automations) {
    if (!automation.api_keys) continue;

    for (const key of automation.api_keys) {
      if (!key.expiration) continue;

      const expiration = new Date(key.expiration);
      if (expiration >= now && expiration <= futureDate) {
        expiringKeys.push({
          ...key,
          automationId: automation.id,
          automationName: automation.name,
        });
      }
    }
  }

  return expiringKeys.sort((a, b) => {
    const dateA = new Date(a.expiration!);
    const dateB = new Date(b.expiration!);
    return dateA.getTime() - dateB.getTime();
  });
}

export function loadVersion(): string {
  const filePath = getDataPath('data/version.yaml');

  // Default version if file doesn't exist
  const defaultVersion = '1.0.0';

  if (!fs.existsSync(filePath)) {
    return defaultVersion;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = yaml.load(content) as { version: string };
    return data.version || defaultVersion;
  } catch (error) {
    console.error('Error loading version:', error);
    return defaultVersion;
  }
}
