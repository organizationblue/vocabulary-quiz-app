export interface AuthenticatedUser {
    id: number;
    username: string;
    displayName: string;
    createdAt: string;
}

export interface AuthSuccessResponse {
    token: string;
    user: AuthenticatedUser;
}
