# 🎓 Clase Magistral: Arquitectura de Control de Tokens y Rate Limiting de IA

> **Rol del Documento:** Guía conceptual y pedagógica para que diseñes e implementes tu propio sistema de cuotas de IA paso a paso, entendiendo el *por qué* detrás de cada decisión técnica.

---

## 🧭 1. El Problema del Mundo Real: La Economía de los LLMs

Cuando desarrollas en local, hacer 50 peticiones a la IA para probar una pantalla parece gratuito. Sin embargo, en el momento en que compartes tu aplicación con otras personas (amigos, beta testers o usuarios finales), **cada clic tiene un coste financiero directo**.

### 💸 ¿Cómo factura un proveedor como OpenAI?
1. **Modelos de Lenguaje y Visión (`gpt-5.6-luna`):**
   - **Tokens de Entrada (Prompt):** Cobran por el tamaño del texto que envías y, en el caso de imágenes, por la resolución y número de cuadrículas (*patches*) procesadas.
   - **Tokens de Salida (Completion):** Cobran por cada palabra/número que el modelo genera en su respuesta JSON.
2. **Modelos de Audio (`whisper-1`):**
   - Cobran por **segundo/minuto de audio** procesado, sin importar si el audio contenía 3 palabras o 100.

### 🛑 La Primera Regla de Oro: El Frontend Nunca es Confiable
Un error clásico de desarrolladores novatos es implementar el límite solo en React (por ejemplo, guardando un contador en `localStorage` o deshabilitando un botón tras 5 clics).
- **¿Por qué falla esto?** Un usuario curioso puede abrir la consola del navegador, borrar su `localStorage`, o simplemente tomar la URL de tu API y enviar 200 peticiones con herramientas como Postman o cURL.
- **La Invariante:** *El servidor (Spring Boot) es la única autoridad que puede decidir si una petición a la IA se ejecuta o se rechaza.*

---

## 🧠 2. Estrategias de Rate Limiting: ¿Dónde Guardamos los Contadores?

Existen tres formas estándar en la industria para rastrear el consumo de usuarios:

| Estrategia | ¿Cómo funciona? | Ventajas | Desventajas | ¿Es ideal para tu caso? |
| :--- | :--- | :--- | :--- | :---: |
| **1. En Memoria (Java RAM / Map / Bucket4j)** | Guarda un contador por usuario en variables de la JVM. | Ultrarrápido (nanosegundos). | Si reinicias Spring Boot o despliegas una actualización, la memoria se borra y los límites se reinician. | ❌ No persistente. |
| **2. Caché Externa (Redis)** | Servidor de clave-valor con expiración automática (`TTL`). | Rápido y persistente entre reinicios. | Añade complejidad de infraestructura (requiere levantar y mantener un contenedor de Redis). | ⚠️ Sobrediseño para una app pequeña/mediana. |
| **3. Base de Datos Relacional (PostgreSQL)** | Una tabla con los contadores del día vinculados al `user_id`. | Persistente, reutiliza tu base de datos actual, transaccional y sin costo extra. | Ligeramente más lenta que RAM (unos pocos milisegundos, imperceptible para peticiones de IA que tardan 1-3 segundos). | ✅ **Recomendada para tu arquitectura.** |

---

## 📐 3. El Modelo Mental de la Base de Datos

### La Pregunta Fundamental
Antes de llamar a OpenAI, el backend debe poder responder a una sola pregunta:
> *"¿Cuántas veces ha usado el usuario X la funcionalidad Y durante el día de HOY?"*

### La Magia del "Autoreseteo Natural" por Calendario
En lugar de crear tareas programadas complejas (*Cronjobs* o *Schedulers*) que a medianoche borren contadores en la base de datos, utilizamos un diseño basado en **claves compuestas por fecha**:

1. Diseñas una tabla donde cada registro represente la actividad de **un usuario en un día específico**:
   - `user_id` (¿Quién es?)
   - `fecha` (¿Qué día es hoy?)
   - `contador_goals`, `contador_favorites`, `contador_entries` (¿Cuánto lleva?)
2. Estableces una **restricción única** (`UNIQUE`) para el par `(user_id, fecha)`.
3. **¿Qué ocurre a las 00:00?**
   - Cuando el usuario hace una petición a las 23:59 del día 28, el backend consulta la fila del día `2026-08-28` (que ya tiene 5 de 5 usados).
   - Cuando hace otra petición a las 00:01 del día 29, el backend busca una fila para `2026-08-29`. Al no existir, crea una fila nueva con contadores en **0**.
   - **Resultado:** ¡El sistema se resetea solo a medianoche sin ejecutar ningún script nocturno!

---

## ⚙️ 4. El Flujo de Ejecución en el Backend (Paso a Paso)

Para que tu arquitectura sea limpia y mantenible, dividimos el trabajo en capas bien definidas:

```
[ Petición Entrante con Bearer Token ]
                 ↓
1. Capa de Seguridad (GoogleAuthFilter)
   → Autentica el token criptográficamente y averigua el UUID del usuario.
                 ↓
2. Capa de Controlador (AiController)
   → Recibe la petición del usuario autenticado.
                 ↓
3. Capa de Cuotas (AiQuotaService)
   → Regla de Oro: "Valida primero, incrementa, y solo después llama a la IA".
   → ¿Tiene saldo disponible hoy?
         ├─ SÍ → Incrementa contador (+1) en PostgreSQL y permite continuar.
         └─ NO → Lanza una excepción de dominio (AiQuotaExceededException).
                 ↓
4. Capa de Integración IA (AiMealService / Spring AI)
   → Solo se invoca si el paso 3 tuvo éxito (protegiendo el 100% de tu saldo).
                 ↓
5. Capa de Manejo de Errores (GlobalExceptionHandler)
   → Si el paso 3 lanzó la excepción, la traduce a un código HTTP 429.
```

---

## 🚦 5. Semántica HTTP y el Código 429 (`Too Many Requests`)

En una API REST profesional, cada situación tiene su código de respuesta apropiado:
- `200 OK`: Todo salió bien.
- `400 Bad Request`: El cliente envió datos inválidos (por ejemplo, un JSON mal formado).
- `401 Unauthorized`: El usuario no ha iniciado sesión.
- `403 Forbidden`: El usuario no tiene permisos para ese recurso.
- **`429 Too Many Requests` (El código estándar de Rate Limiting):** Indica que el cliente ha agotado su cuota de peticiones permitidas en una ventana de tiempo.

### ¿Qué debe devolver el servidor en un 429?
Un JSON claro y explicativo para que el frontend pueda informar al usuario:
- Qué límite se alcanzó.
- Cuántos intentos usó vs el máximo permitido.
- Un mensaje humano amigable.

---

## 🎨 6. Experiencia de Usuario (UX): Filosofía de "Degradación Elegante"

El mayor error de diseño al poner límites es **bloquear la aplicación completa**. Si un amigo tuyo está entusiasmado registrando su dieta y tras la 5ª comida la app se vuelve inservible, dejará de usarla.

### El Principio de Degradación Elegante:
1. **La IA es un acelerador de conveniencia**, no el motor obligatorio del producto.
2. Si la IA se agota por hoy, la funcionalidad central (**el registro manual de comidas**) debe seguir disponible al 100% y de forma ilimitada.
3. El mensaje que muestras no debe sonar a regaño o error de sistema, sino a una explicación transparente:
   > *"¡Has completado tus 5 registros asistidos por IA de hoy! 🥗 Para garantizar la disponibilidad del servicio, tu cuota de IA se reiniciará mañana a las 00:00. Mientras tanto, puedes registrar todas las comidas que desees usando el formulario manual."*

---

## 📋 7. Tu Hoja de Ruta de Construcción (El Reto del Estudiante)

Para construir tú mismo esta funcionalidad, sigue esta secuencia lógica de trabajo:

### Fase 1: La Persistencia (Base de Datos)
- [ ] **Diseña la tabla en SQL:** Define columnas para el identificador de usuario, la fecha del día, los 3 contadores enteros (`goals`, `favorites`, `entries`), y la restricción única `(user_id, fecha)`.
- [ ] **Mapea la Entidad JPA:** Crea la clase Java anotada con `@Entity`, vinculando los tipos de datos correctos (`UUID`, `LocalDate`, `int`).
- [ ] **Crea el Repositorio Spring Data:** Declara un método que busque por usuario y fecha.

### Fase 2: La Lógica de Negocio (Servicio)
- [ ] **Define los Límites:** Decide si los límites (`2`, `3`, `5`) los pondrás fijos en código o configurables en `application.properties` usando `@Value`.
- [ ] **Crea tu Excepción Personalizada:** Una clase que herede de `RuntimeException` y almacene los datos del límite superado.
- [ ] **Implementa el Método de Validación:**
  1. Obtén la fecha de hoy (`LocalDate.now()`).
  2. Busca el registro de hoy; si no existe, inicialízalo con valores en 0.
  3. Comprueba si el contador actual superó el límite.
  4. Si se superó, lanza tu excepción.
  5. Si no se superó, incrementa el contador y guarda en la base de datos dentro de una transacción (`@Transactional`).

### Fase 3: La Protección de Endpoints (Controladores)
- [ ] **Inyecta el Servicio en los Controladores de IA:** En los métodos de cálculo de metas, transcripción de voz, análisis de texto y fotos.
- [ ] **Obtén el Usuario Autenticado:** Pasa el `userId` al método de validación **antes** de llamar a cualquier método de Spring AI o OpenAI.

### Fase 4: La Respuesta REST y el Frontend
- [ ] **Captura la Excepción en el Manejador Global:** Añade un método `@ExceptionHandler` en tu `GlobalExceptionHandler` que capture tu excepción personalizada y devuelva `HttpStatus.TOO_MANY_REQUESTS` (429).
- [ ] **Adapta el Cliente Frontend:** En tu cliente de peticiones (por ejemplo, `api.ts`), detecta el código `status === 429` para propagar el mensaje claro a tus componentes visuales (como el chat o el modal de añadir comidas).

---

## 🎯 Resumen Teórico

```
┌─────────────────────────────────────────────────────────────┐
│  Seguridad (Servidor)  +  Persistencia (PostgreSQL)         │
│  + Reseteo Natural (Date)  +  Semántica HTTP (429)          │
│  + Degradación Elegante (Manual) = Arquitectura Robusta     │
└─────────────────────────────────────────────────────────────┘
```

¡Con estos conceptos claros, tienes todas las bases arquitectónicas para programar un control de consumo profesional y blindar tu proyecto!
