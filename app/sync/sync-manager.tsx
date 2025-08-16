"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Upload,
  Clock,
} from "lucide-react";
import { OfflineStorage } from "@/lib/offline-storage";

interface SyncStatus {
  isOnline: boolean;
  pendingCount: number;
  lastSync?: string;
  isSyncing: boolean;
}

export function SyncManager() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    pendingCount: 0,
    isSyncing: false,
  });
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncMessage, setSyncMessage] = useState("");

  useEffect(() => {
    // Update sync status on mount
    updateSyncStatus();

    // Listen for online/offline events
    const handleOnline = () => {
      setSyncStatus((prev) => ({ ...prev, isOnline: true }));
      updateSyncStatus();
      handleAutoSync();
    };

    const handleOffline = () => {
      setSyncStatus((prev) => ({ ...prev, isOnline: false }));
      updateSyncStatus();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
    }

    // Update status every 30 seconds
    const interval = setInterval(updateSyncStatus, 30000);

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      }
      clearInterval(interval);
    };
  }, []);

  const updateSyncStatus = () => {
    const status = OfflineStorage.getSyncStatus();
    const pendingCount = OfflineStorage.getPendingSyncCount();

    setSyncStatus((prev) => ({
      ...prev,
      ...status,
      pendingCount,
      isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    }));
  };

  const handleAutoSync = async () => {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setSyncMessage("Cannot sync while offline");
      return;
    }

    const pendingCount = OfflineStorage.getPendingSyncCount();
    if (pendingCount === 0) {
      setSyncMessage("No pending items to sync");
      return;
    }

    setSyncStatus((prev) => ({ ...prev, isSyncing: true }));
    setSyncProgress(0);
    setSyncMessage("Starting sync...");

    try {
      const pendingRegistrations = OfflineStorage.getUnsyncedRegistrations();
      const pendingScreenings = OfflineStorage.getUnsyncedScreenings();

      setSyncMessage(
        `Syncing ${pendingRegistrations.length} registrations and ${pendingScreenings.length} screenings`
      );
      setSyncProgress(25);

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

      setSyncProgress(75);

      const result = await response.json();

      if (result.success) {
        // Mark items as synced
        pendingRegistrations.forEach((reg) =>
          OfflineStorage.markRegistrationSynced(reg.id)
        );
        pendingScreenings.forEach((screening) =>
          OfflineStorage.markScreeningSynced(screening.id)
        );

        OfflineStorage.setSyncStatus({
          lastSync: new Date().toISOString(),
          isOnline: true,
          pendingCount: 0,
        });

        setSyncProgress(100);
        setSyncMessage(`Successfully synced ${pendingCount} items`);
        updateSyncStatus();
      } else {
        throw new Error(result.message || "Sync failed");
      }
    } catch (error) {
      console.error("Sync error:", error);
      setSyncMessage(`Sync failed: ${error}`);
    } finally {
      setSyncStatus((prev) => ({ ...prev, isSyncing: false }));
      setTimeout(() => {
        setSyncProgress(0);
        setSyncMessage("");
      }, 3000);
    }
  };

  const handleManualSync = () => {
    handleAutoSync();
  };

  const formatLastSync = (lastSync?: string) => {
    if (!lastSync) return "Never";
    const date = new Date(lastSync);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          {syncStatus.isOnline ? (
            <Wifi className="h-5 w-5 text-green-500" />
          ) : (
            <WifiOff className="h-5 w-5 text-red-500" />
          )}
          Sync Status
        </CardTitle>
        <CardDescription>
          {syncStatus.isOnline ? "Connected to server" : "Working offline"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Connection:</span>
          <Badge variant={syncStatus.isOnline ? "default" : "destructive"}>
            {syncStatus.isOnline ? "Online" : "Offline"}
          </Badge>
        </div>

        {/* Pending Items */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Pending Items:</span>
          <Badge
            variant={syncStatus.pendingCount > 0 ? "secondary" : "outline"}
          >
            {syncStatus.pendingCount}
          </Badge>
        </div>

        {/* Last Sync */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Last Sync:
          </span>
          <span className="text-sm text-muted-foreground">
            {formatLastSync(syncStatus.lastSync)}
          </span>
        </div>

        {/* Sync Progress */}
        {syncStatus.isSyncing && (
          <div className="space-y-2">
            <Progress value={syncProgress} className="w-full" />
            <p className="text-sm text-muted-foreground">{syncMessage}</p>
          </div>
        )}

        {/* Sync Message */}
        {syncMessage && !syncStatus.isSyncing && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{syncMessage}</AlertDescription>
          </Alert>
        )}

        {/* Sync Button */}
        <Button
          onClick={handleManualSync}
          disabled={
            !syncStatus.isOnline ||
            syncStatus.isSyncing ||
            syncStatus.pendingCount === 0
          }
          className="w-full"
        >
          {syncStatus.isSyncing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Syncing...
            </>
          ) : syncStatus.pendingCount > 0 ? (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Sync {syncStatus.pendingCount} Items
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              All Synced
            </>
          )}
        </Button>

        {/* Offline Notice */}
        {!syncStatus.isOnline && (
          <Alert>
            <WifiOff className="h-4 w-4" />
            <AlertDescription>
              Youre working offline. Data will be saved locally and synced when
              connection is restored.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
