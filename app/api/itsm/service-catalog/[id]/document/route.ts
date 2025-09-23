import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { serviceCatalogService } from '@/services/enhancedItsmService';
import { writeFile } from 'fs/promises';
import { join } from 'path';

// POST /api/itsm/service-catalog/[id]/document - Upload service document
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = verifyAuth();
    
    const serviceId = parseInt(params.id);
    if (isNaN(serviceId) || serviceId <= 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid service ID' 
        },
        { status: 400 }
      );
    }
    
    // Check if user has appropriate role
    const allowedRoles = ['service_catalog_manager', 'service_provider', 'admin', 'superadmin'];
    const userRoles = [auth.role, ...(auth.roles || [])];
    const hasPermission = allowedRoles.some(role => userRoles.includes(role));
    
    if (!hasPermission) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized: Insufficient permissions' 
        },
        { status: 403 }
      );
    }
    
    // Get the uploaded file
    const formData = await request.formData();
    const file = formData.get('document') as File;
    
    if (!file) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No file uploaded' 
        },
        { status: 400 }
      );
    }
    
    // Validate file type (only allow PDF, DOC, DOCX, TXT)
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.' 
        },
        { status: 400 }
      );
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'File size exceeds 10MB limit' 
        },
        { status: 400 }
      );
    }
    
    // Save file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `service_${serviceId}_document_${timestamp}.${extension}`;
    
    // Save to public/uploads/service-documents directory
    const filePath = join(process.cwd(), 'public', 'uploads', 'service-documents', filename);
    await writeFile(filePath, buffer);
    
    // Save file URL to database
    const documentUrl = `/uploads/service-documents/${filename}`;
    const service = await serviceCatalogService.uploadServiceDocument(serviceId, documentUrl);
    
    return NextResponse.json({ 
      success: true, 
      data: service,
      message: 'Document uploaded successfully'
    });
  } catch (error: any) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to upload document' 
      },
      { status: 500 }
    );
  }
}

// DELETE /api/itsm/service-catalog/[id]/document - Delete service document
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = verifyAuth();
    
    const serviceId = parseInt(params.id);
    if (isNaN(serviceId) || serviceId <= 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid service ID' 
        },
        { status: 400 }
      );
    }
    
    // Check if user has appropriate role
    const allowedRoles = ['service_catalog_manager', 'service_provider', 'admin', 'superadmin'];
    const userRoles = [auth.role, ...(auth.roles || [])];
    const hasPermission = allowedRoles.some(role => userRoles.includes(role));
    
    if (!hasPermission) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized: Insufficient permissions' 
        },
        { status: 403 }
      );
    }
    
    // Remove document URL from database
    const service = await serviceCatalogService.deleteServiceDocument(serviceId);
    
    return NextResponse.json({ 
      success: true, 
      data: service,
      message: 'Document deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to delete document' 
      },
      { status: 500 }
    );
  }
}