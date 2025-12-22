# moviproject 🎬

Aplicación web informativa que consume la API libre de **The Movie Database (TMDb)** para mostrar información de películas y series.  
El proyecto fue desarrollado con **HTML semántico**, **SASS modular**, **Vanilla JavaScript** y **Axios**, cumpliendo con los requisitos de interactividad y estética clara.

---

## ✨ Características

- Página principal con carruseles de películas, series y recomendaciones.
- Búsqueda interactiva de títulos (películas y series).
- Página de detalle con información completa del título seleccionado.
- Listado de episodios de la temporada 1 en caso de series.
- Interfaz responsiva y modular gracias a SASS.
- Lógica en Vanilla JS, sin jQuery.

---

## 📄 Páginas

- **`index.html`** → Página principal con carruseles y buscador.  
- **`show.html`** → Página secundaria con detalle de película/serie y episodios.

---

## 🔗 Endpoints de TMDb usados

- **Búsqueda:**  
  `GET /search/multi` → Buscar películas y series por texto.  
- **Tendencias del día (opcional en Home):**  
  `GET /trending/all/day` → Contenido popular del día.  
- **Detalle de título:**  
  `GET /movie/{id}` o `GET /tv/{id}` → Información detallada de una película o serie.  
- **Episodios (temporada 1):**  
  `GET /tv/{id}/season/1` → Listado de episodios de una serie.

---

## 🛠️ Tecnologías utilizadas

- **HTML semántico** → estructura clara y accesible.  
- **SASS modular** → variables, mixins, layout, components y responsive.  
- **Vanilla JavaScript** → lógica e interactividad.  
- **Axios** → consumo de API con async/await y manejo de errores.  

---

## 📂 Estructura del proyecto

