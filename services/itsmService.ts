import { db } from '@/lib/db';
import { AuthPayload } from '@/lib/auth';

// Service Catalog Types
export interface ServiceCatalogItem {
  id: number;
  name: string;
  description: string;
  category: string;
  division: string;
  cost_type: string;
  cost_amount: number;
  status: string;
  created_by: number;
  approved_by: number | null;
  created_at: Date;
  updated_at: Date;
  approved_at: Date | null;
}

// Service Request Types
export interface ServiceRequest {
  id: number;
  service_id: number;
  requester_id: number;
  approver_id: number | null;
  provider_id: number | null;
  title: string;
  description: string;
  priority: string;
  status: string;
  cost: number;
  approved_at: Date | null;
  completed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

// Service Request Comment Types
export interface ServiceRequestComment {
  id: number;
  service_request_id: number;
  user_id: number;
  comment: string;
  created_at: Date;
}

// Ticket Types (Incident Management)
export interface Ticket {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  assigned_to: number | null;
  created_by: number;
  created_at: Date;
  updated_at: Date;
}

// Ticket Comment Types
export interface TicketComment {
  id: number;
  ticket_id: number;
  user_id: number;
  comment: string;
  created_at: Date;
}

// Internal Billing Types
export interface InternalBilling {
  id: number;
  service_request_id: number;
  requester_division: string;
  provider_division: string;
  amount: number;
  billing_period: Date;
  status: string;
  payment_confirmed_by: number | null;
  payment_confirmed_at: Date | null;
  payment_proof_url: string | null;
  created_at: Date;
  updated_at: Date;
}

// Change Request Types
export interface ChangeRequest {
  id: number;
  title: string;
  description: string;
  requester_id: number;
  change_manager_id: number | null;
  implementer_id: number | null;
  reason: string;
  impact: string;
  rollback_plan: string;
  schedule_date: Date | null;
  status: string;
  priority: string;
  risk_level: string;
  created_at: Date;
  updated_at: Date;
  approved_at: Date | null;
  completed_at: Date | null;
}

// Change Request Comment Types
export interface ChangeRequestComment {
  id: number;
  change_request_id: number;
  user_id: number;
  comment: string;
  created_at: Date;
}

// Service Catalog Services
export const serviceCatalogService = {
  // Get all services
  getAllServices: async (): Promise<ServiceCatalogItem[]> => {
    const result = await db.query(
      'SELECT * FROM service_catalog ORDER BY created_at DESC'
    );
    return result.rows;
  },

  // Get service by ID
  getServiceById: async (id: number): Promise<ServiceCatalogItem | null> => {
    const result = await db.query(
      'SELECT * FROM service_catalog WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  // Get services by division
  getServicesByDivision: async (division: string): Promise<ServiceCatalogItem[]> => {
    const result = await db.query(
      'SELECT * FROM service_catalog WHERE division = $1 ORDER BY created_at DESC',
      [division]
    );
    return result.rows;
  },

  // Get services by status
  getServicesByStatus: async (status: string): Promise<ServiceCatalogItem[]> => {
    const result = await db.query(
      'SELECT * FROM service_catalog WHERE status = $1 ORDER BY created_at DESC',
      [status]
    );
    return result.rows;
  },

  // Create a new service
  createService: async (service: Omit<ServiceCatalogItem, 'id' | 'created_at' | 'updated_at' | 'approved_at'>): Promise<ServiceCatalogItem> => {
    const result = await db.query(
      `INSERT INTO service_catalog (
        name, description, category, division, cost_type, cost_amount, 
        status, created_by, approved_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING *`,
      [
        service.name,
        service.description,
        service.category,
        service.division,
        service.cost_type,
        service.cost_amount,
        service.status,
        service.created_by,
        service.approved_by
      ]
    );
    return result.rows[0];
  },

  // Update a service
  updateService: async (id: number, service: Partial<ServiceCatalogItem>): Promise<ServiceCatalogItem> => {
    const fields = [];
    const values = [];
    let index = 1;

    for (const [key, value] of Object.entries(service)) {
      if (value !== undefined && key !== 'id' && key !== 'created_at') {
        fields.push(`${key} = $${index}`);
        values.push(value);
        index++;
      }
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const query = `UPDATE service_catalog SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
                   WHERE id = $${index} RETURNING *`;
    
    const result = await db.query(query, values);
    return result.rows[0];
  },

  // Delete a service
  deleteService: async (id: number): Promise<void> => {
    await db.query('DELETE FROM service_catalog WHERE id = $1', [id]);
  }
};

// Service Request Services
export const serviceRequestService = {
  // Get all service requests
  getAllServiceRequests: async (): Promise<ServiceRequest[]> => {
    const result = await db.query(
      'SELECT * FROM service_requests ORDER BY created_at DESC'
    );
    return result.rows;
  },

  // Get service request by ID
  getServiceRequestById: async (id: number): Promise<ServiceRequest | null> => {
    const result = await db.query(
      'SELECT * FROM service_requests WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  // Get service requests by requester
  getServiceRequestsByRequester: async (requesterId: number): Promise<ServiceRequest[]> => {
    const result = await db.query(
      'SELECT * FROM service_requests WHERE requester_id = $1 ORDER BY created_at DESC',
      [requesterId]
    );
    return result.rows;
  },

  // Get service requests by status
  getServiceRequestsByStatus: async (status: string): Promise<ServiceRequest[]> => {
    const result = await db.query(
      'SELECT * FROM service_requests WHERE status = $1 ORDER BY created_at DESC',
      [status]
    );
    return result.rows;
  },

  // Create a new service request
  createServiceRequest: async (request: Omit<ServiceRequest, 'id' | 'created_at' | 'updated_at' | 'approved_at' | 'completed_at'>): Promise<ServiceRequest> => {
    const result = await db.query(
      `INSERT INTO service_requests (
        service_id, requester_id, approver_id, provider_id, title, description,
        priority, status, cost
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING *`,
      [
        request.service_id,
        request.requester_id,
        request.approver_id,
        request.provider_id,
        request.title,
        request.description,
        request.priority,
        request.status,
        request.cost
      ]
    );
    return result.rows[0];
  },

  // Update a service request
  updateServiceRequest: async (id: number, request: Partial<ServiceRequest>): Promise<ServiceRequest> => {
    const fields = [];
    const values = [];
    let index = 1;

    for (const [key, value] of Object.entries(request)) {
      if (value !== undefined && key !== 'id' && key !== 'created_at') {
        fields.push(`${key} = $${index}`);
        values.push(value);
        index++;
      }
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const query = `UPDATE service_requests SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
                   WHERE id = $${index} RETURNING *`;
    
    const result = await db.query(query, values);
    return result.rows[0];
  },

  // Delete a service request
  deleteServiceRequest: async (id: number): Promise<void> => {
    await db.query('DELETE FROM service_requests WHERE id = $1', [id]);
  }
};

// Service Request Comment Services
export const serviceRequestCommentService = {
  // Get comments by service request ID
  getCommentsByServiceRequestId: async (serviceRequestId: number): Promise<ServiceRequestComment[]> => {
    const result = await db.query(
      'SELECT * FROM service_request_comments WHERE service_request_id = $1 ORDER BY created_at ASC',
      [serviceRequestId]
    );
    return result.rows;
  },

  // Create a new comment
  createComment: async (comment: Omit<ServiceRequestComment, 'id' | 'created_at'>): Promise<ServiceRequestComment> => {
    const result = await db.query(
      'INSERT INTO service_request_comments (service_request_id, user_id, comment) VALUES ($1, $2, $3) RETURNING *',
      [comment.service_request_id, comment.user_id, comment.comment]
    );
    return result.rows[0];
  }
};

// Ticket Services (Incident Management)
export const ticketService = {
  // Get all tickets
  getAllTickets: async (): Promise<Ticket[]> => {
    const result = await db.query(
      'SELECT * FROM tickets ORDER BY created_at DESC'
    );
    return result.rows;
  },

  // Get ticket by ID
  getTicketById: async (id: number): Promise<Ticket | null> => {
    const result = await db.query(
      'SELECT * FROM tickets WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  // Get tickets by creator
  getTicketsByCreator: async (creatorId: number): Promise<Ticket[]> => {
    const result = await db.query(
      'SELECT * FROM tickets WHERE created_by = $1 ORDER BY created_at DESC',
      [creatorId]
    );
    return result.rows;
  },

  // Get tickets by assignee
  getTicketsByAssignee: async (assigneeId: number): Promise<Ticket[]> => {
    const result = await db.query(
      'SELECT * FROM tickets WHERE assigned_to = $1 ORDER BY created_at DESC',
      [assigneeId]
    );
    return result.rows;
  },

  // Get tickets by status
  getTicketsByStatus: async (status: string): Promise<Ticket[]> => {
    const result = await db.query(
      'SELECT * FROM tickets WHERE status = $1 ORDER BY created_at DESC',
      [status]
    );
    return result.rows;
  },

  // Create a new ticket
  createTicket: async (ticket: Omit<Ticket, 'id' | 'created_at' | 'updated_at'>): Promise<Ticket> => {
    const result = await db.query(
      `INSERT INTO tickets (
        title, description, category, priority, status, assigned_to, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING *`,
      [
        ticket.title,
        ticket.description,
        ticket.category,
        ticket.priority,
        ticket.status,
        ticket.assigned_to,
        ticket.created_by
      ]
    );
    return result.rows[0];
  },

  // Update a ticket
  updateTicket: async (id: number, ticket: Partial<Ticket>): Promise<Ticket> => {
    const fields = [];
    const values = [];
    let index = 1;

    for (const [key, value] of Object.entries(ticket)) {
      if (value !== undefined && key !== 'id' && key !== 'created_at') {
        fields.push(`${key} = $${index}`);
        values.push(value);
        index++;
      }
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const query = `UPDATE tickets SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
                   WHERE id = $${index} RETURNING *`;
    
    const result = await db.query(query, values);
    return result.rows[0];
  },

  // Delete a ticket
  deleteTicket: async (id: number): Promise<void> => {
    await db.query('DELETE FROM tickets WHERE id = $1', [id]);
  }
};

// Ticket Comment Services
export const ticketCommentService = {
  // Get comments by ticket ID
  getCommentsByTicketId: async (ticketId: number): Promise<TicketComment[]> => {
    const result = await db.query(
      'SELECT * FROM ticket_comments WHERE ticket_id = $1 ORDER BY created_at ASC',
      [ticketId]
    );
    return result.rows;
  },

  // Create a new comment
  createComment: async (comment: Omit<TicketComment, 'id' | 'created_at'>): Promise<TicketComment> => {
    const result = await db.query(
      'INSERT INTO ticket_comments (ticket_id, user_id, comment) VALUES ($1, $2, $3) RETURNING *',
      [comment.ticket_id, comment.user_id, comment.comment]
    );
    return result.rows[0];
  }
};

// Internal Billing Services
export const billingService = {
  // Get all billing records
  getAllBillingRecords: async (): Promise<InternalBilling[]> => {
    const result = await db.query(
      'SELECT * FROM internal_billing ORDER BY created_at DESC'
    );
    return result.rows;
  },

  // Get billing record by ID
  getBillingRecordById: async (id: number): Promise<InternalBilling | null> => {
    const result = await db.query(
      'SELECT * FROM internal_billing WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  // Get billing records by requester division
  getBillingRecordsByRequesterDivision: async (division: string): Promise<InternalBilling[]> => {
    const result = await db.query(
      'SELECT * FROM internal_billing WHERE requester_division = $1 ORDER BY created_at DESC',
      [division]
    );
    return result.rows;
  },

  // Get billing records by provider division
  getBillingRecordsByProviderDivision: async (division: string): Promise<InternalBilling[]> => {
    const result = await db.query(
      'SELECT * FROM internal_billing WHERE provider_division = $1 ORDER BY created_at DESC',
      [division]
    );
    return result.rows;
  },

  // Get billing records by status
  getBillingRecordsByStatus: async (status: string): Promise<InternalBilling[]> => {
    const result = await db.query(
      'SELECT * FROM internal_billing WHERE status = $1 ORDER BY created_at DESC',
      [status]
    );
    return result.rows;
  },

  // Create a new billing record
  createBillingRecord: async (record: Omit<InternalBilling, 'id' | 'created_at' | 'updated_at' | 'payment_confirmed_at'>): Promise<InternalBilling> => {
    const result = await db.query(
      `INSERT INTO internal_billing (
        service_request_id, requester_division, provider_division, amount,
        billing_period, status, payment_confirmed_by, payment_proof_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *`,
      [
        record.service_request_id,
        record.requester_division,
        record.provider_division,
        record.amount,
        record.billing_period,
        record.status,
        record.payment_confirmed_by,
        record.payment_proof_url
      ]
    );
    return result.rows[0];
  },

  // Update a billing record
  updateBillingRecord: async (id: number, record: Partial<InternalBilling>): Promise<InternalBilling> => {
    const fields = [];
    const values = [];
    let index = 1;

    for (const [key, value] of Object.entries(record)) {
      if (value !== undefined && key !== 'id' && key !== 'created_at') {
        fields.push(`${key} = $${index}`);
        values.push(value);
        index++;
      }
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const query = `UPDATE internal_billing SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
                   WHERE id = $${index} RETURNING *`;
    
    const result = await db.query(query, values);
    return result.rows[0];
  },

  // Delete a billing record
  deleteBillingRecord: async (id: number): Promise<void> => {
    await db.query('DELETE FROM internal_billing WHERE id = $1', [id]);
  }
};

// Change Request Services
export const changeRequestService = {
  // Get all change requests
  getAllChangeRequests: async (): Promise<ChangeRequest[]> => {
    const result = await db.query(
      'SELECT * FROM change_requests ORDER BY created_at DESC'
    );
    return result.rows;
  },

  // Get change request by ID
  getChangeRequestById: async (id: number): Promise<ChangeRequest | null> => {
    const result = await db.query(
      'SELECT * FROM change_requests WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  // Get change requests by requester
  getChangeRequestsByRequester: async (requesterId: number): Promise<ChangeRequest[]> => {
    const result = await db.query(
      'SELECT * FROM change_requests WHERE requester_id = $1 ORDER BY created_at DESC',
      [requesterId]
    );
    return result.rows;
  },

  // Get change requests by status
  getChangeRequestsByStatus: async (status: string): Promise<ChangeRequest[]> => {
    const result = await db.query(
      'SELECT * FROM change_requests WHERE status = $1 ORDER BY created_at DESC',
      [status]
    );
    return result.rows;
  },

  // Create a new change request
  createChangeRequest: async (request: Omit<ChangeRequest, 'id' | 'created_at' | 'updated_at' | 'approved_at' | 'completed_at'>): Promise<ChangeRequest> => {
    const result = await db.query(
      `INSERT INTO change_requests (
        title, description, requester_id, change_manager_id, implementer_id,
        reason, impact, rollback_plan, schedule_date, status, priority,
        risk_level
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
      RETURNING *`,
      [
        request.title,
        request.description,
        request.requester_id,
        request.change_manager_id,
        request.implementer_id,
        request.reason,
        request.impact,
        request.rollback_plan,
        request.schedule_date,
        request.status,
        request.priority,
        request.risk_level
      ]
    );
    return result.rows[0];
  },

  // Update a change request
  updateChangeRequest: async (id: number, request: Partial<ChangeRequest>): Promise<ChangeRequest> => {
    const fields = [];
    const values = [];
    let index = 1;

    for (const [key, value] of Object.entries(request)) {
      if (value !== undefined && key !== 'id' && key !== 'created_at') {
        fields.push(`${key} = $${index}`);
        values.push(value);
        index++;
      }
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const query = `UPDATE change_requests SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
                   WHERE id = $${index} RETURNING *`;
    
    const result = await db.query(query, values);
    return result.rows[0];
  },

  // Delete a change request
  deleteChangeRequest: async (id: number): Promise<void> => {
    await db.query('DELETE FROM change_requests WHERE id = $1', [id]);
  }
};

// Change Request Comment Services
export const changeRequestCommentService = {
  // Get comments by change request ID
  getCommentsByChangeRequestId: async (changeRequestId: number): Promise<ChangeRequestComment[]> => {
    const result = await db.query(
      'SELECT * FROM change_request_comments WHERE change_request_id = $1 ORDER BY created_at ASC',
      [changeRequestId]
    );
    return result.rows;
  },

  // Create a new comment
  createComment: async (comment: Omit<ChangeRequestComment, 'id' | 'created_at'>): Promise<ChangeRequestComment> => {
    const result = await db.query(
      'INSERT INTO change_request_comments (change_request_id, user_id, comment) VALUES ($1, $2, $3) RETURNING *',
      [comment.change_request_id, comment.user_id, comment.comment]
    );
    return result.rows[0];
  }
};