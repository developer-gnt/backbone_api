# Backbone Master/Admin Backend Alignment Plan

## Goal
Align the NestJS backend to the live Backbone database **without changing the database schema**.

> Rule: backend adapts to DB, `synchronize: false`, no blind migration runs, no data loss.

## Verified Current State
- TypeORM already has `synchronize: false` in `src/config/typeorm.ts`
- Swagger is already bootstrapped in `src/main.ts`
- Current codebase is a generic Nest CRUD base and is **not yet aligned** to the live table names/business flow
- Existing master modules are reusable as scaffolding for admin CRUD

## Source-of-Truth Table Mapping

| Business Area | Live DB Table | Current Backend | Action |
|---|---|---|---|
| Users / clients / employees | `Registrations` | `users` | Replace/alignment required |
| States / cities | `city_master` | `state` | Align entity + queries |
| Reference sources | `ReferenceSource_master` | `reference` | Align entity + naming |
| Packages | `Package_master` | `package` | Align entity + wallet package flow |
| Forms | `tbl_formstype` | `forms` | Align entity + update API |
| Availability | `availability` | `alert_availability` | Align entity + message field |
| Wallet history | `Transactions` | `transaction` | Replace with real history flow |
| Orders | `Orders` | missing | Build module |
| Downloads | `Downloads` | missing | Build module |
| Completed downloads | `CompletedDownloads` | missing | Build module |
| Attendance | `attendance` | migration only | Build report API |
| Website access | `WebsiteAccessLogs` | missing | Build report API |

## Redevelopment Phases

### Phase 0 — Safe discovery
1. Inspect live DB schema/table columns exactly
2. Capture legacy C# business rules per module
3. Freeze dangerous migration commands
4. Confirm role/status enums used in `Registrations`

### Phase 1 — Entity alignment
1. Create/adjust entities to match live table names exactly
2. Keep original DB column names in decorators
3. Remove assumptions from generic CRUD entities
4. Validate repository queries against live schema

### Phase 2 — Master/Admin core modules
1. **User Management** on `Registrations`
   - `createEmployee()`
   - `updateUser()`
   - `changeStatus()`
   - `assignSupervisor()`
2. **Wallet Management**
   - `addCredit()`
   - `addTransaction()`
   - `updateWallet()`
   - transactional update: `Registrations.wallete_balance` then insert `Transactions`
3. **Order Management**
   - `getOrders()`
   - `assignSupervisor()`
   - `assignTeamMember()`
   - `updateOrderStatus()`
   - `reply/remark`

### Phase 3 — Reports
1. Employee report (`Registrations` + `Orders`)
2. Client report (`Registrations` + `Orders`)
3. Transactions report (`Transactions` + `Registrations`)
4. Attendance report (`attendance`)
5. Website access report (`WebsiteAccessLogs`)

### Phase 4 — Swagger test surface
Group endpoints clearly in Swagger for:
- `Master Users`
- `Master Wallet`
- `Master Orders`
- `Master Packages`
- `Master Forms`
- `Master Availability`
- `Master Reports`

## Immediate Next Implementation Order
1. Align `Registrations` entity
2. Implement wallet transaction-safe service methods
3. Build order module with supervisor/team member assignment
4. Build reports module
5. Finalize Swagger DTOs and endpoint tags for testing

## Important Engineering Rules
- Always use parameterized repository queries
- No string-concatenated SQL like `where username='...'`
- Prefer joins over looped queries
- Wrap wallet changes in DB transactions
- Preserve legacy business behavior

## Swagger Testing Note
After booting the API, the docs should be available from the configured Swagger route in `src/main.ts`.
