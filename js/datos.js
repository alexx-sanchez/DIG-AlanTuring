document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('filtro-form');

  // Configuración predeterminada de los filtros
  const provincia = 'Barcelona';
  const anyo = ''; // Todos
  const mes = '1'; // Enero

  // Preparar parámetros GET para la llamada PHP
  const params = new URLSearchParams({
    any: anyo,
    mes: mes,
    provincia: provincia
  });

  // Hacer la solicitud automáticamente al cargar la página
  fetchData(params);

  // Cuando el usuario aplica los filtros
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const provincia = form.provincia.value;
    const anyo = form.año.value || '';
    const mes = form.mes.value || '';

    // Preparar parámetros GET para la llamada PHP
    const params = new URLSearchParams({
      any: anyo,
      mes: mes,
      provincia: provincia
    });

    fetchData(params);
  });
});

// Función para obtener y mostrar los datos
function fetchData(params) {
  fetch(`api/data.php?${params.toString()}`)
    .then(response => response.json())
    .then(data => {
      mostrarDatos(data);
    })
    .catch(error => {
      console.error('Error:', error);
      document.getElementById('grafico-1').innerHTML = '<p>Error cargando datos.</p>';
      document.getElementById('grafico-2').innerHTML = '';
      document.getElementById('grafico-3').innerHTML = '';
    });
}

let chart1, chart2, chart3;

function mostrarDatos(data) {
  if (data.length === 0) {
    document.getElementById('grafico-1').innerHTML = '<p>No hay datos para esos filtros.</p>';
    document.getElementById('grafico-2').innerHTML = '';
    document.getElementById('grafico-3').innerHTML = '';
    return;
  }

  // Aquí cambias 'ConsumoAgua' por el nombre real de tu campo numérico
  const campoNumerico = 'Consumo_mensual';

  // Gráfico 1: barras consumo por mes
  const meses = data.map(d => d.Mes);
  const consumo = data.map(d => Number(d[campoNumerico] || 0));

  const ctx1 = document.getElementById('chart1').getContext('2d');
  if (chart1) chart1.destroy();

  chart1 = new Chart(ctx1, {
    type: 'bar',
    data: {
      labels: meses,
      datasets: [{
        label: 'Consumo de Agua',
        data: consumo,
        backgroundColor: 'rgba(54, 162, 235, 0.6)'
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });

  // Gráfico 2: consumo total por provincia
  const provincias = [...new Set(data.map(d => d.Provincia))];
  const consumoPorProvincia = provincias.map(p => {
    return data.filter(d => d.Provincia === p)
      .reduce((sum, item) => sum + Number(item[campoNumerico] || 0), 0);
  });

  const ctx2 = document.getElementById('chart2').getContext('2d');
  if (chart2) chart2.destroy();

  chart2 = new Chart(ctx2, {
    type: 'pie',
    data: {
      labels: provincias,
      datasets: [{
        label: 'Consumo Agua por Provincia',
        data: consumoPorProvincia,
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)'
        ]
      }]
    },
    options: { responsive: true }
  });

  // Gráfico 3: línea evolución consumo por mes (de 1 a 12)
  const mesesOrdenados = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const consumoPorMes = mesesOrdenados.map(mes => {
    const item = data.find(d => Number(d.Mes) === mes);
    return item ? Number(item[campoNumerico] || 0) : 0;
  });

  const ctx3 = document.getElementById('chart3').getContext('2d');
  if (chart3) chart3.destroy();

  chart3 = new Chart(ctx3, {
    type: 'line',
    data: {
      labels: mesesOrdenados.map(m => `Mes ${m}`),
      datasets: [{
        label: 'Evolución Consumo Agua',
        data: consumoPorMes,
        fill: false,
        borderColor: 'rgba(255, 159, 64, 1)',
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}
