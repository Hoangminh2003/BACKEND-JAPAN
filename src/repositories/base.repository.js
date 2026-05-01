/**
 * Base repository with common CRUD operations.
 * All repositories extend this class.
 */
export default class BaseRepository {
    constructor(model) {
        this.model = model;
    }

    async findById(id, options = {}) {
        const query = this.model.findById(id);
        if (options.select) query.select(options.select);
        if (options.populate) query.populate(options.populate);
        if (options.lean) query.lean();
        return query;
    }

    async findOne(filter, options = {}) {
        const query = this.model.findOne(filter);
        if (options.select) query.select(options.select);
        if (options.populate) query.populate(options.populate);
        if (options.lean) query.lean();
        return query;
    }

}
