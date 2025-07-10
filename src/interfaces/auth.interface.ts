import { Request } from "express";

export interface IUser {
    id: string;
    email: string;
    name: string;
    company_id?: string;
    first_name: string;
    last_name: string;
    stripe_account_id?: string;
    stripe_onboarded: boolean;
    onboarding_completed: boolean;
}

export interface AuthRequest extends Request {
    user?: IUser;
}
