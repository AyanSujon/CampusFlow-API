export interface CreateDepartmentPayload {
	facultyId: string;
	code: string;
	name: string;
	description?: string;
    headUserId: string;
}