document.addEventListener('DOMContentLoaded', () => {
  // FORMULARIO CONSUMO
  const formConsumo = document.getElementById('filtro-consumo');
  const selectProvinciaConsumo = document.getElementById('provincia-consumo');
  const selectAnyoConsumo = document.getElementById('año-consumo');

  // FORMULARIO EMBALSADO
  const formEmbalsado = document.getElementById('filtro-embalsado');
  const selectProvinciaEmbalsado = document.getElementById('provincia-embalsado');
  const selectAnyoEmbalsado = document.getElementById('año-embalsado');
  const selectMesEmbalsado = document.getElementById('mes-embalsado');

  // Cargar inicial datos
  cargarConsumo({ provincia: 'Barcelona', anyo: '' });
  cargarEmbalsado({ provincia: 'Barcelona', anyo: '', mes: '' });

  // Evento submit consumo
  formConsumo.addEventListener('submit', e => {
    e.preventDefault();
    const provincia = selectProvinciaConsumo.value;
    const anyo = selectAnyoConsumo.value;
    cargarConsumo({ provincia, anyo });
  });

  // Evento submit embalsado
  formEmbalsado.addEventListener('submit', e => {
    e.preventDefault();
    const provincia = selectProvinciaEmbalsado.value;
    const anyo = selectAnyoEmbalsado.value;
    const mes = selectMesEmbalsado.value;
    cargarEmbalsado({ provincia, anyo, mes });
  });
});

let chart1, chart2;

function cargarConsumo({ provincia, anyo }) {
  const params = new URLSearchParams();
  if (anyo) params.append('any', anyo);
  params.append('provincia', provincia);

  fetch(`api/data.php?${params.toString()}`)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return res.json();
    })
    .then(data => {
      mostrarConsumo(data, anyo, provincia);
    })
    .catch(err => {
      console.error(err);
      document.getElementById('grafico-1').innerHTML = `<p>Error cargando datos: ${err.message}</p>`;
    });
}

function cargarEmbalsado({ provincia, anyo, mes }) {
  const params = new URLSearchParams();
  if (anyo) params.append('any', anyo);
  if (mes) params.append('mes', mes);
  params.append('provincia', provincia);

  fetch(`api/data.php?${params.toString()}`)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return res.json();
    })
    .then(data => {
      mostrarEmbalsado(data, anyo, mes, provincia);
    })
    .catch(err => {
      console.error(err);
      document.getElementById('grafico-2').innerHTML = `<p>Error cargando datos: ${err.message}</p>`;
    });
}

function mostrarConsumo(data, anyoSeleccionado, provinciaSeleccionada) {
  if (!data || data.length === 0) {
    document.getElementById('grafico-1').innerHTML = '<p>No hay datos para esos filtros.</p>';
    return;
  }
  const ctx = document.getElementById('chart1').getContext('2d');
  if (chart1) chart1.destroy();

  // Agrupar consumo total por año
  const consumoPorAño = {};
  data.forEach(d => {
    const anyo = d.Any;
    consumoPorAño[anyo] = (consumoPorAño[anyo] || 0) + Number(d.Consumo_mensual || 0);
  });

  const años = Object.keys(consumoPorAño).sort();
  const consumos = años.map(a => consumoPorAño[a]);

  chart1 = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: años,
      datasets: [{
        label: `Consumo Total por Año - ${provinciaSeleccionada}`,
        data: consumos,
        backgroundColor: 'rgba(54, 162, 235, 0.6)'
      }]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true } }
    }
  });
}

function mostrarEmbalsado(data, anyoSeleccionado, mesSeleccionado, provinciaSeleccionada) {
  if (!data || data.length === 0) {
    document.getElementById('grafico-2').innerHTML = '<p>No hay datos para esos filtros.</p>';
    return;
  }
  const ctx = document.getElementById('chart2').getContext('2d');
  if (chart2) chart2.destroy();

  // Agrupar volumen embalsado por mes (si hay varios) o solo mostrar total si un mes específico
  if (mesSeleccionado) {
    // Mostrar solo el volumen del mes seleccionado
    const totalVolumen = data.reduce((sum, d) => sum + Number(d.Volum_embassat_hm3 || 0), 0);

    chart2 = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [`${provinciaSeleccionada} - ${anyoSeleccionado} - Mes ${mesSeleccionado}`],
        datasets: [{
          label: 'Volumen Embalsado',
          data: [totalVolumen],
          backgroundColor: 'rgba(153, 102, 255, 0.6)'
        }]
      },
      options: {
        responsive: true,
        scales: { y: { beginAtZero: true } }
      }
    });
  } else {
    // Mostrar volumen embalsado por mes para el año seleccionado y provincia
    // Si no hay año seleccionado, mostrar total por año

    const meses = [...new Set(data.map(d => Number(d.Mes)))].sort((a,b) => a-b);
    if (meses.length === 0) {
      // Sin meses, sumar total y mostrar solo una barra
      const totalVolumen = data.reduce((sum, d) => sum + Number(d.Volum_embassat_hm3 || 0), 0);
      chart2 = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: [`${provinciaSeleccionada} - ${anyoSeleccionado || 'Todos los años'}`],
          datasets: [{
            label: 'Volumen Embalsado Total',
            data: [totalVolumen],
            backgroundColor: 'rgba(153, 102, 255, 0.6)'
          }]
        },
        options: {
          responsive: true,
          scales: { y: { beginAtZero: true } }
        }
      });
    } else {
      // Mostrar volumen por mes
      const volumenPorMes = meses.map(mes => {
        return data
          .filter(d => Number(d.Mes) === mes)
          .reduce((sum, d) => sum + Number(d.Volum_embassat_hm3 || 0), 0);
      });

      chart2 = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: meses.map(m => `Mes ${m}`),
          datasets: [{
            label: `Volumen Embalsado - ${provinciaSeleccionada} ${anyoSeleccionado || ''}`,
            data: volumenPorMes,
            backgroundColor: 'rgba(153, 102, 255, 0.6)'
          }]
        },
        options: {
          responsive: true,
          scales: { y: { beginAtZero: true } }
        }
      });
    }
  }
}
