import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "./logger.js";

const DEFAULT_DATABASE_NAME = "kravi_hrms";

let memoryServer;

function withDefaultDatabaseName(uri) {
  const trimmedUri = uri.trim();
  const schemeEnd = trimmedUri.indexOf("://");
  if (schemeEnd === -1) {
    return { uri: trimmedUri, databaseName: undefined, usedDefaultDatabaseName: false };
  }

  const optionsStart = trimmedUri.search(/[?#]/);
  const beforeOptions = optionsStart === -1 ? trimmedUri : trimmedUri.slice(0, optionsStart);
  const afterOptions = optionsStart === -1 ? "" : trimmedUri.slice(optionsStart);
  const authorityStart = schemeEnd + 3;
  const pathStart = beforeOptions.indexOf("/", authorityStart);

  if (pathStart === -1) {
    return {
      uri: `${beforeOptions}/${DEFAULT_DATABASE_NAME}${afterOptions}`,
      databaseName: DEFAULT_DATABASE_NAME,
      usedDefaultDatabaseName: true,
    };
  }

  const databaseName = beforeOptions.slice(pathStart + 1).trim();
  if (databaseName) {
    return { uri: trimmedUri, databaseName, usedDefaultDatabaseName: false };
  }

  return {
    uri: `${beforeOptions.slice(0, pathStart)}/${DEFAULT_DATABASE_NAME}${afterOptions}`,
    databaseName: DEFAULT_DATABASE_NAME,
    usedDefaultDatabaseName: true,
  };
}

export async function connectDatabase(uri = env.MONGODB_URI) {
  mongoose.set("strictQuery", true);

  const resolved = withDefaultDatabaseName(uri);
  if (env.isProduction && resolved.usedDefaultDatabaseName) {
    throw new Error("MONGODB_URI must include an explicit database name in production, for example /kravi_hrms.");
  }

  if (resolved.usedDefaultDatabaseName) {
    logger.warn({ database: resolved.databaseName }, "MONGODB_URI has no database name; using the project default database.");
  }

  let connectionUri = resolved.uri;
  if (env.USE_MEMORY_DB) {
    if (env.isProduction) {
      throw new Error("USE_MEMORY_DB cannot be enabled in production.");
    }

    const { MongoMemoryServer } = await import("mongodb-memory-server");
    const databaseName = resolved.databaseName || DEFAULT_DATABASE_NAME;
    memoryServer = await MongoMemoryServer.create({ instance: { dbName: databaseName } });
    connectionUri = memoryServer.getUri(databaseName);
    logger.warn("Using development in-memory MongoDB. Data will be lost when the backend stops.");
  }

  await mongoose.connect(connectionUri, {
    autoIndex: !env.isProduction,
  });
  logger.info(`MongoDB connected: ${mongoose.connection.name}`);
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = undefined;
  }
}
