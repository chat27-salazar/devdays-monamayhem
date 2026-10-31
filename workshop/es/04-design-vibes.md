<!-- l10n-sync: source-file="workshop/04-design-vibes.md" -->
# Parte 4: Tematización orientada al diseño

---

En esta parte, usarás los ciclos de planificación e implementación de Copilot para diseñar una transformación completa del tema. Este es un enfoque de desarrollo que parte del diseño: empieza con una visión, itera sobre los elementos visuales y deja que Copilot se encargue del trabajo pesado de CSS.

## Tarea 1: Planifica el tema retro

<!-- track:vscode:start -->
Cambia al modo **Plan** en GitHub Copilot Chat.
<!-- track:vscode:end -->

<!-- track:cli:start -->
Usa `/plan` en GitHub Copilot CLI o pulsa **Shift+Tab** hasta activar el modo plan.
<!-- track:cli:end -->

Introduce este prompt:

> Quiero transformar esta página en una experiencia completa de arcade retro. Planifica una renovación visual que incluya efectos de líneas de barrido CRT en el fondo, un brillo de neón en el título que pulse como un rótulo, una insignia VS animada con cambios de color en el degradado, un efecto de brillo superpuesto en las tarjetas de resultados, animaciones de entrada flotante para los campos de texto, texto de carga que alterne entre verde y morado, y efectos de brillo al pasar el cursor sobre los cuadrados de contribuciones. Mantén el fondo oscuro (`#0a0a1a`) y los colores de acento verde (`#5fed83`) y morado (`#8a2be2`). Usa un tema oscuro con la tipografía retro para videojuegos Press Start 2P de Google Fonts.

Copilot generará un plan detallado que abarcará todos los efectos visuales. **No lo aceptes de inmediato**: revisa el plan e itera:

- Sugiere ajustes en la duración de las animaciones (por ejemplo, *"Make the neon pulse slower, around 3 seconds"*).
- Pregunta por efectos concretos (por ejemplo, *"How will the shimmer overlay work on the cards?"*).
- Pide cambios en el enfoque si algo no te convence.

## Tarea 2: Implementa el tema

Cuando estés conforme con el plan, pide a Copilot que lo implemente.

> Implementa el plan para el tema de arcade retro que acabamos de diseñar.

Copilot añadirá a la hoja de estilos varias animaciones CSS, pseudoelementos y transiciones. Esto puede incluir:

- `@keyframes` para los efectos de líneas de barrido, pulso de neón, brillo y entrada flotante
- Pseudoelementos (`::before`, `::after`) para los efectos superpuestos
- Propiedades personalizadas de CSS para los colores del tema
- Transiciones y estados `hover` para los elementos interactivos

<!-- track:cli:start -->
Después de aplicar los cambios, usa `/diff` para revisar los cambios de estilo antes de aprobarlos.
<!-- track:cli:end -->

## Tarea 3: Ajusta los efectos visuales

> **⚠️ ¿No aparecen los cambios?** Si el tema o las animaciones no aparecen, detén el servidor de desarrollo (`Ctrl+C`), reinícialo con `npm run dev` y fuerza la recarga del navegador (`Ctrl+Shift+R`).

Mantén abierta la vista previa del navegador e itera sobre el diseño. Prueba prompts como:

> El efecto de líneas de barrido es demasiado intenso; reduce la opacidad a 0.03.

> Añade un sutil parpadeo eléctrico al texto del título.

> La insignia VS debería pulsar con más intensidad.

Este es un enfoque de **desarrollo orientado al diseño**: iteras sobre el resultado visual en tiempo real. Cada prompt refina la experiencia hasta que te convenza. No te conformes con algo apenas aceptable: perfecciona el diseño hasta que la página parezca de una máquina recreativa.

## Tarea 4: Actualiza las instrucciones

Las instrucciones deben reflejar las decisiones de diseño importantes para que los prompts posteriores mantengan el rumbo.

<!-- track:vscode:start -->
Pide a Copilot Chat:

> Add a design guide section to copilot-instructions.md describing our retro arcade theme: colors, fonts, animation style
<!-- track:vscode:end -->

<!-- track:cli:start -->
Pide a Copilot CLI:

> Update our repository instructions with a short design guide for the retro arcade theme: colors, fonts, animation style, and the rule that new UI should keep the neon aesthetic.
<!-- track:cli:end -->

Haz commit de las instrucciones y los cambios de diseño cuando la página tenga el aspecto que buscas.

## ✅ Parte 4 completada

**Lo que has aprendido:**

- Usar flujos de planificación para definir un **sistema de diseño antes de implementarlo**.
- **Iterar sobre el resultado visual** con prompts de seguimiento breves.
- **Actualizar las instrucciones tras tomar decisiones importantes** para mantener la identidad visual.
