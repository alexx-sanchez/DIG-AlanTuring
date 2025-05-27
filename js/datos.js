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

  if (mesSeleccionado) {
    // Group data by year for the selected month
    const volumenPorAño = {};
    data.forEach(d => {
      if (Number(d.Mes) === Number(mesSeleccionado)) {
        const anyo = d.Any;
        volumenPorAño[anyo] = Number(d.Volum_embassat_hm3 || 0);
      }
    });

    const años = Object.keys(volumenPorAño).sort();
    const volumenes = años.map(a => volumenPorAño[a]);

    if (años.length === 0) {
      document.getElementById('grafico-2').innerHTML = '<p>No hay datos para el mes seleccionado.</p>';
      return;
    }

    chart2 = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: años,
        datasets: [{
          label: `Volumen Embalsado - ${provinciaSeleccionada} - Mes ${mesSeleccionado}`,
          data: volumenes,
          backgroundColor: 'rgba(153, 102, 255, 0.6)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Volumen Embalsado (hm³)' }
          },
          x: {
            title: { display: true, text: 'Año' }
          }
        }
      }
    });
  } else if (anyoSeleccionado) {
    // Show volume by month for the selected year
    const meses = [...new Set(data.map(d => Number(d.Mes)))].sort((a, b) => a - b);
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
          label: `Volumen Embalsado - ${provinciaSeleccionada} ${anyoSeleccionado}`,
          data: volumenPorMes,
          backgroundColor: 'rgba(153, 102, 255, 0.6)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Volumen Embalsado (hm³)' }
          },
          x: {
            title: { display: true, text: 'Mes' }
          }
        }
      }
    });
  } else {
    // Show total volume by year
    const años = [...new Set(data.map(d => Number(d.Any)))].sort((a, b) => a - b);
    const volumenPorAño = años.map(año => {
      return data
        .filter(d => Number(d.Any) === año)
        .reduce((sum, d) => sum + Number(d.Volum_embassat_hm3 || 0), 0);
    });

    chart2 = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: años,
        datasets: [{
          label: `Volumen Embalsado - ${provinciaSeleccionada}`,
          data: volumenPorAño,
          backgroundColor: 'rgba(153, 102, 255, 0.6)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Volumen Embalsado (hm³)' }
          },
          x: {
            title: { display: true, text: 'Año' }
          }
        }
      }
    });
  }
}