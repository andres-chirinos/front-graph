import { fetchEntityById } from '../search/queries';

/**
 * Fetch full entity details (Mocked for CSV)
 */
export async function fetchEntityDetails(entityId: string) {
  try {
    const entity = await fetchEntityById(entityId);
    
    if (!entity) {
      throw new Error(`Entity not found: ${entityId}`);
    }

    const type = (entity as any).type || 'Persona';
    
    // For surveys, we can map some fields to 'claims' to satisfy existing UI if needed
    const claims = (entity as any).resultados?.map((r: any) => ({
      $id: `res_${r.item}`,
      property: { label: 'Resultado', $id: 'P_RESULTADO' },
      value_raw: `${r.label}: ${r.porcentaje}%`,
      value_string: `${r.label}: ${r.porcentaje}%`,
    })) || [];
    
    if (type === 'Encuesta') {
      const e = entity as any;
      if (e.autorLabel) {
        claims.push({
          $id: 'claim_autor',
          property: { label: 'Autor', $id: 'AUTOR' },
          value_relation: { label: e.autorLabel },
          value_string: e.autorLabel
        });
      }
      if (e.publicacion || e.fechaFin) {
        claims.push({
          $id: 'claim_fecha',
          property: { label: 'Fecha de publicación', $id: 'FECHA_PUBLICACION' },
          value_string: e.publicacion || e.fechaFin,
          value_raw: e.publicacion || e.fechaFin
        });
      }
    }

    return {
      entity,
      claims,
      entityType: type,
    };
  } catch (error) {
    console.error('Error fetching entity details (CSV):', error);
    throw error;
  }
}

