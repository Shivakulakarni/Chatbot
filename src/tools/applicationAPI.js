import axios from 'axios';

/**
 * Application API Tool
 * Handles scheme application submission and status tracking
 */
export class ApplicationAPI {
  constructor(config = {}) {
    this.baseURL = config.baseURL || 'http://localhost:3001/api';
    this.timeout = config.timeout || 30000;
    this.mockMode = config.mockMode !== false; // Default to mock if no API available
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': 'mr-IN'
      }
    });

    // Initialize mock database if in mock mode
    if (this.mockMode) {
      this.applications = {};
      this.applicationCounter = 1000;
    }
  }

  /**
   * Submit scheme application
   */
  async submitApplication(applicationData) {
    try {
      const payload = {
        schemeId: applicationData.schemeId,
        schemeName: applicationData.schemeName,
        userProfile: applicationData.userProfile,
        documents: applicationData.documents,
        submissionTime: new Date().toISOString()
      };

      if (this.mockMode) {
        return this.mockSubmitApplication(payload);
      }

      const response = await this.client.post('/schemes/apply', payload);
      return {
        success: true,
        applicationId: response.data.applicationId,
        status: 'submitted',
        message: 'आवेदन सफलतापूर्वक जमा किया गया',
        submissionDetails: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'आवेदन जमा करने में विफल: ' + error.message
      };
    }
  }

  /**
   * Mock submit application
   */
  mockSubmitApplication(payload) {
    const applicationId = `APP-${++this.applicationCounter}`;
    const application = {
      id: applicationId,
      ...payload,
      status: 'submitted',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    this.applications[applicationId] = application;

    return {
      success: true,
      applicationId,
      status: 'submitted',
      message: 'आवेदन सफलतापूर्वक जमा किया गया',
      referenceNumber: applicationId,
      nextSteps: [
        '1. दस्तावेज़ सत्यापन में 3-5 कार्य दिवस लगेंगे',
        '2. आपको SMS और ईमेल पर अपडेट मिलेंगे',
        '3. आप अपने आवेदन की स्थिति ऑनलाइन देख सकते हैं'
      ]
    };
  }

  /**
   * Check application status
   */
  async checkApplicationStatus(applicationId) {
    try {
      if (this.mockMode) {
        return this.mockCheckStatus(applicationId);
      }

      const response = await this.client.get(`/schemes/status/${applicationId}`);
      return {
        success: true,
        applicationId,
        status: response.data.status,
        updates: response.data.updates
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'स्थिति जांचने में विफल: ' + error.message
      };
    }
  }

  /**
   * Mock check status
   */
  mockCheckStatus(applicationId) {
    if (!this.applications[applicationId]) {
      return {
        success: false,
        error: 'Application not found',
        message: `आवेदन ID ${applicationId} नहीं मिला`
      };
    }

    const app = this.applications[applicationId];
    const statuses = ['submitted', 'under_review', 'document_verification', 'approved', 'rejected'];
    const currentStatusIndex = Math.min(
      Math.floor((Date.now() - new Date(app.createdAt).getTime()) / (1000 * 60 * 60)),
      statuses.length - 1
    );

    return {
      success: true,
      applicationId,
      status: statuses[currentStatusIndex],
      statusInMarathi: this.getStatusInMarathi(statuses[currentStatusIndex]),
      updates: [
        { status: 'submitted', date: app.createdAt, message: 'आवेदन प्राप्त हुआ' },
        { 
          status: 'under_review', 
          date: new Date(new Date(app.createdAt).getTime() + 2 * 60 * 60 * 1000).toISOString(),
          message: 'आवेदन की समीक्षा की जा रही है'
        }
      ],
      nextSteps: this.getNextSteps(statuses[currentStatusIndex])
    };
  }

  /**
   * Get status in Marathi
   */
  getStatusInMarathi(status) {
    const statusMap = {
      'submitted': 'जमा किया गया',
      'under_review': 'समीक्षा के अधीन',
      'document_verification': 'दस्तावेज़ सत्यापन',
      'approved': 'मंजूर किया गया',
      'rejected': 'अस्वीकृत',
      'on_hold': 'प्रतीक्षा में'
    };
    return statusMap[status] || status;
  }

  /**
   * Get next steps based on status
   */
  getNextSteps(status) {
    const stepsMap = {
      'submitted': [
        'आपका आवेदन स्वीकार कर लिया गया है।',
        'अगले 2-3 दिनों में समीक्षा की जाएगी।'
      ],
      'under_review': [
        'आपका आवेदन समीक्षा के अधीन है।',
        'कृपया धैर्य रखें।'
      ],
      'document_verification': [
        'आपके दस्तावेजों का सत्यापन चल रहा है।',
        'यदि आवश्यक हो तो अतिरिक्त जानकारी मांगी जा सकती है।'
      ],
      'approved': [
        'बधाई हो! आपका आवेदन मंजूर कर दिया गया है।',
        'लाभ अगले 7-10 दिनों में जारी किए जाएंगे।'
      ],
      'rejected': [
        'खेद है कि आपका आवेदन अस्वीकृत कर दिया गया है।',
        'अधिक जानकारी के लिए कार्यालय से संपर्क करें।'
      ]
    };
    return stepsMap[status] || [];
  }

  /**
   * Get required documents for a scheme
   */
  getRequiredDocuments(schemeId) {
    const documentsMap = {
      'pm_awas': [
        'आधार कार्ड',
        'पैन कार्ड',
        'आय प्रमाणपत्र',
        'संपत्ती दस्तावेज़',
        'बैंक खाता विवरण'
      ],
      'mgnrega': [
        'आधार कार्ड',
        'राशन कार्ड',
        'मतदाता पहचान पत्र',
        'पंचायत प्रमाणपत्र'
      ],
      'pm_kisan': [
        'आधार कार्ड',
        'बैंक खाता विवरण',
        'भूमि दस्तावेज़',
        'पंचायत प्रमाणपत्र'
      ]
    };

    return documentsMap[schemeId] || [];
  }

  /**
   * Validate documents
   */
  validateDocuments(documents) {
    const results = {
      valid: [],
      missing: [],
      invalid: []
    };

    const requiredFields = ['document_type', 'file_path', 'upload_date'];

    documents.forEach(doc => {
      const missingFields = requiredFields.filter(field => !doc[field]);
      if (missingFields.length === 0) {
        results.valid.push(doc);
      } else {
        results.missing.push({
          document: doc.document_type,
          fields: missingFields
        });
      }
    });

    return results;
  }
}

export default ApplicationAPI;
