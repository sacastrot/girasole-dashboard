import { ref, watch } from 'vue'

const CLAVE_STORAGE = 'girasole-dashboard-tema'

function leerTemaInicial() {
  try {
    const guardado = localStorage.getItem(CLAVE_STORAGE)
    if (guardado === 'oscuro' || guardado === 'claro') return guardado
  } catch {
    // localStorage no disponible (modo privado, restricciones del navegador)
  }
  return 'claro'
}

// Estado singleton: todas las instancias del composable comparten el mismo tema.
const tema = ref(leerTemaInicial())

function aplicarClaseHtml(valor) {
  const raiz = document.documentElement
  if (valor === 'oscuro') {
    raiz.classList.add('dark')
  } else {
    raiz.classList.remove('dark')
  }
}

// Aplicar inmediatamente al cargar el módulo, antes del primer render.
aplicarClaseHtml(tema.value)

watch(tema, (valor) => {
  aplicarClaseHtml(valor)
  try {
    localStorage.setItem(CLAVE_STORAGE, valor)
  } catch {
    // Ignorar si no hay acceso a almacenamiento local.
  }
})

export function useTheme() {
  function alternarTema() {
    tema.value = tema.value === 'claro' ? 'oscuro' : 'claro'
  }

  return { tema, alternarTema }
}
