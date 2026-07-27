# flow of data in nutrition tracker

This document describes the request-response architecture and data flow between the Client, Controller, DTOs, Mapper, Service, and PostgreSQL Database.

---

## 🔄 End-to-End Data Flow

```text
[ Client / Web UI / Telegram Bot ]
       │
       │  1. Sends HTTP Request with EntryRequestDTO (mealName, kcal, carbs, fat, protein)
       ▼
  [ REST Controller ]
       │
       │  2. Passes EntryRequestDTO to EntryService
       ▼
  [ EntryService ]
       │
       │  3. Uses EntryMapper (@Component) to convert EntryRequestDTO -> Entity Entry
       │     (Attaches logged-in User and sets LocalDateTime.now())
       ▼
  [ EntryRepository / PostgreSQL ]
       │
       │  4. Saves Entity to database and generates UUID id
       ▼
  [ EntryService ]
       │
       │  5. Uses EntryMapper (@Component) to convert saved Entity -> EntryResponseDTO
       ▼
  [ REST Controller ]
       │
       │  6. Returns HTTP 201 Created with EntryResponseDTO payload
       ▼
[ Client receives EntryResponseDTO (with generated id and createdOn timestamp) ]
```

---

## 🛠️ Component Responsibilities in the Flow

1. **Client (Web / Telegram):** Sends raw input data in `EntryRequestDTO` format.
2. **REST Controller (`@RestController`):** Handles HTTP requests/responses. Does not contain business logic.
3. **Mapper (`@Component`):** Translates between DTOs and Database Entities.
4. **Service (`@Service`):** Manages business logic, session validation, and orchestrates mapping and database operations.
5. **Repository (`@Repository`):** Executes JPA/Hibernate operations on PostgreSQL.
