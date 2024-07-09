import { QueryType } from '../types';

const parseQuery = (overpassQL: string): QueryType => {
    try {
        const conditionRegex =
            /(\w+)(?:\((\d+)\))?\["([\p{L}\w]+)"="([\p{L}\w ]+)"\]/u;
        const idPatternRegex = /(\w+)\((\d+)\)/;

        const conditionMatch = overpassQL.match(conditionRegex);
        const idPatternMatch = overpassQL.match(idPatternRegex);

        if (!idPatternMatch && !conditionMatch) {
            return {
                elementType: null,
                conditions: {},
                error: `parse error: Unknown output format: ${overpassQL}`,
            };
        }

        if (idPatternMatch && !conditionMatch) {
            const elementType = idPatternMatch[1];
            const elementId = idPatternMatch[2];

            return {
                elementType,
                conditions: {
                    osm_id: elementId,
                },
            };
        }

        if (!conditionMatch) {
            throw new Error('Invalid Overpass QL query');
        }

        const elementType = conditionMatch ? conditionMatch[1] : null;
        const elementId = conditionMatch ? conditionMatch[2] : null;

        const keyValues: { [key: string]: any } = {};
        const keyValueRegex = /\["([\p{L}\w]+)"="([\p{L}\w ]+)"\]/gu;
        let keyValueMatch;
        while ((keyValueMatch = keyValueRegex.exec(overpassQL)) !== null) {
            const key = keyValueMatch[1];
            const value = keyValueMatch[2];
            keyValues[key] = value;
        }

        return {
            elementType,
            conditions: {
                ...keyValues,
                ...(elementId && { osm_id: elementId }),
            },
        };
    } catch (err: any) {
        return {
            elementType: null,
            conditions: {},
            error: err.message,
        };
    }
};

export default parseQuery;
