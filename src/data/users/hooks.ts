// DEPRECATED: This file is kept for backward compatibility only.
// New modular structure is available in ./hooks/ directory.
//
// The original 362-line monolithic hooks file has been refactored into:
// - ./constants.ts - Configuration and query keys
// - ./cache-utils.ts - Simplified cache management utilities
// - ./hooks/crud.ts - CRUD operations (useUsers, useUser, etc.)
// - ./hooks/pagination.ts - Enhanced pagination with auto page adjustment
// - ./hooks/index.ts - Clean exports
//
// Key improvements:
// ✅ Automatic page adjustment (no more manual adjustPageIfNeeded calls)
// ✅ Simplified cache management (reliable invalidation over complex redistribution)
// ✅ Better separation of concerns
// ✅ Extracted constants and utilities
// ✅ Smaller, focused files

// Re-export everything for backward compatibility
export * from "./hooks/index";
