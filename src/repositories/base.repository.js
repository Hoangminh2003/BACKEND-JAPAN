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

    async find(filter = {}, options = {}) {
        const query = this.model.find(filter);
        if (options.select) query.select(options.select);
        if (options.populate) query.populate(options.populate);
        if (options.sort) query.sort(options.sort);
        if (options.skip) query.skip(options.skip);
        if (options.limit) query.limit(options.limit);
        if (options.lean) query.lean();
        if (options.session) query.session(options.session);
        return query;
    }

    async create(data, options = {}) {
        if (options.session) {
            const [doc] = await this.model.create([data], { session: options.session });
            return doc;
        }
        return this.model.create(data);
    }

    async insertMany(data, options = {}) {
        return this.model.insertMany(data, options);
    }


}
