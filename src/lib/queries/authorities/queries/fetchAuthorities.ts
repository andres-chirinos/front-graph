import { getUnifiedData } from '../../localData';
import type { Authority } from '../../types';

export async function fetchAuthorities(
  options: { search?: string; limit?: number; offset?: number } = {}
): Promise<{ documents: Authority[]; total: number }> {
  const { search, limit = 25, offset = 0 } = options;

  try {
    const { candidates } = await getUnifiedData();
    
    let filtered = candidates;
    if (search) {
      const q = search.toLowerCase();
      filtered = candidates.filter(c => 
        c.label?.toLowerCase().includes(q) || 
        c.role?.toLowerCase().includes(q) ||
        c.territorio?.toLowerCase().includes(q)
      );
    }

    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);

    return {
      documents: paginated as Authority[],
      total,
    };
  } catch (error) {
    console.error('Error fetching authorities:', error);
    return { documents: [], total: 0 };
  }
}
