import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

export interface Automation {
  id: string;
  name: string;
  author: string;
  department: string;
  description: string;
  tags: string[];
  systems: string[];
  time_saved_hours_per_month: number;
  annual_value_usd: number;
  created: string;
  last_updated: string;
  links: {
    runbook?: string;
    sentry?: string;
    repo?: string;
  };
  api_keys?: ApiKey[];
  diagramPath?: string;
  readmePath?: string;
}

export interface ApiKey {
  name: string;
  system: string;
  expiration: string | null;
  notes?: string;
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
}

export interface Tag {
  id: string;
  name: string;
  color: string;
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

export function getAutomationById(id: string): Automation | undefined {
  const automations = loadAutomations();
  return automations.find(a => a.id === id);
}

export function getExpiringApiKeys(daysAhead: number = 90): Array<ApiKey & { automationId: string; automationName: string }> {
  const automations = loadAutomations();
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
