// ==========================================================================
// INICIALIZACIÓN GLOBAL DE LA CAPA DE DATOS
// (Garantiza que 'window.dataLayer' exista desde el inicio)
// ==========================================================================
window.dataLayer = window.dataLayer || [];

// FUNCIÓN AUXILIAR: Enviar eventos a Google Tag Manager (GTM-MJS222LG)
function registrarEventoGTM(nombreEvento, parametros = {}) {
    window.dataLayer.push({
        'event': nombreEvento,
        ...parametros
    });
}

document.addEventListener("DOMContentLoaded", () => {

    // 1. MENÚ HAMBURGUESA
    const botonMenu = document.querySelector(".menu-toggle");
    const menuNav = document.querySelector(".nav-links");

    if (botonMenu && menuNav) {
        botonMenu.setAttribute("aria-expanded", "false");
        botonMenu.setAttribute("role", "button");

        const alternarMenu = () => {
            const estaAbierto = menuNav.classList.toggle("active");
            botonMenu.setAttribute("aria-expanded", estaAbierto);
        };

        botonMenu.addEventListener("click", alternarMenu);
        menuNav.addEventListener("click", (e) => {
            if (e.target.tagName === 'A') {
                menuNav.classList.remove("active");
                botonMenu.setAttribute("aria-expanded", "false");
            }
        });
    }

    // 2. TOGGLE DE FOTO
    const contenedoresFoto = document.querySelectorAll(".imagen-hover-container");
    contenedoresFoto.forEach(c => {
        c.addEventListener("click", () => {
            requestAnimationFrame(() => c.classList.toggle("mostrar-detalle"));
        });
    });

    // 3. CTA BUTTON
    const ctaButton = document.querySelector(".cta-button");
    if (ctaButton) {
        ctaButton.addEventListener("click", (evento) => {
            registrarEventoGTM('clic_cta_hero', {
                'destino': '#productos',
                'texto_boton': ctaButton.innerText.trim() || 'Ver más'
            });

            const destino = ctaButton.getAttribute("href") || "#productos";
            if (destino.startsWith("#")) {
                const elementoDestino = document.querySelector(destino);
                if (elementoDestino) {
                    evento.preventDefault();
                    elementoDestino.scrollIntoView({ behavior: "smooth" });
                }
            }
        });
    }

    // 4. FAQ FILTRADO POR CATEGORÍA + MODAL LEGAL
    const contenedorCategorias = document.getElementById('categorias');
    const preguntasFaq = document.querySelectorAll('.faq-item');
    const mensajeVacio = document.getElementById('faq-mensaje-vacio'); // opcional, puede no existir
    const modal = document.getElementById('modal-legal');
    const modalBody = document.getElementById('modal-contenido');
    const btnCerrar = document.getElementById('cerrar-modal');

    // Categorías que tienen un botón de filtro real (excluye 'seguridad', que abre el modal)
    const categoriasConBoton = contenedorCategorias
        ? new Set(
            Array.from(contenedorCategorias.querySelectorAll('.faq-categoria'))
                .map(b => b.dataset.categoria)
                .filter(cat => cat !== 'seguridad')
        )
        : new Set();

    // Las preguntas cuya categoría NO tiene botón (ej. "productos") quedan
    // siempre visibles y no se tocan; solo se filtran las que sí tienen botón.
    function ocultarTodasLasPreguntas() {
        preguntasFaq.forEach(p => {
            if (categoriasConBoton.has(p.dataset.categoria)) {
                p.hidden = true;
            }
            p.removeAttribute('open');
        });
        if (mensajeVacio) mensajeVacio.hidden = false;
    }

    // Muestra solo las preguntas de la categoría elegida (todas cerradas);
    // las que no tienen botón asociado permanecen visibles siempre.
    function mostrarCategoria(categoria) {
        preguntasFaq.forEach(p => {
            if (categoriasConBoton.has(p.dataset.categoria)) {
                p.hidden = p.dataset.categoria !== categoria;
            }
            p.removeAttribute('open');
        });
        if (mensajeVacio) mensajeVacio.hidden = true;
    }

    async function abrirModal() {
        if (!modal || !modalBody || !btnCerrar) return;

        registrarEventoGTM('abrir_modal_legal', {
            'tipo_modal': 'Políticas y Seguridad'
        });

        if (!modalBody.innerHTML.trim()) {
            try {
                const res = await fetch('legal.html');
                const html = await res.text();
                const doc = new DOMParser().parseFromString(html, 'text/html');
                const contenido = doc.querySelector('main') || doc.querySelector('body');
                modalBody.innerHTML = contenido
                    ? contenido.innerHTML
                    : '<p>Contenido no disponible.</p>';
            } catch {
                modalBody.innerHTML = `
                    <p style="padding:1rem; color:var(--dorado-suave);">
                        No se pudo cargar el contenido desde aquí.<br>
                        <a href="legal.html" class="btn-mistico"
                           style="margin-top:1rem; display:inline-block;">
                            Ver políticas completas →
                        </a>
                    </p>`;
            }
        }

        modal.classList.add('visible');
        document.body.style.overflow = 'hidden';
        btnCerrar.focus();
    }

    function cerrarModal() {
        if (!modal) return;
        modal.classList.remove('visible');
        document.body.style.overflow = '';
    }

    if (contenedorCategorias && preguntasFaq.length > 0) {
        const botonesFaq = contenedorCategorias.querySelectorAll('.faq-categoria');

        // Marca las preguntas sin botón de filtro (ej. "productos") como fijas,
        // para que el CSS (order en flexbox) las muestre siempre debajo de las
        // que sí se filtran, sin alterar el orden real del HTML fuente.
        preguntasFaq.forEach(p => {
            if (!categoriasConBoton.has(p.dataset.categoria)) {
                p.classList.add('faq-item--fijo');
            }
        });

        // Estado inicial: todo oculto y cerrado hasta que elijan una categoría
        ocultarTodasLasPreguntas();

        // Delegación de eventos: un solo listener para todos los botones,
        // sigue funcionando aunque se agreguen más categorías después
        contenedorCategorias.addEventListener('click', (evento) => {
            const btn = evento.target.closest('.faq-categoria');
            if (!btn) return;

            const cat = btn.dataset.categoria;

            registrarEventoGTM('clic_faq_categoria', {
                'categoria_seleccionada': cat
            });

            if (cat === 'seguridad') {
                abrirModal();
                return;
            }

            const yaActivo = btn.getAttribute('aria-pressed') === 'true';
            botonesFaq.forEach(b => b.setAttribute('aria-pressed', 'false'));

            if (yaActivo) {
                // Clickear la misma categoría de nuevo la cierra
                ocultarTodasLasPreguntas();
            } else {
                btn.setAttribute('aria-pressed', 'true');
                mostrarCategoria(cat);
            }
        });
    }

    if (btnCerrar) btnCerrar.addEventListener('click', cerrarModal);
    if (modal) {
        modal.addEventListener('click', e => {
            if (e.target === modal) cerrarModal();
        });
    }
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && modal?.classList.contains('visible')) cerrarModal();
    });

    // 5. BOTÓN FLOTANTE DE WHATSAPP
    const botonWhatsapp = document.querySelector('.whatsapp-flotante');
    if (botonWhatsapp) {
        botonWhatsapp.addEventListener('click', () => {
            registrarEventoGTM('clic_whatsapp_flotante', {
                'ubicacion': 'Esquina inferior derecha'
            });
        });
    }

});

/*fooerlogovolver al inicio*/

const logoFooter = document.querySelector('.footer-nalomy > img');

if (logoFooter) {
    logoFooter.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    logoFooter.setAttribute('role', 'link');
    logoFooter.setAttribute('tabindex', '0');
    logoFooter.setAttribute('aria-label', 'Volver al inicio');

    logoFooter.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            window.location.href = 'index.html';
        }
    });
}