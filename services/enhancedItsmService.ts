import { db } from '@/lib/db';
import { AuthPayload } from '@/lib/auth';

// Service Catalog Types
export interface ServiceCategory {
  id: number;
  name: string;
  description: string;
  created_at: Date;
  updated_at: Date;
}

export interface ServiceCatalogItem {
  id: number;
  name: string;
  description: string;
  category: string;
  category_id: number;
  division: string;
  cost_type: string;
  cost_amount: number;
  sla_days: number;
  tags: string[];
  status: string;
  created_by: number;
  approved_by: number | null;
  created_at: Date;
  updated_at: Date;
  approved_at: Date | null;
  metadata: any;
  document_url?: string; // URL untuk dokumen layanan
}

// Service Request Types
export interface ServiceRequest {
  id: number;
  service_id: number;
  requester_id: number;
  requested_for: number;
  approver_id: number | null;
  provider_id: number | null;
  title: string;
  description: string;
  priority: string;
  status: string;
  cost: number;
  due_date: Date | null;
  sla_breached: boolean;
  approved_at: Date | null;
  completed_at: Date | null;
  created_at: Date;
  updated_at: Date;
  metadata: any;
}

export interface ServiceRequestApproval {
  id: number;
  service_request_id: number;
  approver_id: number;
  status: string;
  comments: string;
  approved_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface ServiceRequestActivity {
  id: number;
  service_request_id: number;
  user_id: number;
  action: string;
  description: string;
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
  invoice_number: string;
  due_date: Date;
  status: string;
  payment_confirmed_by: number | null;
  payment_confirmed_at: Date | null;
  payment_proof_url: string | null;
  notes: string;
  created_at: Date;
  updated_at: Date;
  metadata: any;
}

export interface BillingInvoiceItem {
  id: number;
  billing_id: number;
  service_request_id: number;
  description: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  created_at: Date;
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
  cab_meeting_date: Date | null;
  implementation_date: Date | null;
  rollback_deadline: Date | null;
  status: string;
  priority: string;
  risk_level: string;
  created_at: Date;
  updated_at: Date;
  approved_at: Date | null;
  completed_at: Date | null;
  metadata: any;
}

export interface ChangeRequestApproval {
  id: number;
  change_request_id: number;
  cab_member_id: number;
  vote: string;
  comments: string;
  voted_at: Date | null;
  created_at: Date;
}

export interface ChangeRequestActivity {
  id: number;
  change_request_id: number;
  user_id: number;
  action: string;
  description: string;
  created_at: Date;
}

// Activity Types
export interface ServiceCatalogActivity {
  id: number;
  service_id: number;
  user_id: number;
  action: string;
  description: string;
  created_at: Date;
}

// Service Category Services
export const serviceCategoryService = {
  // Get all categories
  getAllCategories: async (): Promise<ServiceCategory[]> => {
    const result = await db.query(
      'SELECT * FROM service_categories ORDER BY name'
    );
    return result.rows;
  },

  // Get category by ID
  getCategoryById: async (id: number): Promise<ServiceCategory | null> => {
    const result = await db.query(
      'SELECT * FROM service_categories WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  // Create a new category
  createCategory: async (category: Omit<ServiceCategory, 'id' | 'created_at' | 'updated_at'>): Promise<ServiceCategory> => {
    const result = await db.query(
      'INSERT INTO service_categories (name, description) VALUES ($1, $2) RETURNING *',
      [category.name, category.description]
    );
    return result.rows[0];
  },

  // Update a category
  updateCategory: async (id: number, category: Partial<ServiceCategory>): Promise<ServiceCategory> => {
    const fields = [];
    const values = [];
    let index = 1;

    for (const [key, value] of Object.entries(category)) {
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
    const query = `UPDATE service_categories SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
                   WHERE id = $${index} RETURNING *`;
    
    const result = await db.query(query, values);
    return result.rows[0];
  },

  // Delete a category
  deleteCategory: async (id: number): Promise<void> => {
    await db.query('DELETE FROM service_categories WHERE id = $1', [id]);
  }
};

// Service Catalog Services
export const serviceCatalogService = {
  // Get all services
  getAllServices: async (): Promise<ServiceCatalogItem[]> => {
    const result = await db.query(
      `SELECT sc.*, scat.name as category_name 
       FROM service_catalog sc 
       LEFT JOIN service_categories scat ON sc.category_id = scat.id 
       ORDER BY sc.created_at DESC`
    );
    return result.rows;
  },

  // Get service by ID
  getServiceById: async (id: number): Promise<ServiceCatalogItem | null> => {
    const result = await db.query(
      `SELECT sc.*, scat.name as category_name 
       FROM service_catalog sc 
       LEFT JOIN service_categories scat ON sc.category_id = scat.id 
       WHERE sc.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  // Get services by division
  getServicesByDivision: async (division: string): Promise<ServiceCatalogItem[]> => {
    const result = await db.query(
      `SELECT sc.*, scat.name as category_name 
       FROM service_catalog sc 
       LEFT JOIN service_categories scat ON sc.category_id = scat.id 
       WHERE sc.division = $1 
       ORDER BY sc.created_at DESC`,
      [division]
    );
    return result.rows;
  },

  // Get services by status
  getServicesByStatus: async (status: string): Promise<ServiceCatalogItem[]> => {
    const result = await db.query(
      `SELECT sc.*, scat.name as category_name 
       FROM service_catalog sc 
       LEFT JOIN service_categories scat ON sc.category_id = scat.id 
       WHERE sc.status = $1 
       ORDER BY sc.created_at DESC`,
      [status]
    );
    return result.rows;
  },

  // Get services by category
  getServicesByCategory: async (categoryId: number): Promise<ServiceCatalogItem[]> => {
    const result = await db.query(
      `SELECT sc.*, scat.name as category_name 
       FROM service_catalog sc 
       LEFT JOIN service_categories scat ON sc.category_id = scat.id 
       WHERE sc.category_id = $1 
       ORDER BY sc.created_at DESC`,
      [categoryId]
    );
    return result.rows;
  },

  // Create a new service
  createService: async (service: Omit<ServiceCatalogItem, 'id' | 'created_at' | 'updated_at' | 'approved_at' | 'category'>): Promise<ServiceCatalogItem> => {
    const result = await db.query(
      `INSERT INTO service_catalog (
        name, description, category_id, division, cost_type, cost_amount, 
        sla_days, tags, status, created_by, approved_by, metadata, document_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
      RETURNING *, (SELECT name FROM service_categories WHERE id = $3) as category_name`,
      [
        service.name,
        service.description,
        service.category_id,
        service.division,
        service.cost_type,
        service.cost_amount,
        service.sla_days,
        service.tags,
        service.status,
        service.created_by,
        service.approved_by,
        service.metadata,
        service.document_url
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
      if (value !== undefined && key !== 'id' && key !== 'created_at' && key !== 'category') {
        fields.push(`${key} = ${index}`);
        values.push(value);
        index++;
      }
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const query = `UPDATE service_catalog SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
                   WHERE id = ${index} 
                   RETURNING *, (SELECT name FROM service_categories WHERE id = category_id) as category_name`;
    
    const result = await db.query(query, values);
    return result.rows[0];
  },

  // Delete a service
  deleteService: async (id: number): Promise<void> => {
    await db.query('DELETE FROM service_catalog WHERE id = $1', [id]);
  },

  // Approve a service
  approveService: async (id: number, approvedBy: number): Promise<ServiceCatalogItem> => {
    const result = await db.query(
      `UPDATE service_catalog 
       SET status = 'approved', approved_by = $1, approved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 
       RETURNING *, (SELECT name FROM service_categories WHERE id = category_id) as category_name`,
      [approvedBy, id]
    );
    return result.rows[0];
  },

  // Reject a service
  rejectService: async (id: number, rejectedBy: number): Promise<ServiceCatalogItem> => {
    const result = await db.query(
      `UPDATE service_catalog 
       SET status = 'rejected', approved_by = $1, approved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 
       RETURNING *, (SELECT name FROM service_categories WHERE id = category_id) as category_name`,
      [rejectedBy, id]
    );
    return result.rows[0];
  },

  // Upload service document
  uploadServiceDocument: async (serviceId: number, documentUrl: string): Promise<ServiceCatalogItem> => {
    const result = await db.query(
      `UPDATE service_catalog 
       SET document_url = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 
       RETURNING *, (SELECT name FROM service_categories WHERE id = category_id) as category_name`,
      [documentUrl, serviceId]
    );
    return result.rows[0];
  },

  // Delete service document
  deleteServiceDocument: async (serviceId: number): Promise<ServiceCatalogItem> => {
    const result = await db.query(
      `UPDATE service_catalog 
       SET document_url = NULL, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 
       RETURNING *, (SELECT name FROM service_categories WHERE id = category_id) as category_name`,
      [serviceId]
    );
    return result.rows[0];
  }
};

// Service Request Services
export const serviceRequestService = {
  // Get all service requests
  getAllServiceRequests: async (): Promise<ServiceRequest[]> => {
    const result = await db.query(
      `SELECT sr.*, sc.name as service_name, u1.full_name as requester_name, u2.full_name as approver_name
       FROM service_requests sr
       LEFT JOIN service_catalog sc ON sr.service_id = sc.id
       LEFT JOIN users u1 ON sr.requester_id = u1.id
       LEFT JOIN users u2 ON sr.approver_id = u2.id
       ORDER BY sr.created_at DESC`
    );
    return result.rows;
  },

  // Get service request by ID
  getServiceRequestById: async (id: number): Promise<ServiceRequest | null> => {
    const result = await db.query(
      `SELECT sr.*, sc.name as service_name, u1.full_name as requester_name, u2.full_name as approver_name
       FROM service_requests sr
       LEFT JOIN service_catalog sc ON sr.service_id = sc.id
       LEFT JOIN users u1 ON sr.requester_id = u1.id
       LEFT JOIN users u2 ON sr.approver_id = u2.id
       WHERE sr.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  // Get service requests by requester
  getServiceRequestsByRequester: async (requesterId: number): Promise<ServiceRequest[]> => {
    const result = await db.query(
      `SELECT sr.*, sc.name as service_name, u1.full_name as requester_name, u2.full_name as approver_name
       FROM service_requests sr
       LEFT JOIN service_catalog sc ON sr.service_id = sc.id
       LEFT JOIN users u1 ON sr.requester_id = u1.id
       LEFT JOIN users u2 ON sr.approver_id = u2.id
       WHERE sr.requester_id = $1 
       ORDER BY sr.created_at DESC`,
      [requesterId]
    );
    return result.rows;
  },

  // Get service requests by requested for
  getServiceRequestsByRequestedFor: async (requestedForId: number): Promise<ServiceRequest[]> => {
    const result = await db.query(
      `SELECT sr.*, sc.name as service_name, u1.full_name as requester_name, u2.full_name as approver_name
       FROM service_requests sr
       LEFT JOIN service_catalog sc ON sr.service_id = sc.id
       LEFT JOIN users u1 ON sr.requester_id = u1.id
       LEFT JOIN users u2 ON sr.approver_id = u2.id
       WHERE sr.requested_for = $1 
       ORDER BY sr.created_at DESC`,
      [requestedForId]
    );
    return result.rows;
  },

  // Get service requests by provider
  getServiceRequestsByProvider: async (providerId: number): Promise<ServiceRequest[]> => {
    const result = await db.query(
      `SELECT sr.*, sc.name as service_name, u1.full_name as requester_name, u2.full_name as approver_name
       FROM service_requests sr
       LEFT JOIN service_catalog sc ON sr.service_id = sc.id
       LEFT JOIN users u1 ON sr.requester_id = u1.id
       LEFT JOIN users u2 ON sr.approver_id = u2.id
       WHERE sr.provider_id = $1 
       ORDER BY sr.created_at DESC`,
      [providerId]
    );
    return result.rows;
  },

  // Get service requests by status
  getServiceRequestsByStatus: async (status: string): Promise<ServiceRequest[]> => {
    const result = await db.query(
      `SELECT sr.*, sc.name as service_name, u1.full_name as requester_name, u2.full_name as approver_name
       FROM service_requests sr
       LEFT JOIN service_catalog sc ON sr.service_id = sc.id
       LEFT JOIN users u1 ON sr.requester_id = u1.id
       LEFT JOIN users u2 ON sr.approver_id = u2.id
       WHERE sr.status = $1 
       ORDER BY sr.created_at DESC`,
      [status]
    );
    return result.rows;
  },

  // Create a new service request
  createServiceRequest: async (request: Omit<ServiceRequest, 'id' | 'created_at' | 'updated_at' | 'approved_at' | 'completed_at' | 'service_name' | 'requester_name' | 'approver_name'>): Promise<ServiceRequest> => {
    const result = await db.query(
      `INSERT INTO service_requests (
        service_id, requester_id, requested_for, approver_id, provider_id, title, description,
        priority, status, cost, due_date, sla_breached, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
      RETURNING *,
        (SELECT name FROM service_catalog WHERE id = $1) as service_name,
        (SELECT full_name FROM users WHERE id = $2) as requester_name,
        (SELECT full_name FROM users WHERE id = $4) as approver_name`,
      [
        request.service_id,
        request.requester_id,
        request.requested_for,
        request.approver_id,
        request.provider_id,
        request.title,
        request.description,
        request.priority,
        request.status,
        request.cost,
        request.due_date,
        request.sla_breached,
        request.metadata
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
      if (value !== undefined && key !== 'id' && key !== 'created_at' && key !== 'service_name' && key !== 'requester_name' && key !== 'approver_name') {
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
                   WHERE id = $${index} 
                   RETURNING *,
                     (SELECT name FROM service_catalog WHERE id = service_id) as service_name,
                     (SELECT full_name FROM users WHERE id = requester_id) as requester_name,
                     (SELECT full_name FROM users WHERE id = approver_id) as approver_name`;
    
    const result = await db.query(query, values);
    return result.rows[0];
  },

  // Delete a service request
  deleteServiceRequest: async (id: number): Promise<void> => {
    await db.query('DELETE FROM service_requests WHERE id = $1', [id]);
  },

  // Approve a service request
  approveServiceRequest: async (id: number, approverId: number): Promise<ServiceRequest> => {
    const result = await db.query(
      `UPDATE service_requests 
       SET status = 'approved', approver_id = $1, approved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 
       RETURNING *,
         (SELECT name FROM service_catalog WHERE id = service_id) as service_name,
         (SELECT full_name FROM users WHERE id = requester_id) as requester_name,
         (SELECT full_name FROM users WHERE id = $1) as approver_name`,
      [approverId, id]
    );
    return result.rows[0];
  },

  // Complete a service request
  completeServiceRequest: async (id: number): Promise<ServiceRequest> => {
    const result = await db.query(
      `UPDATE service_requests 
       SET status = 'completed', completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 
       RETURNING *,
         (SELECT name FROM service_catalog WHERE id = service_id) as service_name,
         (SELECT full_name FROM users WHERE id = requester_id) as requester_name,
         (SELECT full_name FROM users WHERE id = approver_id) as approver_name`,
      [id]
    );
    return result.rows[0];
  }
};

// Service Request Approval Services
export const serviceRequestApprovalService = {
  // Get approvals by service request ID
  getApprovalsByServiceRequestId: async (serviceRequestId: number): Promise<ServiceRequestApproval[]> => {
    const result = await db.query(
      `SELECT sra.*, u.full_name as approver_name
       FROM service_request_approvals sra
       LEFT JOIN users u ON sra.approver_id = u.id
       WHERE sra.service_request_id = $1 
       ORDER BY sra.created_at ASC`,
      [serviceRequestId]
    );
    return result.rows;
  },

  // Create a new approval
  createApproval: async (approval: Omit<ServiceRequestApproval, 'id' | 'created_at' | 'updated_at' | 'approver_name'>): Promise<ServiceRequestApproval> => {
    const result = await db.query(
      `INSERT INTO service_request_approvals (
        service_request_id, approver_id, status, comments
      ) VALUES ($1, $2, $3, $4) 
      RETURNING *, (SELECT full_name FROM users WHERE id = $2) as approver_name`,
      [
        approval.service_request_id,
        approval.approver_id,
        approval.status,
        approval.comments
      ]
    );
    return result.rows[0];
  },

  // Update an approval
  updateApproval: async (id: number, approval: Partial<ServiceRequestApproval>): Promise<ServiceRequestApproval> => {
    const fields = [];
    const values = [];
    let index = 1;

    for (const [key, value] of Object.entries(approval)) {
      if (value !== undefined && key !== 'id' && key !== 'created_at' && key !== 'approver_name') {
        fields.push(`${key} = $${index}`);
        values.push(value);
        index++;
      }
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const query = `UPDATE service_request_approvals SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
                   WHERE id = $${index} 
                   RETURNING *, (SELECT full_name FROM users WHERE id = approver_id) as approver_name`;
    
    const result = await db.query(query, values);
    return result.rows[0];
  }
};

// Service Request Activity Services
export const serviceRequestActivityService = {
  // Get activities by service request ID
  getActivitiesByServiceRequestId: async (serviceRequestId: number): Promise<ServiceRequestActivity[]> => {
    const result = await db.query(
      `SELECT sra.*, u.full_name as user_name
       FROM service_request_activities sra
       LEFT JOIN users u ON sra.user_id = u.id
       WHERE sra.service_request_id = $1 
       ORDER BY sra.created_at ASC`,
      [serviceRequestId]
    );
    return result.rows;
  },

  // Create a new activity
  createActivity: async (activity: Omit<ServiceRequestActivity, 'id' | 'created_at' | 'user_name'>): Promise<ServiceRequestActivity> => {
    const result = await db.query(
      `INSERT INTO service_request_activities (
        service_request_id, user_id, action, description
      ) VALUES ($1, $2, $3, $4) 
      RETURNING *, (SELECT full_name FROM users WHERE id = $2) as user_name`,
      [
        activity.service_request_id,
        activity.user_id,
        activity.action,
        activity.description
      ]
    );
    return result.rows[0];
  }
};

// Ticket Services (Incident Management)
export const ticketService = {
  // Get all tickets
  getAllTickets: async (): Promise<Ticket[]> => {
    const result = await db.query(
      `SELECT t.*, u.full_name as creator_name, u2.full_name as assignee_name
       FROM tickets t
       LEFT JOIN users u ON t.created_by = u.id
       LEFT JOIN users u2 ON t.assigned_to = u2.id
       ORDER BY t.created_at DESC`
    );
    return result.rows;
  },

  // Get ticket by ID
  getTicketById: async (id: number): Promise<Ticket | null> => {
    const result = await db.query(
      `SELECT t.*, u.full_name as creator_name, u2.full_name as assignee_name
       FROM tickets t
       LEFT JOIN users u ON t.created_by = u.id
       LEFT JOIN users u2 ON t.assigned_to = u2.id
       WHERE t.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  // Get tickets by creator
  getTicketsByCreator: async (creatorId: number): Promise<Ticket[]> => {
    const result = await db.query(
      `SELECT t.*, u.full_name as creator_name, u2.full_name as assignee_name
       FROM tickets t
       LEFT JOIN users u ON t.created_by = u.id
       LEFT JOIN users u2 ON t.assigned_to = u2.id
       WHERE t.created_by = $1 
       ORDER BY t.created_at DESC`,
      [creatorId]
    );
    return result.rows;
  },

  // Get tickets by assignee
  getTicketsByAssignee: async (assigneeId: number): Promise<Ticket[]> => {
    const result = await db.query(
      `SELECT t.*, u.full_name as creator_name, u2.full_name as assignee_name
       FROM tickets t
       LEFT JOIN users u ON t.created_by = u.id
       LEFT JOIN users u2 ON t.assigned_to = u2.id
       WHERE t.assigned_to = $1 
       ORDER BY t.created_at DESC`,
      [assigneeId]
    );
    return result.rows;
  },

  // Get tickets by status
  getTicketsByStatus: async (status: string): Promise<Ticket[]> => {
    const result = await db.query(
      `SELECT t.*, u.full_name as creator_name, u2.full_name as assignee_name
       FROM tickets t
       LEFT JOIN users u ON t.created_by = u.id
       LEFT JOIN users u2 ON t.assigned_to = u2.id
       WHERE t.status = $1 
       ORDER BY t.created_at DESC`,
      [status]
    );
    return result.rows;
  },

  // Create a new ticket
  createTicket: async (ticket: Omit<Ticket, 'id' | 'created_at' | 'updated_at' | 'creator_name' | 'assignee_name'>): Promise<Ticket> => {
    const result = await db.query(
      `INSERT INTO tickets (
        title, description, category, priority, status, assigned_to, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING *,
        (SELECT full_name FROM users WHERE id = $7) as creator_name,
        (SELECT full_name FROM users WHERE id = $6) as assignee_name`,
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
      if (value !== undefined && key !== 'id' && key !== 'created_at' && key !== 'creator_name' && key !== 'assignee_name') {
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
                   WHERE id = $${index} 
                   RETURNING *,
                     (SELECT full_name FROM users WHERE id = created_by) as creator_name,
                     (SELECT full_name FROM users WHERE id = assigned_to) as assignee_name`;
    
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
      `SELECT tc.*, u.full_name as commenter_name
       FROM ticket_comments tc
       LEFT JOIN users u ON tc.user_id = u.id
       WHERE tc.ticket_id = $1 
       ORDER BY tc.created_at ASC`,
      [ticketId]
    );
    return result.rows;
  },

  // Create a new comment
  createComment: async (comment: Omit<TicketComment, 'id' | 'created_at' | 'commenter_name'>): Promise<TicketComment> => {
    const result = await db.query(
      `INSERT INTO ticket_comments (ticket_id, user_id, comment) 
       VALUES ($1, $2, $3) 
       RETURNING *, (SELECT full_name FROM users WHERE id = $2) as commenter_name`,
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
      `SELECT ib.*, u.full_name as payment_confirmer_name
       FROM internal_billing ib
       LEFT JOIN users u ON ib.payment_confirmed_by = u.id
       ORDER BY ib.created_at DESC`
    );
    return result.rows;
  },

  // Get billing record by ID
  getBillingRecordById: async (id: number): Promise<InternalBilling | null> => {
    const result = await db.query(
      `SELECT ib.*, u.full_name as payment_confirmer_name
       FROM internal_billing ib
       LEFT JOIN users u ON ib.payment_confirmed_by = u.id
       WHERE ib.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  // Get billing records by requester division
  getBillingRecordsByRequesterDivision: async (division: string): Promise<InternalBilling[]> => {
    const result = await db.query(
      `SELECT ib.*, u.full_name as payment_confirmer_name
       FROM internal_billing ib
       LEFT JOIN users u ON ib.payment_confirmed_by = u.id
       WHERE ib.requester_division = $1 
       ORDER BY ib.created_at DESC`,
      [division]
    );
    return result.rows;
  },

  // Get billing records by provider division
  getBillingRecordsByProviderDivision: async (division: string): Promise<InternalBilling[]> => {
    const result = await db.query(
      `SELECT ib.*, u.full_name as payment_confirmer_name
       FROM internal_billing ib
       LEFT JOIN users u ON ib.payment_confirmed_by = u.id
       WHERE ib.provider_division = $1 
       ORDER BY ib.created_at DESC`,
      [division]
    );
    return result.rows;
  },

  // Get billing records by status
  getBillingRecordsByStatus: async (status: string): Promise<InternalBilling[]> => {
    const result = await db.query(
      `SELECT ib.*, u.full_name as payment_confirmer_name
       FROM internal_billing ib
       LEFT JOIN users u ON ib.payment_confirmed_by = u.id
       WHERE ib.status = $1 
       ORDER BY ib.created_at DESC`,
      [status]
    );
    return result.rows;
  },

  // Get billing records by billing period
  getBillingRecordsByPeriod: async (startDate: Date, endDate: Date): Promise<InternalBilling[]> => {
    const result = await db.query(
      `SELECT ib.*, u.full_name as payment_confirmer_name
       FROM internal_billing ib
       LEFT JOIN users u ON ib.payment_confirmed_by = u.id
       WHERE ib.billing_period >= $1 AND ib.billing_period <= $2
       ORDER BY ib.created_at DESC`,
      [startDate, endDate]
    );
    return result.rows;
  },

  // Create a new billing record
  createBillingRecord: async (record: Omit<InternalBilling, 'id' | 'created_at' | 'updated_at' | 'payment_confirmed_at' | 'payment_confirmer_name' | 'invoice_number'>): Promise<InternalBilling> => {
    // Generate invoice number
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Date.now()}`;
    
    const result = await db.query(
      `INSERT INTO internal_billing (
        service_request_id, requester_division, provider_division, amount,
        billing_period, due_date, status, payment_confirmed_by, 
        payment_proof_url, notes, invoice_number, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
      RETURNING *, (SELECT full_name FROM users WHERE id = $8) as payment_confirmer_name`,
      [
        record.service_request_id,
        record.requester_division,
        record.provider_division,
        record.amount,
        record.billing_period,
        record.due_date,
        record.status,
        record.payment_confirmed_by,
        record.payment_proof_url,
        record.notes,
        invoiceNumber,
        record.metadata
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
      if (value !== undefined && key !== 'id' && key !== 'created_at' && key !== 'payment_confirmer_name') {
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
                   WHERE id = $${index} 
                   RETURNING *, (SELECT full_name FROM users WHERE id = payment_confirmed_by) as payment_confirmer_name`;
    
    const result = await db.query(query, values);
    return result.rows[0];
  },

  // Delete a billing record
  deleteBillingRecord: async (id: number): Promise<void> => {
    await db.query('DELETE FROM internal_billing WHERE id = $1', [id]);
  },

  // Confirm payment for a billing record
  confirmPayment: async (id: number, confirmedBy: number): Promise<InternalBilling> => {
    const result = await db.query(
      `UPDATE internal_billing 
       SET status = 'paid', payment_confirmed_by = $1, payment_confirmed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 
       RETURNING *, (SELECT full_name FROM users WHERE id = $1) as payment_confirmer_name`,
      [confirmedBy, id]
    );
    return result.rows[0];
  }
};

// Billing Invoice Item Services
export const billingInvoiceItemService = {
  // Get items by billing ID
  getItemsByBillingId: async (billingId: number): Promise<BillingInvoiceItem[]> => {
    const result = await db.query(
      'SELECT * FROM billing_invoice_items WHERE billing_id = $1 ORDER BY created_at ASC',
      [billingId]
    );
    return result.rows;
  },

  // Create a new invoice item
  createInvoiceItem: async (item: Omit<BillingInvoiceItem, 'id' | 'created_at'>): Promise<BillingInvoiceItem> => {
    const result = await db.query(
      `INSERT INTO billing_invoice_items (
        billing_id, service_request_id, description, quantity, unit_price, total_amount
      ) VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *`,
      [
        item.billing_id,
        item.service_request_id,
        item.description,
        item.quantity,
        item.unit_price,
        item.total_amount
      ]
    );
    return result.rows[0];
  }
};

// Change Request Services
export const changeRequestService = {
  // Get all change requests
  getAllChangeRequests: async (): Promise<ChangeRequest[]> => {
    const result = await db.query(
      `SELECT cr.*, u1.full_name as requester_name, u2.full_name as change_manager_name, u3.full_name as implementer_name
       FROM change_requests cr
       LEFT JOIN users u1 ON cr.requester_id = u1.id
       LEFT JOIN users u2 ON cr.change_manager_id = u2.id
       LEFT JOIN users u3 ON cr.implementer_id = u3.id
       ORDER BY cr.created_at DESC`
    );
    return result.rows;
  },

  // Get change request by ID
  getChangeRequestById: async (id: number): Promise<ChangeRequest | null> => {
    const result = await db.query(
      `SELECT cr.*, u1.full_name as requester_name, u2.full_name as change_manager_name, u3.full_name as implementer_name
       FROM change_requests cr
       LEFT JOIN users u1 ON cr.requester_id = u1.id
       LEFT JOIN users u2 ON cr.change_manager_id = u2.id
       LEFT JOIN users u3 ON cr.implementer_id = u3.id
       WHERE cr.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  // Get change requests by requester
  getChangeRequestsByRequester: async (requesterId: number): Promise<ChangeRequest[]> => {
    const result = await db.query(
      `SELECT cr.*, u1.full_name as requester_name, u2.full_name as change_manager_name, u3.full_name as implementer_name
       FROM change_requests cr
       LEFT JOIN users u1 ON cr.requester_id = u1.id
       LEFT JOIN users u2 ON cr.change_manager_id = u2.id
       LEFT JOIN users u3 ON cr.implementer_id = u3.id
       WHERE cr.requester_id = $1 
       ORDER BY cr.created_at DESC`,
      [requesterId]
    );
    return result.rows;
  },

  // Get change requests by change manager
  getChangeRequestsByChangeManager: async (changeManagerId: number): Promise<ChangeRequest[]> => {
    const result = await db.query(
      `SELECT cr.*, u1.full_name as requester_name, u2.full_name as change_manager_name, u3.full_name as implementer_name
       FROM change_requests cr
       LEFT JOIN users u1 ON cr.requester_id = u1.id
       LEFT JOIN users u2 ON cr.change_manager_id = u2.id
       LEFT JOIN users u3 ON cr.implementer_id = u3.id
       WHERE cr.change_manager_id = $1 
       ORDER BY cr.created_at DESC`,
      [changeManagerId]
    );
    return result.rows;
  },

  // Get change requests by implementer
  getChangeRequestsByImplementer: async (implementerId: number): Promise<ChangeRequest[]> => {
    const result = await db.query(
      `SELECT cr.*, u1.full_name as requester_name, u2.full_name as change_manager_name, u3.full_name as implementer_name
       FROM change_requests cr
       LEFT JOIN users u1 ON cr.requester_id = u1.id
       LEFT JOIN users u2 ON cr.change_manager_id = u2.id
       LEFT JOIN users u3 ON cr.implementer_id = u3.id
       WHERE cr.implementer_id = $1 
       ORDER BY cr.created_at DESC`,
      [implementerId]
    );
    return result.rows;
  },

  // Get change requests by status
  getChangeRequestsByStatus: async (status: string): Promise<ChangeRequest[]> => {
    const result = await db.query(
      `SELECT cr.*, u1.full_name as requester_name, u2.full_name as change_manager_name, u3.full_name as implementer_name
       FROM change_requests cr
       LEFT JOIN users u1 ON cr.requester_id = u1.id
       LEFT JOIN users u2 ON cr.change_manager_id = u2.id
       LEFT JOIN users u3 ON cr.implementer_id = u3.id
       WHERE cr.status = $1 
       ORDER BY cr.created_at DESC`,
      [status]
    );
    return result.rows;
  },

  // Create a new change request
  createChangeRequest: async (request: Omit<ChangeRequest, 'id' | 'created_at' | 'updated_at' | 'approved_at' | 'completed_at' | 'requester_name' | 'change_manager_name' | 'implementer_name'>): Promise<ChangeRequest> => {
    const result = await db.query(
      `INSERT INTO change_requests (
        title, description, requester_id, change_manager_id, implementer_id,
        reason, impact, rollback_plan, schedule_date, cab_meeting_date,
        implementation_date, rollback_deadline, status, priority,
        risk_level, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) 
      RETURNING *,
        (SELECT full_name FROM users WHERE id = $3) as requester_name,
        (SELECT full_name FROM users WHERE id = $4) as change_manager_name,
        (SELECT full_name FROM users WHERE id = $5) as implementer_name`,
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
        request.cab_meeting_date,
        request.implementation_date,
        request.rollback_deadline,
        request.status,
        request.priority,
        request.risk_level,
        request.metadata
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
      if (value !== undefined && key !== 'id' && key !== 'created_at' && key !== 'requester_name' && key !== 'change_manager_name' && key !== 'implementer_name') {
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
                   WHERE id = $${index} 
                   RETURNING *,
                     (SELECT full_name FROM users WHERE id = requester_id) as requester_name,
                     (SELECT full_name FROM users WHERE id = change_manager_id) as change_manager_name,
                     (SELECT full_name FROM users WHERE id = implementer_id) as implementer_name`;
    
    const result = await db.query(query, values);
    return result.rows[0];
  },

  // Delete a change request
  deleteChangeRequest: async (id: number): Promise<void> => {
    await db.query('DELETE FROM change_requests WHERE id = $1', [id]);
  },

  // Approve a change request
  approveChangeRequest: async (id: number): Promise<ChangeRequest> => {
    const result = await db.query(
      `UPDATE change_requests 
       SET status = 'approved', approved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 
       RETURNING *,
         (SELECT full_name FROM users WHERE id = requester_id) as requester_name,
         (SELECT full_name FROM users WHERE id = change_manager_id) as change_manager_name,
         (SELECT full_name FROM users WHERE id = implementer_id) as implementer_name`,
      [id]
    );
    return result.rows[0];
  },

  // Complete a change request
  completeChangeRequest: async (id: number): Promise<ChangeRequest> => {
    const result = await db.query(
      `UPDATE change_requests 
       SET status = 'completed', completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 
       RETURNING *,
         (SELECT full_name FROM users WHERE id = requester_id) as requester_name,
         (SELECT full_name FROM users WHERE id = change_manager_id) as change_manager_name,
         (SELECT full_name FROM users WHERE id = implementer_id) as implementer_name`,
      [id]
    );
    return result.rows[0];
  }
};

// Change Request Approval Services
export const changeRequestApprovalService = {
  // Get approvals by change request ID
  getApprovalsByChangeRequestId: async (changeRequestId: number): Promise<ChangeRequestApproval[]> => {
    const result = await db.query(
      `SELECT cra.*, u.full_name as cab_member_name
       FROM change_request_approvals cra
       LEFT JOIN users u ON cra.cab_member_id = u.id
       WHERE cra.change_request_id = $1 
       ORDER BY cra.created_at ASC`,
      [changeRequestId]
    );
    return result.rows;
  },

  // Create a new approval
  createApproval: async (approval: Omit<ChangeRequestApproval, 'id' | 'created_at' | 'cab_member_name'>): Promise<ChangeRequestApproval> => {
    const result = await db.query(
      `INSERT INTO change_request_approvals (
        change_request_id, cab_member_id, vote, comments
      ) VALUES ($1, $2, $3, $4) 
      RETURNING *, (SELECT full_name FROM users WHERE id = $2) as cab_member_name`,
      [
        approval.change_request_id,
        approval.cab_member_id,
        approval.vote,
        approval.comments
      ]
    );
    return result.rows[0];
  },

  // Update an approval
  updateApproval: async (id: number, approval: Partial<ChangeRequestApproval>): Promise<ChangeRequestApproval> => {
    const fields = [];
    const values = [];
    let index = 1;

    for (const [key, value] of Object.entries(approval)) {
      if (value !== undefined && key !== 'id' && key !== 'created_at' && key !== 'cab_member_name') {
        fields.push(`${key} = $${index}`);
        values.push(value);
        index++;
      }
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const query = `UPDATE change_request_approvals SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
                   WHERE id = $${index} 
                   RETURNING *, (SELECT full_name FROM users WHERE id = cab_member_id) as cab_member_name`;
    
    const result = await db.query(query, values);
    return result.rows[0];
  }
};

// Change Request Activity Services
export const changeRequestActivityService = {
  // Get activities by change request ID
  getActivitiesByChangeRequestId: async (changeRequestId: number): Promise<ChangeRequestActivity[]> => {
    const result = await db.query(
      `SELECT cra.*, u.full_name as user_name
       FROM change_request_activities cra
       LEFT JOIN users u ON cra.user_id = u.id
       WHERE cra.change_request_id = $1 
       ORDER BY cra.created_at ASC`,
      [changeRequestId]
    );
    return result.rows;
  },

  // Create a new activity
  createActivity: async (activity: Omit<ChangeRequestActivity, 'id' | 'created_at' | 'user_name'>): Promise<ChangeRequestActivity> => {
    const result = await db.query(
      `INSERT INTO change_request_activities (
        change_request_id, user_id, action, description
      ) VALUES ($1, $2, $3, $4) 
      RETURNING *, (SELECT full_name FROM users WHERE id = $2) as user_name`,
      [
        activity.change_request_id,
        activity.user_id,
        activity.action,
        activity.description
      ]
    );
    return result.rows[0];
  }
};

// Service Catalog Activity Services
export const serviceCatalogActivityService = {
  // Get activities by service ID
  getActivitiesByServiceId: async (serviceId: number): Promise<ServiceCatalogActivity[]> => {
    const result = await db.query(
      `SELECT sca.*, u.full_name as user_name
       FROM service_catalog_activities sca
       LEFT JOIN users u ON sca.user_id = u.id
       WHERE sca.service_id = $1 
       ORDER BY sca.created_at ASC`,
      [serviceId]
    );
    return result.rows;
  },

  // Create a new activity
  createActivity: async (activity: Omit<ServiceCatalogActivity, 'id' | 'created_at' | 'user_name'>): Promise<ServiceCatalogActivity> => {
    const result = await db.query(
      `INSERT INTO service_catalog_activities (
        service_id, user_id, action, description
      ) VALUES ($1, $2, $3, $4) 
      RETURNING *, (SELECT full_name FROM users WHERE id = $2) as user_name`,
      [
        activity.service_id,
        activity.user_id,
        activity.action,
        activity.description
      ]
    );
    return result.rows[0];
  }
};

// User Management Services
export const userManagementService = {
  // Get users by role
  getUsersByRole: async (role: string): Promise<any[]> => {
    const result = await db.query(
      `SELECT id, full_name, email, division, role, roles,
              is_service_catalog_manager, is_service_provider, is_service_requester,
              is_approver, is_billing_coordinator, is_change_requester,
              is_change_manager, is_cab_member, is_implementer
       FROM users 
       WHERE $1 = ANY(roles) OR role = $1
       ORDER BY full_name`,
      [role]
    );
    return result.rows;
  },

  // Get users by division
  getUsersByDivision: async (division: string): Promise<any[]> => {
    const result = await db.query(
      `SELECT id, full_name, email, division, role, roles,
              is_service_catalog_manager, is_service_provider, is_service_requester,
              is_approver, is_billing_coordinator, is_change_requester,
              is_change_manager, is_cab_member, is_implementer
       FROM users 
       WHERE division = $1
       ORDER BY full_name`,
      [division]
    );
    return result.rows;
  },

  // Update user roles
  updateUserRoles: async (userId: number, roles: string[], roleFlags: any): Promise<any> => {
    const result = await db.query(
      `UPDATE users 
       SET roles = $1,
           is_service_catalog_manager = $2,
           is_service_provider = $3,
           is_service_requester = $4,
           is_approver = $5,
           is_billing_coordinator = $6,
           is_change_requester = $7,
           is_change_manager = $8,
           is_cab_member = $9,
           is_implementer = $10,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $11
       RETURNING id, full_name, email, division, role, roles,
                 is_service_catalog_manager, is_service_provider, is_service_requester,
                 is_approver, is_billing_coordinator, is_change_requester,
                 is_change_manager, is_cab_member, is_implementer`,
      [
        roles,
        roleFlags.is_service_catalog_manager,
        roleFlags.is_service_provider,
        roleFlags.is_service_requester,
        roleFlags.is_approver,
        roleFlags.is_billing_coordinator,
        roleFlags.is_change_requester,
        roleFlags.is_change_manager,
        roleFlags.is_cab_member,
        roleFlags.is_implementer,
        userId
      ]
    );
    return result.rows[0];
  }
};