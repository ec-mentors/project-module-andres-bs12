Inyectar GoalService en el constructor de TelegramBotService (para conocer tu meta diaria).
Crear un método helper reutilizable buildRemainingSummary(UUID userId):
Llama a entryService.findTodayEntriesByUser(userId) y suma lo consumido hoy.
Llama a goalService.getGoalByUserAndDate(userId, LocalDate.now()) (o la meta más reciente).
Calcula:
kcalRestantes
=
meta.kcal
−
consumido.kcal
kcalRestantes=meta.kcal−consumido.kcal
proteinaRestante
=
meta.protein
−
consumido.protein
proteinaRestante=meta.protein−consumido.protein
carbsRestantes
=
meta.carbs
−
consumido.carbs
carbsRestantes=meta.carbs−consumido.carbs
grasasRestantes
=
meta.fat
−
consumido.fat
grasasRestantes=meta.fat−consumido.fat


Si metemos dentro de TelegramBotService el cálculo matemático de macros, restas de calorías y formateo de textos largos:

TelegramBotService se vuelve una clase gigante (God Class).
Si el día de mañana quieres enviar ese mismo resumen por Email, por WhatsApp o en una Notificación Web, ¡no podrías reutilizarlo porque estaría atrapado dentro de Telegram!
🏗️ ¿Cómo se separan las responsabilidades elegantemente?
Podemos dividir el trabajo en 2 capas muy claras:

Mermaid diagram
🎯 Las 2 opciones de diseño:
Opción 1: El enfoque Directo y Pragmático (Muy limpio)
La Lógica: Creamos un método en EntryService (o GoalService) que calcule los números puros (consumido vs restante).
El Formato: Creamos una clase TelegramMessageFormatter en util o service con métodos estáticos/componente:
formatMealSaved(entry, remainingSummary)
formatDailyStatus(goal, entries)
Opción 2: Mantenerlo como método privado por ahora
Dejar buildDailyStatusMessage como un método privado private String formatDailyStatus(...) al final de TelegramBotService.
Ventaja: Menos archivos nuevos.
Desventaja: No es reutilizable fuera de Telegram.
💡 Mi recomendación como mentor:
Crear una pequeña clase auxiliar en util o service: 👉 TelegramMessageFormatter.java

Así TelegramBotService solo se encarga de recibir y despachar, y TelegramMessageFormatter se encarga de que los textos y emojis queden preciosos.

¿Qué te parece la idea de crear TelegramMessageFormatter?

