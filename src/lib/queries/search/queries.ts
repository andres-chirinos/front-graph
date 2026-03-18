import type { Entity, Authority } from '../types';
import { loadCSV, aggregateCandidatos, aggregateEncuestas } from '../../utils/csvLoader';
import { normalizeText, calculateSearchScore } from './helpers';

// Cache for CSV data to avoid re-fetching
let cachedCandidatos: any[] | null = null;
let cachedMunicipalities: any[] | null = null;
let cachedEncuestas: any[] | null = null;

async function getCandidatosData() {
  if (cachedCandidatos) return cachedCandidatos;
  const rows = await loadCSV('/data/candidatos.csv');
  cachedCandidatos = aggregateCandidatos(rows);
  return cachedCandidatos;
}

async function getEncuestasData() {
  if (cachedEncuestas) return cachedEncuestas;
  const rows = await loadCSV('/data/encuestas.csv');
  cachedEncuestas = aggregateEncuestas(rows);
  return cachedEncuestas;
}

async function getMunicipalitiesData() {
  if (cachedMunicipalities) return cachedMunicipalities;
  try {
    const response = await fetch('/municipalities-index.json');
    cachedMunicipalities = await response.json();
    return cachedMunicipalities || [];
  } catch (error) {
    console.error('Error loading municipalities index:', error);
    return [];
  }
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

  console.log('[fetchEntitiesFiltered] (CSV) Filtros aplicados:', {
    search,
    entityType,
    department,
    limit,
    offset,
  });

  try {
    const [candidatos, municipalities, encuestas] = await Promise.all([
      getCandidatosData(),
      getMunicipalitiesData(),
      getEncuestasData(),
    ]);

    // Map municipalities to Entity type
    const mappedMunicipalities = municipalities.map((m: any) => ({
      $id: m.id,
      label: m.name,
      description: `Municipio - ${m.department}`,
      type: 'Municipio',
      department: m.department,
    }));

    let allEntities = [
      ...candidatos, 
      ...mappedMunicipalities, 
      ...(encuestas || []).map((e: any) => ({ ...e, type: 'Encuesta' }))
    ];

    // Filter by Type
    if (entityType && entityType !== 'Todas') {
      if (entityType === 'Municipio') {
        allEntities = mappedMunicipalities;
      } else if (entityType === 'Persona') {
        // Everything in candidatos.csv is a persona
        allEntities = candidatos;
      } else if (entityType === 'Partido Político') {
        // Unique parties from the candidatos list
        const partyNames = new Set(candidatos.map((c: any) => c.party.label).filter(Boolean));
        allEntities = Array.from(partyNames).map(name => ({
          $id: `party_${normalizeText(name as string)}`,
          label: name,
          type: 'Partido Político'
        }));
      } else if (entityType === 'Encuesta') {
        allEntities = (encuestas || []).map((e: any) => ({ ...e, type: 'Encuesta' }));
      }
    }

    // Filter by Department / Municipality
    if (department && department !== 'Todos') {
      const selectedMuni = municipalities.find((m: any) => m.id === department);
      const deptCode = selectedMuni?.ineCode?.substring(0, 2);

      allEntities = allEntities.filter((e: any) => {
        // Special logic for Governors in Persona entities
        if (e.type === 'Persona' || (e.cargos && e.cargos.length > 0)) {
          const isGobernador = e.role?.toLowerCase().includes('gobernador') || 
                              (e.cargos && e.cargos.some((c: string) => c.toLowerCase().includes('gobernador')));
          
          if (isGobernador && deptCode) {
            // Match by department code (first 2 digits of INE code)
            return e.territorioCodigos?.some((code: string) => code.substring(0, 2) === deptCode) ||
                   (e.territorioCodigo && e.territorioCodigo.substring(0, 2) === deptCode);
          }

          // Regular candidate filtering: by exact ID
          return e.territorioIds?.includes(department) || e.territorioId === department;
        }

        // Other entity types
        if (e.department === department) return true;
        if (e.territorioId === department) return true;
        if (e.coberturaId === department) return true;
        if (e.territorioLabel && e.territorioLabel.includes(department)) return true;
        if (e.coberturaLabel && e.coberturaLabel.includes(department)) return true;
        return false;
      });
    }

    // Search
    if (search) {
      const searchKey = normalizeText(search);
      const searchWords = searchKey.split(/\s+/).filter((w) => w.length > 0);
      
      allEntities = allEntities
        .map((entity) => ({
          entity,
          score: calculateSearchScore(entity as Entity, searchKey, searchWords),
        }))
        .filter((result) => result.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((result) => result.entity);
    } else {
      // Default sorting: Personas (Candidatos) first, then others
      allEntities.sort((a, b) => {
        const aIsCandi = a.cargos && a.cargos.length > 0 ? 0 : 1;
        const bIsCandi = b.cargos && b.cargos.length > 0 ? 0 : 1;
        return aIsCandi - bIsCandi;
      });
    }

    // Enrich 'Persona' entities with associated survey results
    const personas = allEntities.filter((e: any) => e.cargos && e.cargos.length > 0 || e.type === 'Persona');
    personas.forEach((persona: any) => {
      persona.results = [];
      if (encuestas) {
        encuestas.forEach((encuesta: any) => {
          const match = encuesta.resultados.find((r: any) => r.item === persona.$id);
          if (match) {
            persona.results.push({
              encuestaId: encuesta.$id,
              autorLabel: encuesta.autorLabel,
              fechaFin: encuesta.fechaFin,
              porcentaje: match.porcentaje,
              pregunta: match.pregunta
            });
          }
        });
      }
    });

    const total = allEntities.length;
    const paginated = allEntities.slice(offset, offset + limit);

    return {
      documents: paginated as Entity[],
      total,
    };
  } catch (error) {
    console.error('[fetchEntitiesFiltered] CSV Error:', error);
    return { documents: [], total: 0 };
  }
}

export async function getEntitiesByType(typeName: string): Promise<string[]> {
  const { documents } = await fetchEntitiesFiltered({ entityType: typeName, limit: 1000 });
  return documents.map(d => d.$id);
}

export async function getEntitiesByDepartment(
  departmentName: string
): Promise<string[]> {
  const { documents } = await fetchEntitiesFiltered({ department: departmentName, limit: 1000 });
  return documents.map(d => d.$id);
}

export async function fetchQuickSearchEntities(options: {
  search: string;
  limit?: number;
}) {
  const { documents, total } = await fetchEntitiesFiltered({ 
    search: options.search, 
    limit: options.limit 
  });
  return { documents, total };
}

// Minimal implementations for other exports to avoid breaks
export async function fetchEntityById(id: string): Promise<Entity | null> {
  const candidatos = await getCandidatosData();
  const candi = candidatos.find((c: any) => c.$id === id);
  if (candi) return { ...candi, type: 'Persona' } as Entity;
  
  const municipalities = await getMunicipalitiesData();
  const muni = municipalities.find((m: any) => m.id === id);
  if (muni) return { $id: muni.id, label: muni.name, description: muni.department, type: 'Municipio' } as Entity;
  
  const encuestas = await getEncuestasData();
  const encu = (encuestas || []).find((e: any) => e.$id === id);
  if (encu) return { ...encu, type: 'Encuesta' } as Entity;
  
  return null;
}

export async function getEntityById(id: string) {
  return fetchEntityById(id);
}

