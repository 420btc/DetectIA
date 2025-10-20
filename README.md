# Detective AI Game

Un juego interactivo de detective donde OpenAI actúa como el "villano delincuente" creando casos policiales únicos para resolver paso a paso.

## Características

### Sistema de Generación de Casos
- **Múltiples llamadas a IA**: Generación en 4 pasos (framework, sospechosos, evidencia, timeline)
- **2-4 sospechosos por caso**: 1 culpable, los demás son sospechosos
- **Dificultad progresiva**: Fácil, Medio, Difícil
- **Casos completamente únicos**: Generados con GPT-4 Turbo

### Perfiles de Villanos
La IA utiliza 5 arquetipos de villanos con super prompts especializados:
1. **El Maestro** - Inteligente, calculador, usa lógica
2. **El Depredador** - Carismático psicópata, manipulador
3. **El Desesperado** - Criminal ordinario, pánico genuino
4. **El Profesional** - Experimentado, conoce el sistema
5. **El Impulsivo** - Emocional, impredecible

### Interrogatorio Interactivo
- Chat en tiempo real con sospechosos
- Historial de conversación persistente
- Análisis de inconsistencias
- Nivel de sospecha dinámico
- Preguntas sugeridas estratégicas

### Sistema de Investigación
- **Tablero de evidencia**: Evidencia expandible con pistas falsas
- **Mapa de escena**: Mapas ASCII generados por IA
- **Pistas de investigación**: Sugerencias estratégicas
- **Timeline detallado**: Línea de tiempo del crimen

### Minijuegos de Deducción
1. **Preguntas Múltiples**: 4 opciones con explicaciones
2. **Adivinanzas**: Respuestas abiertas con pistas progresivas
3. **Tests de Deducción**: Escenarios complejos con lógica

## Configuración

### Requisitos
- Node.js 18+
- OpenAI API Key

### Variables de Entorno
\`\`\`
OPENAI_API_KEY=tu_api_key_aqui
\`\`\`

### Instalación
\`\`\`bash
npm install
npm run dev
\`\`\`

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Cómo Jugar

1. **Selecciona dificultad** en el menú principal
2. **Genera un caso** - La IA crea un caso único con sospechosos y evidencia
3. **Interroga sospechosos** - Haz preguntas estratégicas para detectar mentiras
4. **Analiza evidencia** - Revisa pistas y busca inconsistencias
5. **Usa herramientas** - Consulta mapas, pistas y timeline
6. **Juega minijuegos** - Prueba tus habilidades de deducción
7. **Acusa al culpable** - Cuando tengas suficiente evidencia

## Arquitectura

### Stack Técnico
- **Frontend**: Next.js 15 + React + TypeScript
- **Backend**: Route Handlers (API)
- **IA**: OpenAI API (GPT-4 Turbo)
- **Estilos**: Tailwind CSS v4
- **UI**: shadcn/ui components

### Estructura de Carpetas
\`\`\`
app/
├── api/
│   ├── generate-case/
│   ├── interrogate/
│   ├── analyze-interrogation/
│   ├── investigation-hints/
│   ├── case-map/
│   └── minigames/
├── page.tsx
└── layout.tsx

components/
├── game-menu.tsx
├── game-board.tsx
├── interrogation-room.tsx
├── evidence-board.tsx
├── case-progress.tsx
├── investigation-tools.tsx
├── minigames-hub.tsx
└── minigames/
    ├── multiple-choice-game.tsx
    ├── riddle-game.tsx
    └── deduction-game.tsx

lib/
├── openai-client.ts
├── ai-service.ts
├── case-generator.ts
├── villain-profiles.ts
├── investigation-analyzer.ts
└── minigames-generator.ts
\`\`\`

## Características Técnicas

### Generación de Casos (4 Llamadas a IA)
1. **generateCaseFramework**: Marco básico del caso
2. **generateSuspects**: Sospechosos con backstories
3. **generateEvidence**: Evidencia con pistas falsas
4. **generateTimeline**: Timeline detallado

### Super Prompts para Villanos
Cada villano tiene un super prompt especializado que:
- Define su estrategia de defensa
- Especifica tácticas de engaño
- Explota sus debilidades
- Mantiene consistencia en la mentira

### Análisis de Interrogatorio
- Detecta inconsistencias en respuestas
- Calcula puntuación de sospecha
- Identifica indicadores de engaño
- Sugiere preguntas de seguimiento

## Notas de Desarrollo

- Usa GPT-4 Turbo con máx tokens (4096) para mejor calidad
- Cada sospechoso mantiene contexto completo de conversación
- La IA recuerda todo lo que ha dicho para detectar contradicciones
- Los minijuegos se generan dinámicamente basados en el caso

## Licencia

MIT
