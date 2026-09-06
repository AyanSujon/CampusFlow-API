export interface CreateDepartmentPayload {
	facultyId: string;
	code: string;
	name: string;
	description?: string;
    headUserId: string;
}



export interface GetAllDepartmentsPayload {
	page?: number;
	limit?: number;
	search?: string;
	facultyId?: string;
	isActive?: boolean;
}

