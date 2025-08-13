import { LocalStorageRepository, SessionStorageRepository } from "./StorageRepository";
import Config from "../../environment/config.json";

export type { StorageRepository } from "./StorageRepository";
export { LocalStorageRepository, SessionStorageRepository } from "./StorageRepository";

function createStorage() {
  switch (Config.STORAGE_TYPE) {
    case "session":
      return new SessionStorageRepository();
    case "local":
    default:
      return new LocalStorageRepository();
  }
}

export const storage = createStorage();
