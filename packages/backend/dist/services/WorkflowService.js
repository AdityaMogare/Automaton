"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowService = void 0;
const database_1 = __importDefault(require("../config/database"));
class WorkflowService {
    constructor() {
        this.pool = database_1.default.getPostgresPool();
    }
    async createWorkflow(workflow) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const query = `
        INSERT INTO workflows (
          id, name, description, organization_id, created_by, 
          nodes, edges, triggers, settings, status, version, 
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *
      `;
            const values = [
                workflow.id,
                workflow.name,
                workflow.description,
                workflow.organizationId,
                workflow.createdBy,
                JSON.stringify(workflow.nodes),
                JSON.stringify(workflow.edges),
                JSON.stringify(workflow.triggers),
                JSON.stringify(workflow.settings),
                workflow.status,
                workflow.version,
                workflow.createdAt,
                workflow.updatedAt,
            ];
            const result = await client.query(query, values);
            await client.query('COMMIT');
            return this.mapRowToWorkflow(result.rows[0]);
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    async getWorkflowById(id, organizationId) {
        const query = `
      SELECT * FROM workflows 
      WHERE id = $1 AND organization_id = $2
    `;
        const result = await this.pool.query(query, [id, organizationId]);
        if (result.rows.length === 0) {
            return null;
        }
        return this.mapRowToWorkflow(result.rows[0]);
    }
    async getWorkflows(organizationId, filters) {
        const { page = 1, limit = 10, status, search, sortBy = 'created_at', sortOrder = 'desc' } = filters;
        const offset = (page - 1) * limit;
        let whereConditions = ['organization_id = $1'];
        let queryParams = [organizationId];
        let paramIndex = 2;
        if (status) {
            whereConditions.push(`status = $${paramIndex}`);
            queryParams.push(status);
            paramIndex++;
        }
        if (search) {
            whereConditions.push(`(name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`);
            queryParams.push(`%${search}%`);
            paramIndex++;
        }
        const whereClause = whereConditions.join(' AND ');
        const countQuery = `SELECT COUNT(*) FROM workflows WHERE ${whereClause}`;
        const countResult = await this.pool.query(countQuery, queryParams);
        const total = parseInt(countResult.rows[0].count);
        const dataQuery = `
      SELECT * FROM workflows 
      WHERE ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
        queryParams.push(limit, offset);
        const result = await this.pool.query(dataQuery, queryParams);
        const workflows = result.rows.map(row => this.mapRowToWorkflow(row));
        return {
            success: true,
            data: workflows,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async updateWorkflow(id, updates) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const setFields = [];
            const values = [];
            let paramIndex = 1;
            if (updates.name !== undefined) {
                setFields.push(`name = $${paramIndex}`);
                values.push(updates.name);
                paramIndex++;
            }
            if (updates.description !== undefined) {
                setFields.push(`description = $${paramIndex}`);
                values.push(updates.description);
                paramIndex++;
            }
            if (updates.nodes !== undefined) {
                setFields.push(`nodes = $${paramIndex}`);
                values.push(JSON.stringify(updates.nodes));
                paramIndex++;
            }
            if (updates.edges !== undefined) {
                setFields.push(`edges = $${paramIndex}`);
                values.push(JSON.stringify(updates.edges));
                paramIndex++;
            }
            if (updates.triggers !== undefined) {
                setFields.push(`triggers = $${paramIndex}`);
                values.push(JSON.stringify(updates.triggers));
                paramIndex++;
            }
            if (updates.settings !== undefined) {
                setFields.push(`settings = $${paramIndex}`);
                values.push(JSON.stringify(updates.settings));
                paramIndex++;
            }
            if (updates.status !== undefined) {
                setFields.push(`status = $${paramIndex}`);
                values.push(updates.status);
                paramIndex++;
            }
            if (updates.version !== undefined) {
                setFields.push(`version = $${paramIndex}`);
                values.push(updates.version);
                paramIndex++;
            }
            setFields.push(`updated_at = $${paramIndex}`);
            values.push(new Date());
            paramIndex++;
            values.push(id);
            const query = `
        UPDATE workflows 
        SET ${setFields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;
            const result = await client.query(query, values);
            await client.query('COMMIT');
            if (result.rows.length === 0) {
                throw new Error('Workflow not found');
            }
            return this.mapRowToWorkflow(result.rows[0]);
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    async deleteWorkflow(id, organizationId) {
        const query = `
      DELETE FROM workflows 
      WHERE id = $1 AND organization_id = $2
    `;
        const result = await this.pool.query(query, [id, organizationId]);
        return result.rowCount > 0;
    }
    async getWorkflowCount(organizationId) {
        const query = `
      SELECT COUNT(*) FROM workflows 
      WHERE organization_id = $1
    `;
        const result = await this.pool.query(query, [organizationId]);
        return parseInt(result.rows[0].count);
    }
    async getWorkflowsByStatus(organizationId, status) {
        const query = `
      SELECT * FROM workflows 
      WHERE organization_id = $1 AND status = $2
      ORDER BY created_at DESC
    `;
        const result = await this.pool.query(query, [organizationId, status]);
        return result.rows.map(row => this.mapRowToWorkflow(row));
    }
    mapRowToWorkflow(row) {
        return {
            id: row.id,
            name: row.name,
            description: row.description,
            organizationId: row.organization_id,
            createdBy: row.created_by,
            nodes: row.nodes || [],
            edges: row.edges || [],
            triggers: row.triggers || [],
            settings: row.settings || {},
            status: row.status,
            version: row.version,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
        };
    }
}
exports.WorkflowService = WorkflowService;
//# sourceMappingURL=WorkflowService.js.map