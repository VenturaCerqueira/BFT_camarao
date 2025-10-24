import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './shared/Sidebar';
import {
  BeakerIcon,
  FireIcon,
  CloudIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
  CubeIcon,
  ArrowRightOnRectangleIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const WaterQualityRegistration = () => {
  const [tanks, setTanks] = useState([]);
  const [selectedTank, setSelectedTank] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [tankDataList, setTankDataList] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [formData, setFormData] = useState({
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
  const navigate = useNavigate();

  useEffect(() => {
    fetchTanks();
  }, []);

  const fetchTankData = async () => {
    try {
      setDataLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/tank', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTankDataList(response.data.tankData);
    } catch (error) {
      console.error('Error fetching tank data:', error);
      setTankDataList([]);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    fetchTankData();
  }, []);

  const fetchTanks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/tanks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTanks(response.data.tanks.filter(tank => tank.status === 'Ativo'));
    } catch (error) {
      console.error('Error fetching tanks:', error);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');

      // Validate required fields
      if (!selectedTank) {
        setMessage('Selecione um tanque');
        return;
      }

      const dataToSend = {
        tankId: selectedTank,
        ...formData,
        ph: parseFloat(formData.ph) || 0,
        temperature: parseFloat(formData.temperature) || 0,
        oxygenation: parseFloat(formData.oxygenation) || 0,
        salinity: parseFloat(formData.salinity) || 0,
        ammonia: parseFloat(formData.ammonia) || 0,
        nitrite: parseFloat(formData.nitrite) || 0,
        nitrate: parseFloat(formData.nitrate) || 0,
        alkalinity: parseFloat(formData.alkalinity) || 0,
        turbidity: parseFloat(formData.turbidity) || 0,
        orp: parseFloat(formData.orp) || 0,
        co2: parseFloat(formData.co2) || 0,
        inspectionDate: new Date(formData.inspectionDate).toISOString(),
        feedingDate: new Date(formData.feedingDate).toISOString()
      };

      await axios.post('http://localhost:5000/api/tank', dataToSend, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage('Dados de qualidade da água cadastrados com sucesso!');

      // Reset form
      setFormData({
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
      setSelectedTank('');
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const getParameterStatus = (value, min, max, unit = '') => {
    if (!value) return { status: 'neutral', message: '' };
    const numValue = parseFloat(value);
    if (numValue < min || numValue > max) {
      return { status: 'warning', message: `Fora do ideal (${min}-${max}${unit})` };
    }
    return { status: 'good', message: 'Dentro do ideal' };
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <img src="/FAZENDA DE CAMARÕES.png" alt="Logo" className="h-8 w-8 rounded-full" />
                <span className="ml-2 text-xl font-semibold text-gray-900">Controle de Qualidade da Água</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate('/tank-registration')}
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Tanques
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Side Menu */}
      <div className="flex">
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <BeakerIcon className="h-8 w-8 text-blue-500 mr-3" />
                  <h1 className="text-2xl font-bold text-gray-900">Cadastro de Qualidade da Água</h1>
                </div>
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center"
                >
                  <BeakerIcon className="mr-2 h-5 w-5" />
                  Cadastrar Parâmetros
                </button>
              </div>
              <p className="text-gray-600">
                Registre os parâmetros de qualidade da água dos tanques. Monitore continuamente os valores para manter condições ideais para o cultivo.
              </p>
            </div>

            {/* List of Registered Water Quality Data */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-2 text-blue-500" />
                Lista de Cadastros de Qualidade da Água
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data da Vistoria
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        pH
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Temperatura (°C)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Oxigênio (mg/L)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Salinidade (ppt)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Responsável
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dataLoading ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                          Carregando dados...
                        </td>
                      </tr>
                    ) : tankDataList.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                          Nenhum dado encontrado.
                        </td>
                      </tr>
                    ) : (
                      tankDataList.map((data) => (
                        <tr key={data._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(data.inspectionDate).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {data.ph}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {data.temperature}°C
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {data.oxygenation} mg/L
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {data.salinity} ppt
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {data.responsible}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {/* Ações - placeholder for future edit/delete */}
                            -
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>


          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={() => setShowModal(false)}>
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="mt-3">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Cadastrar Parâmetros de Qualidade da Água
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Tank Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CubeIcon className="h-5 w-5 mr-2 text-blue-500" />
                  Selecionar Tanque
                </h3>
                <div className="max-w-md">
                  <select
                    value={selectedTank}
                    onChange={(e) => setSelectedTank(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecione um tanque...</option>
                    {tanks.map((tank) => (
                      <option key={tank._id} value={tank._id}>
                        {tank.name} - {tank.capacity}L
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Registration Form */}
              {selectedTank && (
                <>
                  {message && (
                    <div className={`mb-6 p-4 rounded-lg ${message.includes('sucesso') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                      <div className="flex items-center">
                        {message.includes('sucesso') ? (
                          <CheckIcon className="h-5 w-5 mr-2" />
                        ) : (
                          <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                        )}
                        {message}
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Critical Parameters - Continuous Monitoring */}
                    <div className="border border-green-200 bg-green-50 p-6 rounded-lg">
                      <h3 className="text-md font-semibold text-green-800 mb-4 flex items-center">
                        <ClockIcon className="h-5 w-5 mr-2" />
                        Parâmetros Críticos - Monitoramento Contínuo
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Temperatura (°C) *
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              name="temperature"
                              step="0.1"
                              min="0"
                              max="50"
                              required
                              value={formData.temperature}
                              onChange={handleChange}
                              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                                getParameterStatus(formData.temperature, 25, 32, '°C').status === 'warning'
                                  ? 'border-yellow-300 bg-yellow-50'
                                  : 'border-gray-300'
                              }`}
                              placeholder="28.5"
                            />
                            <FireIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-red-400" />
                          </div>
                          {formData.temperature && (
                            <p className={`text-xs mt-1 ${
                              getParameterStatus(formData.temperature, 25, 32, '°C').status === 'warning'
                                ? 'text-yellow-600'
                                : 'text-green-600'
                            }`}>
                              {getParameterStatus(formData.temperature, 25, 32, '°C').message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Oxigênio Dissolvido (mg/L) *
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              name="oxygenation"
                              step="0.1"
                              min="0"
                              required
                              value={formData.oxygenation}
                              onChange={handleChange}
                              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                                getParameterStatus(formData.oxygenation, 4, 8).status === 'warning'
                                  ? 'border-yellow-300 bg-yellow-50'
                                  : 'border-gray-300'
                              }`}
                              placeholder="6.5"
                            />
                            <CloudIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-400" />
                          </div>
                          {formData.oxygenation && (
                            <p className={`text-xs mt-1 ${
                              getParameterStatus(formData.oxygenation, 4, 8).status === 'warning'
                                ? 'text-yellow-600'
                                : 'text-green-600'
                            }`}>
                              {getParameterStatus(formData.oxygenation, 4, 8).message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            pH *
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              name="ph"
                              step="0.1"
                              min="0"
                              max="14"
                              required
                              value={formData.ph}
                              onChange={handleChange}
                              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                getParameterStatus(formData.ph, 7.5, 8.5).status === 'warning'
                                  ? 'border-yellow-300 bg-yellow-50'
                                  : 'border-gray-300'
                              }`}
                              placeholder="8.0"
                            />
                            <BeakerIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400" />
                          </div>
                          {formData.ph && (
                            <p className={`text-xs mt-1 ${
                              getParameterStatus(formData.ph, 7.5, 8.5).status === 'warning'
                                ? 'text-yellow-600'
                                : 'text-green-600'
                            }`}>
                              {getParameterStatus(formData.ph, 7.5, 8.5).message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Daily Parameters */}
                    <div className="border border-blue-200 bg-blue-50 p-6 rounded-lg">
                      <h3 className="text-md font-semibold text-blue-800 mb-4 flex items-center">
                        <ClockIcon className="h-5 w-5 mr-2" />
                        Parâmetros Diários
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Salinidade (ppt)
                          </label>
                          <input
                            type="number"
                            name="salinity"
                            step="0.1"
                            min="0"
                            value={formData.salinity}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                              getParameterStatus(formData.salinity, 15, 25, 'ppt').status === 'warning'
                                ? 'border-yellow-300 bg-yellow-50'
                                : 'border-gray-300'
                            }`}
                            placeholder="20.0"
                          />
                          {formData.salinity && (
                            <p className={`text-xs mt-1 ${
                              getParameterStatus(formData.salinity, 15, 25, 'ppt').status === 'warning'
                                ? 'text-yellow-600'
                                : 'text-green-600'
                            }`}>
                              {getParameterStatus(formData.salinity, 15, 25, 'ppt').message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Amônia (NH₃/NH₄⁺) (mg/L)
                          </label>
                          <input
                            type="number"
                            name="ammonia"
                            step="0.01"
                            min="0"
                            value={formData.ammonia}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                              getParameterStatus(formData.ammonia, 0, 0.5).status === 'warning'
                                ? 'border-yellow-300 bg-yellow-50'
                                : 'border-gray-300'
                            }`}
                            placeholder="0.1"
                          />
                          {formData.ammonia && (
                            <p className={`text-xs mt-1 ${
                              getParameterStatus(formData.ammonia, 0, 0.5).status === 'warning'
                                ? 'text-yellow-600'
                                : 'text-green-600'
                            }`}>
                              {getParameterStatus(formData.ammonia, 0, 0.5).message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nitrito (NO₂⁻) (mg/L)
                          </label>
                          <input
                            type="number"
                            name="nitrite"
                            step="0.01"
                            min="0"
                            value={formData.nitrite}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                              getParameterStatus(formData.nitrite, 0, 1).status === 'warning'
                                ? 'border-yellow-300 bg-yellow-50'
                                : 'border-gray-300'
                            }`}
                            placeholder="0.5"
                          />
                          {formData.nitrite && (
                            <p className={`text-xs mt-1 ${
                              getParameterStatus(formData.nitrite, 0, 1).status === 'warning'
                                ? 'text-yellow-600'
                                : 'text-green-600'
                            }`}>
                              {getParameterStatus(formData.nitrite, 0, 1).message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Turbidez (NTU)
                          </label>
                          <input
                            type="number"
                            name="turbidity"
                            step="0.1"
                            min="0"
                            value={formData.turbidity}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                              getParameterStatus(formData.turbidity, 0, 50).status === 'warning'
                                ? 'border-yellow-300 bg-yellow-50'
                                : 'border-gray-300'
                            }`}
                            placeholder="25.0"
                          />
                          {formData.turbidity && (
                            <p className={`text-xs mt-1 ${
                              getParameterStatus(formData.turbidity, 0, 50).status === 'warning'
                                ? 'text-yellow-600'
                                : 'text-green-600'
                            }`}>
                              {getParameterStatus(formData.turbidity, 0, 50).message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            ORP (Potencial de Redox) (mV)
                          </label>
                          <input
                            type="number"
                            name="orp"
                            step="1"
                            value={formData.orp}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                              getParameterStatus(formData.orp, 200, 400, 'mV').status === 'warning'
                                ? 'border-yellow-300 bg-yellow-50'
                                : 'border-gray-300'
                            }`}
                            placeholder="300"
                          />
                          {formData.orp && (
                            <p className={`text-xs mt-1 ${
                              getParameterStatus(formData.orp, 200, 400, 'mV').status === 'warning'
                                ? 'text-yellow-600'
                                : 'text-green-600'
                            }`}>
                              {getParameterStatus(formData.orp, 200, 400, 'mV').message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Weekly Parameters */}
                    <div className="border border-purple-200 bg-purple-50 p-6 rounded-lg">
                      <h3 className="text-md font-semibold text-purple-800 mb-4 flex items-center">
                        <ClockIcon className="h-5 w-5 mr-2" />
                        Parâmetros Semanais
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nitrato (NO₃⁻) (mg/L)
                          </label>
                          <input
                            type="number"
                            name="nitrate"
                            step="0.1"
                            min="0"
                            value={formData.nitrate}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                              getParameterStatus(formData.nitrate, 0, 100).status === 'warning'
                                ? 'border-yellow-300 bg-yellow-50'
                                : 'border-gray-300'
                            }`}
                            placeholder="50.0"
                          />
                          {formData.nitrate && (
                            <p className={`text-xs mt-1 ${
                              getParameterStatus(formData.nitrate, 0, 100).status === 'warning'
                                ? 'text-yellow-600'
                                : 'text-green-600'
                            }`}>
                              {getParameterStatus(formData.nitrate, 0, 100).message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Alcalinidade (mg/L CaCO₃)
                          </label>
                          <input
                            type="number"
                            name="alkalinity"
                            step="0.1"
                            min="0"
                            value={formData.alkalinity}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                              getParameterStatus(formData.alkalinity, 100, 200, 'mg/L').status === 'warning'
                                ? 'border-yellow-300 bg-yellow-50'
                                : 'border-gray-300'
                            }`}
                            placeholder="150.0"
                          />
                          {formData.alkalinity && (
                            <p className={`text-xs mt-1 ${
                              getParameterStatus(formData.alkalinity, 100, 200, 'mg/L').status === 'warning'
                                ? 'text-yellow-600'
                                : 'text-green-600'
                            }`}>
                              {getParameterStatus(formData.alkalinity, 100, 200, 'mg/L').message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Occasional Parameters */}
                    <div className="border border-gray-200 bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                        <ClockIcon className="h-5 w-5 mr-2" />
                        Parâmetros Ocasional
                      </h3>
                      <div className="max-w-md">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CO₂ Dissolvido (mg/L)
                        </label>
                        <input
                          type="number"
                          name="co2"
                          step="0.1"
                          min="0"
                          value={formData.co2}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent ${
                            getParameterStatus(formData.co2, 0, 20).status === 'warning'
                              ? 'border-yellow-300 bg-yellow-50'
                              : 'border-gray-300'
                          }`}
                          placeholder="5.0"
                        />
                        {formData.co2 && (
                          <p className={`text-xs mt-1 ${
                            getParameterStatus(formData.co2, 0, 20).status === 'warning'
                              ? 'text-yellow-600'
                              : 'text-green-600'
                          }`}>
                            {getParameterStatus(formData.co2, 0, 20).message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Inspection Details */}
                    <div className="border border-gray-200 p-6 rounded-lg">
                      <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                        <DocumentTextIcon className="h-5 w-5 mr-2 text-gray-500" />
                        Detalhes da Vistoria
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Data da Vistoria *
                          </label>
                          <div className="relative">
                            <input
                              type="date"
                              name="inspectionDate"
                              required
                              value={formData.inspectionDate}
                              onChange={handleChange}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                            <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Data da Alimentação *
                          </label>
                          <div className="relative">
                            <input
                              type="date"
                              name="feedingDate"
                              required
                              value={formData.feedingDate}
                              onChange={handleChange}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                            <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Responsável *
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              name="responsible"
                              required
                              value={formData.responsible}
                              onChange={handleChange}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="Nome do responsável"
                            />
                            <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                      </div>

                      <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Observações
                        </label>
                        <div className="relative">
                          <textarea
                            name="notes"
                            rows="3"
                            value={formData.notes}
                            onChange={handleChange}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                            placeholder="Observações adicionais sobre a qualidade da água..."
                          />
                          <DocumentTextIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-medium"
                      >
                        <ArrowRightOnRectangleIcon className="mr-2 h-5 w-5" />
                        {loading ? 'Salvando...' : 'Salvar Dados'}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WaterQualityRegistration;
