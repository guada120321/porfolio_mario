# Portafolio — Arrieta Guadalupe

Portafolio personal **claro / oscuro** hecho con HTML5, CSS3 y JavaScript vanilla.
Sin frameworks ni dependencias obligatorias: solo abrís `index.html` y funciona.

El modo oscuro es el predeterminado y el modo claro usa una paleta cálida tipo
papel (`#e9e4da`), pensada para descansar la vista sin pantallas blancas.

---

## 🚀 Cómo verlo

**Opción rápida:** abrí `index.html` en el navegador.

**Opción recomendada (servidor local):**

```bash
# con Python
python -m http.server 8000

# o con Node
npx serve .
```

Luego entrá a `http://localhost:8000`.

---

## 📁 Estructura

```
index.html          → todo el contenido (textos, enlaces, secciones)
css/styles.css      → diseño, animaciones, temas y responsive
js/main.js          → interactividad (carrusel, paleta, edad, cursor, etc.)
assets/cv.pdf       → CV de ejemplo (reemplazalo por el tuyo)
README.md           → esta guía
```

---

## ✏️ Qué editar (checklist)

### 1. Textos y enlaces
Todo está en `index.html`, con comentarios que marcan cada zona:

- **Hero:** nombre, descripción, botones y redes sociales.
- **Sobre mí:** narrativa y formación.
- **Proyectos:** cada tarjeta tiene título, descripción, tags y URL.
  Buscá `https://ejemplo.com/...` y reemplazá por tu proyecto real.
- **Contacto:** WhatsApp, Gmail, LinkedIn e Instagram.
- **Footer:** créditos y año.

### 2. Foto de perfil
En la sección **Sobre mí**, reemplazá este bloque:

```html
<div class="photo-frame__placeholder">...</div>
```

por:

```html
<img src="assets/tu-foto.jpg" alt="Foto de Arrieta Guadalupe" />
```

### 3. WhatsApp
Buscá `https://wa.me/5491100000000` y cambiá el número por el tuyo:
código de país + número, **sin +, sin espacios y sin guiones**.
Ejemplo Argentina: `https://wa.me/5491123456789`.

### 4. Email
Hay dos lugares donde aparece:

- El `href="mailto:..."` de la tarjeta.
- El atributo `data-copy="..."` del botón **Copiar email**.

### 5. CV
Reemplazá `assets/cv.pdf` por tu CV real con el mismo nombre.
El botón del navbar, del Hero, de Contacto y del Footer apuntan ahí.

### 6. Frases del typewriter
En `js/main.js`, arriba de todo:

```js
const CONFIG = {
  typewriterPhrases: [
    "Técnica en Programación",
    "Desarrolladora Web",
    "Apasionada por el Código",
  ],
  birthDate: "2008-04-28",
  ...
};
```

### 7. Edad automática
La edad se calcula desde `CONFIG.birthDate` (formato `AAAA-MM-DD`) y se
escribe en todos los elementos con `data-age`. Se recalcula cada hora y cada
vez que volvés a la pestaña, así nunca queda desactualizada. Para cambiarla,
editá una sola línea:

```js
birthDate: "2008-04-28",
```

### 8. Colores y tema
En `css/styles.css`, dentro de `:root`, están `--accent`, `--accent-2` y
`--accent-3`. El bloque `html[data-theme="light"]` define la paleta clara cálida.
El botón de sol/luna del navbar cambia entre **modo oscuro y claro**; la elección
se guarda en el navegador. También podés cambiar el acento desde los puntos del
navbar o con `Ctrl / Cmd + K`.

### 9. Año del footer
Se actualiza solo con JavaScript. Si querés fijar 2026, cambiá el `span#year`
en el HTML.

---

## ✨ Extras incluidos

- Preloader con contador.
- Cursor personalizado (solo desktop).
- Navbar glass con sección activa y barra de progreso de lectura.
- Menú móvil a pantalla completa.
- Typewriter, tilt 3D, spotlight y botones magnéticos.
- Edad calculada automáticamente desde la fecha de nacimiento.
- Barras de habilidades animadas.
- Carrusel de proyectos con **drag**, flechas, dots, teclado, autoplay y contador.
- Paleta de comandos (`Ctrl / Cmd + K`).
- Temas de acento persistentes (cian / violeta / esmeralda).
- Modo claro cálido / oscuro persistente (botón sol/luna en el navbar).
- Botón para copiar email con toast flotante.
- Reloj local en vivo.
- Botón “volver arriba” con anillo de progreso.
- Easter egg: **triple clic en el logo**.
- Soporte de `prefers-reduced-motion` y navegación por teclado.

### Atajos
| Atajo | Acción |
| --- | --- |
| `Ctrl / Cmd + K` | Abrir paleta de comandos |
| `←` `→` | Navegar el carrusel (con foco) |
| `G` | Volver arriba (cuando no estás escribiendo) |
| `Esc` | Cerrar menú o paleta |

---

## 📱 Responsive

Mobile-first real, probado en 360, 390, 600, 800, 1024, 1280 y 1440 px.
El carrusel funciona con dedo, mouse y teclado.

---

## ♿ Accesibilidad

- Contraste cuidado en ambos temas (texto y acentos).
- Navegación completa por teclado y `skip link`.
- Foco visible y etiquetas `aria` en controles interactivos.
- Respeta `prefers-reduced-motion`.

---

## 🌐 Deploy

Podés publicarlo gratis en **GitHub Pages**, **Netlify** o **Vercel**.
Subí la carpeta completa (respetando `css/`, `js/` y `assets/`).

---

Hecho con curiosidad, café y muchas ganas de romperla. ✦
