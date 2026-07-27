# 📓 NutritionTracker - Diario de Aprendizaje

Este documento es un diario de desarrollo y aprendizaje para registrar conceptos clave, decisiones de arquitectura y notas aprendidas durante el proyecto **NutritionTracker**.

---

## 📅 2026-07-27 - Base de Datos, Entidades JPA & Restricciones

### 💡 Conceptos Clave Aprendidos

1. **`SERIAL` vs `UUID` en PostgreSQL:**
   - `SERIAL` es un atajo en PostgreSQL para enteros secuenciales (`1, 2, 3...`).
   - `UUID` (128 bits) genera identificadores globales únicos e impredecibles (`a0eebc99-9c0b...`), evitando ataques de enumeración en URLs públicas (`/api/entries/uuid` en lugar de `/api/entries/42`).
   - En PostgreSQL se genera automáticamente con `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`.

2. **Restricción `CONSTRAINT uk_user_goal_date UNIQUE (user_id, start_date)`:**
   - Asegura que la **combinación** de `user_id` y `start_date` sea única en la tabla `goal`.
   - Garantiza que un usuario solo tenga **un objetivo registrado por fecha**.
   - Si el usuario cambia su meta el mismo día, el sistema realiza un `UPDATE` en lugar de crear un registro duplicado (`INSERT`).
   - En Java JPA se refleja en `@Table(uniqueConstraints = {@UniqueConstraint(name = "...", columnNames = {"user_id", "start_date"})})`.

3. **Mapeo de Fechas en Java (`java.time.LocalDate` vs `java.util.Date`):**
   - Para columnas SQL de tipo `DATE` (solo fecha sin hora), en Java moderno debemos usar **`java.time.LocalDate`** (nunca el antiguo `java.util.Date`).

4. **Relaciones Orientadas a Objetos con `@ManyToOne`:**
   - En SQL pensamos en columnas de clave foránea (`user_id`).
   - En Java JPA pensamos en objetos: `private User user;` anotado con `@ManyToOne` y `@JoinColumn(name = "user_id")`.
   - Permite navegar directamente los objetos en Java: `goal.getUser().getFirstName()`.
   - No crea una tabla extra; solo coloca la columna `user_id` en la tabla `goal`.

---

## 📅 YYYY-MM-DD - [Título del día]

### 💡 Conceptos Clave Aprendidos
- [Escribe aquí lo aprendido hoy...]

### 📝 Notas y Discusiones con la IA
- [Escribe notas de tus dudas resueltas...]
