export class CustomError extends Error {
    public statusCode: number;
    public isOperational: boolean;

    constructor(
        message: string,
        statusCode: number = 500,
        isOperational: boolean = true
    ) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;

        Error.captureStackTrace(this, this.constructor);
    }
}

export class ValidationError extends CustomError {
    constructor(message: string = "Erreur de validation") {
        super(message, 400);
    }
}

export class NotFoundError extends CustomError {
    constructor(message: string = "Ressource non trouvée") {
        super(message, 404);
    }
}

export class UnauthorizedError extends CustomError {
    constructor(message: string = "Non autorisé") {
        super(message, 401);
    }
}

export class ForbiddenError extends CustomError {
    constructor(message: string = "Accès interdit") {
        super(message, 403);
    }
}

export class ConflictError extends CustomError {
    constructor(message: string = "Conflit de données") {
        super(message, 409);
    }
}

export class DatabaseError extends CustomError {
    constructor(message: string = "Erreur de base de données") {
        super(message, 500);
    }
}

export class CacheError extends CustomError {
    constructor(message: string = "Erreur de cache") {
        super(message, 500);
    }
}
