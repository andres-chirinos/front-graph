import { getUnifiedData } from '../localData';
import type { Entity } from '../types';

export async function fetchEntities(
  options: {
    search?: string;
    limit?: number;
    offset?: number;
  } = {}
) {
  const { search, limit = 25, offset = 0 } = options;
  const { candidates, surveys, parties } = await getUnifiedData();
  const all: any[] = [...candidates, ...surveys, ...parties];

  let filtered = all;
  if (search) {
    const q = search.toLowerCase();
    filtered = all.filter((e: any) => 
      e.label?.toLowerCase().includes(q) || 
      e.description?.toLowerCase().includes(q)
    );
  }

  return {
    documents: filtered.slice(offset, offset + limit),
    total: filtered.length,
  };
}

export async function fetchQuickSearchEntities(options: {
  search: string;
  limit?: number;
}) {
  const { search, limit = 5 } = options;
  const { candidates, surveys, parties } = await getUnifiedData();
  const q = search.toLowerCase();

  const combined = [
    ...candidates,
    ...surveys.map((s: any) => ({ ...s, isSurvey: true })),
    ...parties
  ];

  const filtered = combined.filter((e: any) => 
    e.label?.toLowerCase().includes(q) || 
    e.role?.toLowerCase().includes(q)
  );

  return {
    documents: filtered.slice(0, limit),
    total: filtered.length,
  };
}

export async function fetchEntitiesFiltered(
  options: {
    search?: string;
    entityType?: string;
    department?: string;
    limit?: number;
    offset?: number;
  } = {}
) {
  const { search, entityType, department, limit = 25, offset = 0 } = options;
  const { candidates, surveys, parties } = await getUnifiedData();
  
  let all: any[] = [];
  if (entityType === 'Candidatos') all = candidates;
  else if (entityType === 'Encuestas') all = surveys;
  else if (entityType === 'Partidos Políticos') all = parties;
  else all = [...candidates, ...surveys, ...parties];

  let filtered = all;
  if (search) {
    const q = search.toLowerCase();
    filtered = all.filter((e: any) => 
      e.label?.toLowerCase().includes(q) || 
      e.description?.toLowerCase().includes(q)
    );
  }

  // Department filtering simplified for now
  if (department && department !== 'Todos') {
    filtered = filtered.filter((e: any) => e.territorio === department);
  }

  return {
    documents: filtered.slice(offset, offset + limit),
    total: filtered.length,
  };
}

export async function getEntitiesByType(typeName: string): Promise<string[]> {
  const { candidates, surveys, parties } = await getUnifiedData();
  if (typeName === 'Candidato') return candidates.map((c: any) => c.$id);
  if (typeName === 'Encuesta') return surveys.map((s: any) => s.$id);
  if (typeName === 'Partido Político') return parties.map((p: any) => p.$id);
  return [];
}

export async function getEntitiesByDepartment(
  departmentName: string
): Promise<string[]> {
  const { candidates } = await getUnifiedData();
  return candidates
    .filter((c: any) => c.territorio === departmentName)
    .map((c: any) => c.$id);
}
