import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from './shared/Layout';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import {
  CogIcon,
  XMarkIcon,
  CheckIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [tankData, setTankData] = useState([]);
  const [latestRecord, setLatestRecord] = useState(null);
  const [averages, setAverages] = useState({});
  const [activeTanks, setActiveTanks] = useState([]);
  const [biologicalData, setBiologicalData] = useState({});
  const [operationalData, setOperationalData] = useState({});
  const [productionData, setProductionData] = useState({});
  const [technologicalData, setTechnologicalData] = useState({});
  const [loading, setLoading] = useState(true);
  const [showWaterControlModal, setShowWaterControlModal] = useState(false);
  const [showWaterQualityModal, setShowWaterQualityModal] = useState(false);
  const [showFullWaterQualityModal, setShowFullWaterQualityModal] = useState(false);
  const [selectedTank, setSelectedTank] = useState(null);
  const [tanks, setTanks] = useState([]);
  const [waterQualityFormData, setWaterQualityFormData] = useState({
    tankId: '',
    ph: '',
    temperature: '',
    oxygenation: '',
    salinity: '',
    ammonia: '',
    nitrite: '',
    nitrate: '',
    alkalinity: '',
    turbidity: '',
    orp: '',
    co2: '',
    inspectionDate: new Date().toISOString().split('T')[0],
    feedingDate: new Date().toISOString().split('T')[0],
    responsible: '',
    notes: ''
  });
  const [fullWaterQualityFormData, setFullWaterQualityFormData] = useState({
    tankId: '',
    ph: '',
    temperature: '',
    oxygenation: '',
    salinity: '',
    ammonia: '',
    nitrite: '',
    nitrate: '',
    alkalinity: '',
    turbidity: '',
    orp: '',
    co2: '',
    inspectionDate: new Date().toISOString().split('T')[0],
    feedingDate: new Date().toISOString().split('T')[0],
    responsible: '',
    notes: ''
  });
  const [waterQualityLoading, setWaterQualityLoading] = useState(false);
  const [waterQualityMessage, setWaterQualityMessage] = useState('');
  const [fullWaterQualityLoading, setFullWaterQualityLoading] = useState(false);
  const [fullWaterQualityMessage, setFullWaterQualityMessage] = useState('');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchData();

    // Initialize biological data
    setBiologicalData({
      averageWeight: '12.5',
      survival: '92.3',
      fcr: '1.45',
      stockingDensity: '150',
      healthStatus: 'Excelente'
    });

    // Initialize operational data
    setOperationalData({
      feedType: 'Ração 35% PB',
      feedQuantity: '2.5',
      aerationHours: '18',
      equipmentStatus: 'Todos funcionando',
      waterExchange: '15%',
      inputs: 'Cal: 50kg, Melaço: 20L'
    });

    // Initialize production data
    setProductionData({
      cycleCost: 'R$ 45.000',
      yield: '850',
      profit: 'R$ 28.500',
      margin: '38.5%',
      harvestHistory: 'Última colheita: 780kg'
    });

    // Initialize technological data
    setTechnologicalData({
      sensorAlerts: 'Nenhum alerta ativo',
      remoteControl: 'Aeradores: ON',
      iotStatus: 'Todos conectados',
      automation: 'Sistema ativo'
    });
  }, [navigate]);

  // Real-time random data update
  useEffect(() => {
    const interval = setInterval(() => {
      generateRandomData();
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const generateRandomData = () => {
    const randomPh = (Math.random() * 14).toFixed(1);
    const randomTemp = (Math.random() * 34).toFixed(1); // Max 34°C
    const randomOxygenation = (Math.random() * 10).toFixed(1);
    const randomNitrite = (Math.random() * 1).toFixed(2);
    const randomAmmonia = (Math.random() * 0.5).toFixed(2);

    setLatestRecord({
      ph: randomPh,
      temperature: randomTemp,
      oxygenation: randomOxygenation,
      nitrite: randomNitrite,
      ammonia: randomAmmonia,
      inspectionDate: new Date().toISOString(),
      feedingDate: new Date().toISOString(),
      responsible: 'Sistema Automático',
      notes: 'Dados gerados em tempo real'
    });

    // Update active tanks with random data
    setActiveTanks(prevTanks => prevTanks.map(tank => ({
      ...tank,
      ph: (Math.random() * 14).toFixed(1),
      temperature: (Math.random() * 34).toFixed(1),
      oxygenation: (Math.random() * 10).toFixed(1),
      nitrite: (Math.random() * 1).toFixed(2),
      ammonia: (Math.random() * 0.5).toFixed(2)
    })));
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');

      // Get user data
      const userResponse = await axios.get('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(userResponse.data);

      // Get tank data for dashboard
      const tankResponse = await axios.get('http://localhost:5000/api/tank/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setTankData(tankResponse.data.chartData || []);
      setLatestRecord(tankResponse.data.latestRecord);
      setAverages(tankResponse.data.averages || {});
      setActiveTanks(tankResponse.data.activeTanks || []);

      // Get shrimp biological data for dashboard
      const shrimpResponse = await axios.get('http://localhost:5000/api/shrimp/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setBiologicalData(shrimpResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };



  const handleWaterQualityChange = (e) => {
    setWaterQualityFormData({
      ...waterQualityFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleWaterQualitySubmit = async (e) => {
    e.preventDefault();
    setWaterQualityLoading(true);
    setWaterQualityMessage('');

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/tank', waterQualityFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setWaterQualityMessage('Dados cadastrados com sucesso!');
      setWaterQualityFormData({
        tankId: '',
        ph: '',
        temperature: '',
        oxygenation: '',
        salinity: '',
        ammonia: '',
        nitrite: '',
        nitrate: '',
        alkalinity: '',
        turbidity: '',
        orp: '',
        co2: '',
        inspectionDate: new Date().toISOString().split('T')[0],
        feedingDate: new Date().toISOString().split('T')[0],
        responsible: '',
        notes: ''
      });
      fetchData(); // Refresh data
    } catch (error) {
      setWaterQualityMessage(error.response?.data?.message || 'Erro ao cadastrar dados');
    } finally {
      setWaterQualityLoading(false);
    }
  };

  const handleFullWaterQualityChange = (e) => {
    setFullWaterQualityFormData({
      ...fullWaterQualityFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleFullWaterQualitySubmit = async (e) => {
    e.preventDefault();
    setFullWaterQualityLoading(true);
    setFullWaterQualityMessage('');

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/tank', fullWaterQualityFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setFullWaterQualityMessage('Dados cadastrados com sucesso!');
      setFullWaterQualityFormData({
        tankId: '',
        ph: '',
        temperature: '',
        oxygenation: '',
        salinity: '',
        ammonia: '',
        nitrite: '',
        nitrate: '',
        alkalinity: '',
        turbidity: '',
        orp: '',
        co2: '',
        inspectionDate: new Date().toISOString().split('T')[0],
        feedingDate: new Date().toISOString().split('T')[0],
        responsible: '',
        notes: ''
      });
      fetchData(); // Refresh data
    } catch (error) {
      setFullWaterQualityMessage(error.response?.data?.message || 'Erro ao cadastrar dados');
    } finally {
      setFullWaterQualityLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatChartData = (data) => {
    return data.map(item => ({
      ...item,
      date: formatDate(item.inspectionDate)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <>
      <Layout currentPage="dashboard">
        <div className="space-y-6">
            {/* Latest Record Card */}
            {latestRecord && (
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Última Vistoria</h3>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{latestRecord.ph}</div>
                      <div className="text-sm text-gray-500">pH</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{latestRecord.temperature}°C</div>
                      <div className="text-sm text-gray-500">Temperatura</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{latestRecord.oxygenation} mg/L</div>
                      <div className="text-sm text-gray-500">Oxigenação</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{latestRecord.nitrite} mg/L</div>
                      <div className="text-sm text-gray-500">Nitrito</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{formatDate(latestRecord.inspectionDate)}</div>
                      <div className="text-sm text-gray-500">Data da Vistoria</div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      <strong>Responsável:</strong> {latestRecord.responsible}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Última Alimentação:</strong> {formatDate(latestRecord.feedingDate)}
                    </p>
                    {latestRecord.notes && (
                      <p className="text-sm text-gray-600 mt-2">
                        <strong>Observações:</strong> {latestRecord.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Averages Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Médias (Últimos 30 dias)</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{averages.ph || '0.0'}</div>
                    <div className="text-sm text-gray-500">pH Médio</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{averages.temperature || '0.0'}°C</div>
                    <div className="text-sm text-gray-500">Temperatura Média</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{averages.oxygenation || '0.0'} mg/L</div>
                    <div className="text-sm text-gray-500">Oxigenação Média</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{averages.nitrite || '0.0'} mg/L</div>
                    <div className="text-sm text-gray-500">Nitrito Médio</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{averages.ammonia || '0.0'} mg/L</div>
                    <div className="text-sm text-gray-500">Amônia Média</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            {tankData.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* pH Chart */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Evolução do pH</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={formatChartData(tankData)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 14]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="ph" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Temperature Chart */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Evolução da Temperatura</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={formatChartData(tankData)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 50]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="temperature" stroke="#ef4444" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Oxygenation Chart */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Evolução da Oxigenação</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={formatChartData(tankData)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 'dataMax + 5']} />
                      <Tooltip />
                      <Line type="monotone" dataKey="oxygenation" stroke="#22c55e" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Bar Chart - All parameters */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Comparativo dos Parâmetros</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={formatChartData(tankData.slice(-7))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="ph" fill="#3b82f6" name="pH" />
                      <Bar dataKey="temperature" fill="#ef4444" name="Temp (°C)" />
                      <Bar dataKey="oxygenation" fill="#22c55e" name="O2 (mg/L)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Active Tanks List */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Tanques Ativos - Qualidade da Água</h3>
                <div className="space-y-4">
                  {activeTanks.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Nenhum tanque ativo encontrado.</p>
                  ) : (
                    activeTanks.map((tank, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-blue-500 mr-2 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 2L3 9h4v9h6V9h4L10 2z" clipRule="evenodd" />
                            </svg>
                            <h4 className="text-md font-semibold text-gray-900">{tank.name || `Tanque ${index + 1}`}</h4>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setSelectedTank(tank);
                                setShowWaterControlModal(true);
                              }}
                              className="flex items-center px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
                            >
                              <CogIcon className="w-3 h-3 mr-1" />
                              Controle da Água
                            </button>
                            <button
                              onClick={() => {
                                setSelectedTank(tank);
                                setWaterQualityFormData(prev => ({ ...prev, tankId: tank._id }));
                                setShowWaterQualityModal(true);
                              }}
                              className="flex items-center px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition-colors ml-2"
                            >
                              <EyeIcon className="w-3 h-3 mr-1" />
                              Cadastrar Qualidade
                            </button>
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full animate-pulse">
                              Ativo
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                          <div className="text-center">
                            <div className="text-lg font-bold text-blue-600">{tank.ph}</div>
                            <div className="text-xs text-gray-500">pH</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-red-600">{tank.temperature}°C</div>
                            <div className="text-xs text-gray-500">Temp</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-600">{tank.oxygenation}</div>
                            <div className="text-xs text-gray-500">O2 mg/L</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-yellow-600">{tank.nitrite}</div>
                            <div className="text-xs text-gray-500">NO₂</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-purple-600">{tank.ammonia}</div>
                            <div className="text-xs text-gray-500">NH₃</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-cyan-600">{tank.salinity}</div>
                            <div className="text-xs text-gray-500">Sal ppt</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-3 pt-3 border-t border-gray-100">
                          <div className="text-center">
                            <div className="text-sm font-bold text-indigo-600">{tank.nitrate}</div>
                            <div className="text-xs text-gray-500">NO₃</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-bold text-pink-600">{tank.alkalinity}</div>
                            <div className="text-xs text-gray-500">Alcal mg/L</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-bold text-orange-600">{tank.turbidity}</div>
                            <div className="text-xs text-gray-500">Turb NTU</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-bold text-teal-600">{tank.orp}</div>
                            <div className="text-xs text-gray-500">ORP mV</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-bold text-lime-600">{tank.co2}</div>
                            <div className="text-xs text-gray-500">CO₂ mg/L</div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Biological Data Section */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Dados Biológicos dos Camarões</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{biologicalData.averageWeight}g</div>
                    <div className="text-sm text-gray-500">Peso Médio</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{biologicalData.survival}%</div>
                    <div className="text-sm text-gray-500">Sobrevivência</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{biologicalData.fcr}</div>
                    <div className="text-sm text-gray-500">FCR</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{biologicalData.stockingDensity}</div>
                    <div className="text-sm text-gray-500">Densidade/m²</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{biologicalData.healthStatus}</div>
                    <div className="text-sm text-gray-500">Sanidade</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Operational Data Section */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Dados Operacionais</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Tipo de Ração:</span>
                      <span className="text-sm font-medium text-gray-900">{operationalData.feedType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Quantidade:</span>
                      <span className="text-sm font-medium text-gray-900">{operationalData.feedQuantity} kg/dia</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Aeração:</span>
                      <span className="text-sm font-medium text-gray-900">{operationalData.aerationHours} horas/dia</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Equipamentos:</span>
                      <span className="text-sm font-medium text-green-600">{operationalData.equipmentStatus}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Troca de Água:</span>
                      <span className="text-sm font-medium text-gray-900">{operationalData.waterExchange}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Insumos:</span>
                      <span className="text-sm font-medium text-gray-900">{operationalData.inputs}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Production and Economic Data Section */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Dados de Produção e Econômicos</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Custo do Ciclo:</span>
                      <span className="text-sm font-medium text-red-600">{productionData.cycleCost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Rendimento:</span>
                      <span className="text-sm font-medium text-green-600">{productionData.yield} kg/m²</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Lucro Líquido:</span>
                      <span className="text-sm font-medium text-blue-600">{productionData.profit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Margem:</span>
                      <span className="text-sm font-medium text-purple-600">{productionData.margin}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Histórico:</span>
                      <span className="text-sm font-medium text-gray-900">{productionData.harvestHistory}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Technological Data Section */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Dados Tecnológicos (IoT)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Alertas:</span>
                      <span className="text-sm font-medium text-green-600">{technologicalData.sensorAlerts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Controle Remoto:</span>
                      <span className="text-sm font-medium text-blue-600">{technologicalData.remoteControl}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status IoT:</span>
                      <span className="text-sm font-medium text-green-600">{technologicalData.iotStatus}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Automação:</span>
                      <span className="text-sm font-medium text-purple-600">{technologicalData.automation}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {tankData.length === 0 && (
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <p className="text-gray-500">Nenhum dado cadastrado ainda. Vá para "Cadastrar Dados" para começar.</p>
              </div>
            )}
          </div>
    </Layout>

    {/* Water Control Modal */}
      {showWaterControlModal && selectedTank && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Controle da Água - {selectedTank.name || `Tanque ${activeTanks.indexOf(selectedTank) + 1}`}
                </h3>
                <button
                  onClick={() => setShowWaterControlModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Current Parameters */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Parâmetros Atuais</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{selectedTank.ph}</div>
                      <div className="text-sm text-gray-500">pH</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-red-600">{selectedTank.temperature}°C</div>
                      <div className="text-sm text-gray-500">Temperatura</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{selectedTank.oxygenation} mg/L</div>
                      <div className="text-sm text-gray-500">Oxigenação</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-yellow-600">{selectedTank.nitrite} mg/L</div>
                      <div className="text-sm text-gray-500">Nitrito</div>
                    </div>
                  </div>
                </div>

                {/* Water Exchange Controls */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Troca de Água</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Percentual de Troca (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="5"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ex: 20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Volume (L)</label>
                      <input
                        type="number"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ex: 1000"
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
                      Executar Troca de Água
                    </button>
                  </div>
                </div>

                {/* Chemical Adjustments */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Ajustes Químicos</h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cal (kg)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Ex: 5.0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Melaço (L)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Ex: 2.0"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Probiótico (g)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Ex: 10.0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Outros Insumos</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Ex: Cloro 1L"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors">
                      Aplicar Ajustes Químicos
                    </button>
                  </div>
                </div>

                {/* Equipment Control */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Controle de Equipamentos</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Aeradores</span>
                      <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors">
                        Ligar
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Bombas de Circulação</span>
                      <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors">
                        Ligar
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Sistema de Filtragem</span>
                      <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors">
                        Ligar
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Observações</h4>
                  <textarea
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Anotações sobre os ajustes realizados..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowWaterControlModal(false)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors">
                    Salvar Alterações
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Water Quality Registration Modal */}
      {showWaterQualityModal && selectedTank && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-2/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Cadastrar Qualidade da Água - {selectedTank.name || `Tanque ${activeTanks.indexOf(selectedTank) + 1}`}
                </h3>
                <button
                  onClick={() => setShowWaterQualityModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {waterQualityMessage && (
                <div className={`mb-4 p-4 rounded-lg ${waterQualityMessage.includes('sucesso') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {waterQualityMessage}
                </div>
              )}

              <form onSubmit={handleWaterQualitySubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">pH</label>
                    <input
                      type="number"
                      name="ph"
                      step="0.1"
                      min="0"
                      max="14"
                      required
                      value={waterQualityFormData.ph}
                      onChange={handleWaterQualityChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Temperatura (°C)</label>
                    <input
                      type="number"
                      name="temperature"
                      step="0.1"
                      min="0"
                      max="50"
                      required
                      value={waterQualityFormData.temperature}
                      onChange={handleWaterQualityChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Oxigenação (mg/L)</label>
                    <input
                      type="number"
                      name="oxygenation"
                      step="0.1"
                      min="0"
                      required
                      value={waterQualityFormData.oxygenation}
                      onChange={handleWaterQualityChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Salinidade (ppt)</label>
                    <input
                      type="number"
                      name="salinity"
                      step="0.1"
                      min="0"
                      value={waterQualityFormData.salinity}
                      onChange={handleWaterQualityChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amônia (mg/L)</label>
                    <input
                      type="number"
                      name="ammonia"
                      step="0.1"
                      min="0"
                      required
                      value={waterQualityFormData.ammonia}
                      onChange={handleWaterQualityChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nitrito (mg/L)</label>
                    <input
                      type="number"
                      name="nitrite"
                      step="0.1"
                      min="0"
                      required
                      value={waterQualityFormData.nitrite}
                      onChange={handleWaterQualityChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nitrato (mg/L)</label>
                    <input
                      type="number"
                      name="nitrate"
                      step="0.1"
                      min="0"
                      value={waterQualityFormData.nitrate}
                      onChange={handleWaterQualityChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alcalinidade (mg/L)</label>
                    <input
                      type="number"
                      name="alkalinity"
                      step="0.1"
                      min="0"
                      value={waterQualityFormData.alkalinity}
                      onChange={handleWaterQualityChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Turbidez (NTU)</label>
                    <input
                      type="number"
                      name="turbidity"
                      step="0.1"
                      min="0"
                      value={waterQualityFormData.turbidity}
                      onChange={handleWaterQualityChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ORP (mV)</label>
                    <input
                      type="number"
                      name="orp"
                      step="1"
                      value={waterQualityFormData.orp}
                      onChange={handleWaterQualityChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CO₂ (mg/L)</label>
                    <input
                      type="number"
                      name="co2"
                      step="0.1"
                      min="0"
                      value={waterQualityFormData.co2}
                      onChange={handleWaterQualityChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data da Vistoria</label>
                    <input
                      type="date"
                      name="inspectionDate"
                      required
                      value={waterQualityFormData.inspectionDate}
                      onChange={handleWaterQualityChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data da Alimentação</label>
                    <input
                      type="date"
                      name="feedingDate"
                      required
                      value={waterQualityFormData.feedingDate}
                      onChange={handleWaterQualityChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
                    <input
                      type="text"
                      name="responsible"
                      required
                      value={waterQualityFormData.responsible}
                      onChange={handleWaterQualityChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                  <textarea
                    name="notes"
                    rows="3"
                    value={waterQualityFormData.notes}
                    onChange={handleWaterQualityChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="Observações adicionais (opcional)"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowWaterQualityModal(false)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={waterQualityLoading}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {waterQualityLoading ? 'Salvando...' : 'Salvar Dados'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Full Water Quality Registration Modal */}
      {showFullWaterQualityModal && selectedTank && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-2/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Cadastrar Qualidade da Água Completa - {selectedTank.name || `Tanque ${activeTanks.indexOf(selectedTank) + 1}`}
                </h3>
                <button
                  onClick={() => setShowFullWaterQualityModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {fullWaterQualityMessage && (
                <div className={`mb-4 p-4 rounded-lg ${fullWaterQualityMessage.includes('sucesso') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {fullWaterQualityMessage}
                </div>
              )}

              <form onSubmit={handleFullWaterQualitySubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">pH</label>
                    <input
                      type="number"
                      name="ph"
                      step="0.1"
                      min="0"
                      max="14"
                      required
                      value={fullWaterQualityFormData.ph}
                      onChange={handleFullWaterQualityChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Temperatura (°C)</label>
                    <input
                      type="number"
                      name="temperature"
                      step="0.1"
                      min="0"
                      max="50"
                      required
                      value={fullWaterQualityFormData.temperature}
                      onChange={handleFullWaterQualityChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Oxigenação (mg/L)</label>
                    <input
                      type="number"
                      name="oxygenation"
                      step="0.1"
                      min="0"
                      required
                      value={fullWaterQualityFormData.oxygenation}
                      onChange={handleFullWaterQualityChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Salinidade (ppt)</label>
                    <input
                      type="number"
                      name="salinity"
                      step="0.1"
                      min="0"
                      value={fullWaterQualityFormData.salinity}
                      onChange={handleFullWaterQualityChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amônia (mg/L)</label>
                    <input
                      type="number"
                      name="ammonia"
                      step="0.1"
                      min="0"
                      required
                      value={fullWaterQualityFormData.ammonia}
                      onChange={handleFullWaterQualityChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nitrito (mg/L)</label>
                    <input
                      type="number"
                      name="nitrite"
                      step="0.1"
                      min="0"
                      required
                      value={fullWaterQualityFormData.nitrite}
                      onChange={handleFullWaterQualityChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nitrato (mg/L)</label>
                    <input
                      type="number"
                      name="nitrate"
                      step="0.1"
                      min="0"
                      value={fullWaterQualityFormData.nitrate}
                      onChange={handleFullWaterQualityChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alcalinidade (mg/L)</label>
                    <input
                      type="number"
                      name="alkalinity"
                      step="0.1"
                      min="0"
                      value={fullWaterQualityFormData.alkalinity}
                      onChange={handleFullWaterQualityChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Turbidez (NTU)</label>
                    <input
                      type="number"
                      name="turbidity"
                      step="0.1"
                      min="0"
                      value={fullWaterQualityFormData.turbidity}
                      onChange={handleFullWaterQualityChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ORP (mV)</label>
                    <input
                      type="number"
                      name="orp"
                      step="1"
                      value={fullWaterQualityFormData.orp}
                      onChange={handleFullWaterQualityChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CO₂ (mg/L)</label>
                    <input
                      type="number"
                      name="co2"
                      step="0.1"
                      min="0"
                      value={fullWaterQualityFormData.co2}
                      onChange={handleFullWaterQualityChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data da Vistoria</label>
                    <input
                      type="date"
                      name="inspectionDate"
                      required
                      value={fullWaterQualityFormData.inspectionDate}
                      onChange={handleFullWaterQualityChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data da Alimentação</label>
                    <input
                      type="date"
                      name="feedingDate"
                      required
                      value={fullWaterQualityFormData.feedingDate}
                      onChange={handleFullWaterQualityChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
                    <input
                      type="text"
                      name="responsible"
                      required
                      value={fullWaterQualityFormData.responsible}
                      onChange={handleFullWaterQualityChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                  <textarea
                    name="notes"
                    rows="3"
                    value={fullWaterQualityFormData.notes}
                    onChange={handleFullWaterQualityChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="Observações adicionais (opcional)"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowFullWaterQualityModal(false)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={fullWaterQualityLoading}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {fullWaterQualityLoading ? 'Salvando...' : 'Salvar Dados'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
  </>);
};

// Tank Data Form Component
const TankDataForm = ({ onDataAdded }) => {
  const [formData, setFormData] = useState({
    ph: '',
    temperature: '',
    oxygenation: '',
    nitrite: '',
    ammonia: '',
    inspectionDate: new Date().toISOString().split('T')[0],
    feedingDate: new Date().toISOString().split('T')[0],
    responsible: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/tank', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage('Dados cadastrados com sucesso!');
      setFormData({
        ph: '',
        temperature: '',
        oxygenation: '',
        nitrite: '',
        ammonia: '',
        inspectionDate: new Date().toISOString().split('T')[0],
        feedingDate: new Date().toISOString().split('T')[0],
        responsible: '',
        notes: ''
      });
      onDataAdded();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Erro ao cadastrar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-6">Cadastrar Dados do Tanque</h3>

      {message && (
        <div className={`mb-4 p-4 rounded-lg ${message.includes('sucesso') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">pH</label>
            <input
              type="number"
              name="ph"
              step="0.1"
              min="0"
              max="14"
              required
              value={formData.ph}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Temperatura (°C)</label>
            <input
              type="number"
              name="temperature"
              step="0.1"
              min="0"
              max="50"
              required
              value={formData.temperature}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Oxigenação (mg/L)</label>
            <input
              type="number"
              name="oxygenation"
              step="0.1"
              min="0"
              required
              value={formData.oxygenation}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nitrito (mg/L)</label>
            <input
              type="number"
              name="nitrite"
              step="0.1"
              min="0"
              required
              value={formData.nitrite}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amônia (mg/L)</label>
            <input
              type="number"
              name="ammonia"
              step="0.1"
              min="0"
              required
              value={formData.ammonia}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
            <input
              type="text"
              name="responsible"
              required
              value={formData.responsible}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data da Vistoria</label>
            <input
              type="date"
              name="inspectionDate"
              required
              value={formData.inspectionDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data da Alimentação</label>
            <input
              type="date"
              name="feedingDate"
              required
              value={formData.feedingDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
          <textarea
            name="notes"
            rows="3"
            value={formData.notes}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            placeholder="Observações adicionais (opcional)"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Salvando...' : 'Salvar Dados'}
          </button>
        </div>
      </form>
    </div>
  );
};

// Tank Data History Component
const TankDataHistory = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchHistory();
  }, [page]);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/tank?page=${page}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setData(response.data.tankData);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Histórico de Dados</h3>

        {data.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhum dado cadastrado ainda.</p>
        ) : (
          <div className="space-y-4">
            {data.map((item) => (
              <div key={item._id} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">pH:</span>
                    <div className="font-semibold text-blue-600">{item.ph}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Temperatura:</span>
                    <div className="font-semibold text-red-600">{item.temperature}°C</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Oxigenação:</span>
                    <div className="font-semibold text-green-600">{item.oxygenation} mg/L</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Nitrito:</span>
                    <div className="font-semibold text-yellow-600">{item.nitrite} mg/L</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Amônia:</span>
                    <div className="font-semibold text-purple-600">{item.ammonia} mg/L</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Data:</span>
                    <div className="font-semibold">{formatDate(item.inspectionDate)}</div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Responsável:</span> {item.responsible}
                    </div>
                    <div>
                      <span className="text-gray-500">Alimentação:</span> {formatDate(item.feedingDate)}
                    </div>
                  </div>
                  {item.notes && (
                    <div className="mt-2 text-sm">
                      <span className="text-gray-500">Observações:</span> {item.notes}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 space-x-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="px-3 py-1">Página {page} de {totalPages}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próxima
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;