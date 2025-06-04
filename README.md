# 🧠 Milari

> Milari es una aplicación de escritorio moderna construida con React y Electron que une gestión de tareas, calendario inteligente, seguimiento de hábitos, análisis de productividad y comandos de voz en una experiencia fluida, emocional y profundamente personal.

Inspirada en el nombre de una madre, Milari rinde homenaje a las miles de mujeres que nos enseñaron que siempre hay un tiempo para todo: para trabajar, para descansar, para soñar y para cuidar de los demás.
Esta app no solo organiza tus días, sino que te recuerda lo que realmente importa.

Milari no es solo una herramienta.
Es una compañera diaria creada con propósito, para ayudarte a vivir con más intención, claridad y cariño.

## ✨ Características

### 📋 Gestión de Tareas Inteligente
- ✅ Creación rápida de tareas con comandos de voz
- 🎯 Sistema de prioridades con indicadores visuales
- ⏰ Programación flexible con recordatorios automáticos
- 🏷️ Auto-categorización por tipo de tarea

### 📅 Calendario Integrado
- 📆 Vista mensual con indicadores de tareas
- 🗓️ Programación por arrastrar y soltar
- 📊 Vista de hoy optimizada para productividad diaria
- 🔄 Sincronización en tiempo real

### 📊 Analytics de Productividad
- 📈 Métricas detalladas de rendimiento
- 🔥 Sistema de rachas motivacional
- 💡 Insights automáticos sobre patrones de trabajo
- 📋 Reportes exportables

### 🎤 Comandos de Voz
- 🗣️ Reconocimiento de voz en español
- ⚡ Creación instantánea de tareas
- ❓ Consultas de estado y programación
- 🎯 Completación de tareas por voz

### 🔔 Notificaciones Inteligentes
- ⏰ Recordatorios programables
- 🎉 Notificaciones de logros
- 🌅 Recordatorios matutinos personalizados
- 📱 Integración con sistema operativo

## 🚀 Instalación

### Prerequisitos
- Node.js 18+ 
- npm o yarn
- macOS, Windows o Linux

### Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/mindflow.git
cd mindflow
```

### Instalar dependencias
```bash
npm install
```

### Ejecutar en modo desarrollo
```bash
# Ejecutar React + Electron
npm run electron-dev

# Solo React (para desarrollo web)
npm start

# Solo Electron
npm run electron
```

### Construir para producción
```bash
# Crear build optimizado
npm run build

# Crear instalador para tu plataforma
npm run dist
```

## 🛠️ Tecnologías

- **Frontend**: React 19.1.0, CSS3 con efectos glassmorphism
- **Desktop**: Electron 36.4.0
- **Base de Datos**: SQLite3 con almacenamiento local
- **Voz**: Web Speech API
- **Notificaciones**: Notification API + Service Workers
- **Analytics**: Sistema propio de métricas

## 📁 Estructura del Proyecto

```
mindflow/
├── public/                 # Archivos públicos y recursos
├── src/
│   ├── components/        # Componentes React
│   │   ├── TodayView.js   # Vista principal del día
│   │   ├── Calendar.js    # Calendario interactivo
│   │   ├── TaskList.js    # Lista completa de tareas
│   │   ├── AnalyticsDashboard.js # Dashboard de analytics
│   │   └── VoiceAssistant.js     # Asistente de voz
│   ├── services/          # Servicios y lógica de negocio
│   │   ├── NotificationManager.js # Gestión de notificaciones
│   │   └── AnalyticsManager.js    # Analytics y métricas
│   ├── database/          # Gestión de datos
│   │   └── DatabaseManager.js     # SQLite + localStorage
│   ├── App.js            # Componente principal
│   ├── index.css         # Estilos base
│   ├── premium.css       # Estilos premium
│   └── analytics.css     # Estilos de analytics
├── electron.js           # Configuración de Electron
└── package.json         # Dependencias y scripts
```

## 🎯 Uso

### Comandos de Voz Disponibles

```
"Agregar [tarea]"          → Crear nueva tarea
"¿Qué tengo hoy?"          → Ver tareas del día
"¿Qué tengo pendiente?"    → Ver todas las pendientes
"Completar [tarea]"        → Marcar como completada
"Hola MindFlow"            → Saludo y resumen
```

### Atajos de Teclado

- `Cmd/Ctrl + Shift + M` → Activar ventana rápidamente
- `Cmd/Ctrl + N` → Nueva tarea
- `Cmd/Ctrl + 1,2,3,4` → Cambiar entre vistas

## 📊 Analytics

MindFlow incluye un sistema completo de analytics que rastrea:

- **Productividad Diaria**: Tareas completadas, tiempo dedicado, eficiencia
- **Tendencias Semanales**: Patrones de trabajo y mejores días
- **Sistema de Rachas**: Días consecutivos de productividad
- **Insights Automáticos**: Recomendaciones personalizadas basadas en datos

## 🔧 Configuración

### Variables de Entorno (opcional)

Crea un archivo `.env` en la raíz del proyecto:

```env
# Configuración de notificaciones
NOTIFICATION_ENABLED=true
MORNING_REMINDER=true
EVENING_REVIEW=true

# Analytics
ANALYTICS_ENABLED=true
EXPORT_ENABLED=true
```

### Personalización

- **Temas**: Modifica `premium.css` para cambiar colores y estilos
- **Comandos de Voz**: Edita `VoiceAssistant.js` para agregar nuevos patrones
- **Notificaciones**: Configura horarios en `NotificationManager.js`

## 🐛 Solución de Problemas

### El reconocimiento de voz no funciona
- Verifica que tengas permisos de micrófono
- Asegúrate de usar HTTPS o localhost
- Comprueba compatibilidad del navegador

### Las notificaciones no aparecen
- Concede permisos de notificación
- Verifica configuración del sistema operativo
- Revisa que no esté en modo "No molestar"

### La base de datos no se crea
- Verifica permisos de escritura en la carpeta
- Comprueba que SQLite3 esté instalado correctamente

## 🤝 Contribución

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📜 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🙏 Reconocimientos

- **Web Speech API** para reconocimiento de voz
- **Electron** para aplicación de escritorio
- **React** para la interfaz de usuario
- **SQLite** para almacenamiento local

## 📧 Contacto

- **Autor**: Tu Nombre
- **Email**: tu-email@ejemplo.com
- **GitHub**: [@tu-usuario](https://github.com/tu-usuario)
- **LinkedIn**: [Tu Perfil](https://linkedin.com/in/tu-perfil)

---

⭐ **¡Si te gusta MindFlow, dale una estrella en GitHub!** ⭐