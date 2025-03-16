import { config } from "dotenv";
import validate, { RequiredEnvironment, RequiredEnvironmentTypes } from "@boxpositron/vre";

// Load the correct .env file based on NODE_ENV
const envFilePath = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
config({ path: envFilePath });

// Define the required environment variables and their types
const runtimeEnvironment: RequiredEnvironment[] = [
    {
        name: "PORT",
        type: RequiredEnvironmentTypes.Number,
    },
    {
        name: "DATABASE_URL",
        type: RequiredEnvironmentTypes.String,
    },
    {
        name: "JWT_SECRET",
        type: RequiredEnvironmentTypes.String,
    },
    {
        name: "CLOUDINARY_URL",
        type: RequiredEnvironmentTypes.String,
    },
    {
        name: "CLOUDINARY_API_SECRET",
        type: RequiredEnvironmentTypes.String,
    },
    {
        name: "CLOUDINARY_API_KEY",
        type: RequiredEnvironmentTypes.String,
    },
    {
        name: "CLOUDINARY_NAME",
        type: RequiredEnvironmentTypes.String,
    },
    {
        name: "OPENAI_API_KEY",
        type: RequiredEnvironmentTypes.String,
    }
];

// Validate the runtime environment variables
validate(runtimeEnvironment);

// Export the environment configuration as an object
export const envConfig = {
    PORT: process.env.PORT,
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
};
