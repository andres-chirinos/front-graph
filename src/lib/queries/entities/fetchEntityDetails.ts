import { findEntityById, getClaimsForEntity } from '../localData';
import type { Entity } from '../types';
import { deriveEntityTypeFromClaims } from './entityTypeDerivation';

/**
 * Fetch full entity details including outgoing and incoming claims.
 */
export async function fetchEntityDetails(entityId: string) {
  try {
    const entity = await findEntityById(entityId);
    if (!entity) throw new Error('Entity not found');

    const allClaims = await getClaimsForEntity(entityId);

    // Filter outgoing claims for type derivation
    const outgoingClaims = allClaims.filter(
      (c) =>
        (typeof c.subject === 'object' ? (c.subject as any)?.$id : c.subject) ===
        entityId
    );
    
    const entityType = deriveEntityTypeFromClaims(outgoingClaims, entity.label);

    return {
      entity: entity as Entity,
      claims: allClaims,
      entityType,
    };
  } catch (error) {
    console.error('Error fetching entity details:', error);
    throw error;
  }
}
