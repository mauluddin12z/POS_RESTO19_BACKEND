import { Op } from "sequelize";

export const buildQueryOptions = (query, config = {}) => {
    const {
        allowedFields = [],
        allowedSort = [],
        defaultPageSize = 10,
        maxPageSize = 100,
    } = config;

    const {
        page = 1,
        pageSize = defaultPageSize,
        sort,
        ...rawFilters
    } = query;

    // SANITIZE FILTERS
    // remove "", null, undefined
    const filters = Object.fromEntries(
        Object.entries(rawFilters).filter(([_, value]) => {
            if (value === "" || value === null || value === undefined) {
                return false;
            }

            if (Array.isArray(value)) {
                return value.length > 0;
            }

            return true;
        })
    );

    // pagination
    const pageNum = Math.max(Number(page) || 1, 1);
    const size = Math.min(Number(pageSize) || defaultPageSize, maxPageSize);
    const offset = (pageNum - 1) * size;

    const where = {};

    // FILTER BUILDER
    Object.keys(filters).forEach((key) => {
        const value = filters[key];

        const match = key.match(/^(.+)\[(.+)\]$/);

        let field = key;
        let operator = "eq";

        if (match) {
            field = match[1];
            operator = match[2];
        }

        // Skip non-allowed fields
        if (allowedFields.length && !allowedFields.includes(field)) return;

        const parsedValue = parseValue(value);

        if (!where[field]) where[field] = {};

        switch (operator) {
            case "gte":
                where[field][Op.gte] = parsedValue;
                break;

            case "lte":
                where[field][Op.lte] = parsedValue;
                break;

            case "gt":
                where[field][Op.gt] = parsedValue;
                break;

            case "lt":
                where[field][Op.lt] = parsedValue;
                break;

            case "ne":
                where[field][Op.ne] = parsedValue;
                break;

            case "like":
                where[field][Op.like] = `%${parsedValue}%`;
                break;

            case "in":
                where[field][Op.in] = String(parsedValue)
                    .split(",")
                    .map((v) => v.trim())
                    .filter(Boolean);
                break;

            default:
                // eq overwrite (important: NOT merge with Op object)
                where[field] = parsedValue;
        }
    });

    // SORT BUILDER
    let order = [];

    if (sort) {
        order = sort
            .split(",")
            .map((field) => {
                let direction = "ASC";
                let cleanField = field;

                if (field.startsWith("-")) {
                    direction = "DESC";
                    cleanField = field.slice(1);
                }

                if (
                    allowedSort.length &&
                    !allowedSort.includes(cleanField)
                ) {
                    return null;
                }

                return [cleanField, direction];
            })
            .filter(Boolean);
    }

    return {
        where,
        order,
        limit: size,
        offset,
        pagination: {
            currentPage: pageNum,
            pageSize: size,
        },
    };
};

// Helper: Type Parser
const parseValue = (value) => {
    if (typeof value !== "string") return value;

    const trimmed = value.trim();

    if (trimmed === "") return undefined;

    if (!isNaN(trimmed)) return Number(trimmed);

    if (trimmed === "true") return true;
    if (trimmed === "false") return false;

    return trimmed;
};