// Offline storage utilities for the health app
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface OfflineRegistration {
  id: string;
  data: any;
  timestamp: string;
  synced: boolean;
  syncedAt?: string;
}

export interface OfflineScreening {
  id: string;
  data: any;
  timestamp: string;
  synced: boolean;
  syncedAt?: string;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export class OfflineStorage {
  private static REGISTRATION_KEY = "swarnabindu_registrations";
  private static SCREENING_KEY = "swarnabindu_screenings";
  private static SYNC_STATUS_KEY = "swarnabindu_sync_status";

  // Check if localStorage is available
  private static isLocalStorageAvailable(): boolean {
    try {
      if (typeof window === "undefined" || !window.localStorage) {
        return false;
      }
      const test = "__localStorage_test__";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  // Registration storage methods
  /* eslint-disable @typescript-eslint/no-explicit-any */
  static saveRegistration(registrationData: any): string {
    if (!this.isLocalStorageAvailable()) {
      console.warn("localStorage not available");
      throw new Error("Local storage not available");
    }

    try {
      const id = `reg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const registration: OfflineRegistration = {
        id,
        data: registrationData,
        timestamp: new Date().toISOString(),
        synced: false,
      };

      const existingRegistrations = this.getOfflineRegistrations();
      existingRegistrations.push(registration);

      localStorage.setItem(
        this.REGISTRATION_KEY,
        JSON.stringify(existingRegistrations)
      );
      return id;
    } catch (error) {
      console.error("Error saving registration to offline storage:", error);
      throw error;
    }
  }
  /* eslint-disable @typescript-eslint/no-explicit-any */

  static getOfflineRegistrations(): OfflineRegistration[] {
    if (!this.isLocalStorageAvailable()) {
      return [];
    }

    try {
      const stored = localStorage.getItem(this.REGISTRATION_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error loading offline registrations:", error);
      return [];
    }
  }

  static getAllLocalRegistrations(): any[] {
    return this.getOfflineRegistrations().map((r) => ({
      id: r.id,
      localId: r.id,
      ...r.data,
      created_at: r.timestamp,
      synced: r.synced,
    }));
  }

  static getUnsyncedRegistrations(): OfflineRegistration[] {
    return this.getOfflineRegistrations().filter((r) => !r.synced);
  }

  static getPendingRegistrations(): OfflineRegistration[] {
    return this.getUnsyncedRegistrations();
  }

  static markRegistrationSynced(localId: string, serverId?: string): void {
    if (!this.isLocalStorageAvailable()) {
      return;
    }

    try {
      const registrations = this.getOfflineRegistrations();
      const registration = registrations.find((r) => r.id === localId);
      if (registration) {
        registration.synced = true;
        registration.syncedAt = new Date().toISOString();
        if (serverId) {
          registration.data.server_id = serverId;
        }
        localStorage.setItem(
          this.REGISTRATION_KEY,
          JSON.stringify(registrations)
        );
      }
    } catch (error) {
      console.error("Error marking registration as synced:", error);
    }
  }

  // Screening storage methods
  static saveScreening(screeningData: any): string {
    if (!this.isLocalStorageAvailable()) {
      console.warn("localStorage not available");
      throw new Error("Local storage not available");
    }

    try {
      const id = `scr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const screening: OfflineScreening = {
        id,
        data: screeningData,
        timestamp: new Date().toISOString(),
        synced: false,
      };

      const existingScreenings = this.getOfflineScreenings();
      existingScreenings.push(screening);

      localStorage.setItem(
        this.SCREENING_KEY,
        JSON.stringify(existingScreenings)
      );
      return id;
    } catch (error) {
      console.error("Error saving screening to offline storage:", error);
      throw error;
    }
  }

  static getOfflineScreenings(): OfflineScreening[] {
    if (!this.isLocalStorageAvailable()) {
      return [];
    }

    try {
      const stored = localStorage.getItem(this.SCREENING_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error loading offline screenings:", error);
      return [];
    }
  }

  static getUnsyncedScreenings(): OfflineScreening[] {
    return this.getOfflineScreenings().filter((s) => !s.synced);
  }

  static getPendingScreenings(): OfflineScreening[] {
    return this.getUnsyncedScreenings();
  }

  static markScreeningSynced(localId: string, serverId?: string): void {
    if (!this.isLocalStorageAvailable()) {
      return;
    }

    try {
      const screenings = this.getOfflineScreenings();
      const screening = screenings.find((s) => s.id === localId);
      if (screening) {
        screening.synced = true;
        screening.syncedAt = new Date().toISOString();
        if (serverId) {
          screening.data.server_id = serverId;
        }
        localStorage.setItem(this.SCREENING_KEY, JSON.stringify(screenings));
      }
    } catch (error) {
      console.error("Error marking screening as synced:", error);
    }
  }

  // Sync status methods
  static setSyncStatus(status: {
    lastSync?: string;
    isOnline: boolean;
    pendingCount: number;
  }): void {
    if (!this.isLocalStorageAvailable()) {
      return;
    }

    try {
      localStorage.setItem(this.SYNC_STATUS_KEY, JSON.stringify(status));
    } catch (error) {
      console.error("Error setting sync status:", error);
    }
  }

  static getSyncStatus(): {
    lastSync?: string;
    isOnline: boolean;
    pendingCount: number;
  } {
    if (!this.isLocalStorageAvailable()) {
      return {
        isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
        pendingCount: 0,
      };
    }

    try {
      const stored = localStorage.getItem(this.SYNC_STATUS_KEY);
      return stored
        ? JSON.parse(stored)
        : {
            isOnline:
              typeof navigator !== "undefined" ? navigator.onLine : true,
            pendingCount: 0,
          };
    } catch (error) {
      return {
        isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
        pendingCount: 0,
      };
    }
  }

  // Utility methods
  static getPendingSyncCount(): number {
    return (
      this.getUnsyncedRegistrations().length +
      this.getUnsyncedScreenings().length
    );
  }

  static getPendingCount(): number {
    return this.getPendingSyncCount();
  }

  static clearSyncedData(): void {
    if (!this.isLocalStorageAvailable()) {
      return;
    }

    try {
      const registrations = this.getOfflineRegistrations().filter(
        (r) => !r.synced
      );
      const screenings = this.getOfflineScreenings().filter((s) => !s.synced);

      localStorage.setItem(
        this.REGISTRATION_KEY,
        JSON.stringify(registrations)
      );
      localStorage.setItem(this.SCREENING_KEY, JSON.stringify(screenings));
    } catch (error) {
      console.error("Error clearing synced data:", error);
    }
  }

  static clearAll(): void {
    this.clearAllData();
  }

  static clearAllData(): void {
    if (!this.isLocalStorageAvailable()) {
      return;
    }

    try {
      localStorage.removeItem(this.REGISTRATION_KEY);
      localStorage.removeItem(this.SCREENING_KEY);
      localStorage.removeItem(this.SYNC_STATUS_KEY);
    } catch (error) {
      console.error("Error clearing all offline data:", error);
    }
  }

  static isOnline(): boolean {
    return typeof navigator !== "undefined" ? navigator.onLine : true;
  }

  // Auto-sync functionality
  static async autoSync(): Promise<void> {
    if (!this.isOnline()) {
      console.log("Offline - skipping auto sync");
      return;
    }

    const pendingRegistrations = this.getUnsyncedRegistrations();
    const pendingScreenings = this.getUnsyncedScreenings();

    if (pendingRegistrations.length === 0 && pendingScreenings.length === 0) {
      console.log("No pending items to sync");
      return;
    }

    try {
      console.log(
        `Syncing ${pendingRegistrations.length} registrations and ${pendingScreenings.length} screenings`
      );

      const response = await fetch("/api/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          registrations: pendingRegistrations.map((r) => r.data),
          screenings: pendingScreenings.map((s) => s.data),
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Mark items as synced
        pendingRegistrations.forEach((reg) =>
          this.markRegistrationSynced(reg.id)
        );
        pendingScreenings.forEach((screening) =>
          this.markScreeningSynced(screening.id)
        );

        this.setSyncStatus({
          lastSync: new Date().toISOString(),
          isOnline: true,
          pendingCount: 0,
        });

        console.log("Auto-sync completed successfully");
      } else {
        console.error("Auto-sync failed:", result.message);
      }
    } catch (error) {
      console.error("Auto-sync error:", error);
    }
  }
}

// Initialize offline storage and set up auto-sync
if (typeof window !== "undefined") {
  // Listen for online/offline events
  window.addEventListener("online", () => {
    console.log("Back online - attempting auto-sync");
    OfflineStorage.setSyncStatus({
      isOnline: true,
      pendingCount: OfflineStorage.getPendingSyncCount(),
    });
    OfflineStorage.autoSync();
  });

  window.addEventListener("offline", () => {
    console.log("Gone offline - data will be stored locally");
    OfflineStorage.setSyncStatus({
      isOnline: false,
      pendingCount: OfflineStorage.getPendingSyncCount(),
    });
  });

  // Auto-sync on page load if online
  if (OfflineStorage.isOnline()) {
    setTimeout(() => {
      OfflineStorage.autoSync();
    }, 2000); // Wait 2 seconds after page load
  }
}
