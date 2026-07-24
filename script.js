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
        ctaButton.addEventListener("click", () => {
            window.location.href = "#mystic-boxes";
        });
    }

    // 4. FAQ — elementos
    const botonesFaq = document.querySelectorAll('.faq-categoria');
    const preguntasFaq = document.querySelectorAll('.faq-item');
    const modal = document.getElementById('modal-legal');
    const modalBody = document.getElementById('modal-contenido');
    const btnCerrar = document.getElementById('cerrar-modal');

    // --- Funciones del modal definidas al nivel raíz (sin anidar en if) ---
    async function abrirModal() {
        if (!modal || !modalBody || !btnCerrar) return;

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

    // --- Filtro de categorías ---
    if (botonesFaq.length > 0 && preguntasFaq.length > 0) {
        botonesFaq.forEach(btn => {
            btn.addEventListener('click', () => {
                const cat = btn.dataset.categoria;

                if (cat === 'seguridad') {
                    abrirModal(); // ahora sí es accesible
                    return;
                }

                const yaActivo = btn.getAttribute('aria-pressed') === 'true';
                botonesFaq.forEach(b => b.setAttribute('aria-pressed', 'false'));

                if (yaActivo) {
                    requestAnimationFrame(() => {
                        preguntasFaq.forEach(p => { p.hidden = false; });
                    });
                } else {
                    btn.setAttribute('aria-pressed', 'true');
                    requestAnimationFrame(() => {
                        preguntasFaq.forEach(p => {
                            const visible = p.dataset.categoria === cat;
                            p.hidden = !visible;
                            if (!visible) p.removeAttribute('open');
                        });
                    });
                }
            });
        });
    }

    // --- Eventos del modal ---
    if (btnCerrar) btnCerrar.addEventListener('click', cerrarModal);
    if (modal) {
        modal.addEventListener('click', e => {
            if (e.target === modal) cerrarModal();
        });
    }
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && modal?.classList.contains('visible')) cerrarModal();
    });

});