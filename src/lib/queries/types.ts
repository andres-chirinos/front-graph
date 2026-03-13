export interface Entity {
  $id: string;
  label?: string;
  description?: string;
  aliases?: string[];
  $createdAt?: string;
  $updatedAt?: string;
}

export interface Authority extends Entity {
  role?: string;
  party?: Entity & { color?: string };
  imageUrl?: string;
}

export interface Claim {
  $id: string;
  subject?: Entity | string;
  property?: Entity | string;
  value_raw?: string;
  value_relation?: Entity | any;
  value_string?: string;
  datatype:
    | 'string'
    | 'date'
    | 'boolean'
    | 'coordinate'
    | 'image'
    | 'json'
    | 'number'
    | 'url'
    | 'relation'
    | 'polygon'
    | 'color'
    | 'entity';
  $createdAt?: string;
  $updatedAt?: string;
}

export interface Qualifier {
  $id: string;
  claim?: Claim | string;
  property?: Entity | string;
  value_raw?: string;
  value_relation?: Entity | any;
  datatype: string;
}

export interface Reference {
  $id: string;
  claim?: Claim | string;
  reference?: Entity | string;
  details?: string;
}

export interface PolygonData {
  entityId: string;
  entityLabel: string;
  coordinates: number[][][];
  administrativeLevel: number;
  departamentName?: string;
  ineCode?: string;
  hasEntity?: boolean;
}
