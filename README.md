
# Contexto del Proyecto: Ergosanita SPA

A partir de este momento debes considerar el siguiente contexto para todas tus respuestas relacionadas con este proyecto.

## Descripción General

Ergosanita SPA es un sistema web enfocado en el área de la salud, diseñado para administrar la información clínica de los pacientes y apoyar el trabajo de los profesionales médicos durante todo el proceso de atención.

El sistema permite registrar, consultar y administrar datos clínicos, exámenes médicos y antecedentes de los pacientes de manera segura.

## Objetivo

El objetivo principal del sistema es centralizar la gestión de pacientes, exámenes médicos y procesos administrativos en una única plataforma web.

## Funcionalidades Principales

* Administración de pacientes.
* Registro y edición de datos personales.
* Gestión de fichas clínicas.
* Registro de electrocardiogramas (ECG).
* Registro de bioimpedancia corporal.
* Visualización de resultados médicos.
* Historial clínico de pacientes.
* Agenda y seguimiento de atenciones.
* Administración de pagos.
* Generación de reportes.
* Notificaciones.
* Integración con Inteligencia Artificial para automatizar procesos y asistir en el análisis de información clínica.

## Roles del Sistema

### Administrador

* Administración completa del sistema.
* Gestión de usuarios.
* Configuración.
* Asignación de permisos.
* Visualización de todos los módulos.

### Médico

* Acceso a pacientes.
* Revisión de exámenes.
* Registro de diagnósticos.
* Emisión de informes médicos.
* Seguimiento clínico.

### Colegio

* Acceso únicamente a la información autorizada de los pacientes pertenecientes a su institución.
* Gestión de procesos asociados.

### Check (Recepción)

* Registro de pacientes.
* Validación de información.
* Control de ingreso.
* Gestión de agenda.
* Confirmación de asistencia.

## Consideraciones

Cuando se desarrollen nuevas funcionalidades debes asumir que:

* El sistema ya existe y está en producción.
* Debes reutilizar la arquitectura existente.
* Mantener consistencia visual y funcional con el resto del sistema.
* Priorizar código limpio, mantenible y escalable.
* Evitar romper funcionalidades existentes.
* Respetar los permisos según el rol del usuario.
* Considerar siempre la seguridad y confidencialidad de la información médica.
* Toda nueva funcionalidad debe integrarse naturalmente con los módulos ya existentes.

## Inteligencia Artificial

El sistema incorpora módulos de IA para apoyar tareas como:

* Interpretación de resultados médicos.
* Automatización de procesos.
* Asistencia al personal de salud.
* Generación de recomendaciones.
* Análisis de información clínica.
* Procesamiento de documentos e imágenes médicas cuando corresponda.

## Instrucciones para el Asistente

Cuando respondas preguntas sobre este proyecto:

* Asume siempre este contexto.
* Si falta información, solicita únicamente los datos necesarios antes de proponer una solución.
* Prioriza soluciones robustas, escalables y fáciles de mantener.
* Explica el impacto de cada cambio sobre el resto del sistema.
* Cuando generes código, sigue buenas prácticas, separación de responsabilidades y principios SOLID cuando aplique.
* Evita realizar suposiciones que puedan comprometer la integridad de los datos clínicos.



## Usa Spec Driven Design

Basado en /spec y /spec-impl

Siguiendo las buenas practicas recomendadas aquí:
https://github.com/Klerith/fernando-skills

## Skills usadas

```bash
npx skills@latest add Klerith/fernando-skills
```

```bash
npx skills add https://github.com/anthropics/skills --skill frontend-design
```