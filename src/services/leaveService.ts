
// This service will be replaced with Supabase integration later
// For now it's just a mock implementation

export interface LeaveApplication {
  id: string;
  studentId: string;
  studentName: string;
  startDate: string;
  endDate: string;
  leaveType: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedOn: string;
  isEmergency?: boolean;
  attachmentUrl?: string;
  comments?: string;
}

// Mock data storage
let leaveApplications: LeaveApplication[] = [];

export const leaveService = {
  // Submit a new leave application
  submitLeave: async (leaveData: Omit<LeaveApplication, 'id' | 'appliedOn' | 'status'>): Promise<LeaveApplication> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newLeave = {
          ...leaveData,
          id: Math.random().toString(36).substring(2, 9),
          appliedOn: new Date().toISOString(),
          status: 'pending' as const
        };
        
        leaveApplications.push(newLeave);
        resolve(newLeave);
      }, 500);
    });
  },

  // Get leaves by student ID
  getStudentLeaves: async (studentId: string): Promise<LeaveApplication[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const leaves = leaveApplications.filter(leave => leave.studentId === studentId);
        resolve(leaves);
      }, 500);
    });
  },

  // Get all pending leaves (for admin)
  getPendingLeaves: async (): Promise<LeaveApplication[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const pendingLeaves = leaveApplications.filter(leave => leave.status === 'pending');
        resolve(pendingLeaves);
      }, 500);
    });
  },

  // Update leave status (approve/reject)
  updateLeaveStatus: async (leaveId: string, status: 'approved' | 'rejected', comments?: string): Promise<LeaveApplication> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const leaveIndex = leaveApplications.findIndex(leave => leave.id === leaveId);
        
        if (leaveIndex === -1) {
          reject(new Error('Leave application not found'));
          return;
        }
        
        leaveApplications[leaveIndex] = {
          ...leaveApplications[leaveIndex],
          status,
          comments: comments || leaveApplications[leaveIndex].comments
        };
        
        resolve(leaveApplications[leaveIndex]);
      }, 500);
    });
  }
};
