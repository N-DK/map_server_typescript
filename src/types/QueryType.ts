import { QueryConditions } from './QueryConditions';

export type QueryType = {
    elementType: string | null;
    conditions: QueryConditions;
    error?: string | undefined;
};
